import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/matchmaking")({
  head: () => ({
    meta: [
      { title: 'Sovereign Discovery — Matchmaking & Versus' },
      { name: "description", content: 'Find your nemesis: ranked matchmaking, opponent dossier and the pre-duel standoff.' },
      { property: "og:title", content: 'Sovereign Discovery — Matchmaking & Versus' },
      { property: "og:description", content: 'Find your nemesis: ranked matchmaking, opponent dossier and the pre-duel standoff.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Matchmaking,
});

function Matchmaking() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen pb-28">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label="Haptics &amp; Audio" className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-24 overflow-hidden select-none"}>

<section className={"w-full px-margin-mobile pt-space-xs pb-space-sm flex flex-col gap-space-xs relative"}>
<div className={"flex items-center justify-between"}>

<div className={"flex items-center gap-space-xs bg-surface-container-high px-3 py-1.5 rounded-full shadow-md"}>
<span className={"relative flex h-2 w-2"}>
<span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"}></span>
<span className={"relative inline-flex rounded-full h-2 w-2 bg-error"}></span>
</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold"}>SOVEREIGN DISCOVERY // 锁定宿敌</span>
</div>

<button aria-label="Cancel Matchmaking" className={"flex items-center gap-1 px-3 py-1 bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-all rounded"} id="cancel-match-btn">
<span className={"material-symbols-outlined text-[15px] text-error"}>close</span>
<span className={"font-label-sm text-label-sm tracking-wider uppercase"}>撤回战契</span>
</button>
</div>

<div className={"flex items-center justify-between bg-surface-container-low px-space-sm py-2 rounded"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>bolt</span>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md uppercase text-on-surface font-semibold tracking-wider"}>王权闪击 · 3+2 BLITZ</span>
<span className={"font-body-sm text-body-sm text-outline tracking-tight text-[10px]"}>FIDE SENTINEL ACTIVE // 铁血裁决中</span>
</div>
</div>
<div className={"text-right"}>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest block"} id="search-timer">00:08s</span>
<span className={"font-label-sm text-label-sm text-outline tracking-tight text-[9px]"}>EST: 00:12s</span>
</div>
</div>
</section>

<div className={"relative w-full px-margin-mobile flex flex-col gap-space-xs"}>

<div className={"relative w-full bg-surface-container-low rounded-lg p-space-sm shadow-xl overflow-hidden"}>

<div className={"absolute -right-8 -top-8 w-40 h-40 bg-tertiary-container/30 rounded-full blur-3xl pointer-events-none"}></div>
<div className={"relative z-10 flex flex-col gap-space-xs"}>

<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"relative w-14 h-14 rounded bg-surface-container-highest flex-shrink-0 shadow-lg overflow-hidden"}>
<img className={"w-full h-full object-cover"} alt="Dark gothic armored chess grandmaster with twisted obsidian ram horns, glowing blood red occult eyes, veiled in crimson mist and ancient baroque gold etchings, dark oil painting hyper-detailed digital art." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZuz-liiu2Nd7RjSao4gzG6ZTdlxglAag0c1XXtCA3597QN-gW4KosMmJsKIfwqF6edH3RbgT9fVkQsMkr3cyYP3jTIFtQHeFh_FKWtXdE5GQ5-1joRWwU5dhWrSkr4mGlSnI42_cHvMvcIip3j2vX3GbAxqeSxH0qCqv-Ilb5rBJOFvmyyFMRECN6zZJu8Tu95TjH8_lWh3Fr8fp4T2etG5NL2TiEyj-Yke3zhXPdy4QVRIC0Su08kg"/>
<span className={"absolute bottom-0 right-0 bg-primary-container text-on-primary-container font-label-sm text-[9px] px-1 rounded-tl uppercase font-bold"}>GM</span>
</div>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>Thorne</span>
<span className={"font-label-sm text-label-sm text-outline text-[11px]"}>索恩宗师</span>
</div>
<div className={"flex items-center gap-2 mt-0.5"}>
<span className={"bg-surface-container-high text-secondary font-label-sm text-label-sm px-1.5 py-0.5 rounded font-bold"}>2,492 ELO</span>
<span className={"font-label-sm text-label-sm text-error uppercase tracking-wider"}>RANK #29</span>
</div>
</div>
</div>
<div className={"text-right flex flex-col items-end"}>
<span className={"material-symbols-outlined text-secondary text-[22px]"}>skull</span>
<span className={"font-label-sm text-label-sm text-outline uppercase tracking-widest text-[9px] mt-0.5"}>BLACK SIEGE</span>
</div>
</div>

<div className={"bg-surface-container/90 p-space-xs rounded flex flex-col gap-1"}>
<div className={"flex items-center justify-between text-[11px]"}>
<span className={"text-primary font-label-md text-label-md flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[13px]"}>military_tech</span>
              黑曜先锋 · 狂热战意 [COVENANT]
            </span>
<span className={"text-secondary font-label-sm text-label-sm"}>AGGRESSION 98</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-tight"}>
            ⚠️ 极致进攻狂人 · 擅法兰西防御逆袭；弱点侦测：残局极易冒进失准。
          </p>
</div>
</div>
</div>

<div className={"relative w-full py-space-xs flex flex-col items-center justify-center my-[-4px] z-20"}>
<div className={"relative flex items-center justify-center w-full"}>

<div className={"h-[1px] flex-1 bg-gradient-to-r from-transparent via-primary-container to-secondary/40"}></div>

<div className={"relative mx-3 flex items-center justify-center"}>
<div className={"w-14 h-14 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(139,30,30,0.85)]"}>
<div className={"w-11 h-11 rounded-full bg-primary-container flex items-center justify-center shadow-inner"}>
<span className={"font-headline-md text-headline-md text-secondary font-black tracking-tighter italic"}>VS</span>
</div>
</div>
<span className={"material-symbols-outlined text-secondary absolute -top-1 text-[13px] animate-pulse"}>crisis_alert</span>
</div>
<div className={"h-[1px] flex-1 bg-gradient-to-l from-transparent via-primary-container to-secondary/40"}></div>
</div>

<div className={"mt-1 flex items-center gap-2 px-3 py-0.5 rounded-full bg-surface-container-high/80"}>
<span className={"font-label-sm text-label-sm text-secondary tracking-wider font-semibold"}>历史交锋 4战2胜1平1负</span>
<span className={"w-1 h-1 rounded-full bg-outline"}></span>
<span className={"font-label-sm text-label-sm text-primary tracking-widest font-bold"}>均势宿命死斗</span>
</div>
</div>

<div className={"relative w-full bg-surface-container-low rounded-lg p-space-sm shadow-xl overflow-hidden"}>

<div className={"absolute -left-8 -bottom-8 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"}></div>
<div className={"relative z-10 flex flex-col gap-space-xs"}>

<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"relative w-14 h-14 rounded bg-surface-container-highest flex-shrink-0 shadow-lg overflow-hidden"}>
<img className={"w-full h-full object-cover"} alt="Sinister aristocratic vampire chess champion with pale skin, platinum parted hair, regal baroque velvet collar, cold calculating eyes holding a carved ivory king piece in dark royal chamber." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQXhGYmJG3c1ZduIQgnuwo-EdA6lOHGQ0w0LvUohUwoEBkehI8hfE8DH60AWWYVj5n6Bzzw2oFrt45DFK_qtGLGZB39MIGBVDD1k0ho6RyWC5u47pB_j4Ezbex3TUcwjmoVoqtsBP550LsuthML_JZjlVpFPElI5KMFTRuofzF3EHZ96aA9ih2ymwjqjW1R0sv2srjonngtN7bIgW6gpkKrg3vUINt1i_npjD8670qnjMeOOORl_QKtQ"/>
<span className={"absolute bottom-0 right-0 bg-secondary text-on-secondary font-label-sm text-[9px] px-1 rounded-tl uppercase font-bold"}>YOU</span>
</div>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1.5"}>
<span className={"font-headline-sm text-headline-sm text-on-surface font-bold"}>Vane</span>
<span className={"font-label-sm text-label-sm text-secondary text-[11px]"}>夜幕执子</span>
</div>
<div className={"flex items-center gap-2 mt-0.5"}>
<span className={"bg-surface-container-high text-on-surface font-label-sm text-label-sm px-1.5 py-0.5 rounded font-bold"}>2,480 ELO</span>
<span className={"font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider"}>WHITE DOMINION</span>
</div>
</div>
</div>
<div className={"text-right flex flex-col items-end"}>
<span className={"material-symbols-outlined text-primary text-[22px]"}>crown</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest text-[9px] mt-0.5"}>FIRST STRIKE</span>
</div>
</div>

