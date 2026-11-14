import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

/** Pulsing amber dot. Only for things happening right now. */
export function LiveDot({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("size-[7px] shrink-0 rounded-full bg-live animate-live-pulse", className)} />;
}

/** "● زنده ۶۷'" — the minute is always in the display font. */
export function LiveMinute({ minute, className }: { minute: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-display text-base font-bold text-live", className)}>
      <LiveDot />
      زنده {formatNumber(minute)}&apos;
    </span>
  );
}
