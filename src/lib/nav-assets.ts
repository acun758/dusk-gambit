import courtNav from "@/assets/nav/court-nav.webp.asset.json";
import battleNav from "@/assets/nav/battle-nav.webp.asset.json";
import crucibleNav from "@/assets/nav/crucible-nav.webp.asset.json";
import analysisNav from "@/assets/nav/analysis-nav.webp.asset.json";
import dynastyNav from "@/assets/nav/dynasty-nav.webp.asset.json";

export const NAV_ICONS = {
  court: courtNav.url,
  battle: battleNav.url,
  crucible: crucibleNav.url,
  analysis: analysisNav.url,
  dynasty: dynastyNav.url,
} as const;

export type NavIconKey = keyof typeof NAV_ICONS;
