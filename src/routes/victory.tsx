import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/victory")({
  head: () => ({
    meta: [
      { title: "Checkmate Execution \u2014 War Council Report" },
      { name: "description", content: "Mythic execution results: rating gain, accuracy and sanguine shards from your ranked duel." },
      { property: "og:title", content: "Checkmate Execution \u2014 War Council Report" },
      { property: "og:description", content: "Mythic execution results: rating gain, accuracy and sanguine shards from your ranked duel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Victory,
});

function Victory() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-24 overflow-hidden relative selection:bg-primary selection:text-on-primary"}>

<div className={"absolute inset-0 pointer-events-none z-10 opacity-60"}>
<svg className={"w-full h-full"} xmlns={"http://www.w3.org/2000/svg"}>
<defs>
<radialGradient cx={"50%"} cy={"35%"} id={"occultVignette"} r={"65%"}>
<stop offset={"0%"} stopColor={"#95001d"} stopOpacity={"0.18"}></stop>
<stop offset={"60%"} stopColor={"#131315"} stopOpacity={"0.4"}></stop>
<stop offset={"100%"} stopColor={"#0e0e10"} stopOpacity={"0.95"}></stop>
</radialGradient>
<filter id={"crimsonGlow"}>
<feGaussianBlur result={"glow"} stdDeviation={"3"}></feGaussianBlur>
<feComposite in={"SourceGraphic"} in2={"glow"} operator={"over"}></feComposite>
</filter>
</defs>
<rect fill={"url(#occultVignette)"} height={"100%"} width={"100%"}></rect>

<line opacity={"0.25"} stroke={"#af8d11"} strokeDasharray={"6,8"} strokeWidth={"0.75"} x1={"50%"} x2={"50%"} y1={"120"} y2={"480"}></line>
<line opacity={"0.25"} stroke={"#af8d11"} strokeDasharray={"6,8"} strokeWidth={"0.75"} x1={"10%"} x2={"90%"} y1={"290"} y2={"290"}></line>
<circle cx={"50%"} cy={"290"} opacity={"0.2"} r={"140"} stroke={"#ffb3ad"} strokeDasharray={"4,6"} strokeWidth={"0.75"}></circle>
</svg>
</div>

<div className={"relative z-20 px-margin-mobile pt-space-sm"}>

<div className={"bg-surface-container-lowest/90 backdrop-blur-md p-space-sm shadow-[0_16px_36px_rgba(0,0,0,0.9)] flex items-center justify-between relative overflow-hidden"}>

<div className={"absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-container via-secondary to-primary-container opacity-50"}></div>

<div className={"flex items-center gap-space-xs min-w-0"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0 relative overflow-hidden"}>
<span className={"material-symbols-outlined text-secondary text-[22px]"}>crown</span>
<div className={"absolute -bottom-1 text-[8px] font-label-sm text-secondary tracking-tighter"}>YOU</div>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-1"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>GM Vane</span>
<span className={"px-1 py-0.2 bg-secondary/15 text-secondary text-[9px] font-label-sm"}>2480</span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>White · Sanguine Hand</span>
</div>
</div>

<div className={"flex flex-col items-center shrink-0 px-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-primary tracking-widest leading-none"}>VS</span>
<span className={"font-label-sm text-label-sm text-error uppercase tracking-widest mt-0.5"}>FINAL BLOW</span>
</div>

<div className={"flex items-center gap-space-xs min-w-0 text-right justify-end"}>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center justify-end gap-1"}>
<span className={"px-1 py-0.2 bg-surface-variant text-on-surface-variant text-[9px] font-label-sm"}>2510</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-widest truncate"}>Lord Cinders</span>
</div>
<span className={"font-body-sm text-body-sm text-on-error uppercase truncate"}>Black · Decapitated</span>
</div>
<div className={"w-10 h-10 bg-error-container/30 flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-error text-[20px]"}>skull</span>
</div>
</div>
</div>

<div className={"mt-space-sm bg-gradient-to-b from-primary-container/40 via-surface-container-low to-surface-container-lowest p-space-md shadow-2xl relative"}>
<div className={"flex flex-col items-center text-center"}>

<div className={"inline-flex items-center gap-space-xs px-space-sm py-0.5 bg-surface-container-highest shadow-inner mb-space-xs"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary animate-ping"}></span>
<span className={"font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary"}>
            MYTHIC EXECUTION // 虚空断罪 · 猩红斩首
          </span>
</div>

<h1 className={"font-headline-xl-mobile text-headline-xl-mobile text-transparent bg-clip-text bg-gradient-to-b from-secondary-fixed via-primary-fixed to-primary tracking-widest uppercase filter drop-shadow-[0_2px_14px_rgba(233,195,73,0.35)]"}>
          CHECKMATE
        </h1>
<div className={"font-headline-sm text-headline-sm text-on-surface-variant tracking-[0.25em] uppercase -mt-1"}>
          胜势将死 · 终局处决裁定
        </div>

<div className={"mt-space-sm inline-flex items-center gap-space-sm px-space-md py-1 bg-surface-container-high/90 shadow-md"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>verified</span>
<span className={"font-label-lg text-label-lg text-on-surface tracking-wider"}>
            Move 38: <strong className={"text-secondary font-semibold"}>♛ Qf7#</strong> · 猩红敕令 绝杀入局
          </span>
<span className={"text-secondary-fixed font-label-md text-label-md px-1.5 py-0.5 bg-secondary-container/50"}>
            EVAL: M0
          </span>
</div>
</div>
</div>
</div>

<div className={"relative z-20 mx-margin-mobile mt-space-md overflow-hidden bg-surface-container-lowest shadow-[0_20px_50px_rgba(0,0,0,0.95)]"}>

<div className={"relative w-full h-[410px] bg-cover bg-center"} data-alt={"Cinematic high fantasy dark art photo of heavy gauntleted knight's black armor hands crushing a glowing crystalline chess king into red explosive rubies and crimson lightning sparks on a cracked marble obsidian chessboard, deep atmospheric occult shadows and glowing embers"} style={{ backgroundImage: "url('/__l5e/assets-v1/936655a1-a5fa-43b9-9916-f88a933b250b/hero-throne.jpg')" }}>

<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"}></div>
<div className={"absolute inset-0 bg-gradient-to-b from-surface-container-lowest/70 via-transparent to-transparent"}></div>

<div className={"absolute top-space-md left-space-md right-space-md flex items-center justify-between pointer-events-none"}>
<div className={"flex items-center gap-1.5 px-space-sm py-1 bg-surface-container-lowest/80 backdrop-blur-md"}>
<span className={"material-symbols-outlined text-secondary text-[16px] animate-pulse"}>slow_motion_video</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>TIME DILATION 0.5x</span>
</div>
<div className={"flex items-center gap-1 px-space-sm py-1 bg-primary-container/80 backdrop-blur-md"}>
<span className={"material-symbols-outlined text-primary-fixed text-[15px]"}>electric_bolt</span>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider"}>1.6S APEX KILL</span>
</div>
</div>

<div className={"absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-space-md"}>

<div className={"w-36 h-36 rounded-full relative flex items-center justify-center"}>
<div className={"absolute inset-0 rounded-full border border-primary/40 animate-spin"} style={{ animationDuration: "20s" }}></div>
<div className={"w-24 h-24 rounded-full border border-secondary/30 flex items-center justify-center"}>
<span className={"material-symbols-outlined text-primary text-[36px] drop-shadow-[0_0_12px_rgba(255,179,173,0.8)]"}>gavel</span>
</div>
</div>
<div className={"mt-space-xs font-label-md text-label-md text-primary-fixed uppercase tracking-[0.25em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"}>
          DECAPITATION COMPLETE // 处决裁定
        </div>
</div>

<div className={"absolute bottom-space-md left-space-md right-space-md bg-surface-container-low/90 backdrop-blur-md p-space-sm"}>
<div className={"flex items-start gap-space-sm"}>
<div className={"w-8 h-8 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>format_quote</span>
</div>
<div className={"flex flex-col min-w-0"}>
<p className={"font-headline-sm text-headline-sm italic text-on-surface leading-snug tracking-wide"}>
              “She doesn’t follow the game. <span className={"text-primary font-semibold not-italic"}>She changes it.</span>”
            </p>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-1"}>
              — The Red Empress of Obsidian Court · Move 38 Archive
            </span>
</div>
</div>
</div>
</div>
</div>

<div className={"relative z-20 px-margin-mobile mt-space-md flex flex-col gap-space-sm"}>

<div className={"flex items-center justify-between px-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>analytics</span>
<span className={"font-label-lg text-label-lg uppercase tracking-wider text-on-surface"}>WAR COUNCIL REPORT · 战后定评</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>RANKED BATTLE</span>
</div>

<div className={"grid grid-cols-3 gap-space-xs"}>

<div className={"bg-surface-container-low p-space-sm flex flex-col items-center text-center shadow-lg relative overflow-hidden"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>RATING</span>
<div className={"flex items-baseline gap-0.5 my-0.5"}>
<span className={"font-headline-md text-headline-md text-secondary"}>+24</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary-fixed uppercase"}>2504 ELO</span>
<div className={"absolute top-0 right-0 w-8 h-8 bg-secondary/10 rounded-bl-full flex items-start justify-end p-1"}>
<span className={"material-symbols-outlined text-secondary text-[12px]"}>trending_up</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-sm flex flex-col items-center text-center shadow-lg relative overflow-hidden"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>ACCURACY</span>
<div className={"flex items-baseline gap-0.5 my-0.5"}>
<span className={"font-headline-md text-headline-md text-primary"}>98.6</span>
<span className={"text-[10px] font-label-sm text-primary"}>%</span>
</div>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>GM ENGINE</span>
<div className={"absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-full flex items-start justify-end p-1"}>
<span className={"material-symbols-outlined text-primary text-[12px]"}>bolt</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-sm flex flex-col items-center text-center shadow-lg relative overflow-hidden"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>SANGUINE</span>
<div className={"flex items-baseline gap-0.5 my-0.5"}>
<span className={"font-headline-md text-headline-md text-secondary-fixed"}>+120</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>SHARDS</span>
<div className={"absolute top-0 right-0 w-8 h-8 bg-secondary-fixed/10 rounded-bl-full flex items-start justify-end p-1"}>
<span className={"material-symbols-outlined text-secondary-fixed text-[12px]"}>diamond</span>
</div>
</div>
</div>

<div className={"bg-surface-container-low p-space-md shadow-xl flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>verified</span>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-wider"}>TACTICAL PURITY // 运筹纯度</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>FLAWLESS MATING</span>
</div>

<div className={"w-full bg-surface-container-highest h-2 flex overflow-hidden"}>
<div className={"bg-primary w-[75%] h-full"} title={"Best moves"}></div>
<div className={"bg-secondary w-[20%] h-full"} title={"Great moves"}></div>
<div className={"bg-surface-variant w-[5%] h-full"} title={"Book moves"}></div>
</div>

<div className={"grid grid-cols-4 gap-space-xs text-center"}>
<div className={"bg-surface-container-high py-1 px-space-xs flex flex-col items-center"}>
<span className={"font-label-sm text-label-sm text-primary uppercase font-bold"}>1</span>
<span className={"text-[9px] font-label-sm text-on-surface-variant uppercase tracking-tighter"}>Brilliant (!!)</span>
</div>
<div className={"bg-surface-container-high py-1 px-space-xs flex flex-col items-center"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-bold"}>14</span>
<span className={"text-[9px] font-label-sm text-on-surface-variant uppercase tracking-tighter"}>Great (!)</span>
</div>
<div className={"bg-surface-container-high py-1 px-space-xs flex flex-col items-center"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase font-bold"}>23</span>
<span className={"text-[9px] font-label-sm text-on-surface-variant uppercase tracking-tighter"}>Best</span>
</div>
<div className={"bg-surface-container-high py-1 px-space-xs flex flex-col items-center"}>
<span className={"font-label-sm text-label-sm text-error uppercase font-bold"}>0</span>
<span className={"text-[9px] font-label-sm text-on-surface-variant uppercase tracking-tighter"}>Blunders</span>
</div>
</div>
</div>
</div>

<div className={"relative z-20 px-margin-mobile mt-space-md"}>
<div className={"bg-surface-container-low p-space-md shadow-xl flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>trophy</span>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-wider"}>CAPTURED SANGUINE PIECES · 猎获遗骸</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary font-semibold"}>+39 MAT</span>
</div>

<div className={"flex items-center justify-between gap-space-xs overflow-x-auto pb-1"}>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-sm py-1 shrink-0"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>chess_queen</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase"}>x1 (9pt)</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-sm py-1 shrink-0"}>
<span className={"material-symbols-outlined text-on-surface-variant text-[18px]"}>chess_rook</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase"}>x2 (10pt)</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-sm py-1 shrink-0"}>
<span className={"material-symbols-outlined text-on-surface-variant text-[18px]"}>chess_bishop</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase"}>x2 (6pt)</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-sm py-1 shrink-0"}>
<span className={"material-symbols-outlined text-on-surface-variant text-[18px]"}>chess_knight</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase"}>x2 (6pt)</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-sm py-1 shrink-0"}>
<span className={"material-symbols-outlined text-on-surface-variant text-[18px]"}>chess_pawn</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase"}>x8 (8pt)</span>
</div>
</div>
</div>
</div>

<div className={"relative z-20 px-margin-mobile mt-space-lg flex flex-col gap-space-sm"}>

<button className={"w-full h-14 bg-gradient-to-r from-primary-container via-inverse-primary to-primary-container text-on-surface flex items-center justify-center gap-space-sm shadow-[0_12px_28px_rgba(139,30,30,0.6)] active:scale-[0.99] transition-transform relative overflow-hidden group"} id={"nextBattleBtn"}>
<div className={"absolute inset-0 bg-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity"}></div>
<span className={"material-symbols-outlined text-secondary text-[24px]"}>swords</span>
<span className={"font-label-lg text-label-lg uppercase tracking-[0.16em] text-on-primary-container"}>
        NEXT CONQUEST · 登临下一场天梯
      </span>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>arrow_forward</span>
</button>

<div className={"grid grid-cols-2 gap-space-sm"}>

<button className={"h-11 bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center gap-space-xs px-space-sm shadow transition-colors"} id={"saveReelBtn"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>videocam</span>
<span className={"font-label-md text-label-md uppercase tracking-wider truncate"}>SAVE CLIMAX REEL</span>
</button>

<button className={"h-11 bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center gap-space-xs px-space-sm shadow transition-colors"} id={"analysisBtn"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>psychology</span>
<span className={"font-label-md text-label-md uppercase tracking-wider truncate"}>POST-GAME REVIEW</span>
</button>
</div>

<div className={"flex items-center justify-center gap-space-xs py-space-xs text-center"}>
<span className={"material-symbols-outlined text-outline text-[14px]"}>lock</span>
<span className={"font-label-sm text-label-sm text-outline uppercase tracking-widest"}>
        FIDE SANGUINE ARCHIVE · TOKEN VERIFIED ON-CHAIN #8492-CHESS
      </span>
</div>
</div>

<div className={"fixed bottom-20 left-4 right-4 z-50 bg-surface-container-lowest/95 backdrop-blur-xl p-space-md shadow-[0_12px_40px_rgba(0,0,0,0.95)] flex items-center justify-between opacity-0 translate-y-4 pointer-events-none transition-all duration-300"} id={"toastNotification"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-8 h-8 bg-primary-container flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>movie</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-wider"}>REEL ENCRYPTED &amp; SAVED</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>4K 60FPS Climax Captured to Vault</span>
</div>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-semibold"}>100% OK</span>
</div>
</div>
</main>
    </div>
  );
}
