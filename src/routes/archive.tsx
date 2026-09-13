import tarotKingAsset from "@/assets/tarot-king.jpg.asset.json";
const posterThumb = tarotKingAsset.url;
import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { UiIcon } from "@/components/UiIcon";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "绝杀典藏 · 血誓王权 | Victory Archive" },
      { name: "description", content: "将已完成的精彩对局制作成典藏海报，保存棋谱、段位与胜负记录。" },
      { property: "og:title", content: "绝杀典藏 · 血誓王权" },
      { property: "og:description", content: "将精彩对局制作成可保存的典藏海报。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArchiveChronicle,
});

function ArchiveChronicle() {
  return (
    <div className="themed-page text-on-surface flex flex-col min-h-screen">
      <ThemeBackdrop theme="fallen" />
<SovereignPageHeader icon="archive-premium" titleZh="绝杀典藏" titleEn="Victory Archive" backTo="/analysis" /><main className={"page-main-dashboard flex flex-col relative w-full bg-surface min-h-screen"}><div className={"desktop-content-flow flex flex-col w-full pb-28 text-on-surface"}>

<div className={"fixed inset-0 pointer-events-none overflow-hidden -z-10"}>
<div className={"absolute -top-40 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-primary-container/25 blur-[120px] rounded-full"}></div>
<div className={"absolute bottom-20 right-0 w-[240px] h-[240px] bg-secondary/10 blur-[100px] rounded-full"}></div>
</div>

<section className={"px-margin-mobile pt-space-xs pb-space-sm flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<Link to="/analysis" aria-label={"返回复盘"} className={"w-8 h-8 flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-secondary transition-colors"}>
<UiIcon name="play-motion" className="h-5 w-5" />
</Link>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm uppercase tracking-[0.2em] text-secondary"}>ARCHIVE CHRONICLE // 绝杀典藏</span>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>血誓王权 · VICTORY ARCHIVE</span>
</div>
</div>
<div className={"flex items-center gap-space-xs"}>
<button className={"px-space-sm py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1 hover:bg-surface-container-highest transition-colors"}>
<UiIcon name="sliders" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm uppercase tracking-widest"}>PRESETS</span>
</button>
</div>
</div>
<div className={"flex items-center justify-between px-space-sm py-1.5 rounded bg-surface-container-low shadow-[inset_0_1px_0_rgba(233,195,73,0.15)]"}>
<div className={"flex items-center gap-1.5 min-w-0"}>
<span className={"w-1.5 h-1.5 rounded-full bg-primary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant truncate"}>COURT OF RUIN • 2504 APEX PROMOTION MATCH</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase font-semibold shrink-0"}>MOVE 38#</span>
</div>
</section>

<section className={"px-margin-mobile py-space-xs"}>
<div className={"flex gap-space-xs overflow-x-auto no-scrollbar py-0.5"} id={"styleSelector"}>

<button className={"flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-surface-container-highest text-secondary shadow-[0_4px_16px_rgba(0,0,0,0.6)] shrink-0 transition-all"}>
<UiIcon name="cards" className="h-5 w-5" />
<div className={"flex flex-col items-start leading-none"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase font-bold"}>TAROT ACE</span>
<span className={"font-label-sm text-[9px] text-on-surface-variant tracking-normal"}>塔罗王牌</span>
</div>
</button>

<button className={"flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface shrink-0 transition-all"}>
<UiIcon name="wallpaper" className="h-5 w-5" />
<div className={"flex flex-col items-start leading-none"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>VOID POSTER</span>
<span className={"font-label-sm text-[9px] text-outline tracking-normal"}>虚空巨幕</span>
</div>
</button>

<button className={"flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface shrink-0 transition-all"}>
<UiIcon name="scroll" className="h-5 w-5" />
<div className={"flex flex-col items-start leading-none"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>WAR DISPATCH</span>
<span className={"font-label-sm text-[9px] text-outline tracking-normal"}>战役军牒</span>
</div>
</button>

<button className={"flex items-center gap-1.5 px-space-sm py-1.5 rounded bg-surface-container text-on-surface-variant hover:text-on-surface shrink-0 transition-all"}>
<UiIcon name="play-motion" className="h-5 w-5" />
<div className={"flex flex-col items-start leading-none"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>9:16 STORY</span>
<span className={"font-label-sm text-[9px] text-outline tracking-normal"}>动效剪影</span>
</div>
</button>
</div>
</section>

<section className={"px-margin-mobile py-space-xs flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase text-outline"}>CANVAS RATIO</span>
<div className={"flex items-center gap-space-xs bg-surface-container-low p-0.5 rounded"}>
<button className={"px-2 py-0.5 rounded bg-surface-container-high text-secondary font-label-sm text-label-sm font-semibold tracking-wider"}>9:16</button>
<button className={"px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm tracking-wider"}>4:5</button>
<button className={"px-2 py-0.5 rounded text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm tracking-wider"}>1:1</button>
</div>
</section>

<section className={"px-margin-mobile pt-space-xs pb-space-md"}>
<div className={"relative w-full max-w-[520px] mx-auto rounded-lg bg-surface-container-lowest overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)]"} id={"posterPreview"}>

<div className={"absolute inset-0 pointer-events-none p-2.5 z-20 flex flex-col justify-between"}>

<div className={"flex items-center justify-between w-full"}>
<div className={"flex flex-col items-center"}>
<span className={"font-headline-sm text-headline-sm leading-none text-secondary font-bold"}>A</span>
<UiIcon name="flame" className="h-5 w-5" />
</div>
<div className={"flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-lowest/80 backdrop-blur-md"}>
<UiIcon name="crown" className="h-5 w-5" />
<span className={"font-label-sm text-[9px] text-secondary tracking-[0.2em] uppercase font-bold"}>ROYAL GRANDMASTER ARCHIVE</span>
</div>
<div className={"flex flex-col items-center"}>
<span className={"font-headline-sm text-headline-sm leading-none text-secondary font-bold"}>A</span>
<UiIcon name="flame" className="h-5 w-5" />
</div>
</div>

<div className={"flex items-center justify-between w-full"}>
<div className={"flex flex-col items-center rotate-180"}>
<span className={"font-headline-sm text-headline-sm leading-none text-secondary font-bold"}>A</span>
<UiIcon name="flame" className="h-5 w-5" />
</div>
<div className={"flex items-center gap-2"}>
<span className={"font-label-sm text-[8px] tracking-[0.25em] text-outline uppercase font-mono"}>REGALIA SER. 049 // 3000</span>
</div>
<div className={"flex flex-col items-center rotate-180"}>
<span className={"font-headline-sm text-headline-sm leading-none text-secondary font-bold"}>A</span>
<UiIcon name="flame" className="h-5 w-5" />
</div>
</div>
</div>

<div className={"relative w-full aspect-[9/14] overflow-hidden flex flex-col justify-between"}>

<div className={"absolute inset-0 z-0"}>
<img className={"w-full h-full object-cover object-center transform scale-105 filter brightness-95 contrast-125"} data-alt={"Cinematic macro shot of an ornate dark fantasy armored gauntlet brutally crushing a glowing crystalline chess king on a shattered obsidian and marble chessboard. Radiant crimson light and fiery shards burst outward with smoke, volumetric atmospheric rim lighting, dramatic high-contrast chiaroscuro, photorealistic dark fantasy haute couture aesthetic."} src={posterThumb} loading="lazy" width={512} height={768} />

<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-surface-container-lowest/80"}></div>
<div className={"absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-transparent to-surface-container-lowest/95"}></div>
</div>

<div className={"relative z-10 px-space-md pt-7 flex flex-col items-center text-center gap-1"}>
<div className={"inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-container/80 text-on-primary-container shadow-[0_0_12px_rgba(139,30,30,0.6)]"}>
<UiIcon name="sparkles" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm uppercase tracking-widest font-bold"}>BRILLIANT DECAPITATION • !!</span>
</div>
<h2 className={"font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-wider uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] mt-1"}>
            THE QUEEN’S REIGN
          </h2>
<span className={"font-label-sm text-label-sm text-secondary tracking-[0.25em] uppercase"}>虚空斩首 • 终局绝杀</span>

<div className={"mt-2 flex items-center gap-2 px-space-sm py-1 rounded bg-surface-container-high/90 backdrop-blur-md shadow-lg"}>
<UiIcon name="cards" className="h-5 w-5" />
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-widest font-bold font-mono"}>MOVE 38: ♛ Qf7# CHECKMATE</span>
<span className={"text-primary font-bold"}>#</span>
</div>
</div>

<div className={"relative z-10 px-space-md pb-7 flex flex-col gap-space-sm"}>

<div className={"flex flex-col items-center text-center px-space-xs"}>
<div className={"w-8 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent mb-1.5"}></div>
<p className={"font-headline-sm text-[15px] italic text-primary-fixed tracking-wide leading-snug drop-shadow-md"}>
              “She doesn’t follow the board. She commands it.”
            </p>
<span className={"font-label-sm text-[10px] text-outline uppercase tracking-widest mt-0.5"}>— Sovereign Vane, Move 38 Climax</span>
</div>

<div className={"grid grid-cols-2 gap-space-xs bg-surface-container/90 backdrop-blur-md p-space-xs rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"}>

<div className={"flex flex-col p-1.5 rounded bg-surface-container-high/80"}>
<div className={"flex items-center gap-1 mb-0.5"}>
<UiIcon name="medal-star" className="h-5 w-5" />
<span className={"font-label-sm text-[10px] text-secondary font-bold uppercase tracking-wider"}>VICTOR</span>
</div>
<span className={"font-label-md text-label-md text-on-surface font-bold uppercase truncate"}>GM VANE</span>
<div className={"flex items-center gap-1"}>
<span className={"font-label-sm text-[10px] text-primary font-mono font-bold"}>2504</span>
<span className={"font-label-sm text-[9px] text-secondary font-mono"}>(+24 APEX)</span>
</div>
</div>

<div className={"flex flex-col p-1.5 rounded bg-surface-container-low/80"}>
<div className={"flex items-center gap-1 mb-0.5"}>
<UiIcon name="skull" className="h-5 w-5" />
<span className={"font-label-sm text-[10px] text-outline font-bold uppercase tracking-wider"}>DEFEATED</span>
</div>
<span className={"font-label-md text-label-md text-on-surface-variant font-medium uppercase truncate"}>LORD CINDERS</span>
<div className={"flex items-center gap-1"}>
<span className={"font-label-sm text-[10px] text-outline font-mono"}>2510 ELO</span>
</div>
</div>
</div>

<div className={"flex items-center justify-around py-1 px-2 rounded bg-surface-container-lowest/80 text-center"}>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-[9px] text-outline uppercase tracking-wider"}>ACCURACY</span>
<span className={"font-label-sm text-label-sm text-secondary font-mono font-bold"}>98.6%</span>
</div>
<div className={"w-px h-5 bg-surface-container-highest"}></div>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-[9px] text-outline uppercase tracking-wider"}>EVAL STATE</span>
<span className={"font-label-sm text-label-sm text-primary font-mono font-bold"}>M0 (FORCED)</span>
</div>
<div className={"w-px h-5 bg-surface-container-highest"}></div>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-[9px] text-outline uppercase tracking-wider"}>HARVEST</span>
<span className={"font-label-sm text-label-sm text-secondary-fixed font-mono font-bold"}>+120 SHARDS</span>
</div>
</div>

<div className={"flex items-center justify-between pt-1"}>
<div className={"flex items-center gap-2"}>
<div className={"w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-[0_0_8px_rgba(230,57,70,0.5)]"}>
<UiIcon name="token" className="h-5 w-5" />
</div>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-[9px] text-on-surface font-mono tracking-wider"}>FIDE #8492-CHESS</span>
<span className={"font-label-sm text-[8px] text-outline tracking-widest uppercase"}>IMMUTABLE BATTLE RECORD</span>
</div>
</div>

<div className={"flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high/90"}>
<UiIcon name="qr-replay" className="h-5 w-5" />
<span className={"font-label-sm text-[9px] text-on-surface-variant font-mono tracking-widest"}>SCAN REPLAY</span>
</div>
</div>
</div>
</div>
</div>
</section>

<section className={"px-margin-mobile py-space-xs flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between pb-1"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase text-secondary font-bold"}>POSTER ELEMENTS // 元素铭刻</span>
<span className={"font-label-sm text-label-sm text-outline uppercase tracking-wider"}>4 ACTIVE</span>
</div>
<div className={"grid grid-cols-2 gap-space-xs"}>

<label className={"flex items-center justify-between p-space-xs rounded bg-surface-container cursor-pointer select-none"}>
<div className={"flex items-center gap-1.5"}>
<UiIcon name="signature" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm text-on-surface"}>步法棋谱 (Notation)</span>
</div>
<div className={"w-4 h-4 rounded bg-primary-container flex items-center justify-center text-on-primary-container"}>
<UiIcon name="medal-star" className="h-5 w-5" />
</div>
</label>

<label className={"flex items-center justify-between p-space-xs rounded bg-surface-container cursor-pointer select-none"}>
<div className={"flex items-center gap-1.5"}>
<UiIcon name="seal" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm text-on-surface"}>火漆印章 (Royal Seal)</span>
</div>
<div className={"w-4 h-4 rounded bg-primary-container flex items-center justify-center text-on-primary-container"}>
<UiIcon name="medal-star" className="h-5 w-5" />
</div>
</label>

<label className={"flex items-center justify-between p-space-xs rounded bg-surface-container cursor-pointer select-none"}>
<div className={"flex items-center gap-1.5"}>
<UiIcon name="skull" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm text-on-surface"}>败者铭牌 (Opponent)</span>
</div>
<div className={"w-4 h-4 rounded bg-primary-container flex items-center justify-center text-on-primary-container"}>
<UiIcon name="medal-star" className="h-5 w-5" />
</div>
</label>

<label className={"flex items-center justify-between p-space-xs rounded bg-surface-container cursor-pointer select-none"}>
<div className={"flex items-center gap-1.5"}>
<UiIcon name="signature" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm text-on-surface"}>签名水印 (Signature)</span>
</div>
<div className={"w-4 h-4 rounded bg-primary-container flex items-center justify-center text-on-primary-container"}>
<UiIcon name="medal-star" className="h-5 w-5" />
</div>
</label>
</div>
</section>

<section className={"px-margin-mobile pt-space-sm pb-space-lg flex flex-col gap-space-sm"}>

<button className={"relative group w-full py-3 px-space-md rounded bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-[0.14em] font-bold shadow-[0_8px_30px_rgba(139,30,30,0.6)] flex items-center justify-center gap-2 hover:bg-inverse-primary active:scale-[0.99] transition-all overflow-hidden"} id={"exportPosterBtn"}>
<div className={"absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/20 to-secondary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"}></div>
<UiIcon name="download" className="h-5 w-5" />
<span>生成高清典藏海报 (EXPORT 4K POSTER)</span>
<UiIcon name="send" className="h-5 w-5" />
</button>

<div className={"flex flex-col gap-space-xs"}>
<span className={"font-label-sm text-[10px] text-outline tracking-widest uppercase text-center"}>INSTANT DISPATCH TO REALMS // 快捷分发</span>
<div className={"grid grid-cols-4 gap-space-xs"}>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group"}>
<div className={"w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center mb-1 group-hover:text-secondary text-on-surface transition-colors"}>
<UiIcon name="camera" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant group-hover:text-on-surface"}>朋友圈/快拍</span>
</button>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group"}>
<div className={"w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center mb-1 group-hover:text-secondary text-on-surface transition-colors"}>
<UiIcon name="forum" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant group-hover:text-on-surface"}>公会殿堂</span>
</button>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group"}>
<div className={"w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center mb-1 group-hover:text-secondary text-on-surface transition-colors"}>
<UiIcon name="wallpaper" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant group-hover:text-on-surface"}>动态壁纸</span>
</button>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors text-center group"} id={"copyHashBtn"}>
<div className={"w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center mb-1 group-hover:text-secondary text-on-surface transition-colors"}>
<UiIcon name="link" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant group-hover:text-on-surface"}>链上凭证</span>
</button>
</div>
</div>
</section>

<div className={"fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-space-md py-2 rounded bg-surface-container-highest text-secondary shadow-[0_8px_24px_rgba(0,0,0,0.8)] flex items-center gap-2 opacity-0 pointer-events-none transition-all duration-300 transform translate-y-2"} id={"toastNotification"}>
<UiIcon name="medal-star" className="h-5 w-5" />
<span className={"font-label-sm text-label-sm font-semibold tracking-wider"} id={"toastMessage"}>战报海报已渲染就绪并存入相册</span>
</div>
</div>
</main><div className={"fixed inset-0 z-50 flex flex-col justify-end bg-surface-container-lowest/80 backdrop-blur-md overflow-hidden transition-all duration-300"} id={"exportShareModal"}>

<div className={"absolute inset-0 cursor-pointer"} id={"modalBackdrop"}></div>

<div className={"relative w-full max-h-[90vh] bg-surface-container-low rounded-t-xl border-t border-outline-variant/60 shadow-[0_-20px_50px_rgba(0,0,0,0.95)] flex flex-col z-10 overflow-hidden pb-safe"}>

<div className={"absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-primary-container/30 blur-[60px] rounded-full pointer-events-none"}></div>

<div className={"relative pt-2.5 pb-2 px-margin-mobile flex flex-col items-center border-b border-outline-variant/30"}>
<div className={"w-10 h-1 bg-surface-container-highest rounded-full mb-2.5"}></div>
<div className={"w-full flex items-center justify-between"}>
<div className={"flex flex-col gap-0.5"}>
<div className={"flex items-center gap-1.5"}>
<span className={"w-2 h-2 rounded-full bg-secondary animate-pulse"}></span>
<span className={"font-label-sm text-[10px] uppercase tracking-[0.2em] text-secondary font-bold"}>4K ULTRA-HD MASTERPIECE READY</span>
<span className={"font-label-sm text-[9px] text-outline font-mono"}>3840×2160 • 18.4MB</span>
</div>
<h3 className={"font-headline-sm text-[17px] text-on-surface tracking-wide uppercase font-semibold"}>
            王权战报已封存 · 典藏海报分发
          </h3>
</div>
<button aria-label={"Close modal"} className={"w-8 h-8 rounded bg-surface-container-high text-on-surface-variant hover:text-secondary hover:bg-surface-container-highest flex items-center justify-center transition-colors"} id={"closeModalBtn"}>
<UiIcon name="seal" className="h-5 w-5" />
</button>
</div>
</div>

<div className={"overflow-y-auto no-scrollbar px-margin-mobile py-space-sm flex flex-col gap-space-sm"}>

<div className={"p-space-xs rounded bg-surface-container flex items-center gap-space-sm border border-outline-variant/40 shadow-md"}>

<div className={"relative w-20 h-28 rounded overflow-hidden shrink-0 shadow-lg border border-secondary/30"}>
<img alt={"Exported Poster Thumbnail"} className={"w-full h-full object-cover object-center contrast-125"} src={posterThumb} loading="lazy" width={512} height={768} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-surface-container-lowest/40"}></div>
<div className={"absolute top-1 left-1 flex items-center gap-0.5"}>
<span className={"font-headline-sm text-[9px] text-secondary font-bold leading-none"}>A</span>
</div>
<div className={"absolute bottom-1 left-1 right-1 flex items-center justify-between"}>
<span className={"font-label-sm text-[8px] text-secondary font-mono tracking-tighter"}>Qf7#</span>
<UiIcon name="seal" className="h-5 w-5" />
</div>
</div>

<div className={"flex flex-col justify-between flex-1 h-28 py-0.5"}>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1"}>
<UiIcon name="medal-laurel" className="h-5 w-5" />
<span className={"font-label-md text-label-md text-on-surface font-semibold truncate"}>THE QUEEN’S REIGN 绝杀王牌</span>
</div>
<span className={"font-label-sm text-[10px] text-on-surface-variant font-mono mt-0.5"}>GM VANE vs LORD CINDERS (#8492)</span>
</div>

<div className={"flex items-center gap-1.5 flex-wrap"}>
<button className={"flex items-center gap-1 px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-secondary text-label-sm font-medium transition-colors"}>
<UiIcon name="download" className="h-5 w-5" />
<span>保存到相册</span>
</button>
<button className={"flex items-center gap-1 px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-sm font-medium transition-colors"}>
<UiIcon name="wallpaper" className="h-5 w-5" />
<span>动态壁纸</span>
</button>
<button className={"flex items-center gap-1 px-2 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-label-sm transition-colors"}>
<UiIcon name="link" className="h-5 w-5" />
<span>复制4K链接</span>
</button>
</div>
</div>
</div>

<div className={"flex flex-col gap-1.5"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-[11px] text-secondary uppercase tracking-[0.16em] font-semibold"}>快捷社交分发 // SOCIAL ECOSYSTEM</span>
<span className={"font-label-sm text-[9px] text-outline uppercase font-mono"}>TAP TO SEND</span>
</div>
<div className={"grid grid-cols-4 gap-space-xs"}>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-center"}>
<div className={"w-10 h-10 rounded-full bg-surface-container-high group-hover:bg-surface-container-highest flex items-center justify-center mb-1 text-secondary transition-colors shadow-sm"}>
<UiIcon name="share" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[11px] text-on-surface group-hover:text-secondary"}>微信好友</span>
</button>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-center"}>
<div className={"w-10 h-10 rounded-full bg-surface-container-high group-hover:bg-surface-container-highest flex items-center justify-center mb-1 text-secondary transition-colors shadow-sm"}>
<UiIcon name="camera" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[11px] text-on-surface group-hover:text-secondary"}>朋友圈/快拍</span>
</button>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-center"}>
<div className={"w-10 h-10 rounded-full bg-surface-container-high group-hover:bg-surface-container-highest flex items-center justify-center mb-1 text-primary transition-colors shadow-sm"}>
<UiIcon name="sparkles" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[11px] text-on-surface group-hover:text-secondary"}>小红书/微博</span>
</button>

<button className={"flex flex-col items-center justify-center p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-center"}>
<div className={"w-10 h-10 rounded-full bg-surface-container-high group-hover:bg-surface-container-highest flex items-center justify-center mb-1 text-on-surface transition-colors shadow-sm"}>
<UiIcon name="airdrop" className="h-5 w-5" />
</div>
<span className={"font-label-sm text-[11px] text-on-surface group-hover:text-secondary"}>隔空投送</span>
</button>
</div>
</div>

<div className={"flex flex-col gap-1.5"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-[11px] text-secondary uppercase tracking-[0.16em] font-semibold"}>战术工坊与公会 // CLAN &amp; ESPORTS</span>
<span className={"font-label-sm text-[9px] text-outline uppercase font-mono"}>GM NETWORK</span>
</div>
<div className={"grid grid-cols-2 sm:grid-cols-3 gap-space-xs"}>

<button className={"flex items-center gap-2 p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-left"}>
<div className={"w-8 h-8 rounded bg-primary-container flex items-center justify-center text-secondary shrink-0 shadow-sm"}>
<UiIcon name="shield" className="h-5 w-5" />
</div>
<div className={"flex flex-col min-w-0 leading-tight"}>
<span className={"cjk font-label-sm text-[11px] text-on-surface font-semibold whitespace-nowrap group-hover:text-secondary"}>血誓公会殿堂</span>
<span className={"font-label-sm text-[9px] text-outline font-mono"}>142 在线大师</span>
</div>
</button>

<button className={"flex items-center gap-2 p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-left"}>
<div className={"w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-secondary shrink-0 shadow-sm"}>
<UiIcon name="forum" className="h-5 w-5" />
</div>
<div className={"flex flex-col min-w-0 leading-tight"}>
<span className={"font-label-sm text-[11px] text-on-surface font-semibold truncate group-hover:text-secondary"}>Discord / X</span>
<span className={"font-label-sm text-[9px] text-outline font-mono"}>Global Hub</span>
</div>
</button>

<button className={"flex items-center gap-2 p-2 rounded bg-surface-container hover:bg-surface-container-high transition-colors group text-left"}>
<div className={"w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary shrink-0 shadow-sm"}>
<UiIcon name="scroll" className="h-5 w-5" />
</div>
<div className={"flex flex-col min-w-0 leading-tight"}>
<span className={"font-label-sm text-[11px] text-on-surface font-semibold truncate group-hover:text-secondary"}>对局名局录</span>
<span className={"font-label-sm text-[9px] text-outline font-mono"}>#8492 入库</span>
</div>
</button>
</div>
</div>

<div className={"flex items-center justify-between p-2 rounded bg-surface-container-lowest border border-primary-container/40 shadow-sm"}>
<div className={"flex items-center gap-2 min-w-0"}>
<div className={"w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-secondary shrink-0"}>
<UiIcon name="token" className="h-5 w-5" />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-sm text-[11px] text-on-surface font-semibold truncate"}>铸造为链上对局永恒圣物 (Relic #8492)</span>
<span className={"font-label-sm text-[9px] text-outline"}>免费附赠NFT数字凭证与防伪水印认证</span>
</div>
</div>
<label className={"flex items-center cursor-pointer"}>
<input defaultChecked className={"hidden"} type={"checkbox"} />
<div className={"w-5 h-5 rounded bg-primary-container flex items-center justify-center text-on-primary-container"}>
<UiIcon name="medal-star" className="h-5 w-5" />
</div>
</label>
</div>

<div className={"pt-1 flex flex-col gap-1.5"}>
<button className={"relative group w-full py-3 px-space-md rounded bg-primary-container text-on-primary-container font-label-lg text-label-lg uppercase tracking-[0.14em] font-bold shadow-[0_8px_30px_rgba(139,30,30,0.6)] flex items-center justify-center gap-2 hover:bg-inverse-primary active:scale-[0.99] transition-all overflow-hidden"} id={"dispatchNowBtn"}>
<UiIcon name="send" className="h-5 w-5" />
<span>一键全网分发 (SHARE IMMEDIATELY)</span>
<UiIcon name="send" className="h-5 w-5" />
</button>
<div className={"flex items-center justify-between px-1"}>
<button className={"font-label-sm text-[10px] text-outline hover:text-secondary uppercase tracking-wider flex items-center gap-1"}>
<UiIcon name="sliders" className="h-5 w-5" />
<span>调整海报水印/边框样式</span>
</button>
<button className={"font-label-sm text-[10px] text-outline hover:text-on-surface uppercase tracking-wider"}>
            复制战报元数据 JSON
          </button>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
}
