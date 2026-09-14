/**
 * 残局试炼难度分级：按计算深度分成三级，
 * 上一级通关达到要求胜率（默认 60%）后自动解锁下一级，形成成长路径。
 */

export interface EndgameTier {
  id: "novice" | "adept" | "master";
  zh: string;
  en: string;
  minDepth: number;
  maxDepth: number;
}

export const ENDGAME_TIERS: EndgameTier[] = [
  { id: "novice", zh: "入门试炼", en: "Novice Trials", minDepth: 0, maxDepth: 2 },
  { id: "adept", zh: "进阶试炼", en: "Adept Trials", minDepth: 3, maxDepth: 4 },
  { id: "master", zh: "精通试炼", en: "Master Trials", minDepth: 5, maxDepth: 99 },
];

/** 解锁下一级所需的通关比例 */
export const UNLOCK_RATE = 0.6;

export function tierOfDepth(depth: number): EndgameTier {
  return ENDGAME_TIERS.find((t) => depth >= t.minDepth && depth <= t.maxDepth) ?? ENDGAME_TIERS[0]!;
}

export interface TierGroup<L> {
  tier: EndgameTier;
  levels: L[];
  solved: number;
  total: number;
  /** 解锁下一级还需通关的关数 */
  needed: number;
  unlocked: boolean;
}

/** 按难度分组，并按「上一级通关率」决定每一级是否解锁。 */
export function groupByTier<L extends { id: number; depth: number }>(
  levels: L[],
  solvedIds: Set<number>,
): TierGroup<L>[] {
  let previousUnlocked = true;
  return ENDGAME_TIERS.map((tier) => {
    const inTier = levels.filter((l) => tierOfDepth(l.depth).id === tier.id);
    const solved = inTier.filter((l) => solvedIds.has(l.id)).length;
    const total = inTier.length;
    const required = total === 0 ? 0 : Math.max(1, Math.ceil(total * UNLOCK_RATE));
    const unlocked = previousUnlocked;
    previousUnlocked = unlocked && (total === 0 || solved >= required);
    return { tier, levels: inTier, solved, total, needed: Math.max(0, required - solved), unlocked };
  }).filter((g) => g.total > 0);
}
