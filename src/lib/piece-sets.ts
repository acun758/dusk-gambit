import { ABYSSAL_LEGACY_PIECE_ASSETS, CHESS_PIECE_ASSETS, DARK_DRAGON_PIECE_ASSETS, DEMON_GOLD_PIECE_ASSETS } from "./chess-piece-assets";

/**
 * 棋子套装登记表。
 *
 * 每套棋子都以项目素材形式常驻 `src/assets/`，换套或新增套装时
 * 只需在此登记一条记录，不必重新绘制已有棋子。
 *
 * 文件规范：512×512 透明 WebP，命名 `<阵营>-<棋子代号>.webp`，
 * 棋子代号 p/n/b/r/q/k，白方 key 前缀 w，黑方前缀 b。
 */
export interface PieceSet {
  id: string;
  zh: string;
  en: string;
  /** 键为 wp/wn/.../bk，值为打包后的图片地址 */
  assets: Record<string, string>;
  source: string;
}

export const PIECE_SETS: PieceSet[] = [
  {
    id: "sovereign",
    zh: "白金 · 黑曜绯红",
    en: "Platinum & Obsidian Crimson",
    assets: CHESS_PIECE_ASSETS,
    source: "src/assets/chess-next/optimized",
  },
  {
    id: "abyssal-legacy",
    zh: "深渊遗族",
    en: "Abyssal Legacy",
    assets: ABYSSAL_LEGACY_PIECE_ASSETS,
    source: "src/assets/chess/abyssal-legacy",
  },
  {
    id: "demon-gold",
    zh: "魔皇古金",
    en: "Demon Emperor Antique Gold",
    assets: DEMON_GOLD_PIECE_ASSETS,
    source: "src/assets/chess/demon-gold",
  },
  {
    id: "dark-dragon",
    zh: "暗黑龙语",
    en: "Dark Dragon Tongue",
    assets: DARK_DRAGON_PIECE_ASSETS,
    source: "src/assets/chess/dark-dragon",
  },
];

export const DEFAULT_PIECE_SET_ID = "sovereign";

export function pieceSet(id: string = DEFAULT_PIECE_SET_ID): PieceSet {
  return PIECE_SETS.find((s) => s.id === id) ?? PIECE_SETS[0]!;
}
