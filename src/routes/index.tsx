import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/lib/profile";
import { Bi, useT } from "@/lib/i18n";
import { createDuelInvite, joinDuelInvite, loadFriends, requestFriend, respondFriend, searchPlayers } from "@/lib/game.functions";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const HERO_PORTRAIT = "/__l5e/assets-v1/b46d2699-3ed1-4e73-9f50-dbd0a0e15bfa/hero-throne-portrait.jpg";
const HERO_VIDEO = "/__l5e/assets-v1/40baeb23-6571-4126-9a46-60eed2c3debd/hero_bg_muted.mp4";
const EMBLEM = "/__l5e/assets-v1/17f42ccd-32f8-4890-956c-98f906504b7a/logo-emblem.png";
const HERO =
  "/__l5e/assets-v1/936655a1-a5fa-43b9-9916-f88a933b250b/hero-throne.jpg";
const RELIC_A =
  "/__l5e/assets-v1/512864e6-ef6d-48cb-92db-9ce4af25bb06/match-arena.jpg";
const RELIC_B =
  "/__l5e/assets-v1/96567e8b-b65b-4651-af12-7edcd6ee63b0/review-board.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "王座殿堂 · 血誓王权 | Blood Sovereign Court" },
      {
        name: "description",
        content: "王座殿堂：天梯段位、3+2 快棋对弈、残局试炼与圣物军械库。Ranked chess conquest, blitz duels and endgame trials.",
      },
      { property: "og:title", content: "王座殿堂 · 血誓王权 | Blood Sovereign Court" },
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string; handle: string; elo: number }>>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [notice, setNotice] = useState("");
  const friendsQ = useQuery({ queryKey: ["friends", signedIn], queryFn: () => signedIn ? loadFriends() : Promise.resolve([]) });

  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)] lg:left-56 lg:w-[calc(100%-14rem)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-11 h-11 bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
              <img src={EMBLEM} alt={t("血誓王权徽章", "Blood Sovereign emblem")} className="w-full h-full object-contain" width={44} height={44} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest tabular-nums">
                  {profile.elo} ELO
                </span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="cjk font-label-sm text-label-sm text-primary-fixed truncate">
                  {t(profile.tierZh, profile.tier)}
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-wider truncate">
                <Bi zh="王座殿堂" en="Throne Court" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <div className="hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high">
              <span className="material-symbols-outlined text-secondary text-[16px] mr-space-xs">diamond</span>
              <span className="font-label-md text-label-md text-secondary tracking-widest tabular-nums">
                {profile.diamonds.toLocaleString()}
              </span>
            </div>
            <Link
              to="/auth"
              className="h-9 px-3 bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-widest flex items-center"
            >
              {signedIn ? t("已登录", "Signed in") : t("登录", "Sign in")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-col relative w-full pt-20 bg-surface min-h-screen">
        <div className="flex flex-col w-full pb-32 px-margin-mobile">
          {/* 誓约横幅 */}
          <section className="relative w-full mt-space-md bg-surface-container-lowest p-space-xs shadow-[0_20px_48px_rgba(0,0,0,0.95)]">
            <div className="relative w-full bg-surface-container-low p-space-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary-container/20 via-surface-container-lowest/60 to-surface-container-lowest pointer-events-none" />
              <div className="flex items-center justify-between gap-space-sm relative z-10">
                <div className="flex items-center gap-space-xs min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[16px]">diamond</span>
                  <span className="font-label-md text-label-md text-on-surface tracking-widest truncate">{profile.name}</span>
                </div>
                <div className="flex items-center gap-space-xs px-space-sm py-0.5 bg-surface-container-highest shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <span className="cjk font-label-sm text-label-sm text-secondary tracking-widest whitespace-nowrap">
                    {t("君主敕令", "The Sovereign's Decree")}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center text-center mt-space-md mb-space-sm">
                <div className="relative w-full h-56 lg:h-72 overflow-hidden bg-surface-container-lowest mb-space-md shadow-2xl">
                  <img
                    className="w-full h-full object-cover object-center sm:hidden"
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
            <div className="flex items-center justify-between gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                <Bi zh="天梯征伐" en="Ranked Conquest" />
              </h2>
              <span className="font-label-sm text-label-sm text-secondary tracking-widest tabular-nums shrink-0">
                {loading ? "…" : signedIn ? t("云端结算", "Server settled") : t("本地演示", "Local demo")}
              </span>
            </div>

            <div className="bg-surface-container-low p-space-sm">
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
                <div key={s.en} className="bg-surface-container-low p-space-sm flex flex-col gap-0.5 gold-hairline min-w-0">
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
                className="bg-surface-container p-space-sm flex items-center justify-between gap-space-sm hover:bg-surface-container-high transition-colors"
              >
                <span className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed min-w-0">
                  {t("登录后段位、钻石与胜率由服务端结算，天梯对局才会计分。", "Sign in so rank, diamonds and win rate are settled server-side.")}
                </span>
                <span className="material-symbols-outlined text-secondary text-[18px] shrink-0">arrow_forward</span>
              </Link>
            )}

            <div className="grid grid-cols-1 gap-space-xs min-[360px]:grid-cols-3">
              {[
                { zh: "快棋", en: "Blitz", tc: "3 | 2", live: true },
                { zh: "慢棋", en: "Rapid", tc: "10 | 0", live: false },
                { zh: "超快棋", en: "Bullet", tc: "1 | 1", live: false },
              ].map((m) => (
                <div
                  key={m.en}
                  className={`min-h-20 p-space-sm flex flex-col items-center justify-center gap-1 ${m.live ? "bg-surface-container-high" : "bg-surface-container"}`}
                >
                  <span className={`font-label-sm text-label-sm tracking-widest ${m.live ? "text-primary" : "text-secondary"}`}>
                    {t(m.zh, m.en)}
                  </span>
                  <span className={`font-headline-md text-headline-md ${m.live ? "text-primary" : "text-on-surface"}`}>{m.tc}</span>
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant text-center leading-snug">
                    {m.live ? t("已开放", "Live") : t("即将开放", "Soon")}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/battle"
              className="w-full py-space-md bg-primary-container hover:bg-inverse-primary text-on-primary-container active:scale-[0.99] transition-all flex items-center justify-center gap-space-sm shadow-[0_8px_24px_rgba(139,30,30,0.45)]"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary">swords</span>
              <span className="font-label-lg text-label-lg tracking-[0.16em] font-semibold">
                <Bi zh="进入 3+2 天梯对弈" en="Enter 3+2 Ranked Duel" />
              </span>
            </Link>
          </section>

          <section className="mt-space-lg flex flex-col gap-space-sm">
            <div className="flex items-center justify-between"><h2 className="font-headline-sm text-headline-sm"><Bi zh="好友与点名对战" en="Friends & Challenges" /></h2><span className="font-label-sm text-label-sm text-secondary">3+2</span></div>
            {!signedIn ? (
              <Link to="/auth" className="h-12 bg-surface-container-high text-secondary flex items-center justify-center cjk font-label-md text-label-md">登录后搜索好友并创建对战码</Link>
            ) : (
              <div className="grid lg:grid-cols-2 gap-space-sm">
                <div className="bg-surface-container-low p-space-sm flex flex-col gap-space-xs">
                  <div className="flex gap-space-xs"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="输入玩家名或账号" className="h-11 min-w-0 flex-1 bg-surface-container-highest px-3 outline-none focus:ring-1 focus:ring-secondary"/><button onClick={() => void searchPlayers({ data: { query } }).then((r) => setResults(r as typeof results)).catch(() => setNotice("没有找到该玩家"))} className="h-11 px-4 bg-secondary text-on-secondary cjk font-label-sm text-label-sm">搜索</button></div>
                  {results.map((r) => <div key={r.id} className="min-h-12 px-2 bg-surface-container flex items-center justify-between gap-2"><span className="min-w-0"><strong className="block truncate">{r.name}</strong><small className="text-on-surface-variant">@{r.handle} · {r.elo} ELO</small></span><button onClick={() => void requestFriend({ data: { userId: r.id } }).then(() => { setNotice("好友请求已发送"); void friendsQ.refetch(); })} className="h-10 px-3 text-secondary">加好友</button></div>)}
                </div>
                <div className="bg-surface-container-low p-space-sm flex flex-col gap-space-xs">
                  <div className="grid grid-cols-2 gap-space-xs"><button onClick={() => void createDuelInvite({ data: {} }).then((r) => setCreatedCode(r?.code ?? ""))} className="h-11 bg-primary-container text-on-primary-container cjk font-label-sm text-label-sm">创建对战码</button><div className="flex"><input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="输入对战码" className="h-11 min-w-0 flex-1 bg-surface-container-highest px-2 uppercase"/><button onClick={() => void joinDuelInvite({ data: { code: inviteCode } }).then(() => { setNotice("已加入对局"); window.location.assign("/battle"); }).catch(() => setNotice("对战码无效或已过期"))} className="h-11 px-3 bg-secondary text-on-secondary">加入</button></div></div>
                  {createdCode && <p className="cjk font-body-sm text-body-sm text-secondary">对战码：<strong className="tracking-widest">{createdCode}</strong> · 10 分钟内有效</p>}
                  {(friendsQ.data ?? []).map((f) => <div key={f.friendshipId} className="min-h-12 px-2 bg-surface-container flex items-center justify-between gap-2"><span className="min-w-0"><strong className="block truncate">{f.name}</strong><small className="text-on-surface-variant">{f.elo} ELO · ♦ {f.diamonds} · {f.wins}胜</small></span>{f.friendshipStatus === "pending" && f.incoming ? <button onClick={() => void respondFriend({ data: { friendshipId: f.friendshipId, accept: true } }).then(() => friendsQ.refetch())} className="h-10 px-3 text-secondary">接受</button> : f.friendshipStatus === "accepted" ? <button onClick={() => void createDuelInvite({ data: { invitedId: f.id } }).then((r) => setCreatedCode(r?.code ?? ""))} className="h-10 px-3 text-primary">挑战</button> : <span className="text-on-surface-variant text-xs">待回应</span>}</div>)}
                  {notice && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{notice}</p>}
                </div>
              </div>
            )}
          </section>

          {/* 残局试炼 */}
          <section className="mt-space-lg flex flex-col gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              <Bi zh="残局试炼" en="Endgame Crucible" />
            </h2>
            <Link
              to="/crucible"
              className="bg-surface-container p-space-md flex items-center justify-between gap-space-md hover:bg-surface-container-high transition-colors"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="cjk font-label-sm text-label-sm text-primary tracking-widest">
                  {t("盲棋心算 · 六道关卡", "Blindfold ladder · six trials")}
                </span>
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t("每关给出目标解法，解对即由服务端结算积分与钻石，并解锁下一段位关卡。", "Each trial states its target line; the server verifies it, awards rating and unlocks the next tier.")}
                </p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[22px] shrink-0">psychology</span>
            </Link>
          </section>

          {/* 军械库 */}
          <section className="mt-space-lg flex flex-col gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              <Bi zh="圣物军械库" en="Vault & Armory" />
            </h2>
            <div className="grid grid-cols-2 gap-space-xs">
              {[
                { img: RELIC_A, zh: "黑曜骑士", en: "Obsidian Knight", tagZh: "已装备", tagEn: "Equipped", locked: false },
                { img: RELIC_B, zh: "猩红王后", en: "Crimson Queen", tagZh: "2500 分解锁", tagEn: "Unlock at 2500", locked: true },
              ].map((r) => (
                <div key={r.en} className="bg-surface-container p-space-sm flex flex-col">
                  <div className="relative w-full h-36 bg-surface-container-lowest mb-space-sm overflow-hidden">
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
            <span className="material-symbols-outlined text-secondary/40 text-[20px]">balance</span>
            <p className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-[0.2em]">
              {t("今日的每一步，都在铸造明日的王座。", "Every move today shapes your throne tomorrow.")}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
