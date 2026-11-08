"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { LockOpen, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardRow } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/gamification/format";
import type { Badge, FeatureFlags, FeatureId, TierId } from "@/lib/gamification/schemas";
import { shareToTelegram } from "@/lib/gamification/share";
import { copy, featureName } from "@/lib/gamification/strings";
import { track } from "@/lib/track";
import { RarityLabel } from "./rarity-label";
import { BadgeGlyph } from "./badge-glyph";
import { TierBadge } from "./tier-badge";

/**
 * The one celebration that holds the user: new level (display 88), its tier,
 * the level badge if this level awards one, and what just opened. One lime
 * "Continue"; sharing is a secondary button (style from the A/B flag), never
 * a prompt. Focus is trapped while open and returns where it was after.
 */
export function LevelUpScreen({
  level,
  tier,
  tierName,
  tierChanged,
  unlocks,
  badge,
  shareStyle,
  onDone,
}: {
  level: number;
  tier: TierId;
  tierName: string;
  tierChanged: boolean;
  unlocks: FeatureId[];
  badge: Badge | null;
  shareStyle: FeatureFlags["levelUpShareStyle"];
  onDone: () => void;
}) {
  const [open, setOpen] = useState(true);
  const reduce = useReducedMotion();
  const continueRef = useRef<HTMLButtonElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    track("level_up_viewed", { level });
  }, [level]);

  const close = (next: boolean) => {
    if (next) return;
    setOpen(false);
    // let the fade-out play, then hand over to the next celebration
    setTimeout(onDone, reduce ? 0 : 180);
  };

  const share = async () => {
    const method = await shareToTelegram({ text: copy.shareLevelText(level, tierName) });
    if (method) track("card_shared", { surface: "level_up", method });
  };

  const rise = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { type: "spring" as const, stiffness: 380, damping: 30, delay: 0.25 + i * 0.08 } };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        variant="full"
        closeLabel={copy.close}
        className="gap-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          continueRef.current?.focus();
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          if (returnTo.current?.isConnected) returnTo.current.focus();
        }}
      >
        <div className="flex flex-1 flex-col items-center pt-10 text-center">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">{copy.levelUpEyebrow}</p>
          <motion.p
            aria-hidden="true"
            className="mt-1 font-display text-[88px] leading-none font-bold"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 18 }}
          >
            {formatNumber(level)}
          </motion.p>
          <DialogTitle className="mt-2 text-[26px]">{copy.levelUpTitle(level)}</DialogTitle>
          <DialogDescription className="sr-only">{copy.announceLevel(level, tierName)}</DialogDescription>

          <motion.div {...rise(0)} className="mt-5 flex flex-col items-center gap-1.5">
            <TierBadge tier={tier} name={tierName} size="lg" />
            {tierChanged && <span className="rounded-full bg-surface-3 px-2.5 py-1 text-xs font-semibold text-muted-foreground">{copy.newTier}</span>}
          </motion.div>

          <div className="mt-6 flex w-full flex-col gap-2.5 text-start">
            {badge && (
              <motion.div {...rise(1)}>
                <Card className="flex items-center gap-3 px-4 py-3.5">
                  <BadgeGlyph badge={badge} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{copy.levelBadge}</p>
                    <p className="text-[15px] font-semibold">{badge.name}</p>
                  </div>
                  <RarityLabel pct={badge.rarityPct} />
                </Card>
              </motion.div>
            )}
            {unlocks.length > 0 && (
              <motion.div {...rise(2)}>
                <Card className="overflow-hidden">
                  {unlocks.map((f) => (
                    <CardRow key={f}>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-3">
                        <LockOpen className="size-4 text-foreground" strokeWidth={2.2} aria-hidden="true" />
                      </span>
                      <p className="min-w-0 flex-1 text-[15px] font-semibold">{featureName[f]}</p>
                      <span className="text-xs text-muted-foreground">{copy.unlockedNow}</span>
                    </CardRow>
                  ))}
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        <div className={shareStyle === "icon" ? "mt-6 flex gap-2.5" : "mt-6 flex flex-col gap-2.5"}>
          <Button ref={continueRef} size="lg" className={shareStyle === "icon" ? "flex-1" : undefined} onClick={() => close(false)}>
            {copy.continue}
          </Button>
          {shareStyle === "icon" ? (
            <Button variant="secondary" size="icon-lg" aria-label={copy.share} onClick={share}>
              <Share2 aria-hidden="true" />
            </Button>
          ) : (
            <Button variant="secondary" size="lg" onClick={share}>
              <Share2 aria-hidden="true" />
              {copy.share}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
