import { Chess, type Move } from "chess.js";

/** 本地分级陪练引擎：极小极大 + alpha-beta，深度与随机性按段位分级。 */

export type AiLevelId = "novice" | "club" | "expert" | "master";

export interface AiLevel {
  id: AiLevelId;
  elo: number;
  name: string;
  zh: string;
  desc: string;
  depth: number;
  /** 随机扰动（厘兵），越大越像人类失误 */
  noise: number;
  /** 直接走次优着的概率 */
  blunder: number;
}

export const AI_LEVELS: AiLevel[] = [
  { id: "novice", elo: 1000, name: "Novice", zh: "习棋者", desc: "会基本吃子，常有漏着，适合刚入门", depth: 1, noise: 220, blunder: 0.35 },
  { id: "club", elo: 1400, name: "Club", zh: "棋社客", desc: "懂战术组合，偶尔失算", depth: 2, noise: 110, blunder: 0.18 },
  { id: "expert", elo: 1800, name: "Expert", zh: "行家", desc: "少有明显失误，会惩罚你的松手", depth: 3, noise: 45, blunder: 0.06 },
  { id: "master", elo: 2200, name: "Master", zh: "大师", desc: "稳健深算，适合考验计算力", depth: 4, noise: 12, blunder: 0 },
];

export function aiLevel(id: AiLevelId): AiLevel {
  return AI_LEVELS.find((l) => l.id === id) ?? AI_LEVELS[1]!;
}

const VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// 简化版位置表：鼓励控中、出子与兵推进
const PAWN = [
  0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
];
const KNIGHT = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50,
];
const CENTER = [
  -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20,
];

function tableFor(type: string): number[] | null {
  if (type === "p") return PAWN;
  if (type === "n") return KNIGHT;
  if (type === "b" || type === "q" || type === "k") return CENTER;
  return null;
}

/** 从白方视角评估局面（厘兵）。 */
export function evaluate(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate()) return 0;
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r]?.[f];
      if (!piece) continue;
      const idx = r * 8 + f;
      const table = tableFor(piece.type);
      const positional = table ? (piece.color === "w" ? table[idx]! : table[(7 - r) * 8 + f]!) : 0;
      const value = VALUE[piece.type]! + positional;
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

function search(chess: Chess, depth: number, alpha: number, beta: number): number {
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);
  const maximizing = chess.turn() === "w";
  const moves = ordered(chess);
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    chess.move(move.san);
    const score = search(chess, depth - 1, alpha, beta);
    chess.undo();
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function ordered(chess: Chess): Move[] {
  return chess
    .moves({ verbose: true })
    .sort((a, b) => scoreHint(b) - scoreHint(a));
}

function scoreHint(move: Move): number {
  let s = 0;
  if (move.captured) s += VALUE[move.captured]! - VALUE[move.piece]! / 10;
  if (move.promotion) s += 800;
  if (move.san.includes("+")) s += 40;
  return s;
}

export interface EngineChoice {
  uci: string;
  san: string;
  cp: number;
}

/** 为当前走子方挑选一步棋，返回 UCI、SAN 与白方视角评分。 */
export function chooseMove(fen: string, level: AiLevel): EngineChoice | null {
  let chess: Chess;
  try {
    chess = new Chess(fen);
  } catch {
    return null;
  }
  const moves = ordered(chess);
  if (!moves.length) return null;

  const maximizing = chess.turn() === "w";
  const scored = moves.map((move) => {
    chess.move(move.san);
    const raw = search(chess, level.depth - 1, -Infinity, Infinity);
    chess.undo();
    const jitter = level.noise ? (Math.random() * 2 - 1) * level.noise : 0;
    return { move, raw, score: raw + (maximizing ? jitter : -jitter) };
  });

  scored.sort((a, b) => (maximizing ? b.score - a.score : a.score - b.score));
  const pickIndex = level.blunder && scored.length > 1 && Math.random() < level.blunder ? 1 : 0;
  const picked = scored[pickIndex] ?? scored[0]!;
  return {
    uci: `${picked.move.from}${picked.move.to}${picked.move.promotion ?? ""}`,
    san: picked.move.san,
    cp: Math.max(-2000, Math.min(2000, Math.round(picked.raw))),
  };
}
