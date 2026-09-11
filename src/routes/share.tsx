import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Card Distribution Canvas \u2014 Blood Sovereign" },
      { name: "description", content: "Preview WeChat bubbles, moments cards and rich media links for your battle report." },
      { property: "og:title", content: "Card Distribution Canvas \u2014 Blood Sovereign" },
      { property: "og:description", content: "Preview WeChat bubbles, moments cards and rich media links for your battle report." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShareCanvas,
});

function ShareCanvas() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
<header className={"fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]"}><div className={"h-20 px-margin-mobile flex items-center justify-between"}><div className={"flex items-center gap-space-sm"}><div className={"w-11 h-11 bg-surface-container-high flex items-center justify-center relative"}><span className={"material-symbols-outlined text-secondary text-[22px]"}>military_tech</span></div><div className={"flex flex-col"}><div className={"flex items-center gap-space-xs"}><span className={"font-label-sm text-label-sm uppercase text-secondary tracking-widest"}>Rank 2480</span><span className={"w-1 h-1 rounded-full bg-primary"}></span><span className={"font-label-sm text-label-sm text-primary-fixed uppercase"}>Grandmaster</span></div><span className={"font-headline-sm text-headline-sm text-on-surface tracking-wider uppercase"}>Battle</span></div></div><div className={"flex items-center gap-space-xs"}><div className={"hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high"}><span className={"material-symbols-outlined text-secondary text-[16px] mr-space-xs"}>timer</span><span className={"font-label-md text-label-md text-secondary tracking-widest"}>10:00</span></div><button aria-label={"Haptics & Audio"} className={"w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"}><span className={"material-symbols-outlined text-[20px]"}>volume_up</span></button><div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}><span className={"material-symbols-outlined text-on-primary text-[18px]"}>person</span></div></div></div></header><main className={"flex flex-col relative w-full pt-20 bg-surface min-h-screen"}><div className={"flex flex-col w-full text-on-surface"}>

