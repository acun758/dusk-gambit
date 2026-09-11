import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/codex")({
  head: () => ({
    meta: [
      { title: "Codex of Duels \u2014 Opening Tree" },
      { name: "description", content: "Royal opening archetypes, legendary duels and blind calculation drills with engine annotation." },
      { property: "og:title", content: "Codex of Duels \u2014 Opening Tree" },
      { property: "og:description", content: "Royal opening archetypes, legendary duels and blind calculation drills with engine annotation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Codex,
});

function Codex() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-28 text-on-surface select-none"}>

<section className={"flex flex-col px-margin-mobile pt-space-sm pb-space-md"}>
<div className={"flex items-center gap-space-xs text-primary-fixed mb-space-xs"}>
<span className={"material-symbols-outlined text-[14px]"}>auto_stories</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed"}>HISTORIC DUELS &amp; CODEX // 宗师开局法典</span>
</div>
<h1 className={"font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-wide"}>
      王家开局图谱与史诗名局殿堂
    </h1>

<div className={"flex items-center gap-space-xs mt-space-sm overflow-x-auto no-scrollbar py-0.5"}>
<div className={"flex items-center gap-1 px-space-xs py-0.5 bg-surface-container-high rounded shrink-0 shadow-sm"}>
<span className={"material-symbols-outlined text-[12px] text-secondary"}>menu_book</span>
<span className={"font-label-sm text-label-sm text-secondary tracking-wider"}>847 谱系收录</span>
</div>
<div className={"flex items-center gap-1 px-space-xs py-0.5 bg-surface-container-high rounded shrink-0 shadow-sm"}>
<span className={"material-symbols-outlined text-[12px] text-primary"}>memory</span>
<span className={"font-label-sm text-label-sm text-primary tracking-wider"}>Stockfish 16 标注</span>
</div>
<div className={"flex items-center gap-1 px-space-xs py-0.5 bg-primary-container/60 rounded shrink-0 shadow-sm"}>
<span className={"material-symbols-outlined text-[12px] text-on-primary-container"}>psychology</span>
<span className={"font-label-sm text-label-sm text-on-primary-container tracking-wider"}>大师通感度 74%</span>
</div>
</div>

<div className={"grid grid-cols-3 bg-surface-container-lowest p-1 rounded mt-space-md shadow-inner"}>
<button className={"py-space-xs px-1 text-center bg-surface-container-high shadow-md transition-all"}>
<span className={"block font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider"}>开局谱系</span>
<span className={"block font-label-sm text-[9px] text-secondary/70 tracking-widest"}>OPENING TREE</span>
</button>
<button className={"py-space-xs px-1 text-center text-on-surface-variant hover:text-on-surface transition-all"}>
<span className={"block font-label-sm text-label-sm uppercase tracking-wider"}>传奇历史决斗</span>
<span className={"block font-label-sm text-[9px] text-on-surface-variant/70 tracking-widest"}>DUELS</span>
</button>
<button className={"py-space-xs px-1 text-center text-on-surface-variant hover:text-on-surface transition-all"}>
<span className={"block font-label-sm text-label-sm uppercase tracking-wider"}>盲棋心算</span>
<span className={"block font-label-sm text-[9px] text-on-surface-variant/70 tracking-widest"}>BLIND DRILLS</span>
</button>
</div>
</section>

<section className={"flex flex-col mb-space-md"}>
<div className={"flex items-center justify-between px-margin-mobile mb-space-xs"}>
<span className={"font-label-md text-label-md text-secondary uppercase tracking-widest"}>精选战术宗族 (ACTIVE ARCHETYPES)</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>4 / 12 核心库</span>
</div>
<div className={"flex gap-space-sm px-margin-mobile overflow-x-auto no-scrollbar py-1"}>

<div className={"min-w-[270px] bg-surface-container-high rounded p-space-sm flex flex-col justify-between shadow-xl relative overflow-hidden shrink-0"}>
<div className={"absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"}></div>
<div className={"flex justify-between items-start mb-space-xs relative"}>
<div>
<div className={"flex items-center gap-1.5 mb-1"}>
<span className={"px-1.5 py-0.5 bg-primary-container text-on-primary-container font-label-sm text-[9px] tracking-widest uppercase rounded"}>侵略反击 S+</span>
<span className={"font-label-sm text-[9px] text-secondary tracking-widest"}>锋利度 98%</span>
</div>
<h3 className={"font-headline-sm text-headline-sm text-on-surface tracking-wide"}>西西里 · 纳依道夫</h3>
<p className={"font-label-sm text-[10px] text-on-surface-variant tracking-wider mt-0.5"}>Sicilian Defense: Najdorf</p>
</div>
<div className={"w-8 h-8 bg-surface-container-lowest rounded flex items-center justify-center shadow-md"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>swords</span>
</div>
</div>
<p className={"font-body-sm text-body-sm text-secondary-fixed/90 font-mono tracking-tight bg-surface-container-lowest/80 px-space-xs py-1 rounded my-space-xs truncate"}>
          1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6
        </p>
<div className={"flex items-center justify-between text-on-surface-variant pt-1"}>
<span className={"font-label-sm text-label-sm"}>胜率 54.2%</span>
<div className={"flex items-center gap-1 font-label-sm text-[9px] text-on-surface-variant"}>
<span className={"text-on-surface"}>白 31%</span>
<span>·</span>
<span className={"text-on-surface-variant"}>和 29%</span>
<span>·</span>
<span className={"text-primary-fixed"}>黑 40%</span>
</div>
</div>
</div>

<div className={"min-w-[240px] bg-surface-container rounded p-space-sm flex flex-col justify-between shadow-md shrink-0 opacity-85 hover:opacity-100 transition-opacity"}>
<div>
<div className={"flex items-center gap-1.5 mb-1"}>
<span className={"px-1.5 py-0.5 bg-surface-container-highest text-secondary-fixed font-label-sm text-[9px] tracking-widest uppercase rounded"}>稳健如磐 A+</span>
</div>
<h3 className={"font-headline-sm text-headline-sm text-on-surface tracking-wide"}>后翼弃兵 · 拒吃</h3>
<p className={"font-label-sm text-[10px] text-on-surface-variant tracking-wider mt-0.5"}>Queen's Gambit Declined</p>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant font-mono tracking-tight bg-surface-container-lowest/60 px-space-xs py-1 rounded my-space-xs truncate"}>
          1.d4 d5 2.c4 e6 3.Nc3 Nf6
        </p>
<div className={"flex items-center justify-between text-on-surface-variant pt-1 font-label-sm text-label-sm"}>
<span>胜率 51.0%</span>
<span className={"text-secondary"}>和局率高 48%</span>
</div>
</div>

<div className={"min-w-[240px] bg-surface-container rounded p-space-sm flex flex-col justify-between shadow-md shrink-0 opacity-85 hover:opacity-100 transition-opacity"}>
<div>
<div className={"flex items-center gap-1.5 mb-1"}>
<span className={"px-1.5 py-0.5 bg-surface-container-highest text-secondary-fixed font-label-sm text-[9px] tracking-widest uppercase rounded"}>残局圣杯 S</span>
</div>
<h3 className={"font-headline-sm text-headline-sm text-on-surface tracking-wide"}>西班牙 · 柏林防御</h3>
<p className={"font-label-sm text-[10px] text-on-surface-variant tracking-wider mt-0.5"}>Ruy Lopez: Berlin Wall</p>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant font-mono tracking-tight bg-surface-container-lowest/60 px-space-xs py-1 rounded my-space-xs truncate"}>
          1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6
        </p>
<div className={"flex items-center justify-between text-on-surface-variant pt-1 font-label-sm text-label-sm"}>
<span>胜率 49.5%</span>
<span className={"text-secondary"}>克拉姆尼克盾</span>
</div>
</div>

<div className={"min-w-[240px] bg-surface-container rounded p-space-sm flex flex-col justify-between shadow-md shrink-0 opacity-85 hover:opacity-100 transition-opacity"}>
<div>
<div className={"flex items-center gap-1.5 mb-1"}>
<span className={"px-1.5 py-0.5 bg-primary-container/80 text-on-primary-container font-label-sm text-[9px] tracking-widest uppercase rounded"}>致命狂潮 S+</span>
</div>
<h3 className={"font-headline-sm text-headline-sm text-on-surface tracking-wide"}>王翼印度 · 马德普拉塔</h3>
<p className={"font-label-sm text-[10px] text-on-surface-variant tracking-wider mt-0.5"}>King's Indian: Mar del Plata</p>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant font-mono tracking-tight bg-surface-container-lowest/60 px-space-xs py-1 rounded my-space-xs truncate"}>
          1.d4 Nf6 2.c4 g6 3.Nc3 Bg7
        </p>
<div className={"flex items-center justify-between text-on-surface-variant pt-1 font-label-sm text-label-sm"}>
<span>胜率 53.8%</span>
<span className={"text-primary"}>黑翼风暴</span>
</div>
</div>
</div>
</section>

<section className={"flex flex-col px-margin-mobile mb-space-md"}>
<div className={"bg-surface-container-high rounded p-space-sm shadow-2xl flex flex-col"}>

<div className={"flex items-center justify-between pb-space-xs mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"}></div>
<span className={"font-label-md text-label-md text-secondary tracking-widest uppercase"}>第 6 回合 · 执白抉择点 (MOVE 6)</span>
</div>
<div className={"flex items-center gap-1 px-space-xs py-0.5 bg-surface-container-lowest rounded"}>
<span className={"font-label-sm text-label-sm text-primary font-mono"}>+0.32</span>
<span className={"font-label-sm text-[9px] text-on-surface-variant"}>SF16</span>
</div>
</div>

<div className={"relative w-full aspect-square bg-surface-container-lowest rounded overflow-hidden shadow-2xl flex flex-col justify-between p-1"}>

<div className={"w-full h-full grid grid-cols-8 grid-rows-8 gap-0 rounded overflow-hidden relative"}>

<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♜</div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♝</div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♛</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♚</div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♝</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♜</div>

<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}>♟</div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}>♟</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}>♟</div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}>♟</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}>♟</div>

