import { useCallback, useEffect, useRef, useState } from "react";
import entranceDesktop from "@/assets/entrance/entrance-desktop-2560x1440.webp";
import entranceIpadLandscape from "@/assets/entrance/entrance-ipad-landscape-2732x2048.webp";
import entranceIpadPortrait from "@/assets/entrance/entrance-ipad-portrait-2048x2732.webp";
import entranceIphoneLandscape from "@/assets/entrance/entrance-iphone-landscape-2796x1290.webp";
import entranceIphonePortrait from "@/assets/entrance/entrance-iphone-portrait-1290x2796.webp";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

function EntrancePicture({
  className,
  alt,
  ariaHidden,
}: {
  className?: string;
  alt: string;
  ariaHidden?: boolean;
}) {
  return (
    <picture className={className} aria-hidden={ariaHidden ? "true" : undefined}>
      <source media="(min-width: 1280px)" srcSet={entranceDesktop} />
      <source
        media="(orientation: landscape) and (min-width: 900px)"
        srcSet={entranceIpadLandscape}
      />
      <source media="(orientation: landscape)" srcSet={entranceIphoneLandscape} />
      <source
        media="(orientation: portrait) and (min-width: 700px)"
        srcSet={entranceIpadPortrait}
      />
      <img
        className="game-entrance-artwork"
        src={entranceIphonePortrait}
        alt={alt}
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}

export function GameEntrance({ onEntered }: { onEntered: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useT();

  const enter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    timerRef.current = setTimeout(onEntered, 220);
  }, [leaving, onEntered]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section
      className={`game-entrance ${leaving ? "game-entrance-leaving" : ""}`}
      aria-label={t("进入血誓王权", "Enter Blood Sovereign")}
      onClick={enter}
    >
      <EntrancePicture
        className="game-entrance-backdrop"
        alt=""
        ariaHidden
      />
      <div className="game-entrance-photo-frame">
        <EntrancePicture
          alt={t(
            "玄弈棋竞海报：雄狮、城堡与黑金国王棋子",
            "Xuanyi Qijing poster with a lion, castle and black-gold king"
          )}
        />
      </div>
      <div className="game-entrance-vignette" aria-hidden="true" />
      <Button
        type="button"
        className="game-entrance-action"
        onClick={(event) => {
          event.stopPropagation();
          enter();
        }}
      >
        <span className="cjk">{t("进入王座", "Enter the Court")}</span>
        <span aria-hidden="true">›</span>
      </Button>
    </section>
  );
}
