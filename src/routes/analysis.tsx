import { createFileRoute } from "@tanstack/react-router";
import { DuelPanel } from "@/components/DuelPanel";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "对局复盘 · 心智与心率 | Match Analysis" },
      { name: "description", content: "Ply-by-ply precision, advantage swing and heart-rate correlation from the decisive duel." },
      { property: "og:title", content: "对局复盘 · 心智与心率 | Match Analysis" },
      { property: "og:description", content: "Ply-by-ply precision, advantage swing and heart-rate correlation from the decisive duel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analysis,
});

function Analysis() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>天梯 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>宗师</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider"}>对局复盘</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"w-full lg:flex lg:items-start lg:gap-space-lg"}><div className={"flex flex-col w-full min-w-0 pb-[8.5rem] lg:pb-space-lg"}>

<div className={"px-margin-mobile pt-space-sm"}>
<div className={"bg-surface-container-low rounded-xl p-space-md shadow-[0_16px_36px_rgba(0,0,0,0.85)] relative overflow-hidden"}>
<div className={"absolute -right-10 -top-10 w-44 h-44 rounded-full bg-primary-container/20 blur-3xl pointer-events-none"}></div>
<div className={"absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none"}></div>

<div className={"flex items-center justify-between gap-space-sm mb-space-sm"}>
<div className={"flex items-center gap-space-xs bg-surface-container px-space-sm py-0.5 rounded-full"}>
<span className={"w-2 h-2 rounded-full bg-secondary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>宗师殿堂赛事</span>
</div>
<div className={"flex items-center gap-1 text-primary"}>
<span className={"material-symbols-outlined text-[16px]"}>verified</span>
<span className={"font-label-md text-label-md uppercase tracking-wider text-primary"}>决胜将杀</span>
</div>
</div>

<div className={"grid grid-cols-2 gap-space-sm items-center py-space-xs"}>

<div className={"flex flex-col"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>crown</span>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>GM Vane</span>
</div>
<div className={"flex items-center gap-2 mt-0.5"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>ELO 2504</span>
<span className={"px-1.5 py-0.2 bg-primary-container/40 text-primary font-label-sm text-label-sm rounded"}>白方</span>
</div>
<div className={"mt-space-sm flex items-baseline gap-1"}>
<span className={"font-headline-lg-mobile text-headline-lg-mobile text-secondary font-bold"}>98.6<span className={"text-xs font-normal text-on-surface-variant"}>%</span></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant tracking-wider"}>精准率</span>
</div>
</div>

<div className={"flex flex-col text-right items-end"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>Lord Cinders</span>
<span className={"material-symbols-outlined text-outline text-[18px]"}>shield</span>
</div>
<div className={"flex items-center gap-2 mt-0.5"}>
<span className={"px-1.5 py-0.2 bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm rounded"}>黑方</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>ELO 2510</span>
</div>
<div className={"mt-space-sm flex items-baseline gap-1"}>
<span className={"font-headline-lg-mobile text-headline-lg-mobile text-outline font-bold"}>79.4<span className={"text-xs font-normal text-outline-variant"}>%</span></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant tracking-wider"}>精准率</span>
</div>
</div>
</div>

<div className={"mt-space-sm pt-space-sm bg-surface-container-lowest/70 p-space-sm rounded-lg flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[20px]"}>skull</span>
<span className={"font-label-md text-label-md uppercase tracking-wider text-on-surface"}>第 38 手 Rxf7# · 处决完成</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest font-semibold"}>+18.4 ELO</span>
</div>
</div>
</div>

<div className={"px-margin-mobile mt-space-lg"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[20px]"}>monitor_heart</span>
<h2 className={"font-headline-sm text-headline-sm uppercase text-on-surface tracking-wider"}>心智波动与心率图谱</h2>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>已追踪 38 手</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant mb-space-sm"}>
      逐手关联心率峰值、30 秒以内的读秒时长与局势优势摆动。
    </p>

<div className={"bg-surface-container-low rounded-xl p-space-md relative overflow-hidden shadow-[0_12px_28px_rgba(0,0,0,0.8)]"}>

<div className={"flex flex-wrap items-center justify-between gap-2 pb-space-sm"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"flex items-center gap-1"}>
<span className={"w-2.5 h-0.5 bg-secondary"}></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>优势 (+M)</span>
</div>
<div className={"flex items-center gap-1"}>
<span className={"w-2.5 h-0.5 bg-primary"}></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>心率 BPM（峰值 142）</span>
</div>
</div>
<span className={"font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded"}>0 次漏着 · 1 次不精确</span>
</div>

<div className={"relative w-full h-48 my-space-xs"}>
<svg className={"w-full h-full overflow-visible"} preserveAspectRatio={"none"} viewBox={"0 0 340 180"}>
<defs>
<linearGradient id={"bloodGlow"} x1={"0"} x2={"0"} y1={"0"} y2={"1"}>
<stop offset={"0%"} stopColor={"#ffb3ad"} stopOpacity={"0.35"}></stop>
<stop offset={"100%"} stopColor={"#8b1e1e"} stopOpacity={"0"}></stop>
</linearGradient>
<linearGradient id={"goldGlow"} x1={"0"} x2={"0"} y1={"0"} y2={"1"}>
<stop offset={"0%"} stopColor={"#e9c349"} stopOpacity={"0.3"}></stop>
<stop offset={"100%"} stopColor={"#af8d11"} stopOpacity={"0"}></stop>
</linearGradient>
</defs>

<line stroke={"#353437"} strokeDasharray={"3 3"} strokeWidth={"1"} x1={"0"} x2={"340"} y1={"90"} y2={"90"}></line>
<line stroke={"#201f21"} strokeWidth={"1"} x1={"0"} x2={"340"} y1={"40"} y2={"40"}></line>
<line stroke={"#201f21"} strokeWidth={"1"} x1={"0"} x2={"340"} y1={"140"} y2={"140"}></line>

<polygon fill={"url(#goldGlow)"} points={"0,95 24,92 55,90 85,115 110,128 135,110 160,82 195,68 230,55 260,78 285,34 320,15 340,10 340,180 0,180"}></polygon>

<polyline fill={"none"} points={"0,95 24,92 55,90 85,115 110,128 135,110 160,82 195,68 230,55 260,78 285,34 320,15 340,10"} stroke={"#e9c349"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2.5"}></polyline>

<polyline fill={"none"} points={"0,130 30,125 70,122 105,80 120,62 135,95 170,110 200,105 240,95 270,115 285,55 310,48 340,42"} stroke={"#ffb3ad"} strokeDasharray={"4 2"} strokeLinecap={"round"} strokeWidth={"1.8"}></polyline>

<line opacity={"0.75"} stroke={"#ffb3ad"} strokeDasharray={"2 2"} strokeWidth={"1"} x1={"110"} x2={"110"} y1={"20"} y2={"160"}></line>
<circle cx={"110"} cy={"128"} fill={"#8b1e1e"} r={"4.5"} stroke={"#ffb3ad"} strokeWidth={"2"}></circle>

<line opacity={"0.75"} stroke={"#e9c349"} strokeDasharray={"2 2"} strokeWidth={"1"} x1={"285"} x2={"285"} y1={"15"} y2={"160"}></line>
<circle cx={"285"} cy={"34"} fill={"#af8d11"} r={"5"} stroke={"#e9c349"} strokeWidth={"2"}></circle>

<circle cx={"340"} cy={"10"} fill={"#ffb3ad"} r={"5"} stroke={"#680109"} strokeWidth={"2"}></circle>
</svg>

<div className={"absolute left-6 top-6 bg-surface-container-highest/95 p-space-xs rounded shadow-lg max-w-[140px] pointer-events-none"}>
<span className={"font-label-sm text-label-sm text-primary flex items-center gap-1 font-bold"}>
<span className={"material-symbols-outlined text-[12px]"}>warning</span> 第 18 手 • 心态波动
          </span>
<p className={"font-body-sm text-[11px] text-on-surface-variant leading-tight mt-0.5"}>心率 138 • 犹豫 3分42秒</p>
</div>
<div className={"absolute right-4 bottom-8 bg-surface-container-highest/95 p-space-xs rounded shadow-lg max-w-[150px] pointer-events-none text-right"}>
<span className={"font-label-sm text-label-sm text-secondary flex items-center justify-end gap-1 font-bold"}>
            第 34 手 • !! 妙着 <span className={"material-symbols-outlined text-[12px]"}>auto_awesome</span>
</span>
<p className={"font-body-sm text-[11px] text-on-surface leading-tight mt-0.5"}>34...Nh3+ 弃子破阵</p>
</div>
</div>

<div className={"grid grid-cols-3 gap-space-xs mt-space-sm pt-space-xs bg-surface-container p-space-xs rounded-lg"}>
<button className={"flex flex-col p-1.5 bg-surface-container-high hover:bg-surface-bright rounded text-left transition-all"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>第18手 · 波动</span>
<span className={"font-headline-sm text-[14px] text-primary font-semibold"}>18...exd4?</span>
</button>
<button className={"flex flex-col p-1.5 bg-surface-container-high hover:bg-surface-bright rounded text-left transition-all"}>
<span className={"font-label-sm text-label-sm text-secondary"}>第34手 · 转折</span>
<span className={"font-headline-sm text-[14px] text-secondary font-semibold"}>34. Nh3!!</span>
</button>
<button className={"flex flex-col p-1.5 bg-surface-container-high hover:bg-surface-bright rounded text-left transition-all"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>第38手 · 将杀</span>
<span className={"font-headline-sm text-[14px] text-primary-fixed font-semibold"}>38. Rxf7#</span>
</button>
</div>
</div>
</div>

<div className={"px-margin-mobile mt-space-lg"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>psychology</span>
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>宗师心智原型</h2>
</div>
<span className={"font-label-sm text-label-sm text-secondary"}>评级：S+</span>
</div>

<div className={"bg-surface-container-low rounded-xl p-space-md shadow-[0_12px_28px_rgba(0,0,0,0.8)] relative"}>

<div className={"p-space-sm bg-gradient-to-r from-primary-container/30 via-surface-container to-surface-container-high rounded-lg mb-space-md flex items-center gap-space-sm"}>
<div className={"w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-primary text-[22px]"}>colorize</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm text-primary font-bold"}>心智诊断</span>
<h3 className={"font-headline-sm text-headline-sm text-on-surface"}>冷血终结者</h3>
<p className={"font-body-sm text-body-sm text-on-surface-variant"}>一旦形成子力优势，转化胜势的本能极强，几乎不给对手喘息机会。</p>
</div>
</div>

<div className={"relative w-full flex items-center justify-center py-space-xs"}>
<svg className={"w-64 h-56 overflow-visible"} viewBox={"0 0 280 240"}>

<polygon fill={"none"} points={"140,20 230,70 230,170 140,220 50,170 50,70"} stroke={"#353437"} strokeWidth={"1"}></polygon>
<polygon fill={"none"} points={"140,50 200,83 200,150 140,183 80,150 80,83"} stroke={"#2a2a2c"} strokeWidth={"1"}></polygon>
<polygon fill={"none"} points={"140,80 170,97 170,130 140,147 110,130 110,97"} stroke={"#201f21"} strokeWidth={"1"}></polygon>

<line stroke={"#353437"} strokeWidth={"1"} x1={"140"} x2={"140"} y1={"120"} y2={"20"}></line>
<line stroke={"#353437"} strokeWidth={"1"} x1={"140"} x2={"230"} y1={"120"} y2={"70"}></line>
<line stroke={"#353437"} strokeWidth={"1"} x1={"140"} x2={"230"} y1={"120"} y2={"170"}></line>
<line stroke={"#353437"} strokeWidth={"1"} x1={"140"} x2={"140"} y1={"120"} y2={"220"}></line>
<line stroke={"#353437"} strokeWidth={"1"} x1={"140"} x2={"50"} y1={"120"} y2={"170"}></line>
<line stroke={"#353437"} strokeWidth={"1"} x1={"140"} x2={"50"} y1={"120"} y2={"70"}></line>


<polygon fill={"rgba(233, 195, 73, 0.22)"} points={"140,24 223,74 228,168 140,211 58,165 54,73"} stroke={"#e9c349"} strokeWidth={"2.2"}></polygon>

<circle cx={"140"} cy={"24"} fill={"#ffe088"} r={"3.5"}></circle>
<circle cx={"223"} cy={"74"} fill={"#ffe088"} r={"3.5"}></circle>
<circle cx={"228"} cy={"168"} fill={"#ffe088"} r={"3.5"}></circle>
<circle cx={"140"} cy={"211"} fill={"#ffe088"} r={"3.5"}></circle>
<circle cx={"58"} cy={"165"} fill={"#ffe088"} r={"3.5"}></circle>
<circle cx={"54"} cy={"73"} fill={"#ffe088"} r={"3.5"}></circle>

<text fill={"#e5e1e4"} fontFamily={"Geist"} fontSize={"10"} fontWeight={"600"} textAnchor={"middle"} x={"140"} y={"10"}>CALCULATION 96</text>
<text fill={"#e5e1e4"} fontFamily={"Geist"} fontSize={"10"} fontWeight={"600"} textAnchor={"start"} x={"245"} y={"70"}>STRATEGY 92</text>
<text fill={"#e5e1e4"} fontFamily={"Geist"} fontSize={"10"} fontWeight={"600"} textAnchor={"start"} x={"240"} y={"176"}>ENDGAME 98</text>
<text fill={"#e5e1e4"} fontFamily={"Geist"} fontSize={"10"} fontWeight={"600"} textAnchor={"middle"} x={"140"} y={"235"}>RESILIENCE 91</text>
<text fill={"#e5e1e4"} fontFamily={"Geist"} fontSize={"10"} fontWeight={"600"} textAnchor={"end"} x={"35"} y={"176"}>PRESSURE 88</text>
<text fill={"#e5e1e4"} fontFamily={"Geist"} fontSize={"10"} fontWeight={"600"} textAnchor={"end"} x={"35"} y={"70"}>AGGRESSION 95</text>
</svg>
</div>

<div className={"grid grid-cols-2 gap-space-xs mt-space-sm"}>
<div className={"flex items-center justify-between bg-surface-container p-space-xs rounded"}>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Calculation Depth</span>
<span className={"font-label-md text-label-md text-secondary font-bold"}>14.2 Plies Avg</span>
</div>
<div className={"flex items-center justify-between bg-surface-container p-space-xs rounded"}>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Endgame Conversion</span>
<span className={"font-label-md text-label-md text-secondary font-bold"}>99.1% Sharp</span>
</div>
</div>
</div>
</div>

<div className={"px-margin-mobile mt-space-lg"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[20px]"}>draw</span>
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>宗师红笔批注</h2>
</div>
<span className={"font-label-sm text-label-sm text-primary"}>深度辅导</span>
</div>

<div className={"bg-surface-container-low rounded-xl p-space-md mb-space-sm shadow-[0_12px_28px_rgba(0,0,0,0.8)] relative"}>
<div className={"flex items-start justify-between gap-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-6 h-6 rounded bg-primary-container/60 text-primary flex items-center justify-center font-label-sm font-bold"}>28</span>
<span className={"font-label-md text-label-md text-on-surface font-bold"}>认知疏漏与盲点</span>
</div>
<span className={"font-label-sm text-label-sm text-primary bg-primary-container/30 px-2 py-0.5 rounded"}>耗时：4分12秒</span>
</div>
<div className={"mt-space-sm bg-surface-container p-space-sm rounded-lg flex gap-space-sm"}>

<div className={"w-16 h-16 rounded overflow-hidden shrink-0 bg-surface-container-highest relative"}>
<img className={"w-full h-full object-cover"} data-alt={"Tactical chess diagram zoom on square c4 and d6 showing a black knight preparing an outpost jump, gothic dark wood carved pieces with subtle crimson highlights"} src={"/__l5e/assets-v1/96567e8b-b65b-4651-af12-7edcd6ee63b0/review-board.jpg"} />
<div className={"absolute inset-0 bg-primary/20 mix-blend-color-dodge"}></div>
</div>
<div className={"flex flex-col justify-center"}>
<span className={"font-label-sm text-label-sm text-secondary font-semibold"}>漏算的威胁方向</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2"}>
            28...Qc7 让黑马未经争夺就在 d5 建立了中央前哨。
          </p>
</div>
</div>
<div className={"mt-space-sm pl-space-sm bg-surface-container-lowest/80 p-space-sm rounded border-l-0"}>
<div className={"flex items-center gap-1 text-primary-fixed mb-1"}>
<span className={"material-symbols-outlined text-[16px]"}>psychology_alt</span>
<span className={"font-label-sm text-label-sm font-bold"}>心智教练评估：</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface leading-relaxed"}>
          “第 28 手你的耗时骤增，注意力停留在王翼，进入战术隧道视野，忽略了黑马向 d5 的枢纽。快节奏对局中，这类犹豫会给对手反击窗口。”
        </p>
</div>
</div>

<div className={"bg-surface-container-low rounded-xl p-space-md shadow-[0_12px_28px_rgba(0,0,0,0.8)] relative"}>
<div className={"flex items-start justify-between gap-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-6 h-6 rounded bg-secondary-container/60 text-secondary flex items-center justify-center font-label-sm font-bold"}>34</span>
<span className={"font-label-md text-label-md text-on-surface font-bold"}>冷血一击</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-2 py-0.5 rounded"}>引擎评估：+M5</span>
</div>
<div className={"mt-space-sm bg-surface-container p-space-sm rounded-lg flex gap-space-sm"}>
<div className={"w-16 h-16 rounded overflow-hidden shrink-0 bg-surface-container-highest relative"}>
<img className={"w-full h-full object-cover"} data-alt={"Grandmaster chess sacrifice position, illuminated black rook under divine golden spotlight, chessboard in dark obsidian court with glowing ember edges"} src={"/__l5e/assets-v1/512864e6-ef6d-48cb-92db-9ce4af25bb06/match-arena.jpg"} />
<div className={"absolute inset-0 bg-secondary/15 mix-blend-color-dodge"}></div>
</div>
<div className={"flex flex-col justify-center"}>
<span className={"font-label-sm text-label-sm text-secondary font-semibold"}>34. Nh3!! 宗师示范</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2"}>
            在剩余不足 45 秒时，以安静的腾挪弃子击碎黑方堡垒。
          </p>
</div>
</div>
<div className={"mt-space-sm pl-space-sm bg-surface-container-lowest/80 p-space-sm rounded"}>
<div className={"flex items-center gap-1 text-secondary-fixed mb-1"}>
<span className={"material-symbols-outlined text-[16px]"}>military_tech</span>
<span className={"font-label-sm text-label-sm font-bold"}>心理胜利：</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface leading-relaxed"}>
          “临界压力下的勇气堪称典范。虽然时间急剧减少，你在突破前将心率从 138 降至 92，并把对手的松懈转化成了武器。”
        </p>
</div>
</div>
</div>

<div className={"px-margin-mobile mt-space-lg mb-space-md"}>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold block mb-space-xs"}>
      进阶与再训练
    </span>
<div className={"flex flex-col gap-space-sm"}>

<button className={"w-full bg-primary-container hover:bg-primary-container/90 text-on-primary-container font-label-lg text-label-lg uppercase tracking-widest py-space-md px-space-md rounded-lg flex items-center justify-between shadow-[0_8px_24px_rgba(139,30,30,0.6)] active:scale-[0.98] transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<span className={"material-symbols-outlined text-[22px]"}>replay</span>
<span className={"font-bold"}>回到第 28 手尝试其他走法</span>
</div>
<span className={"material-symbols-outlined text-[20px]"}>chevron_right</span>
</button>

<button className={"w-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg text-label-lg uppercase tracking-wider py-space-md px-space-md rounded-lg flex items-center justify-between shadow-md active:scale-[0.98] transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<span className={"material-symbols-outlined text-secondary text-[22px]"}>bookmark_add</span>
<span>加入个人弱点牌组</span>
</div>
<span className={"font-label-sm text-label-sm bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold"}>+1 张</span>
</button>

<div className={"grid grid-cols-2 gap-space-sm"}>
<button className={"bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider py-space-sm px-space-sm rounded-lg flex items-center justify-center gap-space-xs transition-all"}>
<span className={"material-symbols-outlined text-[18px]"}>terminal</span>
<span>导出棋谱</span>
</button>
<button className={"bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider py-space-sm px-space-sm rounded-lg flex items-center justify-center gap-space-xs transition-all"}>
<span className={"material-symbols-outlined text-[18px]"}>picture_as_pdf</span>
<span>复盘 PDF</span>
</button>
</div>
</div>
</div>
</div>
<DuelPanel variant="review" />
</div></main>
    </div>
  );
}
