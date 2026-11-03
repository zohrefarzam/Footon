# Footon API: backend handover

**Status:** v1 proposal, written from the frontend as it stands (branch `claude/sleepy-dirac-y7sh2h`, 3 Nov 2026).
**Audience:** backend engineers building the Footon API.
**Source of truth for shapes:** `src/lib/mock-data.ts`, `src/lib/economy.ts`, `src/lib/predictions.ts`. Every screen reads those today; this doc says what the API must return so we can swap the mocks for real calls without touching components.

Anything marked **[Decide]** is an open product/backend question, collected again in [§13](#13-open-questions).

---

## Contents

1. [What the app is (in one minute)](#1-what-the-app-is-in-one-minute)
2. [Conventions](#2-conventions)
3. [Core types](#3-core-types)
4. [Endpoint index](#4-endpoint-index)
5. [Session, onboarding, profile](#5-session-onboarding-profile)
6. [Matches](#6-matches)
7. [Predictions (the slip)](#7-predictions-the-slip)
8. [Live questions and crowd poll](#8-live-questions-and-crowd-poll)
9. [Challenges (friends' leagues), invites, chat](#9-challenges-friends-leagues-invites-chat)
10. [Wallet, missions, shop, fantasy](#10-wallet-missions-shop-fantasy)
11. [Realtime](#11-realtime)
12. [Economy rules the server must enforce](#12-economy-rules-the-server-must-enforce)
13. [Open questions](#13-open-questions)
14. [Appendix A: screen → endpoint map](#appendix-a-screen--endpoint-map)
15. [Appendix B: mock field → API field](#appendix-b-mock-field--api-field)

---

## 1. What the app is (in one minute)

Footon is a free-to-play, mobile web app. Friends predict football moments together during live matches ("Next corner before 75'?"), set pre-match predictions with a coin stake, and compete in small private leagues ("challenges") on one match.

Three currencies **never mix**, and the API must keep them separate everywhere:

| Thing | Meaning | Earned by | Spent on | Shown as |
| --- | --- | --- | --- | --- |
| **Points** | Skill | Right calls only (`+50`) | Nothing | Rank, leaderboards, prizes |
| **Coins** | Play money | Missions, pool wins, right predictions, free-table top 3 | League entry, prediction stakes, chat questions, creating a league, (later) shop | Wallet, stakes, payouts |
| **Prizes** | Real items from sponsors | Weekly/monthly rank (points) | – | Wallet strip |

Coins can never be cashed out or sent to another user. Nothing that earns points is for sale.

---

## 2. Conventions

### Transport
- REST + JSON over HTTPS, base path `/v1`.
- Realtime over one WebSocket (`/v1/realtime`), see [§11](#11-realtime). SSE is an acceptable alternative if it's easier for you; the frontend only needs server → client pushes plus the REST calls for writes.

### Auth
- `Authorization: Bearer <access token>` on every call except `/v1/auth/*`.
- **[Decide]** Login method. The invite link in the UI is `t.me/footon_bot?start=<code>`, which suggests **Telegram login** as the primary identity. Please confirm.
- The frontend currently uses a `footon_onboarded` cookie to send first-time users to `/welcome`. Replace with `me.onboardedAt` (null = show onboarding). The Next.js proxy (`src/proxy.ts`) will read it via a server-side call.

### Formats
| What | Format | Notes |
| --- | --- | --- |
| IDs | opaque strings | e.g. `"liv-mci"`, `"ch-1"`. Don't make the client parse them. |
| Times | ISO 8601 UTC (`2026-11-03T21:00:00Z`) | The client formats "21:00", "Tomorrow", "Thu 5 Nov" in the user's time zone. **Don't send pre-formatted day labels.** |
| Coins, points, XP | integers | Never decimals. Negative = a spend. |
| Percentages | integers 0–100 | Crowd splits should sum to 100 (do the rounding server-side). |
| Match minute | integer + optional `addedTime` | `45 + 2` shows as `45+2'`. |
| Enums | lowercase strings | Listed per type below. |
| Missing data | omit the field or `null` | **Never invent stats.** The UI hides a tab/section when its data is absent (e.g. no `lineups` → no Lineups tab). |

### Pagination
Cursor based: `?limit=20&cursor=<opaque>` → `{ "items": [...], "nextCursor": "..." | null }`.

### Errors
Every non-2xx response:

```json
{
  "error": {
    "code": "INSUFFICIENT_COINS",
    "message": "You need 1,050 more coins.",
    "details": { "short": 1050 }
  }
}
```

`message` is for logs; the UI writes its own copy from `code` + `details`. Codes the UI handles specifically:

| HTTP | `code` | `details` | Where the UI shows it |
| --- | --- | --- | --- |
| 402 | `INSUFFICIENT_COINS` | `{ short: number }` | "Need N more coins" + link to ways to earn |
| 409 | `PREDICTIONS_LOCKED` | `{ lockedAt }` | Slip after kickoff |
| 409 | `QUESTION_CLOSED` | `{ closedAt }` | Live question timer ran out |
| 409 | `ALREADY_ANSWERED` | `{ answer }` | Live / chat question |
| 409 | `CHALLENGE_NOT_OPEN` | `{ status }` | Accepting an expired invite |
| 409 | `CHALLENGE_FULL` | – | Joining a full league **[Decide]** max size |
| 422 | `STAKE_BELOW_MIN` | `{ type, min }` | Prediction row |
| 422 | `STAKE_NOT_FIXED` | `{ fixed }` | Challenge with a fixed stake |
| 422 | `OVER_CAP` | `{ cap, total, over }` | Slip total over the challenge cap |
| 422 | `INVALID_PICK` | `{ type, pick }` | Prediction option not offered |
| 422 | `VALIDATION` | `{ fields: { name: "too_long" } }` | Forms |
| 429 | `CAP_REACHED` | `{ capId }` | Weekly earn caps (info only) |

### Idempotency
Every request that moves coins (`POST /challenges`, accept, `PUT` slip, chat question, onboarding claim) takes an `Idempotency-Key` header (UUID). A retry with the same key returns the first result and never charges twice.

### Coin-moving responses
Any write that changes the balance returns the new wallet alongside its payload so the island updates without a refetch:

```json
{ "...": "...", "wallet": { "coins": 5950 } }
```

---

## 3. Core types

TypeScript notation. `?` = optional. These mirror `mock-data.ts`; differences are listed in [Appendix B](#appendix-b-mock-field--api-field).

### User

```ts
type UserRef = {
  id: string;
  name: string;        // "Sara"
  initial: string;     // "S" — avatar fallback
  avatarUrl?: string;
  you?: boolean;       // true for the caller; UI colours it lime
};
```

### Team, competition

```ts
type Team = {
  id: string;
  code: string;                  // "LIV" — 3 letters, used under 360px wide
  name: string;                  // "Liverpool"
  colors?: [string, string];     // [shirt, trim] hex; drives crests and lineup discs
  crestUrl?: string;             // when licensed; until then the UI draws a code crest
};

type Competition = {
  id: string;
  name: string;                  // "Premier League"
  country: string;               // "England"
  countryCode: string;           // "ENG"
};
```

### Match

```ts
type MatchStatus = "upcoming" | "live" | "finished";
// [Decide] postponed / abandoned / cancelled — see §13

type MatchSummary = {
  id: string;
  competition: Competition;
  home: Team;
  away: Team;
  status: MatchStatus;
  kickoffAt: string;               // ISO; always present
  minute?: number;                 // live only
  addedTime?: number;              // live only, "45+2"
  period?: "1h" | "ht" | "2h" | "et" | "pens" | "ft";
  score?: [number, number];        // live + finished
  redCards?: [number, number];     // glyph next to the team name
  boost?: 2;                       // big match: right predictions pay 2x coins
  you?: MatchYou;                  // present when the caller has calls/predictions on it
  league?: { challengeId: string; name: string };  // your joined challenge on this match, if any
};

type MatchYou = {
  calls: number;     // calls made (live questions + predictions)
  right: number;
  points: number;    // points earned on this match
  streak: number;    // right calls in a row right now; UI shows a flame at >= 3
  predictions?: number; // locked predictions on the slip (Home "N predictions · edit until 21:00")
};
```

`MatchSummary` is what list rows (`MatchRow`, `ChallengeRow`, Home) need. The match page needs `MatchDetail`:

```ts
type MatchDetail = MatchSummary & {
  // Each section is optional. Absent = the tab is hidden.
  events?: MatchEvent[];
  stats?: MatchStat[];
  lineups?: { home: Lineup; away: Lineup };
  table?: TableRow[];              // rows around both teams
  h2h?: { won: number; drawn: number; lost: number };  // from the home side's view
  preview?: MatchPreview;          // upcoming only
  crowd?: CrowdPoll;
  question?: LiveQuestion;         // live only: the open (or last) system question
  progress?: { asked: number; total: number };  // live: "7 of 10 asked"
  tables?: MatchTables;            // free table + your coin table
  settlement?: CoinEntry[];        // finished: coins this match moved for you
};

type MatchEvent = {
  id: string;
  minute: number;
  addedTime?: number;
  side: "home" | "away";
  kind: "goal" | "own_goal" | "penalty_goal" | "yellow" | "second_yellow" | "red" | "sub" | "var";
  player: string;                  // "Salah" — or player in for a sub
  detail?: string;                 // sub: player off; var: the decision ("Goal disallowed")
  score?: [number, number];        // goals: running score after this goal
};

type MatchStat = { key: string; label: string; home: number; away: number; unit?: "%" };
// keys used today: possession, shots, shots_on_target, corners, fouls, offsides, yellow_cards

type Lineup = {
  formation: string;               // "4-3-3" — the UI builds rows from it
  players: { id: string; number: number; name: string; pos: string }[];  // GK first, then defence → attack, right → left
  bench?: { id: string; number: number; name: string; pos: string }[];
};

type TableRow = { pos: number; teamId: string; code: string; played: number; gd: number; points: number };

type MatchPreview = {
  venue: { name: string; city: string; capacity: number; surface: string };
  weather?: { tempC: number; sky: string };
  referee?: string;
  tv?: string[];                                       // where to watch, user's region
  form: { home: ("W" | "D" | "L")[]; away: ("W" | "D" | "L")[] };  // last five, oldest first
  news?: { title: string; source: string; publishedAt: string; url?: string };
};
```

### Crowd poll

```ts
type CrowdPoll = {
  votes: number;                     // total
  yourVote?: "1" | "X" | "2";
  // Only sent once the caller has voted (the split stays hidden until you vote):
  split?: { home: number; draw: number; away: number };   // % summing to 100
  topScore?: [number, number];
};
```

### Live question (system question)

```ts
type LiveQuestion = {
  id: string;
  index: number;                 // 4  → "QUESTION 4 OF 10"
  total: number;                 // 10
  text: string;                  // "Next corner before 75'?" — always ends with the minute
  hint?: string;                 // "Either team · answers lock when the timer ends"
  opensAt: string;
  closesAt: string;              // client draws the countdown ring from this
  resolvesAt: string;            // "75'" — match minute label
  state: "open" | "closed" | "resolved" | "void";
  yourAnswer?: "yes" | "no";
  yesShare?: number;             // % on Yes — sent only after you answer (or once closed)
  outcome?: "yes" | "no";        // when resolved
  resolvedLabel?: string;        // "Corner at 71'"
  pointsAwarded?: number;        // 50 if you were right
};
```

### Prediction (pre-match slip)

```ts
type PredictionType = "result" | "goals" | "corners" | "yellows" | "red" | "penalty";

type PredictionMarket = {
  type: PredictionType;
  label: string;                         // "Win / draw"
  minStake: number;                      // PREDICTION_MIN_STAKE[type]
  options: { value: string; label: string }[];
  // result: "1" | "X" | "2"; goals: "Under 2.5" | "Over 2.5" | "Over 3.5"; corners: "Under 9.5" | "Over 9.5" | "Over 11.5";
  // yellows: "Under 3.5" | "Over 3.5" | "Over 5.5"; red / penalty: "Yes" | "No"
};

type Prediction = {
  id: string;
  type: PredictionType;
  pick: string;                          // one of the market's option values
  stake: number;                         // coins
  potentialPayout: number;               // server-computed: stake × 2 (× 2 again on a boost match)
  result?: "right" | "wrong" | "void";   // after it resolves
  payout?: number;                       // coins actually paid (0 if wrong; stake back if void)
  points?: number;                       // 50 if right
};

type PredictionSlip = {
  matchId: string;
  challengeId?: string;                  // null = your personal slip (see §7 [Decide])
  items: Prediction[];
  totalStake: number;
  editableUntil: string;                 // = kickoffAt
  rules?: ChallengeRules;                // when the slip belongs to a challenge
};
```

### Challenge (a friends' league on one match)

```ts
type ChallengeRules = {
  stake: "free" | { fixed: number };     // free = each player picks per prediction (>= min); fixed = creator set it
  cap?: number;                          // most one player can stake in total on the match
};

type ChallengeStatus = "invited" | "joined" | "expired" | "finished";
// Status is from the CALLER's point of view:
//   invited  → someone asked you; you haven't answered; match not started
//   joined   → you're in
//   expired  → invite closed at kickoff before you answered (or you declined and it closed) [Decide]
//   finished → match over, pool settled

type Challenge = {
  id: string;
  name: string;                          // ≤ 20 chars
  code: string;                          // "sun9k" — invite code
  inviteUrl: string;                     // "https://t.me/footon_bot?start=sun9k"
  match: MatchSummary;
  entry: 500 | 1500 | 2500;              // ENTRY_TIERS
  rules: ChallengeRules;
  modes: { system: boolean; friends: boolean; pre: boolean };
  members: UserRef[];                    // who's in (joined only)
  invited?: UserRef[];                   // pending invitees (optional)
  status: ChallengeStatus;
  createdBy: UserRef;
  mine: boolean;                         // you created it
  from?: UserRef;                        // who invited you (absent when mine)
  rank?: number;                         // your place, once calls have resolved
  pool: PoolSplit;                       // server-computed from entry × members
  standings?: Standing[];                // joined/finished only
  unread?: number;                       // chat badge
};

type PoolSplit = { pool: number; burned: number; payouts: number[] };  // [winner] or [1st, 2nd]

type Standing = {
  user: UserRef;
  points: number;
  rank: number;
  delta?: number;                        // places moved since last resolution (+1 = up one)
  right?: number;
  calls?: number;
};

type MatchTables = {
  free: { joined: boolean; rank?: number; players: number; rewards: [400, 300, 200] };
  coin?: { challengeId: string; league: string; entry: number; players: number; pool: PoolSplit };
};
```

### Chat

```ts
type ChatMessage =
  | { id: string; kind: "text"; from: UserRef; text: string; sentAt: string }
  | { id: string; kind: "preset"; from: UserRef; text: string; sentAt: string }      // quick reaction / banter phrase
  | { id: string; kind: "sticker"; from: UserRef; stickerId: string; sentAt: string }
  | { id: string; kind: "question"; from: UserRef; sentAt: string; question: FriendQuestion }
  | { id: string; kind: "system"; text: string; sentAt: string };                     // "Sara joined", "Goal! 1–1"

type FriendQuestion = {
  id: string;
  text: string;                    // ≤ 60 chars
  closes: string;                  // "80'" or "kickoff" — label
  closesAt?: string;               // ISO, when known
  askerCall: "yes" | "no";         // the asker's own call
  yourCall?: "yes" | "no";
  answers?: { yes: number; no: number };
  outcome?: "yes" | "no" | "void";
};
```

### Wallet and economy

```ts
type Wallet = {
  coins: number;
  points: number;                  // total points (skill) — shown on the strip, never with a coin icon
  prizes: number;                  // count of prizes won/pending
};

type CoinEntry = {
  id: string;
  label: string;                   // "Seaside pool"
  reason: string;                  // "1st of 2 · 5% burned" — every coin row says why
  amount: number;                  // + gain, − spend
  at: string;                      // ISO
  kind: "entry" | "pool_win" | "prediction_stake" | "prediction_payout" | "prediction_refund"
      | "mission" | "free_table" | "chat_question" | "create_league" | "earn" | "purchase";
  ref?: { matchId?: string; challengeId?: string; missionId?: string };
};

type Mission = { id: string; title: string; coins: number; doneAt?: string; doneReason?: string };
```

### Profile

```ts
type Me = {
  user: UserRef;
  onboardedAt: string | null;
  wallet: Wallet;
  level: { level: number; xp: number; xpNext: number; badges: number };   // placeholder until the gamification doc lands
  favouriteTeams: Team[];
  streak: { current: number; best: number };
  referral: { code: string; bonus: number; joined: number };
  tier: { name: "Bronze" | "Silver" | "Gold" | string; rank: number; of: number };  // "Silver league, rank 8 of 30"
  activeCalls: number;                                                     // calls waiting to resolve
  live?: IslandLive;                                                       // see §5
};
```

---

## 4. Endpoint index

| Method | Path | Purpose |
| --- | --- | --- |
| **Session** | | |
| POST | `/v1/auth/telegram` | Log in **[Decide]** |
| POST | `/v1/auth/refresh` | Refresh token |
| GET | `/v1/me` | Profile + wallet + island state |
| GET | `/v1/config` | Economy constants + prediction markets |
| **Onboarding** | | |
| GET | `/v1/onboarding` | Sample question, club grid, next missions |
| POST | `/v1/onboarding/complete` | Save clubs, pay mission one, set `onboardedAt` |
| **Profile** | | |
| PUT | `/v1/me/favourite-teams` | Replace your clubs |
| GET | `/v1/me/form` | Recent call outcomes |
| GET | `/v1/me/achievements` | Achievement tiles + collection |
| GET | `/v1/leaderboards/{period}` | Weekly / monthly points rank |
| GET | `/v1/teams` | Club search / picker |
| **Home** | | |
| GET | `/v1/home` | One call for the Home screen (BFF) |
| **Matches** | | |
| GET | `/v1/matches` | By day, grouped by competition (Live tab) |
| GET | `/v1/matches/{id}` | Match page |
| POST | `/v1/matches/{id}/crowd-vote` | 1 · X · 2 poll |
| **Predictions** | | |
| GET | `/v1/matches/{id}/slip` | Your slip on a match |
| PUT | `/v1/matches/{id}/slip` | Lock in / edit the slip |
| **Live questions** | | |
| POST | `/v1/questions/{id}/answer` | Answer Yes / No |
| **Challenges** | | |
| GET | `/v1/challenges` | Joined / invited / expired / finished |
| POST | `/v1/challenges` | Create |
| GET | `/v1/challenges/{id}` | Challenge page |
| POST | `/v1/challenges/{id}/accept` | Accept invite (pays entry) |
| POST | `/v1/challenges/{id}/decline` | Decline |
| DELETE | `/v1/challenges/{id}/decline` | Undo decline |
| GET | `/v1/invites` | Pending invites |
| GET | `/v1/invites/{code}` | Resolve an invite link |
| POST | `/v1/invites/{code}/join` | Join from a link |
| **Chat** | | |
| GET | `/v1/challenges/{id}/chat` | Thread (paged) |
| POST | `/v1/challenges/{id}/chat/messages` | Text / preset / sticker |
| POST | `/v1/challenges/{id}/chat/questions` | Ask the league (costs 250) |
| POST | `/v1/chat-questions/{id}/answer` | Answer a friend's question |
| GET | `/v1/chat/presets` | Quick reactions + banter palette + stickers |
| **Wallet** | | |
| GET | `/v1/wallet` | Balance, missions, weekly caps, ways to earn |
| GET | `/v1/wallet/activity` | Coin history (paged) |
| **Shop (Phase 2, no payment)** | | |
| GET | `/v1/shop` | Catalogue |
| POST | `/v1/shop/notify` | "Notify me" |
| POST | `/v1/analytics/events` | Shop intent events |
| **Fantasy (later)** | | |
| GET | `/v1/fantasy` | Unlock progress / team |
| **Realtime** | | |
| WS | `/v1/realtime` | Live match, questions, chat, wallet |

---

## 5. Session, onboarding, profile

### `GET /v1/me`

Called on every app open (server side, in the tabs layout). Drives the **LiveIsland** (top pill), the **LevelBar**, the **Dock** live dot and the first-run redirect.

```json
{
  "user": { "id": "u_1", "name": "Zohre", "initial": "Z", "you": true },
  "onboardedAt": "2026-10-31T19:02:11Z",
  "wallet": { "coins": 6450, "points": 4820, "prizes": 0 },
  "level": { "level": 7, "xp": 640, "xpNext": 1000, "badges": 3 },
  "favouriteTeams": [{ "id": "t_liv", "code": "LIV", "name": "Liverpool", "colors": ["#C8102E", "#F6EB61"] }],
  "streak": { "current": 3, "best": 6 },
  "referral": { "code": "FOOT-Y7K2", "bonus": 1500, "joined": 2 },
  "tier": { "name": "Silver", "rank": 8, "of": 30 },
  "activeCalls": 2,
  "live": {
    "matchId": "liv-mci",
    "challengeId": "ch-1",
    "home": "LIV", "away": "MCI",
    "score": [1, 1],
    "minute": 67,
    "question": { "id": "q_4", "index": 4, "text": "Next corner before 75'?", "resolvesAt": "75'", "state": "open", "closesAt": "2026-11-03T21:12:38Z" }
  }
}
```

`live` (the `IslandLive`) is **your** live match: the one in a joined challenge if any, else absent. If several are live, return the one with an open question first. **[Decide]** whether the island should ever show a live match you're not in.

### `GET /v1/config`

Lets the frontend stop hard-coding `economy.ts` / `predictions.ts`. Cache for an hour.

```json
{
  "entryTiers": [500, 1500, 2500],
  "poolBurn": 0.05,
  "splitFrom": 5,
  "split": [0.7, 0.3],
  "freeTable": { "rewards": [400, 300, 200], "weeklyCap": 2000 },
  "costs": { "createLeague": 1500, "chatQuestion": 250 },
  "stakeSteps": [100, 250, 500, 1000],
  "payoutMultiplier": 2,
  "boostMultiplier": 2,
  "pointsPerRightCall": 50,
  "hotStreak": 3,
  "starter": { "total": 15000, "days": 7 },
  "limits": { "leagueName": 20, "chatQuestion": 60 },
  "markets": [
    { "type": "result", "label": "Win / draw", "minStake": 100, "options": [{ "value": "1", "label": "{home}" }, { "value": "X", "label": "Draw" }, { "value": "2", "label": "{away}" }] },
    { "type": "goals", "label": "Goals", "minStake": 100, "options": [{ "value": "Under 2.5", "label": "Under 2.5" }, { "value": "Over 2.5", "label": "Over 2.5" }, { "value": "Over 3.5", "label": "Over 3.5" }] },
    { "type": "corners", "label": "Corners", "minStake": 100, "options": [ "..." ] },
    { "type": "yellows", "label": "Yellow cards", "minStake": 100, "options": [ "..." ] },
    { "type": "red", "label": "Red card", "minStake": 200, "options": [{ "value": "Yes", "label": "Yes" }, { "value": "No", "label": "No" }] },
    { "type": "penalty", "label": "Penalty", "minStake": 200, "options": [ "..." ] }
  ]
}
```

If lines can differ per match (e.g. corners 10.5 for a derby), also return `markets` on `GET /v1/matches/{id}` and the client prefers that. **[Decide]**

### `GET /v1/onboarding`

```json
{
  "sample": {
    "match": "LIV 1–1 MCI", "minute": 67,
    "text": "Next corner before 75'?",
    "yesShare": 62,
    "outcome": "yes",
    "resolvedLabel": "Corner at 71'",
    "reward": 50
  },
  "clubs": [ { "id": "t_liv", "code": "LIV", "name": "Liverpool", "colors": ["#C8102E", "#F6EB61"] } ],
  "steps": [
    { "title": "Make a call", "coins": 1000 },
    { "title": "Join a league", "coins": 2000 },
    { "title": "Invite a friend", "coins": 2000 }
  ],
  "startingCoins": 1000
}
```

The sample question is a demo; answering it is client-only and records nothing.

### `POST /v1/onboarding/complete`

```json
// request  (Idempotency-Key required)
{ "favouriteTeamIds": ["t_liv"], "claim": true }
// claim=false → "Skip to Home": set onboardedAt, pay nothing.

// 200
{ "onboardedAt": "2026-11-03T18:00:00Z", "wallet": { "coins": 1000, "points": 0, "prizes": 0 }, "missionPaid": "m-1" }
```

Claiming pays **only mission one (1,000)**. The other starter coins arrive mission by mission ([§10](#10-wallet-missions-shop-fantasy)).

### `PUT /v1/me/favourite-teams`

`{ "teamIds": ["t_liv", "t_ars"] }` → `{ "favouriteTeams": Team[] }`.

### `GET /v1/teams?q=liv&limit=20`

Club picker ("Add club" sheet). Without `q`, return a popular set for the user's region.

### `GET /v1/me/form?limit=6`

Profile's recent-form card.

```json
{ "items": ["W", "W", "L", "W", "V", "L"] }   // oldest first; W = right, L = wrong, V = void
```

The UI computes win rate = W / (W + L). **[Decide]** what one item is: one call, or one match (right if net points > 0)? Today's mock reads as one match.

### `GET /v1/me/achievements`

```json
{
  "achievements": [{ "id": "prophet", "label": "Prophet", "icon": "eye", "earnedAt": "..." }],
  "collection": [
    { "id": "players", "label": "Players", "count": 3 },
    { "id": "kits", "label": "Kits", "locked": "Unlocks at level 5" }
  ]
}
```

Placeholder: shapes will change with the gamification doc.

### `GET /v1/leaderboards/{period}`

`period` = `weekly` | `monthly`. Points only.

```json
{ "tier": "Silver", "period": "weekly", "endsAt": "...", "you": { "rank": 8 }, "items": [Standing], "nextCursor": null }
```

---

## 6. Matches

### `GET /v1/home`

A backend-for-frontend call so Home renders in one round trip. Everything here can also be built from the other endpoints.

```json
{
  "challenges": [Challenge],                // yours, status=joined, live first then by kickoff
  "openPredictions": [                      // upcoming matches where you have a locked slip
    { "match": MatchSummary, "count": 2, "editableUntil": "2026-11-03T21:00:00Z" }
  ],
  "invites": { "count": 2, "from": [UserRef] },   // InviteTile: "Sara +2"
  "fantasy": { "done": 3, "total": 5, "open": false },
  "bigMatches": [MatchSummary]              // boost = 2, upcoming, next 7 days
}
```

### `GET /v1/matches?date=2026-11-03&tz=Europe/London&live=true`

The **Live tab** (`MatchDays`). Day strip = two days back to five ahead; the client calls this per day.

| Param | Meaning |
| --- | --- |
| `date` | Local calendar day `YYYY-MM-DD` (required unless `live=true`) |
| `tz` | IANA zone used to cut the day |
| `live` | `true` = only matches live right now, any day |
| `competition` | Optional filter |

```json
{
  "date": "2026-11-03",
  "liveCount": 3,
  "groups": [
    {
      "competition": { "id": "c_pl", "name": "Premier League", "country": "England", "countryCode": "ENG" },
      "matches": [MatchSummary]
    }
  ]
}
```

Order groups by the user's favourite competitions first, then by popularity. Within a group: live, then by kickoff.

### `GET /v1/matches/{id}`

The match page, live or not. Returns `MatchDetail` (§3). Which sections the UI shows:

| Status | Tabs (in order) | Fields used |
| --- | --- | --- |
| `upcoming` | Predict · Preview · Table · H2H | `crowd`, `tables`, `preview`, `table`, `h2h` (+ slip via §7) |
| `live` | Predict · Chat · Facts · Stats · Lineups · Table · H2H | `question`, `progress`, `crowd`, `events`, `stats`, `lineups`, `table`, `h2h` (+ challenge standings when you're in one) |
| `finished` | Result · Facts · Stats · Table · H2H | `you`, `settlement`, `events`, `stats`, `table`, `h2h` (+ resolved slip) |

Optional `?include=events,stats,lineups` to trim the payload is welcome but not required.

### `POST /v1/matches/{id}/crowd-vote`

Free, no coins, one vote per user per match, allowed until full time **[Decide]** (until kickoff?).

```json
// request
{ "pick": "1" }           // "1" home, "X" draw, "2" away
// 200
{ "crowd": { "votes": 18413, "yourVote": "1", "split": { "home": 41, "draw": 33, "away": 26 }, "topScore": [2, 1] } }
```

Second vote → `409 ALREADY_ANSWERED` (or allow a change; **[Decide]**).

---

## 7. Predictions (the slip)

The **PredictionBuilder**: before kickoff you add prediction types, pick an option, put a coin stake on each, and "Lock in". Until kickoff the slip stays editable; after kickoff it reads back ✓ Right / ✗ Wrong.

**[Decide] Slip scope.** The mock keys slips by match only, but the builder takes the stake rules from a challenge. Proposal: one slip per `(user, match, challenge)`, where `challenge` is null for a personal slip outside any league. The challenge's points/pool reads only its own slip. If you prefer one slip per match shared by every league you're in, the cap/fixed-stake rules conflict between leagues; please flag.

### `GET /v1/matches/{id}/slip?challengeId=ch-2`

```json
{
  "matchId": "ars-che",
  "challengeId": "ch-2",
  "rules": { "stake": { "fixed": 250 }, "cap": 1500, "setBy": { "id": "u_sara", "name": "Sara", "initial": "S" } },
  "editableUntil": "2026-11-03T21:00:00Z",
  "items": [
    { "id": "p-1", "type": "result", "pick": "1", "stake": 250, "potentialPayout": 1000 },
    { "id": "p-2", "type": "corners", "pick": "Over 9.5", "stake": 250, "potentialPayout": 1000 }
  ],
  "totalStake": 500,
  "markets": [PredictionMarket]
}
```

(`potentialPayout` is 1,000 here because `ars-che` is a boost match: 250 × 2 × 2.)

Empty slip → `items: []`.

### `PUT /v1/matches/{id}/slip`

Replaces the whole slip (lock in, or save an edit). `Idempotency-Key` required.

```json
// request
{
  "challengeId": "ch-2",
  "items": [
    { "type": "result", "pick": "1", "stake": 250 },
    { "type": "corners", "pick": "Over 9.5", "stake": 250 },
    { "type": "red", "pick": "No", "stake": 250 }
  ]
}

// 200
{ "slip": PredictionSlip, "wallet": { "coins": 5700 }, "charged": 250 }
```

Server rules:
- Reject after `kickoffAt` → `409 PREDICTIONS_LOCKED`.
- One item per `type`.
- `pick` must be a listed option → `422 INVALID_PICK`.
- `stake >= minStake[type]` → `422 STAKE_BELOW_MIN`; with a fixed-stake challenge, `stake == fixed` → `422 STAKE_NOT_FIXED`.
- `sum(stake) <= rules.cap` → `422 OVER_CAP`.
- **Charge the difference** between the new and the old total: more → debit, less → refund. Not enough coins → `402 INSUFFICIENT_COINS { short }`. Write one `CoinEntry` per change ("Predictions · ARS v CHE").
- Empty `items` = withdraw the slip and refund everything.

### Settlement (server job, after the relevant event or full time)
- Right: pay `stake × 2` (× 2 again when `match.boost`), add 50 points, write `prediction_payout` entry.
- Wrong: nothing back.
- Void (match abandoned, market can't resolve): refund stake, `result: "void"`.
- Push `slip.resolved` over realtime.

---

## 8. Live questions and crowd poll

System questions are asked by Footon during a live match, ~10 per match (`progress.total`). Each is Yes/No, open for a short window (~30–60s), resolves at a later match minute.

**Live questions earn points only, never coins.** They cost nothing.

### Lifecycle

```
scheduled → open (closesAt countdown) → closed (no more answers) → resolved (outcome) | void
```

Every transition is pushed over realtime (`question.*`, §11). `GET /v1/matches/{id}` returns the current one in `question`.

### `POST /v1/questions/{id}/answer`

```json
// request
{ "answer": "yes" }
// 200 — the crowd split is revealed only now
{ "question": { "id": "q_4", "state": "open", "yourAnswer": "yes", "yesShare": 58, "resolvesAt": "75'" } }
```

Errors: `409 QUESTION_CLOSED`, `409 ALREADY_ANSWERED`. Accept answers until `closesAt` server time; allow ~1s grace for latency.

On resolution: right → +50 points, update `you.streak`, `you.right`, the challenge standings, `profile.activeCalls`. Wrong → streak resets to 0.

**[Decide]** Who writes and resolves questions: an editor tool, a rules engine on a live data feed (e.g. "corner before 75'" resolved from the event feed), or both? This needs a provider with corners and cards in real time.

---

## 9. Challenges (friends' leagues), invites, chat

A **challenge** is a small private league on **one match**. Everyone pays the same entry into a pool; 5% burns; the winner (most points) takes the rest, or 70/30 from five players. Points decide rank; coin stakes never change rank.

### `GET /v1/challenges?status=joined`

`status` = `joined` | `invited` | `expired` | `finished` (comma-separated allowed). The Challenges tab uses Joined · Invited · Expired; Home uses `joined`.

```json
{ "items": [Challenge], "nextCursor": null }
```

### `POST /v1/challenges`

Create (`/challenges/new`). `Idempotency-Key` required. Costs `createLeague (1,500) + entry`. The creator is joined automatically and pays their own entry.

```json
// request
{
  "name": "Sunday Rivals",          // 1–20 chars
  "matchId": "liv-mci",             // upcoming match
  "entry": 1500,                    // one of ENTRY_TIERS
  "rules": { "stake": { "fixed": 250 }, "cap": 2500 },   // or { "stake": "free", "cap": 2500 }
  "modes": { "system": true, "friends": true, "pre": false },
  "inviteUserIds": []               // optional; people can also join from the link
}

// 201
{ "challenge": Challenge, "wallet": { "coins": 3450 }, "charged": 3000 }
```

Errors: `402 INSUFFICIENT_COINS { short }`, `422 VALIDATION`, `409 PREDICTIONS_LOCKED` if the match has started.

**[Decide]** The create form doesn't pick a match yet (the ticket says "Liverpool v Man City · 21:00"). Either we add a match picker or creation starts from a match page (`?matchId=`). Backend needs `matchId` either way.

### `GET /v1/challenges/{id}`

The challenge page (`/challenges/[id]`). Returns `Challenge` with `standings`, `pool`, `members`, plus:

```json
{
  "challenge": Challenge,
  "slip": PredictionSlip,            // yours on this challenge, if joined
  "chat": { "unread": 3 }            // thread via the chat endpoint
}
```

If the caller is neither a member nor invited → `404` (don't leak private leagues), unless they arrived with the invite code ([below](#invite-links)).

### `POST /v1/challenges/{id}/accept`

Pays the entry and joins. `Idempotency-Key` required.

```json
// 200
{ "challenge": Challenge, "wallet": { "coins": 5950 }, "charged": 500 }
```

Errors: `402 INSUFFICIENT_COINS`, `409 CHALLENGE_NOT_OPEN` (expired / match started), `409 CHALLENGE_FULL`.

### `POST /v1/challenges/{id}/decline` · `DELETE /v1/challenges/{id}/decline`

Decline is reversible ("Undo") until kickoff. Both return `{ "challenge": Challenge }`. **[Decide]** whether the inviter is told.

### `GET /v1/invites`

Pending invites (`InviteStrip`, `/invites`, `InviteTile`). Same as `GET /v1/challenges?status=invited`, but sorted by kickoff and including `from`.

### Invite links

`https://t.me/footon_bot?start=<code>` (and/or a web URL `https://footon.app/i/<code>` **[Decide]**).

- `GET /v1/invites/{code}` → `{ "challenge": Challenge }` (public preview: name, match, entry, rules, member count, pool). Works for non-members.
- `POST /v1/invites/{code}/join` → same as accept. Records the referral (`invites` weekly cap, mission m-4).

### Members and standings

`standings` is sorted by points, ties share a rank. `delta` is the place change since the last resolved call (drives the up/down marker). The `you` user has `you: true`.

### Pool settlement (at full time)
Uses `splitPool(entry, members)`:

```
pool    = entry × players
burned  = round(pool × 0.05)
net     = pool − burned
players < 5  → [net] to 1st
players ≥ 5  → 1st floor(net × 0.7), 2nd the rest
```

Examples: 4 × 1,500 → pool 6,000, burned 300, winner 5,700. 7 × 500 → pool 3,500, burned 175, 2,327 / 998.

Ties share their places equally (e.g. two tied 1st with five players split 1st + 2nd evenly). **[Decide]** rounding for odd coins (proposal: floor, remainder burns). A solo league (only the creator) → refund entry. Write a `pool_win` `CoinEntry` with the reason "1st of 4 · 5% burned".

### Chat

Only members can read or post. Available before kickoff, during the match and for **[Decide]** N hours after.

#### `GET /v1/challenges/{id}/chat?before=<messageId>&limit=50`

```json
{
  "members": [UserRef],
  "online": ["u_sara"],
  "items": [ChatMessage],          // oldest → newest
  "nextCursor": "..."              // older page
}
```

#### `POST /v1/challenges/{id}/chat/messages`

```json
{ "kind": "text", "text": "City are all over them now", "clientId": "c-123" }
{ "kind": "preset", "text": "VAR!" }
{ "kind": "sticker", "stickerId": "var-screen" }
```

→ `201 { "message": ChatMessage }`. `clientId` lets the client match its optimistic bubble. Length cap **[Decide]** (proposal 280). Server-side moderation / profanity filter **[Decide]**.

#### `POST /v1/challenges/{id}/chat/questions`

"Ask the league". Costs `COSTS.chatQuestion` (250). `Idempotency-Key` required.

```json
// request
{ "text": "Yellow card before 80'?", "call": "yes", "closes": "80'" }
// 201
{ "message": ChatMessage, "wallet": { "coins": 6200 }, "charged": 250 }
```

`text` ≤ 60 chars. **[Decide]** how friend questions resolve: the asker marks the outcome, the league votes, or we only resolve those we can map to the event feed? Today the UI only records picks. The earn rule "Friends answer your question: 50 each, up to 250 a question" pays the asker per friend who answers.

#### `POST /v1/chat-questions/{id}/answer`

`{ "answer": "no" }` → `{ "question": FriendQuestion }`. Free.

#### `GET /v1/chat/presets`

```json
{
  "reactions": ["VAR!", "Offside", "What a save"],
  "groups": [
    { "group": "Banter", "phrases": ["Told you", "Not again", "Easy", "Bottle job", "Who's laughing now"] },
    { "group": "Ref", "phrases": ["VAR!", "Offside", "Never a pen", "Book him", "Play on"] },
    { "group": "Goal", "phrases": ["What a strike", "What a save", "Get in", "Top bins"] }
  ],
  "stickers": ["var-screen", "red-card", "golden-boot", "crying-ball", "whistle", "goal-net", "trophy", "megaphone"]
}
```

Sticker art ships in the frontend; the server only stores ids.

---

## 10. Wallet, missions, shop, fantasy

### `GET /v1/wallet`

The `/wallet` screen.

```json
{
  "wallet": { "coins": 6450, "points": 4820, "prizes": 0 },
  "starter": {
    "day": 3, "days": 7, "total": 15000,
    "missions": [
      { "id": "m-1", "title": "Pick your club and profile", "coins": 1000, "doneAt": "...", "doneReason": "You picked Liverpool" },
      { "id": "m-4", "title": "Invite a friend who joins", "coins": 2000 }
    ]
  },
  "weekly": {
    "mission": { "title": "Watch 3 matches to the end", "done": 2, "total": 3, "coins": 750 },
    "caps": [
      { "id": "free-table", "label": "Free table rewards", "used": 700, "cap": 2000, "period": "week" },
      { "id": "invites", "label": "Friends who finished a match", "used": 1, "cap": 6, "period": "month", "unit": "friends" }
    ]
  },
  "earnWays": [
    { "id": "e-1", "label": "Watch to the end", "detail": "3+ answers to 90'", "coins": 100, "cap": "Every match" }
  ],
  "activity": { "items": [CoinEntry], "nextCursor": "..." }   // first page
}
```

`starter` disappears after day 7 (or once all missions are done). `cap` on `earnWays` is display text.

### `GET /v1/wallet/activity?cursor=`

`{ "items": [CoinEntry], "nextCursor": "..." }`, newest first.

### Starter missions (server-tracked)

| id | Mission | Coins | Completes when |
| --- | --- | --- | --- |
| m-1 | Pick your club and profile | 1,000 | `POST /onboarding/complete` with `claim: true` |
| m-2 | Make your first call | 1,000 | First live answer or locked prediction |
| m-3 | Join your first friends' league | 2,000 | First accept / join / create |
| m-4 | Invite a friend who joins | 2,000 | A user joins via your code |
| m-5 | Stay to the end of a match | 2,000 | 3+ answers and still answering at 90' |
| m-6 | Answer 10 live questions | 1,500 | 10th answer |
| m-7 | Ask your first question in chat | 1,500 | First chat question |
| m-8 | Come back on day 3 | 2,000 | Any session on day 3 after signup |
| m-9 | Win a pool or the free table | 2,000 | First `pool_win` or free-table top 3 |

Total 15,000 over 7 days. Pay automatically, write a `mission` `CoinEntry`, push `wallet.updated` + `mission.completed`.

### Ways to earn after week one (server-tracked, capped)

| id | Rule | Coins | Cap |
| --- | --- | --- | --- |
| e-1 | Watch to the end: 3+ answers to 90' | 100 | every match |
| e-2 | Free table top 3 | 400 / 300 / 200 | 2,000 a week |
| e-3 | Rare call right (< 20% picked it) | 50 | 150 a match |
| e-4 | Five matches in a row to the end | 500 | every 5 matches |
| e-5 | A friend finishes their first match after your invite | 1,500 | 6 a month |
| e-6 | Friends answer your chat question | 50 each | 250 a question |
| e-7 | Promoted in a weekly league | 1,000 | weekly |

### `GET /v1/shop`

Phase 2 "coming soon": real items and prices, **no payment**.

```json
{
  "groups": [
    { "group": "Coin packs", "note": "18+ · monthly limit", "items": [
      { "id": "pack-m", "name": "Medium", "detail": "A few weekends", "price": { "amount": 499, "currency": "USD", "display": "$4.99" }, "pack": { "coins": 5500, "bonus": 10 }, "icon": "pack" }
    ]},
    { "group": "Match moments", "items": [
      { "id": "celebration", "name": "Goal celebration", "detail": "Takes over your league's screen", "coins": [100, 750], "icon": "celebration" }
    ]}
  ]
}
```

`coins` is a number or a `[min, max]` range. Prices in minor units + a display string for the user's region.

### `POST /v1/shop/notify`

`{ "itemId": "pack-m" }` → `204`. Store (user, item, time); we email/push when the shop opens.

### `POST /v1/analytics/events`

Shop intent measurement (today `track()` pushes to `window.dataLayer`). If you'd rather we send these to a third-party analytics tool directly, skip this endpoint.

```json
{ "events": [{ "name": "shop_open" | "shop_item_tap" | "shop_notify", "props": { "itemId": "pack-m" }, "at": "..." }] }
```

### `GET /v1/fantasy`

Placeholder until the fantasy spec lands. Today the app needs only the unlock progress (Home tile):

```json
{ "unlock": { "done": 3, "total": 5, "open": false } }
```

**[Decide]** what "done" counts (matches played? leagues joined?). Team, lineup, captain and transfers endpoints come with the fantasy spec.

---

## 11. Realtime

One authenticated socket: `wss://.../v1/realtime?token=<access>`.

### Subscribe

```json
{ "op": "subscribe", "topics": ["user", "match:liv-mci", "challenge:ch-1"] }
{ "op": "unsubscribe", "topics": ["match:liv-mci"] }
```

| Topic | Who subscribes | When |
| --- | --- | --- |
| `user` | Always | App open |
| `match:{id}` | Match page, `/play`, Live tab rows (live ones) | While visible |
| `challenge:{id}` | Challenge page, `/play` | While visible |

### Server → client events

Envelope: `{ "type": "...", "topic": "...", "seq": 1042, "at": "ISO", "data": { ... } }`. `seq` is per topic and increasing; on reconnect the client sends `{ "op": "resume", "topic": "...", "seq": 1042 }` and gets missed events, or a `resync` telling it to refetch.

| Type | Topic | `data` | UI effect |
| --- | --- | --- | --- |
| `match.clock` | match | `{ minute, addedTime?, period }` | Minute, clock bar. ~every 60s or on period change |
| `match.score` | match | `{ score, redCards? }` | Scoreboard, island |
| `match.event` | match | `MatchEvent` | Facts timeline, scorers |
| `match.event_removed` | match | `{ id }` | VAR overturn |
| `match.stats` | match | `MatchStat[]` | Stats tab |
| `match.status` | match | `{ status, period }` | Kickoff (locks slips), FT |
| `crowd.updated` | match | `{ votes, split }` | Poll (throttle to ~5s) |
| `question.opened` | match | `LiveQuestion` | Deal the card, start the ring |
| `question.closed` | match | `{ id, yesShare }` | "Waiting for 75'…" |
| `question.resolved` | match | `{ id, outcome, resolvedLabel }` | Right/wrong, +50 |
| `question.void` | match | `{ id, reason }` | Remove without penalty |
| `standings.updated` | challenge | `Standing[]` | League tiles |
| `chat.message` | challenge | `ChatMessage` | Thread |
| `chat.question_updated` | challenge | `FriendQuestion` | Answer counts, outcome |
| `challenge.member_joined` | challenge | `UserRef` | Members, pool |
| `challenge.settled` | challenge | `{ rank, payouts }` | Full time screen |
| `wallet.updated` | user | `{ coins, points, delta, entry: CoinEntry }` | Island coin tick |
| `you.updated` | user | `{ matchId, you: MatchYou }` | Streak flame, `+points` |
| `slip.resolved` | user | `{ matchId, challengeId?, items: Prediction[] }` | ✓ / ✗ rows |
| `invite.received` | user | `Challenge` | Invite tile count |
| `mission.completed` | user | `Mission` | Wallet missions |
| `level.updated` | user | `{ level, xp, xpNext, badges }` | Level bar |

Personalised fields (`yourAnswer`, `you`, `pointsAwarded`) go on the `user` topic, never broadcast on `match:*`.

**Scale note.** A big match can have tens of thousands of viewers. `match:*` events are identical for everyone, so fan them out from a pub/sub layer; keep per-user work to the `user` topic.

---

## 12. Economy rules the server must enforce

The client mirrors these for instant feedback (disabled buttons, "Need N more coins"), but **the server is the authority**. Never trust client-computed totals or payouts.

| Rule | Value | Source |
| --- | --- | --- |
| Entry tiers (per player per match) | 500 / 1,500 / 2,500 (2,500 is the cap) | `ENTRY_TIERS` |
| Pool burn | 5% of each pool, rounded | `POOL_BURN` |
| Pool split | < 5 players: winner takes all; ≥ 5: 70 / 30 | `SPLIT_FROM`, `SPLIT` |
| Free table | Always open, no entry. Top 3 get 400 / 300 / 200; max 2,000 per user per week | `FREE_TABLE_*` |
| Create a league | 1,500 + your own entry | `COSTS.createLeague` |
| Chat question | 250 | `COSTS.chatQuestion` |
| Prediction min stake | 100 (result, goals, corners, yellows), 200 (red, penalty) | `PREDICTION_MIN_STAKE` |
| Right prediction pays | stake × 2 (stake included) | `PAYOUT_MULTIPLIER` |
| Boost (big) match | × 2 again on coins. **Never boosts points** | `BOOST_MULTIPLIER` |
| Points per right call | 50 (live question, prediction). Never bought, never boosted | `POINTS_PER_RIGHT_CALL` |
| Hot streak | ≥ 3 right in a row | `HOT_STREAK` |
| Starter missions | 15,000 over 7 days; onboarding pays only mission one (1,000) | `STARTER_*` |

Hard rules from the economy doc:
- **Points, coins and prizes never mix.** Rank and prizes read points only. An entry or stake never changes rank.
- **Coins can't be cashed out or transferred** between users.
- **Nothing that earns points is for sale.** No mystery boxes.
- **Never sell pressure:** no purchase prompts after a loss or on low balance, no fake timers, no "sold out". If the API ever returns promotional content, it must respect this.
- **Coin packs are 18+ with a monthly limit** (when payments ship). **[Decide]** age verification and the limit value.
- Every coin movement has a reason (`CoinEntry.reason`) and is append-only (a ledger, not a mutable balance). Balance = sum of the ledger; never negative.

---

## 13. Open questions

1. **Login:** Telegram as the identity? Other providers? Guest play before sign-in?
2. **Slip scope:** one slip per (user, match, challenge) as proposed, or one per match? (§7)
3. **Prediction lines:** static (from `/config`) or per match? (§5)
4. **Live questions:** who authors and resolves them; which data provider (needs live corners and cards)? (§8)
5. **Friend chat questions:** how they resolve and whether the asker's call earns points. (§9)
6. **Match states:** postponed / abandoned / cancelled: refund rules for entries and stakes (proposal: full refund, `result: "void"`).
7. **Challenge size:** max members? Can people join after kickoff (proposal: no)?
8. **Decline:** does the inviter see it? Is an invite you declined "expired" after kickoff?
9. **Ties** in pools: share places evenly; rounding of odd coins (proposal: floor, remainder burns).
10. **Island:** only your league's live match, or any live match you've touched?
11. **Crowd poll:** voting window (until kickoff or until FT) and whether you can change your vote.
12. **Recent form:** one item = one call or one match?
13. **Chat:** retention after FT, message length, moderation and reporting.
14. **Fantasy:** what counts toward unlock; full spec pending.
15. **Level / XP / badges:** placeholder until the gamification doc lands; what earns XP?
16. **Localisation:** Persian (RTL) is planned. Should the API return localised strings (`question.text`, mission titles, reasons) via `Accept-Language`? Proposal: yes for server-authored text.
17. **Time zone / region:** for day grouping and "where to watch" — from the device (`tz` param) or the profile?

---

## Appendix A: screen → endpoint map

| Screen (route) | On load | Actions | Realtime |
| --- | --- | --- | --- |
| Splash / first run (proxy on `/`) | `GET /me` (`onboardedAt`) | – | – |
| Onboarding (`/welcome`) | `GET /onboarding` | `POST /onboarding/complete` | – |
| Tabs shell (island, level bar, dock) | `GET /me` | Answer from island: `POST /questions/{id}/answer` | `user`, `match:{live.matchId}` |
| Home (`/`) | `GET /home` | – | `user` |
| Challenges (`/challenges`) | `GET /challenges?status=joined,invited,expired`, `GET /invites` | accept / decline / undo | `user` |
| Invites (`/invites`) | `GET /invites` | accept / decline / undo | `user` |
| Create (`/challenges/new`) | `GET /me` (balance), `GET /config` | `POST /challenges` | – |
| Challenge (`/challenges/[id]`) | `GET /challenges/{id}`, `GET /challenges/{id}/chat` | accept / decline, `PUT /matches/{id}/slip`, chat posts | `challenge:{id}`, `match:{matchId}` |
| Live tab (`/live`) | `GET /matches?date=…` / `?live=true` | – | `match:{id}` for live rows (or a light `matches:live` topic) |
| Match (`/match/[id]`) | `GET /matches/{id}`, `GET /matches/{id}/slip` | crowd vote, slip, answer | `match:{id}` |
| Your live match (`/play`) | `GET /matches/{id}`, `GET /challenges/{id}`, chat | answer, chat, crowd vote | `match:{id}`, `challenge:{id}`, `user` |
| Profile (`/me`) | `GET /me`, `/me/form`, `/me/achievements` | `PUT /me/favourite-teams` | `user` |
| Wallet (`/wallet`) | `GET /wallet` | paging activity | `user` |
| Shop (`/shop`) | `GET /shop` | `POST /shop/notify`, analytics | – |
| Fantasy (`/fantasy`) | `GET /fantasy` | – (spec pending) | – |

---

## Appendix B: mock field → API field

Changes the frontend will make when wiring the API. Backend doesn't need to send the old fields.

| Mock (`mock-data.ts`) | API | Why |
| --- | --- | --- |
| `Match.kickoff: "21:00"` | `kickoffAt` ISO | Client formats in local time |
| `Match.day: "Sat"`, `dayOffset` | (derived from `kickoffAt`) | Don't send display labels |
| `Match.caption` | (derived: league name or competition) | Display only |
| `Match.competition: string` | `competition: Competition` | Needs country + code for group headers |
| `competitions` map | inside `Competition` | – |
| `Match.league: string` | `league: { challengeId, name }` | Needs to link |
| `Match.market` | dropped for now | Not shown on current screens; quick-call markets **[Decide]** later |
| `Match.crowd.home/draw/away` | `crowd.split` (only after voting) | Split hidden until you vote |
| `liveQuestion.seconds` | `closesAt` | Countdown survives reloads |
| `liveQuestion` (global) | `MatchDetail.question` + realtime | Per match |
| `Challenge.members: ["Y","S"]` + `people` map | `members: UserRef[]` | Real users |
| `Challenge.from: { name, initial }` | `from: UserRef` | – |
| `Challenge.matchId` | `match: MatchSummary` | Saves a join (`challengesWithMatch`) |
| `Invite` (derived) | `GET /invites` returns `Challenge` | One type |
| `league` (global standings, code, link) | `Challenge.standings`, `code`, `inviteUrl` | Per challenge |
| `predictionSlips[matchId]` | `GET /matches/{id}/slip` | – |
| `Prediction` (no payout) | `+ potentialPayout, payout, points` | Server computes money |
| `chat` / `prematchChat` | `GET /challenges/{id}/chat` | – |
| `FriendQuestion.you` | `from.you` | – |
| `wallet.coins` | `Me.wallet` | – |
| `profile.points` | `Me.wallet.points` | – |
| `profile.favoriteTeams: ["LIV"]` | `favouriteTeams: Team[]` | – |
| `fantasyProgress` | `GET /fantasy` → `unlock` | – |
| `starter`, `weekly`, `earnWays`, `coinActivity` | `GET /wallet` | – |
| `CoinEntry.day: "Today"` | `at` ISO | – |
| `shop[].items[].price: "$4.99"` | `price: { amount, currency, display }` | Regional pricing |
| `onboarding` | `GET /onboarding` | – |
| `recentForm` | `GET /me/form` | – |
| Profile `RANK`/`OF` constants | `Me.tier` | – |
| `mockToday` | server time | – |
