import { Link, useRouterState } from "@tanstack/react-router";
import { LangToggle, useLang } from "@/lib/i18n";
import { useProfile } from "@/lib/profile";
import { UiIcon } from "@/components/UiIcon";
import { NAV_ICONS, type NavIconKey } from "@/lib/nav-assets";

const PRIMARY = [
  { to: "/", icon: "court" as NavIconKey, label: "Court", zh: "王座" },
  { to: "/battle", icon: "battle" as NavIconKey, label: "Duel", zh: "对弈" },
  { to: "/crucible", icon: "crucible" as NavIconKey, label: "Trials", zh: "残局" },
  { to: "/analysis", icon: "analysis" as NavIconKey, label: "Review", zh: "复盘" },
  { to: "/dynasty", icon: "dynasty" as NavIconKey, label: "Ladder", zh: "天梯" },
] as const;

function PrimaryLabel({ en, zh }: { en: string; zh: string }) {
  const { lang } = useLang();
  return <span className={lang === "zh" ? "cjk" : ""}>{lang === "zh" ? zh : en}</span>;
}

export function SovereignNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signedIn } = useProfile();
  // 实名认证为可选项，不再限制天梯入口
  const items = PRIMARY;
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));


  return (
    <>
      {/* Phones & iPad portrait: single bottom bar */}
      <div className="home-glass-header lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe">
        <nav className="h-[4.75rem] px-gutter-mobile grid items-center" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-[4.75rem] gap-1 transition-colors ${
                isActive(item.to)
                  ? "text-secondary"
                  : "text-on-surface-variant hover:text-secondary"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center" aria-hidden="true">
                <img
                  src={NAV_ICONS[item.icon]}
                  alt={item.label}
                  className={`h-9 w-9 object-contain transition-[opacity,filter,transform] duration-200 ${isActive(item.to) ? "scale-110 opacity-95 brightness-110" : "opacity-90"}`}
                />
              </span>
              <span className="font-label-sm text-label-sm uppercase">
                <PrimaryLabel en={item.label} zh={item.zh} />
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* iPad landscape and desktop: left rail */}
      <aside className="home-glass-header sovereign-rail hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-56 flex-col">
        <div className="rail-brand px-space-md py-space-lg border-b border-outline-variant/40 flex flex-col gap-space-xs">
          <div className="rail-brand-title font-headline-sm text-headline-sm uppercase text-secondary">
            Blood Sovereign
          </div>
          <div className="rail-brand-subtitle cjk font-label-sm text-label-sm text-on-surface-variant">
            猩红王权 · 王座殿堂
          </div>
          <div className="rail-account flex flex-wrap items-center gap-space-xs mt-1">
            <LangToggle className="home-glass-control" />
            <Link
               to={signedIn ? "/dynasty" : "/auth"}
              className="home-glass-action shrink-0 h-9 px-space-sm text-on-primary-container font-label-sm text-label-sm tracking-widest uppercase flex items-center cjk"
            >
               {signedIn ? "档案" : "登录"}
            </Link>
          </div>
        </div>

        <nav className="px-space-sm py-space-sm grid gap-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-space-sm h-14 px-space-sm transition-colors ${
                isActive(item.to)
                  ? "home-glass-tile-active text-secondary"
                  : "text-on-surface-variant hover:text-secondary hover:bg-surface-container/60"
              }`}
            >
              <img
                src={NAV_ICONS[item.icon]}
                alt={item.label}
                className={`h-10 w-10 object-contain transition-[opacity,filter,transform] ${isActive(item.to) ? "scale-110 opacity-95 brightness-110" : "opacity-90"}`}
              />
              <span className="rail-label font-label-lg text-label-lg uppercase">
                <PrimaryLabel en={item.label} zh={item.zh} />
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-space-sm pb-space-lg grid gap-1">
          <Link
            to="/arsenal"
            className={`flex items-center gap-space-sm h-11 px-space-sm font-label-md text-label-md cjk transition-colors ${
              isActive("/arsenal")
                ? "home-glass-tile-active text-secondary"
                : "text-on-surface-variant hover:text-secondary"
            }`}
          >
            <UiIcon name="forge" className="h-7 w-7" /><span className="rail-label">军械典藏</span>
          </Link>
          <Link
            to="/archive"
            className={`flex items-center gap-space-sm h-11 px-space-sm font-label-md text-label-md cjk transition-colors ${
               isActive("/archive") ? "home-glass-tile-active text-secondary" : "text-on-surface-variant hover:text-secondary"
            }`}
          >
            <UiIcon name="cards" className="h-7 w-7" /><span className="rail-label">绝杀典藏</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
