import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ShopPreview } from "@/components/footon/shop-preview";
import { ApiError, type PurchaseInput } from "@/lib/gamification/api/client";
import { defaultFlags, mockConfig } from "@/lib/gamification/config";
import { gamificationKeys } from "@/lib/gamification/queries";
import type { MyClub, PurchaseResult, ShopItem, UserProgress } from "@/lib/gamification/schemas";
import { MyClubView } from "./club-view";
import { ItemPreview } from "./item-preview";
import { ShopItemCard } from "./shop-grid";
import { drawClubCard, ShareCardRenderer } from "./share-card";

// plain stubs, not vi.fn(): a spy reports rejected results as test errors
const server = vi.hoisted(() => ({
  calls: [] as PurchaseInput[],
  purchase: (() => new Promise(() => {})) as (i: PurchaseInput) => Promise<PurchaseResult>,
}));
vi.mock("@/lib/gamification/api", () => ({
  api: {
    getProgress: () => new Promise(() => {}),
    getConfig: () => new Promise(() => {}),
    getFlags: () => new Promise(() => {}),
    getShop: () => new Promise(() => {}),
    getMyClub: () => new Promise(() => {}),
    purchase: (i: PurchaseInput) => {
      server.calls.push(i);
      return server.purchase(i);
    },
  },
  mockApi: null,
}));

beforeAll(() => {
  window.matchMedia ??= ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as typeof window.matchMedia;
});
beforeEach(() => {
  server.calls = [];
  server.purchase = () => new Promise(() => {});
});
afterEach(() => {
  delete (globalThis as { Telegram?: unknown }).Telegram;
});

const item = (over: Partial<ShopItem> = {}): ShopItem => ({
  id: "kit-home",
  slot: "kit",
  name: "Home kit",
  look: { primary: "#1d4ed8", secondary: "#fafafa" },
  price: { free: 1500 },
  requiredLevel: 5,
  isNew: false,
  owned: false,
  equipped: false,
  ...over,
});
const progress = (over: Partial<UserProgress> = {}): UserProgress => ({
  userId: "me",
  totalXp: 1640,
  level: 7,
  coins: { free: 6450, premium: 0 },
  dailyXp: { earned: 0, softCap: 300, reduced: false },
  streak: { current: 3, best: 6, lastDayKey: "2026-11-02", freezesHeld: 1, status: "active" },
  combo: { count: 0, multiplier: 1 },
  pinnedBadges: [],
  badgeCount: 3,
  ...over,
});
const club: MyClub = {
  userId: "me",
  name: "Your club",
  kit: { id: "kit-academy", name: "Academy kit", look: { primary: "#3f3f46", secondary: "#a1a1aa" } },
  stadium: null,
  boots: null,
  frame: null,
  pinnedBadges: [],
  level: 7,
  tier: "reserve",
  streak: 3,
};

function setup(ui: React.ReactNode, p = progress(), items: ShopItem[] = [item()]) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  qc.setQueryData(gamificationKeys.config, mockConfig);
  qc.setQueryData(gamificationKeys.flags, defaultFlags);
  qc.setQueryData(gamificationKeys.progress, p);
  qc.setQueryData(gamificationKeys.shop, { items });
  qc.setQueryData(gamificationKeys.club("me"), club);
  render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
  return qc;
}

