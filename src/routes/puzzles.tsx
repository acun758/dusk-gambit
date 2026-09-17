import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ThemeBackdrop } from "@/components/ThemeBackdrop";
import { SovereignPageHeader } from "@/components/SovereignPageHeader";

import { PlayableBoard } from "@/components/PlayableBoard";
import { UiIcon } from "@/components/UiIcon";
import { Button } from "@/components/ui/button";
import { fetchDailyPuzzle, fetchPuzzles, submitPuzzleMove } from "@/lib/db";
import { useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";

export const Route = createFileRoute("/puzzles")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "战术谜题 · 每日一题 | Tactics Puzzles" },
      {
        name: "description",
        content: "四档难度的战术谜题与每日一题：服务端持有正解并逐手校验，答错给出正解与讲解，通关奖励训练点与钻石。",
      },
      { property: "og:title", content: "战术谜题 · 每日一题 | Tactics Puzzles" },
      { property: "og:description", content: "逐手校验的战术谜题训练，含每日一题与连胜天数。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Puzzles,
});

interface PuzzleCard {
  id: number;
  code: string;
  fen: string;
  side: "w" | "b";
  themeZh: string;
  themeEn: string;
  difficulty: number;
  rating: number;
  movesRequired: number;
  hintZh: string;
  hintEn: string;
  tpReward: number;
  diamondReward: number;
  solved: boolean;
  attempts: number;
  bestMs: number | null;
}

const DIFF_LABEL: Record<number, { zh: string; en: string }> = {
  1: { zh: "入门", en: "Starter" },
  2: { zh: "进阶", en: "Rising" },
  3: { zh: "硬仗", en: "Hard" },
  4: { zh: "大师", en: "Master" },
};

type Status = "playing" | "solved" | "failed";

