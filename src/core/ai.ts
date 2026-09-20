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
  /** 英文描述 */
  descEn: string;
  depth: number;
  /** 引擎技能档位 0~20 */
  skill: number;
  /** 单手时间预算（毫秒），引擎内再次钳制 */
  movetimeMs: number;
}

/**
 * 档位标定（外部锚定，非自对弈）：
 * 脚本 scripts/anchor-benchmark.ts —— 我方各档 × Stockfish 19 lite 限级锚点
 * （Skill 0 / UCI_Elo 1320・1500・1700・1900），每个锚点 20 局快棋，
 * 以 R = R_anchor + 400·log10(W/(1−W)) 反推，取 5 个锚点估计的中位数 ± 半幅。
 *
 * 2026-09-16 重标（旧配置下 expert 与 master 实测重合 1827，已重新拉开档差）：
 *   novice ≈ 1064 ± 412  → 标称 800
 *   club   ≈ 1332 ± 334  → 标称 1200
 *   expert ≈ 1647 ± 291  → 标称 1550
 *   master ≈ 1832 ± 221  → 标称 1750
 * 相邻档实测间距 ≈ 270 / 315 / 185，标称一律取区间保守侧，不虚标。
 */
export const AI_LEVELS: AiLevel[] = [
  { id: "novice", elo: 800, name: "Novice", zh: "习棋者", desc: "会基本吃子，常有漏着，适合刚入门", descEn: "Knows basic captures, blunders often — good for beginners", depth: 2, skill: 2, movetimeMs: 250 },
  { id: "club", elo: 1200, name: "Club", zh: "棋社客", desc: "懂战术组合，偶尔失算", descEn: "Handles tactical patterns, miscalculates now and then", depth: 3, skill: 7, movetimeMs: 350 },
  { id: "expert", elo: 1550, name: "Expert", zh: "行家", desc: "少有明显失误，会惩罚你的松手", descEn: "Few clear mistakes, punishes careless moves", depth: 4, skill: 10, movetimeMs: 400 },
  { id: "master", elo: 1750, name: "Master", zh: "大师", desc: "稳健深算，适合考验计算力", descEn: "Solid and deep — a real calculation test", depth: 10, skill: 20, movetimeMs: 1800 },
];

/** 兼容旧调用；实际预算以各档位 movetimeMs 为准 */
export const MAX_MOVETIME_MS = 2000;

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
