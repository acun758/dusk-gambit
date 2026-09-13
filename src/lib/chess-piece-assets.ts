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