import courtNav from "@/assets/nav/court-nav.webp";
import battleNav from "@/assets/nav/battle-nav.webp";
import crucibleNav from "@/assets/nav/crucible-nav.webp";
import analysisNav from "@/assets/nav/analysis-nav.webp";
import dynastyNav from "@/assets/nav/dynasty-nav.webp";

export const NAV_ICONS = {
  court: courtNav,
  battle: battleNav,
  crucible: crucibleNav,
  analysis: analysisNav,
  dynasty: dynastyNav,
} as const;

export type NavIconKey = keyof typeof NAV_ICONS;
