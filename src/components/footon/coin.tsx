import { cn } from "@/lib/utils";
import { NumberTicker } from "./number-ticker";
import { formatNumber } from "@/lib/format";

/** The Footon coin ("ف"). Amber, always — coins are never lime. */
export function Coin({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-live text-[11px] font-extrabold text-live-foreground shadow-[inset_0_-2px_0_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      ف
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
        "inline-flex h-[34px] items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 pe-3 ps-1.5",
        className,
      )}
    >
      <Coin />
      <span className="font-display text-lg font-bold tabular-nums">
        {animate ? <NumberTicker value={value} /> : formatNumber(value)}
      </span>
      <span className="sr-only">سکه</span>
    </span>
  );
}

/**
 * A coin amount in a row: display font, the coin after it. Gains are amber
 * (coins always are); spends drop to neutral with a minus sign, since paying an
 * entry isn't a loss.
 */
export function CoinAmount({
  value,
  signed = false,
  className,
}: {
  value: number;
  /** Show `+` / `−`. Off for prices. */
  signed?: boolean;
  className?: string;
}) {
  const spend = signed && value < 0;
  const text = `${signed ? (value < 0 ? "−" : "+") : ""}${formatNumber(Math.abs(value))}`;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 font-display text-lg font-bold tabular-nums", spend ? "text-muted-foreground" : "text-live", className)}>
      {text}
      <Coin className="size-4 text-[8px]" />
      <span className="sr-only">{spend ? "سکه خرج شد" : "سکه"}</span>
    </span>
  );
}
