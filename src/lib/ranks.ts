/**
 * lib/ranks.ts — 全站唯一的段位阶梯定义（棋子阶梯：兵 → 王）
 *
 * 纯数据 + 纯函数，不含 React / DOM，服务端与客户端共用。
 * 分数分界线必须与数据库 rank_floor() / rank_next_floor() 完全一致。
 *
 * 合规：本平台自建等级，「参考水平」仅为水平类比，非官方授予。
 */

import type { GameIconName } from "@/components/GameIcon";
import type { UiIconName } from "@/components/UiIcon";

export interface RankTier {
  /** 稳定标识 */
  id: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
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
  icon: UiIconName;
  art: GameIconName;
  accent: string;
}

/** 由高到低排列，与数据库分界线 {1200,1600,2000,2200,2500} 一致。 */
export const RANK_TIERS: RankTier[] = [
  {
    id: "king",
    floor: 2500,
    ceil: 3000,
    zh: "王",
    en: "King",
    personaZh: "意志",
    personaEn: "Will",
    referenceZh: "职业水准",
    referenceEn: "Professional level",
    icon: "crown",
    art: "rank-sovereign",
    accent: "from-primary/70 via-primary/20 to-transparent",
  },
  {
    id: "queen",
    floor: 2200,
    ceil: 2500,
    zh: "后",
    en: "Queen",
    personaZh: "蜕变",
    personaEn: "Rise",
    referenceZh: "棋协大师线附近",
    referenceEn: "Around national master level",
    icon: "medal-star",
    art: "rank-apex",
    accent: "from-secondary/60 via-secondary/15 to-transparent",
  },
  {
    id: "rook",
    floor: 2000,
    ceil: 2200,
    zh: "车",
    en: "Rook",
    personaZh: "烈焰",
    personaEn: "Flame",
    referenceZh: "业余强手",
    referenceEn: "Strong amateur",
    icon: "medal-laurel",
    art: "rank-grandmaster",
    accent: "from-secondary/45 via-secondary/10 to-transparent",
  },
  {
    id: "bishop",
    floor: 1600,
    ceil: 2000,
    zh: "象",
    en: "Bishop",
    personaZh: "专注",
    personaEn: "Focus",
    referenceZh: "业余中级",
    referenceEn: "Intermediate amateur",
    icon: "badge-hex",
    art: "rank-master",
    accent: "from-on-surface/25 via-on-surface/8 to-transparent",
  },
  {
    id: "knight",
    floor: 1200,
    ceil: 1600,
    zh: "马",
    en: "Knight",
    personaZh: "掌控",
    personaEn: "Control",
    referenceZh: "业余初级",
    referenceEn: "Beginner amateur",
    icon: "shield",
    art: "rank-knight",
    accent: "from-on-surface/18 via-on-surface/6 to-transparent",
  },
  {
    id: "pawn",
    floor: 0,
    ceil: 1200,
    zh: "兵",
    en: "Pawn",
    personaZh: "自律",
    personaEn: "Discipline",
    referenceZh: "入门棋友",
    referenceEn: "Newcomer",
    icon: "pawn-up",
    art: "rank-knight",
    accent: "from-on-surface/12 via-on-surface/4 to-transparent",
  },
];

/** 当前段位 */
export function rankOf(elo: number): RankTier {
  return RANK_TIERS.find((tier) => elo >= tier.floor) ?? RANK_TIERS[RANK_TIERS.length - 1]!;
}

/** 下一段位（已在最高段返回 null） */
export function nextRank(elo: number): RankTier | null {
  const idx = RANK_TIERS.indexOf(rankOf(elo));
  return idx > 0 ? RANK_TIERS[idx - 1]! : null;
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
