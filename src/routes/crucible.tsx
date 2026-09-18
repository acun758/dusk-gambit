import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchEndgameLevels as listEndgameLevels,
  fetchEndgameProgress as loadEndgameProgress,
  submitEndgame,
} from "@/data/db";
import { useProfile, tierLabel } from "@/lib/profile";
import { Bi, LangToggle, useT } from "@/lib/i18n";
import { groupByTier } from "@/lib/endgame-tiers";
import { UiIcon } from "@/components/UiIcon";
import { SoundToggle } from "@/components/SoundToggle";
import { BoardPiece, usePieceAssets } from "@/components/PlayableBoard";

export const Route = createFileRoute("/crucible")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "盲棋心算 · 残局试炼 | Blindfold Endgame Crucible" },
      {
        name: "description",
        content: "六道残局关卡：给出目标解法，服务端校验后结算积分与钻石，并解锁更高段位试炼。",
      },
      { property: "og:title", content: "盲棋心算 · 残局试炼 | Blindfold Endgame Crucible" },
      { property: "og:description", content: "六道残局关卡，服务端校验解法并结算训练积分与钻石奖励。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Crucible,
});

interface LevelRow {
  id: number;
  code: string;
  name_zh: string;
  name_en: string;
  brief_zh: string;
  brief_en: string;
  fen: string;
  objective_zh: string;
  objective_en: string;
  moves_to_mate: number;
  elo_required: number;
  elo_reward: number;
  diamond_reward: number;
  depth: number;
  theme_zh: string;
  theme_en: string;
  hint_zh: string;
  hint_en: string;
}

interface ProgressRow {
  level_id: number;
  solved: boolean;
  attempts: number;
  best_ms: number | null;
}

function boardFromFen(fen: string): (string | null)[][] {
  const rows = fen.split(" ")[0]?.split("/") ?? [];
  return Array.from({ length: 8 }, (_, r) => {
    const out: (string | null)[] = [];
    for (const ch of rows[r] ?? "8") {
      if (/\d/.test(ch)) for (let i = 0; i < Number(ch); i++) out.push(null);
      else out.push(ch);
    }
    while (out.length < 8) out.push(null);
    return out.slice(0, 8);
  });
}

