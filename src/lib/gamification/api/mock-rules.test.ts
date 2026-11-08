import { describe, expect, it } from "vitest";

import { mockConfig } from "../config";
import { matchDayKey } from "../day";
import type { Streak } from "../schemas";
import { cappedXp, levelFromXp, levelUpsBetween, streakOnPrediction, streakStatusOn } from "./mock-rules";

const curve = mockConfig.curves.default;
const M = [3, 7, 14, 30];
const streak = (over: Partial<Streak> = {}): Streak => ({ current: 3, best: 6, lastDayKey: "2026-11-01", freezesHeld: 0, status: "active", ...over });

describe("daily soft cap (mock server)", () => {
  it("pays full XP under the cap, half past it, split across the boundary", () => {
    expect(cappedXp(40, 100, 300, 0.5)).toBe(40);
    expect(cappedXp(40, 300, 300, 0.5)).toBe(20);
    expect(cappedXp(40, 280, 300, 0.5)).toBe(30); // 20 full + 20 halved
  });
});

describe("levels (mock server)", () => {
  it("derives the level and every level crossed", () => {
    expect(levelFromXp(1640, curve, 30)).toBe(7);
    expect(levelFromXp(1750, curve, 30)).toBe(8);
    expect(levelFromXp(10 ** 7, curve, 30)).toBe(30);
    const ups = levelUpsBetween(7, 10, mockConfig, () => null);
    expect(ups.map((u) => [u.level, u.tier, u.unlocks])).toEqual([
      [8, "reserve", ["fantasy"]],
      [9, "reserve", []],
      [10, "startingXI", ["stadium"]],
    ]);
  });
});

describe("streak (mock server)", () => {
  const days = ["2026-11-01", "2026-11-03", "2026-11-05"]; // match days only

  it("counts the first prediction of a match day, once", () => {
    const a = streakOnPrediction(streak(), "2026-11-03", days, M);
    expect(a).toMatchObject({ current: 4, incrementedNow: true, lastDayKey: "2026-11-03" });
    const b = streakOnPrediction(a, "2026-11-03", days, M);
    expect(b).toMatchObject({ current: 4, incrementedNow: false });
  });

  it("skips non-match days: they neither break nor extend it", () => {
    // 11-02 and 11-04 have no match: going 11-01 → 11-03 → 11-05 is unbroken
    const a = streakOnPrediction(streak(), "2026-11-03", days, M);
    const b = streakOnPrediction(a, "2026-11-05", days, M);
    expect(b.current).toBe(5);
    expect(streakStatusOn(a, "2026-11-04", days).status).toBe("active");
  });

  it("restarts at 1 after a missed match day with no freeze, keeping the best", () => {
    const r = streakOnPrediction(streak({ current: 6, best: 6 }), "2026-11-05", days, M);
    expect(r).toMatchObject({ current: 1, best: 6, freezeUsed: false });
    expect(streakStatusOn(streak({ current: 6 }), "2026-11-05", days).status).toBe("broken");
  });

  it("spends a freeze on a missed match day", () => {
    const r = streakOnPrediction(streak({ freezesHeld: 1 }), "2026-11-05", days, M);
    expect(r).toMatchObject({ current: 4, freezesHeld: 0, freezeUsed: true });
  });

  it("flags milestones at 3/7/14/30", () => {
    expect(streakOnPrediction(streak({ current: 2 }), "2026-11-03", days, M).milestone).toBe(3);
    expect(streakOnPrediction(streak({ current: 3 }), "2026-11-03", days, M).milestone).toBeNull();
  });

  it("ignores predictions on a day before the last counted one", () => {
    expect(streakOnPrediction(streak({ lastDayKey: "2026-11-03" }), "2026-11-01", days, M).incrementedNow).toBe(false);
  });

  it("keys a late kickoff by its start date in the user's timezone", () => {
    // 23:30 in Tehran on 3 Nov is 20:00 UTC: it belongs to 3 Nov, even if it ends after midnight
    expect(matchDayKey("2026-11-03T20:00:00Z", "Asia/Tehran")).toBe("2026-11-03");
    // the same instant is still 3 Nov in London, but a 00:30 Tehran kickoff is the 4th there
    expect(matchDayKey("2026-11-03T21:00:00Z", "Asia/Tehran")).toBe("2026-11-04");
    expect(matchDayKey("2026-11-03T21:00:00Z", "Europe/London")).toBe("2026-11-03");
  });
});
