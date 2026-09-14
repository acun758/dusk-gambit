import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Chess } from "chess.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlayableBoard } from "@/components/PlayableBoard";
import { UiIcon } from "@/components/UiIcon";
import { Button } from "@/components/ui/button";
import { listEndgameLevels, submitEndgameDrill } from "@/lib/game.functions";
import { aiLevel } from "@/lib/local-engine";
import { chooseMove, evaluateDeep } from "@/lib/local-engine";
import { useT } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export interface DrillLevel {
  id: number;
  code: string;
  name_zh: string;
  name_en: string;
  brief_zh: string;
  brief_en: string;
  fen: string;
  objective_zh: string;
  objective_en: string;
  moves_to_mate: number;
  depth: number;
  theme_zh: string;
  theme_en: string;
  hint_zh: string;
  hint_en: string;
  explanation_zh?: string;
  explanation_en?: string;
}

type Status = "playing" | "solved" | "failed";

/** 玩家每一步的评分记录：实际走法、引擎最佳走法与得失。 */
interface ReviewStep {
  no: number;
  san: string;
  bestSan: string;
  swing: number;
  tag: "best" | "good" | "inaccuracy" | "mistake" | "blunder";
}

function tagFor(swing: number, matched: boolean): ReviewStep["tag"] {
  if (matched || swing >= -20) return "best";
  if (swing >= -60) return "good";
  if (swing >= -150) return "inaccuracy";
  if (swing >= -350) return "mistake";
  return "blunder";
}

const TAG_TEXT: Record<ReviewStep["tag"], { zh: string; en: string; tone: string }> = {
  best: { zh: "最佳", en: "Best", tone: "text-secondary" },
  good: { zh: "不错", en: "Good", tone: "text-on-surface-variant" },
  inaccuracy: { zh: "不准确", en: "Inaccuracy", tone: "text-secondary-fixed" },
  mistake: { zh: "失误", en: "Mistake", tone: "text-primary" },
  blunder: { zh: "漏着", en: "Blunder", tone: "text-primary" },
};

/**
 * 对弈页的残局试炼模式：从残局卡片开局，玩家执先手方，
 * 引擎以深度 4~6 顽强防守，将死即通关，随后进入讲解与复盘。
 */
