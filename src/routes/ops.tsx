/**
 * 运营总览（仅管理员可见）。
 * 页面只做展示，统计口径与权限一律由服务端决定。
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { amIGuardAdmin, fetchOpsStats } from "@/data/db";
import { useProfile } from "@/lib/profile";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/ops")({
  staticData: { sitemap: false },
  component: OpsPage,
  head: () => ({
    meta: [
      { title: "运营总览 | 玄弈棋竞" },
      { name: "description", content: "玄弈棋竞运营总览：全站注册数、活跃人数、对战次数与平均对局时长。" },
      { property: "og:title", content: "运营总览 | 玄弈棋竞" },
      { property: "og:description", content: "全站注册数、活跃人数、对战次数与平均对局时长，仅管理员可见。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function formatDuration(sec: number, zh: boolean): string {
  if (sec <= 0) return zh ? "暂无数据" : "No data";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return zh ? `${m} 分 ${s} 秒` : `${m}m ${s}s`;
}

function OpsPage() {
  const t = useT();
  const { signedIn } = useProfile();

  const adminQ = useQuery({
    queryKey: ["guard-admin"],
    queryFn: () => amIGuardAdmin(),
    enabled: signedIn,
    staleTime: 300_000,
  });
  const isAdmin = adminQ.data === true;

  const statsQ = useQuery({
    queryKey: ["ops-stats"],
    queryFn: () => fetchOpsStats(),
    enabled: isAdmin,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const s = statsQ.data;
  const zh = t("zh", "en") === "zh";

  const cards: Array<{ zh: string; en: string; value: string; note?: [string, string] }> = s
    ? [
        {
          zh: "注册账号",
          en: "Registered players",
          value: String(s.players),
          note: ["含所有已建档案的账号", "All accounts with a profile"],
        },
        {
          zh: "活跃玩家（24 小时）",
          en: "Active players (24h)",
          value: String(s.activeDay),
          note: [`近 7 天 ${s.activeWeek} 人`, `${s.activeWeek} in the last 7 days`],
        },
        {
          zh: "对战总数",
          en: "Games played",
          value: String(s.matches),
          note: [`今日 ${s.matchesDay} 局 · 本周 ${s.matchesWeek} 局`, `${s.matchesDay} today · ${s.matchesWeek} this week`],
        },
        {
          zh: "平均对局时长",
          en: "Average game length",
          value: formatDuration(s.avgDurationSec, zh),
          note: [`平均 ${s.avgPlies} 手（近 300 局已结束对局）`, `${s.avgPlies} plies on average (last 300 finished games)`],
        },
        {
          zh: "正在进行",
          en: "Live now",
          value: String(s.liveNow),
          note: ["此刻仍在进行的联网对局", "Online games in progress right now"],
        },
      ]
    : [];

  return (
    <div className="relative min-h-dvh">
      <ThemeBackdrop theme="blackGold" />
      <SovereignPageHeader icon="nav-ladder" titleZh="运营总览" titleEn="Operations" backTo="/" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm">
        {!signedIn ? (
          <div className="home-glass-panel grid gap-2 p-space-md">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("登录后才能查看运营总览。", "Sign in to open the operations overview.")}
            </p>
            <Link
              to="/auth"
              className="home-glass-control cjk flex h-11 w-fit items-center bg-primary-container px-4 font-label-md text-label-md text-on-primary-container"
            >
              {t("去登录", "Sign in")}
            </Link>
          </div>
        ) : adminQ.isLoading ? (
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("校验权限中…", "Checking access…")}</p>
        ) : !isAdmin ? (
          <div className="home-glass-panel p-space-md">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("此页仅对管理员开放。", "This page is for administrators only.")}
            </p>
          </div>
        ) : (
          <>
            <section className="home-glass-panel grid gap-2 p-space-md">
              <h2 className="cjk font-label-md text-label-md text-on-surface">{t("全站数据", "Platform overview")}</h2>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {t("数据每分钟自动刷新，统计口径全部由服务端计算。", "Figures refresh every minute and are calculated entirely on the server.")}
              </p>
              {statsQ.isLoading ? (
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("载入中…", "Loading…")}</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {cards.map((c) => (
                    <li key={c.en} className="home-glass-card grid gap-1 rounded-[12px] p-3">
                      <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t(c.zh, c.en)}</span>
                      <span className="font-display-sm text-display-sm text-on-surface tabular-nums">{c.value}</span>
                      {c.note ? (
                        <span className="cjk font-body-sm text-body-sm text-on-surface-variant">{t(c.note[0], c.note[1])}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Link
              to="/guard"
              className="home-glass-control cjk flex h-11 w-fit items-center bg-primary-container px-4 font-label-md text-label-md text-on-primary-container"
            >
              {t("打开风控监看", "Open fair play watch")}
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
