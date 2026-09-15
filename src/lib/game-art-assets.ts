import heroThrone from "@/assets/hero-throne.jpg";
import heroPortrait from "@/assets/hero-throne-portrait.jpg";
import heroVideo from "@/assets/hero_bg_muted.mp4";
import logoEmblem from "@/assets/logo-emblem.png";
import matchArena from "@/assets/match-arena.jpg";
import reviewBoard from "@/assets/review-board.jpg";
import classicSet from "@/assets/skin-classic.png";
import gildedSet from "@/assets/skin-gilded.png";
import shadowSet from "@/assets/skin-shadow.png";

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