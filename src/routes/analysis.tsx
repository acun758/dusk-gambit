import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { PlayableBoard } from "@/components/PlayableBoard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMatch, listMyMatches } from "@/lib/game.functions";
import { explainMatch } from "@/lib/ai-review.functions";
import { evaluateDeep } from "@/lib/local-engine";
import { UiIcon } from "@/components/UiIcon";

const PHASE_ZH: Record<string, string> = { opening: "开局", middlegame: "中局", endgame: "残局" };

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "对局复盘与点评 · 血誓王权" },
      { name: "description", content: "逐手回放自己的天梯对局，查看引擎评分、失误标注与关键转折点讲解。" },
      { property: "og:title", content: "对局复盘与点评 · 血誓王权" },
      { property: "og:description", content: "逐手回放自己的天梯对局，查看引擎评分、失误标注与关键转折点讲解。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Analysis,
});

interface Step {
  ply: number;
  san: string;
  by: "w" | "b";
  fen: string;
  cp: number;
  /** 相对走子方的得失（厘兵） */
  swing: number;
  tag: "brilliant" | "good" | "inaccuracy" | "mistake" | "blunder";
}

const TAG_META: Record<Step["tag"], { zh: string; mark: string; tone: string }> = {
  brilliant: { zh: "妙着", mark: "!!", tone: "text-secondary" },
  good: { zh: "正着", mark: "", tone: "text-on-surface-variant" },
  inaccuracy: { zh: "不准确", mark: "?!", tone: "text-secondary-fixed" },
  mistake: { zh: "失误", mark: "?", tone: "text-primary" },
  blunder: { zh: "漏着", mark: "??", tone: "text-primary" },
};

function classify(swing: number): Step["tag"] {
  if (swing >= 120) return "brilliant";
  if (swing >= -40) return "good";
  if (swing >= -120) return "inaccuracy";
  if (swing >= -300) return "mistake";
  return "blunder";
}

