import { useCallback, useEffect, useRef, useState } from "react";
import entranceArtwork from "@/assets/game-entry-grid.png";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

export function GameEntrance({ onEntered }: { onEntered: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useT();

  const enter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    timerRef.current = setTimeout(onEntered, 520);
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
      <img className="game-entrance-backdrop" src={entranceArtwork} alt="" aria-hidden="true" />
      <div className="game-entrance-photo-frame">
        <img
          className="game-entrance-artwork"
          src={entranceArtwork}
          alt={t("玄弈棋局海报：雄狮、城堡与黑金国王棋子", "Dusk Gambit poster with a lion, castle and black-gold king")}
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