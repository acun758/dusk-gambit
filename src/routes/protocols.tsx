import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/protocols")({
  head: () => ({
    meta: [
      { title: "Sanctum of Arbiters \u2014 Match Protocols" },
      { name: "description", content: "Choose your covenant: pure rated ladder or relic-empowered conquest with Stockfish oversight." },
      { property: "og:title", content: "Sanctum of Arbiters \u2014 Match Protocols" },
      { property: "og:description", content: "Choose your covenant: pure rated ladder or relic-empowered conquest with Stockfish oversight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Protocols,
});

function Protocols() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-28 px-margin-mobile gap-space-md"}>

<section className={"flex flex-col gap-space-xs mt-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-1.5 bg-secondary rotate-45"}></span>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>Sanctum of Arbiters</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest flex items-center gap-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-pulse"}></span>
        Stockfish 16 Sentinel Active
      </span>
</div>

<div className={"relative bg-surface-container-low p-space-md shadow-xl overflow-hidden"}>
<div className={"absolute -right-8 -top-8 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"}></div>
<div className={"relative z-10 flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-md text-label-md text-primary uppercase tracking-widest"}>Ritual &amp; Mind Covenant</span>
<div className={"flex items-center gap-1 bg-surface-container-highest px-space-xs py-0.5"}>
<span className={"material-symbols-outlined text-[13px] text-secondary"}>verified</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>FIDE Verified Master</span>
</div>
</div>
<h1 className={"font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-wider"}>对弈法则与心智抉择</h1>
<div className={"flex flex-wrap items-center gap-space-xs pt-space-xs"}>
<span className={"bg-surface-container-high px-space-xs py-0.5 text-secondary font-label-sm text-label-sm uppercase"}>2480 ELO · 宗师</span>
<span className={"bg-surface-container-high px-space-xs py-0.5 text-on-surface-variant font-label-sm text-label-sm"}>冷静沉着 · 防御大师</span>
<span className={"bg-primary-container/40 px-space-xs py-0.5 text-primary-fixed font-label-sm text-label-sm"}>胜率 68.4% (842场)</span>
</div>
</div>
</div>
</section>

<section className={"flex flex-col gap-space-sm"} id={"modeSelectorGroup"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-md text-label-md uppercase text-on-surface-variant tracking-widest"}>选择对弈信条 / Select Protocol</span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest cursor-pointer"} id={"resetModeNotice"}>双轨天梯并立</span>
</div>

<div className={"mode-card group relative bg-surface-container-low transition-all duration-300 cursor-pointer overflow-hidden p-space-md shadow-xl"} id={"modeCardA"}>
<div className={"mode-active-indicator absolute left-0 top-0 bottom-0 w-1 bg-secondary hidden"}></div>
<div className={"flex flex-col gap-space-sm"}>
<div className={"flex items-start justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-10 h-10 bg-surface-container-highest flex items-center justify-center"}>
<span className={"material-symbols-outlined text-secondary text-[22px]"}>balance</span>
</div>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>Standard &amp; Rated</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>· 纯正天梯</span>
</div>
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>王权律法 · 纯粹正统棋规</h2>
</div>
</div>
<div className={"mode-check-a w-5 h-5 flex items-center justify-center bg-surface-container-high"}>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>check</span>
</div>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant"}>
          国际棋联严苛公证机制。零属性外力侵染，纯粹算力与独立思维修养的绝对较量。实装天梯排位分加权与 Stockfish 16 全量作弊巡查。
        </p>

<div className={"grid grid-cols-1 min-[360px]:grid-cols-3 gap-space-xs pt-space-xs"}>
<div className={"tc-btn active bg-surface-container-highest hover:bg-surface-bright px-space-xs py-space-xs flex flex-col items-center justify-center cursor-pointer transition-colors"} data-tc={"blitz"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-wider"}>3 + 2</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant text-center leading-snug"}>Blitz 闪击</span>
</div>
<div className={"tc-btn bg-surface-container px-space-xs py-space-xs flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-surface-bright"} data-tc={"rapid"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-wider"}>10 + 0</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant text-center leading-snug"}>Rapid 疾速</span>
</div>
<div className={"tc-btn bg-surface-container px-space-xs py-space-xs flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-surface-bright"} data-tc={"classical"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-wider"}>30 + 15</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant text-center leading-snug"}>Classical 慢棋</span>
</div>
</div>
<div className={"flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-space-xs"}>
<span className={"flex items-center gap-1"}><span className={"material-symbols-outlined text-[14px] text-secondary"}>gavel</span> 国际棋规第14条公证标准</span>
<span className={"text-secondary tracking-widest uppercase"}>Elo ±18 Rating</span>
</div>
</div>
</div>

<div className={"mode-card group relative bg-surface-container transition-all duration-300 cursor-pointer overflow-hidden p-space-md shadow-2xl"} id={"modeCardB"}>
<div className={"mode-active-indicator absolute left-0 top-0 bottom-0 w-1 bg-primary"}></div>
<div className={"absolute right-0 top-0 w-40 h-40 bg-gradient-to-bl from-primary-container/30 to-transparent pointer-events-none"}></div>
<div className={"relative z-10 flex flex-col gap-space-sm"}>
<div className={"flex items-start justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<div className={"w-10 h-10 bg-primary-container flex items-center justify-center"}>
<span className={"material-symbols-outlined text-primary-fixed text-[22px]"}>psychology</span>
</div>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest"}>Resonance &amp; Relic</span>
<span className={"bg-primary-container/80 px-1 py-0.2 text-[9px] font-label-sm text-primary-fixed"}>暗黑专属</span>
</div>
<h2 className={"font-headline-sm text-headline-sm text-on-surface"}>暗黑王权 · 人格化意志契约</h2>
</div>
</div>
<div className={"mode-check-b w-5 h-5 flex items-center justify-center bg-primary-container"}>
<span className={"material-symbols-outlined text-on-primary-container text-[16px]"}>done_all</span>
</div>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant"}>
          传统棋规不减分毫，但令沉睡的棋魂苏醒。赋予皇后与先锋骑士视效战意光环，击杀触发高定处决回放与心跳威压，沉浸式统治战场。
        </p>

<div className={"flex flex-wrap gap-space-xs pt-space-xs"}>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-xs py-1"}>
<span className={"material-symbols-outlined text-[14px] text-primary"}>swords</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>黑曜狂战特写</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-xs py-1"}>
<span className={"material-symbols-outlined text-[14px] text-primary"}>heart_broken</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>威压心跳光环</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-xs py-1"}>
<span className={"material-symbols-outlined text-[14px] text-primary"}>auto_fix_high</span>
<span className={"font-label-sm text-label-sm text-on-surface"}>暗金击杀血契</span>
</div>
</div>
<div className={"flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm pt-space-xs"}>
<span className={"flex items-center gap-1 text-primary-fixed-dim"}><span className={"material-symbols-outlined text-[14px]"}>bolt</span> 棋规严谨 100% 同步</span>
<span className={"text-primary tracking-widest uppercase"}>Rank &amp; Prestige Pool</span>
</div>
</div>
</div>
</section>

<section className={"flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-[16px] text-primary"}>shield</span>
<span className={"font-label-md text-label-md uppercase tracking-widest text-on-surface"}>当前出战契约槽位 (Active Covenants)</span>
</div>
<button className={"font-label-sm text-label-sm text-secondary hover:underline tracking-wider uppercase"}>替换棋魂</button>
</div>

<div className={"grid grid-cols-2 gap-space-xs"}>

<div className={"relative bg-surface-container-low p-space-sm flex flex-col gap-space-xs overflow-hidden"}>
<div className={"w-full h-24 relative overflow-hidden bg-surface-container-highest"}>
<img className={"w-full h-full object-cover"} data-alt={"Dark fantasy gothic queen chess piece sculpture carved from translucent red ruby and obsidian with glowing gold filigree and dramatic dark rim lighting"} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuANqv2blwHNcxiH42qbh_UUo8XSANqngg_cN7cRnEz5w7IiXAJS6rDUAOONZEjUXHax3Bew_EDe9MA_lrtzs6cRu9l5gRUQrZeagCJgRFXPz2D5ce9zrQHumEip_gS8fTDTSVhkkT_drJ0002Hx_w5r06Jc-XgL8A0YyLA1ELbpmNeexE4u3HgDedNHW_dYf-bj9wuYHFhrCuyaugIs-JXDenjLp0kvlmWwA-f1yqDX01oVfVAcxSOMDg"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"}></div>
<span className={"absolute top-1.5 left-1.5 bg-primary-container text-on-primary-container px-1 py-0.5 font-label-sm text-label-sm"}>QUEEN CORE</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface truncate"}>猩红女帝 · 威压领域</span>
<span className={"font-label-sm text-label-sm text-primary"}>皇室威压 · 心跳降速光环</span>
</div>
<div className={"flex items-center justify-between pt-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>共鸣等级 VII</span>
<span className={"material-symbols-outlined text-[16px] text-secondary"}>motion_photos_on</span>
</div>
</div>

<div className={"relative bg-surface-container-low p-space-sm flex flex-col gap-space-xs overflow-hidden"}>
<div className={"w-full h-24 relative overflow-hidden bg-surface-container-highest"}>
<img className={"w-full h-full object-cover"} data-alt={"Menacing armored obsidian gothic chess knight piece with blood red eyes and antique gold cracked battle scars in deep shadow chiaroscuro"} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuDiJDw26qTkRHCyaDvOzXxZJ1IbjUEu6xhFb0GLIUjvfWrFSyCGuA8ruOmPvqghMekTtko79WXD4fd6AzG1r-WfhoumtSrsatkNjt6HO52bW9mh4j_oG9vTzFrKwoWoGqFSiQLLqli6o-NtUZmnxLEd-z3l8nQXH2aO3SftIenNkrUqBQP0BCda2U2AwyfD_5OGe7VtbPdlEGgVwwJQNsPtduToV4Xfet9Umr-_Og5m0v6BJjJfMhCxhw"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"}></div>
<span className={"absolute top-1.5 left-1.5 bg-surface-container-high text-secondary px-1 py-0.5 font-label-sm text-label-sm"}>KNIGHT SOUL</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface truncate"}>黑曜先锋 · 破阵冲锋</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>跃进斩击 · 处决视效实装</span>
</div>
<div className={"flex items-center justify-between pt-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>共鸣等级 V</span>
<span className={"material-symbols-outlined text-[16px] text-secondary"}>flash_on</span>
</div>
</div>
</div>
</section>

<section className={"bg-surface-container-low p-space-sm flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-2 h-2 rounded-full bg-secondary animate-ping"}></span>
<span className={"font-label-sm text-label-sm text-on-surface tracking-wider uppercase"}>对弈池实时匹配中</span>
</div>
<div className={"flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant"}>
<span>宗师在线: <strong className={"text-secondary font-medium"}>1,248</strong></span>
<span>平均耗时: <strong className={"text-on-surface font-medium"}>4.2s</strong></span>
</div>
</section>

<section className={"flex flex-col gap-space-sm pt-space-xs"}>

<div className={"grid grid-cols-2 gap-space-xs bg-surface-container p-space-xs"}>
<div className={"flex items-center justify-between px-space-xs py-1 bg-surface-container-high cursor-pointer"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>对手分段</span>
<span className={"font-label-sm text-label-sm text-secondary font-semibold"}>2450 - 2550 ELO</span>
</div>
<div className={"flex items-center justify-between px-space-xs py-1 bg-surface-container-high cursor-pointer"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>阵营誓约</span>
<span className={"font-label-sm text-label-sm text-primary font-semibold"}>黑白随机 (Fair)</span>
</div>
</div>

<div className={"relative w-full"}>
<button className={"w-full py-3.5 px-space-md bg-primary-container hover:bg-tertiary-container active:scale-[0.99] transition-all flex items-center justify-between shadow-2xl relative overflow-hidden group"} id={"seekBattleBtn"}>
<div className={"absolute inset-0 bg-gradient-to-r from-secondary-container/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"}></div>
<div className={"flex items-center gap-space-xs z-10"}>
<div className={"w-7 h-7 bg-surface-container-lowest flex items-center justify-center"}>
<span className={"material-symbols-outlined text-secondary text-[18px] group-hover:rotate-45 transition-transform duration-300"}>swords</span>
</div>
<div className={"flex flex-col items-start"}>
<span className={"font-label-md text-label-md text-on-primary font-bold uppercase tracking-widest"}>进入暗黑战阵 · 寻找对手</span>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider"}>COMMENCE CHESS ARENA QUEUE</span>
</div>
</div>
<div className={"flex items-center gap-1 z-10"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest hidden sm:inline"}>RAPID SEARCH</span>
<span className={"material-symbols-outlined text-primary-fixed text-[20px] group-hover:translate-x-1 transition-transform"}>arrow_forward</span>
</div>
</button>
</div>

<div className={"hidden fixed inset-x-0 bottom-16 bg-surface-container-lowest/95 backdrop-blur-md p-space-md shadow-2xl z-40 flex flex-col gap-space-sm"} id={"matchDrawer"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-2.5 h-2.5 bg-primary rounded-full animate-ping"}></span>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>正在连接王权棋局...</span>
</div>
<button className={"font-label-sm text-label-sm text-on-surface-variant hover:text-error uppercase"} id={"cancelQueueBtn"}>取消匹配</button>
</div>
<div className={"w-full bg-surface-container-highest h-1 overflow-hidden"}>
<div className={"bg-primary h-full w-2/3 animate-[pulse_1.5s_infinite]"}></div>
</div>
<div className={"flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm"}>
<span>协议: <strong className={"text-secondary"} id={"activeProtocolLabel"}>暗黑王权 · 人格化意志契约</strong></span>
<span>匹配时长: <span className={"text-on-surface"} id={"matchTimer"}>00:03</span></span>
</div>
</div>
</section>
</div>
</main>
    </div>
  );
}
