import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { defaultFlags, mockConfig } from "@/lib/gamification/config";
import { applyReward, gamificationKeys } from "@/lib/gamification/queries";
import type { Badge, UserProgress } from "@/lib/gamification/schemas";
import { result } from "@/lib/gamification/test-fixtures";
import { BadgeWall } from "./badge-wall";
import { ComboMeter } from "./combo-meter";
import { StreakBrokenSheet } from "./streak-broken-sheet";
import { FreezeIndicator, StreakCounter } from "./streak";

// a plain stub, not vi.fn(): the spy reports a rejected result as a test error
const pin = vi.hoisted(() => ({
  calls: [] as string[][],
  impl: (() => new Promise(() => {})) as (ids: string[]) => Promise<{ pinnedBadges: string[] }>,
}));
vi.mock("@/lib/gamification/api", () => ({
  api: {
    getProgress: () => new Promise(() => {}),
    getConfig: () => new Promise(() => {}),
    getFlags: () => new Promise(() => {}),
    getBadges: () => new Promise(() => {}),
    pinBadges: (ids: string[]) => {
      pin.calls.push(ids);
      return pin.impl(ids);
    },
  },
  mockApi: null,
}));

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
});
beforeEach(() => {
  pin.calls = [];
  pin.impl = () => new Promise(() => {});
});

const progress = (over: Partial<UserProgress> = {}): UserProgress => ({
  userId: "me",
  totalXp: 1640,
  level: 7,
  coins: { free: 0, premium: 0 },
  dailyXp: { earned: 0, softCap: 300, reduced: false },
  streak: { current: 3, best: 6, lastDayKey: "2026-11-02", freezesHeld: 1, status: "active" },
  combo: { count: 0, multiplier: 1 },
  pinnedBadges: [],
  badgeCount: 0,
  ...over,
});

const badge = (id: string, earned: boolean, family: Badge["family"] = "achievement"): Badge => ({
  id,
  family,
  name: id,
  icon: "trophy",
  rarityPct: 10,
  earnedAt: earned ? "2026-10-01T00:00:00Z" : null,
});

function setup(ui: React.ReactNode, p: UserProgress, badges: Badge[] = []) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  qc.setQueryData(gamificationKeys.config, mockConfig);
  qc.setQueryData(gamificationKeys.flags, defaultFlags);
  qc.setQueryData(gamificationKeys.progress, p);
  qc.setQueryData(gamificationKeys.badges, { badges });
  render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
  return qc;
}

describe("BadgeWall", () => {
  const all = [badge("a", true), badge("b", true), badge("c", true), badge("d", true), badge("locked", false, "seasonal")];

  it("shows badges not earned yet, locked, with no pin", () => {
    setup(<BadgeWall open onOpenChange={() => {}} />, progress(), all);
    expect(screen.getByText("locked")).toBeInTheDocument();
    expect(screen.getByText("Seasonal")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Pin locked" })).toBeNull();
    expect(screen.getByText("4 of 5 earned")).toBeInTheDocument();
  });

  it("disables more pins once 3 are pinned, but lets you unpin", () => {
    setup(<BadgeWall open onOpenChange={() => {}} />, progress({ pinnedBadges: ["a", "b", "c"] }), all);
    expect(screen.getByRole("button", { name: "Pin d" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Unpin a" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Unpin a" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Pin up to 3/)).toBeInTheDocument();
  });

  it("waits for the server: no double submit, then takes its answer", async () => {
    let resolve!: (v: { pinnedBadges: string[] }) => void;
    pin.impl = () => new Promise((r) => (resolve = r));
    const qc = setup(<BadgeWall open onOpenChange={() => {}} />, progress(), all);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Pin a" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Pin b" })).toBeDisabled());
    await user.click(screen.getByRole("button", { name: "Pin b" }));
    expect(pin.calls).toEqual([["a"]]);

    resolve({ pinnedBadges: ["a"] });
    await waitFor(() => expect(screen.getByRole("button", { name: "Unpin a" })).toBeEnabled());
    expect(qc.getQueryData<UserProgress>(gamificationKeys.progress)?.pinnedBadges).toEqual(["a"]);
  });

  it("says so when the server refuses, and changes nothing", async () => {
    pin.impl = () => Promise.reject(new Error("conflict"));
    setup(<BadgeWall open onOpenChange={() => {}} />, progress(), all);
    await userEvent.setup().click(screen.getByRole("button", { name: "Pin a" }));
    expect(await screen.findByText("Couldn't save that. Try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pin a" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("ComboMeter", () => {
  it("shows the run and the next step", () => {
    setup(<ComboMeter />, progress({ combo: { count: 2, multiplier: 1 } }));
    expect(screen.getByRole("img")).toHaveAccessibleName("Combo: 2 right in a row, XP ×1. ×2 at 3");
  });

  it("follows the server's combo after each result", async () => {
    const qc = setup(<ComboMeter />, progress({ combo: { count: 2, multiplier: 1 } }));
    applyReward(qc, result({ id: "x1", action: "liveResult", combo: { count: 3, multiplier: 2 }, comboMultiplier: 2 }));
    await waitFor(() => expect(screen.getByRole("img")).toHaveAccessibleName("Combo: 3 right in a row, XP ×2. ×3 at 5"));
    applyReward(qc, result({ id: "x2", action: "liveResult", xpGained: 0, combo: { count: 0, multiplier: 1 } }));
    await waitFor(() => expect(screen.getByRole("img")).toHaveAccessibleName("Combo: 0 right in a row, XP ×1. ×2 at 3"));
  });
});

describe("Streak", () => {
  it("counts a broken run as 0 and keeps the best", () => {
    setup(<StreakCounter />, progress({ streak: { current: 6, best: 6, lastDayKey: "2026-10-30", freezesHeld: 0, status: "broken" } }));
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Best 6")).toBeInTheDocument();
    expect(screen.getByText("Call any match to start a run.")).toBeInTheDocument();
  });

  it("shows the next milestone", () => {
    setup(<StreakCounter />, progress());
    expect(screen.getByText("4 more to the 7-day reward")).toBeInTheDocument();
  });

  it("labels freezes by count, not colour alone", () => {
    render(<FreezeIndicator held={1} max={2} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("1 of 2 streak freezes");
  });

  it("breaks the news kindly: best run, one way back, no alarm colours", () => {
    render(<StreakBrokenSheet best={6} open onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("That run's over");
    expect(screen.getByRole("link", { name: "Start a new run" })).toHaveAttribute("href", "/live");
    expect(dialog.innerHTML).not.toMatch(/text-loss|bg-loss|destructive/);
  });
});
