import { useEffect, useState } from "react";
import { fetchQualifierGames, fetchSession, fetchThroneCandidates, refreshMyThrone } from "@/data/db";
import type { QualifierGame, ThroneRow } from "@/data/throne.functions";
import { useT } from "@/lib/i18n";

const pct = (n: number) => `${Math.round(n * 100)}%`;
const day = (s: string | null) => (s ? s.slice(0, 10) : "—");
const DAY_MS = 86_400_000;

/** 进度条：当前值 / 目标值。 */
function Bar({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  const ratio = Math.max(0, Math.min(1, value / goal));
  const left = Math.max(0, goal - value);
  const t = useT();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="cjk font-label-sm text-label-sm text-on-surface">{label}</span>
        <span className="shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">
          {value} / {goal}
          {left > 0 ? t(` · 还差 ${left} ${unit}`, ` · ${left} ${unit} to go`) : " ✓"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest" role="progressbar" aria-valuenow={Math.round(ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}

/** 资格赛窗口：实际起止日期 + 已过进度 + 倒计时（每分钟刷新）。 */
function WindowClock({ start, end }: { start: string; end: string }) {
  const t = useT();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const left = Math.max(0, e - now);
  const ratio = Math.max(0, Math.min(1, (now - s) / (e - s)));
  const d = Math.floor(left / DAY_MS);
  const h = Math.floor((left % DAY_MS) / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const fmt = (x: number) => new Date(x).toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-container-high p-space-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("资格赛窗口", "Qualifier window")}</span>
        <span className="tabular-nums font-label-sm text-label-sm text-secondary">
          {left > 0 ? t(`剩余 ${d} 天 ${h} 时 ${m} 分`, `${d}d ${h}h ${m}m left`) : t("窗口已结束", "Window closed")}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container-highest">
        <div className="h-full rounded-full bg-secondary" style={{ width: `${ratio * 100}%` }} />
      </div>
      <span className="tabular-nums font-label-sm text-label-sm text-on-surface-variant">{fmt(s)} → {fmt(e)}</span>
    </div>
  );
}

/** 资格赛逐局积分：每局胜负、得分与累计，附累计走势条。 */
function GameLog({ userId }: { userId: string }) {
  const t = useT();
  const [games, setGames] = useState<QualifierGame[] | null>(null);
  useEffect(() => {
    let off = false;
    fetchQualifierGames({ data: { userId } })
      .then((g) => !off && setGames(g))
      .catch(() => !off && setGames([]));
    return () => {
      off = true;
    };
  }, [userId]);
  if (!games) return <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("逐局积分加载中…", "Loading game log…")}</p>;
  if (!games.length) return <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("窗口内暂无有效对局。", "No valid games in the window yet.")}</p>;
  const max = Math.max(1, games[games.length - 1]!.total);
  const label = { W: t("胜", "W"), D: t("和", "D"), L: t("负", "L") };
  return (
    <div className="flex flex-col gap-1">
      <p className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("逐局积分", "Game-by-game points")}</p>
      <div className="flex h-10 items-end gap-px" aria-hidden>
        {games.map((g, i) => (
          <div key={i} className="min-w-[2px] flex-1 rounded-t-sm bg-secondary/70" style={{ height: `${Math.max(4, (g.total / max) * 100)}%` }} />
        ))}
      </div>
      <ol className="flex max-h-48 flex-col gap-px overflow-y-auto">
        {games.slice().reverse().map((g, i) => (
          <li key={i} className="flex min-w-0 items-center gap-2 font-label-sm text-label-sm">
            <span className="w-12 shrink-0 tabular-nums text-on-surface-variant">{g.at.slice(5, 10)}</span>
            <span className="cjk min-w-0 flex-1 truncate text-on-surface">{t("对", "vs")} {g.opponent}</span>
            <span className={g.result === "W" ? "text-secondary" : "text-on-surface-variant"}>{label[g.result]}</span>
            <span className="w-10 shrink-0 text-right tabular-nums text-on-surface">+{g.points}</span>
            <span className="w-12 shrink-0 text-right tabular-nums text-secondary">{t(`${g.total} 分`, `${g.total}`)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** 一名候选人的完整计算过程：三关 → 综合评分四项 → 资格赛。 */
function Breakdown({ r, live = false }: { r: ThroneRow; live?: boolean }) {
  const t = useT();
  const line = "cjk font-body-sm text-body-sm text-on-surface";
  const mark = (ok: boolean) => <span className={ok ? "text-secondary" : "text-on-surface-variant"}>{ok ? "✓" : "○"}</span>;
  return (
    <div className="flex flex-col gap-1">
      {r.qualified && r.qualifiedAt && r.windowEnd ? (
        <WindowClock start={r.qualifiedAt} end={r.windowEnd} />
      ) : (
        <div className="flex flex-col gap-space-xs rounded-lg bg-surface-container-high p-space-sm">
          <Bar label={t("第一关 王段积分", "Gate 1 · King rating")} value={r.elo} goal={2500} unit={t("分", "pts")} />
          <Bar label={t("第二关 有效局", "Gate 2 · Valid games")} value={r.validGames} goal={50} unit={t("局", "games")} />
        </div>
      )}
      <p className={line}>{mark(r.gateRank)} {t(`第一关 王段：积分 ${r.elo} ${r.gateRank ? "≥" : "<"} 2500`, `Gate 1 King tier: rating ${r.elo} ${r.gateRank ? "≥" : "<"} 2500`)}</p>
      <p className={line}>{mark(r.gateGames)} {t(`第二关 有效局：${r.validGames} ${r.gateGames ? "≥" : "<"} 50`, `Gate 2 Valid games: ${r.validGames} ${r.gateGames ? "≥" : "<"} 50`)}</p>
      <p className={line}>
        {t("第三关 综合评分：", "Gate 3 Composite: ")}
        <span className="tabular-nums">
          {t(
            `胜率 ${pct(r.winRate)}×40=${r.ptsWin.toFixed(1)} + 局数 min(${r.validGames}/50,1)×30=${r.ptsGames.toFixed(1)} + 复盘 min(${r.reviewCount}/50,1)×20=${r.ptsReview.toFixed(1)} + 每日挑战 ${pct(r.dailyRate)}×10=${r.ptsDaily.toFixed(1)} → ${r.score.toFixed(1)}`,
            `win ${pct(r.winRate)}×40=${r.ptsWin.toFixed(1)} + games min(${r.validGames}/50,1)×30=${r.ptsGames.toFixed(1)} + reviews min(${r.reviewCount}/50,1)×20=${r.ptsReview.toFixed(1)} + daily ${pct(r.dailyRate)}×10=${r.ptsDaily.toFixed(1)} → ${r.score.toFixed(1)}`,
          )}
        </span>
      </p>
      <p className={line}>
        {mark(r.qualified)}{" "}
        {r.qualified
          ? t(
              `资格赛（${day(r.qualifiedAt)} 至 ${day(r.windowEnd)}）：${r.qGames} 局 ${r.qWins} 胜 ${r.qDraws} 和 ${r.qLosses} 负 → ${r.qPoints} 分`,
              `Qualifier (${day(r.qualifiedAt)} – ${day(r.windowEnd)}): ${r.qGames} games, ${r.qWins}W ${r.qDraws}D ${r.qLosses}L → ${r.qPoints} pts`,
            )
          : t("资格赛：前两关达标后自动入围", "Qualifier: entered automatically once gates 1–2 are met")}
      </p>
      {r.qualified && live && <GameLog userId={r.userId} />}
    </div>
  );
}

/** 王座资格、资格赛与全体候选公示（数据由服务端计算并存档，公开可见）。 */
export function ThroneStandings() {
  const t = useT();
  const [mine, setMine] = useState<ThroneRow | null>(null);
  const [rows, setRows] = useState<ThroneRow[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let off = false;
    void (async () => {
      try {
        const s = await fetchSession();
        if (off) return;
        setSignedIn(Boolean(s));
        if (s) {
          const me = await refreshMyThrone();
          if (!off) setMine(me);
        }
        const list = await fetchThroneCandidates();
        if (!off) setRows(list.rows);
      } catch {
        if (!off) setError(true);
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  const qualified = rows?.filter((r) => r.qualified) ?? [];
  const others = rows?.filter((r) => !r.qualified) ?? [];

  return (
    <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
      <h2 className="cjk font-headline-sm text-headline-sm text-on-surface">{t("资格赛与候选公示", "Qualifier & Public Standings")}</h2>

      <div className="flex flex-col gap-1 rounded-xl bg-surface-container p-space-sm">
        <p className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("申请流程", "How to apply")}</p>
        <p className="cjk font-body-sm text-body-sm text-on-surface">{t("① 达到王段 2500+ 且本赛季有效对局 ≥50 局（已结束、非中止、双方合计 ≥10 手）。", "① Reach King tier 2500+ with ≥50 valid games this season (finished, not aborted, ≥10 plies).")}</p>
        <p className="cjk font-body-sm text-body-sm text-on-surface">{t("② 达标当刻即自动入围，资格赛窗口从入围时刻起算 30 天（不跨赛季），页面显示实际起止日期与倒计时，无需另行申请。", "② You are entered automatically the moment you qualify; the window runs 30 days from that moment (within the season), shown with real start/end dates and a countdown — no separate application.")}</p>
        <p className="cjk font-body-sm text-body-sm text-on-surface">{t("③ 窗口内的有效真人排位局单独计「资格赛分」：胜 1、和 0.5、负 0，与天梯积分分开计算。", "③ Valid ranked games inside the window earn qualifier points: win 1, draw 0.5, loss 0 — separate from your ladder rating.")}</p>
        <p className="cjk font-body-sm text-body-sm text-on-surface">{t("④ 最终按资格赛分排名，同分依次比较：胜率 → 有效局数 → 复盘次数 → 更早达成王段者。第一名获颁王座。", "④ Final ranking by qualifier points; ties broken by win rate → valid games → reviews → earlier King tier. First place receives the Throne.")}</p>
      </div>

      {signedIn === false && (
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("登录后可查看你自己的计算过程。", "Sign in to see your own calculation.")}</p>
      )}

      {mine && (
        <div className="flex flex-col gap-space-xs rounded-xl border border-secondary/50 bg-surface-container p-space-sm">
          <p className="cjk font-label-sm text-label-sm text-secondary">{t("我的资格", "My standing")}</p>
          <Breakdown r={mine} live />
        </div>
      )}

      {error && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("数据暂时无法加载，请稍后再试。", "Data is unavailable right now. Please try again later.")}</p>}

      {rows && (
        <>
          <p className="cjk font-label-sm text-label-sm text-on-surface-variant">{t(`资格赛名单（${qualified.length} 人）`, `Qualifiers (${qualified.length})`)}</p>
          {qualified.length === 0 && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("本赛季暂无入围者。", "No qualifiers yet this season.")}</p>}
          <Board rows={qualified} metric={(r) => t(`${r.qPoints} 分`, `${r.qPoints} pts`)} />
          <p className="cjk font-label-sm text-label-sm text-on-surface-variant">{t(`冲关中（${others.length} 人）`, `Working toward the gates (${others.length})`)}</p>
          <Board rows={others} metric={(r) => r.score.toFixed(1)} />
        </>
      )}
      <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("所有数据由服务端按上述口径计算存档，每 10 分钟刷新；点开任一名玩家可查看完整计算过程。仅作水平参考。", "All figures are computed and stored by the server under the rules above and refresh every 10 minutes; tap any player to see the full calculation. For reference only.")}</p>
    </section>
  );
}

function Board({ rows, metric }: { rows: ThroneRow[]; metric: (r: ThroneRow) => string }) {
  const t = useT();
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  if (!rows.length) return null;
  return (
    <ol className="flex flex-col gap-1">
      {rows.map((r, i) => (
        <li key={r.userId}>
          <details onToggle={(e) => e.currentTarget.open && setOpened((o) => ({ ...o, [r.userId]: true }))} className="rounded-lg bg-surface-container px-space-sm py-2">
            <summary className="flex min-w-0 cursor-pointer items-center gap-2 list-none">
              <span className="w-6 shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">{i + 1}</span>
              <span className="cjk min-w-0 flex-1 truncate font-body-sm text-body-sm text-on-surface">{r.name || t("棋手", "Player")}</span>
              <span className="shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">{r.elo}</span>
              <span className="shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">{t(`${r.validGames} 局`, `${r.validGames} g`)}</span>
              <span className="w-14 shrink-0 text-right tabular-nums font-label-sm text-label-sm text-secondary">{metric(r)}</span>
            </summary>
            <div className="mt-2 border-t border-outline-variant/40 pt-2">
              <Breakdown r={r} live={Boolean(opened[r.userId])} />
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}

