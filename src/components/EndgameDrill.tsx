import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Chess } from "chess.js";
import { useQuery } from "@tanstack/react-query";
import { PlayableBoard } from "@/components/PlayableBoard";
import { UiIcon } from "@/components/UiIcon";
import { Button } from "@/components/ui/button";
import { listEndgameLevels } from "@/lib/game.functions";
import { aiLevel } from "@/lib/local-engine";
import { chooseMove, evaluateDeep } from "@/lib/local-engine";
import { useT } from "@/lib/i18n";

export interface DrillLevel {
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
  depth: number;
  theme_zh: string;
  theme_en: string;
  hint_zh: string;
  hint_en: string;
  explanation_zh?: string;
  explanation_en?: string;
}

type Status = "playing" | "solved" | "failed";

/**
 * 对弈页的残局试炼模式：从残局卡片开局，玩家执先手方，
 * 引擎以深度 4~6 顽强防守，将死即通关，随后进入讲解与复盘。
 */
export function EndgameDrill({ initialCode }: { initialCode?: string | undefined }) {
  const t = useT();
  const levelsQ = useQuery({
    queryKey: ["endgame-levels"],
    queryFn: () => listEndgameLevels() as Promise<DrillLevel[]>,
  });
  const levels = useMemo(() => levelsQ.data ?? [], [levelsQ.data]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [fen, setFen] = useState<string>("8/8/8/8/8/8/8/8 w - - 0 1");
  const [history, setHistory] = useState<string[]>([]);
  const [lastMove, setLastMove] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Status>("playing");
  const [thinking, setThinking] = useState(false);

  const active = levels.find((l) => l.id === activeId) ?? null;
  const mySide = useMemo(() => (active ? (active.fen.split(" ")[1] === "b" ? "b" : "w") : "w"), [active]);

  const load = useCallback((level: DrillLevel) => {
    setActiveId(level.id);
    setFen(level.fen);
    setHistory([]);
    setLastMove(undefined);
    setStatus("playing");
    setThinking(false);
  }, []);

  useEffect(() => {
    if (activeId !== null || !levels.length) return;
    const byCode = initialCode ? levels.find((l) => l.code === initialCode) : undefined;
    load(byCode ?? levels[0]!);
  }, [levels, activeId, initialCode, load]);

  const settle = useCallback((board: Chess, side: "w" | "b") => {
    if (board.isCheckmate()) {
      setStatus(board.turn() === side ? "failed" : "solved");
      return true;
    }
    if (board.isDraw() || board.isStalemate()) {
      setStatus("failed");
      return true;
    }
    return false;
  }, []);

  const onMove = useCallback(
    (uci: string) => {
      if (!active || status !== "playing" || thinking) return;
      const board = new Chess(fen);
      const promotion = uci[4];
      try {
        board.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), ...(promotion ? { promotion } : {}) });
      } catch {
        return;
      }
      const san = board.history().at(-1) ?? uci;
      setFen(board.fen());
      setHistory((h) => [...h, san]);
      setLastMove(uci);
      if (settle(board, mySide)) return;

      setThinking(true);
      window.setTimeout(() => {
        const reply = chooseMove(board.fen(), aiLevel("master"));
        if (!reply) {
          setThinking(false);
          settle(board, mySide);
          return;
        }
        board.move(reply.san);
        setFen(board.fen());
        setHistory((h) => [...h, reply.san]);
        setLastMove(reply.uci);
        setThinking(false);
        settle(board, mySide);
      }, 260);
    },
    [active, fen, mySide, status, thinking, settle],
  );

  const myMoves = Math.ceil(history.length / 2);

  return (
    <section className="battle-core-width grid gap-space-sm" aria-label={t("残局试炼模式", "Endgame drill mode")}>
      <div className="flex gap-1 overflow-x-auto">
        {levels.map((l) => (
          <Button
            key={l.id}
            type="button"
            variant="ghost"
            onClick={() => load(l)}
            className={`h-11 shrink-0 rounded-none px-3 font-label-sm text-label-sm ${
              l.id === activeId ? "bg-secondary text-on-secondary" : "bg-surface-container text-on-surface-variant"
            }`}
          >
            <span className="cjk">{t(l.name_zh, l.name_en)}</span>
          </Button>
        ))}
      </div>

      {active && (
        <>
          <div className="bg-surface-container-low p-space-sm gold-hairline">
            <p className="cjk font-label-sm text-label-sm text-primary">{t(active.objective_zh, active.objective_en)}</p>
            <h2 className="cjk font-headline-sm text-headline-sm">{t(active.name_zh, active.name_en)}</h2>
            <p className="cjk mt-1 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {t(active.brief_zh, active.brief_en)}
            </p>
            <p className="cjk mt-1 font-body-sm text-body-sm text-secondary">
              {t(`目标 ${active.moves_to_mate} 步内将死 · 计算深度 ${active.depth}`, `Mate in ${active.moves_to_mate} · depth ${active.depth}`)}
            </p>
          </div>

          <PlayableBoard fen={fen} lastMove={lastMove} disabled={status !== "playing" || thinking} onMove={onMove} />

          <div className="bg-surface-container p-space-sm flex items-center justify-between gap-space-sm gold-hairline">
            <p className="cjk font-label-md text-label-md">
              {status === "solved"
                ? t("将死成功，试炼通关。", "Checkmate — trial cleared.")
                : status === "failed"
                  ? t("本次未能将死，重开再算一次。", "No mate this time. Reset and recalculate.")
                  : thinking
                    ? t("对方正在防守…", "Defence is calculating…")
                    : t("轮到你落子", "Your move")}
            </p>
            <span className="font-label-sm text-label-sm tabular-nums text-on-surface-variant shrink-0">
              {t(`已走 ${myMoves} 步`, `${myMoves} moves`)}
            </span>
          </div>

          {history.length > 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant break-words">{history.join(" ")}</p>
          )}

          {status !== "playing" && (
            <div className="bg-surface-container-low p-space-md grid gap-2 gold-hairline">
              {status === "solved" && (active.explanation_zh || active.hint_zh) && (
                <p className="cjk font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {t(active.explanation_zh || active.hint_zh, active.explanation_en || active.hint_en)}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => load(active)} className="h-11 rounded-none bg-surface-container text-on-surface">
                  <UiIcon name="spinner" className="h-5 w-5" />
                  <span className="cjk">{t("重新挑战", "Retry")}</span>
                </Button>
                <Link
                  to="/analysis"
                  className="cjk flex h-11 items-center gap-2 bg-primary-container px-3 text-on-primary-container font-label-sm text-label-sm"
                >
                  <UiIcon name="quill" className="h-5 w-5" />
                  {t("进入复盘讲解", "Open review")}
                </Link>
                <Link
                  to="/crucible"
                  className="cjk flex h-11 items-center px-3 text-secondary font-label-sm text-label-sm"
                >
                  {t("盲视心算版 →", "Blindfold version →")}
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
