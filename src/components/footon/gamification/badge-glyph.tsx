import { Award, CalendarCheck, Eye, Flame, Handshake, Leaf, Lock, Snowflake, Trophy, Users, type LucideIcon } from "lucide-react";

import type { Badge } from "@/lib/gamification/schemas";
import { cn } from "@/lib/utils";
import { TIER_ICON } from "./tier-badge";

const ICONS: Record<string, LucideIcon> = { trophy: Trophy, eye: Eye, flame: Flame, calendar: CalendarCheck, leaf: Leaf, users: Users, handshake: Handshake, snowflake: Snowflake, ...TIER_ICON };

const SIZE = { sm: "size-8", md: "size-11", lg: "size-16" } as const;
const ICON = { sm: "size-4", md: "size-5", lg: "size-7" } as const;

/**
 * A badge as a medallion (the design's achievement medal): gold for a trophy
 * moment (`tier: "gold"`), a turf medal for the rest, and a muted disc with a
 * small lock when it isn't earned yet. Gold means "trophy", never coins.
 */
export function BadgeGlyph({
  badge,
  size = "md",
  locked = false,
  className,
}: {
  badge: Pick<Badge, "icon" | "tier">;
  size?: keyof typeof SIZE;
  locked?: boolean;
  className?: string;
}) {
  const Icon = ICONS[badge.icon] ?? Award;
  const gold = badge.tier === "gold" && !locked;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        SIZE[size],
        locked
          ? "bg-surface-2 text-subtle"
          : gold
            ? "bg-gold text-gold-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.18),0_0_0_3px_var(--gold-soft)]"
            : "bg-surface-3 text-foreground shadow-[inset_0_-3px_0_rgb(0_0_0/0.2)]",
        className,
      )}
    >
      <Icon className={ICON[size]} strokeWidth={2.2} />
      {locked && size !== "sm" && (
        <span className="absolute -end-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-line-strong bg-surface text-muted-foreground">
          <Lock className="size-3" strokeWidth={2.4} />
        </span>
      )}
    </span>
  );
}
