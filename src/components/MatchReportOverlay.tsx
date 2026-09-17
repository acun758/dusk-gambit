import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { UiIcon } from "@/components/UiIcon";
import { reviewGame } from "@/core/review";
import { analyzeMind, isSignedIn, recordMatchReport } from "@/lib/db";
import type { MindReport, ReportComparison } from "@/lib/mind.functions";

/**
 * 心智战报浮窗：对局结束后自动弹出。
 * 逐手评估在端内 Worker 里跑，四维评分与段位对比一律由服务端给出，本组件只负责显示。
 */

export interface MatchReportInput {
  uciLine: string[];
  you: "w" | "b";
  outcome: string | null;
  matchId: string | null;
  ranked: boolean;
}

const OUTCOME_ZH: Record<string, string> = { white: "白方胜", black: "黑方胜", draw: "和棋" };

function Delta({ label, value, base }: { label: string; value: number; base: number | null }) {
  const diff = base === null ? null : Math.round((value - base) * 10) / 10;
  return (
    <div className="flex flex-col gap-0.5 bg-surface-container px-2 py-2 rounded-xl min-w-0">
      <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{label}</span>
      <span className="font-label-md text-label-md text-on-surface tabular-nums">
        {base === null ? "—" : base.toFixed(1)}
        {diff !== null && (
          <span className={diff >= 0 ? "text-secondary ml-1" : "text-primary ml-1"}>
            {diff >= 0 ? "+" : ""}
            {diff.toFixed(1)}
          </span>
        )}
      </span>
    </div>
  );
}

export function MatchReportOverlay({
  input,
  onClose,
  onRematch,
  onJumpToPly,
}: {
  input: MatchReportInput;
  onClose: () => void;
  onRematch?: () => void;
  onJumpToPly?: (ply: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<MindReport | null>(null);
  const [comparison, setComparison] = useState<ReportComparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const signal = { aborted: false };
    setProgress(0);
    setReport(null);
    setComparison(null);
    setError(null);

    void (async () => {
      try {
        const summary = await reviewGame(input.uciLine, {
          signal,
          onProgress: (done, total) => {
            if (!signal.aborted) setProgress(Math.round((done / total) * 100));
          },
        });
        if (signal.aborted) return;
        const moves = summary.moves.map((m) => ({
          ply: m.ply,
          by: m.by,
          san: m.san,
          cp: m.cp,
          loss: m.loss,
        }));
        const payload = { moves, you: input.you, outcome: input.outcome };
        if (await isSignedIn()) {
          const res = await recordMatchReport({
            data: { ...payload, matchId: input.matchId, ranked: input.ranked },
          });
          if (signal.aborted) return;
          setReport(res.report);
          setComparison(res.comparison);
        } else {
          const res = await analyzeMind({ data: payload });
          if (signal.aborted) return;
          setReport(res);
        }
      } catch (e) {
        if (!signal.aborted) setError(e instanceof Error ? e.message : "战报生成失败");
      }
    })();

    return () => {
      signal.aborted = true;
    };
  }, [input]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-space-sm">
      <div className="home-glass-panel w-full max-w-lg max-h-[86vh] overflow-y-auto overscroll-contain rounded-2xl p-space-md flex flex-col gap-space-sm">
        <div className="flex items-start justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <span className="cjk font-title-md text-title-md text-on-surface">心智战报 · Match Report</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              {input.outcome ? (OUTCOME_ZH[input.outcome] ?? input.outcome) : "本局结束"} ·{" "}
              {input.ranked ? "天梯对局" : "陪练对局 · 不计分"}
            </span>
          </div>
          <button onClick={onClose} aria-label="关闭战报" className="shrink-0 h-9 w-9 flex items-center justify-center">
            <UiIcon name="eye" className="h-5 w-5 opacity-80" />
          </button>
        </div>

        {!report && !error && (
          <div className="flex flex-col gap-2 py-6">
            <span className="cjk font-body-sm text-body-sm text-on-surface-variant">正在逐手复盘 {progress}%</span>
            <div className="h-1.5 w-full bg-surface-container-high overflow-hidden rounded-full">
              <div className="h-full bg-secondary-fixed transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && <p className="cjk font-body-sm text-body-sm text-primary py-4">{error}</p>}

        {report && (
          <>
            <div className="grid grid-cols-3 gap-space-xs">
              <div className="flex flex-col gap-0.5 bg-primary-container/40 px-2 py-2 rounded-xl">
                <span className="font-label-sm text-label-sm text-on-surface-variant">本局准确率</span>
                <span className="font-headline-sm text-headline-sm text-secondary tabular-nums">
                  {report.accuracy.toFixed(1)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 bg-surface-container px-2 py-2 rounded-xl">
                <span className="font-label-sm text-label-sm text-on-surface-variant">平均失分</span>
                <span className="font-label-md text-label-md text-on-surface tabular-nums">
                  {(report.acpl / 100).toFixed(2)} 子
                </span>
              </div>
              <div className="flex flex-col gap-0.5 bg-surface-container px-2 py-2 rounded-xl">
                <span className="font-label-sm text-label-sm text-on-surface-variant">本方着法</span>
                <span className="font-label-md text-label-md text-on-surface tabular-nums">{report.moveCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-space-xs">
              <Delta label="上一局" value={report.accuracy} base={comparison?.previousAccuracy ?? null} />
              <Delta label="个人最好" value={report.accuracy} base={comparison?.personalBest ?? null} />
              <Delta
                label={comparison ? `${comparison.rankZh}段平均` : "段位平均"}
                value={report.accuracy}
                base={comparison?.rankAverage ?? null}
              />
            </div>

            <div className="flex flex-col gap-space-xs">
              <span className="cjk font-label-md text-label-md text-on-surface">心智四维</span>
              {report.facets.map((f) => (
                <div key={f.key} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="cjk font-label-md text-label-md text-on-surface">
                      {f.zh} <span className="text-on-surface-variant">{f.en}</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary tabular-nums">{f.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high overflow-hidden rounded-full">
                    <div className="h-full bg-secondary-fixed transition-[width]" style={{ width: `${f.value}%` }} />
                  </div>
                  <span className="cjk font-body-sm text-body-sm text-on-surface-variant">{f.note}</span>
                </div>
              ))}
            </div>

            {report.worst.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="cjk font-label-md text-label-md text-on-surface">本局最大失分</span>
                {report.worst.map((w) => (
                  <button
                    key={w.ply}
                    onClick={() => onJumpToPly?.(w.ply)}
                    className="flex items-center gap-space-sm bg-surface-container px-2 py-2 min-h-11 rounded-xl text-left"
                  >
                    <span className="font-label-sm text-label-sm text-on-surface-variant w-8 shrink-0 tabular-nums">
                      #{w.ply}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface shrink-0">{w.san}</span>
                    <span className="cjk font-body-sm text-body-sm text-on-surface-variant truncate flex-1">
                      少算 {(w.loss / 100).toFixed(2)} 子
                    </span>
                    <UiIcon name="equalizer" className="h-4 w-4 opacity-70 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
              以上只描述本局的下棋行为，不构成任何心理评估，也不影响积分与段位。
            </p>
          </>
        )}

        <div className="grid grid-cols-2 gap-space-xs pt-1">
          <Button
            onClick={() => {
              onClose();
              onRematch?.();
            }}
            className="h-11 rounded-xl font-label-md text-label-md"
          >
            再来一局
          </Button>
          <Button asChild variant="ghost" className="home-glass-control h-11 rounded-xl bg-surface-container-high">
            <Link to="/analysis" className="font-label-md text-label-md">
              看完整复盘
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
