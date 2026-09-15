import { THEME_BACKGROUNDS, type ThemeBackgroundName } from "@/lib/theme-background-assets";

export function ThemeBackdrop({ theme }: { theme: ThemeBackgroundName }) {
  const artwork = THEME_BACKGROUNDS[theme];

  return (
    <div className="theme-backdrop" aria-hidden="true">
      <picture>
        <source media="(min-width: 1024px)" srcSet={artwork.desktop} />
        <source media="(min-width: 768px)" srcSet={artwork.ipad} />
        <img src={artwork.iphone} alt="" decoding="async" fetchPriority="high" />
      </picture>
      <div className="theme-backdrop-shade" />
      <div className="theme-backdrop-grid" />
    </div>
  );
}