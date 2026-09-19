import platinumPawn from "@/assets/chess-next/optimized/platinum-p.webp";
import platinumKnight from "@/assets/chess-next/optimized/platinum-n.webp";
import platinumBishop from "@/assets/chess-next/optimized/platinum-b.webp";
import platinumRook from "@/assets/chess-next/optimized/platinum-r.webp";
import platinumQueen from "@/assets/chess-next/optimized/platinum-q.webp";
import platinumKing from "@/assets/chess-next/optimized/platinum-k.webp";
import obsidianPawn from "@/assets/chess-next/optimized/obsidian-p.webp";
import obsidianKnight from "@/assets/chess-next/optimized/obsidian-n.webp";
import obsidianBishop from "@/assets/chess-next/optimized/obsidian-b.webp";
import obsidianRook from "@/assets/chess-next/optimized/obsidian-r.webp";
import obsidianQueen from "@/assets/chess-next/optimized/obsidian-q.webp";
import obsidianKing from "@/assets/chess-next/optimized/obsidian-k.webp";
import abyssalWhitePawn from "@/assets/chess/abyssal-legacy/abyssal-wp.webp.asset.json";
import abyssalWhiteKnight from "@/assets/chess/abyssal-legacy/abyssal-wn.webp.asset.json";
import abyssalWhiteBishop from "@/assets/chess/abyssal-legacy/abyssal-wb.webp.asset.json";
import abyssalWhiteRook from "@/assets/chess/abyssal-legacy/abyssal-wr.webp.asset.json";
import abyssalWhiteQueen from "@/assets/chess/abyssal-legacy/abyssal-wq.webp.asset.json";
import abyssalWhiteKing from "@/assets/chess/abyssal-legacy/abyssal-wk.webp.asset.json";
import abyssalBlackPawn from "@/assets/chess/abyssal-legacy/abyssal-bp.webp.asset.json";
import abyssalBlackKnight from "@/assets/chess/abyssal-legacy/abyssal-bn.webp.asset.json";
import abyssalBlackBishop from "@/assets/chess/abyssal-legacy/abyssal-bb.webp.asset.json";
import abyssalBlackRook from "@/assets/chess/abyssal-legacy/abyssal-br.webp.asset.json";
import abyssalBlackQueen from "@/assets/chess/abyssal-legacy/abyssal-bq.webp.asset.json";
import abyssalBlackKing from "@/assets/chess/abyssal-legacy/abyssal-bk.webp.asset.json";
import demonWhitePawnAsset from "@/assets/chess/demon-gold/demon-wp.webp";
import demonWhiteKnightAsset from "@/assets/chess/demon-gold/demon-wn.webp";
import demonWhiteBishopAsset from "@/assets/chess/demon-gold/demon-wb.webp";
import demonWhiteRookAsset from "@/assets/chess/demon-gold/demon-wr.webp";
import demonWhiteQueenAsset from "@/assets/chess/demon-gold/demon-wq.webp";
import demonWhiteKingAsset from "@/assets/chess/demon-gold/demon-wk.webp";
import demonBlackPawnAsset from "@/assets/chess/demon-gold/demon-bp.webp";
import demonBlackKnightAsset from "@/assets/chess/demon-gold/demon-bn.webp";
import demonBlackBishopAsset from "@/assets/chess/demon-gold/demon-bb.webp";
import demonBlackRookAsset from "@/assets/chess/demon-gold/demon-br.webp";
import demonBlackQueenAsset from "@/assets/chess/demon-gold/demon-bq.webp";
import demonBlackKingAsset from "@/assets/chess/demon-gold/demon-bk.webp";
import darkDragonWhitePawnAsset from "@/assets/chess/dark-dragon/dark-dragon-wp.webp";
import darkDragonWhiteKnightAsset from "@/assets/chess/dark-dragon/dark-dragon-wn.webp";
import darkDragonWhiteBishopAsset from "@/assets/chess/dark-dragon/dark-dragon-wb.webp";
import darkDragonWhiteRookAsset from "@/assets/chess/dark-dragon/dark-dragon-wr.webp";
import darkDragonWhiteQueenAsset from "@/assets/chess/dark-dragon/dark-dragon-wq.webp";
import darkDragonWhiteKingAsset from "@/assets/chess/dark-dragon/dark-dragon-wk.webp";
import darkDragonBlackPawnAsset from "@/assets/chess/dark-dragon/dark-dragon-bp.webp";
import darkDragonBlackKnightAsset from "@/assets/chess/dark-dragon/dark-dragon-bn.webp";
import darkDragonBlackBishopAsset from "@/assets/chess/dark-dragon/dark-dragon-bb.webp";
import darkDragonBlackRookAsset from "@/assets/chess/dark-dragon/dark-dragon-br.webp";
import darkDragonBlackQueenAsset from "@/assets/chess/dark-dragon/dark-dragon-bq.webp";
import darkDragonBlackKingAsset from "@/assets/chess/dark-dragon/dark-dragon-bk.webp";

export const CHESS_PIECE_ASSETS: Record<string, string> = {
  wp: platinumPawn,
  wn: platinumKnight,
  wb: platinumBishop,
  wr: platinumRook,
  wq: platinumQueen,
  wk: platinumKing,
  bp: obsidianPawn,
  bn: obsidianKnight,
  bb: obsidianBishop,
  br: obsidianRook,
  bq: obsidianQueen,
  bk: obsidianKing,
};

/** 深渊遗族：古金翠玉（白方）+ 黑银幽绿（黑方）。 */
export const ABYSSAL_LEGACY_PIECE_ASSETS: Record<string, string> = {
  wp: abyssalWhitePawn.url,
  wn: abyssalWhiteKnight.url,
  wb: abyssalWhiteBishop.url,
  wr: abyssalWhiteRook.url,
  wq: abyssalWhiteQueen.url,
  wk: abyssalWhiteKing.url,
  bp: abyssalBlackPawn.url,
  bn: abyssalBlackKnight.url,
  bb: abyssalBlackBishop.url,
  br: abyssalBlackRook.url,
  bq: abyssalBlackQueen.url,
  bk: abyssalBlackKing.url,
};

/** 魔皇古金：祖母绿古金原版（白方）+ 暗红黑金变体（黑方）。 */
export const DEMON_GOLD_PIECE_ASSETS: Record<string, string> = {
  wp: demonWhitePawnAsset,
  wn: demonWhiteKnightAsset,
  wb: demonWhiteBishopAsset,
  wr: demonWhiteRookAsset,
  wq: demonWhiteQueenAsset,
  wk: demonWhiteKingAsset,
  bp: demonBlackPawnAsset,
  bn: demonBlackKnightAsset,
  bb: demonBlackBishopAsset,
  br: demonBlackRookAsset,
  bq: demonBlackQueenAsset,
  bk: demonBlackKingAsset,
};

/** 暗黑龙语：冷银龙铠（白方）+ 暗黑龙甲原色（黑方）。 */
export const DARK_DRAGON_PIECE_ASSETS: Record<string, string> = {
  wp: darkDragonWhitePawnAsset,
  wn: darkDragonWhiteKnightAsset,
  wb: darkDragonWhiteBishopAsset,
  wr: darkDragonWhiteRookAsset,
  wq: darkDragonWhiteQueenAsset,
  wk: darkDragonWhiteKingAsset,
  bp: darkDragonBlackPawnAsset,
  bn: darkDragonBlackKnightAsset,
  bb: darkDragonBlackBishopAsset,
  br: darkDragonBlackRookAsset,
  bq: darkDragonBlackQueenAsset,
  bk: darkDragonBlackKingAsset,
};