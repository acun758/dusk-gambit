import { THEME_BACKGROUNDS, type ThemeBackgroundName } from "@/lib/theme-background-assets";

export function ThemeBackdrop({ theme }: { theme: ThemeBackgroundName }) {
  const artwork = THEME_BACKGROUNDS[theme];

  return (
    <div className="theme-backdrop" aria-hidden="true">
      <picture>
        <source media="(orientation: landscape) and (min-width: 600px)" srcSet={artwork.desktop} />
        <source media="(orientation: portrait) and (min-width: 600px)" srcSet={artwork.ipad} />
        <img src={artwork.iphone} alt="" decoding="async" fetchPriority="high" />
      </picture>
      <div className="theme-backdrop-shade" />
      <div className="theme-backdrop-grid" />
    </div>
  );
}