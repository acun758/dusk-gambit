/**
 * core/settle.ts — 结算的显示计算
 *
 * 红线：本文件只做**预显示**。
 * 胜负判定、积分升降、段位变更的唯一权威在服务端
 * （settle_ranked_match / apply_match_result）。
 * 前端算出的结果仅用于即时反馈，落库一律以服务端返回为准。
 * 谁把判负或积分写入逻辑搬进前端，就是给刷分开门。
 * 纯计算：不含 React、不含 DOM、不含网络请求。
 */
import { statusOf, type Color } from "./rules";

export type Outcome = "white" | "black" | "draw";
export type EndReason = "mate" | "resign" | "timeout" | "draw" | "abort";

export interface OutcomePreview {
  outcome: Outcome;
  reason: EndReason;
}

/** 从局面推断终局（仅显示用）。未终局返回 null。 */
export function outcomeFromPosition(fen: string): OutcomePreview | null {
  const s = statusOf(fen);
  if (s.checkmate) return { outcome: s.turn === "w" ? "black" : "white", reason: "mate" };
  if (s.stalemate || s.draw) return { outcome: "draw", reason: "draw" };
  return null;
}

export function outcomeAfterResign(resigning: Color): OutcomePreview {
  return { outcome: resigning === "w" ? "black" : "white", reason: "resign" };
}

/** 超时同样只是预显示：真正的超时判负由服务端时钟裁定。 */
export function outcomeAfterFlag(flagged: Color): OutcomePreview {
  return { outcome: flagged === "w" ? "black" : "white", reason: "timeout" };
}

export function scoreFor(you: Color, outcome: Outcome): 0 | 0.5 | 1 {
  if (outcome === "draw") return 0.5;
  return outcome === (you === "w" ? "white" : "black") ? 1 : 0;
}

/** 与服务端 rank_k 一致的显示口径；真实结算仍以服务端返回的 delta 为准。 */
export function previewKFactor(elo: number): number {
  if (elo >= 2500) return 16;
  if (elo >= 2200) return 24;
  return 32;
}

/** 预计积分变化，仅供"预计 +8"这类提示，不写入任何存储。 */
export function previewRatingDelta(yourElo: number, oppElo: number, score: 0 | 0.5 | 1): number {
  const expected = 1 / (1 + Math.pow(10, (oppElo - yourElo) / 400));
  return Math.round(previewKFactor(yourElo) * (score - expected));
}
