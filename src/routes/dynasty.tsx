import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { InvitePoster } from "@/components/InvitePoster";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listEndgameLevels, listLadder, loadEndgameProgress, type LadderRow } from "@/lib/game.functions";
import { useProfile } from "@/lib/profile";
import { Bi, useT } from "@/lib/i18n";
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
  const { profile, winRate, signedIn } = useProfile();

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

  return (
    <div className="themed-page text-on-surface flex flex-col min-h-screen pb-32">
      <ThemeBackdrop theme="blackGold" />
      <header className="desktop-page-header fixed top-0 w-full z-40 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-11 h-11 bg-surface-container-high flex items-center justify-center shrink-0">
              <UiIcon name="medal-laurel" className="h-9 w-9" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-sm text-label-sm text-secondary tracking-widest tabular-nums">
                  {profile.elo} ELO
                </span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className="cjk font-label-sm text-label-sm text-primary-fixed truncate">
                  {t(current.zh, current.en)}
                </span>
              </div>
              <span className="font-headline-sm text-headline-sm tracking-wider truncate">
                <Bi zh="天梯段位殿堂" en="Dynasty Sanctum" />
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <div className="hidden sm:flex items-center px-space-sm py-space-xs bg-surface-container-high">
              <UiIcon name="crystal" className="h-6 w-6" />
              <span className="font-label-md text-label-md text-secondary tracking-widest tabular-nums">
                {profile.diamonds.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="desktop-page-container mx-auto grid w-full grid-cols-1 gap-space-md px-margin-mobile pt-20 lg:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)] lg:items-start lg:gap-space-lg lg:px-space-lg lg:pt-20">
        <div className="flex w-full min-w-0 flex-col gap-space-md mt-space-md lg:mt-0">
          <InvitePoster compact />
          {/* 当前段位 */}
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-md min-w-0">
                <div className="rank-hero-mark w-20 h-20 bg-surface-container-lowest flex items-center justify-center shrink-0 shadow-lg">
                  <GameIcon name={current.art} className="h-[4.5rem] w-[4.5rem]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="cjk font-headline-sm text-headline-sm truncate">{t(current.zh, current.en)}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                    {t(current.en, current.zh)}
                  </span>
                  <span className="cjk font-label-sm text-label-sm text-secondary mt-1 truncate">
                    {profile.name} · {t("连胜", "Streak")} {profile.streak}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
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
              {t(`本赛季共 ${total} 局天梯对局。`, `${total} ranked games this season.`)}
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
            <div className="flex items-center justify-between gap-space-sm">
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
                        className={`w-9 h-9 shrink-0 flex items-center justify-center bg-gradient-to-br ${tier.accent}`}
                        aria-hidden="true"
                      >
                        <UiIcon name={tier.icon} className="h-8 w-8" />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="cjk font-label-md text-label-md truncate">{row.name}</span>
                        <span className="cjk font-label-sm text-label-sm text-on-surface-variant truncate">
                          {t(tier.zh, tier.en)} · {row.wins}
                          {t("胜", "W")} {row.losses}
                          {t("负", "L")}
                        </span>
                      </div>
                    </div>
                    <span className="font-label-md text-label-md tabular-nums text-primary shrink-0">{row.elo}</span>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>


        {/* 九重王座 + 试炼联动 */}
        <div className="flex w-full min-w-0 flex-col gap-space-md mt-space-md lg:mt-0 lg:sticky lg:top-24">
          <section className="bg-surface-container p-space-md shadow-xl flex flex-col gap-space-xs">
            <div className="flex items-center justify-between mb-space-xs">
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
