import { createFileRoute, Link } from "@tanstack/react-router";
import { DuelPanel } from "@/components/DuelPanel";
import { PlayableBoard } from "@/components/PlayableBoard";
import { useDuelSession, fmtClock } from "@/hooks/useDuelSession";

export const Route = createFileRoute("/battle")({
  head: () => ({ meta: [{ title: "3+2 实时对弈 · 血誓王权" }, { name: "description", content: "服务端仲裁时钟、合法落子与断线追帧的实时天梯对弈。" }] }),
  component: Battle,
});

const PHASE: Record<string, string> = { idle: "待命", connecting: "连接中", live: "实时同步", resyncing: "追帧中", offline: "断线重连" };

function Battle() {
  const session = useDuelSession();
  const myTurn = session.state.turn === session.state.you && session.state.status === "live";
  const opponent = session.state.you === "w" ? session.state.players.b : session.state.players.w;
  const me = session.state.players[session.state.you];
  return (
    <div className="min-h-screen bg-surface text-on-surface pb-32 lg:pb-space-lg">
      <header className="fixed top-0 inset-x-0 lg:left-56 z-40 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-3">
          <Link to="/" aria-label="返回王座" className="w-11 h-11 flex items-center justify-center text-secondary"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-headline-sm text-headline-sm truncate">3+2 天梯对弈</h1>
            <p className="cjk font-label-sm text-label-sm text-on-surface-variant truncate">服务端仲裁 · {PHASE[session.phase]} · {session.transport === "cloud" ? "云端实战" : "本地陪练"}</p>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${session.phase === "live" ? "bg-secondary animate-pulse" : "bg-primary"}`} />
        </div>
      </header>

      <main className="pt-16 px-margin-mobile lg:flex lg:items-start lg:justify-center lg:gap-space-lg">
        <section className="w-full lg:max-w-[min(62vw,620px)] flex flex-col items-center gap-space-sm pt-space-sm">
          <PlayerBar name={opponent.name} elo={opponent.elo} clock={fmtClock(session.clock[session.state.you === "w" ? "b" : "w"])} active={session.state.turn !== session.state.you} dark />

          <div className="w-full flex items-stretch justify-center gap-2">
            <div className="hidden sm:flex w-8 bg-surface-container-lowest gold-hairline flex-col justify-end" title="实时评估">
              <div className="bg-secondary-fixed transition-[height] duration-500" style={{ height: `${Math.max(8, Math.min(92, 50 + session.cp / 20))}%` }} />
            </div>
            <PlayableBoard fen={session.state.fen} disabled={!myTurn} onMove={session.playMove} />
          </div>

          <PlayerBar name={me.name} elo={me.elo} clock={fmtClock(session.clock[session.state.you])} active={myTurn} />
          <div className="w-full bg-surface-container-low p-space-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface">{session.state.status === "over" ? "本局已结束" : myTurn ? "轮到你落子" : "等待对手落子"}</p>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">点击棋子，再点击高亮目标格 · 评估 {session.cp >= 0 ? "+" : ""}{(session.cp / 100).toFixed(2)}</p>
            </div>
            <button onClick={session.resign} className="h-11 px-4 bg-surface-container-high text-primary cjk font-label-sm text-label-sm shrink-0">认输</button>
          </div>
        </section>
        <DuelPanel session={session} />
      </main>
    </div>
  );
}

function PlayerBar({ name, elo, clock, active, dark = false }: { name: string; elo: number; clock: string; active: boolean; dark?: boolean }) {
  return (
    <div className={`w-full game-board max-h-16 px-space-sm py-2 flex items-center justify-between gap-3 ${dark ? "bg-surface-container-lowest" : "bg-surface-container"} ${active ? "gold-hairline" : ""}`}>
      <div className="flex items-center gap-2 min-w-0"><span className={`text-2xl ${dark ? "text-primary" : "text-secondary"}`}>{dark ? "♚" : "♔"}</span><div className="min-w-0"><p className="font-label-md text-label-md truncate">{name}</p><p className="font-label-sm text-label-sm text-on-surface-variant">{elo} ELO</p></div></div>
      <span className={`font-headline-md text-headline-md tabular-nums ${active ? "text-secondary" : "text-on-surface-variant"}`}>{clock}</span>
    </div>
  );
}