/**
 * Mock data that mirrors the design canvas. Replace with real API calls.
 * Keep shapes stable: components import these types.
 */
import type { Outcome } from "@/components/footon/form-bars";
import type { LiveQuestion } from "@/components/footon/question-card";
import type { Prediction } from "@/lib/predictions";

/** `colors` = [shirt, trim]; drives the placeholder crest. */
export type Team = { code: string; name: string; colors?: [string, string] };

export type MatchEventKind = "goal" | "yellow" | "red" | "sub" | "var";
/** One thing that happened. `detail` = who came off for a sub, or the VAR call. */
export type MatchEvent = { minute: number; side: "home" | "away"; player: string; kind: MatchEventKind; detail?: string };
export type MatchStat = { label: string; home: number; away: number; unit?: string };

/**
 * Your part in a match. `streak` = correct calls in a row right now; 3+ is a
 * hot streak and gets the flame.
 */
export type MatchYou = { calls: number; right: number; points: number; streak: number };

export const HOT_STREAK = 3;

export type Match = {
  id: string;
  home: Team;
  away: Team;
  status: "live" | "upcoming" | "finished";
  minute?: number;
  score?: [number, number];
  kickoff?: string;
  /** Day label for fixtures after today ("شنبه"); absent = today. */
  day?: string;
  /** Days from `mockToday` (-1 yesterday, 1 tomorrow); absent = today. Drives the Live tab's day strip. */
  dayOffset?: number;
  /** Short context line: your league on this match, or the competition. */
  caption: string;
  /** Competition, for grouping the live list ("لیگ برتر"). */
  competition: string;
  /** Set when you play this match in one of your leagues. */
  league?: string;
  /** Your part in this match (points, calls), when you've made calls on it. */
  you?: MatchYou;
  events?: MatchEvent[];
  stats?: MatchStat[];
  /** The headline quick call shown on the match card. */
  market?: Market;
  /**
   * A big match: every coin a right prediction wins pays back this many times
   * over (shown as the amber "2x" boost). Points are never boosted here.
   */
  boost?: 2;
  /** Live: how many of tonight's questions have been asked so far. */
  progress?: { asked: number; total: number };
  /** How the crowd called the result, in %, the most-called score and how many voted. */
  crowd?: { home: number; draw: number; away: number; topScore: [number, number]; votes: number };
  lineups?: { home: Lineup; away: Lineup };
  /** Last meetings, from the home side's view. */
  h2h?: { won: number; drawn: number; lost: number };
  /** League table rows around both teams. */
  table?: TableRow[];
  /** Pre-match facts for the Preview tab. */
  preview?: MatchPreview;
  /** Finished: the coins this match moved for you, each with its reason. */
  settlement?: CoinEntry[];
};

export type FormResult = "W" | "D" | "L";
export type MatchPreview = {
  venue: { name: string; city: string; capacity: number; surface: string };
  weather: { tempC: number; sky: string };
  referee: string;
  tv: string[];
  /** Last five league results, oldest first. */
  form: { home: FormResult[]; away: FormResult[] };
  news?: { title: string; source: string; ago: string };
};

/** A Yes/No quick call with the crowd's share. Calls earn points, never coins. */
export type Market = {
  id: string;
  question: string;
  /** % of players on Yes. */
  yesShare: number;
  /** Seconds until it locks; absent before kickoff. */
  closesIn?: number;
};

export type Player = { number: number; name: string; pos: string };
export type Lineup = { formation: string; players: Player[] };
export type TableRow = { pos: number; code: string; played: number; gd: number; points: number };

/** Your coins right now. Points live on the profile; they never mix. */
export const wallet = { coins: 6450 };

/** The mock "today" (a Tuesday). Day offsets and the day strip are relative to it. */
export const mockToday = "2026-11-03";

/** Country per competition, for the group headers ("انگلیس • لیگ برتر"). */
export const competitions: Record<string, { country: string; code: string }> = {
  "لیگ برتر": { country: "انگلیس", code: "ENG" },
  "لالیگا": { country: "اسپانیا", code: "ESP" },
  "سری آ": { country: "ایتالیا", code: "ITA" },
  "لوشامپیونه": { country: "فرانسه", code: "FRA" },
};

const plTable: TableRow[] = [
  { pos: 1, code: "LIV", played: 11, gd: 14, points: 27 },
  { pos: 2, code: "ARS", played: 11, gd: 12, points: 25 },
  { pos: 3, code: "MCI", played: 11, gd: 11, points: 24 },
  { pos: 4, code: "CHE", played: 11, gd: 8, points: 21 },
  { pos: 5, code: "NEW", played: 11, gd: 5, points: 19 },
  { pos: 6, code: "TOT", played: 11, gd: 4, points: 18 },
];

export const recentForm: Outcome[] = ["W", "W", "L", "W", "V", "L"];

