import type { RewardResult } from "./schemas";

/** A plain, schema-shaped RewardResult for tests; override what the test is about. */
export function result(over: Partial<RewardResult> = {}): RewardResult {
  return {
    id: "r1",
    action: "prediction",
    xpGained: 40,
    coinsGained: 40,
    totalXp: 1680,
    level: 7,
    levelUps: [],
    newBadges: [],
    streak: { current: 3, best: 6, lastDayKey: "2026-11-03", freezesHeld: 1, status: "active", incrementedNow: false, milestone: null, freezeUsed: false },
    questProgress: [],
    comboMultiplier: 1,
    combo: { count: 0, multiplier: 1 },
    dailyXp: { earned: 280, softCap: 300, reduced: false },
    coins: { free: 6490, premium: 0 },
    ...over,
  };
}
