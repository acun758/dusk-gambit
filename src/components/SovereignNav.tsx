import { Link, useRouterState } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";

const PRIMARY = [
  { to: "/", icon: "crown", label: "Court", zh: "王座" },
  { to: "/battle", icon: "swords", label: "Duel", zh: "对弈" },
  { to: "/crucible", icon: "chess_knight", label: "Trials", zh: "残局" },
  { to: "/analysis", icon: "insights", label: "Review", zh: "复盘" },
  { to: "/dynasty", icon: "shield", label: "Ladder", zh: "天梯" },
] as const;

function PrimaryLabel({ en, zh }: { en: string; zh: string }) {
  const { lang } = useLang();
  return <span className={lang === "zh" ? "cjk tracking-[0.08em]" : ""}>{lang === "zh" ? zh : en}</span>;
}

function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      aria-label="切换语言 / Switch language"
      className={`shrink-0 h-9 px-space-sm bg-surface-container-high text-secondary font-label-sm text-label-sm tracking-widest uppercase hover:bg-surface-container-highest transition-colors ${className}`}
    >
      {lang === "zh" ? "中 / EN" : "EN / 中"}
    </button>
  );
}

export function SovereignNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
      {/* Phones & iPad portrait: single bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)] border-t border-outline-variant/40">
        <nav className="h-[4.5rem] px-gutter-mobile grid grid-cols-5 items-center">
          {PRIMARY.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-14 gap-0.5 transition-colors ${
                isActive(item.to)
                  ? "text-secondary bg-surface-container-high/60"
                  : "text-on-surface-variant hover:text-secondary"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-label-sm text-label-sm tracking-widest uppercase">
                <PrimaryLabel en={item.label} zh={item.zh} />
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* iPad portrait and up: left rail */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-48 lg:w-56 flex-col bg-surface-container-lowest/95 backdrop-blur-xl border-r border-outline-variant/40 shadow-[8px_0_30px_rgba(0,0,0,0.7)]">
        <div className="px-space-md py-space-lg border-b border-outline-variant/40 flex flex-col gap-space-xs">
          <div className="font-headline-sm text-headline-sm tracking-widest uppercase text-secondary">
            Blood Sovereign
          </div>
          <div className="cjk font-label-sm text-label-sm tracking-widest text-on-surface-variant">
            猩红王权 · 王座殿堂
          </div>
          <div className="flex flex-wrap items-center gap-space-xs mt-1">
            <LangToggle />
            <Link
              to="/auth"
              className="shrink-0 h-9 px-space-sm bg-primary-container text-on-primary-container font-label-sm text-label-sm tracking-widest uppercase flex items-center cjk"
            >
              账号
            </Link>
          </div>
        </div>

        <nav className="px-space-sm py-space-sm grid gap-1">
          {PRIMARY.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-space-sm h-12 px-space-sm transition-colors ${
                isActive(item.to)
                  ? "bg-surface-container-high text-secondary gold-hairline"
                  : "text-on-surface-variant hover:text-secondary hover:bg-surface-container/60"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="font-label-lg text-label-lg uppercase tracking-widest">
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
                ? "text-secondary bg-surface-container/60"
                : "text-on-surface-variant hover:text-secondary"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>军械典藏
          </Link>
        </div>
      </aside>
    </>
  );
}
