/**
 * Mock data that mirrors the design canvas. Replace with real API calls.
 * Keep shapes stable: components import these types.
 */
import type { Outcome } from "@/components/footon/form-bars";
import type { LiveQuestion } from "@/components/footon/question-card";

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
  /** Day label for fixtures after today ("Sat"); absent = today. */
  day?: string;
  /** Short context line: your league on this match, or the competition. */
  caption: string;
  /** Set when you play this match in one of your leagues. */
  league?: string;
  /** Your stake in this match, when you've made calls on it. */
  you?: MatchYou;
  events?: MatchEvent[];
  stats?: MatchStat[];
  /** Coin multiplier on featured matches (10 = "10x"). Absent = 1x. */
  boost?: number;
  /** The headline quick call shown on the match card. */
  market?: Market;
  /** Live: how many of tonight's questions have been asked so far. */
  progress?: { asked: number; total: number };
  /** How the crowd called the result, in %, plus the most-called score. */
  crowd?: { home: number; draw: number; away: number; topScore: [number, number] };
  lineups?: { home: Lineup; away: Lineup };
  /** Last meetings, from the home side's view. */
  h2h?: { won: number; drawn: number; lost: number };
  /** League table rows around both teams. */
  table?: TableRow[];
};

/** A Yes/No quick call with the crowd's share and the stakes on offer. */
export type Market = {
  id: string;
  question: string;
  /** % of players on Yes. */
  yesShare: number;
  /** Seconds until it locks; absent before kickoff. */
  closesIn?: number;
  stakes: number[];
};

export type Player = { number: number; name: string; pos: string };
export type Lineup = { formation: string; players: Player[] };
export type TableRow = { pos: number; code: string; played: number; gd: number; points: number };

export const wallet = { coins: 2450 };

export const recentForm: Outcome[] = ["W", "W", "L", "W", "V", "L"];

