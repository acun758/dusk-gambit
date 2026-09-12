import platinumPawn from "@/assets/chess/platinum-p.webp.asset.json";
import platinumKnight from "@/assets/chess/platinum-n.webp.asset.json";
import platinumBishop from "@/assets/chess/platinum-b.webp.asset.json";
import platinumRook from "@/assets/chess/platinum-r.webp.asset.json";
import platinumQueen from "@/assets/chess/platinum-q.webp.asset.json";
import platinumKing from "@/assets/chess/platinum-k.webp.asset.json";
import obsidianPawn from "@/assets/chess/obsidian-p.webp.asset.json";
import obsidianKnight from "@/assets/chess/obsidian-n.webp.asset.json";
import obsidianBishop from "@/assets/chess/obsidian-b.webp.asset.json";
import obsidianRook from "@/assets/chess/obsidian-r.webp.asset.json";
import obsidianQueen from "@/assets/chess/obsidian-q.webp.asset.json";
import obsidianKing from "@/assets/chess/obsidian-k.webp.asset.json";

export const CHESS_PIECE_ASSETS: Record<string, string> = {
  wp: platinumPawn.url,
  wn: platinumKnight.url,
  wb: platinumBishop.url,
  wr: platinumRook.url,
  wq: platinumQueen.url,
  wk: platinumKing.url,
  bp: obsidianPawn.url,
  bn: obsidianKnight.url,
  bb: obsidianBishop.url,
  br: obsidianRook.url,
  bq: obsidianQueen.url,
  bk: obsidianKing.url,
};