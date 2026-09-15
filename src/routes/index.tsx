import { PlayerAvatar } from "@/components/PlayerAvatar";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile";
import { Bi, LangToggle, useT } from "@/lib/i18n";
import { GAME_ART } from "@/lib/game-art-assets";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { InvitePoster } from "@/components/InvitePoster";
import { GameIcon } from "@/components/GameIcon";
import { UiIcon } from "@/components/UiIcon";
import { PromotionOverlay, usePromotionCeremony } from "@/components/PromotionOverlay";

const HERO_PORTRAIT = GAME_ART.heroPortrait;
const HERO_VIDEO = GAME_ART.heroVideo;
const HERO = GAME_ART.hero;
const RELIC_A = GAME_ART.matchArena;
const RELIC_B = GAME_ART.reviewBoard;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "玄弈 · DUSK GAMBIT | 血誓王权 Blood Sovereign" },
      {
        name: "description",
        content: "玄弈 DUSK GAMBIT：天梯段位、3+2 快棋对弈、残局试炼与圣物军械库。Ranked chess conquest, blitz duels and endgame trials.",
      },
      { property: "og:title", content: "玄弈 · DUSK GAMBIT | 血誓王权 Blood Sovereign" },
      { property: "og:description", content: "天梯段位、3+2 快棋对弈、残局试炼与圣物军械库。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: HERO },
      { name: "twitter:image", content: HERO },
    ],
  }),
  component: Index,
});

