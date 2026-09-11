import { Link, useRouterState } from "@tanstack/react-router";

const PRIMARY = [
  { to: "/", icon: "crown", label: "Court" },
  { to: "/battle", icon: "swords", label: "Battle" },
  { to: "/puzzle", icon: "chess_knight", label: "Tactics" },
  { to: "/arsenal", icon: "auto_stories", label: "Vault" },
  { to: "/analysis", icon: "shield", label: "Dynasty" },
] as const;

const SANCTUM = [
  { to: "/", en: "Decree", zh: "敕令" },
  { to: "/protocols", en: "Arbiters", zh: "法则" },
  { to: "/matchmaking", en: "Matchup", zh: "匹配" },
  { to: "/battle", en: "Duel", zh: "死斗" },
  { to: "/victory", en: "Execution", zh: "处决" },
  { to: "/crucible", en: "Blindfold", zh: "盲棋" },
  { to: "/dynasty", en: "Dynasty", zh: "天梯" },
  { to: "/analysis", en: "Council", zh: "定评" },
  { to: "/arsenal", en: "Relics", zh: "圣物" },
  { to: "/forge/$id", params: { id: "001" }, en: "Forge", zh: "铸造" },
  { to: "/finisher", en: "Finisher", zh: "绝杀" },
  { to: "/archive", en: "Chronicle", zh: "典藏" },
  { to: "/share", en: "Dispatch", zh: "传播" },
  { to: "/puzzle", en: "Puzzle", zh: "残局" },
  { to: "/puzzle/solved", en: "Spoils", zh: "战利" },
  { to: "/codex", en: "Codex", zh: "法典" },
] as const;

/** Bilingual label: Latin keeps ceremonial tracking, CJK gets optical spacing. */
function BiLabel({ en, zh }: { en: string; zh: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="uppercase tracking-widest">{en}</span>
      <span className="cjk tracking-[0.06em] opacity-80">{zh}</span>
    </span>
  );
}


export function SovereignNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Compact: bottom bar (iPhone / iPad portrait) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)] border-t border-outline-variant/40">
        <div className="flex gap-space-xs overflow-x-auto px-gutter-mobile py-1.5 border-b border-outline-variant/30">
          {SANCTUM.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.en}
                to={item.to}
                {...("params" in item ? { params: item.params } : {})}
                className={`shrink-0 px-space-sm py-1 font-label-sm text-label-sm transition-colors ${
                  active
                    ? "bg-primary-container text-on-surface"
                    : "bg-surface-container-high text-on-surface-variant hover:text-secondary"
                }`}
              >
                <BiLabel en={item.en} zh={item.zh} />
              </Link>

            );
          })}
        </div>
        <nav className="h-16 px-gutter-mobile flex items-center justify-around">
          {PRIMARY.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center w-full h-11 gap-0.5 transition-colors ${
                  active
                    ? "text-secondary bg-surface-container-high/60"
                    : "text-on-surface-variant hover:text-secondary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="font-label-sm text-label-sm tracking-widest uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Wide: left rail (iPad landscape / desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-56 flex-col bg-surface-container-lowest/95 backdrop-blur-xl border-r border-outline-variant/40 shadow-[8px_0_30px_rgba(0,0,0,0.7)]">
        <div className="px-space-md py-space-lg border-b border-outline-variant/40">
          <div className="font-headline-sm text-headline-sm tracking-widest uppercase text-secondary">
            Blood Sovereign
          </div>
          <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant mt-1">
            猩红王权 · Rank 2480
          </div>
        </div>

        <nav className="px-space-sm py-space-sm grid gap-1 border-b border-outline-variant/30">
          {PRIMARY.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-space-sm h-11 px-space-sm transition-colors ${
                  active
                    ? "bg-surface-container-high text-secondary gold-hairline"
                    : "text-on-surface-variant hover:text-secondary hover:bg-surface-container/60"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <span className="font-label-lg text-label-lg uppercase tracking-widest">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-1 overflow-y-auto px-space-sm py-space-sm grid content-start gap-0.5">
          {SANCTUM.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.en}
                to={item.to}
                {...("params" in item ? { params: item.params } : {})}
                className={`px-space-sm py-2 font-label-sm text-label-sm transition-colors ${
                  active
                    ? "bg-primary-container text-on-surface"
                    : "text-on-surface-variant hover:text-secondary hover:bg-surface-container/60"
                }`}
              >
                <BiLabel en={item.en} zh={item.zh} />
              </Link>

            );
          })}
        </div>
      </aside>
    </>
  );
}
