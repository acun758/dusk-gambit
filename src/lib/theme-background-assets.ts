export type ThemeBackgroundName = "storm" | "fallen" | "dragon" | "blackGold" | "gothic" | "abyss";

type ThemeBackgroundSet = {
  desktop: string | null;
  ipad: string | null;
  iphone: string | null;
};

/** Replacement slots for the six withdrawn theme sets. */
const replacementPending: ThemeBackgroundSet = { desktop: null, ipad: null, iphone: null };

export const THEME_BACKGROUNDS: Record<ThemeBackgroundName, ThemeBackgroundSet> = {
  storm: replacementPending,
  fallen: replacementPending,
  dragon: replacementPending,
  blackGold: replacementPending,
  gothic: replacementPending,
  abyss: replacementPending,
};