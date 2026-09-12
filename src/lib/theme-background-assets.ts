import abyssDesktop from "@/assets/themes/abyss-arena-desktop.png.asset.json";
import abyssIpad from "@/assets/themes/abyss-arena-ipad.png.asset.json";
import abyssIphone from "@/assets/themes/abyss-arena-iphone.png.asset.json";
import blackGoldDesktop from "@/assets/themes/black-gold-duel-desktop.png.asset.json";
import blackGoldIpad from "@/assets/themes/black-gold-duel-ipad.png.asset.json";
import blackGoldIphone from "@/assets/themes/black-gold-duel-iphone.png.asset.json";
import dragonDesktop from "@/assets/themes/dragon-knight-desktop.png.asset.json";
import dragonIpad from "@/assets/themes/dragon-knight-ipad.png.asset.json";
import dragonIphone from "@/assets/themes/dragon-knight-iphone.png.asset.json";
import fallenDesktop from "@/assets/themes/fallen-king-desktop.png.asset.json";
import fallenIpad from "@/assets/themes/fallen-king-ipad.png.asset.json";
import fallenIphone from "@/assets/themes/fallen-king-iphone.png.asset.json";
import gothicDesktop from "@/assets/themes/gothic-hall-desktop.png.asset.json";
import gothicIpad from "@/assets/themes/gothic-hall-ipad.png.asset.json";
import gothicIphone from "@/assets/themes/gothic-hall-iphone.png.asset.json";
import stormDesktop from "@/assets/themes/storm-king-desktop.png.asset.json";
import stormIpad from "@/assets/themes/storm-king-ipad.png.asset.json";
import stormIphone from "@/assets/themes/storm-king-iphone.png.asset.json";

export type ThemeBackgroundName = "storm" | "fallen" | "dragon" | "blackGold" | "gothic" | "abyss";

type ThemeBackgroundSet = {
  desktop: string;
  ipad: string;
  iphone: string;
};

export const THEME_BACKGROUNDS: Record<ThemeBackgroundName, ThemeBackgroundSet> = {
  storm: { desktop: stormDesktop.url, ipad: stormIpad.url, iphone: stormIphone.url },
  fallen: { desktop: fallenDesktop.url, ipad: fallenIpad.url, iphone: fallenIphone.url },
  dragon: { desktop: dragonDesktop.url, ipad: dragonIpad.url, iphone: dragonIphone.url },
  blackGold: { desktop: blackGoldDesktop.url, ipad: blackGoldIpad.url, iphone: blackGoldIphone.url },
  gothic: { desktop: gothicDesktop.url, ipad: gothicIpad.url, iphone: gothicIphone.url },
  abyss: { desktop: abyssDesktop.url, ipad: abyssIpad.url, iphone: abyssIphone.url },
};