function buildSteps(moves: { uci: string; san: string; by: string }[]): Step[] {
  const chess = new Chess();
  const steps: Step[] = [];
  let before = evaluateDeep(chess.fen(), 2);
  moves.forEach((m, i) => {
    try {
      const promotion = m.uci[4];
      chess.move({ from: m.uci.slice(0, 2), to: m.uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
    } catch {
      return;
    }
    const after = evaluateDeep(chess.fen(), 2);
    const by = (m.by === "b" ? "b" : "w") as "w" | "b";
    const swing = by === "w" ? after - before : before - after;
    steps.push({ ply: i + 1, san: m.san, by, fen: chess.fen(), cp: after, swing: Math.round(swing), tag: classify(swing) });
    before = after;
  });
  return steps;
}

function cpText(cp: number) {
  const v = cp / 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
}

function matchResult(match: { outcome: string | null; you: string }) {
  if (!match.outcome) return "进行中";
  if (match.outcome === "draw") return "和棋";
  return match.outcome === (match.you === "w" ? "white" : "black") ? "胜" : "负";
}

function Analysis() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  const listQ = useQuery({
    queryKey: ["my-matches"],
    queryFn: () => listMyMatches(),
    enabled: signedIn === true,
  });

  const matches = listQ.data ?? [];
  // 默认选中最近一局“有着法”的对局，空局（0 手）不会让复盘区看起来是空的
  const firstPlayed = matches.find((m) => (m.ply ?? 0) > 0) ?? matches[0];
  const activeId = matchId ?? firstPlayed?.id ?? null;
  const activeMatch = matches.find((match) => match.id === activeId) ?? firstPlayed;

  const detailQ = useQuery({
    queryKey: ["match-review", activeId],
    queryFn: () => {
      if (!activeId) throw new Error("尚未选择对局");
      return getMatch({ data: { matchId: activeId, lastSeq: 0 } });
    },
    enabled: !!activeId,
  });

  const steps = useMemo(() => {
    const moves = (detailQ.data?.moves ?? []) as { uci: string; san: string; by: string }[];
    return buildSteps(moves);
  }, [detailQ.data]);

  useEffect(() => setIndex(0), [activeId]);

  const current = steps[index - 1];
  const fen = current?.fen ?? new Chess().fen();
  const worst = useMemo(() => [...steps].sort((a, b) => a.swing - b.swing).slice(0, 3).filter((s) => s.swing < -40), [steps]);

  const narrative = useMutation({
    mutationFn: () =>
      explainMatch({
        data: {
          moves: steps.map((s) => ({ ply: s.ply, san: s.san, by: s.by, cp: s.cp, swing: s.swing })),
          you: (detailQ.data?.you ?? "w") as "w" | "b",
          outcome: activeMatch?.outcome ?? null,
        },
      }),
  });

  useEffect(() => narrative.reset(), [activeId]);


  return (
    <div className="themed-page min-h-screen text-on-surface pb-32 md:pb-space-lg">
      <ThemeBackdrop theme="fallen" />
      <SovereignPageHeader icon="nav-review" titleZh="对局复盘" titleEn="Match Review" />

      <main className="page-main-dashboard px-margin-mobile md:px-0">
        <div className="desktop-page-container w-full py-space-sm md:py-space-md grid gap-space-sm md:gap-space-md">
          <section aria-label="对局历史" className="review-history bg-surface-container-low gold-hairline">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-space-sm">
              <div className="min-w-0">
                <h2 className="cjk font-label-lg text-label-lg">对局历史</h2>
                {activeMatch ? (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">
                    对手 {activeMatch.opponent} · {matchResult(activeMatch)} · {activeMatch.ply} 手 · {new Date(activeMatch.playedAt).toLocaleDateString("zh-CN")}
                  </p>
                ) : (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">选择一局已完成或进行中的对局</p>
                )}
              </div>
              {signedIn === true && matches.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  aria-expanded={historyOpen}
                  aria-controls="match-history-list"
                  onClick={() => setHistoryOpen((open) => !open)}
                  className="h-11 rounded-none px-3 text-secondary shrink-0"
                >
                  <UiIcon name={historyOpen ? "eye" : "scroll"} className="h-5 w-5" />
                  <span className="cjk">{historyOpen ? "收起" : "选择对局"}</span>
                </Button>
              )}
            </div>
            {signedIn === false && (
              <div className="grid gap-2 px-space-sm pb-space-sm">
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">登录后这里会列出你的每一局天梯对局，可逐手回放并查看点评。</p>
                <Link to="/auth" className="h-11 flex items-center justify-center bg-secondary text-on-secondary cjk font-label-md text-label-md">去登录</Link>
              </div>
            )}
            {signedIn === true && listQ.isLoading && <p className="cjk px-space-sm pb-space-sm font-body-sm text-body-sm text-on-surface-variant">正在读取…</p>}
            {signedIn === true && !listQ.isLoading && matches.length === 0 && (
              <div className="grid gap-2 px-space-sm pb-space-sm">
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">还没有对局记录，先完成一局 AI 陪练或真人对弈。</p>
                <Link to="/battle" className="flex h-11 items-center justify-center bg-primary-container text-on-primary-container cjk font-label-md text-label-md">开始对弈</Link>
              </div>
            )}
            <div
              id="match-history-list"
              hidden={!historyOpen}
              className="review-history-list grid gap-1 max-h-[min(42vh,430px)] overflow-y-auto overscroll-contain border-t border-outline-variant/30 p-2"
            >
              {matches.map((m) => {
                const active = m.id === activeId;
                const result = matchResult(m);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMatchId(m.id);
                      setHistoryOpen(false);
                    }}
                    className={`min-h-14 px-2 py-2 text-left transition-colors ${active ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant hover:text-secondary"}`}
                  >
                    <span className="cjk block font-label-md text-label-md truncate">对手 {m.opponent}</span>
                    <span className="cjk block font-label-sm text-label-sm">
                      {result} · {m.ply} 手 · {new Date(m.playedAt).toLocaleDateString("zh-CN")}
                      {m.ratingDelta !== null ? ` · ${m.ratingDelta >= 0 ? "+" : ""}${m.ratingDelta} ELO` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-label="逐手复盘" className="review-layout grid gap-space-sm min-w-0 xl:grid-cols-[minmax(0,640px)_minmax(320px,1fr)] xl:items-start">
            <div className="review-playback grid gap-space-sm min-w-0">
              <div className="review-board flex justify-center">
                <PlayableBoard fen={fen} lastMove={undefined} disabled onMove={() => {}} />
              </div>

              <div className="review-controls bg-surface-container-low p-space-sm gold-hairline grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="cjk font-label-md text-label-md">
                  {current ? `第 ${current.ply} 手 ${current.san}` : "起始局面"}
                </span>
                <span className="font-label-md text-label-md tabular-nums text-secondary">{cpText(current?.cp ?? 0)}</span>
              </div>
              {current && (
                <p className={`cjk font-body-sm text-body-sm ${TAG_META[current.tag].tone}`}>
                  {TAG_META[current.tag].zh} {TAG_META[current.tag].mark} · 这一手让{current.by === "w" ? "白方" : "黑方"}
                  {current.swing >= 0 ? `多得 ${(current.swing / 100).toFixed(2)} 兵的优势` : `损失 ${(Math.abs(current.swing) / 100).toFixed(2)} 兵的优势`}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button onClick={() => setIndex(0)} disabled={index === 0} className="h-12 rounded-none bg-surface-container text-on-surface"><UiIcon name="spinner" className="h-5 w-5" />起始</Button>
                <Button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="h-12 rounded-none bg-surface-container text-on-surface"><UiIcon name="play-motion" className="h-5 w-5 rotate-180" />上一手</Button>
                <Button onClick={() => setIndex((i) => Math.min(steps.length, i + 1))} disabled={index >= steps.length} className="h-12 rounded-none bg-secondary text-on-secondary"><UiIcon name="play-motion" className="h-5 w-5" />下一手</Button>
                <Button onClick={() => setIndex(steps.length)} disabled={index >= steps.length} className="h-12 rounded-none bg-surface-container text-on-surface"><UiIcon name="seal" className="h-5 w-5" />终局</Button>
              </div>
              </div>
            </div>

            <div className="review-insights grid gap-space-sm md:grid-cols-2 xl:grid-cols-1">
              <div className="bg-surface-container-low p-space-sm gold-hairline">
                <h3 className="cjk font-label-lg text-label-lg mb-2">棋谱</h3>
                <div className="max-h-[36vh] overflow-y-auto overscroll-contain grid gap-1">
                  {steps.length === 0 && (
                    <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                      {activeMatch ? "这局没有着法记录，换一局或先去对弈一局。" : "选择一局对局后显示棋谱。"}
                    </p>
                  )}
                  {steps.map((s) => (
                    <button
                      key={s.ply}
                      onClick={() => setIndex(s.ply)}
                      className={`min-h-11 px-2 flex items-center justify-between gap-2 ${index === s.ply ? "bg-primary-container text-on-primary-container" : "bg-surface-container"}`}
                    >
                      <span className="font-label-md text-label-md tabular-nums">{s.ply}. {s.san}{TAG_META[s.tag].mark}</span>
                      <span className={`font-label-sm text-label-sm tabular-nums ${TAG_META[s.tag].tone}`}>{cpText(s.cp)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-space-sm gold-hairline">
                <h3 className="cjk font-label-lg text-label-lg mb-2">关键转折</h3>
                {worst.length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">本局没有明显失误，继续保持。</p>}
                <div className="grid gap-2">
                  {worst.map((s) => (
                    <button key={s.ply} onClick={() => setIndex(s.ply)} className="bg-surface-container px-2 py-2 text-left min-h-14">
                      <span className="cjk block font-label-md text-label-md">
                        第 {s.ply} 手 {s.san} · {TAG_META[s.tag].zh}
                      </span>
                      <span className="cjk block font-body-sm text-body-sm text-on-surface-variant">
                        {s.by === "w" ? "白方" : "黑方"}在此丢掉约 {(Math.abs(s.swing) / 100).toFixed(1)} 兵，点这里回到该局面重新推演。
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-space-sm gold-hairline grid gap-2 md:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="cjk font-label-lg text-label-lg">AI 分段讲解</h3>
                  <Button
                    type="button"
                    onClick={() => narrative.mutate()}
                    disabled={steps.length === 0 || narrative.isPending}
                    className="h-11 rounded-none bg-secondary text-on-secondary cjk shrink-0"
                  >
                    {narrative.isPending ? "生成中…" : narrative.data ? "重新生成" : "生成讲解"}
                  </Button>
                </div>
                {steps.length === 0 && (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">这局还没有着法，下一局结束后即可生成开局、中局、残局讲解。</p>
                )}
                {narrative.isError && (
                  <p className="cjk font-body-sm text-body-sm text-primary">{(narrative.error as Error).message}</p>
                )}
                {narrative.data && (
                  <div className="grid gap-2">
                    <p className="cjk font-label-md text-label-md text-secondary">{narrative.data.headline}</p>
                    {narrative.data.segments.map((seg, i) => (
                      <article key={`${seg.phase}-${i}`} className="bg-surface-container p-space-sm grid gap-1">
                        <h4 className="cjk font-label-md text-label-md">
                          {PHASE_ZH[seg.phase] ?? seg.phase} · {seg.title}
                        </h4>
                        <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{seg.summary}</p>
                        {seg.keyMoves.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {seg.keyMoves.map((km) => {
                              const ply = Number(km.match(/\d+/)?.[0] ?? 0);
                              return (
                                <button
                                  key={km}
                                  onClick={() => ply > 0 && setIndex(Math.min(steps.length, ply))}
                                  className="cjk min-h-9 px-2 bg-surface-container-high text-secondary font-label-sm text-label-sm"
                                >
                                  {km}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className="cjk font-body-sm text-body-sm text-secondary-fixed">建议：{seg.advice}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {steps.length > 0 && (
                <Link to="/archive" className="min-h-12 bg-surface-container-high px-space-md flex items-center justify-between gap-space-sm text-secondary md:col-span-2 xl:col-span-1">
                  <span className="cjk font-label-md text-label-md">将本局制作成绝杀典藏</span>
                  <UiIcon name="cards" className="h-7 w-7" />
                </Link>
              )}

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
