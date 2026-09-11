import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/forge/$id")({
  head: () => ({
    meta: [
      { title: "Forge Studio \u2014 Blood Sovereign" },
      { name: "description", content: "Tune bloom intensity, ember fallout and crest runes on your ancestral chess relic." },
      { property: "og:title", content: "Forge Studio \u2014 Blood Sovereign" },
      { property: "og:description", content: "Tune bloom intensity, ember fallout and crest runes on your ancestral chess relic." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgeStudio,
});

function ForgeStudio() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full text-on-surface select-none pb-24"}>

<header className={"sticky top-0 z-40 w-full px-margin-mobile py-space-sm bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.85)]"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<button aria-label={"\u8fd4\u56de\u4e0a\u7ea7"} className={"w-9 h-9 flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors"}>
<span className={"material-symbols-outlined text-[20px]"}>arrow_back</span>
</button>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>Forge Studio // 001</span>
<span className={"w-1.5 h-1.5 rounded-full bg-primary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider"}>Ancestral Relic</span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate tracking-wider"}>猩红女帝 · 永夜王权</span>
</div>
</div>
<div className={"flex items-center gap-space-xs shrink-0"}>
<button className={"h-8 px-space-xs flex items-center gap-1 bg-surface-container-high hover:bg-surface-bright transition-all text-on-surface-variant text-label-sm font-label-sm uppercase tracking-wider"} id={"cam-360-btn"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_currentColor]"}></span>
<span>360° 检视</span>
</button>
<button aria-label={"\u91cd\u7f6e\u65b9\u6848"} className={"w-8 h-8 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-primary transition-colors"} title={"\u91cd\u7f6e\u53c2\u6570"}>
<span className={"material-symbols-outlined text-[18px]"}>restart_alt</span>
</button>
<button aria-label={"\u5bfc\u51fa\u9884\u8bbe"} className={"w-8 h-8 flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-secondary transition-colors"} title={"\u5206\u4eab\u7075\u5323\u5feb\u7167"}>
<span className={"material-symbols-outlined text-[18px]"}>share</span>
</button>
</div>
</header>

<section className={"relative w-full h-[380px] overflow-hidden flex items-center justify-center bg-gradient-to-b from-surface-container-lowest via-surface-dim to-surface-container-lowest"}>

<div className={"absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(139,30,30,0.32),transparent_70%)]"}></div>
<div className={"absolute inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_bottom,rgba(233,195,73,0.15),transparent_65%)]"}></div>

<svg className={"absolute inset-0 w-full h-full pointer-events-none opacity-30"} xmlns={"http://www.w3.org/2000/svg"}>
<defs>
<radialgradient cx={"50%"} cy={"50%"} id={"forgeGlow"} r={"50%"}>
<stop offset={"0%"} stopColor={"#ffb3ad"} stopOpacity={"0.25"}></stop>
<stop offset={"100%"} stopColor={"#131315"} stopOpacity={"0"}></stop>
</radialgradient>
</defs>
<circle className={"animate-[spin_40s_linear_infinite] origin-center opacity-60"} cx={"50%"} cy={"54%"} fill={"none"} r={"130"} stroke={"#e9c349"} strokeDasharray={"4 8"} strokeWidth={"0.75"}></circle>
<circle className={"animate-[spin_30s_linear_infinite_reverse] origin-center opacity-70"} cx={"50%"} cy={"54%"} fill={"none"} r={"148"} stroke={"#8b1e1e"} strokeDasharray={"16 12 4 12"} strokeWidth={"1"}></circle>
<line stroke={"#353437"} strokeDasharray={"2 6"} strokeWidth={"0.5"} x1={"10%"} x2={"90%"} y1={"54%"} y2={"54%"}></line>
</svg>

<div className={"relative z-10 flex flex-col items-center justify-center w-full h-full cursor-grab active:cursor-grabbing group"}>
<div className={"relative w-64 h-80 flex items-center justify-center"}>

<img className={"w-full h-full object-contain filter drop-shadow-[0_20px_35px_rgba(139,30,30,0.6)] group-hover:scale-105 transition-transform duration-500 ease-out"} data-alt={"Magnificent hyper-detailed 3D render of a mythic chess Queen piece sculpted from translucent dark ruby obsidian and faceted smoky crystal. The crown flares with sharp gothic spikes and a pulsing crimson core gem. Intricate 24k gold filigree veins snake along the monolithic black marble chassis. Volumetric crimson mist, floating cinder sparks, and a solemn ray of celestial silver chiaroscuro light casting an obsidian shadow on wet chessboard slate."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuBQdsZn-oNgepyFKQ4Ck4PD-godq2_mgoGbB5Is32Dbsg21IDwuplvSid09U0Yd0HUX7joWQjoVUD95REJwXL3GYiZzysmoGixWwCd0ZrNWUG3NkoTK5szZQAvLldfE-qB7IjVw1l1LRP_Cgw0TGWd4hq0dTkvOq8TUAja_oXJvRA89huQQgrz1xpH_-a2j57C9NBXjYy0ay0AXQTK71KSuxMWb18D2n6zhXicQL5XqEqzi6StEHxDJiQ"} />

<button aria-label={"\u6676\u6838\u738b\u51a0\u805a\u7126"} className={"absolute top-10 left-[50%] -translate-x-1/2 w-6 h-6 flex items-center justify-center z-20 group/spot"} id={"hotspot-crown"}>
<span className={"w-3 h-3 rounded-full bg-primary animate-ping opacity-75"}></span>
<span className={"absolute w-4 h-4 rounded-full bg-primary-container border-solid flex items-center justify-center text-[10px] text-on-primary font-bold shadow-[0_0_12px_#ffb3ad]"}>1</span>
<span className={"absolute left-6 whitespace-nowrap bg-surface-container-highest/95 backdrop-blur-md text-primary px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider opacity-0 group-hover/spot:opacity-100 transition-opacity shadow-md pointer-events-none"}>晶核脉冲 · TIER V</span>
</button>

<button aria-label={"\u9aa8\u7eb9\u88d9\u7532\u805a\u7126"} className={"absolute top-[48%] left-[62%] w-6 h-6 flex items-center justify-center z-20 group/spot"} id={"hotspot-chassis"}>
<span className={"w-2.5 h-2.5 rounded-full bg-secondary animate-ping opacity-60"}></span>
<span className={"absolute w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center text-[10px] text-on-secondary font-bold shadow-[0_0_10px_#e9c349]"}>2</span>
<span className={"absolute left-6 whitespace-nowrap bg-surface-container-highest/95 backdrop-blur-md text-secondary px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider opacity-0 group-hover/spot:opacity-100 transition-opacity shadow-md pointer-events-none"}>黑曜骨纹 · CHASSIS</span>
</button>

<button aria-label={"\u57fa\u5ea7\u5171\u9e23\u5370\u8bb0"} className={"absolute bottom-10 left-[34%] w-6 h-6 flex items-center justify-center z-20 group/spot"} id={"hotspot-base"}>
<span className={"w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-60"}></span>
<span className={"absolute w-4 h-4 rounded-full bg-primary-container flex items-center justify-center text-[10px] text-on-primary font-bold shadow-[0_0_10px_#8b1e1e]"}>3</span>
<span className={"absolute right-6 whitespace-nowrap bg-surface-container-highest/95 backdrop-blur-md text-on-surface px-2 py-0.5 font-label-sm text-label-sm uppercase tracking-wider opacity-0 group-hover/spot:opacity-100 transition-opacity shadow-md pointer-events-none"}>基座共鸣印记 · AURA</span>
</button>
</div>

<div className={"absolute bottom-2 w-48 h-6 rounded-full bg-primary-container/20 blur-md"}></div>
</div>

<div className={"absolute bottom-3 inset-x-margin-mobile flex items-center justify-between z-20 pointer-events-auto"}>
<div className={"flex items-center gap-1 bg-surface-container-lowest/85 backdrop-blur-md p-1 shadow-lg"}>
<button className={"px-2.5 py-1 text-label-sm font-label-sm uppercase tracking-wider bg-primary-container text-on-primary-container shadow-[0_0_10px_rgba(139,30,30,0.5)]"}>360° 环绕</button>
<button className={"px-2.5 py-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface"}>仰角审判</button>
<button className={"px-2.5 py-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface"}>冠冕特写</button>
<button className={"px-2.5 py-1 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface"}>战盘实装</button>
</div>

<div className={"flex items-center bg-surface-container-lowest/85 backdrop-blur-md p-1 shadow-lg gap-1"}>
<button aria-label={"\u65e5\u5195\u5723\u8f89"} className={"w-6 h-6 flex items-center justify-center text-secondary hover:bg-surface-container"} title={"\u65e5\u5195\u51b7\u8292"}>
<span className={"material-symbols-outlined text-[16px]"}>wb_sunny</span>
</button>
<button aria-label={"\u8840\u7130\u6df1\u6e0a"} className={"w-6 h-6 flex items-center justify-center text-primary bg-surface-container-high"} title={"\u6df1\u6e0a\u8840\u7130"}>
<span className={"material-symbols-outlined text-[16px]"}>local_fire_department</span>
</button>
<button aria-label={"\u865a\u7a7a\u6c89\u5bc2"} className={"w-6 h-6 flex items-center justify-center text-on-surface-variant hover:bg-surface-container"} title={"\u865a\u7a7a\u5e7d\u591c"}>
<span className={"material-symbols-outlined text-[16px]"}>nightlight</span>
</button>
</div>
</div>
</section>

<main className={"flex flex-col px-margin-mobile pt-space-md gap-space-md"}>

<nav className={"w-full flex items-center gap-1 overflow-x-auto no-scrollbar bg-surface-container-lowest p-1 shadow-inner"}>
<button className={"flex-1 min-w-[84px] py-2 px-1 flex flex-col items-center justify-center gap-0.5 bg-surface-container-high text-secondary shadow-[inset_0_-2px_0_0_#e9c349] transition-all"} id={"tab-vfx"}>
<span className={"material-symbols-outlined text-[18px]"}>auto_awesome</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-center whitespace-nowrap"}>光效粒子</span>
</button>
<button className={"flex-1 min-w-[84px] py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-on-surface transition-all"} id={"tab-finisher"}>
<span className={"material-symbols-outlined text-[18px]"}>sports_martial_arts</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-center whitespace-nowrap"}>击杀处决</span>
</button>
<button className={"flex-1 min-w-[84px] py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-on-surface transition-all"} id={"tab-sfx"}>
<span className={"material-symbols-outlined text-[18px]"}>graphic_eq</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-center whitespace-nowrap"}>棋音声学</span>
</button>
<button className={"flex-1 min-w-[84px] py-2 px-1 flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-on-surface transition-all"} id={"tab-runes"}>
<span className={"material-symbols-outlined text-[18px]"}>fingerprint</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-center whitespace-nowrap"}>铭刻印记</span>
</button>
</nav>

<section className={"flex flex-col gap-space-md"}>

<div className={"flex items-baseline justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-3 bg-secondary"}></span>
<span className={"font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider"}>光效流转与粒子场</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>Resonance: 92.4%</span>
</div>

<div className={"flex flex-col p-space-md bg-surface-container-low shadow-[0_8px_24px_rgba(0,0,0,0.6)] gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex flex-col"}>
<span className={"font-label-lg text-label-lg text-on-surface uppercase tracking-wide"}>辉光耀斑强度 (Bloom Intensity)</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>控制黑曜石晶核释放的摄魂血芒辐射半径与漫反射辉度</span>
</div>
<span className={"font-headline-sm text-headline-sm text-primary font-bold"} id={"bloom-val"}>88%</span>
</div>

<div className={"relative w-full h-7 flex items-center"}>
<div className={"w-full h-1.5 bg-surface-container-highest relative overflow-hidden"}>
<div className={"h-full bg-gradient-to-r from-primary-container via-primary to-secondary w-[88%] shadow-[0_0_12px_#ffb3ad]"}></div>
</div>

<div className={"absolute left-[88%] -translate-x-1/2 w-4 h-6 bg-secondary flex items-center justify-center shadow-[0_0_10px_#ffe088] cursor-pointer"}>
<div className={"w-1 h-3 bg-on-secondary"}></div>
</div>
</div>
<div className={"flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm tracking-widest pt-1"}>
<span>0% · 幽微暗蚀</span>
<span>50% · 王庭炽焰</span>
<span className={"text-secondary"}>100% · 极昼血耀</span>
</div>
</div>

<div className={"flex flex-col p-space-md bg-surface-container-low shadow-[0_8px_24px_rgba(0,0,0,0.6)] gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-lg text-label-lg text-on-surface uppercase tracking-wide"}>灰烬粒子迸射 (Ember Fallout)</span>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider"}>Dynamic GPU Physics</span>
</div>

<div className={"grid grid-cols-3 gap-2 pt-1"}>
<button className={"p-space-sm flex flex-col items-center justify-center gap-1 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant text-center"}>
<span className={"font-label-md text-label-md uppercase tracking-wider"}>微烬沉寂</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant/70"}>Subtle (80/s)</span>
</button>
<button className={"p-space-sm flex flex-col items-center justify-center gap-1 bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(139,30,30,0.6)] text-center relative overflow-hidden"}>
<div className={"absolute top-0 right-0 w-2 h-2 bg-secondary rotate-45 translate-x-1 -translate-y-1"}></div>
<span className={"font-label-md text-label-md uppercase tracking-wider font-semibold"}>暴烈血涌</span>
<span className={"font-label-sm text-label-sm text-on-primary-container/80"}>Intense (480/s)</span>
</button>
<button className={"p-space-sm flex flex-col items-center justify-center gap-1 bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface-variant text-center"}>
<span className={"font-label-md text-label-md uppercase tracking-wider"}>虚空湮灭</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant/70"}>Void Vortex</span>
</button>
</div>
</div>

<div className={"grid grid-cols-1 md:grid-cols-2 gap-space-sm"}>

<div className={"p-space-md bg-surface-container-low flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-wide"}>步履幽影残迹 (Mist Trail)</span>
<button aria-label={"\u5f00\u5173\u6b8b\u5f71\u62d6\u5c3e"} className={"w-10 h-5 bg-primary-container p-0.5 flex items-center justify-end shadow-[0_0_8px_#ffb3ad]"}>
<div className={"w-4 h-4 bg-on-primary"}></div>
</button>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>移动滑步时于战盘格面留下血雾与碎裂残像，持续 1.8 秒</span>
</div>

<div className={"p-space-md bg-surface-container-low flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-wide"}>棋格圣座光环 (Imprint Aura)</span>
<span className={"font-label-sm text-label-sm text-secondary"}>#8B1E1E</span>
</div>
<div className={"flex items-center gap-3 pt-1"}>
<button className={"w-7 h-7 bg-primary-container shadow-[0_0_10px_#ffb3ad] flex items-center justify-center"} title={"\u7329\u7ea2\u738b\u6743 (Crimson Sovereign)"}>
<span className={"material-symbols-outlined text-[14px] text-on-primary"}>check</span>
</button>
<button className={"w-7 h-7 bg-secondary-container hover:opacity-90 flex items-center justify-center"} title={"\u5723\u5802\u53e4\u91d1 (Imperial Gold)"}></button>
<button className={"w-7 h-7 bg-surface-container-highest hover:opacity-90 flex items-center justify-center"} title={"\u865a\u7a7a\u591c\u5f71 (Void Abyss)"}></button>
<button className={"w-7 h-7 bg-primary hover:opacity-90 flex items-center justify-center"} title={"\u6781\u5bd2\u971c\u6676 (Glacial Pale)"}></button>
</div>
</div>
</div>

<div className={"p-space-md bg-surface-container-low shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>swords</span>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>终极杀着处决特写 · 虚空斩首</span>
</div>
<span className={"font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 text-secondary"}>FINISHER FX</span>
</div>

<div className={"relative w-full h-36 overflow-hidden bg-surface-container-lowest flex items-center justify-center group"}>
<img className={"w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity"} data-alt={"Cinematic dark chess battlefield capture moment: a monumental black marble queen crushes an enemy king piece under an ethereal guillotine blade woven from blood-red arcane lightning, fragments of polished ivory scattering across the obsidian reflective floor with smoke and sparks."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuD_9a-iaBVO60Pyu_RKHXJt0Jb3BJZUcZSYDb7Rd5ESjf6lRepWPfAZazUo_T_-vWrG2iJxMdwI1_Aym-Oieq5qP6-EEeT7DVsUEzeocLEWkAJsdm1dyWNqj1BbQz1kR8bAvqmwdINkmpY2m3X9OPJyZnFtDi3Ry3OUOGnBcMyldeA4WisSrzOfXdegYLwnvEzAgduB1Nzen7j82lQRbdtOi5Irx1ALoXk6f2QMtxY8oytFYbtfQSdP7w"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/60"}></div>

<div className={"absolute z-10 flex flex-col items-center gap-1"}>
<button className={"w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_0_20px_#8b1e1e] hover:scale-110 active:scale-95 transition-transform"}>
<span className={"material-symbols-outlined text-[24px]"}>play_arrow</span>
</button>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-widest"}>处决特写实机预览</span>
</div>

<div className={"absolute bottom-2 inset-x-3 flex items-center justify-between text-label-sm font-label-sm"}>
<span className={"text-on-surface-variant flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[14px]"}>slow_motion_video</span> 慢动作回放 (0.5x)
            </span>
<span className={"text-primary uppercase tracking-wider"}>时长: 2.4s</span>
</div>
</div>
</div>

<div className={"p-space-md bg-surface-container-low shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>volume_up</span>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>棋音声学 · 质感微调 (Acoustic Tuning)</span>
</div>
<button className={"px-2 py-1 bg-surface-container text-secondary text-label-sm font-label-sm flex items-center gap-1 hover:bg-surface-container-high transition-colors"}>
<span className={"material-symbols-outlined text-[14px]"}>play_circle</span> 试听落子声
          </button>
</div>

<div className={"grid grid-cols-3 gap-2"}>
<div className={"p-space-xs bg-surface-container flex flex-col items-center text-center cursor-pointer hover:bg-surface-container-high"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-wider"}>深邃大理石</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant/70"}>Heavy Clack</span>
</div>
<div className={"p-space-xs bg-primary-container text-on-primary flex flex-col items-center text-center shadow-[0_0_12px_rgba(139,30,30,0.4)]"}>
<span className={"font-label-sm text-label-sm uppercase tracking-wider font-bold"}>黑曜金鸣</span>
<span className={"font-label-sm text-label-sm text-on-primary-container"}>Crystal Thud</span>
</div>
<div className={"p-space-xs bg-surface-container flex flex-col items-center text-center cursor-pointer hover:bg-surface-container-high"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-wider"}>远古龙骨</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant/70"}>Dull Resonance</span>
</div>
</div>

<div className={"w-full bg-surface-container-lowest p-space-sm flex items-end gap-1.5 h-14"}>
<div className={"flex-1 bg-primary-container h-[40%]"}></div>
<div className={"flex-1 bg-primary h-[65%]"}></div>
<div className={"flex-1 bg-secondary h-[90%]"}></div>
<div className={"flex-1 bg-primary h-[75%]"}></div>
<div className={"flex-1 bg-primary-container h-[55%]"}></div>
<div className={"flex-1 bg-surface-container-high h-[35%]"}></div>
<div className={"flex-1 bg-surface-container-high h-[20%]"}></div>
<div className={"flex-1 bg-surface-container h-[10%]"}></div>
</div>
<div className={"flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm"}>
<span>低频冲击感 (Sub-Bass): +4.2 dB</span>
<span>大教堂混响 (Cathedral Reverb): 74%</span>
</div>
</div>
</section>
</main>

<aside className={"fixed bottom-16 inset-x-0 z-40 px-margin-mobile py-space-sm bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.9)] flex items-center justify-between gap-space-sm"}>

<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-wider"}>消耗血晶: 0 (已全数解构)</span>
</div>
<div className={"flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm truncate"}>
<span className={"text-primary-fixed"}>ELO 2500+ 专属神铸</span>
<span>· 预设 [方案 I · 永夜]</span>
</div>
</div>

<div className={"flex items-center gap-2 shrink-0"}>
<button className={"h-10 px-3 flex items-center justify-center bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-label-md text-label-md uppercase tracking-widest"}>
        保存方案
      </button>
<button className={"h-10 px-4 flex items-center justify-center bg-primary-container text-on-primary hover:bg-inverse-primary shadow-[0_0_16px_rgba(139,30,30,0.7)] active:scale-95 transition-all font-label-md text-label-md uppercase tracking-widest font-semibold gap-1"}>
<span className={"material-symbols-outlined text-[16px]"}>check_circle</span>
<span>对局实装</span>
</button>
</div>
</aside>
</div>
</main><nav className={"fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"} data-active-classes={"text-secondary bg-surface-container-high/60"}><div className={"h-16 px-gutter-mobile flex items-center justify-around"}><a aria-current={"page"} className={"flex flex-col items-center justify-center w-full h-11 transition-colors gap-0.5 text-secondary bg-surface-container-high/60"} data-path={"battle"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>swords</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Battle</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"tactics"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>chess_knight</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Tactics</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"the-vault"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>auto_stories</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Vault</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"dynasty"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>shield</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Dynasty</span></a></div></nav>
    </div>
  );
}