function Crucible() {
  const t = useT();
  const { profile, signedIn, refresh } = useProfile();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [entry, setEntry] = useState("");
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [result, setResult] = useState<{ correct: boolean; firstSolve: boolean; expectedLength: number; explanation?: { zh: string; en: string } } | null>(null);
  const [busy, setBusy] = useState(false);
  const [blind, setBlind] = useState(true);
  const pieceAssets = usePieceAssets();

  const levelsQ = useQuery({
    queryKey: ["endgame-levels"],
    queryFn: () => listEndgameLevels() as Promise<LevelRow[]>,
  });
  const progressQ = useQuery({
    queryKey: ["endgame-progress", signedIn],
    queryFn: () => (signedIn ? (loadEndgameProgress() as Promise<ProgressRow[]>) : Promise.resolve([])),
  });

  const levels = levelsQ.data ?? [];
  const progress = useMemo(() => {
    const map = new Map<number, ProgressRow>();
    for (const p of progressQ.data ?? []) map.set(p.level_id, p);
    return map;
  }, [progressQ.data]);

  useEffect(() => {
    if (activeId === null && levels.length) {
      const first = [...levels].sort((a, b) => a.depth - b.depth)[0]!;
      setActiveId(first.id);
    }
  }, [levels, activeId]);

  const solvedIds = useMemo(() => {
    const set = new Set<number>();
    for (const p of progressQ.data ?? []) if (p.solved) set.add(p.level_id);
    return set;
  }, [progressQ.data]);
  const tierGroups = useMemo(() => groupByTier(levels, solvedIds), [levels, solvedIds]);
  const tierLocked = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const g of tierGroups) for (const l of g.levels) map.set(l.id, !g.unlocked);
    return map;
  }, [tierGroups]);

  const active = levels.find((l) => l.id === activeId) ?? null;
  const locked = active ? profile.trainingPoints < active.elo_required || (tierLocked.get(active.id) ?? false) : false;
  const board = useMemo(() => (active ? boardFromFen(active.fen) : boardFromFen("8/8/8/8/8/8/8/8")), [active]);

  const select = useCallback((id: number) => {
    setActiveId(id);
    setEntry("");
    setResult(null);
    setStartedAt(Date.now());
  }, []);

  const submit = useCallback(async () => {
    if (!active || locked || busy) return;
    const moves = entry.trim().split(/[\s,]+/).filter(Boolean);
    if (!moves.length) return;
    setBusy(true);
    try {
      const res = (await submitEndgame({
        data: { levelId: active.id, moves, ms: Date.now() - startedAt },
      })) as { correct: boolean; firstSolve: boolean; expectedLength: number; explanation?: { zh: string; en: string } };
      setResult(res);
      if (res.correct) {
        await refresh();
        await progressQ.refetch();
      }
    } catch {
      setResult({ correct: false, firstSolve: false, expectedLength: 0 });
    } finally {
      setBusy(false);
    }
  }, [active, locked, busy, entry, startedAt, refresh, progressQ]);

  return (
    <div className="themed-page home-glass-page text-on-surface flex flex-col min-h-screen pb-32">
      <ThemeBackdrop theme="dragon" />
      <header className="home-glass-header desktop-page-header fixed top-0 w-full z-40 pt-safe">
        <div className="mobile-royal-header sm:hidden">
          <div className="mobile-royal-meta">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-label-sm text-label-sm text-secondary tabular-nums">
                {profile.trainingPoints} {t("训练积分", "Training points")}
              </span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span className="cjk truncate font-label-sm text-label-sm text-on-surface-variant">{t(tierLabel(profile).zh, tierLabel(profile).en)}</span>
            </div>
            <div className="mobile-royal-tools">
              <SoundToggle className="mobile-royal-tool" />
              <LangToggle className="home-glass-control mobile-royal-lang" />
            </div>
          </div>
          <div className="mobile-royal-main">
            <h1 className="min-w-0 font-headline-sm text-headline-sm leading-tight text-on-surface">
              <Bi zh="残局试炼 · 心算" en="Blindfold Crucible" />
            </h1>
            <button
              onClick={() => setBlind((b) => !b)}
              className="home-glass-action flex h-10 shrink-0 items-center justify-center gap-1.5 px-3 text-secondary font-label-sm text-label-sm"
            >
              <UiIcon name={blind ? "eye" : "lotus"} className="h-5 w-5 shrink-0" />
              <span className="cjk">{blind ? t("盲视", "Blind") : t("明视", "Visible")}</span>
            </button>
          </div>
        </div>
        <div className="hidden h-20 px-margin-mobile items-center justify-between gap-space-sm sm:flex">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
              {profile.trainingPoints} {t("训练积分", "Training points")} · {t(tierLabel(profile).zh, tierLabel(profile).en)}
            </span>
            <h1 className="font-headline-md text-headline-md leading-tight truncate">
              <Bi zh="残局试炼 · 心算" en="Blindfold Crucible" />
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-space-xs">
            <SoundToggle />
            <LangToggle className="home-glass-control" />
            <button
              onClick={() => setBlind((b) => !b)}
              className="home-glass-control flex h-11 shrink-0 items-center justify-center gap-space-xs px-space-sm text-secondary font-label-sm text-label-sm uppercase tracking-widest"
            >
              <UiIcon name={blind ? "eye" : "lotus"} className="h-6 w-6 shrink-0" />
              <span className="cjk">{blind ? t("盲视", "Blind") : t("明视", "Visible")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-main-dashboard desktop-page-container mx-auto grid w-full grid-cols-1 gap-space-md px-margin-mobile lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-space-lg lg:px-space-lg">
        {/* 关卡列表 */}
        <section className="crucible-levels flex min-w-0 flex-col gap-space-xs mt-space-sm lg:mt-space-sm lg:sticky lg:top-24">
          <h2 className="font-headline-sm text-headline-sm">
            <Bi zh="六道实战试炼" en="Six Practical Trials" />
          </h2>
          <Link
            to="/puzzles"
            className="home-glass-control cjk flex h-11 items-center gap-2 px-3 text-secondary font-label-md text-label-md"
          >
            <UiIcon name="bolt" className="h-6 w-6 shrink-0" />
            {t("战术谜题 · 每日一题", "Tactics puzzles · daily")}
          </Link>
          {levelsQ.isLoading && (
            <div className="grid gap-space-xs" aria-label={t("关卡载入中", "Loading trials")}>
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-14 bg-surface-container animate-pulse" />
              ))}
            </div>
          )}
          <div className="crucible-level-list grid gap-space-sm">
            {tierGroups.map((g) => (
              <div key={g.tier.id} className="grid gap-space-xs">
                <div className="flex items-center justify-between gap-space-xs">
                  <span className="cjk font-label-md text-label-md text-secondary uppercase tracking-widest">
                    {t(g.tier.zh, g.tier.en)}
                  </span>
                  <span className="cjk font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                    {g.unlocked
                      ? t(`${g.solved}/${g.total} 通关`, `${g.solved}/${g.total} solved`)
                      : t("未解锁", "Locked")}
                  </span>
                </div>
                {!g.unlocked && (
                  <p className="cjk font-label-sm text-label-sm text-on-surface-variant">
                    {t("先通关上一级 60% 的残局即可解锁。", "Solve 60% of the previous tier to unlock.")}
                  </p>
                )}
                {g.unlocked && g.needed > 0 && (
                  <p className="cjk font-label-sm text-label-sm text-on-surface-variant">
                    {t(`再通关 ${g.needed} 关解锁下一级`, `${g.needed} more to unlock the next tier`)}
                  </p>
                )}
                {g.levels.map((l) => {
                  const p = progress.get(l.id);
                  const lock = !g.unlocked || profile.trainingPoints < l.elo_required;
                  const on = l.id === activeId;
                  return (
                    <button
                      key={l.id}
                      onClick={() => select(l.id)}
                      disabled={!g.unlocked}
                      className={`home-glass-tile text-left p-space-sm flex items-start justify-between gap-space-sm transition-colors ${
                        on ? "home-glass-tile-active" : ""
                      } ${g.unlocked ? "" : "opacity-50 cursor-not-allowed"}`}
                    >
                      <span className="flex flex-col min-w-0 gap-0.5">
                        <span className="font-label-md text-label-md text-on-surface truncate">
                          {t(l.name_zh, l.name_en)}
                        </span>
                        <span className="cjk font-label-sm text-label-sm text-on-surface-variant truncate">
                          {t(l.theme_zh, l.theme_en)} · D{l.depth} · +{l.elo_reward} {t("训练分", "TP")}
                        </span>
                      </span>
                      <UiIcon name={p?.solved ? "medal-star" : lock ? "seal" : "pawn-up"} className="h-6 w-6 shrink-0" />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* 当前关卡 */}
        <section className="crucible-column flex w-full min-w-0 flex-col items-center gap-space-sm mt-space-sm">
          {levelsQ.isLoading && (
            <div className="grid gap-space-sm" aria-hidden="true">
              <div className="h-32 bg-surface-container-low animate-pulse" />
              <div className="aspect-square w-full max-w-[520px] bg-surface-container-lowest animate-pulse" />
            </div>
          )}
          {active && (
            <>
              <div className="crucible-core-width home-glass-panel p-space-md flex flex-col gap-space-xs">
                <span className="cjk font-label-md text-label-md text-primary">
                  {t(active.objective_zh, active.objective_en)}
                </span>
                <h3 className="font-headline-md text-headline-md">{t(active.name_zh, active.name_en)}</h3>
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t(active.brief_zh, active.brief_en)}
                </p>
                <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
                  <span className="px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-primary tracking-widest">
                    {t(`计算深度 ${active.depth}`, `Depth ${active.depth}`)}
                  </span>
                  <span className="px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-secondary tracking-widest">
                    +{active.elo_reward} {t("训练积分", "Training")}
                  </span>
                  <span className="px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-secondary tracking-widest">
                    +{active.diamond_reward} {t("钻石","Gems")}
                  </span>
                  {active.elo_required > 0 && (
                    <span className="cjk px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
                      {t(`需 ${active.elo_required} 训练分`, `Requires ${active.elo_required} TP`)}
                    </span>
                  )}
                </div>
                <p className="cjk font-body-sm text-body-sm text-secondary mt-1">{t(`提示：${active.hint_zh}`, `Hint: ${active.hint_en}`)}</p>
              </div>

              <div className="crucible-core-width crucible-board relative aspect-square bg-surface-container-lowest p-space-xs">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {board.flatMap((row, r) =>
                    row.map((cell, c) => {
                      const color = cell === cell?.toUpperCase() ? "w" : "b";
                      const type = cell?.toLowerCase() ?? "";
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`relative flex items-center justify-center text-[clamp(29px,7.2vw,54px)] leading-none ${
                            (r + c) % 2 === 0 ? "crucible-square-light" : "crucible-square-dark"
                          }`}
                        >
                          {cell && <BoardPiece color={color} type={type} assets={pieceAssets} hidden={blind} />}
                        </div>
                      );
                    }),
                  )}
                </div>
                {blind && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="cjk font-label-md text-label-md text-on-surface-variant">
                      {t("盲视模式 · 全凭心算", "Blindfold · calculate in the mind")}
                    </span>
                  </div>
                )}
              </div>

              <div className="crucible-core-width home-glass-panel p-space-md flex flex-col gap-space-sm">
                <label className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                  {t("输入你方着法（UCI，如 e2e4 g1f3），以空格分隔", "Enter your moves in UCI (e.g. e2e4 g1f3), space separated")}
                </label>
                <input
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="e1e2 h5h8"
                  spellCheck={false}
                  className="field-control h-12 px-space-sm bg-surface-container-highest text-on-surface font-label-lg text-label-lg tracking-widest outline-none focus:ring-1 focus:ring-secondary"
                />
                <button
                  disabled={!signedIn || locked || busy}
                  onClick={() => void submit()}
                    className="home-glass-action w-full py-space-md text-on-primary-container disabled:opacity-40 flex items-center justify-center gap-space-sm active:scale-[0.99] transition-transform"
                >
                  <UiIcon name="flame" className="h-7 w-7" />
                  <span className="font-label-lg text-label-lg tracking-[0.16em] font-semibold">
                    <Bi zh="提交心算解法" en="Submit Mental Line" />
                  </span>
                </button>

                {!signedIn && (
                  <Link to="/auth" className="cjk font-body-sm text-body-sm text-secondary">
                    {t("登录后由服务端校验并结算训练积分与钻石 →", "Sign in for verified training points and diamonds →")}
                  </Link>
                )}
                {locked && (
                  <p className="cjk font-body-sm text-body-sm text-primary">
                    {t(`需要 ${active.elo_required} 训练积分才能开启此试炼。`, `Reach ${active.elo_required} training points to unlock this trial.`)}
                  </p>
                )}
                {result && (
                  <div
                    className={`p-space-sm ${result.correct ? "bg-secondary-container/30" : "bg-error-container/30"}`}
                  >
                    <p className="cjk font-body-sm text-body-sm">
                      {result.correct
                        ? result.firstSolve
                          ? t("解法正确，训练积分与钻石已结算。", "Correct — training points and diamonds settled.")
                          : t("解法正确，此关此前已通过。", "Correct — this trial was already solved.")
                        : t("解法不成立，再算一遍。", "That line does not hold. Calculate again.")}
                    </p>
                    {result.correct && result.explanation && (
                      <p className="cjk font-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                        {t(result.explanation.zh, result.explanation.en)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
