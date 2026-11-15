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
  { id: "freeze", slot: "freeze", name: "محافظ زنجیره", detail: "یه روز مسابقه را جا بنداز، زنجیره‌ات می‌مونه", look: { primary: "#BFE7F7", secondary: "#5BB6DE" }, price: 2500, unlock: "shopFreeze" },

  // kits: the one you start with is owned and on from day one
  { id: "kit-academy", slot: "kit", name: "لباس آکادمی", detail: "همه از همین‌جا شروع می‌کنن", look: { primary: "#2E4B3F", secondary: "#9DB1A6", pattern: "plain" }, price: 0, unlock: 1 },
  { id: "kit-home", slot: "kit", name: "آبی راه‌راه", detail: "اولین رنگ‌های واقعی باشگاهت", look: { primary: "#1D4ED8", secondary: "#F8FAFC", accent: "#F8FAFC", pattern: "stripes" }, price: "firstKit", unlock: "myClubKit" },
  { id: "kit-away", slot: "kit", name: "سفید مهمان", detail: "برای بازی‌های بیرون از خانه", look: { primary: "#F3F8F4", secondary: "#43B883", accent: "#0B1E17", pattern: "chevron" }, price: 2500, unlock: "myClubKit" },
  { id: "kit-night", slot: "kit", name: "شب ستاره‌ای", detail: "برای بازی‌های آخر شب", look: { primary: "#141018", secondary: "#8B5CF6", accent: "#C4B5FD", pattern: "sash" }, price: 4000, unlock: "myClubKit" },
  { id: "kit-retro", slot: "kit", name: "کلاسیک قدیمی", detail: "حلقه‌های قرمز، مثل قدیما", look: { primary: "#F8FAFC", secondary: "#DC2626", accent: "#DC2626", pattern: "hoops" }, price: 3500, unlock: 7 },
  { id: "kit-tiger", slot: "kit", name: "ببر", detail: "نیمه نارنجی، نیمه مشکی", look: { primary: "#F97316", secondary: "#111114", accent: "#111114", pattern: "halves" }, price: 5000, unlock: 9 },

  // stadiums: a night match in the stadium's colours
  { id: "stadium-terrace", slot: "stadium", name: "سکوی هواداران", detail: "ایستاده و پرسروصدا", look: { primary: "#183327", secondary: "#9DB1A6", accent: "#FFA83E", pattern: "terrace" }, price: 5000, unlock: "stadium" },
  { id: "stadium-classic", slot: "stadium", name: "ورزشگاه قدیمی", detail: "با سقف شیروونی وسط سکو", look: { primary: "#7F1D1D", secondary: "#FCA5A5", accent: "#F8FAFC", pattern: "classic" }, price: 7000, unlock: "stadium" },
  { id: "stadium-bowl", slot: "stadium", name: "کاسهٔ نورافکن‌دار", detail: "سکوهای گرد دور تا دور زمین", look: { primary: "#1E3A8A", secondary: "#BFDBFE", accent: "#F8FAFC", pattern: "bowl" }, price: 9000, unlock: "stadium" },
  { id: "stadium-arena", slot: "stadium", name: "سقف‌دار", detail: "سقف کامل، صدا بیرون نمیره", look: { primary: "#27272A", secondary: "#A1A1AA", accent: "#43B883", pattern: "arena" }, price: 12000, unlock: 14 },

  // boots
  { id: "boots-classic", slot: "boots", name: "مشکی کلاسیک", detail: "همیشه جواب میده", look: { primary: "#111114", secondary: "#F8FAFC", accent: "#F8FAFC", pattern: "classic" }, price: 2000, unlock: "boots" },
  { id: "boots-volt", slot: "boots", name: "ولت", detail: "برای دقیقه‌های آخر", look: { primary: "#F97316", secondary: "#111114", accent: "#111114", pattern: "speed" }, price: 3500, unlock: "boots" },
  { id: "boots-ice", slot: "boots", name: "یخی", detail: "ساق‌بلند، سرد و تیز", look: { primary: "#F8FAFC", secondary: "#38BDF8", accent: "#0EA5E9", pattern: "high" }, price: 4500, unlock: 13 },

  // frames round your club
  { id: "frame-pitch", slot: "frame", name: "قاب زمین", detail: "خط‌های گچی زمین", look: { primary: "#E6EFE9", secondary: "#43B883", pattern: "line" }, price: 3000, unlock: 5 },
  { id: "frame-laurel", slot: "frame", name: "قاب افتخار", detail: "برگ‌های زیتون دو طرف", look: { primary: "#F5C451", secondary: "#FFF4D6", accent: "#43B883", pattern: "laurel" }, price: 4500, unlock: 6 },
  { id: "frame-legend", slot: "frame", name: "قاب اسطوره", detail: "همراه با عنوان اسطوره", look: { primary: "#C9D4CE", secondary: "#F8FAFC", accent: "#F5C451", pattern: "stars" }, price: 6000, unlock: "legendFrame" },
];

/** Friends' clubs the mock server can show (`getMyClub("sara")`). */
export const FRIEND_CLUBS: Record<string, { name: string; level: number; streak: number; kit: string; stadium?: string; boots?: string; frame?: string; badges: string[] }> = {
  sara: { name: "باشگاه سارا", level: 12, streak: 9, kit: "kit-night", stadium: "stadium-terrace", boots: "boots-volt", badges: ["hat-trick", "streak-7"] },
  omid: { name: "باشگاه امید", level: 6, streak: 2, kit: "kit-home", frame: "frame-pitch", badges: ["first-win"] },
};
