import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import { PlayableBoard } from "@/components/PlayableBoard";
import { Button } from "@/components/ui/button";
import { fetchMatch as getMatch, fetchMyMatches as listMyMatches, fetchSession } from "@/data/db";
import { explainMatch } from "@/data/ai-review.functions";
import { reviewGame, type ReviewTag } from "@/core/review";
import { UiIcon } from "@/components/UiIcon";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useLang, useT } from "@/lib/i18n";

const PHASE_LABEL: Record<string, { zh: string; en: string }> = {
  opening: { zh: "开局", en: "Opening" },
  middlegame: { zh: "中局", en: "Middlegame" },
  endgame: { zh: "残局", en: "Endgame" },
};

interface AnalysisSearch {
  match?: string;
  local?: boolean;
  ply?: number;
}

interface LastGame {
  uciLine: string[];
  you: "w" | "b";
  outcome: string | null;
  matchId: string | null;
  ranked: boolean;
}

export const Route = createFileRoute("/analysis")({
  staticData: { sitemap: false },
  // match=刚结束的天梯局；local=刚结束的陪练局（棋谱存在会话里）；ply=直接停在第几手
  validateSearch: (search: Record<string, unknown>): AnalysisSearch => {
    const out: AnalysisSearch = {};
    const m = search["match"];
    const l = search["local"];
    const p = Number(search["ply"]);
    if (typeof m === "string" && m) out.match = m;
    if (l === true || l === "true") out.local = true;
    if (Number.isFinite(p) && p > 0) out.ply = Math.floor(p);
    return out;
  },
  head: () => ({
    meta: [
      { title: "对局复盘与点评 | 玄弈棋竞" },
      { name: "description", content: "逐手回放自己的天梯对局，查看引擎评分、失误标注与关键转折点讲解。" },
      { property: "og:title", content: "对局复盘与点评 | 玄弈棋竞" },
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
  /** 相对走子方的得失（厘兵），负值为损失 */
  swing: number;
  tag: ReviewTag;
}

const TAG_META: Record<ReviewTag, { zh: string; en: string; mark: string; tone: string }> = {
  best: { zh: "最佳", en: "Best", mark: "!", tone: "text-secondary" },
  good: { zh: "正着", en: "Good", mark: "", tone: "text-on-surface-variant" },
  inaccuracy: { zh: "不准确", en: "Inaccuracy", mark: "?!", tone: "text-secondary-fixed" },
  mistake: { zh: "失误", en: "Mistake", mark: "?", tone: "text-primary" },
  blunder: { zh: "漏着", en: "Blunder", mark: "??", tone: "text-primary" },
};

function cpText(cp: number) {
  const v = cp / 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
}

function matchResult(match: { outcome: string | null; you: string }, lang: "zh" | "en") {
  const zh = !match.outcome ? "进行中" : match.outcome === "draw" ? "和棋" : match.outcome === (match.you === "w" ? "white" : "black") ? "胜" : "负";
  const en = !match.outcome ? "In progress" : match.outcome === "draw" ? "Draw" : match.outcome === (match.you === "w" ? "white" : "black") ? "Win" : "Loss";
  return lang === "zh" ? zh : en;
}

function Analysis() {
  const search = Route.useSearch();
  const t = useT();
  const { lang } = useLang();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [matchId, setMatchId] = useState<string | null>(search.match ?? null);
  const [index, setIndex] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  // 陪练局没有服务端棋谱，用刚结束那局存在会话里的着法直接复盘
  const [lastGame, setLastGame] = useState<LastGame | null>(null);

  useEffect(() => {
    if (!search.local) {
      setLastGame(null);
      return;
    }
    try {
      const raw = sessionStorage.getItem("bs.lastGame");
      setLastGame(raw ? (JSON.parse(raw) as LastGame) : null);
    } catch {
      setLastGame(null);
    }
  }, [search.local]);

  useEffect(() => {
    void fetchSession().then((s) => setSignedIn(!!s));
  }, []);

  const listQ = useQuery({
    queryKey: ["my-matches"],
    queryFn: () => listMyMatches(),
    enabled: signedIn === true,
  });

  const matches = listQ.data ?? [];
  // 默认选中最近一局“有着法”的对局，空局（0 手）不会让复盘区看起来是空的
  const firstPlayed = matches.find((m) => (m.ply ?? 0) > 0) ?? matches[0];
  const activeId = lastGame ? null : (matchId ?? firstPlayed?.id ?? null);
  const activeMatch = lastGame ? undefined : (matches.find((match) => match.id === activeId) ?? firstPlayed);

  const detailQ = useQuery({
    queryKey: ["match-review", activeId],
    queryFn: () => {
      if (!activeId) throw new Error("no match selected");
      return getMatch({ data: { matchId: activeId, lastSeq: 0 } });
    },
    enabled: !!activeId,
  });

  // 逐手评估交给独立线程的引擎，边算边回报进度，界面不会卡住
  const [steps, setSteps] = useState<Step[]>([]);
  const [reviewPct, setReviewPct] = useState(0);

  const sourceUcis = lastGame
    ? lastGame.uciLine
    : ((detailQ.data?.moves ?? []) as { uci: string }[]).map((m) => m.uci);
  const sourceKey = sourceUcis.join(" ");

  useEffect(() => {
    setSteps([]);
    setReviewPct(0);
    const line = sourceKey ? sourceKey.split(" ") : [];
    if (!line.length) return;
    const signal = { aborted: false };
    void reviewGame(line, {
      signal,
      onProgress: (done, total) => {
        if (!signal.aborted) setReviewPct(Math.round((done / total) * 100));
      },
    }).then((summary) => {
      if (signal.aborted) return;
      setSteps(
        summary.moves.map((m) => ({
          ply: m.ply,
          san: m.san,
          by: m.by,
          fen: m.fen,
          cp: m.cp,
          swing: -m.loss,
          tag: m.tag,
        })),
      );
      setReviewPct(100);
    });
    return () => {
      signal.aborted = true;
    };
  }, [sourceKey]);

  // 从战报点进来时，复盘算完后直接停在那一手
  const jumpedForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!search.ply || steps.length === 0) return;
    if (jumpedForRef.current === sourceKey) return;
    jumpedForRef.current = sourceKey;
    setIndex(Math.min(steps.length, search.ply));
  }, [search.ply, steps.length, sourceKey]);


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
    <div className="themed-page home-glass-page min-h-screen text-on-surface pb-32 md:pb-space-lg">
      <ThemeBackdrop theme="fallen" />
      <SovereignPageHeader icon="nav-review" titleZh="对局复盘" titleEn="Match Review" />

      <main className="page-main-dashboard">
        <div className="desktop-page-container w-full px-margin-mobile py-space-sm md:py-space-md grid gap-space-sm md:gap-space-md">
          <section aria-label={t("对局历史", "Match history")} className="review-history home-glass-panel">
            <div className="section-heading-row p-space-sm">
              <div className="min-w-0">
                 <h2 className="cjk font-headline-sm text-headline-sm">{t("对局历史", "Match history")}</h2>
                {lastGame ? (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">
                    {t("刚结束的这一局", "Your latest game")} ·{" "}
                    {lastGame.ranked ? t("天梯对局", "Ranked") : t("陪练对局 · 不计分", "Practice · unrated")} ·{" "}
                    {t(`${lastGame.uciLine.length} 手`, `${lastGame.uciLine.length} moves`)}
                  </p>
                ) : activeMatch ? (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">
                    {t("对手", "Opponent")} {activeMatch.opponent} · {matchResult(activeMatch, lang)} ·{" "}
                    {t(`${activeMatch.ply} 手`, `${activeMatch.ply} moves`)} ·{" "}
                    {new Date(activeMatch.playedAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}
                  </p>
                ) : (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">{t("选择一局已完成或进行中的对局", "Pick a finished or ongoing game")}</p>
                )}
              </div>
              {signedIn === true && matches.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  aria-expanded={historyOpen}
                  aria-controls="match-history-list"
                  onClick={() => setHistoryOpen((open) => !open)}
                  className="home-glass-control h-11 px-3 text-secondary shrink-0"
                >
                  <UiIcon name={historyOpen ? "eye" : "scroll"} className="h-5 w-5" />
                  <span className="cjk">{historyOpen ? t("收起", "Close") : t("选择对局", "Pick a game")}</span>
                </Button>
              )}
            </div>
            {signedIn === false && (
              <div className="grid gap-2 px-space-sm pb-space-sm">
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("登录后这里会列出你的每一局天梯对局，可逐手回放并查看点评。", "Sign in to list every ranked game here, replay it move by move and read the notes.")}</p>
                <Link to="/auth" className="home-glass-action h-11 flex items-center justify-center bg-secondary text-on-secondary cjk font-label-md text-label-md">{t("去登录", "Sign in")}</Link>
              </div>
            )}
            {signedIn === true && listQ.isLoading && <p className="cjk px-space-sm pb-space-sm font-body-sm text-body-sm text-on-surface-variant">{t("正在读取…", "Loading…")}</p>}
            {signedIn === true && !listQ.isLoading && matches.length === 0 && (
              <div className="grid gap-2 px-space-sm pb-space-sm">
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("还没有对局记录，先完成一局 AI 陪练或真人对弈。", "No games yet — play an AI practice game or a live opponent first.")}</p>
                <Link to="/battle" className="home-glass-action flex h-11 items-center justify-center bg-primary-container text-on-primary-container cjk font-label-md text-label-md">{t("开始对弈", "Start playing")}</Link>
              </div>
            )}
            <div
              id="match-history-list"
              hidden={!historyOpen}
              className="review-history-list grid gap-1 max-h-[min(42vh,430px)] overflow-y-auto overscroll-contain border-t border-outline-variant/30 p-2"
            >
              {matches.map((m) => {
                const active = m.id === activeId;
                const result = matchResult(m, lang);
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setLastGame(null);
                      setMatchId(m.id);
                      setHistoryOpen(false);
                    }}
                    className={`min-h-14 px-2 py-2 text-left transition-colors ${active ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant hover:text-secondary"}`}
                  >
                    <span className="cjk block font-label-md text-label-md truncate">{t("对手", "Opponent")} {m.opponent}</span>
                    <span className="cjk block font-label-sm text-label-sm">
                      {result} · {t(`${m.ply} 手`, `${m.ply} moves`)} · {new Date(m.playedAt).toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US")}
                      {m.ratingDelta !== null ? ` · ${m.ratingDelta >= 0 ? "+" : ""}${m.ratingDelta} ELO` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-label={t("逐手复盘", "Move-by-move review")} className="review-layout grid gap-space-sm min-w-0 xl:grid-cols-[minmax(0,640px)_minmax(320px,1fr)] xl:items-start">
            <div className="review-playback grid gap-space-sm min-w-0">
              {detailQ.data && (
                <div className="home-glass-panel p-space-sm grid grid-cols-2 gap-space-sm">
                  {(["w", "b"] as const).map((side) => {
                    const m = detailQ.data.match as unknown as { white_name: string; black_name: string; white_elo: number; black_elo: number };
                    const name = side === "w" ? m.white_name : m.black_name;
                    const elo = side === "w" ? m.white_elo : m.black_elo;
                    const av = detailQ.data.avatars?.[side];
                    return (
                      <div key={side} className="flex items-center gap-space-sm min-w-0">
                        <PlayerAvatar className="h-10 w-10" avatarKey={av?.key ?? ""} avatarSrc={av?.url ?? null} seed={name} />
                        <div className="min-w-0">
                          <p className="cjk font-label-md text-label-md truncate">
                            {name}
                            {side === detailQ.data.you ? t("（你）", " (you)") : ""}
                          </p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                            {side === "w" ? t("白方", "White") : t("黑方", "Black")} · {elo} ELO
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="review-board flex justify-center">
                <PlayableBoard
                  fen={fen}
                  lastMove={undefined}
                  disabled
                  onMove={() => {}}
                  whitePieceSetId={(detailQ.data?.match as unknown as { white_piece_set?: string } | undefined)?.white_piece_set}
                  blackPieceSetId={(detailQ.data?.match as unknown as { black_piece_set?: string } | undefined)?.black_piece_set}
                />
              </div>


              <div className="review-controls home-glass-panel p-space-sm grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="cjk font-label-md text-label-md">
                  {current ? t(`第 ${current.ply} 手 ${current.san}`, `Move ${current.ply} · ${current.san}`) : t("起始局面", "Starting position")}
                </span>
                <span className="font-label-md text-label-md tabular-nums text-secondary">{cpText(current?.cp ?? 0)}</span>
              </div>
              {current && (
                <p className={`cjk font-body-sm text-body-sm ${TAG_META[current.tag].tone}`}>
                  {lang === "zh" ? TAG_META[current.tag].zh : TAG_META[current.tag].en} {TAG_META[current.tag].mark} ·{" "}
                  {t(
                    `这一手让${current.by === "w" ? "白方" : "黑方"}${current.swing >= 0 ? `多得 ${(current.swing / 100).toFixed(2)} 兵的优势` : `损失 ${(Math.abs(current.swing) / 100).toFixed(2)} 兵的优势`}`,
                    `${current.by === "w" ? "White" : "Black"} ${current.swing >= 0 ? `gained ${(current.swing / 100).toFixed(2)} pawns` : `lost ${(Math.abs(current.swing) / 100).toFixed(2)} pawns`} here`,
                  )}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 <Button onClick={() => setIndex(0)} disabled={index === 0} className="home-glass-control h-12 bg-surface-container text-on-surface"><UiIcon name="spinner" className="h-5 w-5" />{t("起始", "Start")}</Button>
                 <Button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className="home-glass-control h-12 bg-surface-container text-on-surface"><UiIcon name="play-motion" className="h-5 w-5 rotate-180" />{t("上一手", "Previous")}</Button>
                 <Button onClick={() => setIndex((i) => Math.min(steps.length, i + 1))} disabled={index >= steps.length} className="home-glass-action h-12 bg-secondary text-on-secondary"><UiIcon name="play-motion" className="h-5 w-5" />{t("下一手", "Next")}</Button>
                 <Button onClick={() => setIndex(steps.length)} disabled={index >= steps.length} className="home-glass-control h-12 bg-surface-container text-on-surface"><UiIcon name="seal" className="h-5 w-5" />{t("终局", "Final")}</Button>
              </div>
              </div>
            </div>

            <div className="review-insights grid gap-space-sm tab:grid-cols-2 xl:grid-cols-1">
              <div className="home-glass-panel p-space-sm">
                <h3 className="cjk font-label-lg text-label-lg mb-2">{t("棋谱", "Move list")}</h3>
                <div className="max-h-[36vh] overflow-y-auto overscroll-contain grid gap-1">
                  {steps.length === 0 && (
                    <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                      {reviewPct > 0
                        ? t(`复盘计算中 ${reviewPct}%`, `Analysing ${reviewPct}%`)
                        : activeMatch
                          ? t("这局没有着法记录，换一局或先去对弈一局。", "This game has no recorded moves — pick another or play one first.")
                          : t("选择一局对局后显示棋谱。", "Pick a game to see its move list.")}
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

              <div className="home-glass-panel p-space-sm">
                <h3 className="cjk font-label-lg text-label-lg mb-2">{t("关键转折", "Turning points")}</h3>
                {worst.length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("本局没有明显失误，继续保持。", "No clear mistakes this game — keep it up.")}</p>}
                <div className="grid gap-2">
                  {worst.map((s) => (
                    <button key={s.ply} onClick={() => setIndex(s.ply)} className="bg-surface-container px-2 py-2 text-left min-h-14">
                      <span className="cjk block font-label-md text-label-md">
                        {t(`第 ${s.ply} 手 ${s.san}`, `Move ${s.ply} · ${s.san}`)} · {lang === "zh" ? TAG_META[s.tag].zh : TAG_META[s.tag].en}
                      </span>
                      <span className="cjk block font-body-sm text-body-sm text-on-surface-variant">
                        {t(
                          `${s.by === "w" ? "白方" : "黑方"}在此丢掉约 ${(Math.abs(s.swing) / 100).toFixed(1)} 兵，点这里回到该局面重新推演。`,
                          `${s.by === "w" ? "White" : "Black"} dropped about ${(Math.abs(s.swing) / 100).toFixed(1)} pawns here — tap to replay this position.`,
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="home-glass-panel p-space-sm grid gap-2 tab:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="cjk font-label-lg text-label-lg">{t("AI 分段讲解", "AI phase commentary")}</h3>
                  <Button
                    type="button"
                    onClick={() => narrative.mutate()}
                    disabled={steps.length === 0 || narrative.isPending}
                    className="home-glass-action h-11 bg-secondary text-on-secondary cjk shrink-0"
                  >
                    {narrative.isPending ? t("生成中…", "Generating…") : narrative.data ? t("重新生成", "Regenerate") : t("生成讲解", "Generate")}
                  </Button>
                </div>
                {steps.length === 0 && (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("这局还没有着法，下一局结束后即可生成开局、中局、残局讲解。", "No moves yet — after your next game you can generate opening, middlegame and endgame commentary.")}</p>
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
                          {(lang === "zh" ? PHASE_LABEL[seg.phase]?.zh : PHASE_LABEL[seg.phase]?.en) ?? seg.phase} · {seg.title}
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
                        <p className="cjk font-body-sm text-body-sm text-secondary-fixed">{t("建议：", "Advice: ")}{seg.advice}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {steps.length > 0 && (
                <Link to="/archive" className="home-glass-action min-h-12 px-space-md flex items-center justify-between gap-space-sm text-secondary tab:col-span-2 xl:col-span-1">
                  <span className="cjk font-label-md text-label-md">{t("将本局制作成绝杀典藏", "Turn this game into a collectible poster")}</span>
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