export const matches: Match[] = [
  {
    id: "liv-mci",
    home: { code: "LIV", name: "لیورپول", colors: ["#C8102E", "#F6EB61"] },
    away: { code: "MCI", name: "منچسترسیتی", colors: ["#6CABDD", "#1C2C5B"] },
    status: "live",
    minute: 67,
    score: [1, 1],
    caption: "رقبای جمعه • ورودی ۵۰۰",
    competition: "لیگ برتر",
    league: "رقبای جمعه",
    you: { calls: 4, right: 3, points: 120, streak: 3 },
    events: [
      { minute: 23, side: "home", player: "صلاح", kind: "goal" },
      { minute: 34, side: "away", player: "رودری", kind: "yellow" },
      { minute: 58, side: "away", player: "هالند", kind: "goal" },
      { minute: 61, side: "home", player: "نونیز", kind: "sub", detail: "ژوتا" },
    ],
    stats: [
      { label: "مالکیت توپ", home: 54, away: 46, unit: "%" },
      { label: "شوت", home: 11, away: 9 },
      { label: "کرنر", home: 4, away: 3 },
      { label: "شوت در چارچوب", home: 5, away: 4 },
      { label: "خطا", home: 8, away: 10 },
      { label: "آفساید", home: 1, away: 2 },
    ],
    market: { id: "mk-liv-1", question: "کرنر بعدی قبل از دقیقهٔ ۷۵؟", yesShare: 58, closesIn: 38 },
    progress: { asked: 7, total: 10 },
    crowd: { home: 41, draw: 33, away: 26, topScore: [2, 1], votes: 18412 },
    h2h: { won: 2, drawn: 2, lost: 1 },
    table: plTable,
    lineups: {
      home: {
        formation: "4-3-3",
        players: [
          { number: 1, name: "آلیسون", pos: "GK" },
          { number: 66, name: "الکساندر-آرنولد", pos: "RB" },
          { number: 5, name: "کوناته", pos: "CB" },
          { number: 4, name: "فن‌دایک", pos: "CB" },
          { number: 26, name: "رابرتسون", pos: "LB" },
          { number: 10, name: "مک‌آلیستر", pos: "CM" },
          { number: 38, name: "خراونبرخ", pos: "CM" },
          { number: 8, name: "سوبوسلای", pos: "CM" },
          { number: 11, name: "صلاح", pos: "RW" },
          { number: 9, name: "نونیز", pos: "ST" },
          { number: 7, name: "دیاز", pos: "LW" },
        ],
      },
      away: {
        formation: "4-3-3",
        players: [
          { number: 31, name: "ادرسون", pos: "GK" },
          { number: 2, name: "واکر", pos: "RB" },
          { number: 3, name: "دیاش", pos: "CB" },
          { number: 25, name: "آکانجی", pos: "CB" },
          { number: 24, name: "گواردیول", pos: "LB" },
          { number: 16, name: "رودری", pos: "CM" },
          { number: 17, name: "دی‌بروینه", pos: "CM" },
          { number: 20, name: "سیلوا", pos: "CM" },
          { number: 47, name: "فودن", pos: "RW" },
          { number: 9, name: "هالند", pos: "ST" },
          { number: 11, name: "دوکو", pos: "LW" },
        ],
      },
    },
  },
  {
    id: "bet-sev",
    home: { code: "BET", name: "رئال بتیس", colors: ["#00954C", "#FFFFFF"] },
    away: { code: "SEV", name: "سویا", colors: ["#F43333", "#FFFFFF"] },
    status: "live",
    minute: 35,
    score: [1, 0],
    caption: "لالیگا",
    competition: "لالیگا",
    events: [
      { minute: 12, side: "away", player: "آگومه", kind: "yellow" },
      { minute: 29, side: "home", player: "ایسکو", kind: "goal" },
    ],
    stats: [
      { label: "مالکیت توپ", home: 58, away: 42, unit: "%" },
      { label: "شوت", home: 6, away: 3 },
      { label: "کرنر", home: 3, away: 1 },
      { label: "شوت در چارچوب", home: 3, away: 1 },
    ],
    crowd: { home: 52, draw: 27, away: 21, topScore: [2, 0], votes: 6204 },
  },
  {
    id: "ata-par",
    home: { code: "ATA", name: "آتالانتا", colors: ["#1E71B8", "#000000"] },
    away: { code: "PAR", name: "پارما", colors: ["#FFDD00", "#1B4094"] },
    status: "live",
    minute: 12,
    score: [0, 0],
    caption: "سری آ",
    competition: "سری آ",
    events: [],
    stats: [
      { label: "مالکیت توپ", home: 63, away: 37, unit: "%" },
      { label: "شوت", home: 2, away: 0 },
    ],
    crowd: { home: 68, draw: 20, away: 12, topScore: [2, 0], votes: 3877 },
  },
  {
    id: "ars-che",
    home: { code: "ARS", name: "آرسنال", colors: ["#EF0107", "#FFFFFF"] },
    away: { code: "CHE", name: "چلسی", colors: ["#034694", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "21:00",
    caption: "امشب",
    competition: "لیگ برتر",
    boost: 2,
    you: { calls: 2, right: 0, points: 0, streak: 0 },
    market: { id: "mk-ars-1", question: "آرسنال می‌برد؟", yesShare: 47 },
    crowd: { home: 47, draw: 28, away: 25, topScore: [2, 1], votes: 9310 },
    table: plTable,
    h2h: { won: 2, drawn: 1, lost: 2 },
    preview: {
      venue: { name: "ورزشگاه امارات", city: "لندن، انگلیس", capacity: 60704, surface: "چمن طبیعی" },
      weather: { tempC: 9, sky: "ابری" },
      referee: "مایکل الیور",
      tv: ["Sky Sports Main Event", "Sky Go"],
      form: { home: ["W", "W", "D", "W", "L"], away: ["W", "L", "W", "D", "W"] },
      news: { title: "آرسنال - چلسی: اخبار دو تیم و ترکیب احتمالی", source: "لاکی فن", ago: "۲ ساعت پیش" },
    },
  },
  {
    id: "new-tot",
    home: { code: "NEW", name: "نیوکاسل", colors: ["#241F20", "#FFFFFF"] },
    away: { code: "TOT", name: "تاتنهام", colors: ["#132257", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "19:30",
    caption: "لیگ برتر",
    competition: "لیگ برتر",
    market: { id: "mk-new-1", question: "هر دو تیم گل می‌زنند؟", yesShare: 64 },
    crowd: { home: 44, draw: 26, away: 30, topScore: [1, 1], votes: 4127 },
    table: plTable,
    h2h: { won: 3, drawn: 0, lost: 2 },
    preview: {
      venue: { name: "سنت جیمز پارک", city: "نیوکاسل، انگلیس", capacity: 52758, surface: "چمن طبیعی" },
      weather: { tempC: 8, sky: "باران سبک" },
      referee: "آنتونی تیلور",
      tv: ["TNT Sports 1", "discovery+"],
      form: { home: ["D", "W", "W", "L", "W"], away: ["L", "W", "D", "W", "L"] },
      news: { title: "پنج نکته برای امشب در سنت جیمز پارک", source: "لاکی فن", ago: "۵ ساعت پیش" },
    },
  },
  {
    id: "bha-eve",
    home: { code: "BHA", name: "برایتون", colors: ["#0057B8", "#FFFFFF"] },
    away: { code: "EVE", name: "اورتون", colors: ["#003399", "#FFFFFF"] },
    status: "finished",
    score: [2, 0],
    caption: "لیگ برتر",
    competition: "لیگ برتر",
    events: [
      { minute: 17, side: "home", player: "میتوما", kind: "goal" },
      { minute: 44, side: "away", player: "گی", kind: "yellow" },
      { minute: 71, side: "home", player: "ولبک", kind: "goal" },
      { minute: 78, side: "away", player: "کالورت-لوین", kind: "sub", detail: "بتو" },
    ],
    stats: [
      { label: "مالکیت توپ", home: 61, away: 39, unit: "%" },
      { label: "شوت", home: 14, away: 6 },
      { label: "شوت در چارچوب", home: 6, away: 2 },
      { label: "کرنر", home: 7, away: 2 },
    ],
    you: { calls: 6, right: 5, points: 240, streak: 5 },
    settlement: [
      { id: "s-1", label: "صندوق ساحلی‌ها", reason: "اول از ۲ نفر • ۵٪ سوخت", amount: 950 },
      { id: "s-2", label: "تا آخر بازی ماندی", reason: "۳ جواب یا بیشتر تا دقیقهٔ ۹۰", amount: 100 },
      { id: "s-3", label: "پیش‌بینی کمیاب درست", reason: "فقط ۱۴٪ به گل دقیقهٔ ۷۱ «بله» گفتند", amount: 50 },
    ],
  },
  {
    id: "mun-liv",
    home: { code: "MUN", name: "منچستریونایتد", colors: ["#DA291C", "#FBE122"] },
    away: { code: "LIV", name: "لیورپول", colors: ["#C8102E", "#F6EB61"] },
    status: "upcoming",
    kickoff: "13:30",
    day: "شنبه",
    dayOffset: 4,
    caption: "لیگ برتر",
    competition: "لیگ برتر",
    boost: 2,
    market: { id: "mk-mun-1", question: "لیورپول در اولدترافورد می‌برد؟", yesShare: 52 },
  },
  {
    id: "che-mci",
    home: { code: "CHE", name: "چلسی", colors: ["#034694", "#FFFFFF"] },
    away: { code: "MCI", name: "منچسترسیتی", colors: ["#6CABDD", "#1C2C5B"] },
    status: "upcoming",
    kickoff: "16:30",
    day: "یکشنبه",
    dayOffset: 5,
    caption: "لیگ برتر",
    competition: "لیگ برتر",
  },
];

matches.push(
  {
    id: "avl-whu",
    home: { code: "AVL", name: "استون‌ویلا", colors: ["#670E36", "#95BFE5"] },
    away: { code: "WHU", name: "وستهم", colors: ["#7A263A", "#1BB1E7"] },
    status: "finished",
    score: [3, 1],
    day: "دیروز",
    dayOffset: -1,
    caption: "لیگ برتر",
    competition: "لیگ برتر",
  },
  {
    id: "lor-bre",
    home: { code: "LOR", name: "لوریان", colors: ["#F58113", "#000000"] },
    away: { code: "BRE", name: "برست", colors: ["#E2001A", "#FFFFFF"] },
    status: "finished",
    score: [1, 1],
    day: "دیروز",
    dayOffset: -1,
    caption: "لوشامپیونه",
    competition: "لوشامپیونه",
  },
  {
    id: "rma-val",
    home: { code: "RMA", name: "رئال مادرید", colors: ["#FFFFFF", "#00529F"] },
    away: { code: "VAL", name: "والنسیا", colors: ["#FFFFFF", "#EE3524"] },
    status: "upcoming",
    kickoff: "20:00",
    day: "چهارشنبه",
    dayOffset: 1,
    caption: "لالیگا",
    competition: "لالیگا",
    crowd: { home: 71, draw: 17, away: 12, topScore: [3, 1], votes: 12880 },
    preview: {
      venue: { name: "سانتیاگو برنابئو", city: "مادرید، اسپانیا", capacity: 83186, surface: "چمن هیبریدی" },
      weather: { tempC: 12, sky: "صاف" },
      referee: "خوان مارتینس مونوئرا",
      tv: ["Premier Sports 1", "LaLigaTV"],
      form: { home: ["W", "W", "W", "D", "W"], away: ["L", "D", "L", "W", "D"] },
    },
  },
  {
    id: "int-nap",
    home: { code: "INT", name: "اینتر", colors: ["#0068A8", "#000000"] },
    away: { code: "NAP", name: "ناپولی", colors: ["#12A0D7", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "19:45",
    day: "چهارشنبه",
    dayOffset: 1,
    caption: "سری آ",
    competition: "سری آ",
  },
);


/**
 * One row of a friends' league or division table. `move` = places gained (+)
 * or lost (−) since the last update; `right` / `calls` = calls right of calls made.
 */
export type Standing = {
  name: string;
  initial: string;
  points: number;
  you?: boolean;
  /** Places gained since the last update (negative = dropped). */
  delta?: number;
  right?: number;
  calls?: number;
  /** Fixed position, for tables shown with gaps (a division around you). */
  rank?: number;
};

export const league = {
  name: "رقبای جمعه",
  code: "sun9k",
  link: "t.me/luckyfan_bot?start=sun9k",
  standings: [
    { name: "تو", initial: "ت", points: 840, you: true, delta: 1, right: 17, calls: 22 },
    { name: "سارا", initial: "س", points: 790, delta: -1, right: 16, calls: 22 },
    { name: "امید", initial: "ا", points: 770, right: 15, calls: 21 },
  ] satisfies Standing[],
};

/**
 * Your weekly division: everyone on Lucky Fan at your level, ranked by points
 * (skill only). Top `promote` go up, bottom `relegate` go down when the week ends.
 * `rows` is the slice the app shows: the top of the table, the places around
 * you, and the bottom.
 */
export const division = {
  name: "نقره‌ای",
  week: 10,
  endsIn: "۴ روز",
  size: 30,
  promote: 5,
  relegate: 5,
  rows: [
    { rank: 1, name: "نیما", initial: "ن", points: 5610, right: 112, calls: 158, delta: 0 },
    { rank: 2, name: "هانا", initial: "ه", points: 5480, right: 109, calls: 161, delta: 2 },
    { rank: 3, name: "لیلا", initial: "ل", points: 5320, right: 106, calls: 149, delta: -1 },
    { rank: 4, name: "مینا", initial: "م", points: 5150, right: 103, calls: 155, delta: -1 },
    { rank: 5, name: "تینا", initial: "ت", points: 5040, right: 100, calls: 147, delta: 1 },
    { rank: 6, name: "دارا", initial: "د", points: 4990, right: 99, calls: 152, delta: -1 },
    { rank: 7, name: "ایرج", initial: "ا", points: 4900, right: 98, calls: 150, delta: 0 },
    { rank: 8, name: "تو", initial: "ت", points: 4820, right: 96, calls: 141, delta: 3, you: true },
    { rank: 9, name: "سام", initial: "س", points: 4770, right: 95, calls: 150, delta: -2 },
    { rank: 10, name: "آرش", initial: "آ", points: 4700, right: 94, calls: 146, delta: 0 },
    { rank: 28, name: "بهرام", initial: "ب", points: 3180, right: 63, calls: 132, delta: -1 },
    { rank: 29, name: "کاوه", initial: "ک", points: 3050, right: 61, calls: 128, delta: 0 },
    { rank: 30, name: "الهام", initial: "ا", points: 2910, right: 58, calls: 140, delta: -2 },
  ] satisfies Standing[],
};

export const liveQuestion: LiveQuestion = {
  index: 4,
  total: 10,
  text: "کرنر بعدی قبل از دقیقهٔ ۷۵؟",
  hint: "هر کدام از دو تیم • وقت که تمام بشه جواب‌ها قفل میشن",
  seconds: 38,
  yesShare: 58,
  resolvesAt: "دقیقهٔ ۷۵",
};

export const chat = {
  messages: [
    { from: "امید", initial: "ا", text: "باز هم هالند. باورنکردنیه." },
    { from: "تو", initial: "ت", text: "سیتی الان کامل مسلطه", you: true },
    { from: "سارا", initial: "س", text: "ببین، لیورپول تا ۵ دقیقهٔ دیگه کرنر می‌گیره" },
    { from: "تو", initial: "ت", text: "من این یکی رو «نه» می‌زنم", you: true },
    { from: "سارا", initial: "س", text: "این یکی رو از دست میدی." },
  ],
  questions: [{ id: "fq-1", from: "امید", initial: "ا", text: "کارت زرد قبل از دقیقهٔ ۸۰؟", closes: "دقیقهٔ ۸۰" }],
  reactions: ["VAR!", "آفساید", "عجب سیوی"],
};

/**
 * Onboarding: the first mission's coins, the sample question and the club
 * picker. The 15,000 starter coins arrive mission by mission over the first
 * week, never in one lump; picking your club is mission one.
 */
export const onboarding = {
  startingCoins: 1000,
  sample: {
    match: "لیورپول ۱–۱ سیتی",
    minute: 67,
    text: "کرنر بعدی قبل از دقیقهٔ ۷۵؟",
    yesShare: 62,
    /** How the sample resolves, so the demo can show a real outcome. */
    outcome: "yes" as "yes" | "no",
    resolvedLabel: "کرنر در دقیقهٔ ۷۱",
    /** Points for a right call. Calls earn points; coins come from missions and play. */
    reward: 50,
  },
  /** The next three starter missions, shown as the numbered row. */
  steps: [
    { title: "یک پیش‌بینی کن", coins: 1000 },
    { title: "به یک لیگ بپیوند", coins: 2000 },
    { title: "یک دوست دعوت کن", coins: 2000 },
  ],
  clubs: [
    { code: "LIV", name: "لیورپول", colors: ["#C8102E", "#F6EB61"] },
    { code: "MCI", name: "منچسترسیتی", colors: ["#6CABDD", "#1C2C5B"] },
    { code: "ARS", name: "آرسنال", colors: ["#EF0107", "#FFFFFF"] },
    { code: "CHE", name: "چلسی", colors: ["#034694", "#FFFFFF"] },
    { code: "MUN", name: "منچستریونایتد", colors: ["#DA291C", "#FBE122"] },
    { code: "TOT", name: "تاتنهام", colors: ["#132257", "#FFFFFF"] },
    { code: "NEW", name: "نیوکاسل", colors: ["#241F20", "#FFFFFF"] },
    { code: "AVL", name: "استون‌ویلا", colors: ["#670E36", "#95BFE5"] },
  ] satisfies Team[],
};

/** Every club you can follow from Profile (searchable). Onboarding shows only the first eight. */
export const clubDirectory: Team[] = [
  ...onboarding.clubs,
  { code: "BHA", name: "برایتون", colors: ["#0057B8", "#FFFFFF"] },
  { code: "EVE", name: "اورتون", colors: ["#003399", "#FFFFFF"] },
  { code: "WHU", name: "وستهم", colors: ["#7A263A", "#1BB1E7"] },
  { code: "BRE", name: "برنتفورد", colors: ["#E30613", "#FFFFFF"] },
  { code: "NFO", name: "ناتینگهام فارست", colors: ["#DD0000", "#FFFFFF"] },
  { code: "FUL", name: "فولام", colors: ["#FFFFFF", "#000000"] },
  { code: "CRY", name: "کریستال پالاس", colors: ["#1B458F", "#C4122E"] },
  { code: "WOL", name: "ولورهمپتون", colors: ["#FDB913", "#231F20"] },
  { code: "BOU", name: "بورنموث", colors: ["#DA291C", "#000000"] },
  { code: "RMA", name: "رئال مادرید", colors: ["#FFFFFF", "#00529F"] },
  { code: "BAR", name: "بارسلونا", colors: ["#A50044", "#004D98"] },
  { code: "BET", name: "رئال بتیس", colors: ["#00954C", "#FFFFFF"] },
  { code: "SEV", name: "سویا", colors: ["#FFFFFF", "#D81E05"] },
  { code: "VAL", name: "والنسیا", colors: ["#FFFFFF", "#EE3524"] },
  { code: "INT", name: "اینتر", colors: ["#0068A8", "#000000"] },
  { code: "NAP", name: "ناپولی", colors: ["#12A0D7", "#FFFFFF"] },
  { code: "ATA", name: "آتالانتا", colors: ["#1E71B8", "#000000"] },
  { code: "PSG", name: "پاری‌سن‌ژرمن", colors: ["#004170", "#DA291C"] },
  { code: "BAY", name: "بایرن", colors: ["#DC052D", "#FFFFFF"] },
];

/**
 * How a challenge prices its predictions. `stake: "free"` = each player picks
 * their own stake per prediction (at least the type's minimum); `{ fixed }` =
 * the creator set one stake for every prediction. `cap` = the most one player
 * can stake across all their predictions on the match.
 */
export type ChallengeRules = { stake: "free" | { fixed: number }; cap?: number };

/**
 * A friends' challenge (a small league on one match).
 *   invited  → someone asked you in; Accept / Decline on its page
 *   joined   → you're in; predictions open until kickoff
 *   expired  → the invite closed at kickoff before you answered
 *   finished → the match is over and the pool settled
 * `mine` = you created it.
 */
export type Challenge = {
  id: string;
  name: string;
  matchId: string;
  /** Coins each player puts in the pool (one of ENTRY_TIERS). */
  entry: number;
  /** Who's in, by initial (`YOU_INITIAL` is you). */
  members: string[];
  status: "invited" | "joined" | "expired" | "finished";
  rules: ChallengeRules;
  /** Who invited you (absent when it's yours). */
  from?: { name: string; initial: string };
  mine?: boolean;
  /** Your place, once calls have resolved. */
  rank?: number;
  /** The league table on this match, once calls have resolved. */
  table?: Standing[];
};

export const challenges: Challenge[] = [
  { id: "ch-1", name: "رقبای جمعه", matchId: "liv-mci", entry: 500, members: ["ت", "س", "ا"], status: "joined", mine: true, rank: 1, rules: { stake: "free", cap: 2500 }, table: league.standings },
  {
    id: "ch-2",
    name: "شب دربی",
    matchId: "ars-che",
    entry: 1500,
    members: ["س", "م", "ر", "ت"],
    status: "joined",
    from: { name: "سارا", initial: "س" },
    rules: { stake: { fixed: 250 }, cap: 1500 },
  },
  {
    id: "ch-4",
    name: "پنج‌نفرهٔ اداره",
    matchId: "new-tot",
    entry: 500,
    members: ["ا", "ک"],
    status: "invited",
    from: { name: "امید", initial: "ا" },
    rules: { stake: { fixed: 100 }, cap: 1000 },
  },
  {
    id: "ch-5",
    name: "شمال‌غرب",
    matchId: "mun-liv",
    entry: 2500,
    members: ["ل", "ی", "پ", "آ"],
    status: "invited",
    from: { name: "لنا", initial: "ل" },
    rules: { stake: "free", cap: 2500 },
  },
  {
    id: "ch-3",
    name: "ساحلی‌ها",
    matchId: "bha-eve",
    entry: 500,
    members: ["ت", "ک"],
    status: "finished",
    mine: true,
    rank: 1,
    rules: { stake: "free" },
    table: [
      { name: "تو", initial: "ت", points: 240, right: 5, calls: 6, you: true },
      { name: "کیان", initial: "ک", points: 190, right: 4, calls: 6 },
    ],
  },
  {
    id: "ch-6",
    name: "زرشکی و آبی",
    matchId: "avl-whu",
    entry: 500,
    members: ["ک", "ی"],
    status: "expired",
    from: { name: "کیان", initial: "ک" },
    rules: { stake: "free", cap: 1000 },
  },
  {
    id: "ch-7",
    name: "خوره‌های لوشامپیونه",
    matchId: "lor-bre",
    entry: 1500,
    members: ["پ", "آ", "ر"],
    status: "expired",
    from: { name: "پویا", initial: "پ" },
    rules: { stake: { fixed: 250 } },
  },
];

/** A pending invite, as the invite tile / strip / rows read it. `id` is the challenge id. */
export type Invite = {
  id: string;
  from: string;
  initial: string;
  league: string;
  entry: number;
  members: string[];
  matchId: string;
  rules: ChallengeRules;
};

export const invites: Invite[] = challenges
  .filter((c) => c.status === "invited")
  .map((c) => ({
    id: c.id,
    from: c.from?.name ?? "",
    initial: c.from?.initial ?? "",
    league: c.name,
    entry: c.entry,
    members: c.members,
    matchId: c.matchId,
    rules: c.rules,
  }));

/**
 * Predictions you've already locked, by match. Before kickoff they stay
 * editable; once a match is on, `result` marks how each one went.
 */
export const predictionSlips: Record<string, Prediction[]> = {
  "ars-che": [
    { id: "p-1", type: "result", pick: "1", stake: 250 },
    { id: "p-2", type: "corners", pick: "Over 9.5", stake: 250 },
  ],
  "mun-liv": [
    { id: "p-6", type: "result", pick: "2", stake: 500 },
    { id: "p-7", type: "goals", pick: "Over 2.5", stake: 250 },
    { id: "p-8", type: "penalty", pick: "Yes", stake: 100 },
  ],
  "bha-eve": [
    { id: "p-3", type: "result", pick: "1", stake: 250, result: "right" },
    { id: "p-4", type: "goals", pick: "Over 2.5", stake: 250, result: "right" },
    { id: "p-5", type: "red", pick: "Yes", stake: 200, result: "wrong" },
  ],
};

/** Chat before kickoff, for a challenge whose match hasn't started. */
export const prematchChat = {
  messages: [
    { from: "سارا", initial: "س", text: "از الان میگم، دو گل قبل از نیمه" },
    { from: "تو", initial: "ت", text: "جسورانه‌ست. من کرنرها رو «بیشتر» زدم", you: true },
    { from: "مکس", initial: "م", text: "کس دیگه‌ای هم بوی کارت قرمز حس می‌کنه؟" },
  ],
  questions: [{ id: "fq-pre", from: "سارا", initial: "س", text: "ساکا گل اول را می‌زند؟", closes: "شروع بازی" }],
  reactions: ["گفته بودم", "آسون بود", "باز نه"],
};

/** First names for the initials in league member lists. */
/** Friends whose club (`/club/[userId]`) you can open, by initial. */
/** Your initial in member lists ("ت" for تو, "you"). */
export const YOU_INITIAL = "ت";

export const clubIds: Record<string, string> = { "س": "sara", "ا": "omid" };

export const people: Record<string, string> = {
  "ت": "تو",
  "س": "سارا",
  "ا": "امید",
  "م": "مکس",
  "ر": "رضا",
  "ک": "کیان",
  "ل": "لنا",
  "ی": "یونس",
  "پ": "پویا",
  "آ": "آریا",
};

export const profile = {
  name: "تو",
  /** Total points: skill only, from right calls. Rank and prizes read this. */
  points: 4820,
  referral: { code: "FOOT-Y7K2", bonus: 1500, joined: 2 },
  /** Clubs you follow; picked in onboarding, edited on Profile. */
  favoriteTeams: ["LIV"],
  /** Calls you have running right now. */
  activeCalls: 2,
};

/** Banter you can send without typing. Grouped for the quick-reply palette. */
export const chatPresets: { group: string; phrases: string[] }[] = [
  { group: "کل‌کل", phrases: ["گفته بودم", "باز نه", "آسون بود", "باز وا دادن", "حالا کی می‌خنده"] },
  { group: "داور", phrases: ["VAR!", "آفساید", "پنالتی نبود", "کارتش بده", "ادامه بده"] },
  { group: "گل", phrases: ["چه ضربه‌ای", "عجب سیوی", "آره!", "گوشهٔ دروازه"] },
];

/** In-house sticker ids (SVG drawn in components/footon/stickers.tsx). */
export const stickers = ["var-screen", "red-card", "golden-boot", "crying-ball", "whistle", "goal-net", "trophy", "megaphone"] as const;
export type StickerId = (typeof stickers)[number];

/* ---------- Economy: missions, earning, activity, shop ---------- */

/** One coin movement with the reason it happened. Spends are negative. */
export type CoinEntry = { id: string; label: string; reason: string; amount: number; day?: string };

/**
 * Starter missions: 15,000 coins over the first week, paid for doing the real
 * thing (never as a gift). `done` carries the reason shown once it's paid.
 */
export type Mission = { id: string; title: string; coins: number; done?: string };

export const starter = {
  day: 3,
  missions: [
    { id: "m-1", title: "باشگاه و پروفایلت را انتخاب کن", coins: 1000, done: "لیورپول را انتخاب کردی" },
    { id: "m-2", title: "اولین پیش‌بینی‌ات را بکن", coins: 1000, done: "در برایتون - اورتون پیش‌بینی کردی" },
    { id: "m-3", title: "به اولین لیگ دوستانه‌ات بپیوند", coins: 2000, done: "به ساحلی‌ها پیوستی" },
    { id: "m-4", title: "یه دوست دعوت کن که عضو بشه", coins: 2000 },
    { id: "m-5", title: "تا آخر یک بازی بمان", coins: 2000, done: "تا سوت پایان ماندی" },
    { id: "m-6", title: "به ۱۰ سؤال زنده جواب بده", coins: 1500, done: "۱۰ جواب ثبت شد" },
    { id: "m-7", title: "اولین سؤالت را در چت بپرس", coins: 1500 },
    { id: "m-8", title: "روز سوم برگرد", coins: 2000, done: "امروز برگشتی" },
    { id: "m-9", title: "یک صندوق یا جدول رایگان را ببر", coins: 2000, done: "ساحلی‌ها را بردی" },
  ] satisfies Mission[],
};

/** This week's capped earnings, so you can see what's left to earn. */
export const weekly = {
  mission: { title: "۳ بازی را تا آخر ببین", done: 2, total: 3, coins: 750 },
  caps: [
    { id: "free-table", label: "جایزه‌های جدول رایگان", used: 700, cap: 2000, period: "این هفته" },
    { id: "invites", label: "دوستانی که یک بازی را تمام کردند", used: 1, cap: 6, period: "این ماه", unit: "دوست" },
  ],
};

/** Ways to keep earning after the first week. `cap` is shown as written. */
export const earnWays = [
  { id: "e-1", label: "تا آخر ببین", detail: "۳ جواب یا بیشتر تا دقیقهٔ ۹۰", coins: 100, cap: "هر بازی" },
  { id: "e-2", label: "سه نفر اول جدول رایگان", detail: "۴۰۰ / ۳۰۰ / ۲۰۰", coins: 400, cap: "تا ۲٬۰۰۰ در هفته" },
  { id: "e-3", label: "پیش‌بینی کمیاب درست", detail: "کمتر از ۲۰٪ انتخابش کردند", coins: 50, cap: "تا ۱۵۰ در هر بازی" },
  { id: "e-4", label: "پنج بازی پشت سر هم", detail: "هر بار تا آخر", coins: 500, cap: "هر ۵ بازی" },
  { id: "e-5", label: "دوستت یه بازی را تا آخر بازی کنه", detail: "اولین بازی‌اش، بعد از دعوت تو", coins: 1500, cap: "تا ۶ بار در ماه" },
  { id: "e-6", label: "دوستات به سؤالت جواب بدن", detail: "۵۰ برای هر دوست", coins: 50, cap: "تا ۲۵۰ برای هر سؤال" },
  { id: "e-7", label: "صعود در لیگ هفتگی", detail: "صعود", coins: 1000, cap: "هر هفته" },
];

export const coinActivity: CoinEntry[] = [
  { id: "a-1", label: "ورودی رقبای جمعه", reason: "لیورپول - سیتی • به صندوق", amount: -500, day: "امروز" },
  { id: "a-2", label: "روز سوم برگشتی", reason: "مأموریت شروع", amount: 2000, day: "امروز" },
  { id: "a-3", label: "صندوق ساحلی‌ها", reason: "اول از ۲ نفر • برایتون - اورتون", amount: 950, day: "دیروز" },
  { id: "a-4", label: "تا آخر بازی ماندی", reason: "برایتون - اورتون", amount: 100, day: "دیروز" },
  { id: "a-5", label: "ساختن رقبای جمعه", reason: "لیگ تازه", amount: -1500, day: "دیروز" },
  { id: "a-6", label: "دوم در جدول رایگان", reason: "استون‌ویلا - وستهم", amount: 300, day: "یکشنبه" },
];


/* ---------- Sponsor banners (Home) ---------- */

/**
 * A commercial banner in Home's partner slot. Always labelled as sponsored and
 * named after the partner. `colors` = [ground, ink, accent] from the partner's
 * brand (data, like a club's kit), never Lucky Fan's own roles. `art` picks the
 * illustration. Rules: no countdowns, no "last chance", never shown after a
 * loss; prizes are won by points (rank), never bought.
 * Partners below are fictional examples.
 */
export type Promo = {
  id: string;
  partner: string;
  /** What kind of deal this is, shown next to "Sponsored". */
  kind: "شریک جایزه" | "شریک تجهیزات" | "شریک پخش";
  headline: string;
  body: string;
  cta: string;
  href: string;
  external?: boolean;
  colors: [string, string, string];
  art: "trophy" | "boot" | "screen";
};

export const promos: Promo[] = [
  {
    id: "promo-kestrel-ball",
    partner: "ورزشی کسترل",
    kind: "شریک جایزه",
    headline: "یک توپ امضاشده ببر",
    body: "این هفته توی دسته‌ات جزو سه نفر اول باش. فقط امتیاز حساب میشه.",
    cta: "دیدن جدول",
    href: "/leaderboard",
    colors: ["#f2ede1", "#10231a", "#c8392b"],
    art: "trophy",
  },
  {
    id: "promo-northpitch-boots",
    partner: "نورث‌پیچ",
    kind: "شریک تجهیزات",
    headline: "ساخته‌شده برای دقیقهٔ آخر",
    body: "گلاید جدید. سبکه و روی توپ آرام.",
    cta: "رفتن به نورث‌پیچ",
    href: "https://example.com/northpitch",
    external: true,
    colors: ["#14171f", "#f4f5f7", "#5b8cff"],
    art: "boot",
  },
  {
    id: "promo-halfway-tv",
    partner: "تلویزیون خط میانی",
    kind: "شریک پخش",
    headline: "همهٔ بازی‌های لیگ برتر، زنده",
    body: "آنجا ببین، اینجا پیش‌بینی کن.",
    cta: "تماشا در خط میانی",
    href: "https://example.com/halfwayline",
    external: true,
    colors: ["#3b1d5c", "#fbf7ff", "#f2b84b"],
    art: "screen",
  },
];