export const matches: Match[] = [
  {
    id: "liv-mci",
    home: { code: "LIV", name: "Liverpool", colors: ["#C8102E", "#F6EB61"] },
    away: { code: "MCI", name: "Man City", colors: ["#6CABDD", "#1C2C5B"] },
    status: "live",
    minute: 67,
    score: [1, 1],
    caption: "Sunday Rivals · limit 500",
    league: "Sunday Rivals",
    you: { calls: 4, right: 3, points: 120, streak: 3 },
    events: [
      { minute: 23, side: "home", player: "Salah", kind: "goal" },
      { minute: 34, side: "away", player: "Rodri", kind: "yellow" },
      { minute: 58, side: "away", player: "Haaland", kind: "goal" },
      { minute: 61, side: "home", player: "Núñez", kind: "sub", detail: "Jota" },
    ],
    stats: [
      { label: "Possession", home: 54, away: 46, unit: "%" },
      { label: "Shots", home: 11, away: 9 },
      { label: "Corners", home: 4, away: 3 },
      { label: "On target", home: 5, away: 4 },
      { label: "Fouls", home: 8, away: 10 },
      { label: "Offsides", home: 1, away: 2 },
    ],
    boost: 10,
    market: { id: "mk-liv-1", question: "Next corner before 75'?", yesShare: 58, closesIn: 38, stakes: [100, 500] },
    progress: { asked: 7, total: 10 },
    crowd: { home: 41, draw: 33, away: 26, topScore: [2, 1] },
    h2h: { won: 2, drawn: 2, lost: 1 },
    table: [
      { pos: 1, code: "LIV", played: 11, gd: 14, points: 27 },
      { pos: 2, code: "ARS", played: 11, gd: 12, points: 25 },
      { pos: 3, code: "MCI", played: 11, gd: 11, points: 24 },
    ],
    lineups: {
      home: {
        formation: "4-3-3",
        players: [
          { number: 1, name: "Alisson", pos: "GK" },
          { number: 66, name: "Alexander-Arnold", pos: "RB" },
          { number: 5, name: "Konaté", pos: "CB" },
          { number: 4, name: "Van Dijk", pos: "CB" },
          { number: 26, name: "Robertson", pos: "LB" },
          { number: 10, name: "Mac Allister", pos: "CM" },
          { number: 38, name: "Gravenberch", pos: "CM" },
          { number: 8, name: "Szoboszlai", pos: "CM" },
          { number: 11, name: "Salah", pos: "RW" },
          { number: 9, name: "Núñez", pos: "ST" },
          { number: 7, name: "Díaz", pos: "LW" },
        ],
      },
      away: {
        formation: "4-3-3",
        players: [
          { number: 31, name: "Ederson", pos: "GK" },
          { number: 2, name: "Walker", pos: "RB" },
          { number: 3, name: "Dias", pos: "CB" },
          { number: 25, name: "Akanji", pos: "CB" },
          { number: 24, name: "Gvardiol", pos: "LB" },
          { number: 16, name: "Rodri", pos: "CM" },
          { number: 17, name: "De Bruyne", pos: "CM" },
          { number: 20, name: "Silva", pos: "CM" },
          { number: 47, name: "Foden", pos: "RW" },
          { number: 9, name: "Haaland", pos: "ST" },
          { number: 11, name: "Doku", pos: "LW" },
        ],
      },
    },
  },
  {
    id: "ars-che",
    home: { code: "ARS", name: "Arsenal", colors: ["#EF0107", "#FFFFFF"] },
    away: { code: "CHE", name: "Chelsea", colors: ["#034694", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "21:00",
    caption: "Tonight",
    you: { calls: 2, right: 0, points: 0, streak: 0 },
    market: { id: "mk-ars-1", question: "Arsenal win?", yesShare: 47, stakes: [100, 500] },
    crowd: { home: 47, draw: 28, away: 25, topScore: [2, 1] },
  },
  {
    id: "new-tot",
    home: { code: "NEW", name: "Newcastle", colors: ["#241F20", "#FFFFFF"] },
    away: { code: "TOT", name: "Tottenham", colors: ["#132257", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "19:30",
    caption: "Premier League",
    market: { id: "mk-new-1", question: "Both teams score?", yesShare: 64, stakes: [100, 500] },
  },
  {
    id: "bha-eve",
    home: { code: "BHA", name: "Brighton", colors: ["#0057B8", "#FFFFFF"] },
    away: { code: "EVE", name: "Everton", colors: ["#003399", "#FFFFFF"] },
    status: "finished",
    score: [2, 0],
    caption: "Premier League",
    you: { calls: 6, right: 5, points: 240, streak: 5 },
  },
  {
    id: "mun-liv",
    home: { code: "MUN", name: "Man Utd", colors: ["#DA291C", "#FBE122"] },
    away: { code: "LIV", name: "Liverpool", colors: ["#C8102E", "#F6EB61"] },
    status: "upcoming",
    kickoff: "13:30",
    day: "Sat",
    caption: "Premier League",
    boost: 10,
    market: { id: "mk-mun-1", question: "Liverpool win at Old Trafford?", yesShare: 52, stakes: [100, 500] },
  },
  {
    id: "che-mci",
    home: { code: "CHE", name: "Chelsea", colors: ["#034694", "#FFFFFF"] },
    away: { code: "MCI", name: "Man City", colors: ["#6CABDD", "#1C2C5B"] },
    status: "upcoming",
    kickoff: "16:30",
    day: "Sun",
    caption: "Premier League",
  },
];

export type Invite = {
  id: string;
  from: string;
  initial: string;
  league: string;
  stakeLimit: number;
  /** Who's already in, by initial. */
  members: string[];
  matchId: string;
};

export const invites: Invite[] = [
  { id: "inv-1", from: "Sara", initial: "S", league: "Derby night", stakeLimit: 300, members: ["S", "M", "R"], matchId: "ars-che" },
  { id: "inv-2", from: "Omid", initial: "O", league: "Office five", stakeLimit: 200, members: ["O", "K"], matchId: "new-tot" },
  { id: "inv-3", from: "Lena", initial: "L", league: "North West", stakeLimit: 500, members: ["L", "J", "P", "A"], matchId: "mun-liv" },
];

export const fantasyProgress = { done: 3, total: 5 };

export const league = {
  name: "Sunday Rivals",
  code: "sun9k",
  link: "t.me/footon_bot?start=sun9k",
  standings: [
    { name: "You", initial: "Y", points: 840, you: true, delta: 1 },
    { name: "Sara", initial: "S", points: 790 },
    { name: "Omid", initial: "O", points: 770 },
  ],
};

export const liveQuestion: LiveQuestion = {
  index: 4,
  total: 10,
  text: "Next corner before 75'?",
  hint: "Either team · answers lock when the timer ends",
  seconds: 38,
  yesShare: 58,
  resolvesAt: "75'",
};

export const chat = {
  messages: [
    { from: "Omid", initial: "O", text: "Haaland again. Unreal." },
    { from: "You", initial: "Y", text: "City are all over them now", you: true },
    { from: "Sara", initial: "S", text: "Liverpool get a corner in the next 5, watch" },
    { from: "You", initial: "Y", text: "Going No on that one", you: true },
    { from: "Sara", initial: "S", text: "You will miss that one." },
  ],
  friendQuestion: { from: "Omid", initial: "O", text: "Yellow card before 80'?", closes: "80'" },
  reactions: ["VAR!", "Offside", "What a save"],
};

/** Onboarding: the starting stack, the sample question and the club picker. */
export const onboarding = {
  startingCoins: 10000,
  sample: {
    match: "LIV 1–1 MCI",
    minute: 67,
    text: "Next corner before 75'?",
    yesShare: 62,
    /** How the sample resolves, so the demo can show a real outcome. */
    outcome: "yes" as "yes" | "no",
    resolvedLabel: "Corner at 71'",
    reward: 50,
  },
  steps: [
    { title: "Pick a match", body: "Now or upcoming" },
    { title: "Invite friends", body: "Share one link" },
    { title: "Answer live", body: "Top the table" },
  ],
  clubs: [
    { code: "LIV", name: "Liverpool", colors: ["#C8102E", "#F6EB61"] },
    { code: "MCI", name: "Man City", colors: ["#6CABDD", "#1C2C5B"] },
    { code: "ARS", name: "Arsenal", colors: ["#EF0107", "#FFFFFF"] },
    { code: "CHE", name: "Chelsea", colors: ["#034694", "#FFFFFF"] },
    { code: "MUN", name: "Man United", colors: ["#DA291C", "#FBE122"] },
    { code: "TOT", name: "Tottenham", colors: ["#132257", "#FFFFFF"] },
    { code: "NEW", name: "Newcastle", colors: ["#241F20", "#FFFFFF"] },
    { code: "AVL", name: "Aston Villa", colors: ["#670E36", "#95BFE5"] },
  ] satisfies Team[],
};

/** Calls you can make before kickoff. `{home}` / `{away}` are filled with team names. */
export const prematchQuestions = [
  { id: "pq-1", text: "Goal before 30'?" },
  { id: "pq-2", text: "{home} ahead at 90'?" },
  { id: "pq-3", text: "Both teams score by 90'?" },
  { id: "pq-4", text: "Yellow card before 45'?" },
];

/** A friends' challenge (a small league on one match). `mine` = you created it. */
export type Challenge = {
  id: string;
  name: string;
  matchId: string;
  /** Coins each player puts in. */
  entry: number;
  members: string[];
  status: "active" | "finished";
  mine?: boolean;
  /** Your place, once calls have resolved. */
  rank?: number;
};

export const challenges: Challenge[] = [
  { id: "ch-1", name: "Sunday Rivals", matchId: "liv-mci", entry: 500, members: ["Y", "S", "O"], status: "active", mine: true, rank: 1 },
  { id: "ch-2", name: "Derby night", matchId: "ars-che", entry: 300, members: ["S", "M", "R", "Y"], status: "active" },
  { id: "ch-3", name: "Seaside", matchId: "bha-eve", entry: 200, members: ["Y", "K"], status: "finished", mine: true, rank: 1 },
];

/** One settled (or pending) call, for the Profile history. `delta` in coins. */
export type PredictionRecord = {
  id: string;
  question: string;
  matchId: string;
  stake: number;
  result: "won" | "lost" | "void" | "pending";
  delta: number;
  /** Day label: "Today", "Yesterday", "Sat". */
  day: string;
};

export const history: PredictionRecord[] = [
  { id: "h-1", question: "Next corner before 75'?", matchId: "liv-mci", stake: 100, result: "pending", delta: 0, day: "Today" },
  { id: "h-2", question: "Goal before 60'?", matchId: "liv-mci", stake: 100, result: "won", delta: 180, day: "Today" },
  { id: "h-3", question: "Yellow card before 30'?", matchId: "liv-mci", stake: 500, result: "lost", delta: -500, day: "Today" },
  { id: "h-4", question: "Brighton ahead at 90'?", matchId: "bha-eve", stake: 500, result: "won", delta: 850, day: "Yesterday" },
  { id: "h-5", question: "Penalty given?", matchId: "bha-eve", stake: 100, result: "void", delta: 0, day: "Yesterday" },
];

export const profile = {
  name: "You",
  level: 7,
  xp: 640,
  xpNext: 1000,
  streak: { current: 3, best: 6 },
  referral: { code: "FOOT-Y7K2", bonus: 500, joined: 2 },
  favoriteTeam: "LIV",
  /** Calls you have running right now (shown in the island). */
  activeCalls: 2,
};

/** Banter you can send without typing. Grouped for the quick-reply palette. */
export const chatPresets: { group: string; phrases: string[] }[] = [
  { group: "Banter", phrases: ["Told you", "Not again", "Easy", "Bottle job", "Who's laughing now"] },
  { group: "Ref", phrases: ["VAR!", "Offside", "Never a pen", "Book him", "Play on"] },
  { group: "Goal", phrases: ["What a strike", "What a save", "Get in", "Top bins"] },
];

/** In-house sticker ids (SVG drawn in components/footon/stickers.tsx). */
export const stickers = ["var-screen", "red-card", "golden-boot", "crying-ball", "whistle", "goal-net", "trophy", "megaphone"] as const;
export type StickerId = (typeof stickers)[number];
