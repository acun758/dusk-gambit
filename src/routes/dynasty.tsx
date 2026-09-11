import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dynasty")({
  head: () => ({
    meta: [
      { title: 'Dynasty Sanctum — Ranked Ladder & Titles' },
      { name: "description", content: 'Season ladder, tier progression and the hall of titles in the Dynasty Sanctum.' },
      { property: "og:title", content: 'Dynasty Sanctum — Ranked Ladder & Titles' },
      { property: "og:description", content: 'Season ladder, tier progression and the hall of titles in the Dynasty Sanctum.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dynasty,
});

function Dynasty() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen pb-28">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button ariaLabel="Haptics &amp; Audio" className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-24 space-y-4 px-margin-mobile"}>

<section className={"flex flex-col w-full bg-surface-container-lowest p-space-md shadow-xl relative overflow-hidden"}>
<div className={"absolute -right-8 -top-8 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"}></div>
<div className={"flex items-center justify-between z-10"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-1.5 bg-primary rotate-45 inline-block"}></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Sanctum Archive // IX</span>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-xs py-0.5"}>
<span className={"material-symbols-outlined text-secondary text-[14px]"}>hourglass_top</span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest"}>18D REMAINING</span>
</div>
</div>
<div className={"mt-space-xs z-10"}>
<h1 className={"font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-wider"}>DYNASTY SANCTUM</h1>
<p className={"font-label-md text-label-md text-primary tracking-widest uppercase mt-0.5"}>SEASON IV: AGE OF CRIMSON QUEENS // 猩红女帝纪元</p>
</div>
</section>

<section className={"flex flex-col w-full bg-surface-container p-space-md shadow-xl relative"}>
<div className={"flex items-start justify-between"}>
<div className={"flex items-center gap-space-md"}>
<div className={"relative w-16 h-16 bg-surface-container-lowest flex items-center justify-center shadow-lg"}>
<div className={"absolute inset-0 bg-gradient-to-br from-primary-container/30 to-transparent"}></div>
<span className={"material-symbols-outlined text-primary text-[36px] drop-shadow-[0_0_12px_rgba(255,179,173,0.6)]"}>workspace_premium</span>
<div className={"absolute -bottom-1 bg-primary-container text-on-primary-container px-1 py-0.2"}>
<span className={"font-label-sm text-label-sm tracking-widest"}>#38</span>
</div>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wide truncate"}>神圣大宗师</span>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>verified</span>
</div>
<span className={"font-label-md text-label-md text-on-surface-variant uppercase tracking-widest"}>Grandmaster Titan</span>
<div className={"flex items-center gap-space-sm mt-1"}>
<span className={"font-label-md text-label-md text-secondary"}>ELO 2,480</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Top 0.05% Server</span>
</div>
</div>
</div>
<div className={"text-right"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-widest"}>Next Realm</span>
<span className={"font-label-md text-label-md text-primary font-bold"}>20 ELO to Rank X</span>
</div>
</div>

<div className={"w-full mt-space-md bg-surface-container-lowest p-space-xs shadow-inner"}>
<div className={"flex justify-between items-center mb-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Tier IX: Grandmaster Titan</span>
<span className={"font-label-sm text-label-sm text-primary"}>2480 / 2500</span>
</div>
<div className={"w-full h-2 bg-surface-container-high overflow-hidden relative"}>
<div className={"h-full bg-gradient-to-r from-primary-container via-primary to-secondary w-[90%] shadow-[0_0_10px_rgba(233,195,73,0.5)]"}></div>
</div>
<div className={"flex justify-between items-center mt-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>2400 ELO (Base)</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-semibold"}>永夜棋圣 (Sovereign)</span>
</div>
</div>
</section>

<section className={"flex flex-col w-full bg-surface-container p-space-md shadow-xl"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>account_tree</span>
<h2 className={"font-headline-sm text-headline-sm text-on-surface tracking-wider"}>天梯九重王座</h2>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Dynasty Ladder</span>
</div>

<div className={"flex flex-col space-y-space-xs relative"}>

<div className={"p-space-sm bg-surface-container-lowest opacity-75 hover:opacity-100 transition-opacity flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-on-surface-variant text-[20px]"}>lock</span>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>永夜棋圣</span>
<span className={"font-label-sm text-label-sm bg-primary-container text-on-primary-container px-1"}>TIER X</span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>Sovereign Immortal · 2500+ ELO</span>
</div>
</div>
<span className={"material-symbols-outlined text-on-surface-variant text-[18px]"}>crown</span>
</div>

<div className={"p-space-sm bg-surface-container-high relative shadow-lg"}>
<div className={"absolute left-0 top-0 bottom-0 w-1 bg-secondary"}></div>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<div className={"w-10 h-10 bg-primary-container flex items-center justify-center shrink-0 shadow-md"}>
<span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span>
</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>神圣大宗师</span>
<span className={"font-label-sm text-label-sm bg-secondary text-on-secondary px-1 font-semibold"}>ACTIVE</span>
</div>
<span className={"font-body-sm text-body-sm text-primary truncate"}>Grandmaster Titan · 2400-2499 ELO</span>
</div>
</div>
<div className={"flex flex-col items-end shrink-0"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>Unlocked</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>虚空审判 (Void Finisher)</span>
</div>
</div>
</div>

<div className={"p-space-sm bg-surface-container-lowest flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>check_circle</span>
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>战争行刑官</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>War Executioner · 2200-2399 ELO</span>
</div>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Mastered</span>
</div>

<div className={"p-space-sm bg-surface-container-lowest flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>check_circle</span>
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>曜石先锋</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>Obsidian Vanguard · 2000-2199 ELO</span>
</div>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Mastered</span>
</div>

<div className={"p-space-sm bg-surface-container-lowest flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>check_circle</span>
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>见习执子者</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>Neophyte Arbiters · 1200-1999 ELO</span>
</div>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Mastered</span>
</div>
</div>
</section>

<section className={"flex flex-col w-full bg-surface-container p-space-md shadow-xl"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>psychology</span>
<h2 className={"font-headline-sm text-headline-sm text-on-surface tracking-wider"}>心智勋章殿堂</h2>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Tactical Codex</span>
</div>
<div className={"grid grid-cols-1 gap-space-xs"}>

<div className={"p-space-sm bg-surface-container-lowest flex items-start gap-space-sm"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>gavel</span>
</div>
<div className={"flex flex-col min-w-0 flex-1"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>冷血残局行刑者</span>
<span className={"font-label-sm text-label-sm text-secondary bg-surface-container-high px-1 py-0.2 uppercase font-bold"}>Grade S+</span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant mt-0.5"}>Cold-Blooded Endgame Hunter</span>
<div className={"flex items-center gap-space-xs mt-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-primary"}></span>
<span className={"font-label-sm text-label-sm text-primary"}>100% Winrate when remaining pieces ≤ 5</span>
</div>
</div>
</div>

<div className={"p-space-sm bg-surface-container-lowest flex items-start gap-space-sm"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-primary text-[20px]"}>electric_bolt</span>
</div>
<div className={"flex flex-col min-w-0 flex-1"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>战术潜伏毒蛇</span>
<span className={"font-label-sm text-label-sm text-secondary bg-surface-container-high px-1 py-0.2 uppercase font-bold"}>Grade S</span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant mt-0.5"}>Tactical Viper</span>
<div className={"flex items-center gap-space-xs mt-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary"}></span>
<span className={"font-label-sm text-label-sm text-secondary"}>Sacrifice Breakthrough Specialist (42 Clears)</span>
</div>
</div>
</div>

<div className={"p-space-sm bg-surface-container-lowest flex items-start gap-space-sm"}>
<div className={"w-10 h-10 bg-surface-container-high flex items-center justify-center shrink-0"}>
<span className={"material-symbols-outlined text-on-surface-variant text-[20px]"}>monitor_heart</span>
</div>
<div className={"flex flex-col min-w-0 flex-1"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>钢铁心智抗压者</span>
<span className={"font-label-sm text-label-sm text-secondary bg-surface-container-high px-1 py-0.2 uppercase font-bold"}>Grade SS</span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant mt-0.5"}>Iron Will Resilient</span>
<div className={"flex items-center gap-space-xs mt-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-primary"}></span>
<span className={"font-label-sm text-label-sm text-primary"}>0 Blunders under high pressure (BPM &gt; 140)</span>
</div>
</div>
</div>
</div>
</section>

<section className={"flex flex-col w-full bg-surface-container p-space-md shadow-xl"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>redeem</span>
<h2 className={"font-headline-sm text-headline-sm text-on-surface tracking-wider"}>赛季专属赏金</h2>
</div>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest"}>Exclusive Vault</span>
</div>
<div className={"flex flex-col bg-surface-container-lowest p-space-sm"}>
<div className={"relative w-full h-44 bg-surface-container-high overflow-hidden flex items-center justify-center"}>
<img className={"object-cover w-full h-full opacity-80"} dataAlt="Intricate dark gothic chess Queen figurine crafted from glossy black obsidian stone and sharp red ruby ornaments, illuminated with atmospheric crimson embers and dramatic rim lighting, dark regal court backdrop, photorealistic 8k render" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9xNXLxPo5a2K5xy9c8_xCBZx0jnRlQrRpFFz1OCI7Wrp9LiZls4-qkCnX945ptusIVgS9wkXygcOGCuDOtmZkTwIlgLCim8rQZg9e9MwOQhHBWVLzPOvz_kk11S4WRvMdTRgKh92oJK_WTt7CMgqKegsjPoX36rv5aHWKEHekBSy8McTF5yN7eIefbxjhCIdoQqyit0T0KYXt2f3QmCC5sKKn9HUahgVWQCUht1UG4O6e42W-8KCl6Q"/>
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent"}></div>
<div className={"absolute bottom-2 left-2 flex flex-col"}>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider"}>黑曜女帝 · 永夜王冠</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>Season Exclusive Piece Skin</span>
</div>
<div className={"absolute top-2 right-2 bg-primary-container px-2 py-0.5 shadow-md"}>
<span className={"font-label-sm text-label-sm text-on-primary-container uppercase tracking-widest font-semibold"}>Tier IX Reward</span>
</div>
</div>
<div className={"grid grid-cols-2 gap-space-xs mt-space-xs"}>
<div className={"bg-surface-container p-space-xs flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>flare</span>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md text-on-surface truncate"}>终结技: 裂地雷罚</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Finisher FX</span>
</div>
</div>
<div className={"bg-surface-container p-space-xs flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>shield</span>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md text-on-surface truncate"}>血契纹章头像框</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Grandmaster Frame</span>
</div>
</div>
</div>
</div>
</section>

<section className={"flex flex-col w-full pt-space-xs pb-space-sm"}>
<button className={"w-full h-12 bg-primary-container text-on-primary-container flex items-center justify-center gap-space-sm shadow-2xl active:scale-[0.98] transition-all duration-150"} id="enterDynastyBtn">
<span className={"material-symbols-outlined text-secondary text-[20px]"}>swords</span>
<span className={"font-label-lg text-label-lg uppercase tracking-widest font-semibold"}>进入天梯征战 (ENTER DYNASTY BATTLE)</span>
</button>
</section>
</div>
</main><nav className={"fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"} dataActiveClasses="text-secondary bg-surface-container-high/60"><div className={"h-16 px-gutter-mobile flex items-center justify-around"}><a ariaCurrent="page" className={"flex flex-col items-center justify-center w-full h-11 transition-colors gap-0.5 text-secondary bg-surface-container-high/60"} dataPath="battle" href="#"><span className={"material-symbols-outlined text-[20px]"}>swords</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Battle</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} dataPath="tactics" href="#"><span className={"material-symbols-outlined text-[20px]"}>chess_knight</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Tactics</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} dataPath="the-vault" href="#"><span className={"material-symbols-outlined text-[20px]"}>auto_stories</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Vault</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} dataPath="dynasty" href="#"><span className={"material-symbols-outlined text-[20px]"}>shield</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Dynasty</span></a></div></nav>
    </div>
  );
}
