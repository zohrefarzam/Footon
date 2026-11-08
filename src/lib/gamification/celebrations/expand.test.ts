import { describe, expect, it } from "vitest";

import { mockConfig } from "../config";
import { tierFor } from "../level";
import type { Badge, RewardResult } from "../schemas";
import { expandReward } from "./expand";

const badge = (over: Partial<Badge>): Badge => ({ id: "b", family: "achievement", name: "B", icon: "trophy", rarityPct: 10, earnedAt: null, ...over });

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
    dailyXp: { earned: 280, softCap: 300, reduced: false },
    coins: { free: 6490, premium: 0 },
    ...over,
  };
}

const tierOf = (l: number) => tierFor(l, mockConfig).id;
const kinds = (r: RewardResult) => expandReward(r, { totalXp: 1640, level: 7 }, tierOf).map((c) => c.kind);

describe("expandReward", () => {
  it("plays XP alone for a plain result", () => {
    const [xp, ...rest] = expandReward(result(), { totalXp: 1640, level: 7 }, tierOf);
    expect(rest).toHaveLength(0);
    expect(xp).toMatchObject({ kind: "xp", xpGained: 40, fromXp: 1640, toXp: 1680, level: 7 });
  });

  it("orders XP → streak → level ups → badges → quests", () => {
    const r = result({
      totalXp: 2700,
      level: 9,
      levelUps: [
        { level: 9, tier: "reserve", unlocks: [], badge: null },
        { level: 8, tier: "reserve", unlocks: ["fantasy"], badge: null },
      ],
      newBadges: [badge({ id: "social-1", family: "social" })],
      streak: { ...result().streak, current: 4, incrementedNow: true },
      questProgress: [
        { questId: "q1", title: "Q1", progress: 3, target: 3, completedNow: true },
        { questId: "q2", title: "Q2", progress: 1, target: 3, completedNow: false },
      ],
    });
    expect(kinds(r)).toEqual(["xp", "streak", "levelUp", "levelUp", "badge", "quest"]);
    const ups = expandReward(r, { totalXp: 1640, level: 7 }, tierOf).filter((c) => c.kind === "levelUp");
    expect(ups.map((u) => u.kind === "levelUp" && u.level)).toEqual([8, 9]); // ascending, one per level
  });

  it("folds a level badge into its Level Up screen instead of a toast", () => {
    const lb = badge({ id: "level-10", family: "level", level: 10 });
    const r = result({ level: 10, levelUps: [{ level: 10, tier: "startingXI", unlocks: ["stadium"], badge: null }], newBadges: [lb] });
    const items = expandReward(r, { totalXp: 2600, level: 9 }, tierOf);
    expect(items.map((c) => c.kind)).toEqual(["xp", "levelUp"]);
    expect(items[1]).toMatchObject({ kind: "levelUp", badge: { id: "level-10" }, tierChanged: true });
  });

  it("never drops a level badge that has no matching screen", () => {
    const r = result({ newBadges: [badge({ id: "level-5", family: "level", level: 5 })] });
    expect(kinds(r)).toEqual(["xp", "badge"]);
  });

  it("marks only real tier changes", () => {
    const r = result({
      level: 10,
      levelUps: [
        { level: 9, tier: "reserve", unlocks: [], badge: null },
        { level: 10, tier: "startingXI", unlocks: [], badge: null },
      ],
    });
    const ups = expandReward(r, { totalXp: 2000, level: 8 }, tierOf).filter((c) => c.kind === "levelUp");
    expect(ups.map((u) => u.kind === "levelUp" && u.tierChanged)).toEqual([false, true]);
  });

  it("skips XP when none was gained but still ticks the streak", () => {
    expect(kinds(result({ xpGained: 0, streak: { ...result().streak, incrementedNow: true } }))).toEqual(["streak"]);
  });

  it("gives every item a key unique to its result", () => {
    const keys = expandReward(result({ levelUps: [{ level: 8, tier: "reserve", unlocks: [], badge: null }] }), null).map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.every((k) => k.startsWith("r1:"))).toBe(true);
  });
});
