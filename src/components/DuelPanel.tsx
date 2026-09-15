import { useEffect, useRef, useState } from "react";
import type { DuelSession } from "@/hooks/useDuelSession";
import { fmtClock } from "@/hooks/useDuelSession";
import { Button } from "@/components/ui/button";
import { UiIcon, type UiIconName } from "@/components/UiIcon";

type TabKey = "log" | "mind" | "spoils" | "review";
export type PanelVariant = "duel" | "review";

const TABS: { key: TabKey; label: string; zh: string; icon: UiIconName }[] = [
  { key: "log", label: "Log", zh: "棋谱", icon: "note" },
  { key: "mind", label: "Mind", zh: "心智", icon: "lotus" },
  { key: "spoils", label: "Spoils", zh: "战利", icon: "token" },
  { key: "review", label: "Review", zh: "分析", icon: "equalizer" },
];

const MISTAKES = [
  { ply: "23", tag: "?!", zh: "过早交换中心兵", tone: "text-secondary" },
  { ply: "31", tag: "!", zh: "弃象抢占开放线", tone: "text-secondary-fixed" },
  { ply: "38", tag: "?", zh: "漏算对方后翼突进", tone: "text-primary" },
];

const STATIC_MOVES = [
  { n: "34", zh: "弃车诱敌", san: "Rxd5!", eval: "+3.8", tone: "text-secondary" },
  { n: "35", zh: "王翼回防", san: "Kg8", eval: "+3.6", tone: "text-on-surface-variant" },
  { n: "36", zh: "后翼突进", san: "Qh5+", eval: "+7.4", tone: "text-secondary" },
  { n: "37", zh: "逼角陷阱", san: "Kh8", eval: "#M1", tone: "text-primary" },
  { n: "38", zh: "终局绝杀", san: "Qf7#", eval: "MATE", tone: "text-primary" },
];

const MIND_META: { key: string; zh: string; en: string }[] = [
  { key: "load", zh: "计算压力", en: "Calculation Load" },
  { key: "anxiety", zh: "时间焦虑", en: "Clock Anxiety" },
  { key: "structure", zh: "阵型稳定", en: "Structure" },
  { key: "instinct", zh: "杀气", en: "Killer Instinct" },
];

const STATIC_MIND: Record<string, number> = { load: 82, anxiety: 46, structure: 71, instinct: 94 };

