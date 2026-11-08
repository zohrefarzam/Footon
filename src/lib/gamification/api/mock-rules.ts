/**
 * The MOCK SERVER's rules. This file stands in for the backend so the UI can
 * run before it exists; nothing in the UI imports it. When the real API lands
 * it goes away with `mock.ts`.
 */
import { xpForLevel } from "../level";
import { tierFor } from "../level";
import { unlocksAt } from "../unlocks";
import type { Badge, GamificationConfig, LevelCurve, LevelUp, Streak, StreakUpdate } from "../schemas";

/** XP after the daily soft cap: full up to the cap, `overCapRate` past it. */
export function cappedXp(base: number, earnedToday: number, softCap: number, overCapRate: number): number {
  const room = Math.max(0, softCap - earnedToday);
  const full = Math.min(base, room);
  return full + Math.round((base - full) * overCapRate);
}

/** Highest level whose cumulative XP is reached. */
export function levelFromXp(totalXp: number, curve: LevelCurve, maxLevel: number): number {
  let l = 1;
  while (l < maxLevel && xpForLevel(l + 1, curve) <= totalXp) l++;
  return l;
}

export function levelUpsBetween(
  from: number,
  to: number,
  config: GamificationConfig,
  levelBadge: (level: number) => Badge | null,
): LevelUp[] {
  const ups: LevelUp[] = [];
  for (let l = from + 1; l <= to; l++) {
    ups.push({ level: l, tier: tierFor(l, config).id, unlocks: unlocksAt(l, config), badge: levelBadge(l) });
  }
  return ups;
}

/**
 * A real prediction on match day `dayKey`. Counts once per day, at the first
 * qualifying prediction. Days with no match neither break nor extend it; a
 * missed match day uses a freeze if one is held, otherwise the run restarts.
 */
export function streakOnPrediction(
  s: Streak,
  dayKey: string,
  matchDays: readonly string[],
  milestones: readonly number[],
): StreakUpdate {
  const same = { ...s, incrementedNow: false, milestone: null, freezeUsed: false };
  if (s.lastDayKey && dayKey <= s.lastDayKey) return same;

  let current: number;
  let freezesHeld = s.freezesHeld;
  let freezeUsed = false;
  if (!s.lastDayKey || s.current === 0 || s.status === "broken") {
    current = 1;
  } else {
    const missed = matchDays.filter((d) => d > s.lastDayKey! && d < dayKey).length;
    if (missed === 0) current = s.current + 1;
    else if (missed <= freezesHeld) {
      freezesHeld -= missed;
      freezeUsed = true;
      current = s.current + 1;
    } else current = 1;
  }
  return {
    current,
    best: Math.max(s.best, current),
    lastDayKey: dayKey,
    freezesHeld,
    status: "active",
    incrementedNow: true,
    milestone: milestones.includes(current) ? current : null,
    freezeUsed,
  };
}

/**
 * The streak as of `todayKey`, before any prediction today: broken when more
 * match days were missed since the last counted day than freezes can cover.
 * Today itself is never "missed" (there's still time to predict).
 */
export function streakStatusOn(s: Streak, todayKey: string, matchDays: readonly string[]): Streak {
  if (!s.lastDayKey || s.current === 0) return { ...s, status: "none" };
  const missed = matchDays.filter((d) => d > s.lastDayKey! && d < todayKey).length;
  return missed > s.freezesHeld ? { ...s, status: "broken" } : s;
}

/** The combo multiplier for `count` right answers in a row: the highest step reached. */
export function comboMultiplierFor(count: number, steps: readonly { at: number; multiplier: 1 | 2 | 3 }[]): 1 | 2 | 3 {
  let m: 1 | 2 | 3 = 1;
  for (const step of steps) if (count >= step.at) m = step.multiplier;
  return m;
}
