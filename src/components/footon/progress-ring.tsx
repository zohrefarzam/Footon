import { cn } from "@/lib/utils";

/** Circular progress (e.g. fantasy unlock "3/5"). Lime arc on a zinc track. */
export function ProgressRing({
  value,
  max,
  size = 44,
  stroke = 4,
  label,
  className,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  return (
    <span
      role="img"
      aria-label={`${value} of ${max}`}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-spring-soft"
        />
      </svg>
      <span aria-hidden="true" className="absolute font-display text-sm font-bold">
        {label ?? `${value}/${max}`}
      </span>
    </span>
  );
}
