import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/finisher")({
  head: () => ({
    meta: [
      { title: "Finisher Workshop \u2014 Blood Sovereign" },
      { name: "description", content: "Direct the void beheading execution reel with timeline scrubbing and four camera cuts." },
      { property: "og:title", content: "Finisher Workshop \u2014 Blood Sovereign" },
      { property: "og:description", content: "Direct the void beheading execution reel with timeline scrubbing and four camera cuts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinisherWorkshop,
});

function FinisherWorkshop() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full text-on-surface select-none pb-24"}>

<div className={"w-full px-margin-mobile pt-space-sm pb-space-xs flex items-center justify-between bg-surface-container-lowest/90 backdrop-blur-md sticky top-0 z-40"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<a aria-label={"Back to Piece Workshop"} className={"w-9 h-9 flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors"} href={"#"}>
<span className={"material-symbols-outlined text-[20px]"}>arrow_back</span>
</a>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>FINISHER WORKSHOP</span>
<span className={"w-1 h-1 rounded-full bg-primary-container"}></span>
<span className={"font-label-sm text-label-sm text-primary uppercase"}>EXECUTION // 002</span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wide uppercase truncate"}>猩红女帝 · 虚空斩首</span>
</div>
</div>
<div className={"flex items-center gap-space-xs"}>
<button className={"h-9 px-space-sm bg-surface-container-high hover:bg-surface-bright text-secondary flex items-center gap-1 transition-colors"} title={"Director Free Camera"}>
<span className={"material-symbols-outlined text-[18px]"}>video_camera_front</span>
<span className={"hidden sm:inline font-label-sm text-label-sm uppercase tracking-wider"}>3D Director</span>
</button>
<button className={"w-9 h-9 flex items-center justify-center bg-surface-container-high text-on-surface hover:text-secondary transition-colors"} title={"Theater Mode Fullscreen"}>
<span className={"material-symbols-outlined text-[19px]"}>fullscreen</span>
</button>
</div>
</div>

<div className={"w-full px-margin-mobile py-space-xs bg-surface-container-lowest/70 overflow-x-auto flex gap-space-xs no-scrollbar"}>
<button className={"px-space-md py-1.5 bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider whitespace-nowrap transition-colors"}>
      光效粒子 Particle FX
    </button>
<button className={"px-space-md py-1.5 bg-primary-container text-on-primary-container font-label-md text-label-md uppercase tracking-wider whitespace-nowrap shadow-[0_0_16px_rgba(139,30,30,0.6)] flex items-center gap-1.5"}>
<span className={"w-1.5 h-1.5 bg-secondary"}></span>
      击杀处决 Finisher FX
    </button>
<button className={"px-space-md py-1.5 bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider whitespace-nowrap transition-colors"}>
      棋音声学 Acoustic Core
    </button>
<button className={"px-space-md py-1.5 bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md uppercase tracking-wider whitespace-nowrap transition-colors"}>
      铭刻印记 Crest Rune
    </button>
</div>

<div className={"relative w-full aspect-[4/5] sm:aspect-[16/11] bg-surface-container-lowest overflow-hidden flex flex-col justify-between"}>

<div className={"absolute inset-0 bg-cover bg-center"} data-alt={"Ultra dramatic dark gothic fantasy chess climax. An armored hand clad in obsidian and glowing antique gold rings holds a severed obsidian king piece aloft. The crown shatters into glowing crimson geometric crystals and vermilion embers. Deep chiaroscuro shadows, occult cathedral pillars in smoke, floating dark chess monolith board, and volumetric beams of golden and blood-red moonlight. Extreme cinematic fidelity."} style={{ backgroundImage: "url('/__l5e/assets-v1/936655a1-a5fa-43b9-9916-f88a933b250b/hero-throne.jpg')" }}>
</div>

<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/70 pointer-events-none"}></div>
<div className={"absolute inset-0 bg-gradient-to-r from-surface-container-lowest/60 via-transparent to-surface-container-lowest/60 pointer-events-none"}></div>

<div className={"relative z-10 p-margin-mobile flex justify-between items-start"}>
<div className={"flex flex-col gap-1"}>
<div className={"flex items-center gap-1.5 px-2 py-0.5 bg-surface-container-lowest/90 backdrop-blur-md"}>
<span className={"material-symbols-outlined text-primary text-[14px]"}>movie</span>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest"}>ACT III // APEX CLIMAX</span>
</div>
<div className={"text-secondary font-headline-sm text-headline-sm uppercase tracking-wider drop-shadow-md"}>
          晶核斩首 · 胜势已决
        </div>
</div>
<div className={"flex items-center gap-1 bg-surface-container-lowest/90 px-2 py-1 backdrop-blur-md"}>
<span className={"w-2 h-2 rounded-full bg-primary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-on-surface tracking-widest uppercase"}>1.60s / 2.40s</span>
</div>
</div>

<div className={"absolute inset-0 z-0 pointer-events-none flex items-center justify-center"}>
<div className={"relative w-48 h-48 opacity-40"}>
<div className={"absolute inset-0 border-t border-b border-secondary/30 scale-x-125"}></div>
<div className={"absolute inset-0 border-l border-r border-secondary/30 scale-y-125"}></div>
<div className={"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-primary/60"}></div>
</div>
</div>

<div className={"relative z-10 px-margin-mobile pb-space-md pt-space-lg flex flex-col gap-space-xs bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/95 to-transparent"}>

<div className={"grid grid-cols-4 w-full text-center gap-1 mb-1"}>
<div className={"flex flex-col items-start text-left"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>0.0s</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase truncate"}>幽夜升维</span>
</div>
<div className={"flex flex-col items-center"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>0.8s</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase truncate"}>猩红敕令</span>
</div>
<div className={"flex flex-col items-center"}>
<span className={"font-label-sm text-label-sm text-primary font-semibold"}>1.6s [Apex]</span>
<span className={"font-label-sm text-label-sm text-primary uppercase font-semibold truncate"}>晶核碎裂</span>
</div>
<div className={"flex flex-col items-end text-right"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>2.4s</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase truncate"}>战盘血祭</span>
</div>
</div>

<div className={"relative w-full h-3 bg-surface-container-highest cursor-pointer flex items-center"} id={"scrubber-bar"}>

<div className={"h-full bg-gradient-to-r from-primary-container via-primary to-secondary"} style={{ width: "66.6%" }}></div>

<span className={"absolute left-0 w-1 h-3 bg-on-surface/40"}></span>
<span className={"absolute left-[33.3%] w-1 h-3 bg-on-surface/40"}></span>
<span className={"absolute left-[66.6%] w-1.5 h-4 bg-secondary shadow-[0_0_10px_rgba(233,195,73,0.9)]"}></span>
<span className={"absolute right-0 w-1 h-3 bg-on-surface/40"}></span>
</div>

<div className={"flex items-center justify-between mt-2 pt-space-xs"}>
<div className={"flex items-center gap-space-sm"}>
<button aria-label={"Play / Pause Frame"} className={"w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary-fixed transition-transform active:scale-95 shadow-[0_0_16px_rgba(233,195,73,0.4)]"}>
<span className={"material-symbols-outlined text-[24px]"}>pause</span>
</button>
<div className={"flex bg-surface-container-high p-0.5"}>
<button className={"px-2 py-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface"}>1.0x</button>
<button className={"px-2 py-1 font-label-sm text-label-sm bg-primary-container text-on-primary-container font-semibold"}>0.5x</button>
<button className={"px-2 py-1 font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface"}>0.25x</button>
</div>
</div>
<div className={"flex items-center gap-space-xs"}>
<button className={"px-space-sm py-1 bg-surface-container-high text-secondary flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[16px]"}>sync</span>
<span className={"font-label-sm text-label-sm uppercase tracking-wider"}>LOOP</span>
</button>
<button className={"px-space-sm py-1 bg-surface-container-high text-on-surface-variant hover:text-secondary flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[16px]"}>photo_camera</span>
<span className={"font-label-sm text-label-sm uppercase tracking-wider"}>SNAP</span>
</button>
</div>
</div>
</div>
</div>

<div className={"w-full px-margin-mobile mt-space-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>view_timeline</span>
<span className={"font-headline-sm text-headline-sm uppercase tracking-wide text-on-surface"}>分镜机位实录 (Storyboard Reel)</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>4 ANGLE CUTS</span>
</div>

<div className={"grid grid-cols-2 sm:grid-cols-4 gap-space-sm"}>

<div className={"bg-surface-container-low p-space-xs flex flex-col gap-1 hover:bg-surface-container transition-colors group cursor-pointer"}>
<div className={"relative aspect-video w-full overflow-hidden bg-surface-container-lowest"}>
<div className={"w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"} data-alt={"Dark occult chess cinematography opening shot. Low angle macro view of a shadowy obsidian queen piece lifting into an abyssal void surrounded by hovering crimson embers."} style={{ backgroundImage: "url('/__l5e/assets-v1/512864e6-ef6d-48cb-92db-9ce4af25bb06/match-arena.jpg')" }}>
</div>
<span className={"absolute top-1 left-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-on-surface tracking-wider"}>0.0s</span>
<span className={"absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-secondary"}>仰视升维</span>
</div>
<div className={"flex justify-between items-center px-1"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase truncate"}>Shot 1: 幽夜升维</span>
<span className={"material-symbols-outlined text-on-surface-variant text-[14px]"}>videocam</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-xs flex flex-col gap-1 hover:bg-surface-container transition-colors group cursor-pointer"}>
<div className={"relative aspect-video w-full overflow-hidden bg-surface-container-lowest"}>
<div className={"w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"} data-alt={"Cinematic chess camera cut. High speed motion blur tracking a crimson blade cutting through dark celestial dust toward a golden monarch crown piece."} style={{ backgroundImage: "url('/__l5e/assets-v1/96567e8b-b65b-4651-af12-7edcd6ee63b0/review-board.jpg')" }}>
</div>
<span className={"absolute top-1 left-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-on-surface tracking-wider"}>0.8s</span>
<span className={"absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-secondary"}>俯冲特写</span>
</div>
<div className={"flex justify-between items-center px-1"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase truncate"}>Shot 2: 猩红敕令</span>
<span className={"material-symbols-outlined text-on-surface-variant text-[14px]"}>speed</span>
</div>
</div>

<div className={"bg-surface-container p-space-xs flex flex-col gap-1 shadow-[0_0_16px_rgba(139,30,30,0.5)] relative cursor-pointer"}>
<div className={"absolute -top-1 -right-1 bg-primary text-on-primary font-label-sm text-label-sm px-1 z-10 uppercase tracking-widest font-semibold"}>
          ACTIVE
        </div>
<div className={"relative aspect-video w-full overflow-hidden bg-surface-container-lowest"}>
<div className={"w-full h-full bg-cover bg-center"} data-alt={"Extreme macro freeze frame climax. An ornate golden king chess crown fracturing under dark celestial pressure, deep ruby crystalline dust exploding outward in slow motion."} style={{ backgroundImage: "url('/__l5e/assets-v1/a4031b0f-43fe-42da-a105-b97d7e0850c1/victory-emblem.png')" }}>
</div>
<span className={"absolute top-1 left-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-primary tracking-wider"}>1.6s</span>
<span className={"absolute bottom-1 right-1 bg-primary-container px-1 py-0.2 font-label-sm text-label-sm text-on-primary-container"}>冠冕碎裂</span>
</div>
<div className={"flex justify-between items-center px-1"}>
<span className={"font-label-sm text-label-sm text-secondary font-semibold uppercase truncate"}>Shot 3: 晶核碎裂</span>
<span className={"material-symbols-outlined text-secondary text-[14px]"}>camera_indoor</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-xs flex flex-col gap-1 hover:bg-surface-container transition-colors group cursor-pointer"}>
<div className={"relative aspect-video w-full overflow-hidden bg-surface-container-lowest"}>
<div className={"w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"} data-alt={"Cinematic chess aftermath wide shot. A massive cracked obsidian chessboard floating in the dark void with glowing red lava fissure veins, ruined opposing pieces turned to ash."} style={{ backgroundImage: "url('/__l5e/assets-v1/b46d2699-3ed1-4e73-9f50-dbd0a0e15bfa/hero-throne-portrait.jpg')" }}>
</div>
<span className={"absolute top-1 left-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-on-surface tracking-wider"}>2.4s</span>
<span className={"absolute bottom-1 right-1 bg-surface-container-lowest/90 px-1 py-0.2 font-label-sm text-label-sm text-secondary"}>深空远景</span>
</div>
<div className={"flex justify-between items-center px-1"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase truncate"}>Shot 4: 战盘血祭</span>
<span className={"material-symbols-outlined text-on-surface-variant text-[14px]"}>photo_camera_back</span>
</div>
</div>
</div>
</div>

<div className={"w-full px-margin-mobile mt-space-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>swords</span>
<span className={"font-headline-sm text-headline-sm uppercase tracking-wide text-on-surface"}>处决派系律令 (Finisher Style Codex)</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>MYTHIC TIER</span>
</div>

<div className={"grid grid-cols-1 gap-space-sm"}>

<div className={"bg-surface-container p-space-md flex items-center justify-between shadow-[0_4px_24px_rgba(139,30,30,0.35)] relative overflow-hidden"}>
<div className={"absolute left-0 top-0 bottom-0 w-1 bg-secondary"}></div>
<div className={"flex items-center gap-space-md min-w-0"}>
<div className={"w-12 h-12 bg-primary-container text-secondary flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-[26px]"}>gavel</span>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-md text-label-md text-secondary tracking-widest uppercase"}>EQUIPPED</span>
<span className={"w-1 h-1 rounded-full bg-secondary"}></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>VOID TIER</span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wide uppercase truncate"}>虚空断罪 · 猩红斩首</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-1"}>以深空虚空重力牵引，引爆敌方王棋神性晶核，留存暗红地脉裂痕。</p>
</div>
</div>
<div className={"flex items-center shrink-0 ml-space-sm"}>
<span className={"material-symbols-outlined text-secondary text-[24px]"}>check_circle</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-md flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer group"}>
<div className={"flex items-center gap-space-md min-w-0"}>
<div className={"w-12 h-12 bg-surface-container-high text-on-surface-variant group-hover:text-primary flex items-center justify-center shrink-0 transition-colors"}>
<span className={"material-symbols-outlined text-[26px]"}>dark_mode</span>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>SHADOW TIER</span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-primary tracking-wide uppercase truncate transition-colors"}>永夜侵蚀 · 影缚碎裂</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-1"}>幽影触手自棋盘地渊生出，彻底将目标碾碎为深渊黑曜微粒。</p>
</div>
</div>
<div className={"flex items-center shrink-0 ml-space-sm"}>
<span className={"font-label-sm text-label-sm px-2 py-1 bg-surface-container-high text-on-surface uppercase tracking-wider group-hover:bg-surface-bright transition-colors"}>预览 PREVIEW</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-md flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer group"}>
<div className={"flex items-center gap-space-md min-w-0"}>
<div className={"w-12 h-12 bg-surface-container-high text-on-surface-variant group-hover:text-secondary flex items-center justify-center shrink-0 transition-colors"}>
<span className={"material-symbols-outlined text-[26px]"}>local_fire_department</span>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>SOLAR TIER</span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary tracking-wide uppercase truncate transition-colors"}>王权审判 · 圣血炽裁</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-1"}>天降苍穹圣血烈焰，将败者熔炼为纯金熔浆流入棋盘凹槽。</p>
</div>
</div>
<div className={"flex items-center shrink-0 ml-space-sm"}>
<span className={"font-label-sm text-label-sm px-2 py-1 bg-surface-container-high text-on-surface uppercase tracking-wider group-hover:bg-surface-bright transition-colors"}>预览 PREVIEW</span>
</div>
</div>
</div>
</div>

<div className={"w-full px-margin-mobile mt-space-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>tune</span>
<span className={"font-headline-sm text-headline-sm uppercase tracking-wide text-on-surface"}>绝杀视效微调 (Climax FX Parameters)</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>CALIBRATION</span>
</div>
<div className={"bg-surface-container p-space-md flex flex-col gap-space-md"}>

<div className={"flex flex-col gap-1.5"}>
<div className={"flex justify-between items-center"}>
<span className={"font-body-md text-body-md text-on-surface uppercase tracking-wide"}>屏幕震动级数 (Screen Shake Intensity)</span>
<span className={"font-label-md text-label-md text-secondary"}>90% · 极度震撼</span>
</div>
<div className={"w-full h-2 bg-surface-container-highest flex items-center cursor-pointer"}>
<div className={"h-full bg-primary"} style={{ width: "90%" }}></div>
<div className={"w-3.5 h-3.5 bg-secondary shadow-[0_0_8px_rgba(233,195,73,0.8)] -ml-1"}></div>
</div>
</div>

<div className={"flex items-center justify-between py-1"}>
<div className={"flex flex-col"}>
<span className={"font-body-md text-body-md text-on-surface"}>慢动作凝滞帧 (Apex Time Dilation)</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>在斩首触碰瞬间触发 0.5s 高清凝滞与心跳音效</span>
</div>
<button aria-label={"Toggle Time Dilation"} className={"w-12 h-6 bg-primary-container p-0.5 flex items-center justify-end transition-colors"}>
<div className={"w-5 h-5 bg-secondary"}></div>
</button>
</div>

<div className={"flex items-center justify-between py-1"}>
<div className={"flex flex-col min-w-0 pr-space-sm"}>
<div className={"flex items-center gap-2"}>
<span className={"font-body-md text-body-md text-on-surface"}>处决台词敕令 (Edict Voiceover)</span>
<button className={"w-6 h-6 flex items-center justify-center bg-surface-container-high text-secondary hover:text-on-surface"} title={"Listen Audio Sample"}>
<span className={"material-symbols-outlined text-[16px]"}>volume_up</span>
</button>
</div>
<span className={"font-body-sm text-body-sm text-secondary italic truncate"}>“She doesn’t follow the game. She changes it.”</span>
</div>
<button aria-label={"Toggle Voiceover"} className={"w-12 h-6 bg-primary-container p-0.5 flex items-center justify-end transition-colors shrink-0"}>
<div className={"w-5 h-5 bg-secondary"}></div>
</button>
</div>

<div className={"flex items-center justify-between py-1"}>
<div className={"flex flex-col"}>
<span className={"font-body-md text-body-md text-on-surface"}>终局棋盘残像 (Aftermath Board Scarring)</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>在决胜格点永久保留流淌金赤光芒的深邃地脉裂纹</span>
</div>
<button aria-label={"Toggle Board Scarring"} className={"w-12 h-6 bg-primary-container p-0.5 flex items-center justify-end transition-colors"}>
<div className={"w-5 h-5 bg-secondary"}></div>
</button>
</div>
</div>
</div>

<div className={"fixed bottom-16 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl px-margin-mobile py-space-sm shadow-[0_-8px_32px_rgba(0,0,0,0.95)]"}>
<div className={"w-full flex items-center gap-space-sm max-w-screen-md mx-auto"}>

<button className={"flex-1 h-12 bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center gap-2 transition-colors active:scale-98"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>replay</span>
<span className={"font-label-lg text-label-lg uppercase tracking-wider"}>全片试演 (2.4s)</span>
</button>

<button className={"flex-[1.4] h-12 bg-primary-container hover:bg-inverse-primary text-on-primary-container flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,30,30,0.8)] transition-all active:scale-98"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>auto_fix_high</span>
<span className={"font-label-lg text-label-lg text-secondary uppercase tracking-widest font-semibold"}>装配专属处决</span>
</button>
</div>
</div>
</div>
</main>
    </div>
  );
}