<div className={"bg-surface-container-lowest bg-primary-container/40 flex items-center justify-center text-primary-fixed text-xs font-serif shadow-inner"}>♟</div> 
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-xs font-serif"}>♟</div> 
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-on-surface-variant/90 text-sm font-serif"}>♞</div> 
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>

<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>

<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-sm font-serif"}>♘</div> 
<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-xs font-serif"}>♙</div> 
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>

<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-sm font-serif"}>♘</div> 
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>

<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-xs font-serif"}>♙</div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-xs font-serif"}>♙</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-xs font-serif"}>♙</div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-xs font-serif"}>♙</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-xs font-serif"}>♙</div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-xs font-serif"}>♙</div>

<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-sm font-serif"}>♖</div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}></div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-sm font-serif"}>♗</div> 
<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-sm font-serif"}>♕</div>
<div className={"bg-surface-container-high flex items-center justify-center text-secondary text-sm font-serif"}>♔</div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-sm font-serif"}>♗</div>
<div className={"bg-surface-container-high flex items-center justify-center"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center text-secondary text-sm font-serif"}>♖</div>

<svg className={"absolute inset-0 w-full h-full pointer-events-none"} fill={"none"} viewBox={"0 0 100 100"}>

<path d={"M 31.25 93.75 L 81.25 43.75"} filter={"drop-shadow(0 0 4px #af8d11)"} stroke={"#e9c349"} strokeLinecap={"round"} strokeWidth={"1.8"}></path>
<polygon fill={"#e9c349"} points={"81.25,43.75 74.5,46.5 78.5,50.5"}></polygon>
<circle cx={"81.25"} cy={"43.75"} fill={"#e9c349"} fill-opacity={"0.25"} r={"4.5"} stroke={"#e9c349"} strokeWidth={"1"}></circle>

<path d={"M 31.25 93.75 L 56.25 68.75"} stroke={"#ffb3ad"} strokeDasharray={"2 2"} strokeLinecap={"round"} strokeWidth={"1.6"}></path>
<circle cx={"56.25"} cy={"68.75"} fill={"#ffb3ad"} fill-opacity={"0.3"} r={"3.5"} stroke={"#ffb3ad"} strokeWidth={"1"}></circle>

<circle className={"animate-ping"} cx={"6.25"} cy={"31.25"} fill={"none"} r={"4"} stroke={"#ffb3ad"} strokeWidth={"1.2"} style={{ transformOrigin: "6.25px 31.25px" }}></circle>
</svg>
</div>

<div className={"flex justify-between px-1 pt-0.5 text-[8px] font-mono text-on-surface-variant/60 uppercase"}>
<span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span>
</div>
</div>

<div className={"flex flex-col gap-space-xs mt-space-sm"}>
<div className={"flex items-center justify-between text-on-surface-variant font-label-sm text-[10px] tracking-wider uppercase mb-0.5"}>
<span>宗师变例推演分支 (RECOMMENDED LINES)</span>
<span className={"text-secondary"}>AI深度: 38半步</span>
</div>

<button className={"w-full text-left bg-surface-container-lowest p-space-xs rounded flex items-center justify-between group shadow-sm hover:bg-surface-container transition-colors"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-2 h-2 rounded-full bg-secondary shadow-sm"}></span>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-body-md text-body-md font-semibold text-secondary"}>6. Bg5</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>经典断头台</span>
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant"}>卡斯帕罗夫与塔尔的屠龙利刃</span>
</div>
</div>
<div className={"flex flex-col items-end shrink-0 pl-1"}>
<span className={"font-label-sm text-label-sm text-secondary font-mono"}>选率 42%</span>
<span className={"font-label-sm text-[9px] text-primary font-mono"}>+0.42 胜势</span>
</div>
</button>

<button className={"w-full text-left bg-surface-container-lowest/70 p-space-xs rounded flex items-center justify-between group hover:bg-surface-container transition-colors"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-2 h-2 rounded-full bg-primary shadow-sm"}></span>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-body-md text-body-md font-semibold text-primary"}>6. Be3</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>英格兰猛攻</span>
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant"}>菲舍尔首创 · 极速 g4-f3 风暴</span>
</div>
</div>
<div className={"flex flex-col items-end shrink-0 pl-1"}>
<span className={"font-label-sm text-label-sm text-on-surface font-mono"}>选率 38%</span>
<span className={"font-label-sm text-[9px] text-on-surface-variant font-mono"}>+0.21 锋利</span>
</div>
</button>

<button className={"w-full text-left bg-surface-container-lowest/40 p-space-xs rounded flex items-center justify-between group hover:bg-surface-container transition-colors"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-2 h-2 rounded-full bg-on-surface-variant/40"}></span>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-body-md text-body-md font-semibold text-on-surface-variant"}>6. h3</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>亚当斯毒箭</span>
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant"}>现代特级大师控制局面的隐秘兵法</span>
</div>
</div>
<div className={"flex flex-col items-end shrink-0 pl-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant font-mono"}>选率 15%</span>
<span className={"font-label-sm text-[9px] text-on-surface-variant font-mono"}>+0.15 平衡</span>
</div>
</button>
</div>

<div className={"mt-space-sm bg-surface-container-lowest p-space-sm rounded shadow-inner flex flex-col gap-1 relative overflow-hidden"}>
<div className={"flex items-center gap-1 text-secondary"}>
<span className={"material-symbols-outlined text-[15px]"}>tips_and_updates</span>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>宗师战略心法 (GRANDMASTER MENTALITY)</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface/90 italic leading-relaxed pt-0.5"}>
          “黑方走 5...a6 剥夺白马与象对 b5 格的控制，准备在后翼展开狂风暴雨般的反击。此变例只属于心跳在 140 依然保持绝对冷酷的行刑者。”
        </p>
<span className={"font-label-sm text-[9px] text-primary-fixed self-end tracking-wider pt-1"}>—— AI 宗师古谱注记 · 卡斯帕罗夫专卷</span>
</div>
</div>
</section>

<section className={"flex flex-col px-margin-mobile mb-space-sm"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-1.5"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>history_edu</span>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-wider"}>穿越时空 · 意念同频</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>TITANS RESONANCE</span>
</div>

<div className={"bg-surface-container-high rounded p-space-sm shadow-xl flex flex-col gap-space-sm relative overflow-hidden"}>
<div className={"flex items-start justify-between"}>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-space-xs mb-1"}>
<span className={"px-1.5 py-0.5 bg-primary-container text-on-primary-container font-label-sm text-[9px] uppercase tracking-widest rounded"}>世纪之战 · 第 6 局</span>
<span className={"font-label-sm text-[9px] text-secondary tracking-widest"}>1972 雷克雅未克</span>
</div>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"}>菲舍尔 vs 斯帕斯基</h4>
<p className={"font-body-sm text-body-sm text-on-surface-variant mt-0.5"}>
            菲舍尔罕见弃用 1.e4 改走 1.c4 后翼弃兵塔尔体系，全场掌声起立的名局。
          </p>
</div>
<div className={"w-12 h-12 rounded bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-md"}>
<span className={"material-symbols-outlined text-secondary text-[26px]"}>workspace_premium</span>
</div>
</div>

<div className={"flex flex-col gap-1 bg-surface-container-lowest p-space-xs rounded"}>
<div className={"flex justify-between items-center font-label-sm text-[10px]"}>
<span className={"text-on-surface"}>意念同频度: 82%</span>
<span className={"text-secondary font-semibold"}>评定: 宗师级同频 (GM SYNC)</span>
</div>
<div className={"w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex"}>
<div className={"h-full bg-secondary w-[82%] rounded-full shadow-[0_0_8px_rgba(233,195,73,0.5)]"}></div>
</div>
<div className={"flex justify-between text-[9px] text-on-surface-variant/70"}>
<span>关键手 41 步复盘</span>
<span>还剩 7 步破局手</span>
</div>
</div>

<button className={"w-full py-space-sm px-space-md bg-surface-container-lowest text-secondary flex items-center justify-center gap-space-xs rounded hover:bg-surface-container transition-all active:scale-[0.98] shadow-md"}>
<span className={"material-symbols-outlined text-[18px]"}>sports_kabaddi</span>
<span className={"font-label-md text-label-md tracking-widest uppercase font-semibold"}>踏入战局 · 亲手重下胜负手 (SYNC HISTORIC MOVE)</span>
</button>
</div>
</section>

<section className={"flex flex-col px-margin-mobile gap-space-xs mt-space-xs"}>

<button className={"w-full py-space-sm px-space-md bg-primary-container text-on-primary-container flex items-center justify-center gap-space-xs rounded shadow-[0_0_24px_rgba(139,30,30,0.45)] hover:brightness-110 active:scale-[0.98] transition-all"}>
<span className={"material-symbols-outlined text-[20px]"}>local_fire_department</span>
<span className={"font-label-lg text-label-lg font-bold tracking-widest uppercase"}>开辟实战对弈训练 (TRAIN AGAINST GM BOT)</span>
</button>

<button className={"w-full py-space-xs px-space-md bg-surface-container-high text-secondary flex items-center justify-center gap-space-xs rounded hover:bg-surface-bright active:scale-[0.98] transition-all"}>
<span className={"material-symbols-outlined text-[18px]"}>psychology_alt</span>
<span className={"font-label-md text-label-md tracking-widest uppercase"}>加入每日开局突击记忆 (MEMORIZE 12 PLIES)</span>
</button>
</section>
</div>
</main><nav className={"fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"} data-active-classes={"text-secondary bg-surface-container-high/60"}><div className={"h-16 px-gutter-mobile flex items-center justify-around"}><a aria-current={"page"} className={"flex flex-col items-center justify-center w-full h-11 transition-colors gap-0.5 text-secondary bg-surface-container-high/60"} data-path={"battle"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>swords</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Battle</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"tactics"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>chess_knight</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Tactics</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"the-vault"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>auto_stories</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Vault</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"dynasty"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>shield</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Dynasty</span></a></div></nav>
    </div>
  );
}
