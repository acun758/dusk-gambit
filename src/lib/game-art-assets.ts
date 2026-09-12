import heroThrone from "@/assets/hero-throne.jpg.asset.json";
import heroPortrait from "@/assets/hero-throne-portrait.jpg.asset.json";
import heroVideo from "@/assets/hero_bg_muted.mp4.asset.json";
import logoEmblem from "@/assets/logo-emblem.png.asset.json";
import matchArena from "@/assets/match-arena.jpg.asset.json";
import reviewBoard from "@/assets/review-board.jpg.asset.json";
import classicSet from "@/assets/skin-classic.png.asset.json";
import gildedSet from "@/assets/skin-gilded.png.asset.json";
import shadowSet from "@/assets/skin-shadow.png.asset.json";

export const GAME_ART = {
  hero: heroThrone.url,
  heroPortrait: heroPortrait.url,
  heroVideo: heroVideo.url,
  emblem: logoEmblem.url,
  matchArena: matchArena.url,
  reviewBoard: reviewBoard.url,
  sets: {
    classic: classicSet.url,
    gilded: gildedSet.url,
    shadow: shadowSet.url,
  },
} as const;