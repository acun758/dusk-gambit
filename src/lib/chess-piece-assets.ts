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