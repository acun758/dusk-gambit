import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/arsenal")({
  head: () => ({
    meta: [
      { title: "Arsenal Relics \u2014 Blood Sovereign" },
      { name: "description", content: "Browse mythic ancestral chess relics, 360\u00b0 forge views and equipped sets in the Blood Sovereign arsenal." },
      { property: "og:title", content: "Arsenal Relics \u2014 Blood Sovereign" },
      { property: "og:description", content: "Browse mythic ancestral chess relics, 360\u00b0 forge views and equipped sets in the Blood Sovereign arsenal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Arsenal,
});

function Arsenal() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full pb-28 text-on-surface select-none"}>

<section className={"relative w-full overflow-hidden bg-surface-container-lowest px-margin-mobile pt-space-sm pb-space-lg shadow-[inset_0_-24px_36px_rgba(0,0,0,0.9)]"}>

<div className={"absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tertiary-container/30 via-surface-container-lowest/80 to-surface-container-lowest pointer-events-none"}></div>

<div className={"relative z-10 flex items-center justify-between pb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-2 py-0.5 bg-primary-container text-on-primary-container font-label-sm text-label-sm tracking-widest uppercase"}>
          Mythic Ancestral · 秘宝
        </span>
<span className={"px-2 py-0.5 bg-surface-container text-secondary font-label-sm text-label-sm tracking-widest uppercase"}>
          Tier VI
        </span>
</div>
<div className={"flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-high/90"}>
<span className={"w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>360° Forge View</span>
</div>
</div>

<div className={"relative z-10 w-full h-80 flex flex-col items-center justify-center overflow-hidden"}>

<svg className={"absolute inset-0 w-full h-full text-outline-variant/20 pointer-events-none"} fill={"none"} stroke={"currentColor"} viewBox={"0 0 400 400"}>
<circle cx={"200"} cy={"200"} r={"160"} strokeDasharray={"4 6"} strokeWidth={"0.8"}></circle>
<circle cx={"200"} cy={"200"} r={"110"} strokeWidth={"0.6"}></circle>
<circle cx={"200"} cy={"200"} r={"70"} strokeDasharray={"2 4"} strokeWidth={"0.5"}></circle>
<path d={"M200 10 L200 390 M10 200 L390 200"} opacity={"0.4"} strokeWidth={"0.4"}></path>
</svg>

<div className={"relative w-64 h-72 flex items-center justify-center"}>
<img className={"w-full h-full object-contain filter drop-shadow-[0_20px_25px_rgba(147,0,10,0.45)] transition-transform duration-700 active:scale-95"} data-alt={"Hyper-realistic obsidian and crimson crystal chess Queen piece with jagged gothic crown, bathed in dramatic cinematic chiaroscuro volumetric red light and floating golden embers, intricate gold filigree runes etched into reflective pitch-black marble pedestal."} id={"heroPieceGraphic"} src={"/__l5e/assets-v1/d6d54e1c-7da9-4c86-a17f-c85264ba2370/skin-gilded.png"} />

<div className={"absolute bottom-2 w-48 h-6 bg-radial from-secondary/20 via-primary-container/30 to-transparent blur-md"}></div>
</div>

<button aria-label={"Rotate Left"} className={"absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container/80 hover:bg-surface-container-highest text-secondary flex items-center justify-center transition-colors"}>
<span className={"material-symbols-outlined text-[20px]"}>rotate_left</span>
</button>
<button aria-label={"Rotate Right"} className={"absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-container/80 hover:bg-surface-container-highest text-secondary flex items-center justify-center transition-colors"}>
<span className={"material-symbols-outlined text-[20px]"}>rotate_right</span>
</button>

<div className={"absolute bottom-1 flex items-center gap-space-xs"}>
<div className={"flex items-center gap-1 px-2 py-0.5 bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"}>
<span className={"material-symbols-outlined text-[12px] text-tertiary"}>local_fire_department</span>
<span>EMBERS ACTIVE</span>
</div>
<div className={"flex items-center gap-1 px-2 py-0.5 bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm"}>
<span className={"material-symbols-outlined text-[12px] text-secondary"}>graphic_eq</span>
<span>OBSIDIAN RESONANCE</span>
</div>
</div>
</div>

<div className={"relative z-10 mt-space-sm p-space-md bg-surface-container-low/95 shadow-[0_8px_24px_rgba(0,0,0,0.85)]"}>
<div className={"flex items-start justify-between gap-space-sm"}>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-2"}>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>猩红女帝 · 永夜</span>
<span className={"material-symbols-outlined text-[18px] text-secondary"}>verified</span>
</div>
<span className={"font-label-md text-label-md text-secondary tracking-widest uppercase mt-0.5"}>Crimson Queen Consort · Relic ID #001</span>
</div>
<div className={"flex flex-col items-end"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>Elo Required</span>
<span className={"font-label-lg text-label-lg text-secondary"}>2,500+</span>
</div>
</div>
<div className={"my-space-sm h-px w-full bg-surface-container-highest"}></div>
<p className={"font-headline-sm text-[15px] italic text-primary-fixed leading-relaxed"}>
        “She doesn’t follow the board. She changes it. Confidence is her calculated strategy.”
      </p>

<div className={"grid grid-cols-3 gap-space-xs mt-space-md pt-space-xs"}>
<div className={"p-2 bg-surface-container flex flex-col items-center text-center"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>Sovereign VFX</span>
<div className={"flex items-center gap-0.5 text-secondary mt-1"}>
<span className={"material-symbols-outlined text-[14px]"}>bolt</span>
<span className={"font-label-md text-label-md"}>Tier V Blood</span>
</div>
</div>
<div className={"p-2 bg-surface-container flex flex-col items-center text-center"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>Timbre SFX</span>
<div className={"flex items-center gap-0.5 text-tertiary mt-1"}>
<span className={"material-symbols-outlined text-[14px]"}>volume_up</span>
<span className={"font-label-md text-label-md"}>Cathedral Bone</span>
</div>
</div>
<div className={"p-2 bg-surface-container flex flex-col items-center text-center"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>Execution</span>
<div className={"flex items-center gap-0.5 text-primary mt-1"}>
<span className={"material-symbols-outlined text-[14px]"}>swords</span>
<span className={"font-label-md text-label-md"}>Void Beheading</span>
</div>
</div>
</div>
</div>
</section>

<section className={"w-full px-margin-mobile py-space-sm sticky top-20 z-40 bg-surface/95 backdrop-blur-md"}>
<div className={"flex items-center justify-between gap-1 overflow-x-auto p-1 bg-surface-container-lowest"}>
<button className={"flex-1 py-2 px-2 bg-primary-container text-on-primary-container font-label-md text-label-md tracking-wider uppercase text-center whitespace-nowrap flex items-center justify-center gap-1"}>
<span className={"material-symbols-outlined text-[15px]"}>crown</span>
<span>棋具圣物</span>
</button>
<button className={"flex-1 py-2 px-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md tracking-wider uppercase text-center whitespace-nowrap flex items-center justify-center gap-1"}>
<span className={"material-symbols-outlined text-[15px]"}>chess</span>
<span>对局战盘</span>
</button>
<button className={"flex-1 py-2 px-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md tracking-wider uppercase text-center whitespace-nowrap flex items-center justify-center gap-1"}>
<span className={"material-symbols-outlined text-[15px]"}>auto_fix_high</span>
<span>处决特写</span>
</button>
<button className={"flex-1 py-2 px-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md tracking-wider uppercase text-center whitespace-nowrap flex items-center justify-center gap-1"}>
<span className={"material-symbols-outlined text-[15px]"}>music_note</span>
<span>对弈圣咏</span>
</button>
</div>
</section>

<section className={"w-full px-margin-mobile pt-space-xs pb-space-sm flex items-center gap-2 overflow-x-auto"}>
<button className={"h-6 px-3 bg-secondary text-on-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center"}>
      All (全部)
    </button>
<button className={"h-6 px-3 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center whitespace-nowrap"}>
      King (君王)
    </button>
<button className={"h-6 px-3 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center whitespace-nowrap"}>
      Queen (女王)
    </button>
<button className={"h-6 px-3 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center whitespace-nowrap"}>
      Knight (战骑)
    </button>
<button className={"h-6 px-3 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center whitespace-nowrap"}>
      Rook (要塞)
    </button>
<button className={"h-6 px-3 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center whitespace-nowrap"}>
      Bishop (主教)
    </button>
<button className={"h-6 px-3 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-wider uppercase flex items-center justify-center whitespace-nowrap"}>
      Pawn (死侍)
    </button>
</section>

<section className={"w-full px-margin-mobile py-space-sm space-y-space-sm"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1 h-3.5 bg-secondary"}></span>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>圣物兵械册 · Arsenal Relics</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>14 / 32 Unlocked</span>
</div>

<div className={"grid grid-cols-1 md:grid-cols-2 gap-space-sm"}>

<div className={"relative bg-surface-container-low p-space-sm flex gap-space-sm overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)]"}>
<div className={"relative w-24 h-28 bg-surface-container-lowest flex-shrink-0 flex items-center justify-center overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"Dramatic dark fantasy chess knight carved from rough black basalt stone with glowing golden cracks and an intense glowing eye, captured on velvet chessboard with smoke atmosphere."} src={"/__l5e/assets-v1/2b347765-259e-4e34-90ff-448475092c21/skin-shadow.png"} />
<span className={"absolute top-1 left-1 px-1.5 py-0.5 bg-secondary text-on-secondary font-label-sm text-[9px] tracking-widest font-bold uppercase"}>
            Equipped
          </span>
</div>
<div className={"flex flex-col justify-between flex-1 min-w-0 py-0.5"}>
<div className={"flex flex-col"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>Knight · Grade V</span>
<div className={"flex items-center gap-1 text-secondary"}>
<span className={"material-symbols-outlined text-[14px]"}>shield</span>
<span className={"font-label-sm text-label-sm"}>+3 Valour</span>
</div>
</div>
<h2 className={"font-headline-sm text-[16px] text-on-surface tracking-wide uppercase truncate mt-0.5"}>黑曜龙骑 · 深渊先锋</h2>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1"}>
              Forced sacrifice triggers obsidian shockwaves. Hand-carved from the heart of the Shattered Cinder.
            </p>
</div>
<div className={"flex items-center justify-between pt-2"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>Ancestral Relic</span>
<button className={"px-3 py-1 bg-surface-container text-on-surface-variant font-label-sm text-label-sm tracking-widest uppercase flex items-center gap-1"}>
<span className={"material-symbols-outlined text-[13px] text-secondary"}>check</span>
<span>已装配</span>
</button>
</div>
</div>
</div>

<div className={"relative bg-surface-container p-space-sm flex gap-space-sm overflow-hidden shadow-[0_8px_20px_rgba(139,30,30,0.35)]"}>
<div className={"absolute left-0 top-0 bottom-0 w-1 bg-primary"}></div>
<div className={"relative w-24 h-28 bg-surface-container-lowest flex-shrink-0 flex items-center justify-center overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"Gothic royal chess queen piece rendered in blood red polished ruby lacquer with razor sharp points, shrouded in dark occult shadows with subtle golden crest."} src={"/__l5e/assets-v1/3d15abc2-eee8-49ed-b811-31dbef55bf45/skin-classic.png"} />
<span className={"absolute top-1 left-1 px-1.5 py-0.5 bg-tertiary-container text-on-tertiary font-label-sm text-[9px] tracking-widest font-bold uppercase"}>
            Active Focus
          </span>
</div>
<div className={"flex flex-col justify-between flex-1 min-w-0 py-0.5"}>
<div className={"flex flex-col"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm text-primary tracking-widest uppercase"}>Queen · Mythic</span>
<div className={"flex items-center gap-1 text-primary"}>
<span className={"material-symbols-outlined text-[14px]"}>local_fire_department</span>
<span className={"font-label-sm text-label-sm"}>Blood Embers</span>
</div>
</div>
<h2 className={"font-headline-sm text-[16px] text-on-surface tracking-wide uppercase truncate mt-0.5"}>猩红女帝 · 永夜王权</h2>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1"}>
              Commands total board diagonal territory. Forges blood-stained tactical trails across obsidian tiles.
            </p>
</div>
<div className={"flex items-center justify-between pt-2"}>
<div className={"flex items-center gap-1 text-secondary"}>
<span className={"material-symbols-outlined text-[14px]"}>toll</span>
<span className={"font-label-md text-label-md"}>1,200 🩸血晶石</span>
</div>
<button className={"px-3 py-1 bg-primary-container text-on-primary-container font-label-sm text-label-sm tracking-widest uppercase flex items-center gap-1"}>
<span>熔铸解锁</span>
</button>
</div>
</div>
</div>

<div className={"relative bg-surface-container-low p-space-sm flex gap-space-sm overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.6)]"}>
<div className={"relative w-24 h-28 bg-surface-container-lowest flex-shrink-0 flex items-center justify-center overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"Intricate bone and burnished antique gold chess bishop carved like an austere occult grand inquisitor wearing a horned miter, cinematic dark fantasy lighting."} src={"/__l5e/assets-v1/d6d54e1c-7da9-4c86-a17f-c85264ba2370/skin-gilded.png"} />
<span className={"absolute top-1 left-1 px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant font-label-sm text-[9px] tracking-widest font-bold uppercase"}>
            Rare
          </span>
</div>
<div className={"flex flex-col justify-between flex-1 min-w-0 py-0.5"}>
<div className={"flex flex-col"}>
<div className={"flex items-center justify-between"}>
<span className={"font-label-sm text-label-sm text-secondary-fixed-dim tracking-widest uppercase"}>Bishop · Grade IV</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Lv. 34</span>
</div>
<h2 className={"font-headline-sm text-[16px] text-on-surface tracking-wide uppercase truncate mt-0.5"}>圣堂主教 · 盲目审判</h2>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1"}>
              Carved from ancient dragon bone and brushed with molten ceremonial gold leaf.
            </p>
</div>
<div className={"flex items-center justify-between pt-2"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>Unclaimed Reward</span>
<button className={"px-3 py-1 bg-surface-container-high text-on-surface hover:text-secondary font-label-sm text-label-sm tracking-widest uppercase"}>
              检视细节
            </button>
</div>
</div>
</div>

<div className={"grid grid-cols-2 gap-space-sm md:col-span-2"}>
<div className={"bg-surface-container-low p-space-sm flex flex-col justify-between"}>
<div className={"relative w-full h-24 bg-surface-container-lowest mb-2 overflow-hidden flex items-center justify-center"}>
<img className={"w-full h-full object-cover"} data-alt={"A monolithic chess rook made of cracked basalt stone with crackling lightning arcane blue energy pulsing from within its battlements on a dark moody surface."} src={"/__l5e/assets-v1/2b347765-259e-4e34-90ff-448475092c21/skin-shadow.png"} />
<span className={"absolute bottom-1 right-1 px-1 bg-surface-container-highest text-secondary font-label-sm text-[9px]"}>Rook</span>
</div>
<span className={"font-headline-sm text-[13px] text-on-surface uppercase truncate"}>风暴壁垒 · 裂隙</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant mt-0.5"}>500 🩸 血晶</span>
<button className={"mt-2 w-full py-1 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase tracking-widest"}>
            预览
          </button>
</div>
<div className={"bg-surface-container-low p-space-sm flex flex-col justify-between"}>
<div className={"relative w-full h-24 bg-surface-container-lowest mb-2 overflow-hidden flex items-center justify-center"}>
<img className={"w-full h-full object-cover"} data-alt={"Dark wrought iron chess pawn sculpted with a screaming skull crest under dramatic directional golden rim light in an atmospheric grimdark chamber."} src={"/__l5e/assets-v1/3d15abc2-eee8-49ed-b811-31dbef55bf45/skin-classic.png"} />
<span className={"absolute bottom-1 right-1 px-1 bg-surface-container-highest text-primary font-label-sm text-[9px]"}>8x Pawns</span>
</div>
<span className={"font-headline-sm text-[13px] text-on-surface uppercase truncate"}>无名死侍 · 誓约</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant mt-0.5"}>解锁于 Rank 2400</span>
<button className={"mt-2 w-full py-1 bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase tracking-widest"}>
            预览
          </button>
</div>
</div>
</div>
</section>

<section className={"w-full px-margin-mobile py-space-md bg-surface-container-lowest/70 mt-space-sm"}>
<div className={"flex items-center justify-between pb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1 h-3.5 bg-primary"}></span>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>战役棋盘工坊 · Battlefield Boards</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>3 / 8 Sets</span>
</div>

<div className={"flex gap-space-sm overflow-x-auto pb-space-xs pt-1"}>

<div className={"w-64 flex-shrink-0 bg-surface-container-low p-space-sm shadow-[0_4px_16px_rgba(0,0,0,0.8)]"}>
<div className={"relative w-full h-32 bg-surface-container-lowest overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"Top down diagonal cinematic angle of an ancient gothic chessboard made of deep veined black obsidian and polished gold-accented white marble with atmospheric fog."} src={"/__l5e/assets-v1/96567e8b-b65b-4651-af12-7edcd6ee63b0/review-board.jpg"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"}></div>
<span className={"absolute top-2 left-2 px-2 py-0.5 bg-secondary text-on-secondary font-label-sm text-label-sm font-bold uppercase tracking-wider"}>
            Active Field
          </span>
</div>
<div className={"mt-2 flex flex-col"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-[14px] text-on-surface uppercase"}>永夜神庙 · 裂隙黑曜石</span>
<span className={"material-symbols-outlined text-[16px] text-secondary"}>check_circle</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant mt-0.5"}>Void Obsidian &amp; Veined Marble</span>
<div className={"flex items-center justify-between mt-3 pt-2 bg-surface-container px-2 py-1"}>
<span className={"font-label-sm text-label-sm text-secondary"}>Grid Emissive: Cold Pale</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>Defaults</span>
</div>
</div>
</div>

<div className={"w-64 flex-shrink-0 bg-surface-container-low p-space-sm shadow-[0_4px_16px_rgba(0,0,0,0.8)]"}>
<div className={"relative w-full h-32 bg-surface-container-lowest overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"Grimdark battlefield chessboard formed from charred ashen soil with glowing red embers outlining each chess square, surrounded by ancient battle standards."} src={"/__l5e/assets-v1/512864e6-ef6d-48cb-92db-9ce4af25bb06/match-arena.jpg"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"}></div>
<span className={"absolute top-2 left-2 px-2 py-0.5 bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm uppercase tracking-wider"}>
            Grandmaster Exclusive
          </span>
</div>
<div className={"mt-2 flex flex-col"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-[14px] text-on-surface uppercase"}>血色战壕 · 战火残棋</span>
<span className={"font-label-sm text-label-sm text-primary"}>2,600 ELO</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant mt-0.5"}>Ashen Battlefield &amp; Crimson Grid</span>
<div className={"flex items-center justify-between mt-3 pt-2 bg-surface-container px-2 py-1"}>
<span className={"font-label-sm text-label-sm text-primary"}>Grid Emissive: Vermilion Flame</span>
<button className={"font-label-sm text-label-sm text-secondary uppercase hover:underline"}>试炼</button>
</div>
</div>
</div>

<div className={"w-64 flex-shrink-0 bg-surface-container-low p-space-sm shadow-[0_4px_16px_rgba(0,0,0,0.8)]"}>
<div className={"relative w-full h-32 bg-surface-container-lowest overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"A celestial cosmic chessboard floating in the dark starlit void, surrounded by golden astrological clockwork rings and shimmering nebula dust."} src={"/__l5e/assets-v1/936655a1-a5fa-43b9-9916-f88a933b250b/hero-throne.jpg"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"}></div>
<span className={"absolute top-2 left-2 px-2 py-0.5 bg-surface-container-highest text-on-surface font-label-sm text-label-sm uppercase tracking-wider"}>
            Astral Relic
          </span>
</div>
<div className={"mt-2 flex flex-col"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-[14px] text-on-surface uppercase"}>星穹天顶 · 虚空罗盘</span>
<span className={"font-label-sm text-label-sm text-secondary"}>2,000 🩸</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant mt-0.5"}>Astral Abyss &amp; Gold Filigree</span>
<div className={"flex items-center justify-between mt-3 pt-2 bg-surface-container px-2 py-1"}>
<span className={"font-label-sm text-label-sm text-secondary"}>Grid Emissive: Star Starlight</span>
<button className={"font-label-sm text-label-sm text-secondary uppercase hover:underline"}>解锁</button>
</div>
</div>
</div>
</div>
</section>

<section className={"w-full px-margin-mobile py-space-md"}>
<div className={"p-space-md bg-surface-container-high/90 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.85)]"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>graphic_eq</span>
<span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>棋音圣咏试听 · SFX Acoustics</span>
</div>
<span className={"px-2 py-0.5 bg-surface-container text-secondary font-label-sm text-label-sm uppercase tracking-widest"}>
          High Fidelity
        </span>
</div>
<div className={"mt-space-sm flex items-center gap-space-sm"}>
<button className={"w-12 h-12 bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"} id={"playAudioPreviewBtn"}>
<span className={"material-symbols-outlined text-[24px]"} id={"audioIcon"}>volume_up</span>
</button>
<div className={"flex flex-col flex-1 min-w-0"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-[14px] text-on-surface uppercase leading-snug min-w-0 line-clamp-2 sm:truncate"}>深邃大理石撞击 · Hollow Heavy Marble</span>
<span className={"font-label-sm text-label-sm text-secondary"}>0:04</span>
</div>

<div className={"flex items-end gap-1 h-4 mt-2"}>
<div className={"w-1 bg-secondary h-2 animate-pulse"}></div>
<div className={"w-1 bg-secondary h-4"}></div>
<div className={"w-1 bg-secondary h-3 animate-pulse"}></div>
<div className={"w-1 bg-secondary h-1"}></div>
<div className={"w-1 bg-primary h-3"}></div>
<div className={"w-1 bg-primary h-4 animate-pulse"}></div>
<div className={"w-1 bg-primary h-2"}></div>
<div className={"w-1 bg-secondary h-3"}></div>
<div className={"w-1 bg-secondary h-4 animate-pulse"}></div>
<div className={"w-1 bg-secondary h-2"}></div>
<div className={"w-1 bg-secondary h-1"}></div>
<div className={"w-1 bg-outline-variant h-1"}></div>
<div className={"w-1 bg-outline-variant h-1"}></div>
<div className={"w-1 bg-outline-variant h-1"}></div>
</div>
</div>
</div>
</div>
</section>

<aside aria-label={"Forge Dock"} className={"fixed bottom-16 left-0 w-full z-40 px-margin-mobile py-space-sm bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.95)]"}>
<div className={"flex items-center justify-between gap-space-sm max-w-lg mx-auto"}>

<div className={"flex flex-col"}>
<div className={"flex items-center gap-1"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>Treasury (宝库)</span>
<span className={"w-1 h-1 rounded-full bg-secondary"}></span>
<span className={"font-label-sm text-label-sm text-secondary uppercase"}>Grandmaster</span>
</div>
<div className={"flex items-center gap-2 mt-0.5"}>
<div className={"flex items-center gap-1 text-secondary"}>
<span className={"material-symbols-outlined text-[16px]"}>military_tech</span>
<span className={"font-label-md text-label-md font-bold"}>2,480 ELO</span>
</div>
<span className={"text-outline-variant"}>|</span>
<div className={"flex items-center gap-1 text-primary"}>
<span className={"material-symbols-outlined text-[16px]"}>toll</span>
<span className={"font-label-md text-label-md font-bold"}>3,450 🩸</span>
</div>
</div>
</div>

<div className={"flex items-center gap-space-xs"}>
<button className={"px-3 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md tracking-wider uppercase flex items-center gap-1 transition-colors"}>
<span className={"material-symbols-outlined text-[16px]"}>visibility</span>
<span className={"hidden sm:inline"}>全屏检视</span>
</button>
<button className={"px-4 py-2.5 bg-primary-container hover:bg-tertiary-container text-on-primary-container font-label-md text-label-md tracking-widest uppercase flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(139,30,30,0.5)]"} id={"forgeBtn"}>
<span className={"material-symbols-outlined text-[18px]"}>gavel</span>
<span>熔铸装备此套</span>
</button>
</div>
</div>
</aside>

<div className={"fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-surface-container-highest text-secondary font-label-md text-label-md tracking-wider uppercase pointer-events-none opacity-0 transition-opacity duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.9)] flex items-center gap-2"} id={"vaultToast"}>
<span className={"material-symbols-outlined text-[16px] text-secondary"}>verified</span>
<span id={"vaultToastMessage"}>已就位 · Relic Synchronized</span>
</div>
</div>
</main>
    </div>
  );
}
