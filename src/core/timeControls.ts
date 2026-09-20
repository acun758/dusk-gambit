/**
 * core/timeControls.ts —— 赛制（时限）定义，纯数据，零 React / 零 DOM。
 *
 * 服务端只接受这里列出的四种组合，其余一律回落到 3+2。
 * 天梯分是统一一套，不按赛制分榜。
 */

export type TimeControlId = "bullet" | "blitz" | "rapid" | "classical";

export interface TimeControl {
  id: TimeControlId;
  /** 基础用时（毫秒） */
  base: number;
  /** 每步补时（毫秒） */
  inc: number;
  /** 通用写法，如 3+2 */
  label: string;
  zh: string;
  en: string;
  /** 一句话说明 */
  descZh: string;
  /** 一句话说明（英文） */
  descEn: string;
}

export const TIME_CONTROLS: TimeControl[] = [
  { id: "bullet", base: 60_000, inc: 0, label: "1+0", zh: "超快棋", en: "Bullet", descZh: "一分钟定胜负，考验直觉", descEn: "One minute each — pure instinct" },
  { id: "blitz", base: 180_000, inc: 2_000, label: "3+2", zh: "快棋", en: "Blitz", descZh: "默认赛制，节奏紧凑", descEn: "The default pace — tight and sharp" },
  { id: "rapid", base: 600_000, inc: 0, label: "10+0", zh: "快速", en: "Rapid", descZh: "有时间算清战术", descEn: "Room to calculate tactics" },
  { id: "classical", base: 900_000, inc: 10_000, label: "15+10", zh: "慢棋", en: "Classical", descZh: "适合完整构思与长考", descEn: "For full plans and deep thought" },
];

export const DEFAULT_TIME_CONTROL: TimeControlId = "blitz";

export function timeControl(id: TimeControlId): TimeControl {
  return TIME_CONTROLS.find((t) => t.id === id) ?? TIME_CONTROLS[1]!;
}

/** 按基础时间与补时反查赛制；未列出的组合返回 null。 */
export function matchTimeControl(base: number, inc: number): TimeControl | null {
  return TIME_CONTROLS.find((t) => t.base === base && t.inc === inc) ?? null;
}

/** 棋局用的时限文字，如「3+2 快棋」；非标准组合直接按分钟显示。 */
export function timeControlLabel(base: number, inc: number): string {
  const tc = matchTimeControl(base, inc);
  if (tc) return `${tc.label} ${tc.zh}`;
  return `${Math.round(base / 60000)}+${Math.round(inc / 1000)}`;
}
