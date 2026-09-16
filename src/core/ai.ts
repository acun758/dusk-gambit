/**
 * core/ai.ts — 陪练 AI 分级
 *
 * 强度通过引擎的 skill（0~20，最优解邻域内的受控失误）实现，不是随机乱走。
 * 单次搜索 ≤600ms，与批量复盘一样走 Worker，主线程只负责界面，不参与搜索。
 * 纯计算：不含 React、不含 DOM。
 */
import { getEngine } from "./engine";
import { applyMove, turnOf } from "./rules";

export type AiLevelId = "novice" | "club" | "expert" | "master";

export interface AiLevel {
  id: AiLevelId;
  elo: number;
  name: string;
  zh: string;
  desc: string;
  depth: number;
  /** 引擎技能档位 0~20 */
  skill: number;
  /** 单手时间预算（毫秒），引擎内再次钳制 */
  movetimeMs: number;
}

/**
 * 档位标定（外部锚定，非自对弈）：
 * 基准脚本 scripts/anchor-benchmark.ts —— 我方各档 × Stockfish 19 lite 限级锚点
 * （Skill Level 0 / UCI_Elo 1320・1500・1700・1900），每对 6 局快棋，
 * 以 R = R_anchor + 400·log10(W/(1−W)) 反推，取 5 个锚点估计值的中位数。
 *
 * 2026-09-16 实测（中位数 ± 半幅）：
 *   novice ≈ 900 ± 290（下沿被 0/6 截断污染，以 Skill0 锚点 809 为准，标称取 900）
 *   club   ≈ 1642 ± 134  → 标称 1450（取保守下沿）
 *   expert ≈ 1820 ± 165  → 标称 1750
 *   master ≈ 1891 ± 406  → 标称 1900（基准里每手被压到 300ms，线上 1000ms 只会更强）
 * 标称值一律取实测区间的保守侧，不虚标。
 */
export const AI_LEVELS: AiLevel[] = [
  { id: "novice", elo: 900, name: "Novice", zh: "习棋者", desc: "会基本吃子，常有漏着，适合刚入门", depth: 3, skill: 4, movetimeMs: 300 },
  { id: "club", elo: 1450, name: "Club", zh: "棋社客", desc: "懂战术组合，偶尔失算", depth: 4, skill: 9, movetimeMs: 450 },
  { id: "expert", elo: 1750, name: "Expert", zh: "行家", desc: "少有明显失误，会惩罚你的松手", depth: 6, skill: 14, movetimeMs: 700 },
  { id: "master", elo: 1900, name: "Master", zh: "大师", desc: "稳健深算，适合考验计算力", depth: 8, skill: 20, movetimeMs: 1000 },
];

/** 兼容旧调用；实际预算以各档位 movetimeMs 为准 */
export const MAX_MOVETIME_MS = 1200;

export function aiLevel(id: AiLevelId): AiLevel {
  return AI_LEVELS.find((l) => l.id === id) ?? AI_LEVELS[1]!;
}

export interface EngineChoice {
  uci: string;
  san: string;
  /** 白方视角厘兵 */
  cp: number;
}

function toWhitePov(cp: number, fen: string): number {
  return turnOf(fen) === "w" ? cp : -cp;
}

/**
 * 单次陪练落子 —— 走 Worker，主线程不参与搜索。
 * 拿不到 Worker 的环境（旧内核 / 小游戏未注入）由 EngineClient 自动降级，
 * 上层调用方式不变。
 */
export async function chooseMove(fen: string, level: AiLevel): Promise<EngineChoice | null> {
  const r = await getEngine().think(fen, { depth: level.depth, movetimeMs: level.movetimeMs, skill: level.skill });
  if (!r.uci) return null;
  const applied = applyMove(fen, r.uci);
  if (!applied) return null;
  return { uci: applied.uci, san: applied.san, cp: clampCp(toWhitePov(r.cp, fen)) };
}

/** 单点局面评分（白方视角厘兵），用于走子后的即时评估条。同样在 Worker 内计算。 */
export async function evaluatePosition(fen: string, depth = 3): Promise<number> {
  const r = await getEngine().think(fen, { depth, movetimeMs: 600, skill: 20 });
  return clampCp(toWhitePov(r.cp, fen));
}

/** 仅供无法等待异步结果的兜底路径（不得用于批量搜索）。 */
export function chooseMoveSync(fen: string, level: AiLevel): EngineChoice | null {
  const r = getEngine().thinkSync(fen, { depth: level.depth, movetimeMs: level.movetimeMs, skill: level.skill });
  if (!r.uci) return null;
  const applied = applyMove(fen, r.uci);
  if (!applied) return null;
  return { uci: applied.uci, san: applied.san, cp: clampCp(toWhitePov(r.cp, fen)) };
}


export function clampCp(cp: number): number {
  return Math.max(-2000, Math.min(2000, Math.round(cp)));
}
