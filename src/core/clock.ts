/**
 * core/clock.ts — 时钟显示计算
 *
 * 红线：本文件只做**显示计算**。
 * 权威计时、超时判负一律在服务端（submitMove / claimTimeout / settle 闭环）。
 * 前端算出的剩余时间和"超时"只是预显示，任何人都不要把判负逻辑搬进来——
 * 那等于给刷分开门。
 * 纯计算：不含 React、不含 DOM、不含定时器。
 */
import type { Color } from "./rules";

export interface TimeControl {
  /** 每方基础用时，毫秒 */
  base: number;
  /** 每步补时，毫秒 */
  inc: number;
  label: string;
}

/** 首发赛制 3+2 快棋 */
export const BLITZ_3_2: TimeControl = { base: 180_000, inc: 2_000, label: "3 | 2" };

export interface ClockPair {
  w: number;
  b: number;
}

/** 在两次权威帧之间做视觉插值：只减去走子方的经过时间。 */
export function interpolate(clock: ClockPair, turn: Color, elapsedMs: number): ClockPair {
  const safe = Math.max(0, elapsedMs);
  return turn === "w"
    ? { w: Math.max(0, clock.w - safe), b: clock.b }
    : { w: clock.w, b: Math.max(0, clock.b - safe) };
}

/** 走子后的本地预显示时钟（服务端帧到达后以服务端为准覆盖）。 */
export function afterMovePreview(clock: ClockPair, mover: Color, elapsedMs: number, tc: TimeControl): ClockPair {
  const left = Math.max(0, (mover === "w" ? clock.w : clock.b) - Math.max(0, elapsedMs)) + tc.inc;
  return mover === "w" ? { w: left, b: clock.b } : { w: clock.w, b: left };
}

/** 与权威帧的偏差超过此值时硬跳，不做平滑。 */
export const HARD_SYNC_THRESHOLD_MS = 300;

export function needsHardSync(localMs: number, serverMs: number): boolean {
  return Math.abs(localMs - serverMs) > HARD_SYNC_THRESHOLD_MS;
}

/** 仅用于提示"时间不多了"，不代表判负。 */
export function isLowTime(remainingMs: number, warnAtMs = 30_000): boolean {
  return remainingMs <= warnAtMs;
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (ms < 20_000) {
    const tenths = Math.floor((Math.max(0, ms) % 1000) / 100);
    return `${m}:${String(s).padStart(2, "0")}.${tenths}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}