<div className={"bg-surface-container/90 p-space-xs rounded flex flex-col gap-1"}>
<div className={"flex items-center justify-between text-[11px]"}>
<span className={"text-secondary font-label-md text-label-md flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[13px]"}>shield_with_heart</span>
              猩红女帝 · 威压领域 (共鸣 VII)
            </span>
<span className={"text-on-surface-variant font-label-sm text-label-sm"}>CALCULATION 94</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant text-[11px] leading-tight"}>
            行刑者命格：沉稳韧性 96，专精以后翼马前哨斩杀与窒息式兵阵碾碎对手。
          </p>
</div>
</div>
</div>
</div>

<section className={"w-full px-margin-mobile mt-space-sm flex flex-col gap-space-xs"}>
<div className={"w-full bg-surface-container-high p-space-xs rounded flex items-center justify-between shadow-md"}>

<div className={"flex items-center gap-2"}>
<div className={"w-7 h-7 rounded-full bg-tertiary-container/40 flex items-center justify-center animate-pulse"}>
<span className={"material-symbols-outlined text-primary text-[16px]"}>favorite</span>
</div>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-1"}>
<span className={"font-label-md text-label-md text-on-surface font-bold tracking-widest"} id="bpm-val">124 BPM</span>
<span className={"w-1.5 h-1.5 rounded-full bg-error"}></span>
</div>
<span className={"font-label-sm text-label-sm text-outline text-[9px] uppercase tracking-wider"}>ADRENALINE SURGE</span>
</div>
</div>

