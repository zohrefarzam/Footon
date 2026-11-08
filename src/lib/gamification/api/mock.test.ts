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