describe("ShopItemCard", () => {
  it.each([
    [item({ id: "stadium", slot: "stadium", name: "Terrace", requiredLevel: 10 }), "locked", "Terrace, Level 10 required"],
    [item({ owned: true, equipped: true }), "equipped", "Home kit, On your club"],
    [item({ owned: true }), "owned", "Home kit, Owned"],
    [item({ isNew: true }), "new", "Home kit, New, 1,500 coins"],
    [item(), "buyable", "Home kit, 1,500 coins"],
  ])("%#: reads its state in words, not colour alone", (it_, state, name) => {
    const onSelect = vi.fn();
    render(<ShopItemCard item={it_} level={7} onSelect={onSelect} />);
    const tile = screen.getByRole("button");
    expect(tile).toHaveAttribute("data-state", state);
    expect(tile).toHaveAccessibleName(name);
  });

  it("opens the preview even when locked", async () => {
    const onSelect = vi.fn();
    render(<ShopItemCard item={item({ requiredLevel: 10 })} level={7} onSelect={onSelect} />);
    await userEvent.setup().click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe("Purchase flow", () => {
  const open = (it_: ShopItem, p = progress()) => setup(<ItemPreview item={it_} open onOpenChange={() => {}} />, p, [it_]);

  it("can't buy a locked item: the level is the reason", () => {
    open(item({ requiredLevel: 10 }));
    expect(screen.getByRole("button", { name: "Level 10 required" })).toBeDisabled();
  });

  it("short of coins: says how many and where to earn, no buy", () => {
    open(item(), progress({ coins: { free: 1000, premium: 0 } }));
    expect(screen.getByRole("button", { name: "Need 500 more coins" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Ways to earn" })).toHaveAttribute("href", "/wallet");
  });

  it("confirms, waits for the server (no double submit), then shows the server's balance", async () => {
    let resolve!: (r: PurchaseResult) => void;
    server.purchase = () => new Promise((r) => (resolve = r));
    const qc = open(item());
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /^Buy/ }));
    expect(screen.getByText("1,500 coins. You'll have 4,950 left.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Buy it" }));
    const busy = await screen.findByRole("button", { name: "Buying…" });
    expect(busy).toBeDisabled();
    await user.click(busy);
    expect(server.calls).toHaveLength(1);
    expect(server.calls[0]).toMatchObject({ itemId: "kit-home", price: 1500 });

    // the server's numbers win, whatever the preview said
    resolve({ item: item({ owned: true }), coins: { free: 5000, premium: 0 }, spent: { free: 1450, premium: 0 } });
    expect(await screen.findByText("It's yours")).toBeInTheDocument();
    expect(qc.getQueryData<UserProgress>(gamificationKeys.progress)?.coins.free).toBe(5000);
    expect(screen.getByRole("button", { name: "Put it on" })).toBeInTheDocument();
  });

  it("a lost request retries with the same key; nothing was charged", async () => {
    server.purchase = () => Promise.reject(new ApiError("offline"));
    open(item());
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^Buy/ }));
    await user.click(screen.getByRole("button", { name: "Buy it" }));
    expect(await screen.findByText("Couldn't reach the shop. Nothing was charged.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(server.calls).toHaveLength(2));
    expect(server.calls[1].idempotencyKey).toBe(server.calls[0].idempotencyKey);
  });

  it("a conflict stops the buy and refreshes the shop", async () => {
    server.purchase = () => Promise.reject(new ApiError("conflict"));
    const qc = open(item());
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^Buy/ }));
    await user.click(screen.getByRole("button", { name: "Buy it" }));
    expect(await screen.findByText(/That changed while you were looking/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buy it" })).toBeDisabled();
    expect(qc.getQueryState(gamificationKeys.shop)?.isInvalidated).toBe(true);
  });

  it("won't sell a freeze past the most you can hold", () => {
    open(item({ id: "freeze", slot: "freeze", name: "Streak freeze", look: undefined, price: { free: 2500 }, requiredLevel: 3 }), progress({ streak: { ...progress().streak, freezesHeld: 2 } }));
    expect(screen.getByRole("button", { name: "You hold 2 freezes, the most you can" })).toBeDisabled();
  });
});

describe("ShopPreview (Home)", () => {
  it("stays away on a low balance", () => {
    setup(<ShopPreview />, progress({ coins: { free: 200, premium: 0 } }));
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows what you could get, new first", () => {
    setup(<ShopPreview />, progress(), [item({ id: "a", name: "Away kit" }), item({ id: "n", name: "Night kit", isNew: true })]);
    expect(screen.getByRole("link")).toHaveAccessibleName("Shop, 1 new: Night kit, Away kit");
  });
});

describe("My Club", () => {
  it("describes the club, and the try-on swaps one slot", () => {
    render(<MyClubView club={club} tierName="Reserve" preview={{ slot: "kit", item: { id: "kit-home", name: "Home kit" } }} />);
    expect(screen.getByRole("group")).toHaveAccessibleName("Your club: level 7, Reserve, wearing Home kit, 3 match days in a row");
  });

  it("draws the card with the club's own numbers", () => {
    const texts: string[] = [];
    const ctx = new Proxy({} as Record<string | symbol, unknown>, {
      get: (t, k) => (k === "fillText" ? (s: string) => texts.push(s) : k === "measureText" ? () => ({ width: 60 }) : k in t ? t[k] : () => {}),
      set: (t, k, v) => ((t[k] = v), true),
    }) as unknown as CanvasRenderingContext2D;
    vi.stubGlobal("Path2D", class {});
    drawClubCard(ctx, club, "Reserve", { sans: "sans-serif", display: "sans-serif" });
    expect(texts).toEqual(expect.arrayContaining(["Your club", "7", "Reserve", "3 match days in a row", "FOOTON"]));
    vi.unstubAllGlobals();
  });

  it("shares through Telegram inside the Mini App", async () => {
    const openTelegramLink = vi.fn();
    (globalThis as { Telegram?: unknown }).Telegram = { WebApp: { openTelegramLink } };
    const dataLayer: unknown[] = [];
    (window as Window & { dataLayer?: unknown[] }).dataLayer = dataLayer;
    vi.spyOn(console, "error").mockImplementation(() => {}); // jsdom has no canvas: the card falls back to the link
    render(<ShareCardRenderer club={club} tierName="Reserve" />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Share to Telegram" }));
    await waitFor(() => expect(openTelegramLink).toHaveBeenCalledOnce());
    expect(openTelegramLink.mock.calls[0][0]).toMatch(/^https:\/\/t\.me\/share\/url\?/);
    expect(dataLayer).toContainEqual({ event: "card_shared", surface: "my_club", method: "telegram" });
  });
});
