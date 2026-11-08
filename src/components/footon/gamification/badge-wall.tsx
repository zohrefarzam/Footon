"use client";

import { useEffect } from "react";
import { Lock, Pin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatPercent } from "@/lib/gamification/format";
import { useBadges, useConfig, usePinBadges, useProgress } from "@/lib/gamification/queries";
import type { Badge, BadgeFamily } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";
import { BadgeGlyph } from "./badge-glyph";

const FAMILIES: BadgeFamily[] = ["level", "achievement", "social", "seasonal"];

/**
 * Every badge, earned or not, grouped by family. Not-yet badges stay visible
 * (dashed, muted, lock) so you can see what's out there. Earned ones pin to
 * Profile, at most `pinnedBadgesMax`; the server confirms each change and the
 * buttons wait for it (no double submit).
 */
export function BadgeWall({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const badges = useBadges().data?.badges;
  const pinned = useProgress().data?.pinnedBadges ?? [];
  const max = useConfig().data?.pinnedBadgesMax ?? 3;
  const pin = usePinBadges();

  useEffect(() => {
    if (open) track("badge_wall_viewed");
  }, [open]);

  const earned = badges?.filter((b) => b.earnedAt).length ?? 0;
  const full = pinned.length >= max;

  const toggle = (b: Badge) => {
    if (pin.isPending) return;
    const next = pinned.includes(b.id) ? pinned.filter((id) => id !== b.id) : [...pinned, b.id];
    pin.mutate(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={copy.close} className="gap-5">
        <DialogHeader>
          <DialogTitle>{copy.allBadges}</DialogTitle>
          <DialogDescription>{badges ? `${copy.earnedOf(earned, badges.length)} earned` : " "}</DialogDescription>
        </DialogHeader>

        <p aria-live="polite" className="-mt-2 text-xs text-muted-foreground empty:hidden">
          {pin.isError ? copy.pinFailed : full ? copy.pinFull(max) : ""}
        </p>

        {FAMILIES.map((family) => {
          const list = badges?.filter((b) => b.family === family) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={family} aria-labelledby={`badges-${family}`} className="flex flex-col gap-2.5">
              <h3 id={`badges-${family}`} className="text-[13px] font-medium text-muted-foreground">
                {copy.badgeFamily[family]}
              </h3>
              <ul className="grid grid-cols-3 gap-2">
                {list.map((b) => {
                  const isPinned = pinned.includes(b.id);
                  return (
                    <li
                      key={b.id}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center",
                        b.earnedAt ? "border-line bg-surface" : "border-dashed border-line-strong",
                      )}
                    >
                      <BadgeGlyph badge={b} locked={!b.earnedAt} />
                      <p className={cn("text-[13px] leading-tight font-semibold", !b.earnedAt && "text-muted-foreground")}>{b.name}</p>
                      {b.description && <p className="sr-only">{b.description}</p>}
                      <p className="text-[11px] text-muted-foreground">
                        <span className="font-display text-[13px] font-bold text-foreground">{formatPercent(b.rarityPct)}</span>
                        <span className="sr-only"> {copy.rarity}</span>
                      </p>
                      {b.earnedAt ? (
                        <Button
                          variant={isPinned ? "soft" : "secondary"}
                          size="sm"
                          aria-pressed={isPinned}
                          aria-label={isPinned ? copy.unpinBadge(b.name) : copy.pinBadge(b.name)}
                          disabled={pin.isPending || (!isPinned && full)}
                          onClick={() => toggle(b)}
                          className="h-8 w-full rounded-sm px-2 text-xs"
                        >
                          <Pin className="size-3" aria-hidden="true" />
                          {isPinned ? copy.pinned : copy.pin}
                        </Button>
                      ) : (
                        <span className="flex h-8 items-center gap-1 text-[11px] text-muted-foreground">
                          <Lock className="size-3" aria-hidden="true" />
                          {copy.notEarned}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
