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
import stellarPawn from "@/assets/chess-next/optimized/stellar-p.webp";
import stellarKnight from "@/assets/chess-next/optimized/stellar-n.webp";
import stellarBishop from "@/assets/chess-next/optimized/stellar-b.webp";
import stellarRook from "@/assets/chess-next/optimized/stellar-r.webp";
import stellarQueen from "@/assets/chess-next/optimized/stellar-q.webp";
import stellarKing from "@/assets/chess-next/optimized/stellar-k.webp";
import stellarNightPawn from "@/assets/chess-next/optimized/stellar-night-p.webp";
import stellarNightKnight from "@/assets/chess-next/optimized/stellar-night-n.webp";
import stellarNightBishop from "@/assets/chess-next/optimized/stellar-night-b.webp";
import stellarNightRook from "@/assets/chess-next/optimized/stellar-night-r.webp";
import stellarNightQueen from "@/assets/chess-next/optimized/stellar-night-q.webp";
import stellarNightKing from "@/assets/chess-next/optimized/stellar-night-k.webp";
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

/**
 * 星钻圣辉：水晶黄金原版（白方）+ 由原版衍生的夜幕蓝钻变体（黑方），
 * 均为 512×512 透明 WebP。
 */
export const STELLAR_PIECE_ASSETS: Record<string, string> = {
  wp: stellarPawn,
  wn: stellarKnight,
  wb: stellarBishop,
  wr: stellarRook,
  wq: stellarQueen,
  wk: stellarKing,
  bp: stellarNightPawn,
  bn: stellarNightKnight,
  bb: stellarNightBishop,
  br: stellarNightRook,
  bq: stellarNightQueen,
  bk: stellarNightKing,
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