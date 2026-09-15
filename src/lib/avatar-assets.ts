import amethystCrown from "@/assets/avatars/registration/amethyst-crown.webp";
import azurePhoenix from "@/assets/avatars/registration/azure-phoenix.webp";
import azureTaotie from "@/assets/avatars/registration/azure-taotie.webp";
import azureWolf from "@/assets/avatars/registration/azure-wolf.webp";
import crimsonGeneral from "@/assets/avatars/registration/crimson-general.webp";
import crimsonSpartan from "@/assets/avatars/registration/crimson-spartan.webp";
import crossedAxes from "@/assets/avatars/registration/crossed-axes.webp";
import crownedEagle from "@/assets/avatars/registration/crowned-eagle.webp";
import crownedLion from "@/assets/avatars/registration/crowned-lion.webp";
import laurelStar from "@/assets/avatars/registration/laurel-star.webp";
import violetDragon from "@/assets/avatars/registration/violet-dragon.webp";
import violetTemplar from "@/assets/avatars/registration/violet-templar.webp";

export interface AvatarOption {
  key: string;
  url: string;
  zh: string;
  en: string;
}

/** 注册头像徽章：统一透明底、统一画布与视觉比例。 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { key: "azure-taotie", url: azureTaotie, zh: "蓝瞳饕餮", en: "Azure Taotie" },
  { key: "crimson-general", url: crimsonGeneral, zh: "红缨双剑将", en: "Crimson General" },
  { key: "violet-dragon", url: violetDragon, zh: "紫瞳蟠龙", en: "Violet Dragon" },
  { key: "azure-phoenix", url: azurePhoenix, zh: "蓝焰朱雀", en: "Azure Phoenix" },
  { key: "crossed-axes", url: crossedAxes, zh: "剑斧军牌", en: "Crossed Arms" },
  { key: "laurel-star", url: laurelStar, zh: "月桂翼星", en: "Laurel Star" },
  { key: "violet-templar", url: violetTemplar, zh: "紫瞳圣殿骑士", en: "Violet Templar" },
  { key: "crimson-spartan", url: crimsonSpartan, zh: "紫缨斯巴达盔", en: "Crimson Spartan" },
  { key: "crowned-eagle", url: crownedEagle, zh: "冠冕皇鹰", en: "Crowned Eagle" },
  { key: "crowned-lion", url: crownedLion, zh: "王冠雄狮", en: "Crowned Lion" },
  { key: "amethyst-crown", url: amethystCrown, zh: "紫晶王冠双剑", en: "Amethyst Crown" },
  { key: "azure-wolf", url: azureWolf, zh: "蓝瞳狼首", en: "Azure Wolf" },
];

export const DEFAULT_AVATAR_KEY = "azure-taotie";

export function avatarUrl(key?: string | null): string {
  return AVATAR_OPTIONS.find((a) => a.key === key)?.url ?? azureTaotie;
}

/** 未设置头像时按名字稳定派生一枚，确保对局双方的头像不会撞在一起。 */
export function avatarKeyForSeed(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_OPTIONS[hash % AVATAR_OPTIONS.length]?.key ?? DEFAULT_AVATAR_KEY;
}
