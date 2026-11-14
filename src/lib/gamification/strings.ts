import { formatNumber as n, formatTimes } from "./format";
import type { FeatureId } from "./schemas";

/**
 * Copy for gamification surfaces, in Persian. Short and spoken, like the rest
 * of Footon. Numbers always go through `format.ts` (Persian digits).
 */
export const copy = {
  levelShort: "سطح",
  tierTitle: (tier: string) => `ردهٔ ${tier}`,
  levelRequired: (l: number) => `نیاز به سطح ${n(l)}`,
  levelN: (l: number) => `سطح ${n(l)}`,
  xpOf: (into: number, span: number) => `${n(into)} از ${n(span)} XP`,
  xpToGo: (x: number) => `${n(x)} XP مانده`,
  maxLevel: "بالاترین سطح",
  badges: (c: number) => `${n(c)} نشان`,

  // Level up
  levelUpEyebrow: "سطح بالاتر",
  levelUpTitle: (l: number) => `رسیدی به سطح ${n(l)}`,
  newTier: "ردهٔ تازه",
  unlockedNow: "باز شد",
  levelBadge: "نشان سطح",
  continue: "ادامه",
  share: "اشتراک‌گذاری",
  shareLevelText: (l: number, tier: string) => `همین الان در فوتون به سطح ${n(l)} (${tier}) رسیدم. بیا بازی بعدی را با هم پیش‌بینی کنیم.`,

  // Celebrations, announced via aria-live
  announceXp: (xp: number, coins: number, multiplier: number) =>
    `+${n(xp)} XP و ${n(coins)} سکه${multiplier > 1 ? `، کمبوی ${formatTimes(multiplier)}` : ""}`,
  announceLevel: (l: number, tier: string) => `سطح ${n(l)}، ${tier}`,
  announceStreak: (d: number) => `${n(d)} روز مسابقه پشت سر هم`,
  announceBadge: (name: string) => `نشان تازه: ${name}`,
  announceQuest: (title: string) => `مأموریت انجام شد: ${title}`,
  best: (d: number) => `بهترین ${n(d)}`,
  skip: "رد کردن",
  close: "بستن",
  locked: "قفل",
  rarity: "از بازیکن‌ها دارندش",

  // Badges
  newBadge: "نشان تازه",
  badgesTitle: "نشان‌ها",
  allBadges: "همهٔ نشان‌ها",
  earnedOf: (e: number, t: number) => `${n(e)} از ${n(t)}`,
  notEarned: "هنوز نه",
  pin: "سنجاق",
  pinned: "سنجاق‌شده",
  pinBadge: (name: string) => `سنجاق کردن ${name}`,
  unpinBadge: (name: string) => `برداشتن سنجاق ${name}`,
  pinFull: (max: number) => `تا ${n(max)} نشان را می‌توانی سنجاق کنی. برای عوض کردن، یکی را بردار.`,
  pinSlot: "سنجاق یک نشان",
  pinFailed: "ذخیره نشد. دوباره امتحان کن.",
  badgeFamily: { level: "سطح", achievement: "دستاوردها", social: "دوستان", seasonal: "فصلی" },

  // Streak (match days in a row)
  streakEyebrow: "زنجیره",
  streakTitle: "زنجیرهٔ روزهای مسابقه",
  // Persian nouns don't change after a number, so the count is only part of the signature
  matchDays: (...[]: [d: number]) => "روز مسابقه",
  streakUnit: (...[]: [d: number]) => "روز مسابقه پشت سر هم",
  streakNone: "یک بازی را پیش‌بینی کن تا زنجیره شروع شود.",
  bestRun: (d: number) => `بهترین ${n(d)}`,
  bestRunLabel: "بهترین زنجیره‌ات",
  toMilestone: (left: number, at: number) => `${n(left)} روز دیگر تا جایزهٔ ${n(at)} روزه`,
  milestoneHit: (d: number) => `جایزهٔ ${n(d)} روزه باز شد`,
  freezeUsed: "یک محافظ زنجیره‌ات را نگه داشت",
  freezes: (held: number, max: number) => `${n(held)} از ${n(max)} محافظ زنجیره`,
  freezeShort: "محافظ‌ها",

  // Broken streak: no blame, no alarm
  brokenTitle: "این زنجیره تمام شد",
  brokenBody: (best: number) => `بهترین رکوردت هنوز ${n(best)} روز مسابقه است. هر زنجیره با یک پیش‌بینی شروع می‌شود.`,
  brokenCta: "شروع زنجیرهٔ تازه",
  brokenLater: "حالا نه",

  // Quests
  questsTitle: "مأموریت‌ها",
  next: "بعدی",
  allDoneToday: "همهٔ امروزی‌ها انجام شد",
  questsToday: "مأموریت‌های امروز",
  questsWeek: "این هفته",
  questsLong: "فصل و لیگ",
  weeklyQuests: "مأموریت‌های هفتگی",
  doneOf: (d: number, t: number) => `${n(d)} از ${n(t)} انجام شد`,
  questDifficulty: { easy: "آسان", social: "با دوستان", challenge: "چالشی" },
  questKind: { daily: "روزانه", weekly: "هفتگی", seasonal: "فصل", group: "لیگ" },
  resetsIn: (left: string) => `تازه می‌شود تا ${left} دیگر`,
  endsIn: (left: string) => `${left} تا پایان`,
  questDone: "انجام شد",
  questDoneEyebrow: "مأموریت انجام شد",
  questReward: (xp: number, coins: number) => `+${n(xp)} XP • ${n(coins)} سکه`,
  questAria: (title: string, p: number, t: number, done: boolean) => (done ? `${title}، انجام شد` : `${title}، ${n(p)} از ${n(t)}`),

  // Shop
  shopTitle: "فروشگاه",
  shopBlurb: "لباس، ورزشگاه و کفش برای باشگاهت",
  shopIntro: "ظاهر باشگاهت. هیچ‌چیز اینجا پیش‌بینی، امتیاز یا جایزه را عوض نمی‌کند.",
  shopRules: "سطح خریدنی نیست. سکه هیچ‌وقت امتیاز، رتبه یا جایزه نمی‌خرد و جعبهٔ شانسی هم نداریم.",
  shopSection: { freeze: "زنجیره‌ات را نگه دار", kit: "لباس‌ها", stadium: "ورزشگاه‌ها", boots: "کفش‌ها", frame: "قاب‌ها" },
  isNew: "تازه",
  owned: "داری",
  equipped: "روی باشگاهت",
  free: "رایگان",
  previewOn: "روی باشگاهت",
  buyLabel: "خرید",
  confirmTitle: (name: string) => `${name} را می‌خری؟`,
  confirmBody: (price: number, after: number) => `${n(price)} سکه. ${n(after)} سکه برایت می‌ماند.`,
  confirmSplit: (free: number, premium: number) => `اول ${n(free)} سکهٔ رایگان، بعد ${n(premium)} سکهٔ ویژه`,
  confirm: "بخرش",
  cancel: "حالا نه",
  buying: "در حال خرید…",
  bought: "مال تو شد",
  equip: "بپوشانش",
  equipping: "در حال پوشاندن…",
  done: "تمام",
  needMore: (c: number) => `${n(c)} سکهٔ دیگر لازم داری`,
  waysToEarn: "راه‌های گرفتن سکه",
  conflict: "تا داشتی نگاه می‌کردی چیزی عوض شد. ببین و دوباره امتحان کن.",
  offline: "به فروشگاه وصل نشدیم. چیزی کم نشد.",
  noFunds: "هنوز سکهٔ کافی برای این نداری.",
  tryAgain: "دوباره امتحان کن",
  freezeFull: (max: number) => `${n(max)} محافظ داری، بیشترین تعداد ممکن`,
  itemAria: (name: string, state: string) => `${name}، ${state}`,
  priceAria: (price: number) => `${n(price)} سکه`,

  // My Club
  myClub: "باشگاه من",
  myClubBlurb: "لباس، ورزشگاه، کفش و نشان‌ها. دوستانت هم می‌بینند.",
  clubUnavailable: "این باشگاه برای تو باز نیست.",
  customise: "تغییرش بده در فروشگاه",
  shareClub: "اشتراک در تلگرام",
  sharing: "در حال ساختن کارت…",
  shareClubText: (name: string, level: number, tier: string) => `${name} در فوتون: سطح ${n(level)}، ${tier}. بیا بازی بعدی را با هم پیش‌بینی کنیم.`,
  clubAria: (name: string, level: number, tier: string, kit: string | null, streak: number) =>
    `${name}: سطح ${n(level)}، ${tier}${kit ? `، با ${kit}` : ""}${streak > 0 ? `، ${n(streak)} روز مسابقه پشت سر هم` : ""}`,

  // Combo (right answers in a row, in one match)
  comboLabel: "کمبو",
  comboCount: (c: number) => (c === 0 ? "هنوز زنجیره‌ای نیست" : `${n(c)} درست پشت سر هم`),
  comboAria: (c: number, m: number, next: { at: number; multiplier: number } | null) =>
    `کمبو: ${n(c)} درست پشت سر هم، XP ${formatTimes(m)}${next ? `. ${formatTimes(next.multiplier)} با ${n(next.at)}` : ""}`,
} as const;

/** What a level opens, for the Level Up screen, the Level card and locked gates. */
export const featureName: Record<FeatureId, string> = {
  predictions: "پیش‌بینی‌ها",
  livePredictions: "پیش‌بینی زنده",
  profile: "پروفایل",
  joinLeague: "پیوستن به لیگ",
  weeklyLeaderboard: "جدول هفتگی",
  createLeague: "ساختن لیگ",
  invite: "دعوت دوستان",
  reactions: "واکنش‌ها و استیکرها",
  shopFreeze: "فروشگاه: محافظ زنجیره",
  shop: "فروشگاه کامل",
  myClubKit: "اولین لباس باشگاهت",
  weeklyQuests: "مأموریت‌های هفتگی",
  fantasy: "فانتزی",
  stadium: "ورزشگاه",
  boots: "کفش",
  fantasyBench: "نیمکت فانتزی",
  publicLeague: "لیگ‌های عمومی",
  seasonBoard: "جدول فصل",
  legendFrame: "قاب و عنوان اسطوره",
};
