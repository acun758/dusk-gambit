import heroThrone from "@/assets/hero-throne.webp";
import heroPortrait from "@/assets/hero-throne-portrait.webp";
import heroVideo from "@/assets/hero_bg_muted.mp4";
import logoEmblem from "@/assets/logo-emblem.png";
import matchArena from "@/assets/match-arena.webp";
import reviewBoard from "@/assets/review-board.webp";
import classicSet from "@/assets/skin-classic.webp";
import gildedSet from "@/assets/skin-gilded.webp";
import shadowSet from "@/assets/skin-shadow.webp";

export const GAME_ART = {
  hero: heroThrone,
  heroPortrait: heroPortrait,
  heroVideo: heroVideo,
  emblem: logoEmblem,
  matchArena: matchArena,
  reviewBoard: reviewBoard,
  sets: {
    classic: classicSet,
    gilded: gildedSet,
    shadow: shadowSet,
  },
} as const;