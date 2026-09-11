import { useState } from "react";

type TabKey = "log" | "mind" | "spoils" | "review";
export type PanelVariant = "duel" | "review";

const TABS: { key: TabKey; label: string; zh: string; icon: string }[] = [
  { key: "log", label: "Log", zh: "棋谱", icon: "history_edu" },
  { key: "mind", label: "Mind", zh: "心智", icon: "psychology" },
  { key: "spoils", label: "Spoils", zh: "战利", icon: "military_tech" },
  { key: "review", label: "Review", zh: "分析", icon: "insights" },
];

const MISTAKES = [
  { ply: "23", tag: "?!", zh: "过早交换中心兵", tone: "text-secondary" },
  { ply: "31", tag: "!", zh: "弃象抢占开放线", tone: "text-secondary-fixed" },
  { ply: "38", tag: "?", zh: "漏算对方后翼突进", tone: "text-primary" },
];

const MOVES = [
  { n: "34", zh: "弃车诱敌", san: "Rxd5!", eval: "+3.8", tone: "text-secondary" },
  { n: "35", zh: "王翼回防", san: "Kg8", eval: "+3.6", tone: "text-on-surface-variant" },
  { n: "36", zh: "后翼突进", san: "Qh5+", eval: "+7.4", tone: "text-secondary" },
  { n: "37", zh: "逼角陷阱", san: "Kh8", eval: "#M1", tone: "text-primary" },
  { n: "38", zh: "终局绝杀", san: "Qf7#", eval: "MATE", tone: "text-primary" },
];

const MIND = [
  { zh: "计算压力", en: "Calculation Load", v: 82 },
  { zh: "时间焦虑", en: "Clock Anxiety", v: 46 },
  { zh: "阵型稳定", en: "Structure", v: 71 },
  { zh: "杀气", en: "Killer Instinct", v: 94 },
];

function Clocks() {
  return (
    <div className="grid grid-cols-2 gap-space-xs">
      <div className="bg-surface-container-high p-2 flex flex-col gold-hairline">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          White · GM Vane
        </span>
        <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">02:41</span>
      </div>
      <div className="bg-primary-container/40 p-2 flex flex-col gold-hairline">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          Black · Lord Cinders
        </span>
        <span className="font-headline-sm text-headline-sm text-secondary tabular-nums">01:07</span>
      </div>
    </div>
  );
}

function PanelBody({ tab }: { tab: TabKey }) {
  if (tab === "log") {
    return (
      <div className="flex flex-col gap-space-xs">
        <Clocks />
        <div className="max-h-[38vh] lg:max-h-[46vh] overflow-y-auto flex flex-col gap-1 pr-0.5">
          {MOVES.map((m) => (
            <div
              key={m.n}
              className="flex items-center justify-between gap-space-sm bg-surface-container px-2 py-2 min-h-11"
            >
              <span className="font-label-sm text-label-sm text-on-surface-variant w-8 shrink-0 tabular-nums">
                #{m.n}
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold shrink-0">
                {m.san}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate flex-1 text-left">
                {m.zh}
              </span>
              <span className={`font-label-sm text-label-sm shrink-0 ${m.tone}`}>{m.eval}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "mind") {
    return (
      <div className="flex flex-col gap-space-sm">
        {MIND.map((m) => (
          <div key={m.en} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="font-label-md text-label-md text-on-surface">{m.zh}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                {m.en} · {m.v}
              </span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full bg-secondary-fixed shadow-[0_0_10px_rgba(233,195,73,0.6)]"
                style={{ width: `${m.v}%` }}
              />
            </div>
          </div>
        ))}
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          压力峰值出现在第 34 步弃车之后，心率与用时同步抬升；随后四手保持稳定，说明算路已经收敛。
        </p>
      </div>
    );
  }

  if (tab === "review") {
    return (
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface">引擎评分曲线</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
            Depth 32 · Cloud
          </span>
        </div>
        <div className="h-16 w-full bg-surface-container flex items-end gap-0.5 p-1">
          {[38, 44, 40, 52, 61, 48, 70, 66, 82, 74, 90, 96].map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-secondary-fixed/80"
              style={{ height: `${v}%` }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {MISTAKES.map((m) => (
            <div
              key={m.ply}
              className="flex items-center gap-space-sm bg-surface-container px-2 py-2 min-h-11"
            >
              <span className="font-label-sm text-label-sm text-on-surface-variant w-8 shrink-0 tabular-nums">
                #{m.ply}
              </span>
              <span className={`font-label-md text-label-md font-bold w-6 shrink-0 ${m.tone}`}>
                {m.tag}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {m.zh}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-space-xs">
      {["♟", "♟", "♞", "♝", "♜", "♛"].map((p, i) => (
        <div
          key={`${p}-${i}`}
          className="aspect-square bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm text-secondary gold-hairline"
        >
          {p}
        </div>
      ))}
    </div>
  );
}

export function DuelPanel({ variant = "duel" }: { variant?: PanelVariant }) {
  const tabs = variant === "review" ? TABS : TABS.filter((t) => t.key !== "review");
  const [tab, setTab] = useState<TabKey>("log");
  const [open, setOpen] = useState(false);

  const tabStrip = (
    <div className={`grid gap-1 ${variant === "review" ? "grid-cols-4" : "grid-cols-3"}`}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => {
            setTab(t.key);
            setOpen(true);
          }}
          aria-pressed={tab === t.key}
          className={`h-11 flex items-center justify-center gap-1.5 transition-colors ${
            tab === t.key
              ? "bg-primary-container text-on-surface"
              : "bg-surface-container-high text-on-surface-variant hover:text-secondary"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest">{t.zh}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Compact: bottom drawer (iPhone / iPad portrait) — collapsed by default */}
      <div className="lg:hidden fixed inset-x-0 bottom-[6.25rem] z-40 px-margin-mobile">
        <div className="bg-surface-container-lowest/97 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.85)] gold-hairline">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="w-full h-12 px-space-sm flex items-center justify-between"
          >
            <span className="flex items-center gap-space-xs min-w-0">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest shrink-0">
                +1.84
              </span>
              <span className="w-px h-4 bg-outline-variant/50 shrink-0" />
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                棋谱 · 心智 · 战利品
              </span>
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
              {open ? "keyboard_arrow_down" : "keyboard_arrow_up"}
            </span>
          </button>
          {open && (
            <div className="px-space-sm pb-space-sm flex flex-col gap-space-sm">
              {tabStrip}
              <PanelBody tab={tab} />
            </div>
          )}
        </div>
      </div>

      {/* Wide: right column (iPad landscape / desktop) */}
      <aside className="hidden lg:flex flex-col gap-space-sm w-[340px] shrink-0 self-start sticky top-20">
        <div className="bg-surface-container-lowest p-space-md flex flex-col gap-space-sm gold-hairline shadow-xl">
          <div className="flex items-baseline justify-between">
            <span className="font-headline-sm text-headline-sm text-secondary">+1.84</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              Depth 32
            </span>
          </div>
          <Clocks />
          <div className="flex flex-col gap-1">
            {MIND.slice(0, 2).map((m) => (
              <div key={m.en} className="flex items-center gap-space-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant w-16 shrink-0">
                  {m.zh}
                </span>
                <div className="h-1 flex-1 bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-secondary-fixed" style={{ width: `${m.v}%` }} />
                </div>
              </div>
            ))}
          </div>
          {tabStrip}
          <PanelBody tab={tab} />
        </div>
      </aside>
    </>
  );
}
