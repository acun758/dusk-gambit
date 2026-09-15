import { Link } from "@tanstack/react-router";
import { GameIcon, type GameIconName } from "@/components/GameIcon";
import { UiIcon } from "@/components/UiIcon";
import { LangToggle, useLang, useT } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { useSound } from "@/lib/sound";


export function SovereignPageHeader({
  icon,
  titleZh,
  titleEn,
  backTo,
}: {
  icon: GameIconName;
  titleZh: string;
  titleEn: string;
  backTo?: "/" | "/battle" | "/analysis" | "/dynasty" | "/arsenal" | "/archive";
}) {
  const { profile, signedIn } = useProfile();
  const t = useT();
  const { lang } = useLang();
  const sound = useSound();


  return (
    <header className="home-glass-header desktop-page-header fixed top-0 w-full z-40 pt-safe">
      <div className="h-20 px-margin-mobile grid grid-cols-[minmax(0,1fr)_auto] items-center gap-space-sm">
        <div className="flex min-w-0 items-center gap-space-sm">
          {backTo ? (
            <Link to={backTo} aria-label={t("返回", "Back")} className="home-glass-control grid h-11 w-11 shrink-0 place-items-center text-secondary">
              <GameIcon name="action-back" className="h-8 w-8" />
            </Link>
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center">
              <GameIcon name={icon} className="h-12 w-12" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-space-xs">
              <span className="font-label-md text-label-md text-secondary tabular-nums">{profile.elo} ELO</span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span className="cjk truncate font-label-md text-label-md text-primary-fixed">{t(profile.tierZh, profile.tier)}</span>
            </div>
            {/* 页眉随语言开关实时切换中/英文，单行截断保持布局不变 */}
            <h1 className={`truncate font-headline-md text-headline-md leading-tight text-on-surface ${lang === "zh" ? "cjk" : ""}`}>
              {lang === "zh" ? titleZh : titleEn}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-space-xs">
          <LangToggle className="home-glass-control" />
          <Link
            to={signedIn ? "/dynasty" : "/auth"}
            className="home-glass-control flex h-11 shrink-0 items-center gap-2 px-3 text-secondary"
          >
            <UiIcon name="crystal" className="h-6 w-6" />
            <span className="hidden font-label-md text-label-md tabular-nums sm:inline">{profile.diamonds.toLocaleString()}</span>
            <span className="cjk font-label-sm text-label-sm">{signedIn ? t("档案", "Profile") : t("登录", "Sign in")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
