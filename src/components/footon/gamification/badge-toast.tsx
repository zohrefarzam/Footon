"use client";

import type { Badge } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { BadgeGlyph } from "./badge-glyph";
import { CelebrationToast } from "./celebration-toast";
import { RarityLabel } from "./rarity-label";

/**
 * A new badge (achievement, social, seasonal). Level badges never come here:
 * they ride on their Level Up screen. Neutral: a badge is a keepsake, not a win.
 */
export function BadgeToast({ badge, onDismiss }: { badge: Badge; onDismiss: () => void }) {
  return (
    <CelebrationToast
      icon={<BadgeGlyph badge={badge} size="sm" className="bg-transparent" />}
      eyebrow={copy.newBadge}
      title={badge.name}
      detail={<RarityLabel pct={badge.rarityPct} />}
      onDismiss={onDismiss}
      dismissLabel={copy.skip}
    />
  );
}
