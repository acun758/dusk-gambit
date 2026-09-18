/**
 * core/ranks.ts — 段位阶梯（纯逻辑，零 React / 零 DOM）
 *
 * 分界线 {1200,1600,2000,2200,2500} 必须与数据库 rank_floor() / rank_next_floor() 一致。
 * 图标、配色等表现层字段不在这里，放 src/lib/ranks.ts。
 */

export type RankId = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

export interface RankTierCore {
  id: RankId;
  floor: number;
  ceil: number;
  zh: string;
  en: string;
  /** 棋子人格 */
  personaZh: string;
  personaEn: string;
  /** 参考水平（非官方） */
  referenceZh: string;
  referenceEn: string;
}

/** 由高到低排列 */
export const RANK_TIERS_CORE: RankTierCore[] = [
  { id: "king", floor: 2500, ceil: 3000, zh: "王", en: "King", personaZh: "意志", personaEn: "Will", referenceZh: "职业水准", referenceEn: "Professional level" },
  { id: "queen", floor: 2200, ceil: 2500, zh: "后", en: "Queen", personaZh: "蜕变", personaEn: "Rise", referenceZh: "棋协大师线附近", referenceEn: "Around national master level" },
  { id: "rook", floor: 2000, ceil: 2200, zh: "车", en: "Rook", personaZh: "烈焰", personaEn: "Flame", referenceZh: "业余强手", referenceEn: "Strong amateur" },
  { id: "bishop", floor: 1600, ceil: 2000, zh: "象", en: "Bishop", personaZh: "专注", personaEn: "Focus", referenceZh: "业余中级", referenceEn: "Intermediate amateur" },
  { id: "knight", floor: 1200, ceil: 1600, zh: "马", en: "Knight", personaZh: "掌控", personaEn: "Control", referenceZh: "业余初级", referenceEn: "Beginner amateur" },
  { id: "pawn", floor: 0, ceil: 1200, zh: "兵", en: "Pawn", personaZh: "自律", personaEn: "Discipline", referenceZh: "入门棋友", referenceEn: "Newcomer" },
];

/** 当前段位 */
export function rankOfCore(elo: number): RankTierCore {
  return RANK_TIERS_CORE.find((tier) => elo >= tier.floor) ?? RANK_TIERS_CORE[RANK_TIERS_CORE.length - 1]!;
}

/** 下一段位（已在最高段返回 null） */
export function nextRankCore(elo: number): RankTierCore | null {
  const idx = RANK_TIERS_CORE.indexOf(rankOfCore(elo));
  return idx > 0 ? RANK_TIERS_CORE[idx - 1]! : null;
}

/** 段位称号合规声明：段位详情处必须展示。 */
export const RANK_DISCLAIMER = {
  zh: "本段位为本平台自建等级，与线下棋士等级 / 国际称号的对应仅为水平参考，非官方授予。",
  en: "Tiers are this platform's own ladder. Any comparison to national or international titles is a rough guide only, not an official award.",
};

/** 段位文案钩子 */
export const RANK_TAGLINE = {
  zh: "每个王，都曾是一个兵。",
  en: "Every king was once a pawn.",
};
