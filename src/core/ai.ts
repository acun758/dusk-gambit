/**
 * core/ai.ts — 陪练 AI 分级
 *
 * 强度通过引擎的 skill（0~20，最优解邻域内的受控失误）实现，不是随机乱走。
 * 单次搜索 ≤600ms，走主线程同步路径；批量搜索（复盘）一律走 core/review.ts 的 Worker 路径。
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
}

export const AI_LEVELS: AiLevel[] = [
  { id: "novice", elo: 1000, name: "Novice", zh: "习棋者", desc: "会基本吃子，常有漏着，适合刚入门", depth: 3, skill: 4 },
  { id: "club", elo: 1400, name: "Club", zh: "棋社客", desc: "懂战术组合，偶尔失算", depth: 4, skill: 9 },
  { id: "expert", elo: 1800, name: "Expert", zh: "行家", desc: "少有明显失误，会惩罚你的松手", depth: 5, skill: 14 },
  { id: "master", elo: 2200, name: "Master", zh: "大师", desc: "稳健深算，适合考验计算力", depth: 5, skill: 20 },
];

export const MAX_MOVETIME_MS = 600;

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

/** 单次陪练落子（≤600ms，主线程同步）。 */
export function chooseMove(fen: string, level: AiLevel): EngineChoice | null {
  const r = getEngine().thinkSync(fen, { depth: level.depth, movetimeMs: MAX_MOVETIME_MS, skill: level.skill });
  if (!r.uci) return null;
  const applied = applyMove(fen, r.uci);
  if (!applied) return null;
  return { uci: applied.uci, san: applied.san, cp: clampCp(toWhitePov(r.cp, fen)) };
}

/** 单点局面评分（白方视角厘兵），用于走子后的即时评估条。 */
export function evaluatePosition(fen: string, depth = 3): number {
  const r = getEngine().thinkSync(fen, { depth, movetimeMs: MAX_MOVETIME_MS, skill: 20 });
  return clampCp(toWhitePov(r.cp, fen));
}

export function clampCp(cp: number): number {
  return Math.max(-2000, Math.min(2000, Math.round(cp)));
}
