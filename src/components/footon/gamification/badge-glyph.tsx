import { Award, Eye, Flame, Handshake, Snowflake, Trophy, Users, type LucideIcon } from "lucide-react";

import type { Badge, BadgeFamily } from "@/lib/gamification/schemas";
import { cn } from "@/lib/utils";
import { TIER_ICON } from "./tier-badge";

const ICONS: Record<string, LucideIcon> = { trophy: Trophy, eye: Eye, flame: Flame, users: Users, handshake: Handshake, snowflake: Snowflake, ...TIER_ICON };

/**
 * Family is told by the tile's shape as well as its tone: level = rounded
 * square, achievement = circle, social = soft-cornered, seasonal = dashed ring.
 */
const FAMILY: Record<BadgeFamily, string> = {
  level: "rounded-sm bg-surface-3 text-foreground",
  achievement: "rounded-full bg-surface-3 text-foreground",
  social: "rounded-xl bg-surface-3 text-foreground",
  seasonal: "rounded-full border border-dashed border-line-strong bg-surface-2 text-foreground",
};

/** A badge's icon tile. `locked` = not earned yet: muted, still visible. */
export function BadgeGlyph({ badge, size = "md", locked = false, className }: { badge: Pick<Badge, "icon" | "family">; size?: "sm" | "md" | "lg"; locked?: boolean; className?: string }) {
  const Icon = ICONS[badge.icon] ?? Award;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center",
        FAMILY[badge.family],
        size === "sm" ? "size-8" : size === "md" ? "size-11" : "size-16",
        locked && "text-subtle opacity-70",
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-7" : size === "md" ? "size-5" : "size-4"} strokeWidth={2} />
    </span>
  );
}