function Puzzles() {
  const t = useT();
  const queryClient = useQueryClient();
  const { signedIn } = useProfile();

  const dailyQ = useQuery({
    queryKey: ["puzzle-daily"],
    queryFn: () => fetchDailyPuzzle(),
    enabled: signedIn,
  });
  const listQ = useQuery({
    queryKey: ["puzzle-list"],
    queryFn: () => fetchPuzzles(),
    enabled: signedIn,
  });

  const puzzles = useMemo(() => (listQ.data?.puzzles ?? []) as PuzzleCard[], [listQ.data]);
  const daily = (dailyQ.data?.puzzle ?? null) as PuzzleCard | null;

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isDaily, setIsDaily] = useState(true);
  const [fen, setFen] = useState("8/8/8/8/8/8/8/8 w - - 0 1");
  const [moveIndex, setMoveIndex] = useState(0);
  const [lastMove, setLastMove] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Status>("playing");
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [note, setNote] = useState("");
  const [solutionLine, setSolutionLine] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(false);

  const active = useMemo(() => {
    if (activeId === null) return daily;
    return puzzles.find((p) => p.id === activeId) ?? daily;
  }, [activeId, daily, puzzles]);

  const load = useCallback((p: PuzzleCard, fromDaily: boolean) => {
    setActiveId(p.id);
    setIsDaily(fromDaily);
    setFen(p.fen);
    setMoveIndex(0);
    setLastMove(undefined);
    setStatus("playing");
    setBusy(false);
    setStartedAt(Date.now());
    setNote("");
    setSolutionLine([]);
    setShowHint(false);
  }, []);

  // 首次拿到每日一题时自动摆好题面
  if (active && activeId === null && daily && fen !== daily.fen) {
    load(daily, true);
  }

  const applyUci = useCallback((base: string, uci: string): string | null => {
    const board = new Chess(base);
    try {
      board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: (uci.slice(4) || "q") as never });
    } catch {
      return null;
    }
    return board.fen();
  }, []);

  const onMove = useCallback(
    (uci: string) => {
      if (!active || status !== "playing" || busy) return;
      setBusy(true);
      void (async () => {
        try {
          const res = await submitPuzzleMove({
            data: { puzzleId: active.id, moveIndex, uci, ms: Date.now() - startedAt, isDaily },
          });
          if (!res.correct) {
            setStatus("failed");
            setSolutionLine(res.solution ?? []);
            setNote(t(res.explanationZh ?? "这一手不是正解。", res.explanationEn ?? "Not the solution."));
            setBusy(false);
            return;
          }
          const afterMine = applyUci(fen, uci) ?? fen;
          setFen(afterMine);
          setLastMove(uci);
          if (res.completed) {
            setStatus("solved");
            setSolutionLine(res.solution ?? []);
            const reward = res.reward;
            setNote(
              reward?.firstSolve
                ? t(
                    `解题成功：训练点 +${reward.tp}，钻石 +${reward.diamonds}。`,
                    `Solved: +${reward.tp} training points, +${reward.diamonds} diamonds.`,
                  )
                : t("解题成功（本题奖励此前已领取）。", "Solved (reward already claimed earlier)."),
            );
            void queryClient.invalidateQueries({ queryKey: ["puzzle-list"] });
            void queryClient.invalidateQueries({ queryKey: ["puzzle-daily"] });
            void queryClient.invalidateQueries({ queryKey: ["profile"], exact: false });
            setBusy(false);
            return;
          }
          // 对手应着，稍作停顿让玩家看清
          window.setTimeout(() => {
            const reply = res.reply;
            if (reply) {
              const afterReply = applyUci(afterMine, reply);
              if (afterReply) {
                setFen(afterReply);
                setLastMove(reply);
              }
            }
            setMoveIndex(moveIndex + 2);
            setBusy(false);
          }, 420);
        } catch {
          setNote(t("提交失败，请稍后重试。", "Submit failed, please retry."));
          setBusy(false);
        }
      })();
    },
    [active, applyUci, busy, fen, isDaily, moveIndex, queryClient, startedAt, status, t],
  );

  const grouped = useMemo(() => {
    const out: Record<number, PuzzleCard[]> = { 1: [], 2: [], 3: [], 4: [] };
    for (const p of puzzles) (out[p.difficulty] ?? (out[p.difficulty] = [])).push(p);
    return out;
  }, [puzzles]);

  const solvedCount = puzzles.filter((p) => p.solved).length;

  return (
    <div className="relative min-h-dvh">
      <ThemeBackdrop theme="abyss" />
      <SovereignPageHeader icon="nav-crucible" titleZh="战术谜题" titleEn="Tactics Puzzles" backTo="/" />

      <main className="page-main-compact desktop-page-container px-margin-mobile grid gap-space-sm">
        {!signedIn && (
          <div className="home-glass-panel p-space-md grid gap-2">
            <p className="cjk font-body-md text-body-md text-on-surface-variant">
              {t("登录后开始战术训练，成绩与奖励会保存在你的档案里。", "Sign in to start training; results and rewards are saved to your profile.")}
            </p>
            <Link to="/auth" className="home-glass-control cjk flex h-11 w-fit items-center px-4 bg-primary-container text-on-primary-container font-label-md text-label-md">
              {t("去登录", "Sign in")}
            </Link>
          </div>
        )}

        {signedIn && (
          <div className="home-glass-panel p-space-sm flex flex-wrap items-center justify-between gap-space-sm">
            <div className="min-w-0">
              <p className="cjk font-label-sm text-label-sm text-primary">{t("每日一题", "Daily puzzle")}</p>
              <p className="cjk font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  `连胜 ${dailyQ.data?.streak ?? 0} 天 · 最佳 ${dailyQ.data?.bestStreak ?? 0} 天 · 已解 ${solvedCount}/${puzzles.length} 题`,
                  `${dailyQ.data?.streak ?? 0}-day streak · best ${dailyQ.data?.bestStreak ?? 0} · solved ${solvedCount}/${puzzles.length}`,
                )}
              </p>
            </div>
            {daily && (
              <Button
                type="button"
                onClick={() => load(daily, true)}
                className="home-glass-control h-11 bg-secondary text-on-secondary font-label-md text-label-md"
              >
                <span className="cjk">{t("挑战今日", "Today's puzzle")}</span>
              </Button>
            )}
          </div>
        )}

        {active && (
          <>
            <div className="home-glass-panel p-space-sm">
              <p className="cjk font-label-sm text-label-sm text-primary">
                {t(DIFF_LABEL[active.difficulty]?.zh ?? "", DIFF_LABEL[active.difficulty]?.en ?? "")} · {active.rating}
              </p>
              <h2 className="cjk font-headline-sm text-headline-sm">{t(active.themeZh, active.themeEn)}</h2>
              <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant">
                {t(
                  `${active.side === "w" ? "白方" : "黑方"}走，${active.movesRequired} 步内取胜 · 奖励 ${active.tpReward} 训练点 / ${active.diamondReward} 钻石`,
                  `${active.side === "w" ? "White" : "Black"} to move, win in ${active.movesRequired} · ${active.tpReward} TP / ${active.diamondReward} diamonds`,
                )}
              </p>
              {showHint && (
                <p className="cjk mt-1 font-body-sm text-body-sm text-secondary">{t(active.hintZh, active.hintEn)}</p>
              )}
            </div>

            <PlayableBoard
              fen={fen}
              lastMove={lastMove}
              disabled={status !== "playing" || busy}
              onMove={onMove}
              myColor={active.side}
            />

            <div className="home-glass-panel p-space-sm grid gap-2">
              <p role="status" className="cjk font-label-md text-label-md">
                {status === "solved"
                  ? t("正解！", "Solved!")
                  : status === "failed"
                    ? t("这一手不对，看看正解。", "Wrong move — see the solution.")
                    : busy
                      ? t("校验中…", "Checking…")
                      : t("轮到你落子", "Your move")}
              </p>
              {note && <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{note}</p>}
              {solutionLine.length > 0 && (
                <p className="font-body-sm text-body-sm text-secondary break-words">
                  {t("正解：", "Solution: ")}
                  {solutionLine.join(" ")}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {status === "playing" && (
                  <Button
                    type="button"
                    onClick={() => setShowHint(true)}
                    className="home-glass-control h-11 bg-surface-container text-on-surface font-label-md text-label-md"
                  >
                    <UiIcon name="eye" className="h-5 w-5" />
                    <span className="cjk">{t("提示", "Hint")}</span>
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => load(active, isDaily)}
                  className="home-glass-control h-11 bg-surface-container text-on-surface font-label-md text-label-md"
                >
                  <UiIcon name="spinner" className="h-5 w-5" />
                  <span className="cjk">{t("重新挑战", "Retry")}</span>
                </Button>
              </div>
            </div>
          </>
        )}

        {signedIn && (
          <section className="grid gap-space-sm" aria-label={t("谜题闯关", "Puzzle ladder")}>
            {[1, 2, 3, 4].map((d) => (
              <div key={d} className="home-glass-panel p-space-sm grid gap-2">
                <h3 className="cjk font-label-lg text-label-lg">
                  {t(DIFF_LABEL[d]!.zh, DIFF_LABEL[d]!.en)}
                  <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant tabular-nums">
                    {(grouped[d] ?? []).filter((p) => p.solved).length}/{(grouped[d] ?? []).length}
                  </span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(grouped[d] ?? []).map((p) => (
                    <Button
                      key={p.id}
                      type="button"
                      variant="ghost"
                      onClick={() => load(p, false)}
                      className={`home-glass-control h-11 px-3 font-label-sm text-label-sm tabular-nums ${
                        p.id === active?.id
                          ? "bg-secondary text-on-secondary"
                          : p.solved
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {p.rating}
                      {p.solved && <UiIcon name="seal" className="ml-1 h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
