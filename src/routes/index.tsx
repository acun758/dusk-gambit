import { createFileRoute } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blood Sovereign \u2014 Grandmaster Chess Court" },
      { name: "description", content: "Enter the Court of Ruin: ranked chess conquest, relic arsenal and mythic checkmate execution." },
      { property: "og:title", content: "Blood Sovereign \u2014 Grandmaster Chess Court" },
      { property: "og:description", content: "Enter the Court of Ruin: ranked chess conquest, relic arsenal and mythic checkmate execution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile, winRate, recordResult } = useProfile();
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank {profile.elo}</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>{profile.tier}</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-24"}>

<div className={"relative w-full overflow-hidden px-margin-mobile pt-space-md"}>

<section className={"relative w-full group cursor-pointer transition-transform active:scale-[0.99] duration-300"}>

<div className={"relative w-full bg-surface-container-lowest p-space-xs shadow-[0_20px_48px_rgba(0,0,0,0.95)]"}>

<div className={"relative w-full bg-surface-container-low p-space-md overflow-hidden"}>

<div className={"absolute inset-0 bg-gradient-to-b from-primary-container/20 via-surface-container-lowest/60 to-surface-container-lowest pointer-events-none"}></div>

<div className={"flex items-center justify-between relative z-10"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-headline-md text-headline-md text-secondary leading-none"}>A</span>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>diamond</span>
<span className={"font-label-md text-label-md text-on-surface uppercase tracking-widest"}>{profile.name}</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant tabular-nums"}>{profile.diamonds.toLocaleString()}</span>
</div>
<div className={"flex items-center gap-space-xs px-space-sm py-0.5 bg-surface-container-highest"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase whitespace-nowrap"}>The Sovereign's Decree</span>
</div>
<div className={"hidden sm:flex items-center gap-space-xs"}>
<span className={"font-headline-md text-headline-md text-secondary leading-none"}>A</span>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>diamond</span>
</div>
</div>

<div className={"relative z-10 flex flex-col items-center text-center mt-space-md mb-space-sm"}>

<div className={"relative w-full h-56 overflow-hidden bg-surface-container-lowest mb-space-md shadow-2xl"}>
<img className={"w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"} data-alt={"Monolithic obsidian chess king piece standing defiant amidst swirling black marble smoke and fractured chess tiles, lit by dramatic cinematic chiaroscuro moonlight piercing storm clouds. Highly detailed hyper-realistic digital oil painting in dark fantasy luxury aesthetic, with gold flecks and blood-crimson rim lighting."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuBnVOX-kXx8mV3PVsr8DCXDkuhKkPFg3FPwgzrEZR2jqS1iRBa--gRHsSpsOQX01tqxrUvzEUdYLuEqogs7_vxU3GDGPsKI0TlWMP4uXHALJWJc6Q9MJ1oytTy3GzpB3VP00MwJeXVjfDbX-hfBqJ-bBozBHDECtONNRt60wbUGhKLBTsca9P7nq-ln4dZ2VgNuudkZx0NpP4FHc2wdORwrLtHpziEl0Rj_MUZKPHIvn0x4Y9vssEL_Zg"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-surface-container-low/40 pointer-events-none"}></div>

<div className={"absolute bottom-3 inset-x-0 flex flex-col items-center"}>
<span className={"material-symbols-outlined text-primary text-[28px] drop-shadow-[0_0_12px_rgba(139,30,30,0.8)]"}>crown</span>
</div>
</div>

<span className={"font-label-md text-label-md uppercase tracking-[0.25em] text-on-surface-variant mb-1"}>Covenant of the Grandmaster</span>
<h2 className={"font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase tracking-wider mb-1 drop-shadow-md"}>
              The Board Never Lies.
            </h2>
<p className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest mb-2"}>Plan in silence. Execute in blood.</p>
<div className={"flex items-center gap-space-sm my-1"}>
<span className={"w-8 h-px bg-secondary/40"}></span>
<span className={"material-symbols-outlined text-secondary text-[14px]"}>diamond</span>
<span className={"w-8 h-px bg-secondary/40"}></span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant max-w-xs mt-2 italic"}>
              “She doesn't merely follow the board. She commands the void.”
            </p>
</div>

<div className={"flex items-center justify-between relative z-10 pt-space-xs text-secondary/70"}>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Edict No. 64</span>
<div className={"flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[14px]"}>swords</span>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Court of Ruin</span>
</div>
<span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Season IX</span>
</div>
</div>
</div>
</section>

<section className={"mt-space-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between mb-space-xs px-0.5"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>chess_pawn</span>
<h3 className={"font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface"}>Ranked Conquest</h3>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-xs py-0.5"}>
<span className={"material-symbols-outlined text-secondary text-[14px]"}>military_tech</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-semibold"}>{profile.elo} ELO</span>
</div>
</div>

<div className={"bg-surface-container-low p-space-sm relative overflow-hidden"}>
<div className={"flex justify-between items-center mb-space-xs"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Grandmaster Path</span>
<span className={"font-label-sm text-label-sm text-primary tracking-widest font-semibold"}>+20 To Sovereign Title</span>
</div>
<div className={"w-full h-1.5 bg-surface-container-highest overflow-hidden relative"}>
<div className={"h-full bg-gradient-to-r from-primary-container via-primary to-secondary w-[86%] transition-all duration-1000"}></div>
</div>
<div className={"flex justify-between items-center mt-1.5 text-on-surface-variant"}>
<span className={"font-label-sm text-label-sm uppercase"}>2400 (Master)</span>
<span className={"font-label-sm text-label-sm text-secondary font-semibold uppercase"}>Win Streak: {profile.streak}x</span>
<span className={"font-label-sm text-label-sm uppercase text-secondary"}>2500 (Apex)</span>
</div>
</div>

<div className={"grid grid-cols-4 gap-space-xs mt-space-xs"}>
{[
  { zh: "段位", en: profile.tier, v: profile.tierZh },
  { zh: "胜场", en: "Wins", v: String(profile.wins) },
  { zh: "胜率", en: "Win Rate", v: `${winRate}%` },
  { zh: "钻石", en: "Diamonds", v: profile.diamonds.toLocaleString() },
].map((s) => (
<div key={s.en} className={"bg-surface-container-low p-space-sm flex flex-col gap-0.5 gold-hairline"}>
<span className={"cjk font-label-sm text-label-sm text-on-surface-variant"}>{s.zh}</span>
<span className={"font-headline-sm text-headline-sm text-secondary tabular-nums truncate"}>{s.v}</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest truncate"}>{s.en}</span>
</div>
))}
</div>
<div className={"flex items-center justify-between gap-space-xs mt-space-xs"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>Last Match Settlement</span>
<div className={"flex items-center gap-space-xs"}>
<button onClick={() => recordResult("win")} className={"h-9 px-3 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest active:scale-95 transition-transform"}>胜</button>
<button onClick={() => recordResult("draw")} className={"h-9 px-3 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest active:scale-95 transition-transform"}>和</button>
<button onClick={() => recordResult("loss")} className={"h-9 px-3 bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-widest active:scale-95 transition-transform"}>负</button>
</div>
</div>

<div className={"grid grid-cols-3 gap-space-xs mt-space-xs"}>

<button className={"flex flex-col items-center justify-between p-space-sm bg-surface-container hover:bg-surface-container-high active:bg-primary-container/30 transition-all text-left relative overflow-hidden group"}>
<div className={"w-full flex justify-between items-center mb-space-sm"}>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold"}>Blitz</span>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>bolt</span>
</div>
<span className={"font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors"}>3 | 2</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-space-xs"}>12.4k Seeking</span>
<div className={"w-full h-0.5 bg-secondary mt-space-xs"}></div>
</button>

<button className={"flex flex-col items-center justify-between p-space-sm bg-surface-container-high hover:bg-surface-bright active:bg-primary-container transition-all text-left relative overflow-hidden shadow-lg group"}>
<div className={"absolute -top-6 -right-6 w-12 h-12 bg-primary/10 rounded-full blur-sm"}></div>
<div className={"w-full flex justify-between items-center mb-space-sm"}>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold"}>Rapid</span>
<span className={"material-symbols-outlined text-primary text-[16px]"}>timer</span>
</div>
<span className={"font-headline-md text-headline-md text-primary group-hover:scale-105 transition-transform"}>10 | 0</span>
<span className={"font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider mt-space-xs font-semibold"}>Sanctioned</span>
<div className={"w-full h-0.5 bg-primary mt-space-xs shadow-[0_0_8px_rgba(255,179,173,0.8)]"}></div>
</button>

<button className={"flex flex-col items-center justify-between p-space-sm bg-surface-container hover:bg-surface-container-high active:bg-primary-container/30 transition-all text-left relative overflow-hidden group"}>
<div className={"w-full flex justify-between items-center mb-space-sm"}>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold"}>Bullet</span>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>flash_on</span>
</div>
<span className={"font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors"}>1 | 1</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-space-xs"}>8.9k Seeking</span>
<div className={"w-full h-0.5 bg-secondary mt-space-xs"}></div>
</button>
</div>

<button className={"w-full py-space-md bg-primary-container hover:bg-inverse-primary text-on-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm shadow-[0_8px_24px_rgba(139,30,30,0.45)] mt-space-xs"}>
<span className={"material-symbols-outlined text-[20px] text-secondary"}>swords</span>
<span className={"font-label-lg text-label-lg uppercase tracking-[0.16em] font-semibold"}>Enter Ranked Battle</span>
<span className={"material-symbols-outlined text-[18px]"}>arrow_forward</span>
</button>
</section>

<section className={"mt-space-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>psychology</span>
<h3 className={"font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface"}>Tactics Crucible</h3>
</div>
<div className={"flex items-center gap-1 bg-surface-container-high px-space-xs py-0.5"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-semibold"}>Rating 2710</span>
</div>
</div>

<div className={"relative w-full bg-surface-container p-space-md shadow-lg overflow-hidden flex flex-col gap-space-sm group cursor-pointer hover:bg-surface-container-high transition-colors"}>

<div className={"absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"}></div>
<div className={"flex items-start justify-between"}>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold flex items-center gap-1"}>
<span className={"w-1.5 h-1.5 rounded-full bg-primary animate-ping"}></span>
              Daily Crucible Trial
            </span>
<h4 className={"font-headline-sm text-headline-sm text-on-surface uppercase mt-0.5"}>The Queen's Decapitation</h4>
</div>
<span className={"px-space-xs py-0.5 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest"}>
            Mate in 3
          </span>
</div>

<div className={"flex items-center gap-space-md my-space-xs"}>

<div className={"w-20 h-20 bg-surface-container-lowest grid grid-cols-4 grid-rows-4 p-1 shrink-0 relative shadow-inner"}>
<div className={"bg-surface-container-high/40"}></div>
<div className={"bg-surface-container-lowest"}></div>
<div className={"bg-surface-container-high/40 flex items-center justify-center"}>
<span className={"material-symbols-outlined text-primary text-[14px]"}>chess_bishop</span>
</div>
<div className={"bg-surface-container-lowest"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}>
<span className={"material-symbols-outlined text-secondary text-[14px]"}>chess_knight</span>
</div>
<div className={"bg-surface-container-high/40"}></div>
<div className={"bg-surface-container-lowest"}></div>
<div className={"bg-surface-container-high/40"}></div>
<div className={"bg-surface-container-high/40"}></div>
<div className={"bg-surface-container-lowest"}></div>
<div className={"bg-surface-container-high/40"}></div>
<div className={"bg-surface-container-lowest flex items-center justify-center"}>
<span className={"material-symbols-outlined text-on-surface text-[14px]"}>chess_queen</span>
</div>
<div className={"bg-surface-container-lowest"}></div>
<div className={"bg-surface-container-high/40 flex items-center justify-center"}>
<span className={"material-symbols-outlined text-primary text-[14px]"}>chess_king</span>
</div>
<div className={"bg-surface-container-lowest"}></div>
<div className={"bg-surface-container-high/40"}></div>
</div>
<div className={"flex flex-col justify-center gap-1 min-w-0"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-wider"}>Black to Move &amp; Strike</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>White overextended with 24. Qxe5+. Retaliate without mercy.</p>
<div className={"flex items-center gap-space-sm mt-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Solvers: <strong className={"text-on-surface"}>3,492</strong></span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Success: <strong className={"text-secondary"}>28%</strong></span>
</div>
</div>
</div>
<div className={"flex items-center justify-between pt-space-xs"}>
<div className={"flex items-center gap-space-xs text-secondary"}>
<span className={"material-symbols-outlined text-[16px]"}>stars</span>
<span className={"font-label-sm text-label-sm uppercase tracking-widest"}>+18 Puzzle Points</span>
</div>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform"}>
            Execute <span className={"material-symbols-outlined text-[14px]"}>arrow_forward</span>
</span>
</div>
</div>
</section>

<section className={"mt-space-lg flex flex-col gap-space-sm"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>auto_stories</span>
<h3 className={"font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface"}>The Vault &amp; Armory</h3>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase"}>Piece Sets</span>
</div>

<div className={"grid grid-cols-2 gap-space-xs"}>

<div className={"bg-surface-container p-space-sm flex flex-col group cursor-pointer hover:bg-surface-container-high transition-colors"}>
<div className={"relative w-full h-36 bg-surface-container-lowest mb-space-sm overflow-hidden"}>
<img className={"w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"} data-alt={"Handcrafted obsidian chess knight statue piece carved from volcanic glass, gleaming sharp edges with gilded gold inlays and veins. Pitch black gothic fantasy background with atmospheric rim reflections."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuDQU7MHtc33yS0WtJWpQgNgNC3hha-aI2u0whiRxnontUz4evcu_6Gh75H0LEOiSMbR-UXvxcmi6U38vOk3jT-_zFIqoe7pAC0Uw3QEYmVu1I0mLKhct0-U2sJ_5DhcdQVu-kNJEzVWCLwl1cIwHVQUirW7oeXqBzbCVVaC-h6P43Zk1nXhxxLcuEx6pN0P3YYUMAlrpWVst1VXZdxalH5EX49PRK58mrlYc-H-Up29pBQ5b0bU62e3qg"} />
<span className={"absolute top-1.5 left-1.5 px-space-xs py-0.5 bg-surface-container-lowest/80 text-secondary font-label-sm text-label-sm uppercase tracking-widest backdrop-blur-md"}>
              Equipped
            </span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface uppercase"}>Obsidian Knight</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-0.5"}>Forged in Void</span>
<div className={"flex justify-between items-center mt-space-sm pt-space-xs"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase font-semibold"}>Grade V Relic</span>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>check_circle</span>
</div>
</div>

<div className={"bg-surface-container p-space-sm flex flex-col group cursor-pointer hover:bg-surface-container-high transition-colors"}>
<div className={"relative w-full h-36 bg-surface-container-lowest mb-space-sm overflow-hidden"}>
<img className={"w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"} data-alt={"Exquisite royal ruby chess queen piece crowned with sharp gothic carmine gemstones and polished blood-red lacquer. Regal dramatic studio lighting against deep black shadow void."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuCve6cMlHBfp_auljVHd9gVv-q7yb41ic6jcyPC7TT5ibVxL4PZ-cAedeP820Ln57v9h11ru0YF-RdhC9BSuDtbhtVwFZUatMWGE3gcg_Mrr1nvyMZ2jpn3feSe_er162XiEOBECUIb4zlYXOjwklG9zc3ePzhjjCb49uhjUjrYfwIrzGwN5pFxN7sMZKkgq9igI-u1klpRvVqfS3I136DBnA2CvJuExmCWkwOCdu2dclnxKNYGCW18EA"} />
<span className={"absolute top-1.5 left-1.5 px-space-xs py-0.5 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest"}>
              Ancestral
            </span>
</div>
<span className={"font-headline-sm text-headline-sm text-on-surface uppercase"}>Crimson Queen</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-0.5"}>Court of Blood</span>
<div className={"flex justify-between items-center mt-space-sm pt-space-xs"}>
<span className={"font-label-sm text-label-sm text-primary uppercase font-semibold"}>Unlock 2500 ELO</span>
<span className={"material-symbols-outlined text-primary text-[16px]"}>lock</span>
</div>
</div>
</div>
</section>

<section className={"mt-space-lg flex flex-col gap-space-sm mb-space-md"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-[18px]"}>history_edu</span>
<h3 className={"font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface"}>Recent Carnage</h3>
</div>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>Last 20 Duels</span>
</div>

<div className={"bg-surface-container p-space-md flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-space-xs py-0.5 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase font-bold tracking-widest"}>
              Victory
            </span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>Ranked Rapid</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary font-semibold"}>+16 ELO</span>
</div>
<div className={"flex items-center justify-between my-space-xs"}>
<div className={"flex flex-col"}>
<span className={"font-body-md text-body-md text-on-surface font-semibold"}>vs. Grandmaster Vane (2464)</span>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest mt-0.5"}>
              Sicilian Defense: Najdorf Variation
            </span>
</div>
<div className={"text-right flex flex-col"}>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>1 - 0</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>38 Moves</span>
</div>
</div>
<div className={"flex items-center justify-between pt-space-xs text-on-surface-variant"}>
<div className={"flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[14px] text-secondary"}>verified</span>
<span className={"font-label-sm text-label-sm uppercase"}>Accuracy: 94.2%</span>
</div>
<span className={"font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-0.5 cursor-pointer hover:underline"}>
            Review Analysis <span className={"material-symbols-outlined text-[12px]"}>open_in_new</span>
</span>
</div>
</div>

<div className={"bg-surface-container p-space-md flex flex-col gap-space-xs hover:bg-surface-container-high transition-colors"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-space-xs py-0.5 bg-error-container text-on-error-container font-label-sm text-label-sm uppercase font-bold tracking-widest"}>
              Defeat
            </span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>Ranked Blitz</span>
</div>
<span className={"font-label-sm text-label-sm text-error font-semibold"}>-12 ELO</span>
</div>
<div className={"flex items-center justify-between my-space-xs"}>
<div className={"flex flex-col"}>
<span className={"font-body-md text-body-md text-on-surface font-semibold"}>vs. Archduke Kaelen (2510)</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mt-0.5"}>
              Queen's Gambit Declined: Tartakower
            </span>
</div>
<div className={"text-right flex flex-col"}>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>0 - 1</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>52 Moves</span>
</div>
</div>
<div className={"flex items-center justify-between pt-space-xs text-on-surface-variant"}>
<div className={"flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[14px]"}>flag</span>
<span className={"font-label-sm text-label-sm uppercase"}>Resigned (Time Scramble)</span>
</div>
<span className={"font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-0.5 cursor-pointer hover:underline"}>
            Study Blunder <span className={"material-symbols-outlined text-[12px]"}>open_in_new</span>
</span>
</div>
</div>
</section>

<footer className={"py-space-md flex flex-col items-center justify-center text-center"}>
<span className={"material-symbols-outlined text-secondary/40 text-[20px] mb-1"}>balance</span>
<p className={"font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em] uppercase"}>
        Every move today shapes your throne tomorrow.
      </p>
<span className={"font-label-sm text-label-sm text-secondary/60 mt-1 uppercase tracking-widest"}>
        王座殿堂 • 战略控制中心
      </span>
</footer>
</div>
</div>
</main>
    </div>
  );
}
