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
import demonWhitePawnAsset from "@/assets/chess/demon-gold/demon-wp.webp.asset.json";
import demonWhiteKnightAsset from "@/assets/chess/demon-gold/demon-wn.webp.asset.json";
import demonWhiteBishopAsset from "@/assets/chess/demon-gold/demon-wb.webp.asset.json";
import demonWhiteRookAsset from "@/assets/chess/demon-gold/demon-wr.webp.asset.json";
import demonWhiteQueenAsset from "@/assets/chess/demon-gold/demon-wq.webp.asset.json";
import demonWhiteKingAsset from "@/assets/chess/demon-gold/demon-wk.webp.asset.json";
import demonBlackPawnAsset from "@/assets/chess/demon-gold/demon-bp.webp.asset.json";
import demonBlackKnightAsset from "@/assets/chess/demon-gold/demon-bn.webp.asset.json";
import demonBlackBishopAsset from "@/assets/chess/demon-gold/demon-bb.webp.asset.json";
import demonBlackRookAsset from "@/assets/chess/demon-gold/demon-br.webp.asset.json";
import demonBlackQueenAsset from "@/assets/chess/demon-gold/demon-bq.webp.asset.json";
import demonBlackKingAsset from "@/assets/chess/demon-gold/demon-bk.webp.asset.json";

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
  wp: demonWhitePawnAsset.url,
  wn: demonWhiteKnightAsset.url,
  wb: demonWhiteBishopAsset.url,
  wr: demonWhiteRookAsset.url,
  wq: demonWhiteQueenAsset.url,
  wk: demonWhiteKingAsset.url,
  bp: demonBlackPawnAsset.url,
  bn: demonBlackKnightAsset.url,
  bb: demonBlackBishopAsset.url,
  br: demonBlackRookAsset.url,
  bq: demonBlackQueenAsset.url,
  bk: demonBlackKingAsset.url,
};