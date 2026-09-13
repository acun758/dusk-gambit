import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { InvitePoster } from "@/components/InvitePoster";
import { useEffect, useMemo, useState } from "react";
import { AvatarPicker } from "@/components/AvatarPicker";
import { VerificationCard } from "@/components/VerificationCard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PromotionOverlay, usePromotionCeremony } from "@/components/PromotionOverlay";
import {
  createDuelInvite,
  clearRealName,
  getPromotionSeries,
  listEndgameLevels,
  listLadder,
  listPromotionRivals,
  loadEndgameProgress,
  type LadderRow,
} from "@/lib/game.functions";
import { useProfile } from "@/lib/profile";
import { Bi, LangToggle, useT } from "@/lib/i18n";
import { GameIcon } from "@/components/GameIcon";
import { UiIcon, type UiIconName } from "@/components/UiIcon";

export const Route = createFileRoute("/dynasty")({
  head: () => ({
    meta: [
      { title: "天梯段位殿堂 · 血誓王权 | Dynasty Sanctum" },
      {
        name: "description",
        content: "天梯段位殿堂：段位进度、胜率战绩、赛季奖赏，与残局试炼解锁联动。",
      },
      { property: "og:title", content: "天梯段位殿堂 · 血誓王权 | Dynasty Sanctum" },
      { property: "og:description", content: "段位进度、胜率战绩与残局试炼解锁联动。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dynasty,
});

interface LevelRow {
  id: number;
  name_zh: string;
  name_en: string;
  elo_required: number;
  elo_reward: number;
}

interface ProgressRow {
  level_id: number;
  solved: boolean;
}

const TIERS = [
  { floor: 2600, ceil: 3000, zh: "血誓君主", en: "Sovereign", icon: "crown" as UiIconName, art: "rank-sovereign" as const, accent: "from-primary/70 via-primary/20 to-transparent" },
  { floor: 2500, ceil: 2600, zh: "神圣大宗师", en: "Apex", icon: "medal-star" as UiIconName, art: "rank-apex" as const, accent: "from-secondary/60 via-secondary/15 to-transparent" },
  { floor: 2400, ceil: 2500, zh: "宗师", en: "Grandmaster", icon: "medal-laurel" as UiIconName, art: "rank-grandmaster" as const, accent: "from-secondary/45 via-secondary/10 to-transparent" },
  { floor: 2200, ceil: 2400, zh: "大师", en: "Master", icon: "badge-hex" as UiIconName, art: "rank-master" as const, accent: "from-on-surface/25 via-on-surface/8 to-transparent" },
  { floor: 0, ceil: 2200, zh: "骑士", en: "Knight", icon: "shield" as UiIconName, art: "rank-knight" as const, accent: "from-on-surface/15 via-on-surface/5 to-transparent" },
];

function tierOf(elo: number) {
  return TIERS.find((x) => elo >= x.floor) ?? TIERS[TIERS.length - 1]!;
}

function Dynasty() {
  const t = useT();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, winRate, signedIn, setAvatar, setAvatarImage, verifyIdentity } = useProfile();
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const levelsQ = useQuery({
    queryKey: ["endgame-levels"],
    queryFn: () => listEndgameLevels() as Promise<LevelRow[]>,
  });
  const progressQ = useQuery({
    queryKey: ["endgame-progress", signedIn],
    queryFn: () => (signedIn ? (loadEndgameProgress() as Promise<ProgressRow[]>) : Promise.resolve([])),
  });
  const ladderQ = useQuery({
    queryKey: ["ladder-board"],
    queryFn: () => listLadder() as Promise<LadderRow[]>,
    refetchInterval: 30_000,
  });
  const seriesQ = useQuery({
    queryKey: ["promotion-series", signedIn],
    queryFn: () => (signedIn ? getPromotionSeries() : Promise.resolve(null)),
    refetchInterval: 20_000,
  });
  const rivalsQ = useQuery({
    queryKey: ["promotion-rivals"],
    queryFn: () => listPromotionRivals(),
    refetchInterval: 30_000,
  });

  // 段位榜实时刷新：任何玩家积分写入数据库后，榜单与晋升赛进度立即更新
  useEffect(() => {
    const channel = supabase
      .channel(`ladder-live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["ladder-board"] });
        void queryClient.invalidateQueries({ queryKey: ["promotion-rivals"] });
        void queryClient.invalidateQueries({ queryKey: ["promotion-series"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const levels = levelsQ.data ?? [];
  const solvedIds = useMemo(
    () => new Set((progressQ.data ?? []).filter((p) => p.solved).map((p) => p.level_id)),
    [progressQ.data],
  );
  const solvedCount = levels.filter((l) => solvedIds.has(l.id)).length;

  const current = tierOf(profile.elo);
  const nextTier = TIERS[TIERS.indexOf(current) - 1] ?? null;
  const pct = Math.max(4, Math.min(100, ((profile.elo - current.floor) / (current.ceil - current.floor)) * 100));
  const total = profile.wins + profile.losses + profile.draws;
  const ladder = ladderQ.data ?? [];
  const myRank = ladder.findIndex((row) => row.name === profile.name && row.elo === profile.elo) + 1;

  const series = seriesQ.data?.active ?? null;
  const lastSeries = seriesQ.data?.last ?? null;
  const rivals = (rivalsQ.data ?? []).filter((r) => Math.abs(r.elo - profile.elo) <= 120);

  const ceremony = usePromotionCeremony(
    { key: current.en, zh: current.zh, en: current.en, art: current.art, floor: current.floor },
    signedIn,
  );

  const challenge = (rivalId: string) => {
    void createDuelInvite({ data: { invitedId: rivalId } }).then(() => navigate({ to: "/battle" }));
  };

  const signOut = async () => {
    await clearRealName().catch(() => null);
    await queryClient.cancelQueries();
    queryClient.clear();
    for (const k of ["bs.profile.v1", "bs.tier.v1", "bs.realname.v1"]) {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* storage unavailable */
      }
    }
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };



  return (

    <div className="themed-page text-on-surface flex flex-col min-h-screen pb-32">
      <ThemeBackdrop theme="blackGold" />
      <PromotionOverlay event={ceremony.event} onDismiss={ceremony.dismiss} />
      <header className="desktop-page-header fixed top-0 w-full z-40 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
              <GameIcon name="nav-ladder" className="h-14 w-14 sm:h-16 sm:w-16 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-md text-label-md text-secondary tabular-nums">
                  {profile.elo} ELO
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="cjk font-label-md text-label-md text-primary-fixed truncate">
                  {t(current.zh, current.en)}
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md leading-tight truncate">
                <Bi zh="天梯段位殿堂" en="Dynasty Sanctum" />
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <LangToggle />

            <div className="hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high">
              <UiIcon name="crystal" className="h-6 w-6" />
              <span className="font-label-md text-label-md text-secondary tracking-widest tabular-nums">
                {profile.diamonds.toLocaleString()}
              </span>
            </div>
            {signedIn && (
              <button
                onClick={() => void signOut()}
                className="cjk min-h-11 px-3 bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant hover:text-secondary"
              >
                {t("退出登录", "Sign out")}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="page-main-dashboard desktop-page-container mx-auto grid w-full grid-cols-1 gap-space-md px-margin-mobile lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)] lg:items-start lg:gap-space-lg lg:px-space-lg">
        <div className="flex w-full min-w-0 flex-col gap-space-md">
          <InvitePoster compact />
          {/* 当前段位 */}
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-space-md">
              <div className="flex items-center gap-space-md min-w-0">
                 <div className="rank-hero-mark w-24 h-24 sm:w-28 sm:h-28 p-0 shrink-0">
                  <GameIcon name={current.art} className="h-full w-full" />
                </div>
                <div className="flex flex-col min-w-0">
                   <span className="cjk font-headline-md text-headline-md truncate">{t(current.zh, current.en)}</span>
                   <span className="font-label-md text-label-md text-on-surface-variant">
                    {t(current.en, current.zh)}
                  </span>
                   <span className="cjk font-label-md text-label-md text-secondary mt-1 truncate">
                    {profile.name} · {t("连胜", "Streak")} {profile.streak}
                  </span>
                </div>
              </div>
               <div className="hidden text-right shrink-0 sm:block">
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant block tracking-widest">
                  {t("下一段位", "Next tier")}
                </span>
                <span className="cjk font-label-md text-label-md text-primary font-bold">
                  {nextTier
                    ? t(`还差 ${Math.max(0, current.ceil - profile.elo)} 分 → ${nextTier.zh}`, `${Math.max(0, current.ceil - profile.elo)} to ${nextTier.en}`)
                    : t("已达巅峰", "Peak reached")}
                </span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-sm shadow-inner">
              <div className="flex justify-between items-center mb-1">
                <span className="cjk font-label-sm text-label-sm text-on-surface-variant">
                  {t(current.zh, current.en)}
                </span>
                <span className="font-label-sm text-label-sm text-primary tabular-nums">
                  {profile.elo} / {current.ceil}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container via-primary to-secondary shadow-[0_0_10px_rgba(233,195,73,0.5)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {!signedIn && (
              <Link to="/auth" className="cjk min-h-11 px-3 bg-surface-container-high font-body-sm text-body-sm text-secondary flex items-center gap-2">
                <GameIcon name="auth-google" className="h-7 w-7 shrink-0" />
                {t("当前为本地演示数据，登录后段位与钻石由服务端结算 →", "Demo data — sign in for server-settled rating →")}
              </Link>
            )}
          </section>

          {/* 个人资料：头像与实名认证 */}
          {signedIn && (
            <>
              <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
                <div className="section-heading-row">
                  <h2 className="font-headline-sm text-headline-sm tracking-wider">
                    <Bi zh="个人资料" en="Profile" />
                  </h2>
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{profile.name}</span>
                </div>
                <div className="flex items-center gap-space-md">
                  <PlayerAvatar className="h-16 w-16" avatarKey={profile.avatarKey} avatarPath={profile.avatarPath} seed={profile.name} label={profile.name} />
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                    {t("换头像后，对弈页的玩家条与段位榜会实时更新。", "Changing your avatar updates the duel player bar and ladder instantly.")}
                  </p>
                </div>
                <AvatarPicker
                  value={profile.avatarPath ? "upload" : profile.avatarKey}
                  uploadedPath={profile.avatarPath || null}
                  uploading={avatarBusy}
                  error={avatarError}
                  onSelect={(key) => {
                    if (key === "upload") return;
                    setAvatarError(null);
                    void setAvatar(key).catch((e: unknown) => setAvatarError(e instanceof Error ? e.message : "更换头像失败"));
                  }}
                  onUpload={async (file) => {
                    setAvatarBusy(true);
                    setAvatarError(null);
                    try {
                      await setAvatarImage(file);
                    } catch (e) {
                      setAvatarError(e instanceof Error ? e.message : "头像上传失败");
                    }
                    setAvatarBusy(false);
                  }}
                />
              </section>
              <VerificationCard profile={profile} onVerify={verifyIdentity} />
            </>
          )}

          {/* 晋升挑战赛 */}
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
            <div className="section-heading-row">
              <h2 className="font-headline-sm text-headline-sm tracking-wider">
                <Bi zh="段位晋升挑战赛" en="Promotion Series" />
              </h2>
              <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest shrink-0">
                {t("三局两胜", "Best of three")}
              </span>
            </div>

            {series ? (
              <div className="bg-surface-container-lowest p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between gap-space-sm">
                  <span className="cjk font-label-md text-label-md text-primary truncate">
                    {t(`冲击 ${series.toFloor}+ 段位`, `Pushing for ${series.toFloor}+`)}
                  </span>
                  <span className="font-label-md text-label-md text-secondary tabular-nums shrink-0">
                    {series.wins} / {series.requiredWins}
                  </span>
                </div>
                <div className="flex gap-space-xs" aria-hidden="true">
                  {Array.from({ length: series.requiredWins + series.maxLosses - 1 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 flex-1 ${
                        i < series.wins ? "bg-secondary" : i < series.wins + series.losses ? "bg-primary/70" : "bg-surface-container-high"
                      }`}
                    />
                  ))}
                </div>
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t(
                    `已胜 ${series.wins} 场、负 ${series.losses} 场。再胜 ${Math.max(0, series.requiredWins - series.wins)} 场正式晋升；若累计 ${series.maxLosses} 负，积分回落 30 分重回原段位。`,
                    `${series.wins}W ${series.losses}L. ${Math.max(0, series.requiredWins - series.wins)} more win(s) to promote; ${series.maxLosses} losses drop you 30 points.`,
                  )}
                </p>
              </div>
            ) : (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {lastSeries
                  ? t(
                      lastSeries.status === "won"
                        ? `上次晋升挑战赛告捷，已进入 ${lastSeries.toFloor}+ 段位。`
                        : `上次冲击 ${lastSeries.toFloor}+ 未成功，积分达到门槛会自动重开挑战赛。`,
                      lastSeries.status === "won" ? `Last series won at ${lastSeries.toFloor}+.` : `Last series lost; it reopens at ${lastSeries.toFloor}.`,
                    )
                  : t(
                      `积分达到 ${nextTier ? nextTier.floor : current.floor} 时自动开启晋升挑战赛，与段位相近者争夺晋升资格。`,
                      `Reach ${nextTier ? nextTier.floor : current.floor} to trigger a promotion series against nearby rivals.`,
                    )}
              </p>
            )}

            <div className="grid gap-space-xs">
              <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                {t("正在争夺晋升资格的相近段位对手", "Rivals currently in a promotion series")}
              </span>
              {rivals.length === 0 && (
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                  {t("当前没有段位相近的晋升挑战者。", "No nearby challengers right now.")}
                </p>
              )}
              {rivals.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm">
                  <div className="flex flex-col min-w-0">
                    <span className="cjk font-label-md text-label-md truncate">{r.name}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                      {r.elo} ELO · {t(`冲击 ${r.toFloor}+`, `to ${r.toFloor}+`)} · {r.wins}W {r.losses}L
                    </span>
                  </div>
                  <button
                    onClick={() => challenge(r.id)}
                    disabled={!signedIn}
                    className="cjk min-h-11 px-3 bg-primary-container text-on-primary-container font-label-sm text-label-sm shrink-0 disabled:opacity-50"
                  >
                    {t("发起挑战", "Challenge")}
                  </button>
                </div>
              ))}
            </div>

            <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {t(
                "积分规则：2200 分以下每局 ±32，2200–2500 为 ±24，2500 以上为 ±16；连胜额外加分最多 +6；失利有保级缓冲，一局最多掉到段位门槛下 25 分。",
                "Rating: ±32 below 2200, ±24 to 2500, ±16 above; up to +6 streak bonus; a loss never drops you more than 25 below your tier floor.",
              )}
            </p>
          </section>

          {/* 战绩 */}
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm tracking-wider">
              <Bi zh="赛季战绩" en="Season Record" />
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
              {[
                { zh: "胜场", en: "Wins", v: String(profile.wins) },
                { zh: "负场", en: "Losses", v: String(profile.losses) },
                { zh: "和棋", en: "Draws", v: String(profile.draws) },
                { zh: "胜率", en: "Win rate", v: `${winRate}%` },
              ].map((s) => (
                <div key={s.en} className="bg-surface-container-lowest p-space-sm flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-secondary tabular-nums">{s.v}</span>
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                    {t(s.zh, s.en)}
                  </span>
                </div>
              ))}
            </div>
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
              {total === 0
                ? t(
                    "还没有真人天梯对局，胜率与段位会在第一局结算后开始变化。",
                    "No ranked games yet — your win rate and tier start moving after your first result.",
                  )
                : t(
                    `本赛季共 ${total} 局天梯对局，真实胜率 ${winRate}%，当前连胜 ${profile.streak}。`,
                    `${total} ranked games this season · ${winRate}% real win rate · ${profile.streak} win streak.`,
                  )}
            </p>
            <Link
              to="/battle"
              className="w-full py-space-md bg-primary-container text-on-primary-container flex items-center justify-center gap-space-sm active:scale-[0.99] transition-transform"
            >
              <UiIcon name="shield" className="h-6 w-6" />
              <span className="font-label-lg text-label-lg tracking-[0.16em] font-semibold">
                <Bi zh="进入 3+2 天梯对局" en="Enter 3+2 Ranked" />
              </span>
            </Link>
          </section>

          {/* 段位榜 */}
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
            <div className="section-heading-row">
              <h2 className="font-headline-sm text-headline-sm tracking-wider">
                <Bi zh="段位榜" en="Leaderboard" />
              </h2>
              <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest shrink-0">
                {myRank > 0 ? t(`我的名次 #${myRank}`, `Rank #${myRank}`) : t("按积分排序", "By rating")}
              </span>
            </div>
            {ladderQ.isLoading && (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("正在读取天梯排名…", "Loading ladder…")}</p>
            )}
            {!ladderQ.isLoading && ladder.length === 0 && (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {t("还没有天梯战绩，完成一局真人对局即可上榜。", "No ranked results yet.")}
              </p>
            )}
            <ol className="grid gap-space-xs">
              {ladder.slice(0, 20).map((row, i) => {
                const tier = tierOf(row.elo);
                const mine = myRank === i + 1;
                return (
                  <li
                    key={row.id}
                    className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-space-sm p-space-sm ${
                      mine ? "bg-surface-container-high gold-hairline" : "bg-surface-container-lowest"
                    }`}
                  >
                    <span className="font-label-md text-label-md tabular-nums text-secondary">{i + 1}</span>
                    <div className="flex items-center gap-space-sm min-w-0">
                      <span
                        className={`w-11 h-11 shrink-0 flex items-center justify-center bg-gradient-to-br ${tier.accent}`}
                        aria-hidden="true"
                      >
                        <UiIcon name={tier.icon} className="h-10 w-10" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="cjk font-label-lg text-label-lg truncate">{row.name}</span>
                        <span className="cjk font-label-md text-label-md text-on-surface-variant truncate">
                          {t(tier.zh, tier.en)} · {row.wins}
                          {t("胜", "W")} {row.losses}
                          {t("负", "L")}
                        </span>
                      </div>
                    </div>
                    <span className="font-label-lg text-label-lg tabular-nums text-primary shrink-0">{row.elo}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>


        {/* 九重王座 + 试炼联动 */}
        <div className="flex w-full min-w-0 flex-col gap-space-md mt-space-md lg:mt-0 lg:sticky lg:top-24">
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-xs">
             <div className="section-heading-row mb-space-xs">
              <h2 className="font-headline-sm text-headline-sm tracking-wider">
                <Bi zh="天梯王座" en="Ladder" />
              </h2>
              <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                {t("按等级分解锁", "By rating")}
              </span>
            </div>
            {TIERS.map((tier) => {
              const active = tier === current;
              const unlocked = profile.elo >= tier.floor;
              return (
                <div
                  key={tier.en}
                  className={`p-space-sm flex items-center justify-between gap-space-sm ${
                    active ? "bg-surface-container-high gold-hairline" : "bg-surface-container-lowest"
                  }`}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span
                      className={`w-10 h-10 shrink-0 flex items-center justify-center bg-gradient-to-br ${tier.accent} ${
                        active ? "gold-hairline" : ""
                      } ${unlocked ? "" : "opacity-50"}`}
                      aria-hidden="true"
                    >
                      {unlocked ? <UiIcon name={tier.icon} className="h-9 w-9" /> : <UiIcon name="seal" className="h-6 w-6" />}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="cjk font-label-md text-label-md truncate">{t(tier.zh, tier.en)}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                        {tier.floor}+ ELO
                      </span>
                    </div>
                  </div>
                  <span className="cjk font-label-sm text-label-sm text-secondary shrink-0">
                    {active ? t("当前", "Active") : unlocked ? t("已达成", "Cleared") : t("未解锁", "Locked")}
                  </span>
                </div>
              );
            })}
          </section>

          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
            <h2 className="font-headline-sm text-headline-sm tracking-wider whitespace-nowrap">
              <Bi zh="残局试炼联动" en="Crucible Link" />
            </h2>
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {t(
                `已通关 ${solvedCount} / ${levels.length} 道残局，当前训练积分 ${profile.trainingPoints}。训练不会改变真人天梯段位。`,
                `${solvedCount} / ${levels.length} trials solved with ${profile.trainingPoints} training points. Training does not change ranked rating.`,
              )}
            </p>
            <div className="grid gap-space-xs">
              {levels.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm">
                  <span className="cjk font-label-sm text-label-sm truncate">{t(l.name_zh, l.name_en)}</span>
                  <span className="font-label-sm text-label-sm text-secondary shrink-0 tabular-nums">
                    {solvedIds.has(l.id) ? t("已通关", "Solved") : `${l.elo_required}+`}
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/crucible"
              className="w-full py-space-sm bg-surface-container-high text-on-surface flex items-center justify-center gap-space-xs"
            >
              <UiIcon name="lotus" className="h-6 w-6" />
              <span className="cjk font-label-md text-label-md">{t("前往盲棋试炼", "Go to trials")}</span>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
