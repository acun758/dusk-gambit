import { UiIcon } from "@/components/UiIcon";
import { useT } from "@/lib/i18n";
import { useSound } from "@/lib/sound";

/** 全站音效开关，状态存本地，默认开启。 */
export function SoundToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useSound();
  const t = useT();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={t(enabled ? "关闭音效" : "开启音效", enabled ? "Mute sound" : "Unmute sound")}
      className={`home-glass-control grid h-11 w-11 shrink-0 place-items-center ${enabled ? "text-secondary" : "text-on-surface-variant opacity-55"} ${className}`}
    >
      <UiIcon name="volume" className="h-6 w-6" />
    </button>
  );
}
