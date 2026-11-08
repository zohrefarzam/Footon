import { describe, expect, it } from "vitest";

import { mockConfig } from "./config";
import { curveFor, levelProgress, tierFor, xpForLevel, xpToLevel } from "./level";

const curve = { base: 100, growth: 25 };

describe("xpForLevel", () => {
  it("follows 100(L-1) + 25(L-1)(L-2)", () => {
    expect(xpForLevel(1, curve)).toBe(0);
    expect(xpForLevel(2, curve)).toBe(100);
    expect(xpForLevel(3, curve)).toBe(250);
    expect(xpForLevel(8, curve)).toBe(1750);
    expect(xpForLevel(30, curve)).toBe(23200);
  });

  it("is strictly increasing up to max level", () => {
    for (let l = 1; l < 30; l++) expect(xpForLevel(l + 1, curve)).toBeGreaterThan(xpForLevel(l, curve));
  });
});

describe("levelProgress", () => {
  it("places XP inside the server's level", () => {
    // level 7 spans 1350 → 1750
    expect(levelProgress(1640, 7, curve, 30)).toEqual({ into: 290, span: 400, pct: 290 / 400, isMax: false, nextAt: 1750 });
  });

  it("is empty exactly at a level's floor and never reaches 1 below the next", () => {
    expect(levelProgress(1350, 7, curve, 30).pct).toBe(0);
    expect(levelProgress(1749, 7, curve, 30).pct).toBeLessThan(1);
  });

  it("clamps when XP and the server's level disagree, never invents a level", () => {
    expect(levelProgress(100, 7, curve, 30).pct).toBe(0); // below the floor
    expect(levelProgress(5000, 7, curve, 30).pct).toBe(1); // past the next level
  });

  it("is full at max level", () => {
    expect(levelProgress(99999, 30, curve, 30)).toMatchObject({ pct: 1, isMax: true, nextAt: null });
  });

  it("reads the flagged curve", () => {
    const gentle = curveFor(mockConfig, "gentle");
    expect(xpForLevel(3, gentle)).toBe(236);
    expect(curveFor(mockConfig, "unknown")).toEqual(mockConfig.curves.default);
  });

  it("xpToLevel counts what's left, zero once reached", () => {
    expect(xpToLevel(1640, 8, curve)).toBe(110);
    expect(xpToLevel(2000, 8, curve)).toBe(0);
  });
});

describe("tierFor", () => {
  it.each([
    [1, "academy"],
    [4, "academy"],
    [5, "reserve"],
    [14, "startingXI"],
    [15, "star"],
    [24, "captain"],
    [29, "legend"],
    [30, "gaffer"],
  ])("level %i → %s", (level, id) => {
    expect(tierFor(level, mockConfig).id).toBe(id);
  });
});
