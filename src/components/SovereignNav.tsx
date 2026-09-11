import { Link, useRouterState } from "@tanstack/react-router";

const PRIMARY = [
  { to: "/", icon: "crown", label: "Court" },
  { to: "/battle", icon: "swords", label: "Battle" },
  { to: "/puzzle", icon: "chess_knight", label: "Tactics" },
  { to: "/arsenal", icon: "auto_stories", label: "Vault" },
  { to: "/analysis", icon: "shield", label: "Dynasty" },
] as const;

const SANCTUM = [
  { to: "/", label: "Decree 敕令" },
  { to: "/protocols", label: "Arbiters 法则" },
  { to: "/battle", label: "Duel 死斗" },
  { to: "/victory", label: "Execution 处决" },
  { to: "/analysis", label: "Council 定评" },
  { to: "/arsenal", label: "Relics 圣物" },
  { to: "/forge/$id", params: { id: "001" }, label: "Forge 铸造" },
  { to: "/finisher", label: "Finisher 绝杀" },
  { to: "/archive", label: "Chronicle 典藏" },
  { to: "/share", label: "Dispatch 传播" },
  { to: "/puzzle", label: "Puzzle 残局" },
  { to: "/puzzle/solved", label: "Spoils 战利" },
  { to: "/codex", label: "Codex 法典" },
] as const;

export function SovereignNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.85)] border-t border-outline-variant/40">
      <div className="flex gap-space-xs overflow-x-auto px-gutter-mobile py-1.5 border-b border-outline-variant/30">
        {SANCTUM.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              {...("params" in item ? { params: item.params } : {})}
              className={`shrink-0 px-space-sm py-1 font-label-sm text-label-sm uppercase tracking-widest whitespace-nowrap transition-colors ${
                active
                  ? "bg-primary-container text-on-surface"
                  : "bg-surface-container-high text-on-surface-variant hover:text-secondary"
              }`}
            >
              {item.label}
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
  );
}
