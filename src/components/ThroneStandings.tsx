import { useEffect, useState } from "react";
import { fetchSession, fetchThroneCandidates, refreshMyThrone } from "@/data/db";
import type { ThroneRow } from "@/data/throne.functions";
import { useT } from "@/lib/i18n";

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** 王座资格三关的真实进度 + 年度候选公示榜（数据由服务端计算并存档）。 */
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

  const gates = mine
    ? [
        { ok: mine.gateRank, zh: `王段 2500+（当前 ${mine.elo}）`, en: `King tier 2500+ (now ${mine.elo})` },
        { ok: mine.gateGames, zh: `有效对局 ≥50（当前 ${mine.validGames}）`, en: `Valid games ≥50 (now ${mine.validGames})` },
        { ok: mine.qualified, zh: `综合评分 ${mine.score.toFixed(1)} / 100`, en: `Composite score ${mine.score.toFixed(1)} / 100` },
      ]
    : [];

  return (
    <section className="home-glass-panel min-w-0 overflow-hidden rounded-2xl p-space-md flex flex-col gap-space-sm">
      <h2 className="cjk font-headline-sm text-headline-sm text-on-surface">
        {t("年度资格与候选公示", "Season Standing & Candidates")}
      </h2>

      {signedIn === false && (
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
          {t("登录后可查看你自己的三关进度与评分。", "Sign in to see your own gate progress and score.")}
        </p>
      )}

      {mine && (
        <div className="flex flex-col gap-space-xs rounded-xl bg-surface-container p-space-sm">
          <p className="cjk font-label-sm text-label-sm text-on-surface-variant">{t("我的资格", "My standing")}</p>
          {gates.map((g) => (
            <p key={g.en} className="cjk font-body-sm text-body-sm text-on-surface">
              <span className={g.ok ? "text-secondary" : "text-on-surface-variant"}>{g.ok ? "✓" : "○"}</span> {t(g.zh, g.en)}
            </p>
          ))}
          <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
            {t(
              `胜率 ${pct(mine.winRate)} · 复盘 ${mine.reviewCount} 次 · 每日挑战 ${pct(mine.dailyRate)}`,
              `Win rate ${pct(mine.winRate)} · ${mine.reviewCount} reviews · Daily ${pct(mine.dailyRate)}`,
            )}
          </p>
        </div>
      )}

      {error && <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("数据暂时无法加载，请稍后再试。", "Data is unavailable right now. Please try again later.")}</p>}

      {rows && rows.length === 0 && (
        <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("本赛季暂无候选人。", "No candidates this season yet.")}</p>
      )}

      {rows && rows.length > 0 && (
        <ol className="flex flex-col gap-1">
          {rows.map((r, i) => (
            <li key={r.userId} className="flex min-w-0 items-center gap-2 rounded-lg bg-surface-container px-space-sm py-2">
              <span className="w-6 shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">{i + 1}</span>
              <span className="cjk min-w-0 flex-1 truncate font-body-sm text-body-sm text-on-surface">{r.name || t("棋手", "Player")}</span>
              <span className="shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">{r.elo}</span>
              <span className="shrink-0 tabular-nums font-label-sm text-label-sm text-on-surface-variant">{t(`${r.validGames} 局`, `${r.validGames} g`)}</span>
              <span className="w-12 shrink-0 text-right tabular-nums font-label-sm text-label-sm text-secondary">{r.score.toFixed(1)}</span>
              {r.qualified && <span className="cjk shrink-0 font-label-sm text-label-sm text-secondary">{t("达标", "Qualified")}</span>}
            </li>
          ))}
        </ol>
      )}
      <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
        {t("分数由服务端按上方口径计算存档，仅作水平参考。", "Scores are computed and stored by the server using the rules above; for reference only.")}
      </p>
    </section>
  );
}
