import { faNum, faTimes } from "./format";
import type { FeatureId } from "./schemas";

/**
 * Persian copy for gamification surfaces. Short and spoken, like the rest of
 * Footon. Latin terms (XP) stay Latin; components wrap them in `<bdi>`.
 * Numbers go through `format.ts` so they render in Persian digits.
 */
export const fa = {
  level: "سطح",
  levelShort: "LV",
  xp: "XP",
  levelRequired: (l: number) => `سطح ${faNum(l)} لازم است`,
  levelN: (l: number) => `سطح ${faNum(l)}`,
  xpOf: (into: number, span: number) => `${faNum(into)} از ${faNum(span)} XP`,
  xpToGo: (n: number) => `${faNum(n)} XP مانده`,
  maxLevel: "بالاترین سطح",
  badges: (n: number) => `${faNum(n)} نشان`,
  reducedXp: "XP امروز نصف حساب می‌شود",

  // Level up
  levelUpEyebrow: "سطح جدید",
  levelUpTitle: (l: number) => `رسیدی به سطح ${faNum(l)}`,
  newTier: "ردهٔ جدید",
  unlockedNow: "باز شد",
  levelBadge: "نشان سطح",
  continue: "ادامه",
  share: "اشتراک‌گذاری",
  shareLevelText: (l: number, tier: string) => `توی فوتون رسیدم به سطح ${faNum(l)} (${tier}). بیا پیش‌بینی کنیم!`,

  // Celebrations, announced via aria-live
  announceXp: (xp: number, coins: number, multiplier: number) =>
    `${faNum(xp)} XP و ${faNum(coins)} سکه گرفتی${multiplier > 1 ? `، ضریب ${faTimes(multiplier)}` : ""}`,
  announceLevel: (l: number, tier: string) => `رسیدی به سطح ${faNum(l)}، ردهٔ ${tier}`,
  announceStreak: (n: number) => `${faNum(n)} روز مسابقه پشت سر هم`,
  announceBadge: (name: string) => `نشان تازه: ${name}`,
  announceQuest: (title: string) => `مأموریت انجام شد: ${title}`,
  skip: "رد کردن",
  close: "بستن",

  streakDays: (n: number) => `${faNum(n)} روز`,
  locked: "قفل",
} as const;

/** Names of what a level opens, for the Level Up screen and locked gates. */
export const featureName: Record<FeatureId, string> = {
  predictions: "پیش‌بینی",
  livePredictions: "پیش‌بینی زنده",
  profile: "پروفایل",
  joinLeague: "پیوستن به لیگ",
  weeklyLeaderboard: "جدول هفتگی",
  createLeague: "ساختن لیگ",
  invite: "دعوت دوستان",
  reactions: "واکنش و استیکر",
  shopFreeze: "فروشگاه: یخ‌زدن رکورد",
  shop: "فروشگاه کامل",
  myClubKit: "اولین لباس باشگاهت",
  weeklyQuests: "مأموریت‌های هفتگی",
  fantasy: "فانتزی",
  stadium: "ورزشگاه",
  boots: "کفش",
  fantasyBench: "نیمکت فانتزی",
  publicLeague: "لیگ عمومی",
  seasonBoard: "جدول فصل",
  legendFrame: "قاب و عنوان اسطوره",
};
