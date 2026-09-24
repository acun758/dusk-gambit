/** 复盘胜率折线：由逐手评估（白方视角厘兵）换算白方胜率，点击跳到该手。 */
import { memo } from "react";

export function winPct(cp: number) {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

function WinRateChartBase({
  cps,
  index,
  onPick,
  label,
}: {
  cps: number[];
  index: number;
  onPick: (ply: number) => void;
  label: string;
}) {
  const W = 600;
  const H = 140;
  const pts = [50, ...cps.map(winPct)];
  const n = pts.length - 1 || 1;
  const x = (i: number) => (i / n) * W;
  const y = (p: number) => H - (p / 100) * H;
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join("");
  const area = `${line}L${W},${H}L0,${H}Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-32 w-full cursor-pointer touch-none"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onPick(Math.round(((e.clientX - r.left) / r.width) * n));
      }}
    >
      <rect width={W} height={H} className="fill-surface-container-lowest" />
      <path d={area} className="fill-on-surface/80" />
      <line x1={0} x2={W} y1={H / 2} y2={H / 2} className="stroke-outline" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
      <path d={line} fill="none" className="stroke-primary" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      <line x1={x(index)} x2={x(index)} y1={0} y2={H} className="stroke-secondary" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export const WinRateChart = memo(WinRateChartBase);
