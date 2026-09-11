import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle/")({
  head: () => ({
    meta: [
      { title: "Endgame Puzzle \u2014 Mate in One" },
      { name: "description", content: "Recreate the void beheading: solve the grandmaster mate-in-one endgame in 60 seconds." },
      { property: "og:title", content: "Endgame Puzzle \u2014 Mate in One" },
      { property: "og:description", content: "Recreate the void beheading: solve the grandmaster mate-in-one endgame in 60 seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Puzzle,
});

function Puzzle() {
  return (
    <div className="bg-obsidian text-zinc-200 font-sansUI select-none antialiased min-h-screen flex justify-center items-center overflow-hidden">



<div className={"relative w-full max-w-md h-screen max-h-[920px] bg-obsidian overflow-hidden flex flex-col justify-between shadow-2xl"}>


<div aria-hidden={"true"} className={"absolute inset-0 z-0 overflow-hidden pointer-events-none filter blur-md brightness-50 scale-105"}>
<img alt={"Replay Background Context"} className={"w-full h-full object-cover object-top opacity-60"} src={"https://lh3.googleusercontent.com/aida/AEtjO1WZMqBALiaakbfCPMaNPmvAGvxUzPvx9o7G3vQgqJf03d8T3tV1E9zyYST-gNPNKqN44rtkYbN5Ufzrweph3mdSyacZ1zKZG4T6fwMdNXk35_RMP4YxlCoPL5gszIO8b7F4Xnufpdznto8HEhaxken78AlEk25SdTfXdBpbHtdNfSrJaToEPd9FLQclMaHyplKDZ2HcpBuZPp5h2t1FoZBycXjZkewTzAB4KUFJ3M1aZaOyMqHMXiyUZw4"} />
<div className={"absolute inset-0 bg-gradient-to-t from-obsidian via-[#0e0e12]/80 to-transparent"}></div>
</div>



<header className={"relative z-30 pt-11 px-4 pb-2 flex items-center justify-between text-zinc-300"}>
<div className={"flex items-center space-x-2 text-xs text-zinc-400 font-mono tracking-wider"}>
<span className={"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}></span>
<span className={"tracking-widest uppercase font-serifTitle"}>WECHAT MINI 3D</span>
</div>

<div className={"flex items-center space-x-3 bg-black/40 border border-white/10 rounded-full px-3 py-1 backdrop-blur-md"}>
<button aria-label={"More options"} className={"text-zinc-300 hover:text-white flex space-x-0.5"} type={"button"}>
<span className={"w-1.5 h-1.5 bg-zinc-300 rounded-full"}></span>
<span className={"w-1.5 h-1.5 bg-zinc-300 rounded-full"}></span>
<span className={"w-1.5 h-1.5 bg-zinc-300 rounded-full"}></span>
</button>
<span className={"h-3 w-px bg-white/20"}></span>
<button aria-label={"Close Mini Program"} className={"text-zinc-300 hover:text-white"} type={"button"}>
<div className={"w-3.5 h-3.5 rounded-full border-2 border-zinc-300 flex items-center justify-center"}>
<span className={"w-1 h-1 bg-zinc-300 rounded-full"}></span>
</div>
</button>
</div>
</header>



<div className={"absolute inset-0 bg-black/60 backdrop-blur-md z-10"}></div>



<section className={"relative z-20 w-full bg-[#131318]/95 border-t border-antiqueGold/40 rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-y-auto noise-bg pb-6"} data-purpose={"puzzle-challenge-modal"}>

<div className={"w-full flex justify-center pt-2.5 pb-1"}>
<div className={"w-10 h-1 bg-zinc-600 rounded-full"}></div>
</div>

<header className={"px-5 pt-1 pb-3 text-center relative border-b border-white/5"}>

<button aria-label={"Close modal"} className={"absolute right-4 top-1 text-zinc-400 hover:text-white p-1 rounded-full bg-white/5 border border-white/10"} type={"button"}>
<svg className={"w-4 h-4"} fill={"none"} stroke={"currentColor"} viewBox={"0 0 24 24"}><path d={"M6 18L18 6M6 6l12 12"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2"}></path></svg>
</button>

<div className={"inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-crimson-900/60 border border-antiqueGold/40 text-[10px] text-antiqueGold font-mono tracking-wider mb-1.5"}>
<span className={"text-crimson-glow"}>❖</span>
<span>残局破局挑战 // PUZZLE #8492</span>
</div>

<h2 className={"font-serifTitle text-xl text-white font-bold tracking-wide flex items-center justify-center gap-1.5"}>
<span>复现绝杀 · 虚空断罪</span>
</h2>
<p className={"text-xs text-zinc-400 mt-0.5 tracking-tight"}>
          克隆 GM VANE 历史死斗 · 白方走棋 · <span className={"text-antiqueGold font-semibold"}>1步绝杀 (Mate in 1)</span>
</p>

<div className={"flex items-center justify-center space-x-2 mt-2 text-[11px]"}>
<span className={"px-2 py-0.5 bg-black/40 border border-antiqueGold/30 text-antiqueGold rounded"}>★★★ 宗师残局</span>
<span className={"px-2 py-0.5 bg-black/40 border border-crimson-glow/40 text-rose-300 rounded flex items-center gap-1"}>
<svg className={"w-3 h-3 text-rose-400 animate-spin"} fill={"none"} stroke={"currentColor"} viewBox={"0 0 24 24"}><circle cx={"12"} cy={"12"} r={"10"} strokeDasharray={"32"} strokeLinecap={"round"} strokeWidth={"3"}></circle></svg>
            限时 60s
          </span>
<span className={"px-2 py-0.5 bg-black/40 border border-white/10 text-zinc-300 rounded"}>解法唯一 (Qf7#)</span>
</div>
</header>



<div className={"px-5 pt-3 pb-2 flex flex-col items-center"} data-purpose={"puzzle-board-canvas"}>
<div className={"relative p-2 rounded-xl bg-gradient-to-b from-[#1d1d26] to-[#0c0c10] border border-antiqueGold/40 shadow-2xl"}>

<div className={"grid grid-cols-8 gap-0 text-[9px] text-zinc-500 font-mono text-center mb-0.5 px-2"}>
<span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span className={"text-antiqueGold font-bold"}>f</span><span>g</span><span>h</span>
</div>

<div className={"w-[280px] h-[280px] grid grid-cols-8 grid-rows-8 border-2 border-[#2b251a] relative shadow-inner"}>

<div className={"bg-[#1f1e24] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>8</div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d] relative"}>

<span className={"text-zinc-400 opacity-60 text-lg select-none"}>♜</span>
</div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d] relative flex items-center justify-center"}>

<div className={"absolute inset-0 border border-red-500/60 bg-red-950/40 animate-pulse"}></div>
<span className={"text-2xl text-red-200 drop-shadow-[0_0_8px_rgba(255,50,50,0.8)]"}>♚</span>
<span className={"absolute -top-1 -right-1 text-[8px] bg-crimson-800 text-white font-mono px-1 rounded"}>h8</span>
</div>

<div className={"bg-[#421d1d] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>7</div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>

<div className={"bg-red-950/80 relative flex items-center justify-center border-2 border-dashed border-antiqueGold animate-pulse"}>
<div className={"absolute inset-0 bg-antiqueGold/15"}></div>

<span className={"text-antiqueGold text-lg font-bold"}>⌖</span>
<span className={"absolute bottom-0.5 right-0.5 text-[7px] text-antiqueGold font-bold font-mono"}>f7</span>
</div>
<div className={"bg-[#421d1d]"}>

<span className={"text-zinc-500 flex justify-center items-center text-sm"}>♟</span>
</div>
<div className={"bg-[#1f1e24]"}>

<span className={"text-zinc-500 flex justify-center items-center text-sm"}>♟</span>
</div>

<div className={"bg-[#1f1e24] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>6</div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>

<div className={"bg-[#421d1d] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>5</div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>

<div className={"bg-[#1f1e24] relative flex items-center justify-center"}>
<div className={"absolute inset-0 bg-antiqueGold/25 rounded-sm"}></div>
<span className={"text-2xl text-amber-200 drop-shadow-[0_0_10px_rgba(230,184,105,0.9)] cursor-grab"}>♕</span>
<span className={"absolute -bottom-1 -left-1 text-[7px] bg-antiqueGold text-black font-bold font-mono px-0.5 rounded"}>h5</span>
</div>

<div className={"bg-[#1f1e24] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>4</div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}>

<span className={"text-amber-100/90 text-lg flex items-center justify-center"}>♗</span>
</div>
<div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#421d1d]"}></div>

<div className={"bg-[#421d1d] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>3</div>
<div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div>
<div className={"bg-[#1f1e24] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>2</div>
<div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div>
<div className={"bg-[#421d1d] flex items-center justify-center text-[9px] text-zinc-600 font-mono"}>1</div>
<div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div><div className={"bg-[#421d1d]"}></div><div className={"bg-[#1f1e24]"}></div>

<svg className={"absolute inset-0 w-full h-full pointer-events-none z-10"} viewBox={"0 0 280 280"}>
<defs>
<marker id={"arrowGold"} markerHeight={"6"} markerWidth={"6"} orient={"auto"} refX={"4"} refY={"3"}>
<path d={"M0,0 L0,6 L6,3 z"} fill={"#e5b869"}></path>
</marker>
</defs>

<path d={"M 262 122 L 196 56"} marker-end={"url(#arrowGold)"} stroke={"#e5b869"} strokeDasharray={"4 3"} strokeWidth={"2.5"}></path>
</svg>
</div>

<div className={"w-full text-center mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400"}>
<span className={"text-antiqueGold text-xs"}>👉</span>
<span>拖拽白后至 <strong className={"text-white font-mono bg-white/10 px-1 py-0.2 rounded"}>f7</strong> 处决，或直接勾选下方着法</span>
</div>
</div>
</div>



<div className={"px-5 pt-2"} data-purpose={"move-options-block"}>
<div className={"flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 px-0.5"}>
<span className={"font-medium"}>候选战术着法 (SELECT MOVE):</span>
<button className={"text-antiqueGold hover:underline flex items-center gap-0.5 text-[10px]"} type={"button"}>
<span>💡 锦囊提示 (免费)</span>
</button>
</div>

<div className={"grid grid-cols-3 gap-2"}>

<button className={"relative group p-2 rounded-lg bg-gradient-to-b from-crimson-900/80 to-zinc-900 border-2 border-antiqueGold shadow-[0_0_12px_rgba(229,184,105,0.25)] text-left flex flex-col justify-between transition-all"} type={"button"}>
<div className={"flex items-center justify-between w-full"}>
<span className={"font-serifTitle text-sm font-bold text-amber-200"}>♕ Qf7#</span>
<span className={"w-2 h-2 rounded-full bg-emerald-400"}></span>
</div>
<span className={"text-[9px] text-antiqueGold mt-1 font-sansUI"}>绝杀将死 (正解)</span>
<div className={"absolute -top-1.5 -right-1.5 bg-antiqueGold text-black font-extrabold text-[8px] px-1 rounded-sm shadow"}>
              M1
            </div>
</button>

<button className={"p-2 rounded-lg bg-black/40 border border-white/10 hover:border-zinc-500 text-left flex flex-col justify-between opacity-80 hover:opacity-100 transition-all"} type={"button"}>
<div className={"flex items-center justify-between w-full"}>
<span className={"font-serifTitle text-xs font-semibold text-zinc-300"}>♕ Qh6+</span>
</div>
<span className={"text-[9px] text-zinc-500 mt-1"}>逼和阻滞 (缓着)</span>
</button>

<button className={"p-2 rounded-lg bg-black/40 border border-white/10 hover:border-zinc-500 text-left flex flex-col justify-between opacity-80 hover:opacity-100 transition-all"} type={"button"}>
<div className={"flex items-center justify-between w-full"}>
<span className={"font-serifTitle text-xs font-semibold text-zinc-300"}>♖ Rxd8+</span>
</div>
<span className={"text-[9px] text-zinc-500 mt-1"}>弃车失先 (败着)</span>
</button>
</div>
</div>



<div className={"px-5 pt-3 space-y-2"}>

<div className={"bg-black/50 border border-white/10 rounded-xl p-2.5 flex items-center justify-between"}>
<div className={"flex items-center space-x-3"}>
<div className={"w-8 h-8 rounded-lg bg-crimson-900/60 border border-crimson-glow/40 flex items-center justify-center text-sm shadow-inner"}>
              🩸
            </div>
<div>
<div className={"text-[11px] font-medium text-zinc-200"}>成功挑战通关奖励</div>
<div className={"text-[10px] text-zinc-400 flex items-center space-x-2"}>
<span className={"text-rose-400 font-mono"}>+50 猩红碎晶</span>
<span>•</span>
<span className={"text-antiqueGold font-mono"}>天梯积分 +15</span>
</div>
</div>
</div>
<div className={"text-[10px] text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5"}>
            称号: <span className={"text-zinc-200"}>虚空斩首者</span>
</div>
</div>

<div className={"flex items-center justify-between px-1 text-[11px] text-zinc-400"}>
<div className={"flex items-center space-x-1.5"}>
<span className={"text-zinc-500"}>♟</span>
<span>微信好友已有 <strong className={"text-zinc-200 font-mono"}>18</strong> 人破解 · 平均 4.2秒</span>
</div>

<div className={"flex -space-x-1.5 overflow-hidden"}>
<div className={"inline-block h-4 w-4 rounded-full ring-1 ring-obsidian bg-amber-700 text-[8px] text-center text-white leading-4"}>L</div>
<div className={"inline-block h-4 w-4 rounded-full ring-1 ring-obsidian bg-blue-700 text-[8px] text-center text-white leading-4"}>K</div>
<div className={"inline-block h-4 w-4 rounded-full ring-1 ring-obsidian bg-zinc-700 text-[8px] text-center text-white leading-4"}>W</div>
</div>
</div>
</div>



<footer className={"px-5 pt-4 space-y-2.5"}>

<button className={"w-full py-3 px-4 rounded-xl bg-gradient-to-r from-crimson-900 via-crimson-700 to-crimson-900 border border-antiqueGold/60 text-amber-100 font-serifTitle tracking-widest text-sm font-bold flex items-center justify-center space-x-2 pulse-glow-crimson active:scale-[0.98] transition-transform shadow-lg"} type={"button"}>
<span className={"text-base"}>⚔️</span>
<span>立即确认落子 (EXECUTE MOVE)</span>
</button>

<div className={"grid grid-cols-2 gap-2 text-xs"}>

<button className={"py-2 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 flex items-center justify-center space-x-1 active:scale-95 transition-all"} type={"button"}>
<svg className={"w-3.5 h-3.5 text-zinc-400"} fill={"none"} stroke={"currentColor"} viewBox={"0 0 24 24"}><path d={"M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2"}></path></svg>
<span>重置残局状态</span>
</button>

<button className={"py-2 px-3 rounded-lg bg-[#182a1d]/80 border border-emerald-600/40 hover:bg-[#1f3625] text-emerald-300 flex items-center justify-center space-x-1 active:scale-95 transition-all"} type={"button"}>
<svg className={"w-3.5 h-3.5"} fill={"currentColor"} viewBox={"0 0 24 24"}><path d={"M12 2C6.48 2 2 6.48 2 12c0 2.85 1.2 5.41 3.12 7.24L4.5 22l3.05-.83C9.17 21.72 10.54 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"}></path></svg>
<span>转发微信群 PK</span>
</button>
</div>
</footer>

</section>

</div>


    </div>
  );
}
