import { useEffect, useRef, useState } from "react";
import { RankBadge } from "@/components/RankBadge";
import type { RankTier } from "@/lib/ranks";

export interface TierMark {
  key: string;
  zh: string;
  en: string;
  rank: RankTier["id"];
  floor: number;
}

const KEY = "bs.tier.v1";

/**
 * 段位变化仪式：段位提升时徽章变色升起，掉段时给出低调提示。
 * 以本地记录的上一段位为基准，仅在登录且积分来自服务端时触发。
 */
export function usePromotionCeremony(tier: TierMark | null, enabled: boolean) {
  const [event, setEvent] = useState<{ tier: TierMark; kind: "up" | "down" } | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    if (!enabled || !tier) return;
    let prev: { key: string; floor: number } | null = null;
    try {
      const raw = window.localStorage.getItem(KEY);
      prev = raw ? (JSON.parse(raw) as { key: string; floor: number }) : null;
    } catch {
      prev = null;
    }
    if (prev && prev.key !== tier.key) {
      setEvent({ tier, kind: tier.floor > prev.floor ? "up" : "down" });
    }
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ key: tier.key, floor: tier.floor }));
    } catch {
      /* storage unavailable */
    }
    ready.current = true;
  }, [tier?.key, tier?.floor, enabled]);

  return { event, dismiss: () => setEvent(null) };
}

export function PromotionOverlay({
  event,
  onDismiss,
}: {
  event: { tier: TierMark; kind: "up" | "down" } | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!event) return;
    const t = setTimeout(onDismiss, 5200);
    return () => clearTimeout(t);
  }, [event, onDismiss]);

  if (!event) return null;
  const up = event.kind === "up";

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onDismiss}
      className="promotion-overlay fixed inset-0 z-[90] flex items-center justify-center bg-surface-container-lowest/85 backdrop-blur-md px-margin-mobile"
    >
      <div className="flex flex-col items-center gap-space-sm text-center">
        <div className={`promotion-badge w-32 h-32 flex items-center justify-center ${up ? "is-up" : "is-down"}`}>
          <RankBadge rank={event.tier.rank} className="h-28 w-28" label={`${event.tier.zh}段徽章`} />
        </div>
        <span className="promotion-kicker cjk font-label-sm text-label-sm tracking-[0.4em] text-secondary">
          {up ? "段 位 晋 升" : "段 位 变 动"}
        </span>
        <span className="promotion-title cjk font-headline-md text-headline-md text-on-surface">{event.tier.zh}</span>
        <span className="promotion-sub font-label-sm text-label-sm text-on-surface-variant tracking-widest">
          {event.tier.en} · {event.tier.floor}+ ELO
        </span>
        <span className="promotion-sub cjk font-body-sm text-body-sm text-on-surface-variant">
          {up ? "晋升挑战赛告捷，徽章已更新，天梯榜同步刷新。" : "积分回落，赢下两局即可重启晋升挑战赛。"}
        </span>
      </div>
    </div>
  );
}