<section className={"w-full px-margin-mobile pt-space-xs pb-space-sm bg-surface-container-lowest"}>
<div className={"flex items-center justify-between gap-space-xs mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<button className={"w-9 h-9 flex items-center justify-center bg-surface-container-high active:bg-surface-container-highest transition-colors"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>arrow_back</span>
</button>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-primary"}>Card Distribution Canvas</span>
<h1 className={"font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider"}>社交传播视界</h1>
</div>
</div>
<button className={"flex items-center gap-1 px-space-sm py-1.5 bg-surface-container-high text-secondary active:bg-surface-container-highest transition-all shadow-sm"}>
<span className={"material-symbols-outlined text-[16px]"}>tune</span>
<span className={"font-label-sm text-label-sm uppercase tracking-wider"}>切换形态</span>
</button>
</div>

<div className={"grid grid-cols-3 gap-1 p-1 bg-surface-container-lowest"}>
<button className={"flex items-center justify-center gap-1 py-2 px-1 bg-surface-container-high text-secondary shadow-[0_2px_8px_rgba(0,0,0,0.6)]"}>
<span className={"material-symbols-outlined text-[16px] text-primary"}>chat</span>
<span className={"font-label-sm text-label-sm uppercase tracking-tight"}>微信气泡</span>
</button>
<button className={"flex items-center justify-center gap-1 py-2 px-1 text-on-surface-variant hover:text-on-surface transition-colors"}>
<span className={"material-symbols-outlined text-[16px]"}>dynamic_feed</span>
<span className={"font-label-sm text-label-sm uppercase tracking-tight"}>朋友圈卡</span>
</button>
<button className={"flex items-center justify-center gap-1 py-2 px-1 text-on-surface-variant hover:text-on-surface transition-colors"}>
<span className={"material-symbols-outlined text-[16px]"}>share</span>
<span className={"font-label-sm text-label-sm uppercase tracking-tight"}>富媒体外链</span>
</button>
</div>
</section>

<div className={"flex flex-col gap-space-lg px-margin-mobile py-space-md"}>

<div className={"flex flex-col gap-space-sm"}>

<div className={"flex items-center justify-between px-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-1.5 bg-primary"}></span>
<span className={"font-label-md text-label-md text-primary uppercase tracking-widest"}>情境预览 01 · 微信会话专属小程序</span>
</div>
<span className={"font-label-sm text-label-sm text-secondary tracking-widest uppercase"}>HD 5:4 CARD</span>
</div>

<div className={"flex flex-col p-space-md bg-surface-container-lowest shadow-[0_16px_36px_rgba(0,0,0,0.95)]"}>

<div className={"flex justify-center mb-space-sm"}>
<span className={"px-space-sm py-0.5 bg-surface-container text-on-surface-variant font-label-sm text-label-sm"}>
            今日 21:42 · 猩红王权专属加密对局
          </span>
</div>

<div className={"flex items-start justify-end gap-space-sm w-full"}>
<div className={"flex flex-col items-end max-w-[88%] gap-1.5"}>

<div className={"p-space-sm bg-surface-container-high text-on-surface font-body-md text-body-md shadow-md"}>
              刚才天梯第38步绝杀！虚空断罪直接击碎白王，复盘看一下这盘死斗 ♟️🔥
            </div>

<div className={"w-full bg-surface-container-low shadow-[0_14px_32px_rgba(104,1,9,0.35)] overflow-hidden"}>

<div className={"flex items-center justify-between px-space-sm py-2 bg-surface-container-high"}>
<div className={"flex items-center gap-1.5"}>
<div className={"w-5 h-5 bg-primary-container flex items-center justify-center"}>
<span className={"material-symbols-outlined text-secondary text-[13px]"}>military_tech</span>
</div>
<span className={"font-label-sm text-label-sm uppercase tracking-widest text-secondary"}>王权战报 · BLOOD SOVEREIGN</span>
</div>
<div className={"flex items-center gap-1"}>
<span className={"px-1.5 py-0.5 bg-primary-container font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider"}>
                    ELO +24
                  </span>
</div>
</div>

<div className={"relative w-full h-44 overflow-hidden bg-surface-container-lowest"}>
<img className={"w-full h-full object-cover"} data-alt={"Cinematic dark fantasy chess scene showing obsidian gauntleted hands shattering a glowing crystal king piece on a cracked marble chessboard, crimson blood sparks bursting into the atmosphere with volumetric smoke and dramatic chiaroscuro illumination."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuAktkChpKrkUfQpVZ7BoBxG1MdJeR8f8VRTGdTYpOWZMqlH81apVOeUDLVuOg0Op5sbBFBn03TzcHWrX9MWJZNBJVBFjnVHiwOqoOBILRrxqGDtglbWnDkeZ9GUOi865ca1JJGE7u7Nyn-fN7LwL44TWlqJTa0kKbJUWYGY9K3hj1yJX2F3sJiWOkEuz9F1j2w9XfCaIwQQcnbbECSzZVxkzalHM2Vq4SIaVQIDAvpbtju0lTfZfx8TaQ"} />

<div className={"absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-surface-container-lowest/90 backdrop-blur-md"}>
<span className={"font-headline-sm text-headline-sm text-secondary leading-none"}>A</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-widest"}>Move 38: ♛ Qf7#</span>
</div>

<div className={"absolute top-2 right-2 px-2 py-1 bg-primary-container/90 backdrop-blur-md text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider"}>
                  M0 斩首绝杀
                </div>

<div className={"absolute bottom-0 inset-x-0 p-space-sm bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent flex items-end justify-between"}>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest"}>White Resigns</span>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>GM VANE vs CINDERS</span>
</div>
<div className={"flex flex-col items-end"}>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-wider"}>精度 98.6%</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase"}>38 回合</span>
</div>
</div>
</div>

<div className={"flex flex-col p-space-sm gap-2 bg-surface-container"}>

<div className={"flex items-center gap-2 p-1.5 bg-surface-container-high"}>
<span className={"material-symbols-outlined text-secondary text-[16px]"}>graphic_eq</span>
<span className={"font-label-sm text-label-sm text-on-surface-variant truncate italic"}>
                    敕令配音: "The Queen doesn't follow the board. She owns it."
                  </span>
</div>

<button className={"w-full py-2.5 px-space-sm bg-primary-container text-primary-fixed flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(139,30,30,0.5)] active:scale-[0.98] transition-transform"}>
<span className={"material-symbols-outlined text-[18px] text-secondary"}>play_arrow</span>
<span className={"font-label-md text-label-md tracking-widest uppercase"}>启动微信小程序 · 3D慢速斩首复盘</span>
</button>
</div>

<div className={"flex items-center justify-between px-space-sm py-1.5 bg-surface-container-lowest"}>
<div className={"flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm"}>
<span className={"material-symbols-outlined text-[14px]"}>extension</span>
<span>微信游戏圈战报互动组件</span>
</div>
<span className={"material-symbols-outlined text-on-surface-variant text-[14px]"}>arrow_forward</span>
</div>
</div>
</div>

<div className={"w-9 h-9 bg-primary-container flex items-center justify-center shadow-md flex-shrink-0"}>
<span className={"font-headline-sm text-headline-sm text-primary-fixed"}>V</span>
</div>
</div>
</div>
</div>

<div className={"flex flex-col gap-space-sm"}>

<div className={"flex items-center justify-between px-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-1.5 bg-secondary"}></span>
<span className={"font-label-md text-label-md text-secondary uppercase tracking-widest"}>情境预览 02 · 朋友圈动态卡片</span>
</div>
<span className={"font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"}>FEED MOMENTS</span>
</div>

<div className={"flex flex-col p-space-md bg-surface-container-low shadow-[0_16px_36px_rgba(0,0,0,0.9)]"}>

<div className={"flex items-start gap-space-sm mb-space-sm"}>
<div className={"w-10 h-10 bg-primary-container flex items-center justify-center relative flex-shrink-0"}>
<span className={"font-headline-sm text-headline-sm text-primary-fixed"}>V</span>
<div className={"absolute -bottom-1 -right-1 w-4 h-4 bg-secondary flex items-center justify-center"}>
<span className={"material-symbols-outlined text-on-secondary text-[11px]"}>workspace_premium</span>
</div>
</div>
<div className={"flex flex-col min-w-0 flex-1"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-headline-sm text-on-surface"}>GM VANE</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>RANK #48</span>
</div>
<div className={"flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm"}>
<span>刚刚</span>
<span>·</span>
<span className={"text-primary-fixed-dim"}>猩红宗师天梯榜</span>
</div>
</div>
</div>

<p className={"font-body-md text-body-md text-on-surface mb-space-sm leading-relaxed"}>
          “She doesn't follow the board. She owns it.” ♟️<br />
          第38步皇后虚空突刺斩杀！感谢对弈宿敌 <span className={"text-secondary"}>@Lord_Cinders</span>，愿鲜血浸润王座。
          <span className={"text-primary font-label-md text-label-md"}>#暗黑国际象棋 #绝杀斩首</span>
</p>

<div className={"relative w-full bg-surface-container-lowest p-space-sm mb-space-sm shadow-xl"}>
<div className={"relative w-full aspect-[4/5] bg-surface-container overflow-hidden"}>
<img className={"w-full h-full object-cover"} data-alt={"Luxury dark occult tarot playing card featuring a crowned royal golden queen chess piece against an ancient gothic parchment background with blood red card suits, gold leaf typography saying THE QUEEN OWNS IT, dramatic rim lighting and fine cracked textures."} src={"https://lh3.googleusercontent.com/aida-public/AB6AXuCQzKVtISGUvPxEaCVu86EnQjzA_WVQM480j3EE3vuFA13DTfeS6HrWklUBipOxryW4NyghBLFEcf7CIz2atgyS9QCsxEblcXnXE-JjaF9I-cg8rTKOQz3sphr2WcJOubdmBW4XuGOx_cW6-GFoGnectrBzoXMhQ6KX5AdvQa3zK-UMe5WKCDFDQiMKvSjF9Q71rsLAkH68GYM1QqNxzAfsnwasgSUtkpRgBwfFXtMxE13mJZzP5Y5ezw"} />

<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-surface-container-lowest/30"}></div>

<div className={"absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest/90 backdrop-blur-md"}>
<span className={"material-symbols-outlined text-secondary text-[14px]"}>crown</span>
<span className={"font-label-sm text-label-sm text-secondary uppercase tracking-widest"}>SOVEREIGN TAROT NO.01</span>
</div>

<div className={"absolute inset-x-3 bottom-14 flex flex-col items-center text-center p-space-sm bg-surface-container-lowest/85 backdrop-blur-md"}>
<span className={"font-label-sm text-label-sm text-primary uppercase tracking-widest mb-0.5"}>Grandmaster Climax</span>
<h2 className={"font-headline-md text-headline-md text-secondary uppercase tracking-wider"}>THE QUEEN'S REIGN</h2>
<span className={"font-body-sm text-body-sm text-on-surface-variant italic"}>Move 38: Qf7# / Absolute Checkmate</span>
</div>

<div className={"absolute bottom-3 inset-x-3 flex items-center justify-between px-space-sm py-1.5 bg-surface-container-high/90 backdrop-blur-md"}>
<div className={"flex items-center gap-2"}>
<span className={"material-symbols-outlined text-secondary text-[18px]"}>qr_code_2</span>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-wider"}>长按识别 · 棋谱同步观战</span>
</div>
<span className={"font-label-sm text-label-sm text-primary-fixed uppercase tracking-widest"}>LIVE M0</span>
</div>
</div>
</div>

<div className={"flex items-center justify-between pt-space-xs text-on-surface-variant"}>
<div className={"flex items-center gap-space-md"}>

<button className={"flex items-center gap-1 text-primary active:scale-95 transition-transform"}>
<span className={"material-symbols-outlined text-[18px]"} style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
<span className={"font-label-md text-label-md tracking-wider"}>膜拜 382</span>
</button>

<button className={"flex items-center gap-1 text-secondary active:scale-95 transition-transform"}>
<span className={"material-symbols-outlined text-[18px]"}>swords</span>
<span className={"font-label-md text-label-md tracking-wider"}>发起对决</span>
</button>

<button className={"flex items-center gap-1 hover:text-on-surface transition-colors"}>
<span className={"material-symbols-outlined text-[18px]"}>mode_comment</span>
<span className={"font-label-md text-label-md tracking-wider"}>64</span>
</button>
</div>
<button className={"w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-secondary"}>
<span className={"material-symbols-outlined text-[18px]"}>more_horiz</span>
</button>
</div>

<div className={"mt-space-sm p-space-sm bg-surface-container text-on-surface-variant flex flex-col gap-1"}>
<div className={"font-body-sm text-body-sm"}>
<span className={"text-secondary font-label-md text-label-md"}>Lord_Cinders:</span> 
            第34步的弃车诱敌太狠了，心服口服。等待天梯赛季复仇战！
          </div>
<div className={"font-body-sm text-body-sm"}>
<span className={"text-primary font-label-md text-label-md"}>Crimson_Knight:</span> 
            双后协同绝杀！这局可以收录进赛季宗师名人堂了。
          </div>
</div>
</div>
</div>

<div className={"p-space-sm bg-surface-container-high flex items-center justify-between gap-space-sm"}>
<div className={"flex items-center gap-2"}>
<span className={"material-symbols-outlined text-secondary text-[20px]"}>verified</span>
<div className={"flex flex-col"}>
<span className={"font-label-sm text-label-sm text-on-surface uppercase tracking-wider"}>已适配微信与主流社媒标准</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>支持微信卡片即点即玩 · 支持一键保存朋友圈无损原图</span>
</div>
</div>
<span className={"px-2 py-1 bg-surface-container-lowest text-primary font-label-sm text-label-sm uppercase"}>24Bit 4K</span>
</div>
</div>

<div className={"sticky bottom-16 w-full px-margin-mobile py-space-sm bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-12px_32px_rgba(0,0,0,0.95)]"}>
<div className={"grid grid-cols-2 gap-space-sm"}>

<button className={"h-11 px-space-sm bg-surface-container-high text-secondary flex items-center justify-center gap-2 active:bg-surface-container-highest transition-colors"}>
<span className={"material-symbols-outlined text-[18px]"}>link</span>
<span className={"font-label-md text-label-md tracking-wider uppercase"}>复制深度分享链</span>
</button>

<button className={"h-11 px-space-sm bg-primary-container text-primary-fixed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,30,30,0.6)] active:scale-[0.98] transition-transform"}>
<span className={"material-symbols-outlined text-[18px] text-secondary"}>send</span>
<span className={"font-label-md text-label-md tracking-wider uppercase"}>立即推送到微信</span>
</button>
</div>
</div>
</div></main><nav className={"fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"} data-active-classes={"text-secondary bg-surface-container-high/60"}><div className={"h-16 px-gutter-mobile flex items-center justify-around"}><a aria-current={"page"} className={"flex flex-col items-center justify-center w-full h-11 transition-colors gap-0.5 text-secondary bg-surface-container-high/60"} data-path={"battle"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>swords</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Battle</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"tactics"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>chess_knight</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Tactics</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"the-vault"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>auto_stories</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Vault</span></a><a className={"flex flex-col items-center justify-center w-full h-11 text-on-surface-variant hover:text-secondary transition-colors gap-0.5"} data-path={"dynasty"} href={"#"}><span className={"material-symbols-outlined text-[20px]"}>shield</span><span className={"font-label-sm text-label-sm tracking-widest uppercase"}>Dynasty</span></a></div></nav>
    </div>
  );
}
