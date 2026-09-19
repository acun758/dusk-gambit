import { ABYSSAL_LEGACY_PIECE_ASSETS, CRIMSON_EMPRESS_PIECE_ASSETS, DARK_DRAGON_PIECE_ASSETS, OBSIDIAN_SOVEREIGNTY_PIECE_ASSETS, PALE_COURT_PIECE_ASSETS, TEMPLE_JUDGMENT_PIECE_ASSETS } from "./chess-piece-assets";

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
    id: "obsidian-sovereignty",
    zh: "黑曜王权",
    en: "Obsidian Sovereignty",
    assets: OBSIDIAN_SOVEREIGNTY_PIECE_ASSETS,
    source: "src/assets/chess/obsidian-sovereignty",
  },
  {
    id: "abyssal-legacy",
    zh: "深翡冷翠",
    en: "Abyssal Legacy",
    assets: ABYSSAL_LEGACY_PIECE_ASSETS,
    source: "src/assets/chess/abyssal-legacy",
  },
  {
    id: "crimson-empress",
    zh: "猩红女帝",
    en: "Crimson Empress",
    assets: CRIMSON_EMPRESS_PIECE_ASSETS,
    source: "src/assets/chess/crimson-empress",
  },
  {
    id: "temple-judgment",
    zh: "圣堂裁决",
    en: "Temple Judgment",
    assets: TEMPLE_JUDGMENT_PIECE_ASSETS,
    source: "src/assets/chess/temple-judgment",
  },
  {
    id: "pale-court",
    zh: "苍白王庭",
    en: "Pale Court",
    assets: PALE_COURT_PIECE_ASSETS,
    source: "src/assets/chess/pale-court",
  },
  {
    id: "dark-dragon",
    zh: "暗黑龙语",
    en: "Dark Dragon Tongue",
    assets: DARK_DRAGON_PIECE_ASSETS,
    source: "src/assets/chess/dark-dragon",
  },
];

export const DEFAULT_PIECE_SET_ID = "obsidian-sovereignty";

const LEGACY_PIECE_SET_IDS: Record<string, string> = {
  sovereign: "obsidian-sovereignty",
  "demon-gold": "crimson-empress",
};

export function pieceSet(id: string = DEFAULT_PIECE_SET_ID): PieceSet {
  const currentId = LEGACY_PIECE_SET_IDS[id] ?? id;
  return PIECE_SETS.find((set) => set.id === currentId) ?? PIECE_SETS[0]!;
}
