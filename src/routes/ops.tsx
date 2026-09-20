/**
 * 运营总览（仅管理员可见）。
 * 页面只做展示，统计口径与权限一律由服务端决定。
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";
import { Button } from "@/components/ui/button";
import { amIGuardAdmin, fetchOpsPlayer, fetchOpsPlayers, fetchOpsStats } from "@/data/db";
import type { OpsSegment } from "@/data/game.functions";
import { useProfile } from "@/lib/profile";
import { useT } from "@/lib/i18n";
import { useState } from "react";

export const Route = createFileRoute("/ops")({
  staticData: { sitemap: false },
  validateSearch: (search: Record<string, unknown>): { player?: string } => {
    const raw = typeof search["player"] === "string" ? search["player"] : "";
    return raw ? { player: raw.slice(0, 64) } : {};
  },
  component: OpsPage,
  head: () => ({
    meta: [
      { title: "运营总览 | 玄弈棋竞" },
      { name: "description", content: "玄弈棋竞运营总览：全站注册数、活跃人数、玩家分层与单个玩家的对战轨迹。" },
      { property: "og:title", content: "运营总览 | 玄弈棋竞" },
      { property: "og:description", content: "注册数、活跃人数、玩家分层与对战轨迹，仅管理员可见。" },
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

function formatDate(iso: string, zh: boolean): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(zh ? "zh-CN" : "en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const SEGMENTS: { id: OpsSegment; zh: string; en: string; noteZh: string; noteEn: string }[] = [
  { id: "newcomers", zh: "新注册", en: "New sign-ups", noteZh: "近 7 天建档", noteEn: "Joined in the last 7 days" },
  { id: "verified", zh: "实名认证", en: "Verified", noteZh: "已完成实名认证", noteEn: "Identity verification complete" },
  { id: "active", zh: "活跃", en: "Active", noteZh: "近 7 天有动作", noteEn: "Active in the last 7 days" },
  { id: "idle", zh: "挂机", en: "Dormant", noteZh: "超过 30 天没有动作", noteEn: "No activity for over 30 days" },
  { id: "high", zh: "高分", en: "High rated", noteZh: "1600 分及以上", noteEn: "Rated 1600 and above" },
];

const RESULT_LABEL: Record<string, [string, string]> = {
  win: ["胜", "Win"],
  loss: ["负", "Loss"],
  draw: ["和", "Draw"],
  live: ["进行中", "In progress"],
};

function OpsPage() {
  const t = useT();
  const navigate = useNavigate();
  const { signedIn } = useProfile();
  const { player: playerId } = Route.useSearch();
  const [segment, setSegment] = useState<OpsSegment>("active");
  const [q, setQ] = useState("");

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

  const playersQ = useQuery({
    queryKey: ["ops-players", segment, q],
    queryFn: () => fetchOpsPlayers({ data: { segment, q } }),
    enabled: isAdmin && !playerId,
    staleTime: 30_000,
  });

  const detailQ = useQuery({
    queryKey: ["ops-player", playerId],
    queryFn: () => fetchOpsPlayer({ data: { userId: playerId ?? "" } }),
    enabled: isAdmin && Boolean(playerId),
    staleTime: 20_000,
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

  const detail = detailQ.data;

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
        ) : playerId ? (
          <section className="home-glass-panel grid gap-space-sm p-space-md">
            <Button
              type="button"
              variant="ghost"
              onClick={() => void navigate({ to: "/ops", search: {} })}
              className="home-glass-control cjk h-11 w-fit bg-surface-container px-4 font-label-md text-label-md text-on-surface-variant"
            >
              {t("← 返回玩家名单", "← Back to player list")}
            </Button>

            {detailQ.isLoading ? (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("载入中…", "Loading…")}</p>
            ) : !detail ? (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("找不到这位玩家。", "Player not found.")}</p>
            ) : (
              <>
                <div className="grid gap-1">
                  <h2 className="cjk font-headline-sm text-headline-sm text-secondary">{detail.player.name}</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">@{detail.player.handle}</span>
                </div>
                <ul className="grid gap-2 sm:grid-cols-3">
                  {[
                    [t("积分", "Rating"), String(detail.player.elo)],
                    [t("战绩（胜/和/负）", "Record (W/D/L)"), `${detail.player.wins}/${detail.player.draws}/${detail.player.losses}`],
                    [t("注册时间", "Registered"), formatDate(detail.player.createdAt, zh)],
                    [t("最近活动", "Last activity"), formatDate(detail.player.updatedAt, zh)],
                    [
                      t("实名认证", "Verification"),
                      detail.player.verifyStatus === "verified" ? t("已认证", "Verified") : t("未认证", "Not verified"),
                    ],
                    [
                      t("定级赛剩余", "Placement games left"),
                      String(detail.player.provisionalGames),
                    ],
                  ].map(([label, value]) => (
                    <li key={label} className="home-glass-card grid gap-1 rounded-[12px] p-3">
                      <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{label}</span>
                      <span className="cjk font-label-lg text-label-lg text-on-surface tabular-nums">{value}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="cjk font-label-md text-label-md text-on-surface">{t("对战轨迹（最近 30 局）", "Match history (last 30)")}</h3>
                {detail.games.length === 0 ? (
                  <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("这位玩家还没有对战记录。", "No games played yet.")}</p>
                ) : (
                  <ul className="grid gap-1">
                    {detail.games.map((g) => (
                      <li key={g.matchId} className="home-glass-card grid gap-0.5 rounded-[12px] p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="cjk font-label-md text-label-md text-on-surface">
                            {t(g.side === "w" ? "执白" : "执黑", g.side === "w" ? "White" : "Black")} · {g.opponent} ({g.opponentElo})
                          </span>
                          <span className="cjk font-label-sm text-label-sm text-secondary">
                            {t(RESULT_LABEL[g.result]![0], RESULT_LABEL[g.result]![1])}
                            {g.delta === null ? "" : ` · ${g.delta >= 0 ? "+" : ""}${g.delta}`}
                          </span>
                        </div>
                        <span className="cjk font-body-sm text-body-sm text-on-surface-variant">
                          {formatDate(g.createdAt, zh)} · {t(`${g.plies} 手`, `${g.plies} plies`)}
                          {g.reason ? ` · ${g.reason}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
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

            <section className="home-glass-panel grid gap-2 p-space-md">
              <h2 className="cjk font-label-md text-label-md text-on-surface">{t("玩家分层", "Player segments")}</h2>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {t("点击任一分层查看名单，再点玩家查看对战轨迹。", "Pick a segment to see the roster, then pick a player for their match history.")}
              </p>
              <ul className="grid gap-2 sm:grid-cols-3">
                {SEGMENTS.map((seg) => (
                  <li key={seg.id}>
                    <button
                      type="button"
                      onClick={() => setSegment(seg.id)}
                      className={`home-glass-card grid w-full gap-1 rounded-[12px] p-3 text-left ${
                        segment === seg.id ? "bg-primary-container text-on-primary-container" : ""
                      }`}
                    >
                      <span className="cjk font-label-sm text-label-sm">{t(seg.zh, seg.en)}</span>
                      <span className="font-headline-sm text-headline-sm tabular-nums">
                        {s ? String(s.segments[seg.id as keyof typeof s.segments] ?? 0) : "—"}
                      </span>
                      <span className="cjk font-body-sm text-body-sm opacity-80">{t(seg.noteZh, seg.noteEn)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="home-glass-panel grid gap-2 p-space-md">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="cjk font-label-md text-label-md text-on-surface">
                  {t("玩家名单", "Player roster")} ·{" "}
                  {t(SEGMENTS.find((x) => x.id === segment)?.zh ?? "全部", SEGMENTS.find((x) => x.id === segment)?.en ?? "All")}
                </h2>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("搜索昵称或账号", "Search name or handle")}
                  aria-label={t("搜索玩家", "Search players")}
                  className="home-glass-control h-11 w-48 bg-surface-container px-3 font-label-md text-label-md text-on-surface"
                />
              </div>
              {playersQ.isLoading ? (
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("载入中…", "Loading…")}</p>
              ) : (playersQ.data ?? []).length === 0 ? (
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("这个分层暂时没有玩家。", "No players in this segment yet.")}</p>
              ) : (
                <ul className="grid gap-1">
                  {(playersQ.data ?? []).map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/ops"
                        search={{ player: p.id }}
                        className="home-glass-card flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-[12px] p-3"
                      >
                        <span className="cjk font-label-md text-label-md text-on-surface">
                          {p.name}
                          <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant">@{p.handle}</span>
                        </span>
                        <span className="cjk font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                          {p.elo} · {p.wins}/{p.draws}/{p.losses}
                          {p.verifyStatus === "verified" ? t(" · 已实名", " · verified") : ""}
                        </span>
                      </Link>
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
