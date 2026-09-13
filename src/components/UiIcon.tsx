import airdrop from "@/assets/icons-ui/airdrop-default.svg";
import badgeHex from "@/assets/icons-ui/badge-hex-default.svg";
import bolt from "@/assets/icons-ui/bolt-default.svg";
import camera from "@/assets/icons-ui/camera-default.svg";
import cards from "@/assets/icons-ui/cards-default.svg";
import chipKing from "@/assets/icons-ui/chip-king-default.svg";
import crown from "@/assets/icons-ui/crown-default.svg";
import crystal from "@/assets/icons-ui/crystal-default.svg";
import download from "@/assets/icons-ui/download-default.svg";
import equalizer from "@/assets/icons-ui/equalizer-default.svg";
import eye from "@/assets/icons-ui/eye-default.svg";
import flame from "@/assets/icons-ui/flame-default.svg";
import forge from "@/assets/icons-ui/forge-default.svg";
import forum from "@/assets/icons-ui/forum-default.svg";
import gem from "@/assets/icons-ui/gem-default.svg";
import laurel from "@/assets/icons-ui/laurel-default.svg";
import link from "@/assets/icons-ui/link-default.svg";
import lotus from "@/assets/icons-ui/lotus-default.svg";
import medalLaurel from "@/assets/icons-ui/medal-laurel-default.svg";
import medalStar from "@/assets/icons-ui/medal-star-default.svg";
import note from "@/assets/icons-ui/note-default.svg";
import pawnUp from "@/assets/icons-ui/pawn-up-default.svg";
import phoenix from "@/assets/icons-ui/phoenix-default.svg";
import playMotion from "@/assets/icons-ui/play-motion-default.svg";
import qrReplay from "@/assets/icons-ui/qr-replay-default.svg";
import quill from "@/assets/icons-ui/quill-default.svg";
import scroll from "@/assets/icons-ui/scroll-default.svg";
import seal from "@/assets/icons-ui/seal-default.svg";
import send from "@/assets/icons-ui/send-default.svg";
import share from "@/assets/icons-ui/share-default.svg";
import shield from "@/assets/icons-ui/shield-default.svg";
import signature from "@/assets/icons-ui/signature-default.svg";
import skull from "@/assets/icons-ui/skull-default.svg";
import sliders from "@/assets/icons-ui/sliders-default.svg";
import sparkles from "@/assets/icons-ui/sparkles-default.svg";
import spinner from "@/assets/icons-ui/spinner-default.svg";
import token from "@/assets/icons-ui/token-default.svg";
import volume from "@/assets/icons-ui/volume-default.svg";
import wallpaper from "@/assets/icons-ui/wallpaper-default.svg";
import wand from "@/assets/icons-ui/wand-default.svg";

export const UI_ICONS = {
  airdrop,
  "badge-hex": badgeHex,
  bolt,
  camera,
  cards,
  "chip-king": chipKing,
  crown,
  crystal,
  download,
  equalizer,
  eye,
  flame,
  forge,
  forum,
  gem,
  laurel,
  link,
  lotus,
  "medal-laurel": medalLaurel,
  "medal-star": medalStar,
  note,
  "pawn-up": pawnUp,
  phoenix,
  "play-motion": playMotion,
  "qr-replay": qrReplay,
  quill,
  scroll,
  seal,
  send,
  share,
  shield,
  signature,
  skull,
  sliders,
  sparkles,
  spinner,
  token,
  volume,
  wallpaper,
  wand,
} as const;

export type UiIconName = keyof typeof UI_ICONS;

export function UiIcon({ name, className = "h-6 w-6", label }: { name: UiIconName; className?: string; label?: string }) {
  return <img src={UI_ICONS[name]} alt={label ?? ""} aria-hidden={label ? undefined : true} className={`ui-icon ${className}`} />;
}