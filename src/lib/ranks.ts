/**
 * lib/ranks.ts — 段位的「表现层」包装。
 *
 * 阶梯本身（分界线、称号、文案、rankOf/nextRank）在 src/core/ranks.ts，
 * 这里只补图标与配色等界面字段。上层页面继续从本文件导入，签名不变。
 */

import type { GameIconName } from "@/components/GameIcon";
import type { UiIconName } from "@/components/UiIcon";
import {
  RANK_TIERS_CORE,
  rankOfCore,
  nextRankCore,
  type RankId,
  type RankTierCore,
} from "@/core/ranks";

export { RANK_DISCLAIMER, RANK_TAGLINE } from "@/core/ranks";
export type { RankId } from "@/core/ranks";

export interface RankTier extends RankTierCore {
  icon: UiIconName;
  art: GameIconName;
  accent: string;
}

const PRESENTATION: Record<RankId, { icon: UiIconName; art: GameIconName; accent: string }> = {
  king: { icon: "crown", art: "rank-sovereign", accent: "from-primary/70 via-primary/20 to-transparent" },
  queen: { icon: "medal-star", art: "rank-apex", accent: "from-secondary/60 via-secondary/15 to-transparent" },
  rook: { icon: "medal-laurel", art: "rank-grandmaster", accent: "from-secondary/45 via-secondary/10 to-transparent" },
  bishop: { icon: "badge-hex", art: "rank-master", accent: "from-on-surface/25 via-on-surface/8 to-transparent" },
  knight: { icon: "shield", art: "rank-knight", accent: "from-on-surface/18 via-on-surface/6 to-transparent" },
  pawn: { icon: "pawn-up", art: "rank-knight", accent: "from-on-surface/12 via-on-surface/4 to-transparent" },
};

/** 由高到低排列，与数据库分界线 {1200,1600,2000,2200,2500} 一致。 */
export const RANK_TIERS: RankTier[] = RANK_TIERS_CORE.map((tier) => ({ ...tier, ...PRESENTATION[tier.id] }));

const byId = (id: RankId): RankTier => RANK_TIERS.find((t) => t.id === id)!;

/** 当前段位 */
export function rankOf(elo: number): RankTier {
  return byId(rankOfCore(elo).id);
}

/** 下一段位（已在最高段返回 null） */
export function nextRank(elo: number): RankTier | null {
  const next = nextRankCore(elo);
  return next ? byId(next.id) : null;
}
