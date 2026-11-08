import { describe, expect, it } from "vitest";

import type { Celebration } from "./expand";
import { createCelebrationStore } from "./store";

const xp = (key: string): Celebration => ({ key, kind: "xp", xpGained: 10, coinsGained: 10, fromXp: 0, toXp: 10, level: 1, reduced: false, comboMultiplier: 1 });
const up = (key: string, level: number): Celebration => ({ key, kind: "levelUp", level, tier: "academy", tierChanged: false, unlocks: [], badge: null });

describe("celebration queue", () => {
  it("plays one at a time, in order", () => {
    const s = createCelebrationStore();
    s.getState().enqueue("r1", [xp("a"), up("b", 2), up("c", 3)]);
    expect(s.getState().current?.key).toBe("a");
    s.getState().advance();
    expect(s.getState().current?.key).toBe("b");
    s.getState().advance();
    expect(s.getState().current?.key).toBe("c");
    s.getState().advance();
    expect(s.getState().current).toBeNull();
  });

  it("keeps everything when results arrive while one is playing", () => {
    const s = createCelebrationStore();
    s.getState().enqueue("r1", [xp("a")]);
    s.getState().enqueue("r2", [xp("b")]);
    s.getState().enqueue("r3", [up("c", 2)]);
    const played: string[] = [];
    while (s.getState().current) {
      played.push(s.getState().current!.key);
      s.getState().advance();
    }
    expect(played).toEqual(["a", "b", "c"]);
  });

  it("celebrates a result id once (retried requests)", () => {
    const s = createCelebrationStore();
    s.getState().enqueue("r1", [xp("a")]);
    s.getState().enqueue("r1", [xp("a")]);
    s.getState().advance();
    expect(s.getState().current).toBeNull();
  });

  it("holds new items while paused and resumes after", () => {
    const s = createCelebrationStore();
    s.getState().setPaused(true);
    s.getState().enqueue("r1", [xp("a"), xp("b")]);
    expect(s.getState().current).toBeNull();
    s.getState().setPaused(false);
    expect(s.getState().current?.key).toBe("a");
  });

  it("lets the playing item finish when paused, then waits", () => {
    const s = createCelebrationStore();
    s.getState().enqueue("r1", [xp("a"), xp("b")]);
    s.getState().setPaused(true);
    expect(s.getState().current?.key).toBe("a");
    s.getState().advance(); // skipped or done
    expect(s.getState().current).toBeNull();
    expect(s.getState().queue.map((c) => c.key)).toEqual(["b"]);
  });

  it("ignores an empty result", () => {
    const s = createCelebrationStore();
    s.getState().enqueue("r1", []);
    expect(s.getState().current).toBeNull();
  });
});
