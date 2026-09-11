import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/crucible")({
  head: () => ({
    meta: [
      { title: 'Blindfold Crucible — Tactics & Mental Calculation' },
      { name: "description", content: 'Train blindfold visualization and mate-finding under pressure in the Tactics Crucible.' },
      { property: "og:title", content: 'Blindfold Crucible — Tactics & Mental Calculation' },
      { property: "og:description", content: 'Train blindfold visualization and mate-finding under pressure in the Tactics Crucible.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Crucible,
});

function Crucible() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen pb-28">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button ariaLabel="Haptics &amp; Audio" className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-28"}>
<section className={"px-margin-mobile pt-space-sm pb-space-xs flex flex-col gap-space-xs bg-surface-container-lowest"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-1.5 bg-primary rotate-45"}></span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed"}>Tactics Crucible // 战术心智试炼</span>
</div>
<div className={"flex items-center gap-1.5 px-space-xs py-0.5 bg-surface-container-high"}>
<span className={"material-symbols-outlined text-primary text-[14px] animate-pulse"}>psychology</span>
<span className={"font-label-sm text-label-sm text-on-surface tracking-wider"}>Depth VII · 6-Ply</span>
</div>
</div>
<div className={"flex gap-1 overflow-x-auto py-1"}>
<button className={"px-space-md py-1.5 bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-[0_0_12px_rgba(139,30,30,0.6)]"}>
<span className={"material-symbols-outlined text-[14px]"}>visibility_off</span>
<span>盲棋心算 Blindfold</span>
</button>
<button className={"px-space-md py-1.5 bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider shrink-0 transition-colors"}>
        极限死斗 Endgame
      </button>
<button className={"px-space-md py-1.5 bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider shrink-0 transition-colors"}>
        残局解谜 Puzzles
      </button>
</div>
<div className={"grid grid-cols-3 gap-1 pt-1"}>
<div className={"flex flex-col bg-surface-container-low p-2"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"}>Streak</span>
<div className={"flex items-baseline gap-1 mt-0.5"}>
<span className={"font-headline-sm text-headline-sm text-secondary"}>14</span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest"}>VICTORIES</span>
</div>
</div>
<div className={"flex flex-col bg-surface-container-low p-2"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"}>Mental Fatigue</span>
<div className={"flex items-baseline gap-1 mt-0.5"}>
<span className={"font-headline-sm text-headline-sm text-primary"}>28%</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>OPTIMAL</span>
</div>
</div>
<div className={"flex flex-col bg-surface-container-low p-2"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant tracking-wider uppercase"}>Target Eval</span>
<div className={"flex items-baseline gap-1 mt-0.5"}>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>+4.2</span>
<span className={"font-label-sm text-label-sm text-primary-fixed"}>CRITICAL</span>
</div>
</div>
</div>
</section>
<div className={"px-margin-mobile py-2 bg-surface-container-lowest"}>
<div className={"bg-surface-container-high p-1 grid grid-cols-3 gap-1"}>
<button className={"py-1 text-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"}>
        全暗脑内模拟
      </button>
<button className={"py-1 text-center font-label-md text-label-md uppercase tracking-wider bg-secondary text-on-secondary shadow-[0_0_10px_rgba(233,195,73,0.3)]"}>
        幽光残影 Glimmer
      </button>
<button className={"py-1 text-center font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"}>
        记谱速记 Notation
      </button>
</div>
</div>
<section className={"px-margin-mobile py-2"}>
<div className={"relative w-full aspect-square bg-surface-container-lowest p-2 shadow-[inset_0_0_40px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden"}>
<div className={"absolute inset-0 bg-[radial-gradient(#201f21_1px,transparent_1px)] [background-size:16px_16px] opacity-40"}></div>
<div className={"absolute -inset-10 bg-primary/5 blur-3xl pointer-events-none"}></div>
<div className={"relative z-10 grid grid-cols-8 grid-rows-8 w-full h-full"}>
<div className={"col-start-1 row-start-1 flex items-center justify-center bg-surface-container-low/40"}>
<span className={"text-on-surface-variant/40 font-label-sm text-label-sm"}>♜</span>
</div>
<div className={"col-start-2 row-start-1 flex items-center justify-center bg-surface-container/30"}></div>
<div className={"col-start-3 row-start-1 flex items-center justify-center bg-surface-container-low/40"}>
<span className={"text-on-surface-variant/40 font-label-sm text-label-sm"}>♝</span>
</div>
<div className={"col-start-4 row-start-1 flex items-center justify-center bg-surface-container/30"}></div>
<div className={"col-start-5 row-start-1 flex items-center justify-center bg-surface-container-low/40"}>
<span className={"text-on-surface-variant/70 font-label-sm text-label-sm"}>♚</span>
</div>
<div className={"col-start-6 row-start-1 flex items-center justify-center bg-surface-container/30"}></div>
<div className={"col-start-7 row-start-1 flex items-center justify-center bg-surface-container-low/40"}></div>
<div className={"col-start-8 row-start-1 flex items-center justify-center bg-surface-container/30"}>
<span className={"text-on-surface-variant/40 font-label-sm text-label-sm"}>♜</span>
</div>
<div className={"col-start-1 row-start-2 col-span-8 grid grid-cols-8"}>
<div className={"flex items-center justify-center"}><span className={"text-on-surface-variant/30 font-label-sm text-label-sm"}>♟</span></div>
<div className={"flex items-center justify-center"}></div>
<div className={"flex items-center justify-center"}><span className={"text-on-surface-variant/30 font-label-sm text-label-sm"}>♟</span></div>
<div className={"flex items-center justify-center"}></div>
<div className={"flex items-center justify-center"}></div>
<div className={"flex items-center justify-center"}><span className={"text-on-surface-variant/30 font-label-sm text-label-sm"}>♟</span></div>
<div className={"flex items-center justify-center"}><span className={"text-on-surface-variant/30 font-label-sm text-label-sm"}>♟</span></div>
<div className={"flex items-center justify-center"}></div>
</div>
<div className={"col-start-4 row-start-4 flex items-center justify-center bg-primary-container/20"}>
<span className={"material-symbols-outlined text-primary text-[18px] opacity-80 animate-pulse"}>adjust</span>
</div>
<div className={"col-start-6 row-start-4 flex items-center justify-center bg-secondary-container/20"}>
<span className={"text-secondary font-label-md text-label-md"}>♞ d5</span>
</div>
<div className={"col-start-6 row-start-5 flex items-center justify-center"}>
<div className={"w-2 h-2 rounded-full bg-secondary/60"}></div>
</div>
<div className={"col-start-7 row-start-5 flex items-center justify-center"}>
<span className={"text-primary-fixed/50 font-label-sm text-label-sm"}>♙ f3</span>
</div>
<div className={"col-start-8 row-start-7 relative flex items-center justify-center bg-error-container/40 shadow-[0_0_18px_rgba(147,0,10,0.8)]"}>
<div className={"absolute inset-0 bg-primary/20 animate-ping"}></div>
<div className={"relative flex flex-col items-center"}>
<span className={"text-primary font-headline-sm text-headline-sm font-bold"}>♞</span>
<span className={"font-label-sm text-label-sm text-primary uppercase"}>h2!!</span>
</div>
</div>
<div className={"col-start-7 row-start-8 flex items-center justify-center bg-surface-container-highest"}>
<div className={"flex flex-col items-center"}>
<span className={"text-secondary font-headline-sm text-headline-sm"}>♔</span>
<span className={"font-label-sm text-label-sm text-secondary"}>g1 [CHECK]</span>
</div>
</div>
<div className={"col-start-8 row-start-8 flex items-center justify-center bg-surface-container-low/40"}>
<span className={"text-on-surface-variant/30 font-label-sm text-label-sm"}>♖ h1</span>
</div>
</div>
<svg className={"absolute inset-0 w-full h-full pointer-events-none z-20"} viewBox="0 0 320 320">
<defs>
<linearGradient id="bloodGlow" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#e9c349" stopOpacity="0.8" />
<stop offset="100%" stopColor="#ffb3ad" stopOpacity="0.9" />
</linearGradient>
<marker id="arrow" markerHeight="6" markerWidth="6" orient="auto-start-reverse" refX="5" refY="5" viewBox="0 0 10 10">
<path d="M 0 0 L 10 5 L 0 10 z" fill="#ffb3ad" />
</marker>
</defs>
<line markerEnd="url(#arrow)" stroke="url(#bloodGlow)" strokeDasharray="4 3" strokeWidth="2.5" x1="220" x2="300" y1="140" y2="250" />
<circle cx="220" cy="140" fill="#e9c349" r="4" />
</svg>
<div className={"relative z-30 bg-surface-container-lowest/90 backdrop-blur-md p-2 flex flex-col gap-1 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm text-primary tracking-widest uppercase flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[13px]"}>warning</span>
            King Under Siege // 王翼死线突围
          </span>
<span className={"font-label-sm text-label-sm text-secondary"}>16... Nxh2!!</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface leading-snug"}>
          黑方强袭 h2 孤注一掷！心算白方在 3 步（6半步）内唯一反制胜负手，击溃对手弃子陷阱。
        </p>
</div>
</div>
</section>
<section className={"px-margin-mobile py-1"}>
<div className={"bg-surface-container-low p-2.5 flex items-center gap-space-sm shadow-[0_8px_20px_rgba(0,0,0,0.6)]"}>
<div className={"w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[20px] animate-pulse"}>graphic_eq</span>
</div>
<div className={"flex flex-col min-w-0 flex-1"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-wider"}>Grandmaster Voice Audio</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>00:03 / 00:06</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface truncate mt-0.5"}>
          「Knight takes h2, check. Reconstruct your sanctuary in deep silence.」
        </p>
</div>
<div className={"flex items-center gap-0.5 h-5 shrink-0 px-1"}>
<div className={"w-1 bg-secondary animate-pulse h-3"}></div>
<div className={"w-1 bg-primary animate-pulse h-5"}></div>
<div className={"w-1 bg-secondary animate-pulse h-2"}></div>
<div className={"w-1 bg-primary-fixed animate-pulse h-4"}></div>
<div className={"w-1 bg-secondary animate-pulse h-1"}></div>
</div>
</div>
</section>
<section className={"px-margin-mobile py-1 flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between bg-surface-container-lowest p-2"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"flex items-center gap-1"}>
<span className={"material-symbols-outlined text-primary text-[18px] animate-pulse"}>favorite</span>
<span className={"font-label-md text-label-md text-primary"}>118 BPM</span>
</div>
<span className={"w-1 h-1 rounded-full bg-surface-container-highest"}></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>Cortisol Under Check</span>
</div>
<div className={"flex items-center gap-1.5 px-2 py-0.5 bg-error-container/30"}>
<span className={"material-symbols-outlined text-error text-[14px]"}>timer</span>
<span className={"font-headline-sm text-headline-sm text-error font-semibold tracking-wider"}>00:43</span>
</div>
</div>
<div className={"bg-surface-container-low p-2.5 flex flex-col gap-2"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"}>
          Mental Path Selector // 脑内推演分支
        </span>
<button className={"flex items-center gap-1 text-secondary hover:text-secondary-fixed text-label-sm font-label-sm uppercase tracking-wider"}>
<span className={"material-symbols-outlined text-[14px]"}>account_tree</span>
<span>Scratchpad (0/3)</span>
</button>
</div>
<div className={"grid grid-cols-4 gap-1.5"} id="move-selector">
<button className={"move-option py-2 px-1 bg-surface-container flex flex-col items-center justify-center transition-colors"} onclick="selectMove(this)">
<span className={"font-headline-sm text-headline-sm text-on-surface"}>17. Kxh2</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase mt-0.5"}>King Takes</span>
</button>
<button className={"move-option py-2 px-1 bg-surface-container flex flex-col items-center justify-center transition-colors"} onclick="selectMove(this)">
<span className={"font-headline-sm text-headline-sm text-on-surface"}>17. Kh1</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase mt-0.5"}>Retreat</span>
</button>
<button className={"move-option py-2 px-1 bg-surface-container flex flex-col items-center justify-center transition-colors"} onclick="selectMove(this)">
<span className={"font-headline-sm text-headline-sm text-on-surface"}>17. g3</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase mt-0.5"}>Shield</span>
</button>
<button className={"move-option py-2 px-1 bg-surface-container flex flex-col items-center justify-center transition-colors active-chip bg-primary-container text-on-primary-container"} onclick="selectMove(this)">
<span className={"font-headline-sm text-headline-sm text-primary"}>17. Ng5!</span>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase mt-0.5"}>Counter</span>
</button>
</div>
</div>
</section>
<section className={"px-margin-mobile pt-2 flex flex-col gap-2"}>
<button className={"w-full py-3 bg-gradient-to-r from-primary-container via-error-container to-secondary-container text-on-surface flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(139,30,30,0.85)] active:scale-[0.99] transition-transform"}>
<span className={"material-symbols-outlined text-secondary text-[22px]"}>swords</span>
<span className={"font-label-lg text-label-lg uppercase tracking-widest text-on-surface font-bold"}>
        确认心算落子 // Execute Mental Move
      </span>
</button>
<div className={"flex items-center justify-between px-1"}>
<button className={"flex items-center gap-1.5 py-1.5 text-on-surface-variant hover:text-secondary transition-colors"}>
<span className={"material-symbols-outlined text-[18px]"}>psychology_alt</span>
<span className={"font-label-md text-label-md uppercase tracking-wider"}>放弃并查看思维投影 (Reveal Mind Phantom)</span>
</button>
<div className={"flex items-center gap-1 text-on-surface-variant"}>
<span className={"material-symbols-outlined text-[16px]"}>help</span>
<span className={"font-label-sm text-label-sm"}>Blindfold Depth: +15 Elo</span>
</div>
</div>
</section>
</div>
</main><nav className={"fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"} dataActiveClasses="text-secondary bg-surface-container-high/60"><div className={"h-16 px-gutter-mobile flex items-center justify-around"}><a ariaCurrent="page" className={"flex flex-col items-center justify-center w-full h-11 transition-colors gap-0.5 text-secondary bg-surface-container-high/60"} dataPath="battle" href="#"><span className={"material-symbols-outlined text-[20px]"}>swords</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Battle</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} dataPath="tactics" href="#"><span className={"material-symbols-outlined text-[20px]"}>chess_knight</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Tactics</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} dataPath="the-vault" href="#"><span className={"material-symbols-outlined text-[20px]"}>auto_stories</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Vault</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} dataPath="dynasty" href="#"><span className={"material-symbols-outlined text-[20px]"}>shield</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Dynasty</span></a></div></nav>
    </div>
  );
}