function cpLabel(cp: number) {
  const v = cp / 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}`;
}

const PHASE_LABEL: Record<string, string> = {
  idle: "待命",
  connecting: "连接中",
  live: "实时同步",
  resyncing: "追帧中",
  offline: "断线重连",
};

function Clocks({ session }: { session?: DuelSession | undefined }) {
  const w = session ? fmtClock(session.clock.w) : "02:41";
  const b = session ? fmtClock(session.clock.b) : "01:07";
  const turn = session?.state.turn ?? "b";
  const wName = session?.state.players.w.name ?? "GM Vane";
  const bName = session?.state.players.b.name ?? "Lord Cinders";
  return (
    <div className="grid grid-cols-2 gap-space-xs">
      {(["w", "b"] as const).map((c) => (
        <div
          key={c}
          className={`p-2 flex flex-col gold-hairline transition-colors ${
            turn === c ? "bg-primary-container/40" : "bg-surface-container-high"
          }`}
        >
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest truncate">
            {c === "w" ? `White · ${wName}` : `Black · ${bName}`}
          </span>
          <span
            className={`font-headline-sm text-headline-sm tabular-nums ${
              turn === c ? "text-secondary" : "text-on-surface"
            }`}
          >
            {c === "w" ? w : b}
          </span>
        </div>
      ))}
    </div>
  );
}

function PanelBody({ tab, session }: { tab: TabKey; session?: DuelSession | undefined }) {
  const logRef = useRef<HTMLDivElement>(null);
  const count = session?.moves.length ?? 0;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [count]);

  if (tab === "log") {
    const rows = session
      ? session.moves
          .slice()
          .reverse()
          .map((m) => ({
            n: String(m.ply),
            san: m.san,
            zh: m.zh ?? "",
            eval: cpLabel(m.cp ?? session.cp),
            tone: (m.cp ?? 0) >= 0 ? "text-secondary" : "text-primary",
          }))
          .reverse()
      : STATIC_MOVES;
    return (
      <div className="flex flex-col gap-space-xs">
        <div className="lg:hidden">
          <Clocks session={session} />
        </div>
        <div
          ref={logRef}
          className="max-h-[38vh] lg:max-h-[46vh] overflow-y-auto overscroll-contain flex flex-col gap-1 pr-0.5"
        >
          {rows.length === 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant py-3">等待第一步 · Waiting for first move</p>
          )}
          {rows.map((m) => (
            <div
              key={m.n}
              className="flex items-center justify-between gap-space-sm bg-surface-container px-2 py-2 min-h-11"
            >
              <span className="font-label-sm text-label-sm text-on-surface-variant w-8 shrink-0 tabular-nums">
                #{m.n}
              </span>
              <span className="font-label-md text-label-md text-on-surface font-semibold shrink-0">{m.san}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate flex-1 text-left">
                {m.zh}
              </span>
              <span className={`font-label-sm text-label-sm shrink-0 ${m.tone}`}>{m.eval}</span>
            </div>
          ))}
        </div>
        {session && (
          <div className="grid grid-cols-3 gap-1 pt-1">
            {import.meta.env.DEV && <Button
              onClick={session.simulateDrop}
              variant="ghost"
              className="home-glass-control col-span-2 h-11 bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest"
            >
              测试断线追帧
            </Button>}
            <Button
              onClick={session.resign}
              variant="ghost"
              className={`home-glass-control ${import.meta.env.DEV ? "" : "col-span-3"} h-11 bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-widest`}
            >
              认输
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (tab === "mind") {
    const values = session?.mind ?? STATIC_MIND;
    return (
      <div className="flex flex-col gap-space-sm">
        {MIND_META.map((m) => {
          const v = Math.round(values[m.key] ?? 0);
          return (
            <div key={m.en} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <span className="font-label-md text-label-md text-on-surface">{m.zh}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                  {m.en} · {v}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-high overflow-hidden">
                <div
                  className="h-full bg-secondary-fixed shadow-[0_0_10px_rgba(233,195,73,0.6)] transition-[width] duration-500"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          );
        })}
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          压力峰值出现在弃子之后，心率与用时同步抬升；随后数手保持稳定，说明算路已经收敛。
        </p>
      </div>
    );
  }

  if (tab === "review") {
    return (
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface">引擎评分曲线</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">云端深度 32</span>
        </div>
        <div className="h-16 w-full bg-surface-container flex items-end gap-0.5 p-1">
          {[38, 44, 40, 52, 61, 48, 70, 66, 82, 74, 90, 96].map((v, i) => (
            <div key={i} className="flex-1 bg-secondary-fixed/80" style={{ height: `${v}%` }} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {MISTAKES.map((m) => (
            <div key={m.ply} className="flex items-center gap-space-sm bg-surface-container px-2 py-2 min-h-11">
              <span className="font-label-sm text-label-sm text-on-surface-variant w-8 shrink-0 tabular-nums">
                #{m.ply}
              </span>
              <span className={`font-label-md text-label-md font-bold w-6 shrink-0 ${m.tone}`}>{m.tag}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{m.zh}</span>
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

export function DuelPanel({ variant = "duel", session }: { variant?: PanelVariant; session?: DuelSession | undefined }) {
  const tabs = variant === "review" ? TABS : TABS.filter((t) => t.key !== "review");
  const [tab, setTab] = useState<TabKey>("log");
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const evalText = session ? cpLabel(session.cp) : "+1.84";

  const onPointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    setDrag(open ? Math.max(0, dy) : Math.min(0, dy));
  };
  const onPointerUp = () => {
    if (startY.current === null) return;
    if (open && drag > 56) setOpen(false);
    if (!open && drag < -40) setOpen(true);
    startY.current = null;
    setDrag(0);
  };

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
          className={`h-11 min-w-0 flex items-center justify-center gap-1.5 px-1 transition-colors ${
            tab === t.key
              ? "bg-primary-container text-on-surface"
              : "bg-surface-container-high text-on-surface-variant hover:text-secondary"
          }`}
        >
          <UiIcon name={t.icon} className="h-5 w-5" />
          <span className="cjk font-label-sm text-label-sm tracking-[0.06em] whitespace-nowrap">{t.zh}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Compact: swipeable bottom drawer (iPhone / iPad portrait) */}
      <div className="lg:hidden fixed inset-x-0 bottom-[4.5rem] z-40 px-margin-mobile">
        <div
          ref={sheetRef}
          style={{
            transform: `translate3d(0, ${drag}px, 0)`,
            transition: startY.current === null ? "transform 220ms cubic-bezier(0.22,1,0.36,1)" : "none",
            willChange: "transform",
            touchAction: "pan-y",
          }}
          className="home-glass-panel shadow-[0_-10px_30px_rgba(0,0,0,0.85)]"
        >
          <button
            onClick={() => setOpen((v) => !v)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-expanded={open}
            className="w-full h-12 px-space-sm flex items-center justify-between"
          >
            <span className="flex items-center gap-space-xs min-w-0">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest shrink-0 tabular-nums">
                {evalText}
              </span>
              <span className="w-px h-4 bg-outline-variant/50 shrink-0" />
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {variant === "review" ? "棋谱 · 心智 · 战利 · 分析" : "棋谱 · 心智 · 战利品"}
              </span>
            </span>
            <UiIcon name={open ? "eye" : "sliders"} className="h-6 w-6 opacity-80" />
          </button>
          <div
            className="overflow-hidden transition-[max-height,opacity] duration-250 ease-out"
            style={{ maxHeight: open ? "70vh" : 0, opacity: open ? 1 : 0 }}
            aria-hidden={!open}
          >
            <div className="px-space-sm pb-space-sm flex flex-col gap-space-sm">
              {tabStrip}
              <PanelBody tab={tab} session={session} />
            </div>
          </div>
          <div
            className="pb-1 pt-1 flex justify-center"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="w-10 h-1 rounded-full bg-outline-variant/50" />
          </div>
        </div>
      </div>

      {/* Wide: live right column (iPad landscape / desktop) */}
      <aside className="duel-live-panel hidden lg:flex flex-col gap-space-sm w-[290px] xl:w-[340px] shrink-0 self-start sticky top-20">
        <div className="stage-panel home-glass-panel p-space-md flex flex-col gap-space-sm">
          <div className="flex items-baseline justify-between">
            <span className="font-headline-sm text-headline-sm text-secondary tabular-nums">{evalText}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              {session ? `${PHASE_LABEL[session.phase]} · ${session.transport === "cloud" ? "云端" : "本地"}` : "云端深算 32 层"}
            </span>
          </div>
          <Clocks session={session} />
          <div className="flex flex-col gap-1">
            {MIND_META.slice(0, 2).map((m) => {
              const v = Math.round((session?.mind ?? STATIC_MIND)[m.key] ?? 0);
              return (
                <div key={m.en} className="flex items-center gap-space-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-16 shrink-0">{m.zh}</span>
                  <div className="h-1 flex-1 bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full bg-secondary-fixed transition-[width] duration-500"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {tabStrip}
          <PanelBody tab={tab} session={session} />
        </div>
      </aside>
    </>
  );
}
