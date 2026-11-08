import { ArrowUp, Eye, Flame, Lock, Shield, Swords, Trophy } from "lucide-react";

import type { Achievement } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICONS = { trophy: Trophy, flame: Flame, eye: Eye, swords: Swords, shield: Shield, "arrow-up": ArrowUp } as const;

/**
 * One achievement as a medallion tile. Gold tier (wins, promotions) gets the
 * gold medal; standard ones a turf medal; locked ones are dashed and muted with
 * a lock and what unlocks them. Gold means "trophy", never coins.
 */
export function AchievementBadge({ achievement: a, className }: { achievement: Achievement; className?: string }) {
  const Icon = ICONS[a.icon];
  const locked = !a.earned;
  const gold = a.tier === "gold" && !locked;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 pt-3.5 pb-3 text-center",
        locked ? "border-dashed border-line-strong" : gold ? "border-gold-line bg-gold-soft" : "border-line bg-surface",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative flex size-11 items-center justify-center rounded-full",
          locked
            ? "bg-surface-2 text-subtle"
            : gold
              ? "bg-gold text-gold-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.18),0_0_0_3px_var(--gold-soft)]"
              : "bg-surface-3 text-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.2)]",
        )}
      >
        <Icon className="size-5" strokeWidth={2.2} />
        {locked && (
          <span className="absolute -end-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-line-strong bg-surface text-muted-foreground">
            <Lock className="size-3" strokeWidth={2.4} />
          </span>
        )}
      </span>
      <span className={cn("w-full truncate text-[13px] font-semibold", locked && "text-muted-foreground")}>{a.label}</span>
      <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
        <span className="sr-only">{locked ? "Locked. " : `Earned ${a.earned}. `}</span>
        {a.detail}
      </span>
    </div>
  );
}
