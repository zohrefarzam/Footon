/**
 * The MOCK SERVER's shop catalogue and a couple of friends' clubs. Cosmetic
 * only: nothing here changes a prediction, a point or a prize. Prices and
 * unlock levels are the server's; the UI reads them from `getShop()`.
 */
import type { ItemLook, ShopSlot } from "../schemas";

export type CatalogItem = {
  id: string;
  slot: ShopSlot;
  name: string;
  detail?: string;
  look?: ItemLook;
  /** Free-coin price. `"firstKit"` = the A/B flag's first-kit price. */
  price: number | "firstKit";
  /** Unlock level; a feature id resolves through the config's unlock levels. */
  unlock: "shopFreeze" | "myClubKit" | "stadium" | "boots" | "legendFrame" | number;
};

export const CATALOG: CatalogItem[] = [
  { id: "freeze", slot: "freeze", name: "محافظ زنجیره", detail: "یک روز مسابقه را از دست بده، زنجیره‌ات بماند", price: 2500, unlock: "shopFreeze" },

  // the kit you start with: owned and on from day one
  { id: "kit-academy", slot: "kit", name: "لباس آکادمی", detail: "جایی که همه شروع می‌کنند", look: { primary: "#2e4b3f", secondary: "#9db1a6" }, price: 0, unlock: 1 },
  { id: "kit-home", slot: "kit", name: "لباس اول", detail: "اولین رنگ‌های واقعی‌ات", look: { primary: "#1d4ed8", secondary: "#fafafa" }, price: "firstKit", unlock: "myClubKit" },
  { id: "kit-away", slot: "kit", name: "لباس دوم", look: { primary: "#f3f8f4", secondary: "#0b1e17" }, price: 2500, unlock: "myClubKit" },
  { id: "kit-night", slot: "kit", name: "لباس شب", detail: "برای بازی‌های آخر شب", look: { primary: "#111114", secondary: "#8b5cf6" }, price: 4000, unlock: "myClubKit" },

  { id: "stadium-terrace", slot: "stadium", name: "سکوی هواداران", detail: "ایستاده و پرسروصدا", look: { primary: "#183327", secondary: "#9db1a6" }, price: 5000, unlock: "stadium" },
  { id: "stadium-bowl", slot: "stadium", name: "کاسهٔ نورافکن‌دار", look: { primary: "#0d2c1d", secondary: "#e6efe9" }, price: 9000, unlock: "stadium" },

  { id: "boots-classic", slot: "boots", name: "مشکی کلاسیک", look: { primary: "#111114", secondary: "#fafafa" }, price: 2000, unlock: "boots" },
  { id: "boots-volt", slot: "boots", name: "ولت", look: { primary: "#f97316", secondary: "#111114" }, price: 3500, unlock: "boots" },

  { id: "frame-pitch", slot: "frame", name: "قاب زمین", look: { primary: "#e6efe9", secondary: "#224236" }, price: 3000, unlock: 5 },
  { id: "frame-legend", slot: "frame", name: "قاب اسطوره", detail: "همراه با عنوان اسطوره", look: { primary: "#c9d4ce", secondary: "#4a675a" }, price: 6000, unlock: "legendFrame" },
];

/** Friends' clubs the mock server can show (`getMyClub("sara")`). */
export const FRIEND_CLUBS: Record<string, { name: string; level: number; streak: number; kit: string; stadium?: string; boots?: string; frame?: string; badges: string[] }> = {
  sara: { name: "باشگاه سارا", level: 12, streak: 9, kit: "kit-night", stadium: "stadium-terrace", boots: "boots-volt", badges: ["hat-trick", "streak-7"] },
  omid: { name: "باشگاه امید", level: 6, streak: 2, kit: "kit-home", frame: "frame-pitch", badges: ["first-win"] },
};
