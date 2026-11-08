import { Armchair, ClipboardList, Crown, GraduationCap, Shield, Shirt, Star, type LucideIcon } from "lucide-react";

import type { TierId } from "@/lib/gamification/schemas";
import { cn } from "@/lib/utils";

/** Each tier has its own shape, so tiers never differ by colour alone. */
export const TIER_ICON: Record<TierId, LucideIcon> = {
  academy: GraduationCap,
  reserve: Armchair,
  startingXI: Shirt,
  star: Star,
  captain: Shield,
  legend: Crown,
  gaffer: ClipboardList,
};

const ROUNDEL = { md: { box: "size-10", icon: "size-[18px]" }, lg: { box: "size-16", icon: "size-7" } } as const;

/**
 * A tier as a competition roundel (like `LeagueBadge`: competitions are round):
 * a neutral disc with an inner ring and the tier's icon. Neutral, never lime
 * or gold: a tier is a rank, not a win or a trophy.
 */
export function TierRoundel({ tier, size = "md", className }: { tier: TierId; size?: keyof typeof ROUNDEL; className?: string }) {
  const Icon = TIER_ICON[tier];
  return (
    <span aria-hidden="true" className={cn("relative inline-flex shrink-0 items-center justify-center", ROUNDEL[size].box, className)}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full">
        <circle cx="20" cy="20" r="18.5" fill="var(--surface-3)" stroke="var(--dim-strong)" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="14.5" fill="none" stroke="var(--dim-strong)" strokeOpacity=".5" strokeWidth="1" />
      </svg>
      <Icon className={cn("relative text-foreground", ROUNDEL[size].icon)} strokeWidth={2} />
    </span>
  );
}

/**
 * The tier a level sits in (Academy … Gaffer). Neutral: a tier is a rank, not
 * a win, so it never takes lime. `sm` = chip, `lg` = the Level Up tile.
 */
export function TierBadge({ tier, name, size = "sm", className }: { tier: TierId; name: string; size?: "sm" | "lg"; className?: string }) {
  const Icon = TIER_ICON[tier];
  if (size === "lg") {
    return (
      <span className={cn("inline-flex flex-col items-center gap-2", className)}>
        <TierRoundel tier={tier} size="lg" />
        <span className="text-[15px] font-semibold">{name}</span>
      </span>
    );
  }
  return (
    <span
      className={cn("inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-surface-3 ps-2 pe-2.5 text-xs font-semibold", className)}
    >
      <Icon className="size-3.5 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
      {name}
    </span>
  );
}
