/**
 * core/score.ts — 残局试炼评分与心智指标
 *
 * 只做计算：分数提交后由服务端复算与落库（submitEndgameDrill / record_endgame_result），
 * 前端分数同样只是预显示。
 * 纯计算：不含 React、不含 DOM。
 */
import type { ReviewTag } from "./review";

export interface DrillStep {
  /** 相对走子方的得失（厘兵），负值为损失 */
  swing: number;
}

/** 每 12 厘兵损失扣 1 分，满分 100。 */
export const LOSS_PER_POINT = 12;

export function drillScore(steps: DrillStep[]): number {
  const penalty = steps.reduce((sum, step) => sum + Math.max(0, -step.swing) / LOSS_PER_POINT, 0);
  return Math.max(0, Math.round(100 - penalty));
}

/** 与复盘一致的着法评级口径（残局用 swing，取其绝对损失）。 */
export function tagForSwing(swing: number, matchedBest: boolean): ReviewTag {
  if (matchedBest) return "best";
  const loss = Math.max(0, -swing);
  if (loss <= 30) return "best";
  if (loss <= 90) return "good";
  if (loss <= 200) return "inaccuracy";
  if (loss <= 400) return "mistake";
  return "blunder";
}

export interface MindIndex {
  load: number;
  anxiety: number;
  structure: number;
}

/** 对弈页心智面板的显示指标。 */
export function mindIndex(plyCount: number): MindIndex {
  return {
    load: Math.min(98, 40 + plyCount * 5),
    anxiety: Math.min(96, 18 + plyCount * 6),
    structure: Math.max(38, 74 - plyCount * 2),
  };
}
