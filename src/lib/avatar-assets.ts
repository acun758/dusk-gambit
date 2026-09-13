import knightAzure from "@/assets/avatars/knight-azure.png.asset.json";
import { CHESS_PIECE_ASSETS } from "@/lib/chess-piece-assets";

export interface AvatarOption {
  key: string;
  url: string;
  zh: string;
  en: string;
}

/** 可选头像：默认水晶骑士 + 白金/黑曜棋子套装，注册时自选，尺寸与位置由组件统一约束。 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { key: "knight-azure", url: knightAzure.url, zh: "水晶骑士", en: "Crystal Knight" },
  { key: "platinum-king", url: CHESS_PIECE_ASSETS["wk"]!, zh: "白金王", en: "Platinum King" },
  { key: "platinum-queen", url: CHESS_PIECE_ASSETS["wq"]!, zh: "白金后", en: "Platinum Queen" },
  { key: "platinum-knight", url: CHESS_PIECE_ASSETS["wn"]!, zh: "白金骑士", en: "Platinum Knight" },
  { key: "platinum-rook", url: CHESS_PIECE_ASSETS["wr"]!, zh: "白金堡垒", en: "Platinum Rook" },
  { key: "platinum-bishop", url: CHESS_PIECE_ASSETS["wb"]!, zh: "白金主教", en: "Platinum Bishop" },
  { key: "obsidian-king", url: CHESS_PIECE_ASSETS["bk"]!, zh: "黑曜王", en: "Obsidian King" },
  { key: "obsidian-queen", url: CHESS_PIECE_ASSETS["bq"]!, zh: "黑曜后", en: "Obsidian Queen" },
  { key: "obsidian-knight", url: CHESS_PIECE_ASSETS["bn"]!, zh: "黑曜骑士", en: "Obsidian Knight" },
  { key: "obsidian-rook", url: CHESS_PIECE_ASSETS["br"]!, zh: "黑曜堡垒", en: "Obsidian Rook" },
  { key: "obsidian-bishop", url: CHESS_PIECE_ASSETS["bb"]!, zh: "黑曜主教", en: "Obsidian Bishop" },
  { key: "obsidian-pawn", url: CHESS_PIECE_ASSETS["bp"]!, zh: "黑曜兵", en: "Obsidian Pawn" },
];

export const DEFAULT_AVATAR_KEY = "knight-azure";

export function avatarUrl(key?: string | null): string {
  return AVATAR_OPTIONS.find((a) => a.key === key)?.url ?? AVATAR_OPTIONS[0]!.url;
}

/** 未设置头像时按名字稳定派生一枚，确保对局双方的头像不会撞在一起。 */
export function avatarKeyForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_OPTIONS[hash % AVATAR_OPTIONS.length]!.key;
}
