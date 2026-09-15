import abyssDesktop from "@/assets/themes/abyss-desktop.webp";
import abyssIpad from "@/assets/themes/abyss-ipad.webp";
import abyssIphone from "@/assets/themes/abyss-iphone.webp";
import blackGoldDesktop from "@/assets/themes/black-gold-desktop.webp";
import blackGoldIpad from "@/assets/themes/black-gold-ipad.webp";
import blackGoldIphone from "@/assets/themes/black-gold-iphone.webp";
import dragonDesktop from "@/assets/themes/dragon-desktop.webp";
import dragonIpad from "@/assets/themes/dragon-ipad.webp";
import dragonIphone from "@/assets/themes/dragon-iphone.webp";
import fallenDesktop from "@/assets/themes/fallen-desktop.webp";
import fallenIpad from "@/assets/themes/fallen-ipad.webp";
import fallenIphone from "@/assets/themes/fallen-iphone.webp";
import gothicDesktop from "@/assets/themes/gothic-desktop.webp";
import gothicIpad from "@/assets/themes/gothic-ipad.webp";
import gothicIphone from "@/assets/themes/gothic-iphone.webp";

export type ThemeBackgroundName = "storm" | "fallen" | "dragon" | "blackGold" | "gothic" | "abyss";

type ThemeBackgroundSet = {
  desktop: string;
  ipad: string;
  iphone: string;
};

export const THEME_BACKGROUNDS: Record<ThemeBackgroundName, ThemeBackgroundSet> = {
  storm: { desktop: blackGoldDesktop, ipad: blackGoldIpad, iphone: blackGoldIphone },
  fallen: { desktop: fallenDesktop, ipad: fallenIpad, iphone: fallenIphone },
  dragon: { desktop: dragonDesktop, ipad: dragonIpad, iphone: dragonIphone },
  blackGold: { desktop: blackGoldDesktop, ipad: blackGoldIpad, iphone: blackGoldIphone },
  gothic: { desktop: gothicDesktop, ipad: gothicIpad, iphone: gothicIphone },
  abyss: { desktop: abyssDesktop, ipad: abyssIpad, iphone: abyssIphone },
};