import { describe, expect, it } from "vitest";

import { advanceQuests, QUEST_TEMPLATES, seedQuests } from "./mock-quests";

const t = (id: string) => QUEST_TEMPLATES.find((q) => q.id === id)!;

describe("quests (mock server)", () => {
  it("completes a quest once and pays its reward once", () => {
    const a = advanceQuests(seedQuests(), [t("d-easy")], [{ type: "prediction", count: 1 }]);
    expect(a.changes).toEqual([{ questId: "d-easy", title: "یک پیش‌بینی بکن", progress: 1, target: 1, completedNow: true, reward: { xp: 30, coins: 30 } }]);
    expect(a.bonus).toEqual({ xp: 30, coins: 30 });
    const b = advanceQuests(a.state, [t("d-easy")], [{ type: "prediction", count: 1 }]);
    expect(b.changes).toEqual([]);
    expect(b.bonus).toEqual({ xp: 0, coins: 0 });
  });

  it("reports progress without completing, and clamps at the target", () => {
    const a = advanceQuests(seedQuests(), [t("d-social")], [{ type: "liveAnswer" }]);
    expect(a.changes[0]).toMatchObject({ progress: 1, target: 2, completedNow: false });
    expect(a.changes[0].reward).toBeUndefined();
    const g = advanceQuests(seedQuests(), [t("g-calls")], [{ type: "prediction", count: 40 }]);
    expect(g.changes[0]).toMatchObject({ progress: 50, completedNow: true });
  });

  it("counts the best run for the in-a-row challenge, not a total", () => {
    let st = seedQuests();
    for (const combo of [1, 2, 0, 1]) st = advanceQuests(st, [t("d-challenge")], [{ type: "liveResult", correct: combo > 0, combo }]).state;
    expect(st["d-challenge"]).toEqual({ progress: 2, completed: false });
  });

  it("leaves quests that aren't active alone", () => {
    const a = advanceQuests(seedQuests(), [t("d-easy")], [{ type: "matchDay" }, { type: "liveAnswer" }]);
    expect(a.changes).toEqual([]);
  });
});
