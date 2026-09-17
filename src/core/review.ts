/**
 * core/review.ts — 逐手复盘评估（ACPL / 失误标记 / 准确率）
 *
 * 算法（军师交付口径）：每手做两轮搜索，走子前的最佳收益减去走子后的实际收益即该手损失。
 *   loss ≤30 最佳 | ≤90 良好 | ≤200 一般 | ≤400 失误 | >400 大漏着
 *   ACPL = 全局平均 loss（厘兵）；准确率 = 103.1668 × exp(-0.04354 × ACPL/100) - 3.1668（Lichess，兵为单位）
 *
 * 批量搜索必须走 Worker：一局 80 手 × 2 轮，主线程会假死。
 * 未拿到 Worker 时按批让出主线程，并通过 onProgress 回报进度。
 * 纯计算：不含 React、不含 DOM。
 */
import { getEngine } from "./engine";
import { applyMove, START_FEN, type Color } from "./rules";

export type ReviewTag = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

export interface ReviewedMove {
  ply: number;
  san: string;
  uci: string;
  by: Color;
  fen: string;
  /** 白方视角厘兵 */
  cp: number;
  /** 该手损失（厘兵，≥0） */
  loss: number;
  bestUci: string;
  tag: ReviewTag;
}

export interface ReviewSummary {
  moves: ReviewedMove[];
  acpl: { w: number; b: number; all: number };
  accuracy: { w: number; b: number };
}

export const REVIEW_DEPTH = 5;
export const REVIEW_MOVETIME_MS = 600;
/** 主线程降级时，每算这么多手让出一次渲染帧 */
const YIELD_EVERY = 2;

export function tagForLoss(loss: number): ReviewTag {
  if (loss <= 30) return "best";
  if (loss <= 90) return "good";
  if (loss <= 200) return "inaccuracy";
  if (loss <= 400) return "mistake";
  return "blunder";
}

/** 入参为「厘兵」ACPL；Lichess 公式以「兵」为单位，因此先除以 100。 */
export function accuracyFromAcpl(acpl: number): number {
  const pawns = Math.max(0, acpl) / 100;
  const v = 103.1668 * Math.exp(-0.04354 * pawns) - 3.1668;
  return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
}

const yieldFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

export interface ReviewOptions {
  startFen?: string;
  depth?: number;
  onProgress?: (done: number, total: number) => void;
  signal?: { aborted: boolean };
}

/** 对一局 UCI 序列做逐手评估。 */
export async function reviewGame(uciLine: string[], options: ReviewOptions = {}): Promise<ReviewSummary> {
  const engine = getEngine();
  const depth = options.depth ?? REVIEW_DEPTH;
  const opts = { depth, movetimeMs: REVIEW_MOVETIME_MS, skill: 20 };
  const total = uciLine.length;
  const moves: ReviewedMove[] = [];
  let fen = options.startFen ?? START_FEN;

  for (let i = 0; i < total; i++) {
    if (options.signal?.aborted) break;
    const uci = uciLine[i]!;
    // ① 走子前：引擎在此局面的最佳评分（当前行棋方视角）
    const best = await engine.think(fen, opts);
    const applied = applyMove(fen, uci);
    if (!applied) break;
    // ② 走子后：从对手视角再搜一次
    const after = await engine.think(applied.fen, opts);
    const loss = Math.max(0, Math.round(best.cp - -after.cp));
    const cpWhite = applied.by === "w" ? -after.cp : after.cp;

    moves.push({
      ply: i + 1,
      san: applied.san,
      uci: applied.uci,
      by: applied.by,
      fen: applied.fen,
      cp: Math.max(-2000, Math.min(2000, Math.round(cpWhite))),
      loss,
      bestUci: best.uci,
      // Classification is derived from centipawn loss only. Equal-score engine
      // candidates can vary in order, but must never change the review label.
      tag: tagForLoss(loss),
    });

    fen = applied.fen;
    options.onProgress?.(i + 1, total);
    if (!engine.offloaded && (i + 1) % YIELD_EVERY === 0) await yieldFrame();
  }

  return { moves, acpl: acplOf(moves), accuracy: accuracyOf(moves) };
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function acplOf(moves: ReviewedMove[]) {
  const w = mean(moves.filter((m) => m.by === "w").map((m) => m.loss));
  const b = mean(moves.filter((m) => m.by === "b").map((m) => m.loss));
  return { w, b, all: mean(moves.map((m) => m.loss)) };
}

export function accuracyOf(moves: ReviewedMove[]) {
  const a = acplOf(moves);
  return { w: accuracyFromAcpl(a.w), b: accuracyFromAcpl(a.b) };
}
