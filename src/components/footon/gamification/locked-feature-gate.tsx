"use client";

import { Lock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/gamification/format";
import { levelProgress, xpForLevel, xpToLevel } from "@/lib/gamification/level";
import { useLevel } from "@/lib/gamification/queries";
import type { FeatureId } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { isUnlocked, requiredLevel } from "@/lib/gamification/unlocks";
import { cn } from "@/lib/utils";
import { XpTrack } from "./level-progress-bar";

type Variant = "card" | "row" | "button";

/**
 * Renders `children` when the user's level opens `feature`; otherwise a
 * visible locked stand-in with "Level X required". Locked things are never
 * hidden, and the core loop is never locked (see `unlocks.ts`).
 *
 * - `card`: a dashed card with the XP still to go (shown, not told).
 * - `row`: a list row inside a `Card`, for a gated `CardRow`/link row.
 * - `button`: a dashed stand-in the size of the gated button (`lg` 56px, `sm` 40px).
 *
 * `title` names the locked thing ("Start a league").
 */
export function LockedFeatureGate({
  feature,
  title,
  variant = "card",
  size = "lg",
  className,
  children,
}: {
  feature: FeatureId;
  title: string;
  variant?: Variant;
  size?: "sm" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  const lv = useLevel();

  // until the server answers, hold the space without claiming locked or open
  if (!lv) return <Pending variant={variant} size={size} title={title} className={className} />;
  if (isUnlocked(feature, lv.progress.level, lv.config)) return <>{children}</>;

  const need = requiredLevel(feature, lv.config);
  const label = copy.levelRequired(need);
  const aria = `${title}, ${copy.locked}. ${label}`;

  if (variant === "button") {
    return (
      <div
        role="group"
        aria-label={aria}
        data-locked={feature}
        className={cn(
          "flex items-center justify-center gap-2 border border-dashed border-line-strong bg-surface text-muted-foreground",
          size === "lg" ? "h-14 rounded-lg px-5 text-[15px] font-semibold" : "h-10 rounded-sm px-3 text-[13px] font-semibold",
          className,
        )}
      >
        <Lock className="size-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
        <span aria-hidden="true" className="truncate">
          {title}
        </span>
        <span aria-hidden="true" className={cn("shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-xs text-foreground", size === "sm" && "max-[359px]:hidden")}>
          {size === "sm" ? copy.levelN(need) : label}
        </span>
      </div>
    );
  }

  if (variant === "row") {
    return (
      <div role="group" aria-label={aria} data-locked={feature} className={cn("flex items-center gap-3 px-4 py-3.5", className)}>
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-dashed border-line-strong">
          <Lock className="size-4 text-muted-foreground" strokeWidth={2.2} />
        </span>
        <div aria-hidden="true" className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-muted-foreground">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    );
  }

  const { progress, curve, config } = lv;
  // progress across the whole climb from the current level to the one needed
  const start = xpForLevel(progress.level, curve);
  const goal = xpForLevel(need, curve);
  const pct = goal > start ? (progress.totalXp - start) / (goal - start) : levelProgress(progress.totalXp, progress.level, curve, config.maxLevel).pct;
  const toGo = xpToLevel(progress.totalXp, need, curve);

  return (
    <Card variant="dashed" role="group" aria-label={`${aria}. ${copy.xpToGo(toGo)}`} data-locked={feature} className={cn("bg-dots flex flex-col gap-3 p-4", className)}>
      <div aria-hidden="true" className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-2">
          <Lock className="size-5 text-muted-foreground" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">{title}</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{label}</p>
        </div>
      </div>
      <div aria-hidden="true" className="flex items-center gap-2.5">
        <span className="shrink-0 font-display text-[15px] font-bold">{copy.levelShort} {formatNumber(progress.level)}</span>
        <XpTrack pct={pct} className="flex-1" />
        <span className="shrink-0 font-display text-[15px] font-bold text-muted-foreground">{copy.levelShort} {formatNumber(need)}</span>
      </div>
      <p aria-hidden="true" className="-mt-1 text-xs text-muted-foreground">{copy.xpToGo(toGo)}</p>
    </Card>
  );
}

function Pending({ variant, size, title, className }: { variant: Variant; size: "sm" | "lg"; title: string; className?: string }) {
  if (variant === "button")
    return <Skeleton className={cn(size === "lg" ? "h-14 rounded-lg" : "h-10 w-24 rounded-sm", className)} />;
  if (variant === "row")
    return (
      <div aria-busy="true" className={cn("flex items-center gap-3 px-4 py-3.5", className)}>
        <span className="size-9 rounded-sm bg-surface-2" />
        <p className="text-[15px] font-semibold text-muted-foreground">{title}</p>
      </div>
    );
  return (
    <Card variant="dashed" aria-busy="true" className={cn("flex h-[124px] items-center p-4", className)}>
      <p className="text-[15px] font-semibold text-muted-foreground">{title}</p>
    </Card>
  );
}
