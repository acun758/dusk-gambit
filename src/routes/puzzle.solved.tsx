import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/puzzle/solved")({
  head: () => ({
    meta: [
      { title: "Puzzle Resolved \u2014 S+ Execution" },
      { name: "description", content: "Perfect checkmate: spoils of war, ladder points and the Void Arbiter title unlocked." },
      { property: "og:title", content: "Puzzle Resolved \u2014 S+ Execution" },
      { property: "og:description", content: "Perfect checkmate: spoils of war, ladder points and the Void Arbiter title unlocked." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PuzzleSolved,
});

function PuzzleSolved() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-16 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><button aria-label={"Withdraw"} className={"w-11 h-11 flex items-center justify-center text-secondary hover:text-secondary-fixed transition-colors"}><span className={"material-symbols-outlined text-[24px]"}>arrow_back</span></button><div className={"flex flex-col"}><span className={"font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider"}>Active Confrontation</span></div></div><div className={"flex items-center gap-space-xs"}><button aria-label={"Game Settings"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>tune</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-16 bg-surface min-h-screen"}><div className={"flex flex-col w-full relative"}>

<div className={"relative w-full overflow-hidden bg-surface-container-lowest px-margin-mobile pt-space-md pb-space-lg"}>

<div className={"flex items-center justify-between py-space-xs mb-space-sm bg-surface-container-high/60 backdrop-blur-md px-space-md rounded-lg shadow-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"}></span>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>WECHAT MINI 3D · PUZZLE RESOLVED</span>
</div>

<div className={"flex items-center bg-surface-container-highest/90 px-space-sm py-1 rounded-full gap-space-sm shadow-inner"}>
<span className={"material-symbols-outlined text-[14px] text-on-surface-variant"}>more_horiz</span>
<span className={"w-px h-3 bg-outline-variant"}></span>
<span className={"material-symbols-outlined text-[14px] text-on-surface"}>radio_button_checked</span>
</div>
</div>

<div className={"relative w-full rounded-xl overflow-hidden shadow-2xl bg-surface-container-low p-space-xs"}>

<div className={"relative w-full h-56 rounded-lg overflow-hidden bg-surface-container-lowest"}>
<img className={"w-full h-full object-cover opacity-75"} data-alt={"Dark dramatic occult gothic chess scene, macro shattered crystalline glowing white king piece exploding under crushing black armored gauntlet, crimson lightning arcs, obsidian chess board cracks glowing red, volumetric smoke, chiaroscuro lighting, cinematic masterpiece"} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuDWH5xYqYaNgGhOHv8WrVFVWvB67RFROnm5jPfGjV0drK6ZRcxId1bToywpvJmRx9KxGQNb9ocpYKtNb6OwMeD1F1tPp0gIixqAJ7kaWXLFJdM21nTYcKmSXCzDagrXtC7g3loH_QZV_E2ZAyLZUejXLZbUBf_l1FtpejKUvwWD81gdVA55coI9DZzUJvV0iPznKQGeGSoNID7l21xJQspZvFBbIZ6TTuS1Q0EJ_9hi-JXcDhrS0TUvJA"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/40 to-transparent"}></div>

<div className={"absolute top-3 left-3 flex items-center gap-space-xs bg-surface-container-lowest/90 backdrop-blur-md px-space-sm py-1 rounded"}>
<span className={"material-symbols-outlined text-[16px] text-primary"}>gavel</span>
<span className={"font-label-sm text-label-sm text-on-surface tracking-wider"}>CHECKMATE · Qf7#</span>
</div>
<div className={"absolute top-3 right-3 bg-tertiary-container/80 text-on-tertiary-container px-space-sm py-1 rounded font-label-sm text-label-sm uppercase"}>
          PERFECT 1/1
        </div>

<div className={"absolute inset-0 flex flex-col items-center justify-center p-space-md text-center"}>
<div className={"w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/50 mb-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[26px]"}>swords</span>
</div>
<span className={"font-headline-lg-mobile text-headline-lg-mobile text-secondary tracking-widest uppercase drop-shadow-[0_2px_12px_rgba(233,195,73,0.5)]"}>
            绝杀斩首 · 破局成功
          </span>
<span className={"font-label-md text-label-md text-on-surface-variant tracking-wider uppercase mt-0.5"}>
            PUZZLE MASTER RESOLVED // 白王陨落
          </span>
</div>
</div>
</div>

<div className={"mt-space-sm bg-surface-container rounded-xl p-space-md shadow-2xl relative"}>

<div className={"flex items-center justify-between pb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>workspace_premium</span>
<span className={"font-label-md text-label-md text-secondary tracking-widest uppercase"}>宗师级完美判词</span>
</div>
<div className={"flex gap-0.5 text-secondary"}>
<span className={"material-symbols-outlined text-[16px]"}>star</span>
<span className={"material-symbols-outlined text-[16px]"}>star</span>
<span className={"material-symbols-outlined text-[16px]"}>star</span>
</div>
</div>

<div className={"grid grid-cols-3 gap-space-xs py-space-sm bg-surface-container-lowest rounded-lg px-space-sm"}>
<div className={"flex flex-col items-center justify-center text-center py-1"}>
<span className={"font-label-sm text-label-sm text-outline tracking-wider uppercase"}>耗时判定</span>
<span className={"font-headline-md text-headline-md text-secondary tracking-tight"}>2.8s</span>
<span className={"font-label-sm text-label-sm text-tertiary"}>击败 96% 好友</span>
</div>
<div className={"flex flex-col items-center justify-center text-center py-1 bg-surface-container-low rounded"}>
<span className={"font-label-sm text-label-sm text-outline tracking-wider uppercase"}>步数消耗</span>
<span className={"font-headline-md text-headline-md text-primary tracking-tight"}>1 / 1</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant"}>一击定乾坤</span>
</div>
<div className={"flex flex-col items-center justify-center text-center py-1"}>
<span className={"font-label-sm text-label-sm text-outline tracking-wider uppercase"}>战局评级</span>
<span className={"font-headline-md text-headline-md text-secondary-fixed tracking-tight"}>S+</span>
<span className={"font-label-sm text-label-sm text-secondary"}>超越宗师线</span>
</div>
</div>

<div className={"mt-space-sm"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"}>通关斩首战利品 (SPOILS OF WAR)</span>
<span className={"font-label-sm text-label-sm text-primary uppercase"}>已存入棋库</span>
</div>
<div className={"grid grid-cols-2 gap-space-xs"}>

<div className={"flex items-center gap-space-sm bg-surface-container-high p-space-sm rounded-lg"}>
<div className={"w-9 h-9 rounded bg-primary-container flex items-center justify-center text-primary shadow-sm"}>
<span className={"material-symbols-outlined text-[20px]"}>diamond</span>
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md text-on-surface truncate"}>猩红碎晶</span>
<span className={"font-headline-sm text-headline-sm text-primary leading-none mt-0.5"}>+50</span>
</div>
</div>

<div className={"flex items-center gap-space-sm bg-surface-container-high p-space-sm rounded-lg"}>
<div className={"w-9 h-9 rounded bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-sm"}>
<span className={"material-symbols-outlined text-[20px]"}>military_tech</span>
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-md text-label-md text-on-surface truncate"}>天梯棋力</span>
<span className={"font-headline-sm text-headline-sm text-secondary leading-none mt-0.5"}>+15 PTS</span>
</div>
</div>
</div>

<div className={"mt-space-xs bg-tertiary-container/40 p-space-sm rounded-lg flex items-center gap-space-sm"}>
<div className={"w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container shrink-0"}>
<span className={"material-symbols-outlined text-[18px]"}>verified</span>
</div>
<div className={"flex flex-col min-w-0 flex-1"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-sm text-label-sm bg-primary-container text-on-primary-container px-1 py-0.5 rounded uppercase"}>称号解锁</span>
<span className={"font-label-lg text-label-lg text-on-surface truncate"}>虚空断罪斩首者</span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>本周微信限定佩戴 · 个人主页辉耀生效</span>
</div>
</div>
</div>

<div className={"mt-space-md pt-space-sm bg-surface-container-lowest/80 rounded-lg p-space-sm"}>
<div className={"flex items-center justify-between mb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-[16px] text-secondary"}>forum</span>
<span className={"font-label-md text-label-md text-on-surface tracking-wider"}>微信好友手速解谜榜</span>
</div>
<span className={"font-label-sm text-label-sm text-outline"}>全网第 142 破局</span>
</div>

<div className={"space-y-1"}>

<div className={"flex items-center justify-between p-1.5 rounded bg-surface-container-low"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<span className={"font-label-md text-label-md text-secondary font-bold w-4 text-center"}>1</span>
<div className={"w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-on-surface text-[10px]"}>
                GM
              </div>
<span className={"font-body-sm text-body-sm text-on-surface truncate"}>Vane 宗师</span>
</div>
<span className={"font-label-md text-label-md text-secondary"}>2.1s</span>
</div>

<div className={"flex items-center justify-between p-1.5 rounded bg-primary-container/30"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<span className={"font-label-md text-label-md text-primary font-bold w-4 text-center"}>2</span>
<div className={"w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold"}>
                我
              </div>
<div className={"flex items-center gap-1 min-w-0"}>
<span className={"font-body-sm text-body-sm text-primary font-medium truncate"}>我 (夜幕执子)</span>
<span className={"font-label-sm text-label-sm bg-primary/20 text-primary px-1 rounded"}>刚刚</span>
</div>
</div>
<span className={"font-label-md text-label-md text-primary font-bold"}>2.8s</span>
</div>

<div className={"flex items-center justify-between p-1.5 rounded bg-surface-container-low"}>
<div className={"flex items-center gap-space-sm min-w-0"}>
<span className={"font-label-md text-label-md text-outline font-bold w-4 text-center"}>3</span>
<div className={"w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-on-surface text-[10px]"}>
                李
              </div>
<span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>棋圣老李 (群友)</span>
</div>
<span className={"font-label-md text-label-md text-outline"}>3.5s</span>
</div>
</div>

<button className={"w-full mt-space-xs py-2 bg-surface-container-high hover:bg-surface-bright active:scale-[0.99] transition-all rounded flex items-center justify-center gap-space-xs text-secondary"}>
<span className={"material-symbols-outlined text-[16px]"}>share</span>
<span className={"font-label-md text-label-md tracking-wider"}>生成我的斩首战报图 · 晒到朋友圈</span>
</button>
</div>

<div className={"mt-space-md space-y-space-xs"}>

<button className={"w-full py-3.5 bg-primary-container hover:bg-primary-container/90 active:scale-[0.99] transition-all rounded shadow-lg shadow-primary-container/40 flex items-center justify-center gap-space-sm text-on-primary-container"}>
<span className={"material-symbols-outlined text-[20px] text-secondary"}>trophy</span>
<span className={"font-label-lg text-label-lg tracking-widest uppercase"}>领取奖励并挑战下一残局 (NEXT PUZZLE)</span>
<span className={"material-symbols-outlined text-[18px]"}>arrow_forward</span>
</button>

<div className={"grid grid-cols-2 gap-space-xs pt-1"}>
<button className={"py-2.5 px-space-xs bg-surface-container-high hover:bg-surface-bright active:scale-[0.99] transition-all rounded flex items-center justify-center gap-1 text-on-surface"}>
<span className={"material-symbols-outlined text-[16px] text-tertiary"}>send</span>
<span className={"font-label-md text-label-md truncate"}>群内下战书</span>
</button>
<button className={"py-2.5 px-space-xs bg-surface-container-high hover:bg-surface-bright active:scale-[0.99] transition-all rounded flex items-center justify-center gap-1 text-on-surface"}>
<span className={"material-symbols-outlined text-[16px] text-secondary"}>videocam</span>
<span className={"font-label-md text-label-md truncate"}>3D 斩首回放</span>
</button>
</div>
</div>

<div className={"mt-space-md pt-space-xs text-center"}>
<a className={"inline-flex items-center gap-space-xs text-on-surface-variant hover:text-secondary transition-colors py-1"} href={"#"}>
<span className={"material-symbols-outlined text-[14px] text-secondary"}>token</span>
<span className={"font-label-sm text-label-sm tracking-wider"}>前往《暗黑国际象棋》App 激活 1000 碎晶礼包</span>
<span className={"material-symbols-outlined text-[12px]"}>chevron_right</span>
</a>
</div>
</div>
</div>
</div></main>
    </div>
  );
}
