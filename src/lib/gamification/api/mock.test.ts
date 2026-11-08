import { describe, expect, it } from "vitest";

import { validated } from "./client";
import { createMockApi } from "./mock";

const now = () => new Date("2026-11-03T18:00:00Z");
const make = () => createMockApi({ latencyMs: 0, now, fixtures: [{ kickoff: "2026-11-02T20:00:00Z" }, { kickoff: "2026-11-03T20:00:00Z" }] });
const pred = (key: string, count = 1, matchId = "m1") => ({ idempotencyKey: key, matchId, kickoff: "2026-11-03T20:00:00Z", count, timeZone: "UTC" });

describe("mock gamification server", () => {
  it("returns schema-valid results", async () => {
    const api = validated(make());
    await expect(api.getProgress()).resolves.toMatchObject({ level: 7, totalXp: 1640 });
    await expect(api.submitPrediction(pred("k1"))).resolves.toMatchObject({ xpGained: 20, totalXp: 1660 });
  });

  it("rewards an idempotency key once, returning the same result", async () => {
    const api = make();
    const a = await api.submitPrediction(pred("k1"));
    const b = await api.submitPrediction(pred("k1"));
    expect(b).toEqual(a);
    expect(api.dev.state().totalXp).toBe(1660);
  });

  it("pays only for new predictions when a slip is re-locked", async () => {
    const api = make();
    await api.submitPrediction(pred("k1", 2));
    const again = await api.submitPrediction(pred("k2", 3));
    expect(again.xpGained).toBe(20);
  });

  it("sends one level-up per level crossed", async () => {
    const api = make();
    const r = await api.dev.grantXp(1500); // 1640 → 3140: level 7 → 10
    expect(r.levelUps.map((u) => u.level)).toEqual([8, 9, 10]);
    expect(r.newBadges.map((b) => b.id)).toEqual(["level-10"]);
    expect(r.levelUps[2].badge?.id).toBe("level-10");
  });

  it("halves XP past the daily soft cap and says so", async () => {
    const api = make(); // seeded with 240 earned today
    const r = await api.submitPrediction(pred("k1", 5)); // 100 base XP
    expect(r.xpGained).toBe(80); // 60 full + 40 halved
    expect(r.dailyXp.reduced).toBe(true);
  });

  it("fails offline without changing state", async () => {
    const api = make();
    api.dev.setOffline(true);
    await expect(api.submitPrediction(pred("k1"))).rejects.toMatchObject({ code: "offline" });
    expect(api.dev.state().totalXp).toBe(1640);
  });
});

describe("mock server: combo", () => {
  it("doubles XP from 3 right in a row, triples from 5, resets on a wrong answer", async () => {
    const api = make();
    const r = [];
    for (let i = 0; i < 5; i++) r.push(await api.dev.resolveLiveQuestion(true));
    expect(r.map((x) => x.comboMultiplier)).toEqual([1, 1, 2, 2, 3]);
    expect(r.map((x) => x.combo.count)).toEqual([1, 2, 3, 4, 5]);
    expect(r[4].xpGained).toBeGreaterThan(r[0].xpGained);
    const miss = await api.dev.resolveLiveQuestion(false);
    expect(miss).toMatchObject({ xpGained: 0, combo: { count: 0, multiplier: 1 } });
  });

  it("awards Hat-trick and Perfect five once each", async () => {
    const api = make();
    const ids: string[] = [];
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < 5; i++) ids.push(...(await api.dev.resolveLiveQuestion(true)).newBadges.map((b) => b.id));
      await api.dev.resolveLiveQuestion(false);
    }
    expect(ids).toEqual(["hat-trick", "perfect-five"]);
  });

  it("never multiplies prediction XP by the combo", async () => {
    const api = make();
    for (let i = 0; i < 3; i++) await api.dev.resolveLiveQuestion(true);
    expect((await api.submitPrediction(pred("k1"))).xpGained).toBe(10); // 20 base, halved: the cap was passed by the answers
    expect((await api.submitPrediction(pred("k1"))).comboMultiplier).toBe(1);
  });
});

describe("mock server: badges", () => {
  it("lists every badge, earned or not", async () => {
    const { badges } = await make().getBadges();
    expect(badges.find((b) => b.id === "prophet")?.earnedAt).not.toBeNull();
    expect(badges.find((b) => b.id === "hat-trick")?.earnedAt).toBeNull();
    expect(new Set(badges.map((b) => b.family))).toEqual(new Set(["level", "achievement", "social", "seasonal"]));
  });

  it("pins up to 3 earned badges and refuses the rest", async () => {
    const api = make();
    await expect(api.pinBadges(["prophet", "first-win", "level-5"])).resolves.toEqual({ pinnedBadges: ["prophet", "first-win", "level-5"] });
    await expect(api.pinBadges(["prophet", "first-win", "level-5", "level-10"])).rejects.toMatchObject({ code: "conflict" });
    await expect(api.pinBadges(["hat-trick"])).rejects.toMatchObject({ code: "conflict" }); // not earned
    expect((await api.getProgress()).pinnedBadges).toEqual(["prophet", "first-win", "level-5"]);
  });
});

describe("mock server: streak", () => {
  const fixtures = ["2026-11-02", "2026-11-03", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08", "2026-11-09"].map((d) => ({ kickoff: `${d}T20:00:00Z` }));
  const at = (day: string) => () => new Date(`${day}T12:00:00Z`);

  it("reports a broken run, and the next prediction starts at 1 keeping the best", async () => {
    const api = createMockApi({ latencyMs: 0, now: at("2026-11-03"), fixtures });
    api.dev.breakStreak();
    const p = await api.getProgress();
    expect(p.streak.status).toBe("broken");
    const r = await api.submitPrediction({ ...pred("k1"), timeZone: "UTC" });
    expect(r.streak).toMatchObject({ current: 1, best: 6, status: "active", incrementedNow: true });
  });

  it("pays the 7-day badge at the milestone", async () => {
    const api = createMockApi({
      latencyMs: 0,
      now: at("2026-11-09"),
      fixtures,
      initial: { streak: { current: 6, best: 6, lastDayKey: "2026-11-08", freezesHeld: 0, status: "active" } },
    });
    const r = await api.submitPrediction({ ...pred("k1"), kickoff: "2026-11-09T20:00:00Z", timeZone: "UTC" });
    expect(r.streak).toMatchObject({ current: 7, milestone: 7 });
    expect(r.newBadges.map((b) => b.id)).toEqual(["streak-7"]);
  });
});
