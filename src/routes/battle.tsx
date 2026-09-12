import { createFileRoute, Link } from "@tanstack/react-router";
import { DuelPanel } from "@/components/DuelPanel";
import { PlayableBoard } from "@/components/PlayableBoard";
import { useDuelSession, fmtClock } from "@/hooks/useDuelSession";
import { Button } from "@/components/ui/button";
import { AI_LEVELS, aiLevel } from "@/lib/local-engine";
import { getCoachInsight } from "@/lib/chess-coach";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { OpponentPanel } from "@/components/OpponentPanel";

export const Route = createFileRoute("/battle")({
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
  const session = useDuelSession();
  const waiting = session.state.status === "waiting";
  const myTurn = session.state.turn === session.state.you && session.state.status === "live" && !session.movePending;
  const opponent = session.state.you === "w" ? session.state.players.b : session.state.players.w;
  const me = session.state.players[session.state.you];
  const ranked = session.transport === "cloud";
  const coach = getCoachInsight(session.state.fen, session.moves, ranked);
  const oppSide = session.state.you === "w" ? "b" : "w";
  const myElo = session.ratings?.[session.state.you]?.elo ?? me.elo;
  const oppElo = session.ratings?.[oppSide]?.elo ?? opponent.elo;
  return (
    <div className="themed-page min-h-screen text-on-surface pb-32 lg:pb-space-lg">
      <ThemeBackdrop theme="gothic" />
      <header className="desktop-page-header fixed top-0 inset-x-0 z-40 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-3">
          <Link to="/" aria-label="返回王座" className="w-11 h-11 flex items-center justify-center text-secondary"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline-sm text-headline-sm truncate">3+2 对弈训练</h1>
            <p className="cjk font-label-sm text-label-sm text-on-surface-variant truncate">{ranked ? (waiting ? "正在等待另一位玩家加入" : `服务端仲裁 · ${PHASE[session.phase]}`) : "AI 分级陪练 · 不计天梯分"}</p>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${session.phase === "live" ? "bg-secondary animate-pulse" : "bg-primary"}`} />
        </div>
      </header>

      <main className="desktop-page-container pt-16 px-margin-mobile lg:flex lg:items-start lg:justify-center lg:gap-space-lg">
        <section className="battle-column w-full lg:max-w-[min(64vw,680px)] flex flex-col items-center gap-space-sm pt-space-sm lg:pt-0 lg:sticky lg:top-20">
          <PlayerBar name={opponent.name} elo={oppElo} clock={fmtClock(session.clock[session.state.you === "w" ? "b" : "w"])} active={session.state.turn !== session.state.you} dark />

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
              onMove={session.playMove}
            />
          </div>

          <PlayerBar name={me.name} elo={myElo} clock={fmtClock(session.clock[session.state.you])} active={myTurn} />
          <div className="battle-core-width bg-surface-container-low p-space-sm flex items-center justify-between gap-3 gold-hairline">
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface">{session.state.status === "over" ? "本局已结束" : waiting ? "等待对手加入" : session.movePending ? "正在确认落子" : myTurn ? "轮到你落子" : "等待对手落子"}</p>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">{waiting ? "保持页面开启，匹配成功后自动开局" : `点击棋子，再点击高亮目标格 · 评估 ${session.cp >= 0 ? "+" : ""}${(session.cp / 100).toFixed(2)}`}</p>
            </div>
            {!waiting && <Button onClick={session.resign} variant="ghost" className="h-11 rounded-none bg-surface-container-high px-4 text-primary cjk font-label-sm text-label-sm shrink-0">认输</Button>}
          </div>
          {session.notice && (
            <div role="status" className="battle-core-width bg-primary-container/30 px-space-sm py-3 flex items-center justify-between gap-3 gold-hairline">
              <p className="cjk font-body-sm text-body-sm text-on-primary-container">{session.notice}</p>
              {session.phase === "offline" && <Button onClick={session.useLocalPractice} className="h-11 rounded-none bg-secondary text-on-secondary px-3 shrink-0">本地陪练</Button>}
            </div>
          )}

          <section aria-label="棋局教练" className="battle-core-width bg-surface-container p-space-sm gold-hairline flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5" aria-hidden="true">{coach.icon}</span>
            <div className="min-w-0">
              <p className="cjk font-label-sm text-label-sm text-primary tracking-widest">{coach.eyebrow}</p>
              <h2 className="cjk font-label-lg text-label-lg text-on-surface mt-0.5">{coach.title}</h2>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed mt-1">{coach.body}</p>
              {coach.phase === "endgame" && <Link to="/crucible" className="cjk inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm mt-1">去残局试炼强化此主题 →</Link>}
            </div>
          </section>

          <section aria-label="AI 陪练段位" className="battle-core-width bg-surface-container-low p-space-sm gold-hairline">
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
                    className={`min-h-14 px-2 py-2 text-left transition-colors ${active ? "bg-primary-container text-on-primary-container gold-hairline" : "bg-surface-container text-on-surface-variant hover:text-secondary"}`}
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
        <DuelPanel session={session} />
      </main>
    </div>
  );
}

function PlayerBar({ name, elo, clock, active, dark = false }: { name: string; elo: number; clock: string; active: boolean; dark?: boolean }) {
  return (
    <div className={`battle-core-width min-h-14 px-space-sm py-2 flex items-center justify-between gap-3 ${dark ? "bg-surface-container-lowest" : "bg-surface-container"} ${active ? "gold-hairline" : ""}`}>
      <div className="flex items-center gap-2 min-w-0"><span className={`text-2xl ${dark ? "text-primary" : "text-secondary"}`}>{dark ? "♚" : "♔"}</span><div className="min-w-0"><p className="font-label-md text-label-md truncate">{name}</p><p className="font-label-sm text-label-sm text-on-surface-variant">{elo} ELO</p></div></div>
      <span className={`font-headline-md text-headline-md tabular-nums ${active ? "text-secondary" : "text-on-surface-variant"}`}>{clock}</span>
    </div>
  );
}