export function EndgameDrill({ initialCode }: { initialCode?: string | undefined }) {
  const t = useT();
  const queryClient = useQueryClient();
  const levelsQ = useQuery({
    queryKey: ["endgame-levels"],
    queryFn: () => listEndgameLevels() as Promise<DrillLevel[]>,
  });
  const levels = useMemo(() => levelsQ.data ?? [], [levelsQ.data]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [fen, setFen] = useState<string>("8/8/8/8/8/8/8/8 w - - 0 1");
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Status>("playing");
  const [thinking, setThinking] = useState(false);
  const [review, setReview] = useState<ReviewStep[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [saveNote, setSaveNote] = useState("");

  const active = levels.find((l) => l.id === activeId) ?? null;
  const mySide = useMemo(() => (active ? (active.fen.split(" ")[1] === "b" ? "b" : "w") : "w"), [active]);

  const load = useCallback((level: DrillLevel) => {
    setActiveId(level.id);
    setFen(level.fen);
    setHistory([]);
    setLastMove(undefined);
    setStatus("playing");
    setThinking(false);
    setReview([]);
    setMoves([]);
    setStartedAt(Date.now());
    setSaveNote("");
  }, []);

  useEffect(() => {
    if (activeId !== null || !levels.length) return;
    const byCode = initialCode ? levels.find((l) => l.code === initialCode) : undefined;
    load(byCode ?? levels[0]!);
  }, [levels, activeId, initialCode, load]);

  const settle = useCallback((board: Chess, side: "w" | "b", line: string[]) => {
    if (board.isCheckmate()) {
      const solved = board.turn() !== side;
      setStatus(solved ? "solved" : "failed");
      if (solved && active) {
        const score = Math.max(0, Math.round(100 - review.reduce((sum, step) => sum + Math.max(0, -step.swing) / 12, 0)));
        void supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            setSaveNote(t("登录后可保存评分并解锁下一难度。", "Sign in to save the score and unlock the next tier."));
            return;
          }
          void submitEndgameDrill({ data: { levelId: active.id, moves: line, ms: Date.now() - startedAt, score, review } })
            .then(() => {
              setSaveNote(t(`评分 ${score} 已保存，难度解锁进度已更新。`, `Score ${score} saved; tier progress updated.`));
              void queryClient.invalidateQueries({ queryKey: ["endgame-progress"] });
            })
            .catch(() => setSaveNote(t("通关已完成，但云端保存失败，请重试。", "Cleared, but cloud save failed. Please retry.")));
        });
      }
      return true;
    }
    if (board.isDraw() || board.isStalemate()) {
      setStatus("failed");
      return true;
    }
    return false;
  }, [active, queryClient, review, startedAt, t]);

  const onMove = useCallback(
    (uci: string) => {
      if (!active || status !== "playing" || thinking) return;
      // 落子前先记下引擎的最佳走法与局面评分，用于结束后的逐步点评
      const best = chooseMove(fen, aiLevel("master"));
      const before = evaluateDeep(fen, 2);
      const board = new Chess(fen);
      const promotion = uci[4];
      try {
        board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
      } catch {
        return;
      }
      const san = board.history().at(-1) ?? uci;
      const sign = mySide === "w" ? 1 : -1;
      const swing = Math.round(sign * (evaluateDeep(board.fen(), 2) - before));
      setReview((r) => [
        ...r,
        {
          no: r.length + 1,
          san,
          bestSan: best?.san ?? san,
          swing,
          tag: tagFor(swing, !!best && best.uci === uci),
        },
      ]);
      setFen(board.fen());
      setHistory((h) => [...h, san]);
      setLastMove(uci);
      const playerLine = [...moves, uci];
      setMoves(playerLine);
      if (settle(board, mySide, playerLine)) return;

      setThinking(true);
      window.setTimeout(() => {
        const reply = chooseMove(board.fen(), aiLevel("master"));
        if (!reply) {
          setThinking(false);
          settle(board, mySide, playerLine);
          return;
        }
        board.move(reply.san);
        setFen(board.fen());
        setHistory((h) => [...h, reply.san]);
        setLastMove(reply.uci);
        const fullLine = [...playerLine, reply.uci];
        setMoves(fullLine);
        setThinking(false);
        settle(board, mySide, fullLine);
      }, 260);
    },
    [active, fen, moves, mySide, status, thinking, settle],
  );

  const myMoves = Math.ceil(history.length / 2);

  return (
    <section className="battle-core-width grid gap-space-sm" aria-label={t("残局试炼模式", "Endgame drill mode")}>
      <div className="flex gap-1 overflow-x-auto">
        {levels.map((l) => (
          <Button
            key={l.id}
            type="button"
            variant="ghost"
            onClick={() => load(l)}
            className={`h-11 shrink-0 rounded-none px-3 font-label-sm text-label-sm ${
              l.id === activeId ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
            }`}
          >
            <span className="cjk">{t(l.name_zh, l.name_en)}</span>
          </Button>
        ))}
      </div>

      {active && (
        <>
          <div className="bg-surface-container-low p-space-sm gold-hairline">
            <p className="cjk font-label-sm text-label-sm text-primary">{t(active.objective_zh, active.objective_en)}</p>
            <h2 className="cjk font-headline-sm text-headline-sm">{t(active.name_zh, active.name_en)}</h2>
            <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {t(active.brief_zh, active.brief_en)}
            </p>
            <p className="cjk mt-1 font-body-sm text-body-sm text-secondary">
              {t(`目标 ${active.moves_to_mate} 步内将死 · 计算深度 ${active.depth}`, `Mate in ${active.moves_to_mate} · depth ${active.depth}`)}
            </p>
          </div>

          <PlayableBoard fen={fen} lastMove={lastMove} disabled={status !== "playing" || thinking} onMove={onMove} />

          <div className="bg-surface-container p-space-sm flex items-center justify-between gap-space-sm gold-hairline">
            <p className="cjk font-label-md text-label-md">
              {status === "solved"
                ? t("将死成功，试炼通关。", "Checkmate — trial cleared.")
                : status === "failed"
                  ? t("本次未能将死，重开再算一次。", "No mate this time. Reset and recalculate.")
                  : thinking
                    ? t("对方正在防守…", "Defence is calculating…")
                    : t("轮到你落子", "Your move")}
            </p>
            <span className="font-label-sm text-label-sm tabular-nums text-on-surface-variant shrink-0">
              {t(`已走 ${myMoves} 步`, `${myMoves} moves`)}
            </span>
          </div>

          {history.length > 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant break-words">{history.join(" ")}</p>
          )}

          {status !== "playing" && (
            <div className="bg-surface-container-low p-space-md grid gap-2 gold-hairline">
              {status === "solved" && (active.explanation_zh || active.hint_zh) && (
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t(active.explanation_zh || active.hint_zh, active.explanation_en || active.hint_en)}
                </p>
              )}

              {review.length > 0 && (
                <div className="grid gap-1">
                  <h3 className="cjk font-label-lg text-label-lg">{t("逐步点评", "Move-by-move review")}</h3>
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                    {t("对比你的每一手与引擎最佳走法，负分表示这一手丢掉的优势（单位：兵）。", "Your move versus the engine's best; a negative score is the advantage lost, in pawns.")}
                  </p>
                  <div className="grid gap-1 max-h-[32vh] overflow-y-auto overscroll-contain">
                    {review.map((s) => (
                      <div key={s.no} className="bg-surface-container px-2 py-2 flex items-center justify-between gap-2 min-h-11">
                        <span className="font-label-md text-label-md tabular-nums">
                          {s.no}. {s.san}
                          {s.bestSan !== s.san && (
                            <span className="cjk ml-2 font-label-sm text-label-sm text-on-surface-variant">
                              {t(`最佳 ${s.bestSan}`, `best ${s.bestSan}`)}
                            </span>
                          )}
                        </span>
                        <span className={`cjk font-label-sm text-label-sm tabular-nums shrink-0 ${TAG_TEXT[s.tag].tone}`}>
                          {t(TAG_TEXT[s.tag].zh, TAG_TEXT[s.tag].en)} {(s.swing / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {saveNote && <p role="status" className="cjk font-body-sm text-body-sm text-secondary">{saveNote}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => load(active)} className="h-11 rounded-none bg-surface-container text-on-surface">
                  <UiIcon name="spinner" className="h-5 w-5" />
                  <span className="cjk">{t("重新挑战", "Retry")}</span>
                </Button>
                <Link
                  to="/analysis"
                  className="cjk flex h-11 items-center gap-2 bg-primary-container px-3 text-on-primary-container font-label-sm text-label-sm"
                >
                  <UiIcon name="quill" className="h-5 w-5" />
                  {t("进入复盘讲解", "Open review")}
                </Link>
                <Link
                  to="/crucible"
                  className="cjk flex h-11 items-center px-3 text-secondary font-label-sm text-label-sm"
                >
                  {t("盲视心算版 →", "Blindfold version →")}
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
