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
  /** Day label for fixtures after today ("Sat"); absent = today. */
  day?: string;
  /** Days from `mockToday` (-1 yesterday, 1 tomorrow); absent = today. Drives the Live tab's day strip. */
  dayOffset?: number;
  /** Short context line: your league on this match, or the competition. */
  caption: string;
  /** Competition, for grouping the live list ("Premier League"). */
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

/** Country per competition, for the group headers ("England · Premier League"). */
export const competitions: Record<string, { country: string; code: string }> = {
  "Premier League": { country: "England", code: "ENG" },
  LaLiga: { country: "Spain", code: "ESP" },
  "Serie A": { country: "Italy", code: "ITA" },
  "Ligue 1": { country: "France", code: "FRA" },
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
    home: { code: "LIV", name: "Liverpool", colors: ["#C8102E", "#F6EB61"] },
    away: { code: "MCI", name: "Man City", colors: ["#6CABDD", "#1C2C5B"] },
    status: "live",
    minute: 67,
    score: [1, 1],
    caption: "Sunday Rivals · 500 entry",
    competition: "Premier League",
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
    market: { id: "mk-liv-1", question: "Next corner before 75'?", yesShare: 58, closesIn: 38 },
    progress: { asked: 7, total: 10 },
    crowd: { home: 41, draw: 33, away: 26, topScore: [2, 1], votes: 18412 },
    h2h: { won: 2, drawn: 2, lost: 1 },
    table: plTable,
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
    id: "bet-sev",
    home: { code: "BET", name: "Real Betis", colors: ["#00954C", "#FFFFFF"] },
    away: { code: "SEV", name: "Sevilla", colors: ["#F43333", "#FFFFFF"] },
    status: "live",
    minute: 35,
    score: [1, 0],
    caption: "LaLiga",
    competition: "LaLiga",
    events: [
      { minute: 12, side: "away", player: "Agoumé", kind: "yellow" },
      { minute: 29, side: "home", player: "Isco", kind: "goal" },
    ],
    stats: [
      { label: "Possession", home: 58, away: 42, unit: "%" },
      { label: "Shots", home: 6, away: 3 },
      { label: "Corners", home: 3, away: 1 },
      { label: "On target", home: 3, away: 1 },
    ],
    crowd: { home: 52, draw: 27, away: 21, topScore: [2, 0], votes: 6204 },
  },
  {
    id: "ata-par",
    home: { code: "ATA", name: "Atalanta", colors: ["#1E71B8", "#000000"] },
    away: { code: "PAR", name: "Parma", colors: ["#FFDD00", "#1B4094"] },
    status: "live",
    minute: 12,
    score: [0, 0],
    caption: "Serie A",
    competition: "Serie A",
    events: [],
    stats: [
      { label: "Possession", home: 63, away: 37, unit: "%" },
      { label: "Shots", home: 2, away: 0 },
    ],
    crowd: { home: 68, draw: 20, away: 12, topScore: [2, 0], votes: 3877 },
  },
  {
    id: "ars-che",
    home: { code: "ARS", name: "Arsenal", colors: ["#EF0107", "#FFFFFF"] },
    away: { code: "CHE", name: "Chelsea", colors: ["#034694", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "21:00",
    caption: "Tonight",
    competition: "Premier League",
    boost: 2,
    you: { calls: 2, right: 0, points: 0, streak: 0 },
    market: { id: "mk-ars-1", question: "Arsenal win?", yesShare: 47 },
    crowd: { home: 47, draw: 28, away: 25, topScore: [2, 1], votes: 9310 },
    table: plTable,
    h2h: { won: 2, drawn: 1, lost: 2 },
    preview: {
      venue: { name: "Emirates Stadium", city: "London, England", capacity: 60704, surface: "Grass" },
      weather: { tempC: 9, sky: "Cloudy" },
      referee: "M. Oliver",
      tv: ["Sky Sports Main Event", "Sky Go"],
      form: { home: ["W", "W", "D", "W", "L"], away: ["W", "L", "W", "D", "W"] },
      news: { title: "Arsenal v Chelsea: team news and predicted line-ups", source: "Footon", ago: "2 hours ago" },
    },
  },
  {
    id: "new-tot",
    home: { code: "NEW", name: "Newcastle", colors: ["#241F20", "#FFFFFF"] },
    away: { code: "TOT", name: "Tottenham", colors: ["#132257", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "19:30",
    caption: "Premier League",
    competition: "Premier League",
    market: { id: "mk-new-1", question: "Both teams score?", yesShare: 64 },
    crowd: { home: 44, draw: 26, away: 30, topScore: [1, 1], votes: 4127 },
    table: plTable,
    h2h: { won: 3, drawn: 0, lost: 2 },
    preview: {
      venue: { name: "St. James' Park", city: "Newcastle upon Tyne, England", capacity: 52758, surface: "Grass" },
      weather: { tempC: 8, sky: "Light rain" },
      referee: "A. Taylor",
      tv: ["TNT Sports 1", "discovery+"],
      form: { home: ["D", "W", "W", "L", "W"], away: ["L", "W", "D", "W", "L"] },
      news: { title: "Five things to watch at St. James' Park tonight", source: "Footon", ago: "5 hours ago" },
    },
  },
  {
    id: "bha-eve",
    home: { code: "BHA", name: "Brighton", colors: ["#0057B8", "#FFFFFF"] },
    away: { code: "EVE", name: "Everton", colors: ["#003399", "#FFFFFF"] },
    status: "finished",
    score: [2, 0],
    caption: "Premier League",
    competition: "Premier League",
    events: [
      { minute: 17, side: "home", player: "Mitoma", kind: "goal" },
      { minute: 44, side: "away", player: "Gueye", kind: "yellow" },
      { minute: 71, side: "home", player: "Welbeck", kind: "goal" },
      { minute: 78, side: "away", player: "Calvert-Lewin", kind: "sub", detail: "Beto" },
    ],
    stats: [
      { label: "Possession", home: 61, away: 39, unit: "%" },
      { label: "Shots", home: 14, away: 6 },
      { label: "On target", home: 6, away: 2 },
      { label: "Corners", home: 7, away: 2 },
    ],
    you: { calls: 6, right: 5, points: 240, streak: 5 },
    settlement: [
      { id: "s-1", label: "Seaside pool", reason: "1st of 2 · 5% burned", amount: 950 },
      { id: "s-2", label: "Watched to the end", reason: "3+ answers to 90'", amount: 100 },
      { id: "s-3", label: "Rare call right", reason: "Only 14% said Yes to the 71' goal", amount: 50 },
    ],
  },
  {
    id: "mun-liv",
    home: { code: "MUN", name: "Man Utd", colors: ["#DA291C", "#FBE122"] },
    away: { code: "LIV", name: "Liverpool", colors: ["#C8102E", "#F6EB61"] },
    status: "upcoming",
    kickoff: "13:30",
    day: "Sat",
    dayOffset: 4,
    caption: "Premier League",
    competition: "Premier League",
    boost: 2,
    market: { id: "mk-mun-1", question: "Liverpool win at Old Trafford?", yesShare: 52 },
  },
  {
    id: "che-mci",
    home: { code: "CHE", name: "Chelsea", colors: ["#034694", "#FFFFFF"] },
    away: { code: "MCI", name: "Man City", colors: ["#6CABDD", "#1C2C5B"] },
    status: "upcoming",
    kickoff: "16:30",
    day: "Sun",
    dayOffset: 5,
    caption: "Premier League",
    competition: "Premier League",
  },
];

matches.push(
  {
    id: "avl-whu",
    home: { code: "AVL", name: "Aston Villa", colors: ["#670E36", "#95BFE5"] },
    away: { code: "WHU", name: "West Ham", colors: ["#7A263A", "#1BB1E7"] },
    status: "finished",
    score: [3, 1],
    day: "Yesterday",
    dayOffset: -1,
    caption: "Premier League",
    competition: "Premier League",
  },
  {
    id: "lor-bre",
    home: { code: "LOR", name: "Lorient", colors: ["#F58113", "#000000"] },
    away: { code: "BRE", name: "Brest", colors: ["#E2001A", "#FFFFFF"] },
    status: "finished",
    score: [1, 1],
    day: "Yesterday",
    dayOffset: -1,
    caption: "Ligue 1",
    competition: "Ligue 1",
  },
  {
    id: "rma-val",
    home: { code: "RMA", name: "Real Madrid", colors: ["#FFFFFF", "#00529F"] },
    away: { code: "VAL", name: "Valencia", colors: ["#FFFFFF", "#EE3524"] },
    status: "upcoming",
    kickoff: "20:00",
    day: "Wed",
    dayOffset: 1,
    caption: "LaLiga",
    competition: "LaLiga",
    crowd: { home: 71, draw: 17, away: 12, topScore: [3, 1], votes: 12880 },
    preview: {
      venue: { name: "Santiago Bernabéu", city: "Madrid, Spain", capacity: 83186, surface: "Hybrid grass" },
      weather: { tempC: 12, sky: "Clear" },
      referee: "J. Martínez Munuera",
      tv: ["Premier Sports 1", "LaLigaTV"],
      form: { home: ["W", "W", "W", "D", "W"], away: ["L", "D", "L", "W", "D"] },
    },
  },
  {
    id: "int-nap",
    home: { code: "INT", name: "Inter", colors: ["#0068A8", "#000000"] },
    away: { code: "NAP", name: "Napoli", colors: ["#12A0D7", "#FFFFFF"] },
    status: "upcoming",
    kickoff: "19:45",
    day: "Wed",
    dayOffset: 1,
    caption: "Serie A",
    competition: "Serie A",
  },
);


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
  questions: [{ id: "fq-1", from: "Omid", initial: "O", text: "Yellow card before 80'?", closes: "80'" }],
  reactions: ["VAR!", "Offside", "What a save"],
};

/**
 * Onboarding: the first mission's coins, the sample question and the club
 * picker. The 15,000 starter coins arrive mission by mission over the first
 * week, never in one lump; picking your club is mission one.
 */
export const onboarding = {
  startingCoins: 1000,
  sample: {
    match: "LIV 1–1 MCI",
    minute: 67,
    text: "Next corner before 75'?",
    yesShare: 62,
    /** How the sample resolves, so the demo can show a real outcome. */
    outcome: "yes" as "yes" | "no",
    resolvedLabel: "Corner at 71'",
    /** Points for a right call. Calls earn points; coins come from missions and play. */
    reward: 50,
  },
  /** The next three starter missions, shown as the numbered row. */
  steps: [
    { title: "Make a call", coins: 1000 },
    { title: "Join a league", coins: 2000 },
    { title: "Invite a friend", coins: 2000 },
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

/** Every club you can follow from Profile (searchable). Onboarding shows only the first eight. */
export const clubDirectory: Team[] = [
  ...onboarding.clubs,
  { code: "BHA", name: "Brighton", colors: ["#0057B8", "#FFFFFF"] },
  { code: "EVE", name: "Everton", colors: ["#003399", "#FFFFFF"] },
  { code: "WHU", name: "West Ham", colors: ["#7A263A", "#1BB1E7"] },
  { code: "BRE", name: "Brentford", colors: ["#E30613", "#FFFFFF"] },
  { code: "NFO", name: "Nott'm Forest", colors: ["#DD0000", "#FFFFFF"] },
  { code: "FUL", name: "Fulham", colors: ["#FFFFFF", "#000000"] },
  { code: "CRY", name: "Crystal Palace", colors: ["#1B458F", "#C4122E"] },
  { code: "WOL", name: "Wolves", colors: ["#FDB913", "#231F20"] },
  { code: "BOU", name: "Bournemouth", colors: ["#DA291C", "#000000"] },
  { code: "RMA", name: "Real Madrid", colors: ["#FFFFFF", "#00529F"] },
  { code: "BAR", name: "Barcelona", colors: ["#A50044", "#004D98"] },
  { code: "BET", name: "Real Betis", colors: ["#00954C", "#FFFFFF"] },
  { code: "SEV", name: "Sevilla", colors: ["#FFFFFF", "#D81E05"] },
  { code: "VAL", name: "Valencia", colors: ["#FFFFFF", "#EE3524"] },
  { code: "INT", name: "Inter", colors: ["#0068A8", "#000000"] },
  { code: "NAP", name: "Napoli", colors: ["#12A0D7", "#FFFFFF"] },
  { code: "ATA", name: "Atalanta", colors: ["#1E71B8", "#000000"] },
  { code: "PSG", name: "Paris SG", colors: ["#004170", "#DA291C"] },
  { code: "BAY", name: "Bayern", colors: ["#DC052D", "#FFFFFF"] },
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
  /** Who's in, by initial ("Y" is you). */
  members: string[];
  status: "invited" | "joined" | "expired" | "finished";
  rules: ChallengeRules;
  /** Who invited you (absent when it's yours). */
  from?: { name: string; initial: string };
  mine?: boolean;
  /** Your place, once calls have resolved. */
  rank?: number;
};

export const challenges: Challenge[] = [
  { id: "ch-1", name: "Sunday Rivals", matchId: "liv-mci", entry: 500, members: ["Y", "S", "O"], status: "joined", mine: true, rank: 1, rules: { stake: "free", cap: 2500 } },
  {
    id: "ch-2",
    name: "Derby night",
    matchId: "ars-che",
    entry: 1500,
    members: ["S", "M", "R", "Y"],
    status: "joined",
    from: { name: "Sara", initial: "S" },
    rules: { stake: { fixed: 250 }, cap: 1500 },
  },
  {
    id: "ch-4",
    name: "Office five",
    matchId: "new-tot",
    entry: 500,
    members: ["O", "K"],
    status: "invited",
    from: { name: "Omid", initial: "O" },
    rules: { stake: { fixed: 100 }, cap: 1000 },
  },
  {
    id: "ch-5",
    name: "North West",
    matchId: "mun-liv",
    entry: 2500,
    members: ["L", "J", "P", "A"],
    status: "invited",
    from: { name: "Lena", initial: "L" },
    rules: { stake: "free", cap: 2500 },
  },
  { id: "ch-3", name: "Seaside", matchId: "bha-eve", entry: 500, members: ["Y", "K"], status: "finished", mine: true, rank: 1, rules: { stake: "free" } },
  {
    id: "ch-6",
    name: "Claret and blue",
    matchId: "avl-whu",
    entry: 500,
    members: ["K", "J"],
    status: "expired",
    from: { name: "Kian", initial: "K" },
    rules: { stake: "free", cap: 1000 },
  },
  {
    id: "ch-7",
    name: "Ligue 1 nerds",
    matchId: "lor-bre",
    entry: 1500,
    members: ["P", "A", "R"],
    status: "expired",
    from: { name: "Paul", initial: "P" },
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
    { from: "Sara", initial: "S", text: "Calling it now, two goals before half time" },
    { from: "You", initial: "Y", text: "Bold. I've gone over on the corners", you: true },
    { from: "Max", initial: "M", text: "Anyone else smell a red card?" },
  ],
  questions: [{ id: "fq-pre", from: "Sara", initial: "S", text: "Saka scores first?", closes: "kickoff" }],
  reactions: ["Told you", "Easy", "Not again"],
};

/** First names for the initials in league member lists. */
export const people: Record<string, string> = {
  Y: "You",
  S: "Sara",
  O: "Omid",
  M: "Max",
  R: "Reza",
  K: "Kian",
  L: "Lena",
  J: "Jonas",
  P: "Paul",
  A: "Aria",
};

export const profile = {
  name: "You",
  /** Total points: skill only, from right calls. Rank and prizes read this. */
  points: 4820,
  streak: { current: 3, best: 6 },
  referral: { code: "FOOT-Y7K2", bonus: 1500, joined: 2 },
  /** Clubs you follow; picked in onboarding, edited on Profile. */
  favoriteTeams: ["LIV"],
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
    { id: "m-1", title: "Pick your club and profile", coins: 1000, done: "You picked Liverpool" },
    { id: "m-2", title: "Make your first call", coins: 1000, done: "You called it at Brighton v Everton" },
    { id: "m-3", title: "Join your first friends' league", coins: 2000, done: "You joined Seaside" },
    { id: "m-4", title: "Invite a friend who joins", coins: 2000 },
    { id: "m-5", title: "Stay to the end of a match", coins: 2000, done: "You watched to the final whistle" },
    { id: "m-6", title: "Answer 10 live questions", coins: 1500, done: "10 answers in" },
    { id: "m-7", title: "Ask your first question in chat", coins: 1500 },
    { id: "m-8", title: "Come back on day 3", coins: 2000, done: "You came back today" },
    { id: "m-9", title: "Win a pool or the free table", coins: 2000, done: "You won Seaside" },
  ] satisfies Mission[],
};

/** This week's capped earnings, so you can see what's left to earn. */
export const weekly = {
  mission: { title: "Watch 3 matches to the end", done: 2, total: 3, coins: 750 },
  caps: [
    { id: "free-table", label: "Free table rewards", used: 700, cap: 2000, period: "this week" },
    { id: "invites", label: "Friends who finished a match", used: 1, cap: 6, period: "this month", unit: "friends" },
  ],
};

/** Ways to keep earning after the first week. `cap` is shown as written. */
export const earnWays = [
  { id: "e-1", label: "Watch to the end", detail: "3+ answers to 90'", coins: 100, cap: "Every match" },
  { id: "e-2", label: "Free table top 3", detail: "400 / 300 / 200", coins: 400, cap: "Up to 2,000 a week" },
  { id: "e-3", label: "Rare call right", detail: "Under 20% picked it", coins: 50, cap: "Up to 150 a match" },
  { id: "e-4", label: "Five matches in a row", detail: "To the end, each time", coins: 500, cap: "Every 5 matches" },
  { id: "e-5", label: "A friend finishes a match", detail: "Their first, after your invite", coins: 1500, cap: "Up to 6 a month" },
  { id: "e-6", label: "Friends answer your question", detail: "50 for each friend", coins: 50, cap: "Up to 250 a question" },
  { id: "e-7", label: "Up a weekly league", detail: "Promotion", coins: 1000, cap: "Weekly" },
];

export const coinActivity: CoinEntry[] = [
  { id: "a-1", label: "Sunday Rivals entry", reason: "LIV v MCI · into the pool", amount: -500, day: "Today" },
  { id: "a-2", label: "Came back on day 3", reason: "Starter mission", amount: 2000, day: "Today" },
  { id: "a-3", label: "Seaside pool", reason: "1st of 2 · BHA v EVE", amount: 950, day: "Yesterday" },
  { id: "a-4", label: "Watched to the end", reason: "BHA v EVE", amount: 100, day: "Yesterday" },
  { id: "a-5", label: "Created Sunday Rivals", reason: "New league", amount: -1500, day: "Yesterday" },
  { id: "a-6", label: "2nd on the free table", reason: "AVL v WHU", amount: 300, day: "Sun" },
];

/**
 * Shop catalogue. Phase 2 is a "coming soon" shop: real items and prices, no
 * payment. Tapping an item asks if you want to hear when it opens; that tap is
 * the purchase-intent signal. Nothing here sells points, rank or prize odds,
 * and there are no mystery boxes.
 */
export type ShopItem = {
  id: string;
  name: string;
  detail: string;
  /** Coin price, or a range for families of looks. */
  coins?: number | [number, number];
  /** Real-money price, coin packs only. */
  price?: string;
  /** Coins in a pack and its bonus %. */
  pack?: { coins: number; bonus?: number };
  icon: "pack" | "celebration" | "banter" | "banner" | "freeze" | "league" | "kit" | "slot";
};

export const shop: { group: string; note?: string; items: ShopItem[] }[] = [
  {
    group: "Coin packs",
    note: "18+ · monthly limit",
    items: [
      { id: "pack-s", name: "Small", detail: "For one big night", price: "$0.99", pack: { coins: 1000 }, icon: "pack" },
      { id: "pack-m", name: "Medium", detail: "A few weekends", price: "$4.99", pack: { coins: 5500, bonus: 10 }, icon: "pack" },
      { id: "pack-l", name: "Large", detail: "The season", price: "$9.99", pack: { coins: 11500, bonus: 15 }, icon: "pack" },
    ],
  },
  {
    group: "Match moments",
    items: [
      { id: "celebration", name: "Goal celebration", detail: "Takes over your league's screen", coins: [100, 750], icon: "celebration" },
      { id: "banter", name: "Banter card", detail: "Drop it in chat after a big call", coins: 500, icon: "banter" },
      { id: "revenge", name: "Revenge banner", detail: "For the rematch", coins: 500, icon: "banner" },
    ],
  },
  {
    group: "Keep your run",
    items: [{ id: "freeze", name: "Streak freeze", detail: "Miss a match, keep your streak", coins: 2500, icon: "freeze" }],
  },
  {
    group: "Looks",
    items: [
      { id: "league-look", name: "League look", detail: "Crest and trophy room", coins: 5000, icon: "league" },
      { id: "club-look", name: "Fantasy club look", detail: "Kit, crest, stadium", coins: [2500, 10000], icon: "kit" },
      { id: "slot", name: "Extra fantasy slot", detail: "One more friends' fantasy league", coins: 1000, icon: "slot" },
    ],
  },
];
