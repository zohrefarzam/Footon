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

/**
 * The tier a level sits in (آکادمی … مربی). Neutral: a tier is a rank, not
 * a win, so it never takes lime. `sm` = chip, `lg` = the Level Up tile.
 */
export function TierBadge({ tier, name, size = "sm", className }: { tier: TierId; name: string; size?: "sm" | "lg"; className?: string }) {
  const Icon = TIER_ICON[tier];
  if (size === "lg") {
    return (
      <span dir="rtl" lang="fa" className={cn("fa-scope inline-flex flex-col items-center gap-2", className)}>
        <span className="flex size-16 items-center justify-center rounded-2xl border border-line-strong bg-surface-2">
          <Icon className="size-7 text-foreground" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <span className="text-[15px] font-semibold">{name}</span>
      </span>
    );
  }
  return (
    <span
      dir="rtl"
      lang="fa"
      className={cn("fa-scope inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-surface-3 ps-2 pe-2.5 text-xs font-semibold", className)}
    >
      <Icon className="size-3.5 text-muted-foreground" strokeWidth={2.2} aria-hidden="true" />
      {name}
    </span>
  );
}
