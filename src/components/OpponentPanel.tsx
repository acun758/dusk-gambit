import { memo, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UiIcon } from "@/components/UiIcon";
import {
  createDuelInvite,
  fetchDuelInvites as listDuelInvites,
  fetchFriends as loadFriends,
  fetchLobbyStats as getLobbyStats,
  fetchProfile as loadProfile,
  fetchSession,
  joinDuelInvite,
  searchPlayers,
} from "@/data/db";
import lobbyBanner from "@/assets/lobby-banner.jpg";
import { useLang, useT } from "@/lib/i18n";
import { DEFAULT_TIME_CONTROL, TIME_CONTROLS, timeControl, type TimeControlId } from "@/lib/time-controls";

function mmss(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

type Tab = "auto" | "invite" | "lobby";

/**
 * 对弈页的「找对手」面板：系统匹配、点名邀请（好友 / 搜索 / 对战码）、
 * 以及别人发出的约战大厅，10 秒轮询刷新。
 */
function OpponentPanelComponent({
  onStartRanked,
  ranked,
  waiting,
}: {
  onStartRanked: (tc?: TimeControlId) => void;
  ranked: boolean;
  waiting: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const [tcId, setTcId] = useState<TimeControlId>(DEFAULT_TIME_CONTROL);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("auto");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; handle: string; elo: number }[]>([]);
  const [code, setCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void fetchSession().then((s) => setSignedIn(Boolean(s)));
  }, []);


  // 从登录页跳转过来（/battle?lobby=1）：只切到「系统匹配」分页，排队必须玩家显式点击「开始匹配」
  const [autoQueued, setAutoQueued] = useState(false);
  useEffect(() => {
    if (autoQueued || signedIn !== true) return;
    if (!new URLSearchParams(window.location.search).has("lobby")) return;
    setAutoQueued(true);
    setTab("auto");
    setNotice(t("选好赛制后点「开始匹配」进入真人对局。", "Pick a time control and tap Find match to play a real opponent."));
  }, [autoQueued, signedIn]);

  const invitesQ = useQuery({
    queryKey: ["duel-invites", signedIn],
    queryFn: () => (signedIn ? listDuelInvites() : Promise.resolve(null)),
    refetchInterval: 10_000,
    enabled: signedIn === true,
  });
  const friendsQ = useQuery({
    queryKey: ["friends-battle", signedIn],
    queryFn: () => (signedIn ? loadFriends() : Promise.resolve([])),
    enabled: signedIn === true,
  });
  const statsQ = useQuery({
    queryKey: ["lobby-stats"],
    queryFn: () => getLobbyStats(),
    refetchInterval: 15_000,
  });

  // 排队计时：进入匹配等待后开始累计，匹配成功或退出即归零
  const [queueSec, setQueueSec] = useState(0);
  useEffect(() => {
    if (!(ranked && waiting)) { setQueueSec(0); return; }
    const t = setInterval(() => setQueueSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [ranked, waiting]);

  const incoming = invitesQ.data?.incoming ?? [];
  const open = invitesQ.data?.open ?? [];
  const mine = invitesQ.data?.mine ?? null;


  const accept = (inviteCode: string) => {
    setNotice(null);
    void joinDuelInvite({ data: { code: inviteCode } })
      .then(() => {
        setNotice(t("已加入对局，正在进入棋盘…", "Joined — opening the board…"));
        window.location.assign("/battle");
      })
      .catch(() => setNotice(t("对战码无效或已过期", "That code is invalid or has expired")));
  };

  const makeInvite = (invitedId?: string) => {
    setNotice(null);
    const tc = timeControl(tcId);
    void createDuelInvite({ data: { ...(invitedId ? { invitedId } : {}), tcBase: tc.base, tcInc: tc.inc } })
      .then((r) => {
        setMyCode(r?.code ?? "");
        setNotice(invitedId ? t("已向该玩家发出约战，对方在对弈页会看到提醒。", "Challenge sent — they will see it on the duel page.") : t("已生成对战码，发给对手即可开局。", "Code created — send it to your opponent to start."));
        void invitesQ.refetch();
      })
      .catch(() => setNotice(t("创建邀请失败，请稍后再试", "Could not create the challenge — try again")));

  };

  if (signedIn === false) {
    return (
      <section aria-label={t("找对手", "Find an opponent")} className="battle-core-width home-glass-panel p-space-sm">
        <h2 className="cjk font-label-md text-label-md text-on-surface">{t("找对手", "Find an opponent")}</h2>
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant mt-1">{t("登录后即可系统匹配、点名邀请好友，或用对战码约战。当前为本地 AI 陪练。", "Sign in to use matchmaking, challenge a friend by name, or play with a code. You are currently facing the local AI.")}</p>
        <a href="/auth" className="cjk inline-flex min-h-11 items-center text-secondary font-label-sm text-label-sm mt-1">{t("去登录 →", "Sign in →")}</a>
      </section>
    );
  }

  return (
    <section aria-label={t("找对手", "Find an opponent")} className="battle-core-width home-glass-panel p-space-sm">
      <div className="section-heading-row">
        <h2 className="cjk font-headline-sm text-headline-sm text-on-surface">{t("找对手", "Find an opponent")}</h2>
        <span className="cjk font-label-sm text-label-sm text-on-surface-variant">
          {incoming.length
            ? t(`${incoming.length} 条约战邀请`, `${incoming.length} challenge${incoming.length > 1 ? "s" : ""}`)
            : open.length
              ? t(`大厅 ${open.length} 人等待`, `${open.length} waiting in the lobby`)
              : `${timeControl(tcId).label} ${lang === "zh" ? timeControl(tcId).zh : timeControl(tcId).en}`}
        </span>
      </div>

      {incoming.length > 0 && (
        <ul className="mt-space-sm space-y-2">
          {incoming.map((i) => (
            <li key={i.code} className="min-h-14 px-3 py-2 bg-primary-container/30 flex items-center justify-between gap-3 gold-hairline">
              <span className="min-w-0">
                <strong className="cjk block truncate font-label-md text-label-md text-on-surface">{t(`${i.hostName} 向你约战`, `${i.hostName} challenges you`)}</strong>
                <small className="block font-label-sm text-label-sm text-on-surface-variant">{i.hostElo} ELO · {t("对战码", "Code")} {i.code}</small>
              </span>
              <Button onClick={() => accept(i.code)} className="home-glass-action h-11 bg-secondary text-on-secondary px-4 shrink-0 cjk">{t("应战", "Accept")}</Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-space-sm grid grid-cols-3 gap-1" role="tablist">
        {([["auto", t("系统匹配", "Matchmaking")], ["invite", t("邀请对手", "Invite")], ["lobby", t("约战大厅", "Lobby")]] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`home-glass-control cjk min-h-11 px-2 font-label-sm text-label-sm transition-colors ${tab === id ? "home-glass-tile-active bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant hover:text-secondary"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-space-sm">
        {tab === "auto" && (
          <div className="space-y-space-sm">
            <div>
              <p className="cjk font-label-sm text-label-sm text-on-surface">{t("选择赛制", "Choose a time control")}</p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1" role="radiogroup" aria-label={t("赛制", "Time control")}>
                {TIME_CONTROLS.map((tc) => (
                  <button
                    key={tc.id}
                    role="radio"
                    aria-checked={tcId === tc.id}
                    disabled={ranked}
                    onClick={() => setTcId(tc.id)}
                    className={`home-glass-control cjk min-h-12 px-2 py-1 font-label-sm text-label-sm transition-colors disabled:opacity-60 ${
                      tcId === tc.id
                        ? "home-glass-tile-active bg-primary-container text-on-primary-container"
                        : "bg-surface-container text-on-surface-variant hover:text-secondary"
                    }`}
                  >
                    <span className="block tabular-nums">{tc.label}</span>
                    <span className="block">{lang === "zh" ? tc.zh : tc.en}</span>
                  </button>
                ))}
              </div>
              <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant">{t(`${timeControl(tcId).descZh} · 四种赛制共用同一套天梯分`, `${timeControl(tcId).descEn} · All four share one ladder rating`)}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {ranked && waiting
                  ? t(
                      "正在按积分就近排队，只会配到选了同一赛制的对手，匹配成功自动开局。",
                      "Queuing by rating. You will only meet players on the same time control, and the game starts automatically.",
                    )
                  : t(
                      `系统按积分就近匹配真人 ${timeControl(tcId).label}，段位相近者优先，胜负结算段位与钻石。`,
                      `Matchmaking pairs you with a human at ${timeControl(tcId).label}, closest rating first. Results settle rank and diamonds.`,
                    )}
              </p>
              <Button onClick={() => onStartRanked(tcId)} disabled={ranked} className="home-glass-action h-12 text-on-primary-container px-space-md shrink-0">
                <UiIcon name="shield" className="h-7 w-7" />
                {ranked ? (waiting ? t("排队中…", "In queue…") : t("对局进行中", "Game in progress")) : t("开始匹配", "Start matchmaking")}
              </Button>
            </div>
            {ranked && waiting && (
              <div role="status" className="home-glass-tile px-3 py-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shrink-0" />
                  <span className="cjk font-label-sm text-label-sm text-on-surface truncate">
                    {queueSec < 30
                      ? t("正在寻找同段位对手…", "Looking for an opponent at your rank…")
                      : queueSec < 90
                        ? t("同段位偏少，正在放宽积分区间…", "Few players at your rank — widening the rating range…")
                        : t("正在全服范围内匹配，稍候即可开局", "Searching across all ranks — a game will start shortly")}
                  </span>
                </span>
                <span className="font-label-md text-label-md text-secondary tabular-nums shrink-0">{mmss(queueSec)}</span>
              </div>
            )}
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
              {t(
                `当前 ${statsQ.data?.queueing ?? 0} 人排队 · ${statsQ.data?.online ?? 0} 人在线 · ${statsQ.data?.openInvites ?? 0} 条公开约战`,
                `${statsQ.data?.queueing ?? 0} in queue · ${statsQ.data?.online ?? 0} online · ${statsQ.data?.openInvites ?? 0} open challenges`,
              )}
            </p>
          </div>
        )}

        {tab === "invite" && (
          <div className="space-y-space-sm">
            <div className="field-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("搜索玩家名或账号", "Search by player name or handle")}
                className="field-control cjk"
              />
              <Button
                type="button"
                onClick={() => void searchPlayers({ data: { query } }).then((r) => { setResults(r as typeof results); if (!r.length) setNotice(t("没有找到该玩家", "No such player")); }).catch(() => setNotice(t("搜索失败", "Search failed")))}
                 className="field-action home-glass-action bg-secondary text-on-secondary cjk font-label-md text-label-md"
              >
                {t("搜索", "Search")}
              </Button>
            </div>
            {results.map((p) => (
              <div key={p.id} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                <span className="min-w-0"><strong className="block truncate">{p.name}</strong><small className="text-on-surface-variant">{p.elo} ELO</small></span>
                <button onClick={() => makeInvite(p.id)} className="cjk h-11 px-3 text-primary font-label-sm text-label-sm shrink-0">{t("约战", "Challenge")}</button>
              </div>
            ))}
            {(friendsQ.data ?? []).filter((f) => f.friendshipStatus === "accepted").map((f) => (
              <div key={f.friendshipId} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                <span className="min-w-0"><strong className="block truncate">{t(`好友 · ${f.name}`, `Friend · ${f.name}`)}</strong><small className="text-on-surface-variant">{f.elo} ELO</small></span>
                <button onClick={() => makeInvite(f.id)} className="cjk h-11 px-3 text-primary font-label-sm text-label-sm shrink-0">{t("约战", "Challenge")}</button>
              </div>
            ))}
            <div className="grid gap-2 sm:grid-cols-2">
               <Button type="button" onClick={() => makeInvite()} className="home-glass-control cjk h-12 bg-primary-container text-on-primary-container font-label-md text-label-md">{t(`创建公开对战码（${timeControl(tcId).label}）`, `Create an open code (${timeControl(tcId).label})`)}</Button>
              <div className="field-row">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t("输入对战码", "Enter a code")} className="field-control uppercase" />
                 <Button type="button" onClick={() => accept(code)} className="field-action home-glass-action bg-secondary text-on-secondary cjk font-label-md text-label-md">{t("加入", "Join")}</Button>
              </div>
            </div>
            {(myCode || mine) && (
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {t("我的对战码：", "Your code: ")}<span className="tracking-widest text-secondary">{myCode || mine?.code}</span> · {t("10 分钟内有效", "valid for 10 minutes")}
              </p>
            )}
          </div>
        )}

        {tab === "lobby" && (
          <div className="space-y-space-sm">
            <div className="home-glass-media aged-print-frame relative overflow-hidden">
              <img src={lobbyBanner} alt={t("约战大厅：白金王与黑曜绯红骑士对峙，两侧为段位徽章", "Lobby banner: a platinum king faces an obsidian crimson knight, flanked by rank badges")} loading="lazy" width={1536} height={640} className="w-full h-24 sm:h-32 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/90 via-surface-container-lowest/40 to-transparent" />
              <div className="absolute inset-0 p-3 flex flex-col justify-center">
                <span className="cjk font-label-md text-label-md text-primary">{t("约战大厅", "Challenge lobby")}</span>
                <span className="cjk font-label-md text-label-md text-on-surface">{t(`${statsQ.data?.online ?? 0} 人在线 · ${statsQ.data?.queueing ?? 0} 人排队`, `${statsQ.data?.online ?? 0} online · ${statsQ.data?.queueing ?? 0} in queue`)}</span>
              </div>
            </div>

            <div className="home-glass-tile p-3">
              <p className="cjk font-label-sm text-label-sm text-on-surface">{t("段位分布", "Rank distribution")}</p>
              <ul className="mt-2 space-y-1.5">
                {(statsQ.data?.tiers ?? []).map((tier) => {
                  const total = Math.max(1, (statsQ.data?.tiers ?? []).reduce((s, x) => s + x.count, 0));
                  return (
                    <li key={tier.tier} className="flex items-center gap-2">
                      <span className="cjk font-label-sm text-label-sm text-on-surface-variant w-24 shrink-0 truncate">{lang === "zh" ? tier.tierZh : tier.tier}</span>
                      <span className="h-2 flex-1 bg-surface-container-highest overflow-hidden">
                        <span className="block h-full bg-secondary/70" style={{ width: `${(tier.count / total) * 100}%` }} />
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant tabular-nums w-8 text-right">{tier.count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-2">
              <p className="cjk font-label-sm text-label-sm text-on-surface">{t("公开约战", "Open challenges")}</p>
              {open.length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("现在没有公开约战。可以创建一个对战码，或直接用系统匹配排队。", "No open challenges right now. Create a code, or join the matchmaking queue.")}</p>}
              {open.map((i) => (
                <div key={i.code} className="min-h-12 px-3 bg-surface-container flex items-center justify-between gap-2">
                  <span className="min-w-0"><strong className="block truncate">{i.hostName}</strong><small className="text-on-surface-variant">{i.hostElo} ELO · {i.code}</small></span>
                  <button onClick={() => accept(i.code)} className="cjk h-11 px-3 text-secondary font-label-sm text-label-sm shrink-0">{t("应战", "Accept")}</button>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="cjk font-label-sm text-label-sm text-on-surface">{t("最近战报", "Recent results")}</p>
              {(statsQ.data?.recent ?? []).length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("还没有已结算的对局。", "No finished games yet.")}</p>}
              {(statsQ.data?.recent ?? []).map((m) => (
                <p key={m.id} className="cjk font-body-sm text-body-sm text-on-surface-variant truncate">
                  {m.white} vs {m.black} · {m.outcome === "1-0" ? t("白胜", "White wins") : m.outcome === "0-1" ? t("黑胜", "Black wins") : t("和棋", "Draw")}
                  {m.ratingDelta !== null && <span className="text-secondary tabular-nums"> · ±{Math.abs(m.ratingDelta)} {t("分", "pts")}</span>}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {notice && <p role="status" className="cjk mt-space-sm font-body-sm text-body-sm text-on-primary-container">{notice}</p>}
    </section>
  );
}

/** 对弈页时钟每秒刷新，本面板与时钟无关，memo 阻断无谓重绘。 */
export const OpponentPanel = memo(OpponentPanelComponent);
