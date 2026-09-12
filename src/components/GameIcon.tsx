import arsenalCastle from "@/assets/icons/arsenal-castle.webp";
import matchTarget from "@/assets/icons/match-target.webp";
import mindLotus from "@/assets/icons/mind-lotus.webp";
import rankApex from "@/assets/icons/rank-apex.webp";
import rankGrandmaster from "@/assets/icons/rank-grandmaster.webp";
import rankKnight from "@/assets/icons/rank-knight.webp";
import rankMaster from "@/assets/icons/rank-master.webp";
import rankSovereign from "@/assets/icons/rank-sovereign.webp";
import reviewQuill from "@/assets/icons/review-quill.webp";
import trialFire from "@/assets/icons/trial-fire.webp";
import trialPawn from "@/assets/icons/trial-pawn.webp";
import trialPhoenix from "@/assets/icons/trial-phoenix.webp";

export type GameIconName =
  | "arsenal"
  | "match"
  | "mind"
  | "rank-apex"
  | "rank-grandmaster"
  | "rank-knight"
  | "rank-master"
  | "rank-sovereign"
  | "review"
  | "trial-fire"
  | "trial-pawn"
  | "trial-phoenix";

const ICONS: Record<GameIconName, string> = {
  arsenal: arsenalCastle,
  match: matchTarget,
  mind: mindLotus,
  "rank-apex": rankApex,
  "rank-grandmaster": rankGrandmaster,
  "rank-knight": rankKnight,
  "rank-master": rankMaster,
  "rank-sovereign": rankSovereign,
  review: reviewQuill,
  "trial-fire": trialFire,
  "trial-pawn": trialPawn,
  "trial-phoenix": trialPhoenix,
};

export function GameIcon({ name, className = "h-6 w-6" }: { name: GameIconName; className?: string }) {
  return <img src={ICONS[name]} alt="" aria-hidden="true" className={`game-icon ${className}`} />;
}