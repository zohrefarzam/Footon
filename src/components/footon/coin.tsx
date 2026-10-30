import { cn } from "@/lib/utils";
import { NumberTicker } from "./number-ticker";

/** The Footon coin. Amber, always — coins are never lime. */
export function Coin({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-live text-[11px] font-extrabold text-live-foreground shadow-[inset_0_-2px_0_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      F
    </span>
  );
}

export function CoinBadge({
  value,
  animate = false,
  className,
}: {
  value: number;
  /** Count up from 0 on mount (wallet reveals, rewards). */
  animate?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[34px] items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 pr-3 pl-1.5",
        className,
      )}
    >
      <Coin />
      <span className="font-display text-lg font-bold tabular-nums">
        {animate ? <NumberTicker value={value} /> : value.toLocaleString("en-US")}
      </span>
      <span className="sr-only">coins</span>
    </span>
  );
}
