/**
 * Mock data that mirrors the design canvas. Replace with real API calls.
 * Keep shapes stable: components import these types.
 */
import type { Outcome } from "@/components/footon/form-bars";
import type { LiveQuestion } from "@/components/footon/question-card";

/** `colors` = [shirt, trim]; drives the placeholder crest. */
export type Team = { code: string; name: string; colors?: [string, string] };

export type MatchEvent = { minute: number; side: "home" | "away"; player: string; kind: "goal" };
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
};

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
      { minute: 58, side: "away", player: "Haaland", kind: "goal" },
    ],
    stats: [
      { label: "Possession", home: 54, away: 46, unit: "%" },
      { label: "Shots", home: 11, away: 9 },
      { label: "Corners", home: 4, away: 3 },
    ],
  },
  {
    id: "ars-che",
    home: { code: "ARS", name: "Arsenal", colors: ["#EF0107", "#FFFFFF"] },
    away: { code: "CHE", name: "Chelsea", colors: ["#034694", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "21:00",
    caption: "Tonight",
    you: { calls: 2, right: 0, points: 0, streak: 0 },
  },
  {
    id: "new-tot",
    home: { code: "NEW", name: "Newcastle", colors: ["#241F20", "#FFFFFF"] },
    away: { code: "TOT", name: "Tottenham", colors: ["#132257", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "19:30",
    caption: "Premier League",
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
