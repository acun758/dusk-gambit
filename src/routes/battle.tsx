import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/battle")({
  head: () => ({
    meta: [
      { title: "Active Confrontation \u2014 Blood Sovereign" },
      { name: "description", content: "Live grandmaster duel with engine evaluation, brilliant move callouts and slow-motion execution." },
      { property: "og:title", content: "Active Confrontation \u2014 Blood Sovereign" },
      { property: "og:description", content: "Live grandmaster duel with engine evaluation, brilliant move callouts and slow-motion execution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Battle,
});

function Battle() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-16 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><button aria-label={"Withdraw"} className={"w-11 h-11 flex items-center justify-center text-secondary hover:text-secondary-fixed transition-colors"}><span className={"material-symbols-outlined text-[24px]"}>arrow_back</span></button><div className={"flex flex-col"}><span className={"font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider"}>Active Confrontation</span></div></div><div className={"flex items-center gap-space-xs"}><button aria-label={"Game Settings"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>tune</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-16 bg-surface min-h-screen"}><div className={"flex flex-col w-full text-on-surface select-none pb-safe"}>

<div className={"w-full px-margin-mobile pt-space-xs pb-space-sm flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full shadow-sm"}>
<span className={"w-2 h-2 rounded-full bg-secondary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>WeChat Mini 3D Engine · v3.4.1</span>
</div>

<div className={"flex items-center bg-surface-container-highest/80 backdrop-blur-md px-space-sm py-1 rounded-full shadow-md gap-space-sm"}>
<button aria-label={"WeChat More Options"} className={"text-on-surface-variant hover:text-secondary flex items-center justify-center p-0.5"}>
<span className={"material-symbols-outlined text-[16px]"}>more_horiz</span>
</button>
<span className={"w-px h-3 bg-outline-variant/40"}></span>
<button aria-label={"WeChat Exit Mini Program"} className={"text-on-surface-variant hover:text-secondary flex items-center justify-center p-0.5"}>
<span className={"material-symbols-outlined text-[16px]"}>radio_button_checked</span>
</button>
</div>
</div>

<div className={"px-margin-mobile mb-space-sm flex flex-col gap-space-xs"}>
<div className={"bg-surface-container-lowest p-space-md shadow-xl flex flex-col gap-space-sm relative overflow-hidden"}>
<div className={"absolute -right-12 -top-12 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"}></div>

<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-0.5 rounded-none font-bold uppercase tracking-wider"}>
            MATE IN 1
          </span>
<span className={"bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2 py-0.5 rounded-none"}>
            天梯宗师决死战 · 第38步
          </span>
</div>
<div className={"flex items-center gap-1 text-secondary font-label-sm text-label-sm"}>
<span className={"material-symbols-outlined text-[14px]"}>bolt</span>
<span>BRILLIANT MOVE (!!)</span>
</div>
</div>

<div className={"flex items-center justify-between pt-space-xs"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-9 h-9 bg-surface-container-high flex items-center justify-center shadow-inner"}>
<span className={"font-headline-sm text-headline-sm text-secondary font-serif"}>♔</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wide"}>GM Vane</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>ELO 2504 · 白方 (White)</span>
</div>
</div>
<div className={"flex flex-col items-end"}>
<span className={"font-headline-sm text-headline-sm text-primary font-serif"}>98.6%</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>精准率 vs 79.4%</span>
</div>
<div className={"flex items-center gap-space-sm flex-row-reverse"}>
<div className={"w-9 h-9 bg-surface-container-high flex items-center justify-center shadow-inner"}>
<span className={"font-headline-sm text-headline-sm text-primary font-serif"}>♚</span>
</div>
<div className={"flex flex-col items-end"}>
<span className={"font-label-lg text-label-lg font-bold text-on-surface uppercase tracking-wide"}>Lord Cinders</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>ELO 2510 · 黑方 (Black)</span>
</div>
</div>
</div>

<div className={"w-full mt-space-xs flex flex-col gap-1"}>
<div className={"w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"}>
<div className={"h-full bg-secondary-fixed shadow-[0_0_12px_rgba(233,195,73,0.8)]"} style={{ width: "98%" }}></div>
<div className={"h-full bg-primary-container"} style={{ width: "2%" }}></div>
</div>
<div className={"flex justify-between font-label-sm text-label-sm text-on-surface-variant"}>
<span className={"text-secondary font-semibold"}>Stockfish 16 Advantage: +100.0</span>
<span>Depth: 32 / Absolute Execution</span>
</div>
</div>
</div>
</div>

<div className={"px-margin-mobile flex flex-col gap-space-sm"}>
<div className={"relative w-full aspect-[4/5] bg-surface-container-lowest overflow-hidden shadow-2xl flex items-center justify-center"}>

<img className={"absolute inset-0 w-full h-full object-cover opacity-90 scale-105"} data-alt={"Cinematic dark fantasy 3D chess decapitation replay scene, shattered crystalline dark king bursting into radiant crimson embers and red lightning fissures on fractured obsidian cracked marble chessboard, armored gauntlets looming in stormy dark void clouds, volumetric light rays and floating ash particles, occult baroque luxury aesthetic"} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuBX7_kKPpFMk0DIRbE7YtR8XhsS8MP64dewGECJ8jGIGuAYBXmS2shtbdA2Wp7cCzUQDOVz8-CkxCRxeAdOkiLweTR-eQCUDKDvyQmOdiu7_wSn58oRxQirMSkhOmLP5QP78gClcU3bEe_DZJwKFmJ1VP-T-XucVNAyduM-NffGI7OByNhDnXKk3YE6ItN52_jY1GM5tattAaivFPpOE32KKJvmQ_S4MlmCIr-4zDxwkLXJ4hckB32VRQ"} />

<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/80 pointer-events-none"}></div>
<div className={"absolute inset-0 bg-gradient-to-b from-transparent via-primary-container/10 to-surface-container-lowest pointer-events-none"}></div>

<div className={"absolute top-3 left-3 right-3 flex items-center justify-between z-10"}>
<div className={"bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 flex items-center gap-1.5 shadow-md"}>
<span className={"material-symbols-outlined text-primary text-[16px] animate-spin"} style={{ animationDuration: "4s" }}>motion_mode</span>
<span className={"font-label-sm text-label-sm text-primary font-bold tracking-wider uppercase"}>0.25x 慢放瞬间 · 虚空断罪斩首</span>
</div>
<div className={"bg-surface-container-lowest/90 backdrop-blur-md px-2 py-1 flex items-center gap-1 shadow-md"}>
<span className={"font-headline-sm text-headline-sm text-secondary leading-none"}>♛</span>
<span className={"font-label-sm text-label-sm text-on-surface font-semibold"}>Qf7# Checkmate</span>
</div>
</div>

<div className={"absolute bottom-16 left-6 z-10 pointer-events-none"}>
<div className={"flex items-center gap-2"}>
<span className={"w-1.5 h-6 bg-primary"}></span>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Fatal Coordinate</span>
<span className={"font-headline-md text-headline-md text-primary tracking-tight font-serif"}>SQUARE f7</span>
</div>
</div>
</div>

<div className={"absolute right-3 bottom-14 flex flex-col gap-space-xs z-10"}>
<button aria-label={"360 Orbit"} className={"w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:text-secondary flex items-center justify-center shadow-lg transition-transform active:scale-95"} id={"btn-orbit"}>
<span className={"material-symbols-outlined text-[18px]"}>360</span>
</button>
<button aria-label={"Free Tilt Camera"} className={"w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:text-secondary flex items-center justify-center shadow-lg transition-transform active:scale-95"} id={"btn-tilt"}>
<span className={"material-symbols-outlined text-[18px]"}>screen_rotation</span>
</button>
<button aria-label={"Top-down 2D Switch"} className={"w-9 h-9 bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:text-secondary flex items-center justify-center shadow-lg transition-transform active:scale-95"} id={"btn-topdown"}>
<span className={"material-symbols-outlined text-[18px]"}>grid_view</span>
</button>
<button aria-label={"Toggle Embers and Particle FX"} className={"w-9 h-9 bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg transition-transform active:scale-95"} id={"btn-fx"}>
<span className={"material-symbols-outlined text-[18px]"}>auto_awesome</span>
</button>
</div>

<div className={"absolute inset-0 flex items-center justify-center pointer-events-none"}>
<div className={"relative group pointer-events-auto cursor-pointer"}>
<div className={"w-16 h-16 rounded-full bg-surface-container-lowest/70 backdrop-blur-lg flex items-center justify-center shadow-2xl transition-all group-hover:scale-110 active:scale-95"}>
<span className={"material-symbols-outlined text-secondary text-[32px] ml-1"} id={"play-icon"}>play_arrow</span>
</div>
<div className={"absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant bg-surface-container-lowest/80 px-2 py-0.5"}>点击重放绝杀打击</span>
</div>
</div>
</div>

<div className={"absolute bottom-2 left-3 right-3 bg-surface-container-lowest/95 backdrop-blur-lg px-space-sm py-1.5 flex items-center justify-between shadow-md"}>
<div className={"flex items-center gap-space-xs overflow-hidden"}>
<button className={"w-6 h-6 flex items-center justify-center text-secondary"}>
<span className={"material-symbols-outlined text-[16px]"}>volume_up</span>
</button>
<div className={"flex items-center gap-0.5 h-3 px-1"}>
<span className={"w-0.5 h-2 bg-secondary animate-pulse"}></span>
<span className={"w-0.5 h-3 bg-secondary animate-pulse"} style={{ animationDelay: "150ms" }}></span>
<span className={"w-0.5 h-1.5 bg-secondary animate-pulse"} style={{ animationDelay: "300ms" }}></span>
<span className={"w-0.5 h-3 bg-secondary animate-pulse"} style={{ animationDelay: "75ms" }}></span>
<span className={"w-0.5 h-2 bg-secondary"}></span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface truncate italic"}>
            “She doesn't follow the board. She owns it.”
          </p>
</div>
<span className={"font-label-sm text-label-sm text-secondary font-semibold shrink-0"}>0:04</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-md shadow-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>history_edu</span>
<span className={"font-label-md text-label-md text-on-surface font-semibold uppercase tracking-wider"}>
            步法轴与局势推演 (Climax Scrub)
          </span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Step 38 / 38</span>
</div>

<div className={"grid grid-cols-4 gap-space-xs pt-1"}>

<button className={"flex flex-col p-2 bg-surface-container text-left transition-colors hover:bg-surface-container-high focus:outline-none"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>#34 弃车诱敌</span>
<span className={"font-label-md text-label-md text-on-surface font-semibold pt-0.5"}>Rxd5!</span>
<span className={"font-label-sm text-label-sm text-secondary mt-1"}>+3.8</span>
</button>

<button className={"flex flex-col p-2 bg-surface-container text-left transition-colors hover:bg-surface-container-high focus:outline-none"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>#36 后翼突进</span>
<span className={"font-label-md text-label-md text-on-surface font-semibold pt-0.5"}>Qh5+</span>
<span className={"font-label-sm text-label-sm text-secondary mt-1"}>+7.4</span>
</button>

<button className={"flex flex-col p-2 bg-surface-container text-left transition-colors hover:bg-surface-container-high focus:outline-none"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>#37 逼角陷阱</span>
<span className={"font-label-md text-label-md text-on-surface font-semibold pt-0.5"}>Kh8</span>
<span className={"font-label-sm text-label-sm text-primary mt-1"}>#M1</span>
</button>

<button className={"flex flex-col p-2 bg-primary-container text-left shadow-md focus:outline-none relative"}>
<span className={"font-label-sm text-label-sm text-on-primary-container font-bold"}>#38 虚空斩首</span>
<span className={"font-label-md text-label-md text-on-primary font-bold pt-0.5"}>♛ Qf7#</span>
<span className={"font-label-sm text-label-sm text-on-primary-container mt-1 font-bold"}>MATE</span>
</button>
</div>

<div className={"bg-surface-container-lowest p-space-sm flex gap-space-sm items-start shadow-inner"}>
<span className={"material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5"}>psychology</span>
<div className={"flex flex-col gap-0.5"}>
<div className={"flex items-center gap-2"}>
<span className={"font-label-md text-label-md text-secondary font-bold"}>Sanguine Engine v5.2</span>
<span className={"font-label-sm text-label-sm bg-surface-container-highest px-1.5 py-0.2 text-on-surface-variant"}>0.001s</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
<span className={"text-on-surface font-medium"}>Qf7# 为全盘唯一绝对将死解法。</span>
            白方弃车撕开王翼斜角，后与暗影象双向封死g8与h7通路，黑王陷入绝境，无法完成移位或垫子。
          </p>
</div>
</div>
</div>

<div className={"grid grid-cols-2 gap-space-sm"}>
<div className={"relative bg-surface-container-lowest overflow-hidden shadow-md flex flex-col"}>
<img className={"w-full h-24 object-cover"} data-alt={"Macro close-up shot of an ornate blood-stained crystal Queen chess piece hovering above a cracked obsidian board, emitting soft gold and crimson aura, high dynamic range chiaroscuro lighting, dramatic macro photography"} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuBuf4GYfnGE7pamaju5DWKlZDXBIwwANgYfNs5F00Osxy4C8y3VLGG8S0TlHKmjZzaCSEBMfVf9aBim3yzd_vNTkIIFX_DQBqeNiLf19ElNkNQRUIw9vY2hojLLlq4mbc1VEVWg6bBxKgdrGYphUf0He5pDLM8RxvWIvOqAa2NtXMKmst6zY40FL4FvkBaJSmqV6HFCuG8o1h73A8bKZYev3LMeF2a-1pLDJkYdr1dAySk1edXAyf_Mqg"} />
<div className={"p-2 flex flex-col bg-surface-container-low"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-semibold"}>Decapitating Relic</span>
<span className={"font-body-sm text-body-sm text-on-surface truncate"}>猩红王后 · 虚空锋芒</span>
</div>
</div>
<div className={"relative bg-surface-container-lowest overflow-hidden shadow-md flex flex-col"}>
<img className={"w-full h-24 object-cover"} data-alt={"Two dark robed cosmic monarchs gazing across an abyss over an illuminated gold and obsidian chessboard suspended in deep space nebula, dramatic divine lighting beams, majestic occult ritual aesthetic"} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuCJAhK7FpGtdlHCSHM2xBBU9AbY-2bFJkxuO9Cy21nqBXTIQwo91OQpyI09JO5NgSSMyJmnIViGAryWm16WAJ5FgU3XZ1NUBY4NjdamHZOqzMSJBkK5k5iyHi3UNOI8cC9XTAeRJEq4U6ucTudXeXSXXv5jykV09rXUiWH9CDHRwaMSj9fjmxHD3taDfI95OsrMwiN_SV2JaCktkYE-tjILmDGITi_Ve_9BtPBKG_GMQQDLXJsRtalKJA"} />
<div className={"p-2 flex flex-col bg-surface-container-low"}>
<span className={"font-label-sm text-label-sm text-primary uppercase font-semibold"}>Grandmaster Vision</span>
<span className={"font-body-sm text-body-sm text-on-surface truncate"}>神域棋局 · 意念交锋</span>
</div>
</div>
</div>

<div className={"flex flex-col gap-space-xs pt-space-xs"}>

<button className={"w-full py-3 px-4 bg-primary-container hover:bg-tertiary-container text-on-primary-container flex items-center justify-center gap-space-sm shadow-xl transition-all active:scale-[0.99]"}>
<span className={"material-symbols-outlined text-[20px]"}>swords</span>
<span className={"font-label-lg text-label-lg tracking-wider uppercase font-bold"}>
          发起相同残局挑战 (Fork &amp; Play Puzzle)
        </span>
</button>

<div className={"grid grid-cols-2 gap-space-sm"}>
<button className={"py-2.5 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-xs shadow-md transition-colors active:scale-95"}>
<span className={"material-symbols-outlined text-[18px] text-secondary"}>share</span>
<span className={"font-label-md text-label-md font-medium"}>分享至微信群/好友</span>
</button>
<button className={"py-2.5 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center justify-center gap-space-xs shadow-md transition-colors active:scale-95"}>
<span className={"material-symbols-outlined text-[18px] text-secondary"}>download_for_offline</span>
<span className={"font-label-md text-label-md font-medium"}>保存复盘GIF/高清片段</span>
</button>
</div>

<div className={"mt-space-xs p-3 bg-surface-container-lowest flex items-center justify-between shadow-md"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-8 h-8 bg-surface-container-highest flex items-center justify-center"}>
<span className={"font-headline-sm text-headline-sm text-secondary"}>♟</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-md text-label-md text-on-surface font-semibold"}>打开《暗黑国际象棋》完整版</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>体验 120 FPS 虚幻物理光追棋局</span>
</div>
</div>
<button className={"px-3 py-1 bg-secondary text-on-secondary font-label-sm text-label-sm font-bold uppercase hover:bg-secondary-fixed transition-colors"}>
          立即前往
        </button>
</div>
</div>
</div>
</div>
</main>
    </div>
  );
}