function Index() {
  const { profile, winRate, signedIn, loading } = useProfile();
  const t = useT();
  const nextTier = profile.elo >= 2500 ? 2600 : profile.elo >= 2400 ? 2500 : 2400;
  const floor = nextTier - 100;
  const progress = Math.max(4, Math.min(100, ((profile.elo - floor) / (nextTier - floor)) * 100));
  const rankArt = profile.elo >= 2600 ? "rank-sovereign" : profile.elo >= 2500 ? "rank-apex" : profile.elo >= 2400 ? "rank-grandmaster" : profile.elo >= 2200 ? "rank-master" : "rank-knight";
  const ceremony = usePromotionCeremony(
    { key: profile.tier, zh: profile.tierZh, en: profile.tier, art: rankArt, floor: profile.elo >= 2600 ? 2600 : profile.elo >= 2500 ? 2500 : profile.elo >= 2400 ? 2400 : profile.elo >= 2200 ? 2200 : 0 },
    signedIn,
  );

  return (
    <div className="themed-page home-glass-page text-on-surface flex flex-col min-h-screen">
      <ThemeBackdrop theme="storm" />
      <PromotionOverlay event={ceremony.event} onDismiss={ceremony.dismiss} />
      <header className="home-glass-scope home-glass-header desktop-page-header fixed top-0 w-full z-40 pt-safe">
        <div className="h-24 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm sm:gap-space-md min-w-0">
            <div className="home-glass-control w-12 h-12 sm:w-[4.5rem] sm:h-[4.5rem] flex items-center justify-center shrink-0 overflow-hidden">
              <GameIcon name="brand-emblem" className="h-10 w-10 sm:h-16 sm:w-16" label={t("玄弈徽章", "Dusk Gambit emblem")} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md uppercase text-secondary tracking-widest tabular-nums">
                  {profile.elo} ELO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="cjk font-label-md text-label-md text-primary-fixed truncate">
                  {t(profile.tierZh, profile.tier)}
                </span>
              </div>
              {/* 品牌名与进入页一致：玄弈 · DUSK GAMBIT。手机竖排避免截断，桌面横排双语并列。 */}
              <Bi
                zh="玄弈"
                en="DUSK GAMBIT"
                block
                className="font-headline-lg-mobile text-headline-lg-mobile leading-[1.15] tracking-[0.08em] text-on-surface sm:flex-row sm:items-baseline sm:gap-1.5 sm:leading-tight sm:tracking-[0.12em] sm:font-headline-lg sm:text-headline-lg"
                subClassName="tracking-[0.18em]"
              />
              <span className="h-px w-24 mt-1 bg-gradient-to-r from-secondary/80 to-transparent" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <LangToggle className="home-glass-control" />
            <div className="home-glass-control hidden h-11 shrink-0 items-center gap-1 px-space-sm sm:flex">
              <UiIcon name="crystal" className="h-6 w-6" />
              <span className="font-label-md text-label-md text-secondary tracking-widest tabular-nums">
                {profile.diamonds.toLocaleString()}
              </span>
            </div>
            <Link
               to={signedIn ? "/dynasty" : "/auth"}
              className="home-glass-action flex h-11 shrink-0 items-center justify-center px-3 text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest"
            >
               {signedIn ? t("我的档案", "Profile") : t("登录", "Sign in")}
            </Link>
          </div>
        </div>
      </header>

      <main className="page-main-hero flex flex-col relative w-full bg-surface min-h-screen">
        <div className="home-glass-scope desktop-page-container flex flex-col w-full pb-32 px-margin-mobile">
          <div className="mt-space-md">
            <InvitePoster className="home-glass-panel" />
          </div>
          {/* 誓约横幅 */}
          <section className="home-glass-panel relative w-full mt-space-md p-space-xs">
            <div className="relative w-full p-space-md overflow-hidden rounded-[0.75rem]">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 via-surface-container-lowest/60 to-surface-container-lowest pointer-events-none" />
              <div className="flex items-center justify-between gap-space-sm relative z-10">
                <div className="flex items-center gap-space-xs min-w-0">
                  <PlayerAvatar className="h-7 w-7" avatarKey={profile.avatarKey} avatarPath={profile.avatarPath} seed={profile.name} />
                  <span className="font-label-md text-label-md text-on-surface tracking-widest truncate">{profile.name}</span>
                </div>
                <div className="home-glass-chip flex items-center gap-space-xs px-space-sm py-0.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="cjk font-label-sm text-label-sm text-secondary tracking-widest whitespace-nowrap">
                    {t("君主敕令", "The Sovereign's Decree")}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center mt-space-md mb-space-sm">
                <div className="home-glass-media home-media-frame aged-print-frame relative w-full h-56 lg:h-72 overflow-hidden mb-space-md">
                  <img
                    className="block w-full h-full object-cover object-center sm:hidden"
                    src={HERO_PORTRAIT}
                    alt={t("黑曜石王棋矗立于风暴与碎裂棋格之上", "An obsidian king standing amid storm and shattered tiles")}
                  />
                  <video
                    className="hidden sm:block w-full h-full object-cover object-center"
                    src={HERO_VIDEO}
                    poster={HERO}
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label={t("王座殿堂动态主视觉", "Throne court motion hero")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-surface-container-low/40 pointer-events-none" />
                </div>
                <span className="cjk font-label-md text-label-md tracking-[0.25em] text-on-surface-variant mb-1">
                  {t("宗师之约", "Covenant of the Grandmaster")}
                </span>
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface tracking-wider mb-1 drop-shadow-md">
                  {t("棋盘从不说谎。", "The Board Never Lies.")}
                </h1>
                <p className="cjk font-label-sm text-label-sm text-secondary tracking-widest mb-2">
                  {t("静默布局，血中落子。", "Plan in silence. Execute in blood.")}
                </p>
              </div>
            </div>
          </section>

          {/* 仪表盘 */}
          <section className="mt-space-lg flex flex-col gap-space-sm">
            <div className="section-heading-row">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                <Bi zh="天梯征伐" en="Ranked Conquest" />
              </h2>
              <span className="font-label-sm text-label-sm text-secondary tracking-widest tabular-nums shrink-0">
                {loading ? "…" : signedIn ? t("云端结算", "Server settled") : t("本地演示", "Local demo")}
              </span>
            </div>

            <div className="home-glass-panel p-space-sm">
              <div className="flex justify-between items-center mb-space-xs gap-space-sm">
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                  {t(`距离 ${nextTier} 分`, `To ${nextTier} rating`)}
                </span>
                <span className="font-label-sm text-label-sm text-primary tracking-widest tabular-nums">
                  +{Math.max(0, nextTier - profile.elo)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container via-primary to-secondary transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1.5 text-on-surface-variant gap-space-xs">
                <span className="font-label-sm text-label-sm tabular-nums">{floor}</span>
                <span className="cjk font-label-sm text-label-sm text-secondary">
                  {t(`连胜 ${profile.streak}`, `Streak ${profile.streak}`)}
                </span>
                <span className="font-label-sm text-label-sm text-secondary tabular-nums">{nextTier}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
              {[
                { zh: "段位", en: "Tier", v: t(profile.tierZh, profile.tier) },
                { zh: "胜场", en: "Wins", v: String(profile.wins) },
                { zh: "胜率", en: "Win rate", v: `${winRate}%` },
                { zh: "训练分", en: "Training", v: profile.trainingPoints.toLocaleString() },
              ].map((s) => (
                <div key={s.en} className="home-glass-tile p-space-sm flex flex-col gap-0.5 min-w-0">
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t(s.zh, s.en)}</span>
                  <span className="font-headline-sm text-headline-sm text-secondary tabular-nums truncate">{s.v}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest truncate">
                    {t(s.en, s.zh)}
                  </span>
                </div>
              ))}
            </div>

            {!signedIn && !loading && (
              <Link
                to="/auth"
                className="home-glass-panel p-space-sm flex items-center justify-between gap-space-sm transition-colors"
              >
                <GameIcon name="auth-google" className="h-8 w-8 shrink-0" />
                <span className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed min-w-0">
                  {t("登录后段位、钻石与胜率由服务端结算，天梯对局才会计分。", "Sign in so rank, diamonds and win rate are settled server-side.")}
                </span>
                <UiIcon name="send" className="h-6 w-6" />
              </Link>
            )}

            <div className="grid grid-cols-1 gap-space-xs min-[360px]:grid-cols-3">
              {[
                { zh: "快棋", en: "Blitz", tc: "3 | 2", live: true },
                { zh: "慢棋", en: "Rapid", tc: "10 | 0", live: false },
                { zh: "超快棋", en: "Bullet", tc: "1 | 1", live: false },
              ].map((m) => (
                <Link
                  key={m.en}
                  to={m.live ? "/battle" : "/"}
                  aria-disabled={!m.live}
                  onClick={(event) => { if (!m.live) event.preventDefault(); }}
                  className={`home-glass-tile min-h-20 p-space-sm flex flex-col items-center justify-center gap-1 ${m.live ? "home-glass-tile-active" : ""}`}
                >
                  <span className={`font-label-sm text-label-sm tracking-widest ${m.live ? "text-primary" : "text-secondary"}`}>
                    {t(m.zh, m.en)}
                  </span>
                  <span className={`font-headline-md text-headline-md ${m.live ? "text-primary" : "text-on-surface"}`}>{m.tc}</span>
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant text-center leading-snug">
                    {m.live ? t("已开放", "Live") : t("即将开放", "Soon")}
                  </span>
                </Link>
              ))}
            </div>

            <Link
              to="/battle"
              className="home-glass-action w-full py-space-md text-on-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm"
            >
              <UiIcon name="shield" className="h-6 w-6" />
              <span className="font-label-lg text-label-lg tracking-[0.16em] font-semibold">
                <Bi zh="开始 AI 分级陪练" en="Start AI Training" />
              </span>
            </Link>
          </section>

          <section className="mt-space-lg flex flex-col gap-space-sm">
            <div className="section-heading-row">
              <h2 className="font-headline-sm text-headline-sm"><Bi zh="真人约战" en="Ranked Challenges" /></h2>
              <span className="font-label-sm text-label-sm text-secondary">3+2</span>
            </div>
            <Link to={signedIn ? "/battle" : "/auth"} className="home-glass-panel min-h-20 p-space-md grid grid-cols-[minmax(0,1fr)_auto] items-center gap-space-md">
              <span className="min-w-0">
                <strong className="cjk block font-label-lg text-label-lg text-on-surface">{t("系统匹配、好友点名与对战码", "Matchmaking, friends and invite codes")}</strong>
                <small className="cjk mt-1 block font-body-sm text-body-sm text-on-surface-variant">{t("完整约战操作集中在对弈页，段位相近者优先匹配。", "All challenge tools live on the duel page, with nearby ratings prioritized.")}</small>
              </span>
              <UiIcon name="send" className="h-8 w-8" />
            </Link>
          </section>

          {/* 残局试炼 */}
          <section className="mt-space-lg flex flex-col gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              <Bi zh="残局试炼" en="Endgame Crucible" />
            </h2>
            <Link
              to="/crucible"
              className="home-glass-panel p-space-md flex items-center justify-between gap-space-md transition-colors"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="cjk font-label-sm text-label-sm text-primary tracking-widest">
                  {t("盲棋心算 · 六道关卡", "Blindfold ladder · six trials")}
                </span>
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t("每关给出目标解法，解对即由服务端结算训练积分与钻石；不影响真人天梯段位。", "Each line is verified for training points and diamonds without changing ranked rating.")}
                </p>
              </div>
              <UiIcon name="lotus" className="h-8 w-8 shrink-0" />
            </Link>
          </section>

          {/* 军械库 */}
          <section className="mt-space-lg flex flex-col gap-space-sm">
            <div className="section-heading-row">
              <h2 className="font-headline-sm text-headline-sm text-on-surface"><Bi zh="军械典藏" en="Arsenal Collection" /></h2>
              <Link to="/arsenal" className="cjk min-h-11 flex items-center text-secondary font-label-sm text-label-sm">{t("查看全部 →", "View all →")}</Link>
            </div>
            <div className="grid grid-cols-2 gap-space-xs">
              {[
                { img: RELIC_A, zh: "黑曜骑士", en: "Obsidian Knight", tagZh: "已装备", tagEn: "Equipped", locked: false },
                { img: RELIC_B, zh: "猩红王后", en: "Crimson Queen", tagZh: "2500 分解锁", tagEn: "Unlock at 2500", locked: true },
              ].map((r) => (
                <div key={r.en} className="home-glass-tile p-space-sm flex flex-col">
                  <div className="home-glass-media aged-print-frame relative w-full h-36 mb-space-sm overflow-hidden">
                    <img className="w-full h-full object-cover object-center" src={r.img} alt={t(r.zh, r.en)} loading="lazy" />
                  </div>
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate">{t(r.zh, r.en)}</span>
                  <span className={`cjk font-label-sm text-label-sm mt-1 ${r.locked ? "text-primary" : "text-secondary"}`}>
                    {t(r.tagZh, r.tagEn)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <footer className="py-space-lg flex flex-col items-center text-center gap-1">
            <UiIcon name="equalizer" className="h-6 w-6" />
            <p className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em]">
              {t("今日的每一步，都在铸造明日的王座。", "Every move today shapes your throne tomorrow.")}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
