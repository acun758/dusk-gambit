import { createFileRoute, Link } from "@tanstack/react-router";
import { PlayableBoard } from "@/components/PlayableBoard";
import { useState } from "react";

export const Route = createFileRoute("/puzzle/")({
  head: () => ({ meta: [{ title: "残局破局 · 一步将杀" }, { name: "description", content: "适配 iPhone 与 iPad 的互动残局挑战。" }] }),
  component: Puzzle,
});

const FEN = "6rk/5ppp/8/7Q/4B3/8/8/6K1 w - - 0 1";

function Puzzle() {
  const [result, setResult] = useState<"idle" | "win" | "miss">("idle");
  const play = (uci: string) => setResult(uci === "h5f7" ? "win" : "miss");
  return (
    <div className="min-h-screen bg-surface text-on-surface pb-28">
      <header className="fixed top-0 inset-x-0 lg:left-56 z-40 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <Link to="/crucible" className="w-11 h-11 flex items-center justify-center text-secondary" aria-label="返回试炼"><span className="material-symbols-outlined">arrow_back</span></Link>
          <div className="text-center"><h1 className="font-headline-sm text-headline-sm">残局破局</h1><p className="font-label-sm text-label-sm text-secondary tracking-widest">PUZZLE 8492</p></div>
          <span className="font-label-sm text-label-sm text-primary tabular-nums">00:60</span>
        </div>
      </header>
      <main className="pt-16 px-margin-mobile min-h-[calc(100vh-7rem)] flex flex-col lg:flex-row lg:items-center lg:justify-center gap-space-md">
        <section className="flex-1 min-w-0 flex flex-col items-center gap-space-sm pt-space-sm">
          <div className="w-full game-board h-auto p-space-sm bg-surface-container-low">
            <p className="font-label-sm text-label-sm text-primary tracking-widest">宗师残局 · 白方走棋</p>
            <h2 className="font-headline-md text-headline-md mt-1">复现绝杀 · 虚空断罪</h2>
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant mt-1">目标：一步将杀。点击白后，再点击目标格完成落子。</p>
          </div>
          <PlayableBoard fen={FEN} onMove={play} />
        </section>
        <aside className="w-full lg:w-80 bg-surface-container-low p-space-md flex flex-col gap-space-sm">
          <div className="grid grid-cols-3 gap-2">
            {["Qf7#", "Qh6+", "Rxd8+"].map((m, i) => <button key={m} onClick={() => setResult(i === 0 ? "win" : "miss")} className="h-12 bg-surface-container-high font-label-md text-label-md text-secondary">{m}</button>)}
          </div>
          <div className={`min-h-16 p-space-sm cjk font-body-sm text-body-sm ${result === "win" ? "bg-secondary-container/30" : result === "miss" ? "bg-error-container/30" : "bg-surface-container"}`}>
            {result === "win" ? "正解：Qf7#。白后封锁逃生格，并由白象保护，黑王无处可逃。" : result === "miss" ? "这一步不能立即将杀。重新检查王的逃生格与保护关系。" : "提示：寻找受白象保护、同时封锁王翼的后棋落点。"}
          </div>
          <div className="flex justify-between text-on-surface-variant"><span>奖励 +15 ELO</span><span>+50 钻石</span></div>
          <Link to="/crucible" className="h-12 bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md">进入完整残局试炼</Link>
        </aside>
      </main>
    </div>
  );
}