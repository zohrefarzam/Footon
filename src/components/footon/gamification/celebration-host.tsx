"use client";

import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { CircleCheck } from "lucide-react";

import { useSplashDone } from "@/components/footon/splash-gate";
import { isBlocking, type Celebration } from "@/lib/gamification/celebrations/expand";
import { useCelebrations } from "@/lib/gamification/celebrations/store";
import { curveFor, tierFor } from "@/lib/gamification/level";
import { useConfig, useFlags } from "@/lib/gamification/queries";
import type { FeatureFlags, GamificationConfig } from "@/lib/gamification/schemas";
import { copy } from "@/lib/gamification/strings";
import { track } from "@/lib/track";
import { BadgeToast } from "./badge-toast";
import { CelebrationToast } from "./celebration-toast";
import { LevelUpScreen } from "./level-up-screen";
import { StreakBrokenWatcher } from "./streak-broken-sheet";
import { StreakTick } from "./streak";
import { XpGainBurst } from "./xp-gain-burst";

/** How long each non-blocking moment stays before the next one plays (ms). */
export const HOLD: Record<Exclude<Celebration["kind"], "levelUp">, number> = {
  xp: 1600,
  streak: 2000,
  badge: 2800,
  quest: 2200,
};

export function announcement(c: Celebration, config: GamificationConfig | undefined): string {
  switch (c.kind) {
    case "xp":
      return copy.announceXp(c.xpGained, c.coinsGained, c.comboMultiplier);
    case "streak":
      return copy.announceStreak(c.streak.current);
    case "levelUp":
      return copy.announceLevel(c.level, config ? tierFor(c.level, config).name : "");
    case "badge":
      return copy.announceBadge(c.badge.name);
    case "quest":
      return copy.announceQuest(c.quest.title);
  }
}

/**
 * Plays the celebration queue, one at a time, for the whole app. Non-blocking
 * moments play and move on (tap to skip); the Level Up screen waits for the
 * user. Pauses while the launch splash is up or the tab is hidden. Every
 * moment is announced in one polite live region.
 */
export function CelebrationHost() {
  const current = useCelebrations((s) => s.current);
  const advance = useCelebrations((s) => s.advance);
  const setPaused = useCelebrations((s) => s.setPaused);
  const splashDone = useSplashDone();
  const config = useConfig().data;
  const flags = useFlags().data;

  useEffect(() => {
    const sync = () => setPaused(!splashDone || document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [splashDone, setPaused]);

  useEffect(() => {
    if (!current || isBlocking(current)) return;
    if (current.kind === "badge") track("badge_toast_viewed", { badge: current.badge.id });
    if (current.kind === "quest") track("quest_completed_viewed", { quest: current.quest.questId });
    const t = setTimeout(advance, HOLD[current.kind]);
    return () => clearTimeout(t);
  }, [current, advance]);

  const text = current && current.kind !== "levelUp" ? announcement(current, config) : "";

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {text}
      </div>
      {/* top: XP under the island */}
      <div className="pointer-events-none fixed inset-x-0 top-[calc(66px+env(safe-area-inset-top))] z-40 mx-auto flex max-w-[430px] justify-center px-5">
        <AnimatePresence>
          {current?.kind === "xp" && config && flags && (
            <XpGainBurst
              key={current.key}
              xpGained={current.xpGained}
              coinsGained={current.coinsGained}
              fromXp={current.fromXp}
              toXp={current.toXp}
              level={current.level}
              reduced={current.reduced}
              comboMultiplier={current.comboMultiplier}
              curve={curveFor(config, flags.levelCurve)}
              maxLevel={config.maxLevel}
            />
          )}
        </AnimatePresence>
      </div>
      {/* bottom: toasts above the dock */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(100px+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-[430px] px-5">
        <AnimatePresence>{current && <Toast key={current.key} c={current} onDismiss={advance} />}</AnimatePresence>
      </div>
      <StreakBrokenWatcher />
      {current?.kind === "levelUp" && config && flags && (
        <LevelUp key={current.key} c={current} config={config} shareStyle={flags.levelUpShareStyle} onDone={advance} />
      )}
    </>
  );
}

function LevelUp({
  c,
  config,
  shareStyle,
  onDone,
}: {
  c: Extract<Celebration, { kind: "levelUp" }>;
  config: GamificationConfig;
  shareStyle: FeatureFlags["levelUpShareStyle"];
  onDone: () => void;
}) {
  return (
    <LevelUpScreen
      level={c.level}
      tier={c.tier}
      tierName={tierFor(c.level, config).name}
      tierChanged={c.tierChanged}
      unlocks={c.unlocks}
      badge={c.badge}
      shareStyle={shareStyle}
      onDone={onDone}
    />
  );
}

function Toast({ c, onDismiss }: { c: Celebration; onDismiss: () => void }) {
  switch (c.kind) {
    case "streak":
      return <StreakTick streak={c.streak} onDismiss={onDismiss} />;
    case "badge":
      return <BadgeToast badge={c.badge} onDismiss={onDismiss} />;
    case "quest":
      return (
        <CelebrationToast
          icon={<CircleCheck className="size-5" strokeWidth={2.2} />}
          title={copy.announceQuest(c.quest.title)}
          onDismiss={onDismiss}
          dismissLabel={copy.skip}
        />
      );
    default:
      return null;
  }
}
