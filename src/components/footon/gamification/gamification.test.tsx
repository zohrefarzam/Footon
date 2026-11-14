import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { defaultFlags, mockConfig } from "@/lib/gamification/config";
import { gamificationKeys } from "@/lib/gamification/queries";
import type { UserProgress } from "@/lib/gamification/schemas";
import { copy, featureName } from "@/lib/gamification/strings";
import { FantasyUnlock } from "@/components/footon/fantasy-unlock";
import { LevelUpScreen } from "./level-up-screen";
import { LockedFeatureGate } from "./locked-feature-gate";

vi.mock("@/lib/gamification/api", () => ({ api: { getProgress: () => new Promise(() => {}), getConfig: () => new Promise(() => {}), getFlags: () => new Promise(() => {}) }, mockApi: null }));

beforeAll(() => {
  // jsdom has no matchMedia; motion asks for prefers-reduced-motion
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
});

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

function withData(ui: React.ReactNode, p: UserProgress | null) {
  const qc = new QueryClient();
  qc.setQueryData(gamificationKeys.config, mockConfig);
  qc.setQueryData(gamificationKeys.flags, defaultFlags);
  if (p) qc.setQueryData(gamificationKeys.progress, p);
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("LockedFeatureGate", () => {
  const gated = (variant?: "card" | "row" | "button") => (
    <LockedFeatureGate feature="fantasy" title="Fantasy" variant={variant}>
      <button>Open fantasy</button>
    </LockedFeatureGate>
  );

  it.each(["card", "row", "button"] as const)("%s: shows a visible locked state with the level below it", (variant) => {
    withData(gated(variant), progress(7, 1640));
    expect(screen.queryByText("Open fantasy")).toBeNull();
    const locked = screen.getByRole("group");
    expect(locked).toHaveAttribute("data-locked", "fantasy");
    expect(locked).toHaveAccessibleName(new RegExp(copy.levelRequired(8)));
  });

  it("renders the feature at and above its level", () => {
    withData(gated(), progress(8, 1750));
    expect(screen.getByText("Open fantasy")).toBeInTheDocument();
  });

  it("shows the XP still to go on the card", () => {
    withData(gated("card"), progress(7, 1640));
    expect(screen.getByRole("group")).toHaveAccessibleName(new RegExp(copy.xpToGo(110)));
  });

  it("never locks the core loop, whatever the config says", () => {
    const qc = new QueryClient();
    qc.setQueryData(gamificationKeys.config, { ...mockConfig, unlocks: { ...mockConfig.unlocks, predictions: 99 } });
    qc.setQueryData(gamificationKeys.flags, defaultFlags);
    qc.setQueryData(gamificationKeys.progress, progress(1, 0));
    render(
      <QueryClientProvider client={qc}>
        <LockedFeatureGate feature="predictions" title="Predict">
          <button>Predict</button>
        </LockedFeatureGate>
      </QueryClientProvider>,
    );
    expect(screen.getByText("Predict")).toBeInTheDocument();
  });

  it("claims neither locked nor open before the server answers", () => {
    withData(gated(), null);
    expect(screen.queryByText("Open fantasy")).toBeNull();
    expect(screen.queryByRole("group")).toBeNull();
  });
});

describe("FantasyUnlock", () => {
  it("is disabled while locked: visible, not a link", async () => {
    withData(<FantasyUnlock />, progress(7, 1640));
    expect(screen.queryByRole("link")).toBeNull();
    const tile = screen.getByRole("group");
    expect(tile).toHaveAttribute("aria-disabled", "true");
    expect(tile).toHaveAccessibleName(new RegExp(copy.levelRequired(8)));
    await userEvent.click(tile); // nothing to follow
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("links to /fantasy once unlocked", () => {
    withData(<FantasyUnlock />, progress(8, 1750));
    expect(screen.getByRole("link", { name: "فانتزی بازه" })).toHaveAttribute("href", "/fantasy");
  });
});

describe("LevelUpScreen", () => {
  it("traps focus on Continue, announces itself, and returns focus after", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onDone = vi.fn();
    render(<button>Lock in</button>);
    const origin = screen.getByText("Lock in");
    origin.focus();

    withData(<LevelUpScreen level={8} tier="reserve" tierName="Reserve" tierChanged={false} unlocks={["fantasy"]} badge={null} shareStyle="button" onDone={onDone} />, null);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName(copy.levelUpTitle(8));
    expect(screen.getByText(featureName.fantasy)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.continue })).toHaveFocus();

    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement); // trapped
    await user.tab();
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{Escape}");
    await act(() => vi.advanceTimersByTimeAsync(300));
    expect(onDone).toHaveBeenCalledOnce();
    expect(origin).toHaveFocus();
    vi.useRealTimers();
  });
});
