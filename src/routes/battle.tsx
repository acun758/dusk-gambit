import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { playSound, primeSounds } from "@/lib/sound";

import { EndgameDrill } from "@/components/EndgameDrill";
import { DuelPanel } from "@/components/DuelPanel";
import { PlayableBoard } from "@/components/PlayableBoard";
import { useDuelSession, fmtClock } from "@/hooks/useDuelSession";
import { Button } from "@/components/ui/button";
import { AI_LEVELS, aiLevel } from "@/core/ai";
import { getCoachInsight } from "@/lib/chess-coach";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { OpponentPanel } from "@/components/OpponentPanel";
import { UiIcon, type UiIconName } from "@/components/UiIcon";
import { PromotionOverlay, usePromotionCeremony } from "@/components/PromotionOverlay";
import { LangToggle, useLang, useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { SoundToggle } from "@/components/SoundToggle";

export const Route = createFileRoute("/battle")({
  validateSearch: (search: Record<string, unknown>): { drill?: string } =>
    typeof search['drill'] === "string" ? { drill: search['drill'] as string } : {},
  head: () => ({
    meta: [
      { title: "3+2 实时对弈 · 血誓王权" },
      { name: "description", content: "服务端仲裁时钟、合法落子与断线追帧的实时天梯对弈。" },
      { property: "og:title", content: "3+2 实时对弈 · 血誓王权" },
      { property: "og:description", content: "服务端仲裁时钟、合法落子与断线追帧的实时天梯对弈。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Battle,
});

const PHASE: Record<string, string> = { idle: "待命", connecting: "连接中", live: "实时同步", resyncing: "追帧中", offline: "断线重连" };

function Battle() {
  const { drill } = Route.useSearch();
  const [tab, setTab] = useState<"duel" | "drill">(drill ? "drill" : "duel");
  useEffect(() => {
    if (drill) setTab("drill");
  }, [drill]);
  useEffect(() => {
    const prime = () => primeSounds();
    window.addEventListener("pointerdown", prime, { once: true });
    return () => window.removeEventListener("pointerdown", prime);
  }, []);

  const session = useDuelSession();
  const { profile, signedIn } = useProfile();
  const t = useT();
  const { lang } = useLang();
  const waiting = session.state.status === "waiting";
  const myTurn = session.state.turn === session.state.you && session.state.status === "live" && !session.movePending;
  const opponent = session.state.you === "w" ? session.state.players.b : session.state.players.w;
  const me = session.state.players[session.state.you];
  const ranked = session.transport === "cloud";
  const coach = getCoachInsight(session.state.fen, session.moves, ranked);
  const oppSide = session.state.you === "w" ? "b" : "w";
  const myElo = session.ratings?.[session.state.you]?.elo ?? me.elo;
  const oppElo = session.ratings?.[oppSide]?.elo ?? opponent.elo;
  const myClock = session.clock[session.state.you];
  const timeLevel: "calm" | "warn" | "critical" = myClock <= 20_000 ? "critical" : myClock <= 60_000 ? "warn" : "calm";
  // 读秒提示：自己剩余 10 秒内每整秒轻响一次
  const tickedRef = useRef<number | null>(null);
  useEffect(() => {
    if (session.state.status !== "live" || session.state.turn !== session.state.you) {
      tickedRef.current = null;
      return;
    }
    const second = Math.ceil(myClock / 1000);
    if (second > 10 || second <= 0) return;
    if (tickedRef.current === second) return;
    tickedRef.current = second;
    playSound("tick");
  }, [myClock, session.state.status, session.state.turn, session.state.you]);
  // 终局一声
  const endedRef = useRef(false);
  useEffect(() => {
    if (session.state.status === "over" && !endedRef.current) {
      endedRef.current = true;
      playSound("end");
    }
    if (session.state.status === "live") endedRef.current = false;
  }, [session.state.status]);

  const rankArt = profile.elo >= 2600 ? "rank-sovereign" : profile.elo >= 2500 ? "rank-apex" : profile.elo >= 2400 ? "rank-grandmaster" : profile.elo >= 2200 ? "rank-master" : "rank-knight";
  const ceremony = usePromotionCeremony(
    { key: profile.tier, zh: profile.tierZh, en: profile.tier, art: rankArt, floor: profile.elo >= 2600 ? 2600 : profile.elo >= 2500 ? 2500 : profile.elo >= 2400 ? 2400 : profile.elo >= 2200 ? 2200 : 0 },
    signedIn && ranked,
  );
  const ratingDelta = session.ratings?.ratingDelta ?? 0;
  return (
    <div className="themed-page home-glass-page min-h-screen text-on-surface pb-32 lg:pb-space-lg">
      <ThemeBackdrop theme="gothic" />
      <PromotionOverlay event={ceremony.event} onDismiss={ceremony.dismiss} />
      <header className="home-glass-header desktop-page-header fixed top-0 inset-x-0 z-40 pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-3">
           <Link to="/" aria-label="返回王座" className="home-glass-control w-11 h-11 flex items-center justify-center text-secondary"><UiIcon name="play-motion" className="h-7 w-7 rotate-180" /></Link>
          <div className="flex-1 min-w-0">
            <h1 className={`font-headline-md text-headline-md leading-tight truncate ${lang === "zh" ? "cjk" : ""}`}>{t("3+2 对弈", "3+2 Duel")}</h1>
            <p className="cjk font-label-sm text-label-sm text-on-surface-variant truncate">{ranked ? (waiting ? t("正在等待另一位玩家加入", "Waiting for another player") : t(`服务端仲裁 · ${PHASE[session.phase]}`, `Server-arbitrated · ${session.phase}`)) : t("AI 分级陪练 · 不计天梯分", "AI training · unrated")}</p>
          </div>
           <SoundToggle />
            <LangToggle className="home-glass-control" />
          <span className={`w-2.5 h-2.5 rounded-full ${session.phase === "live" ? "bg-secondary animate-pulse" : "bg-primary"}`} />
        </div>
      </header>

      <main className="page-main-compact battle-stage desktop-page-container px-margin-mobile lg:flex lg:items-start lg:justify-center lg:gap-space-lg">
        {tab === "drill" ? (
          <section className="battle-column w-full lg:max-w-[min(64vw,680px)] flex flex-col items-center gap-space-sm pt-space-sm">
            <div className="battle-core-width flex gap-1">
              <Button type="button" variant="ghost" onClick={() => setTab("duel")} className="home-glass-control h-11 flex-1 bg-surface-container text-on-surface-variant cjk">
                {t("对弈", "Duel")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setTab("drill")} className="home-glass-control h-11 flex-1 bg-secondary text-on-secondary cjk">
                {t("残局试炼", "Endgame drill")}
              </Button>
            </div>
            <EndgameDrill initialCode={drill} />
          </section>
        ) : (
        <section className="battle-column w-full lg:max-w-[min(64vw,680px)] flex flex-col items-center gap-space-sm pt-space-sm lg:pt-0 lg:sticky lg:top-20">
          <div className="battle-core-width flex gap-1">
            <Button type="button" variant="ghost" onClick={() => setTab("duel")} className="home-glass-control h-11 flex-1 bg-secondary text-on-secondary cjk">
              {t("对弈", "Duel")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setTab("drill")} className="home-glass-control h-11 flex-1 bg-surface-container text-on-surface-variant cjk">
              {t("残局试炼", "Endgame drill")}
            </Button>
          </div>
          <PlayerBar
            name={opponent.name}
            seed={opponent.name}
            avatarKey={session.ratings?.[oppSide]?.avatarKey ?? ""}
            avatarSrc={session.ratings?.[oppSide]?.avatarUrl ?? null}
            elo={oppElo}
            clock={fmtClock(session.clock[session.state.you === "w" ? "b" : "w"])}
            active={session.state.turn !== session.state.you}
            dark
          />

          <div className="battle-board-wrap relative w-full flex items-stretch justify-center">
            <div className="battle-eval hidden sm:flex w-3 overflow-hidden bg-surface-container-highest/80 border border-outline-variant/40 flex-col justify-end absolute inset-y-0 -left-5" title="实时评估">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-outline-variant/60" />
              <div className="bg-secondary/70 transition-[height] duration-500" style={{ height: `${Math.max(8, Math.min(92, 50 + session.cp / 20))}%` }} />
            </div>
            <PlayableBoard
              fen={session.state.fen}
              lastMove={session.moves.at(-1)?.uci}
              lastMoveWasCapture={session.moves.at(-1)?.san.includes("x") ?? false}
              disabled={!myTurn}
              premove={ranked && session.state.status === "live"}
              myColor={session.state.you}
              onMove={session.playMove}
              whitePieceSetId={session.ratings?.w?.pieceSetId ?? (session.state.you === "w" ? profile.equippedPieceSet : undefined)}
              blackPieceSetId={session.ratings?.b?.pieceSetId ?? (session.state.you === "b" ? profile.equippedPieceSet : undefined)}
            />
          </div>

          <PlayerBar
            name={me.name}
            seed={me.name}
            avatarKey={session.ratings?.[session.state.you]?.avatarKey || profile.avatarKey}
            avatarPath={profile.avatarPath}
            avatarSrc={session.ratings?.[session.state.you]?.avatarUrl ?? null}
            elo={myElo}
            clock={fmtClock(session.clock[session.state.you])}
            active={myTurn}
          />
          <div className="battle-core-width home-glass-panel p-space-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface">{session.state.status === "over" ? "本局已结束" : waiting ? "等待对手加入" : session.movePending ? "正在确认落子" : myTurn ? "轮到你落子" : "等待对手落子"}</p>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">{waiting ? "保持页面开启，匹配成功后自动开局" : `点击棋子，再点击高亮目标格 · 评估 ${session.cp >= 0 ? "+" : ""}${(session.cp / 100).toFixed(2)}`}</p>
            </div>
            <span className={`font-label-md text-label-md tabular-nums shrink-0 ${timeLevel === "critical" ? "text-primary animate-pulse" : timeLevel === "warn" ? "text-secondary" : "text-on-surface-variant"}`}>
              {session.state.tc.label} · 余 {fmtClock(myClock)}
            </span>
          </div>

          {timeLevel !== "calm" && session.state.status === "live" && (
            <p role="status" className={`battle-core-width home-glass-panel cjk px-space-sm py-2 font-body-sm text-body-sm ${timeLevel === "critical" ? "text-on-primary-container" : "text-on-surface-variant"}`}>
              {timeLevel === "critical" ? `只剩 ${Math.ceil(myClock / 1000)} 秒，先落子保时间，每步加 2 秒。` : "剩余时间不足 1 分钟，注意读秒节奏。"}
            </p>
          )}

          <div className="battle-core-width grid grid-cols-3 gap-2">
            <Button
              onClick={session.togglePause}
              disabled={!session.canPause || session.state.status !== "live"}
              variant="ghost"
               className="home-glass-control h-12 text-on-surface cjk font-label-sm text-label-sm disabled:opacity-40"
            >
              <UiIcon name={session.paused ? "play-motion" : "equalizer"} className="h-6 w-6" />
              {session.paused ? "继续" : "暂停"}
            </Button>
            <Button
              onClick={session.resign}
              disabled={waiting || session.state.status !== "live"}
              variant="ghost"
               className="home-glass-control h-12 text-primary cjk font-label-sm text-label-sm disabled:opacity-40"
            >
              <UiIcon name="skull" className="h-6 w-6" />
              结束本局
            </Button>
             <Button onClick={session.restart} variant="ghost" className="home-glass-control h-12 text-secondary cjk font-label-sm text-label-sm">
              <UiIcon name="spinner" className="h-6 w-6" />
              重新开始
            </Button>
          </div>
          {!session.canPause && (
            <p className="battle-core-width cjk font-body-sm text-body-sm text-on-surface-variant">真人天梯由服务端仲裁时钟，不能暂停；「重新开始」会退出当前真人局回到 AI 陪练。</p>
          )}
          {session.notice && (
             <div role="status" className="battle-core-width home-glass-panel px-space-sm py-3 flex items-center justify-between gap-3">
              <p className="cjk font-body-sm text-body-sm text-on-primary-container">{session.notice}</p>
              {session.phase === "offline" && <Button onClick={session.useLocalPractice} className="home-glass-action h-11 bg-secondary text-on-secondary px-3 shrink-0">本地陪练</Button>}
            </div>
          )}

          {ranked && session.state.status === "over" && (
             <section role="status" aria-live="polite" className="battle-core-width home-glass-panel p-space-md text-center">
              <p className="cjk font-label-sm text-label-sm text-secondary">天梯结算完成</p>
              <p className="cjk mt-1 font-headline-md text-headline-md text-on-surface">
                {session.state.outcome === "draw" ? "和棋" : session.state.outcome === (session.state.you === "w" ? "white" : "black") ? "胜利" : "败北"}
              </p>
              <p className={`mt-1 font-label-lg text-label-lg tabular-nums ${ratingDelta >= 0 ? "text-secondary" : "text-primary"}`}>
                {ratingDelta >= 0 ? "+" : ""}{ratingDelta} ELO · 当前 {myElo}
              </p>
              <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant">积分、段位徽章与战绩已同步到首页和天梯榜。</p>
              <Link to="/dynasty" className="cjk mt-2 inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm">查看段位变化 →</Link>
              <Link to="/analysis" className="cjk ml-4 mt-2 inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm">复盘本局 →</Link>
            </section>
          )}

           <section aria-label="棋局教练" className="battle-core-width home-glass-panel p-space-sm flex items-start gap-space-sm">
            <UiIcon name={(coach.phase === "opening" ? "quill" : coach.phase === "endgame" ? "flame" : coach.icon === "target" ? "bolt" : "lotus") as UiIconName} className="h-8 w-8 mt-0.5" />
            <div className="min-w-0">
              <p className="cjk font-label-sm text-label-sm text-primary tracking-widest">{coach.eyebrow}</p>
              <h2 className="cjk font-label-lg text-label-lg text-on-surface mt-0.5">{coach.title}</h2>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-1">{coach.body}</p>
              {coach.phase === "endgame" && <Link to="/crucible" className="cjk inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm mt-1">去残局试炼强化此主题 →</Link>}
            </div>
          </section>

           <section aria-label="AI 陪练段位" className="battle-core-width home-glass-panel p-space-sm">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h2 className="cjk font-label-md text-label-md text-on-surface">AI 分级陪练</h2>
              <span className="cjk font-label-sm text-label-sm text-on-surface-variant">
                {ranked ? "当前为真人天梯，选择段位即切换陪练" : `默认模式 · ${aiLevel(session.aiLevelId).zh} ${aiLevel(session.aiLevelId).elo}`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AI_LEVELS.map((lv) => {
                const active = session.transport !== "cloud" && session.aiLevelId === lv.id;
                return (
                  <button
                    key={lv.id}
                    onClick={() => session.setAiLevel(lv.id)}
                     className={`home-glass-tile min-h-14 px-2 py-2 text-left transition-colors ${active ? "home-glass-tile-active text-on-primary-container" : "text-on-surface-variant hover:text-secondary"}`}
                  >
                    <span className="cjk block font-label-md text-label-md">{lv.zh}</span>
                    <span className="block font-label-sm text-label-sm tabular-nums">{lv.elo}</span>
                  </button>
                );
              })}
            </div>
            <p className="cjk mt-2 font-body-sm text-body-sm text-on-surface-variant">{aiLevel(session.aiLevelId).desc}</p>
            <p className="cjk mt-space-sm pt-space-sm border-t border-outline-variant/40 font-body-sm text-body-sm text-on-surface-variant">准备好后在下方「找对手」进入真人 3+2；胜负会改变 ELO、段位和赛季战绩。</p>
          </section>

          <OpponentPanel onStartRanked={session.startRanked} ranked={ranked} waiting={waiting} />
        </section>
        )}
        {tab === "duel" && <DuelPanel session={session} />}
      </main>
    </div>
  );
}

function PlayerBar({ name, elo, clock, active, dark = false, seed, avatarKey, avatarPath, avatarSrc }: { name: string; elo: number; clock: string; active: boolean; dark?: boolean; seed?: string; avatarKey?: string; avatarPath?: string; avatarSrc?: string | null }) {
  return (
    <div className={`battle-core-width home-glass-panel min-h-14 px-space-sm py-2 flex items-center justify-between gap-3 ${active ? "home-glass-tile-active" : ""}`}>
      <div className="flex items-center gap-3 min-w-0"><PlayerAvatar className="h-10 w-10" seed={seed} avatarKey={avatarKey} avatarPath={avatarPath} avatarSrc={avatarSrc} /><div className="min-w-0"><p className="font-label-md text-label-md truncate">{name}</p><p className="font-label-sm text-label-sm text-on-surface-variant">{elo} ELO</p></div></div>
      <span className={`font-headline-md text-headline-md tabular-nums ${active ? "text-secondary" : "text-on-surface-variant"}`}>{clock}</span>
    </div>
  );
}
