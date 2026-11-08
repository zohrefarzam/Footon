import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { celebrations } from "@/lib/gamification/celebrations/store";
import { defaultFlags, mockConfig } from "@/lib/gamification/config";
import { formatTimeLeft } from "@/lib/gamification/format";
import { applyReward, gamificationKeys } from "@/lib/gamification/queries";
import type { Quest, QuestBoard, UserProgress } from "@/lib/gamification/schemas";
import { result } from "@/lib/gamification/test-fixtures";
import { QuestList, QuestsTile } from "./quests";

vi.mock("@/lib/gamification/api", () => ({
  api: {
    getProgress: () => new Promise(() => {}),
    getConfig: () => new Promise(() => {}),
    getFlags: () => new Promise(() => {}),
    getQuests: () => new Promise(() => {}),
  },
  mockApi: null,
}));

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
});
beforeEach(() => celebrations.getState().clear());

const NOW = "2026-11-03T18:00:00Z";
const quest = (over: Partial<Quest>): Quest => ({
  id: "d-easy",
  kind: "daily",
  difficulty: "easy",
  title: "Make a prediction",
  progress: 0,
  target: 1,
  reward: { xp: 30, coins: 30 },
  expiresAt: "2026-11-04T00:00:00Z",
  requiredLevel: 1,
  completed: false,
  ...over,
});
const board: QuestBoard = {
  serverNow: NOW,
  quests: [
    quest({}),
    quest({ id: "d-social", difficulty: "social", title: "Answer 2 live questions", target: 2, progress: 1 }),
    quest({ id: "d-challenge", difficulty: "challenge", title: "Get 3 right in a row", target: 3, progress: 3, completed: true }),
    quest({ id: "w-days", kind: "weekly", difficulty: undefined, title: "Predict on 3 match days", target: 3, progress: 1, requiredLevel: 6, expiresAt: "2026-11-09T00:00:00Z" }),
  ],
};
const progress = (level: number, totalXp: number): UserProgress => ({
  userId: "me",
  totalXp,
  level,
  coins: { free: 0, premium: 0 },
  dailyXp: { earned: 0, softCap: 300, reduced: false },
  streak: { current: 0, best: 0, lastDayKey: null, freezesHeld: 0, status: "none" },
  combo: { count: 0, multiplier: 1 },
  pinnedBadges: [],
  badgeCount: 0,
});

function setup(ui: React.ReactNode, p = progress(7, 1640), b: QuestBoard = board) {
  const qc = new QueryClient();
  qc.setQueryData(gamificationKeys.config, mockConfig);
  qc.setQueryData(gamificationKeys.flags, defaultFlags);
  qc.setQueryData(gamificationKeys.progress, p);
  qc.setQueryData(gamificationKeys.quests, b);
  render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
  return qc;
}

describe("QuestList", () => {
  it("lists today's quests in one card with progress, time left and done count", () => {
    setup(<QuestList kinds={["daily"]} title="Today's quests" />);
    const section = screen.getByRole("region", { name: /Today's quests/ });
    expect(within(section).getByText("1 of 3 done")).toBeInTheDocument();
    expect(within(section).getByLabelText("Answer 2 live questions, 1 of 2")).toBeInTheDocument();
    expect(within(section).getByLabelText("Get 3 right in a row, done")).toBeInTheDocument();
    expect(within(section).getAllByText(/Resets in 6h/)).toHaveLength(2);
    expect(within(section).queryByText("Predict on 3 match days")).toBeNull();
  });

  it("shows weekly quests locked below their level, open from it", () => {
    setup(<QuestList kinds={["weekly"]} title="This week" feature="weeklyQuests" />, progress(5, 900));
    expect(screen.getByRole("group")).toHaveAccessibleName(/Weekly quests, locked\. Level 6 required/);
    expect(screen.queryByText("Predict on 3 match days")).toBeNull();
  });

  it("shows weekly quests once unlocked", () => {
    setup(<QuestList kinds={["weekly"]} title="This week" feature="weeklyQuests" />);
    expect(screen.getByLabelText("Predict on 3 match days, 1 of 3")).toBeInTheDocument();
  });

  it("moves with the server's result and plays the completion", async () => {
    const qc = setup(<QuestList kinds={["daily"]} title="Today's quests" />);
    applyReward(
      qc,
      result({
        id: "q1",
        questProgress: [{ questId: "d-social", title: "Answer 2 live questions", progress: 2, target: 2, completedNow: true, reward: { xp: 40, coins: 40 } }],
      }),
    );
    await waitFor(() => expect(screen.getByLabelText("Answer 2 live questions, done")).toBeInTheDocument());
    expect(screen.getByText("2 of 3 done")).toBeInTheDocument();
    // the completion is queued after the XP moment
    const kinds = [celebrations.getState().current, ...celebrations.getState().queue].map((c) => c?.kind);
    expect(kinds).toEqual(["xp", "quest"]);
  });

  it("lets an expired quest go quietly when the server stops sending it", async () => {
    const qc = setup(<QuestList kinds={["daily"]} title="Today's quests" />);
    qc.setQueryData<QuestBoard>(gamificationKeys.quests, { ...board, quests: board.quests.filter((q) => q.id !== "d-social") });
    await waitFor(() => expect(screen.queryByText("Answer 2 live questions")).toBeNull());
    expect(screen.getByText("1 of 2 done")).toBeInTheDocument();
    expect(screen.queryByText(/expired|missed|lost/i)).toBeNull();
  });
});

describe("formatTimeLeft", () => {
  it("is coarse and never negative", () => {
    expect([30_000, 45 * 60_000, 6 * 3_600_000, 50 * 3_600_000, -5].map(formatTimeLeft)).toEqual(["1m", "45m", "6h", "2d", "1m"]);
  });
});

describe("QuestsTile (Home)", () => {
  it("says how many are done and shows the next open quest", () => {
    setup(<QuestsTile />);
    const tile = screen.getByRole("link");
    expect(tile).toHaveAttribute("href", "/quests");
    expect(tile).toHaveAccessibleName("Quests, 1 of 3 done. Next: Make a prediction, 0 of 1");
  });

  it("reads all done once every daily is finished", () => {
    setup(<QuestsTile />, undefined, { ...board, quests: board.quests.map((q) => ({ ...q, completed: q.kind === "daily" ? true : q.completed })) });
    expect(screen.getByRole("link")).toHaveAccessibleName("Quests, All done today");
  });

  it("holds its space until the board loads", () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <QuestsTile />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });
});
