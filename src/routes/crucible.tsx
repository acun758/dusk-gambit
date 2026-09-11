import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listEndgameLevels, loadEndgameProgress, submitEndgame } from "@/lib/game.functions";
import { useProfile } from "@/lib/profile";
import { Bi, useT } from "@/lib/i18n";

export const Route = createFileRoute("/crucible")({
  head: () => ({
    meta: [
      { title: "盲棋心算 · 残局试炼 | Blindfold Endgame Crucible" },
      {
        name: "description",
        content: "六道残局关卡：给出目标解法，服务端校验后结算积分与钻石，并解锁更高段位试炼。",
      },
      { property: "og:title", content: "盲棋心算 · 残局试炼 | Blindfold Endgame Crucible" },
      { property: "og:description", content: "六道残局关卡，服务端校验解法并结算段位奖励。" },
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
}

interface ProgressRow {
  level_id: number;
  solved: boolean;
  attempts: number;
  best_ms: number | null;
}

const GLYPH: Record<string, string> = {
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
};

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
  const [result, setResult] = useState<{ correct: boolean; firstSolve: boolean; expectedLength: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [blind, setBlind] = useState(true);

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
    if (activeId === null && levels.length) setActiveId(levels[0]!.id);
  }, [levels, activeId]);

  const active = levels.find((l) => l.id === activeId) ?? null;
  const locked = active ? profile.elo < active.elo_required : false;
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
      })) as { correct: boolean; firstSolve: boolean; expectedLength: number };
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
    <div className="bg-surface text-on-surface flex flex-col min-h-screen pb-32">
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.9)] lg:left-56 lg:w-[calc(100%-14rem)]">
        <div className="h-20 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm uppercase text-secondary tracking-widest">
              {profile.elo} ELO · {t(profile.tierZh, profile.tier)}
            </span>
            <span className="font-headline-sm text-headline-sm tracking-wider truncate">
              <Bi zh="盲棋心算" en="Blindfold Crucible" />
            </span>
          </div>
          <button
            onClick={() => setBlind((b) => !b)}
            className="h-11 px-space-sm bg-surface-container-high text-secondary font-label-sm text-label-sm uppercase tracking-widest flex items-center gap-space-xs shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">{blind ? "visibility_off" : "visibility"}</span>
            <span className="cjk">{blind ? t("盲视", "Blind") : t("明视", "Visible")}</span>
          </button>
        </div>
      </header>

      <main className="pt-20 px-margin-mobile flex flex-col gap-space-md lg:flex-row lg:items-start lg:gap-space-lg">
        {/* 关卡列表 */}
        <section className="flex flex-col gap-space-xs mt-space-md lg:w-72 lg:shrink-0">
          <h2 className="font-headline-sm text-headline-sm">
            <Bi zh="六道试炼" en="Six Trials" />
          </h2>
          {levelsQ.isLoading && (
            <p className="cjk font-body-sm text-body-sm text-on-surface-variant">{t("关卡载入中…", "Loading trials…")}</p>
          )}
          <div className="grid gap-space-xs">
            {levels.map((l) => {
              const p = progress.get(l.id);
              const lock = profile.elo < l.elo_required;
              const on = l.id === activeId;
              return (
                <button
                  key={l.id}
                  onClick={() => select(l.id)}
                  className={`text-left p-space-sm flex items-start justify-between gap-space-sm transition-colors ${
                    on ? "bg-surface-container-high gold-hairline" : "bg-surface-container hover:bg-surface-container-high"
                  }`}
                >
                  <span className="flex flex-col min-w-0 gap-0.5">
                    <span className="font-label-md text-label-md text-on-surface truncate">
                      {t(l.name_zh, l.name_en)}
                    </span>
                    <span className="cjk font-label-sm text-label-sm text-on-surface-variant truncate">
                      {t(`${l.moves_to_mate} 步杀`, `Mate in ${l.moves_to_mate}`)} · +{l.elo_reward} ELO
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-secondary">
                    {p?.solved ? "verified" : lock ? "lock" : "chevron_right"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 当前关卡 */}
        <section className="flex-1 min-w-0 flex flex-col gap-space-sm mt-space-md">
          {active && (
            <>
              <div className="bg-surface-container-low p-space-md flex flex-col gap-space-xs">
                <span className="cjk font-label-sm text-label-sm text-primary tracking-widest">
                  {t(active.objective_zh, active.objective_en)}
                </span>
                <h3 className="font-headline-md text-headline-md">{t(active.name_zh, active.name_en)}</h3>
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t(active.brief_zh, active.brief_en)}
                </p>
                <div className="flex flex-wrap items-center gap-space-xs mt-space-xs">
                  <span className="px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-secondary tracking-widest">
                    +{active.elo_reward} ELO
                  </span>
                  <span className="px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-secondary tracking-widest">
                    +{active.diamond_reward} 💎
                  </span>
                  {active.elo_required > 0 && (
                    <span className="cjk px-space-sm py-0.5 bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant">
                      {t(`需 ${active.elo_required} 分`, `Requires ${active.elo_required}`)}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative w-full max-w-[560px] aspect-square bg-surface-container-lowest p-space-xs shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {board.flatMap((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`flex items-center justify-center ${
                          (r + c) % 2 === 0 ? "bg-surface-container-low/50" : "bg-surface-container/30"
                        }`}
                      >
                        {cell && (
                          <span
                            className={`text-[clamp(14px,4vw,30px)] leading-none ${
                              blind ? "opacity-0" : cell === cell.toUpperCase() ? "text-secondary" : "text-on-surface"
                            }`}
                          >
                            {GLYPH[cell]}
                          </span>
                        )}
                      </div>
                    )),
                  )}
                </div>
                {blind && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-[0.3em]">
                      {t("盲视模式 · 全凭心算", "Blindfold · calculate in the mind")}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-surface-container-low p-space-md flex flex-col gap-space-sm">
                <label className="cjk font-label-sm text-label-sm text-on-surface-variant tracking-widest">
                  {t("输入你方着法（UCI，如 e2e4 g1f3），以空格分隔", "Enter your moves in UCI (e.g. e2e4 g1f3), space separated")}
                </label>
                <input
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  placeholder="e1e2 h5h8"
                  spellCheck={false}
                  className="h-12 px-space-sm bg-surface-container-highest text-on-surface font-label-lg text-label-lg tracking-widest outline-none focus:ring-1 focus:ring-secondary"
                />
                <button
                  disabled={!signedIn || locked || busy}
                  onClick={() => void submit()}
                  className="w-full py-space-md bg-primary-container text-on-primary-container disabled:opacity-40 flex items-center justify-center gap-space-sm active:scale-[0.99] transition-transform"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]">bolt</span>
                  <span className="font-label-lg text-label-lg tracking-[0.16em] font-semibold">
                    <Bi zh="提交心算解法" en="Submit Mental Line" />
                  </span>
                </button>

                {!signedIn && (
                  <Link to="/auth" className="cjk font-body-sm text-body-sm text-secondary">
                    {t("登录后才能由服务端校验并结算段位奖励 →", "Sign in so the server can verify and award rating →")}
                  </Link>
                )}
                {locked && (
                  <p className="cjk font-body-sm text-body-sm text-primary">
                    {t(`需要 ${active.elo_required} 分才能开启此试炼。`, `Reach ${active.elo_required} rating to unlock this trial.`)}
                  </p>
                )}
                {result && (
                  <div
                    className={`p-space-sm ${result.correct ? "bg-secondary-container/30" : "bg-error-container/30"}`}
                  >
                    <p className="cjk font-body-sm text-body-sm">
                      {result.correct
                        ? result.firstSolve
                          ? t("解法正确，段位与钻石已结算。", "Correct — rating and diamonds settled.")
                          : t("解法正确，此关此前已通过。", "Correct — this trial was already solved.")
                        : t("解法不成立，再算一遍。", "That line does not hold. Calculate again.")}
                    </p>
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
