import { formatPercent } from "@/lib/gamification/format";
import type { Badge } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { cn } from "@/lib/utils";
import { BadgeGlyph } from "./gamification/badge-glyph";

/**
 * One badge as a medallion tile. Gold tier (wins, top streaks, the top level
 * tiers) gets the gold medal on a gold-soft tile; standard ones a turf medal;
 * badges not earned yet are dashed and muted with a lock and what earns them.
 * Under the name: how rare it is. `footer` holds an action (the wall's Pin).
 */
export function AchievementBadge({ badge: b, footer, className }: { badge: Badge; footer?: React.ReactNode; className?: string }) {
  const locked = !b.earnedAt;
  const gold = b.tier === "gold" && !locked;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 pt-3.5 pb-3 text-center",
        locked ? "border-dashed border-line-strong" : gold ? "border-gold-line bg-gold-soft" : "border-line bg-surface",
        className,
      )}
    >
      <BadgeGlyph badge={b} locked={locked} />
      <span className={cn("w-full truncate text-[13px] font-semibold", locked && "text-muted-foreground")}>{b.name}</span>
      <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
        <span className="sr-only">{locked ? `${copy.notEarned}. ` : ""}</span>
        {locked && b.description ? (
          b.description
        ) : (
          <>
            <span className="font-display text-[13px] font-bold text-foreground">{formatPercent(b.rarityPct)}</span>
            <span className="sr-only"> {copy.rarity}</span>
          </>
        )}
      </span>
      {footer}
    </div>
  );
}