<div className={"w-24 h-6 flex items-center"}>
<svg className={"w-full h-full text-error"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 100 24">
<path d="M0 12 H25 L32 3 L38 21 L45 8 L52 16 L58 12 H100" strokeLinecap="round" strokeLinejoin="round" />
</svg>
</div>

<div className={"text-right"}>
<span className={"font-label-md text-label-md text-secondary font-bold"} id="deploy-countdown">03s</span>
<span className={"font-label-sm text-label-sm text-outline block text-[9px]"}>战场展开中</span>
</div>
</div>

<div className={"w-full bg-surface-container-lowest h-1 rounded overflow-hidden"}>
<div className={"bg-gradient-to-r from-primary via-secondary to-error h-full w-[70%] transition-all duration-300"} id="countdown-progress"></div>
</div>
</section>

<section className={"w-full px-margin-mobile mt-space-sm flex flex-col gap-space-xs"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm text-outline uppercase tracking-widest"}>PRE-MATCH DOCTRINE // 开局战术调配</span>
<span className={"font-label-sm text-label-sm text-secondary flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-[13px]"}>graphic_eq</span>
        战鼓已就位
      </span>
</div>

<div className={"grid grid-cols-2 gap-space-xs"}>

<button className={"flex items-center justify-between p-2.5 bg-surface-container rounded text-left transition-all active:scale-[0.98]"} id="opening-btn">
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md text-on-surface truncate font-semibold"}>西西里 · 纳伊道夫</span>
<span className={"font-label-sm text-label-sm text-secondary truncate text-[10px]"}>预备锋线兵阵</span>
</div>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>verified</span>
</button>

<button className={"flex items-center justify-between p-2.5 bg-surface-container rounded text-left transition-all active:scale-[0.98]"} id="zen-btn">
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md text-on-surface truncate font-semibold"}>全神专注 (ZEN)</span>
<span className={"font-label-sm text-label-sm text-outline truncate text-[10px]"} id="zen-status">隐藏表情与杂音</span>
</div>
<span className={"material-symbols-outlined text-outline text-[18px]"} id="zen-icon">visibility_off</span>
</button>
</div>

<button className={"w-full py-3 mt-space-xs bg-primary-container text-on-primary-container rounded font-label-lg text-label-lg font-bold uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all hover:bg-error-container active:scale-[0.99]"} id="strike-btn">
<span className={"material-symbols-outlined text-[20px]"}>swords</span>
<span>踏入黑曜殿堂 (IMMEDIATE STRIKE)</span>
</button>
</section>


</div></main>
    </div>
  );
}
