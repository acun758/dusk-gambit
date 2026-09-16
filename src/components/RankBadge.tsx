import bishopAsset from "@/assets/ranks/rank-bishop.webp.asset.json";
import kingAsset from "@/assets/ranks/rank-king.webp.asset.json";
import knightAsset from "@/assets/ranks/rank-knight.webp.asset.json";
import pawnAsset from "@/assets/ranks/rank-pawn.webp.asset.json";
import queenAsset from "@/assets/ranks/rank-queen.webp.asset.json";
import rookAsset from "@/assets/ranks/rank-rook.webp.asset.json";
import type { RankTier } from "@/lib/ranks";

type RankId = RankTier["id"];

const BADGES: Record<RankId, string> = {
  pawn: pawnAsset.url,
  knight: knightAsset.url,
  bishop: bishopAsset.url,
  rook: rookAsset.url,
  queen: queenAsset.url,
  king: kingAsset.url,
};

export function RankBadge({
  rank,
  className = "h-12 w-12",
  label,
}: {
  rank: RankId;
  className?: string;
  label?: string;
}) {
  return (
    <img
      src={BADGES[rank]}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      decoding="async"
      className={`object-contain ${className}`}
    />
  );
}