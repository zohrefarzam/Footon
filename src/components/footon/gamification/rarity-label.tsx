import { formatPercent } from "@/lib/gamification/format";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";

/** How rare a badge is, as the share of players who hold it: "9.5% of players have it". */
export function RarityLabel({ pct, className }: { pct: number; className?: string }) {
  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      <span className="font-display text-[13px] font-bold text-foreground">{formatPercent(pct)}</span> {copy.rarity}
    </span>
  );
}
