<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Footon — agent guide

Footon is a free-to-play, mobile-first web app where friends predict live football moments together ("Next corner before 75'?"), compete in small leagues, and unlock fantasy features. This file is the source of truth for **how the UI looks and behaves**. Read it fully before you add or change any screen or component.

The visual reference is the Footon design canvas (7 artboards: Onboarding, Home, Create league, Live match, Full time, My team, Profile). When the canvas and this file disagree, this file wins; flag the mismatch.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, React 19, Server Components by default) |
| Language | TypeScript, strict |
| Styling | Tailwind CSS v4: tokens in `src/app/globals.css` via `@theme`; **no `tailwind.config`** |
| Components | shadcn/ui (new-york style, `components.json`), on the unified `radix-ui` package |
| Variants | `class-variance-authority` + `cn()` from `@/lib/utils` |
| Motion | `motion` (`motion/react`) for springs, layout and presence; CSS for simple loops |
| Icons | `lucide-react` (stroke 2–2.4 in buttons). One exception: the dock uses Footon's own set in `components/footon/nav-icons.tsx` (outline 1.8 inactive, filled active) |
| Fonts | Geist + Geist Mono (`geist` package), Barlow Condensed (local woff2 in `src/fonts`) |

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npx tsc --noEmit`. All four must pass before you hand work back.

Adding shadcn components: `npx shadcn@latest add <name>`, then **restyle it to these tokens** (see "Adapting shadcn components"). Never leave default shadcn colours, radii or white primary buttons in the codebase.

## Project layout

```
src/
  app/                    routes (/, /welcome, /play, /match/[id], /challenges/new, /challenges/[id], /styleguide)
    (tabs)/               /, /challenges, /predictions, /live, /me, /leaderboard, /fantasy, /wallet, /shop — layout holds the sticky LiveIsland and the Dock (persist across tabs)
    globals.css           ALL design tokens, utilities, keyframes
  components/
    ui/                   shadcn primitives, restyled (button, badge, card, input, label,
                          switch, slider, avatar, separator, progress, dialog, tabs, skeleton)
    footon/               product components (app-shell, dock, live-island, question-card,
                          match-row, segmented-tabs, match-centre, live-match, crowd-poll,
                          match-facts, match-stats, match-lineups, match-table, league-chat,
                          match-scoreboard, match-preview, match-days, countdown, back-button, coin, number-ticker, form-bars,
                          progress-ring, team-crest, live, empty-state, match-filter, match-list, invite-strip, streak,
                          prematch-calls, fantasy-unlock, football, ball-switch, splash, splash-gate, nav-icons,
                          missions, match-tables, shop, prediction-builder, challenge-list,
                          challenge-gate, boost-badge, level-bar, favourite-clubs,
                          shop-preview, shop-icons, section-heading, pitch-markings, match-hero,
                          league-badge, standings, league-card, division-card, result-card,
                          achievement-badge, score-picker)
  lib/
    utils.ts              cn(), ordinal()
    dates.ts              day labels relative to the mock today ("Yesterday", "Thu 5 Nov")
    mock-data.ts          typed mock data mirroring the canvas — replace with API, keep types
    economy.ts            coin rules: entry tiers, pool split + burn, costs, caps, prediction stakes + payout. Never hard-code these in UI
    predictions.ts        prediction types (Correct score, Win/draw, Goals, Corners, Yellow cards, Red card, Penalty), their options, scorePick()/parseScore()
    challenges.ts         challenge + match join, and where each challenge links
    track.ts              analytics stub (shop intent events)
  fonts/                  Barlow Condensed woff2
  proxy.ts                first-run redirect: `/` → `/welcome` until `footon_onboarded` is set
```

Rules:
- Pages are Server Components. Put `"use client"` only on the smallest interactive leaf (see `match-filter.tsx`, `create-league-form.tsx`).
- Product UI goes in `components/footon`. `components/ui` holds only generic primitives.
- No data fetching inside `components/`; pass data in as props.
- Check `/styleguide` after changing tokens or primitives.

## Design principles

1. **Dark only.** The app is played at night, at the match or on the sofa. There is no light theme; do not add `dark:` variants.
2. **Colour has a job, never decoration.** Each accent means one thing (see the colour roles below). If you can't say what a colour *means* on that element, it should be neutral.
3. **One lime thing per view.** The lime primary is the single main action on screen (plus wins and "you"). Two lime CTAs side by side is a bug. The one exception is a Yes/No answer pair: Yes is lime, No is `secondary`.
4. **No white buttons.** Primary = lime; everything else is dark (`secondary`, `outline`, `ghost`, `soft`).
5. **Lists over boxes.** Group related rows inside *one* `Card` with hairline dividers (`CardRow`, `MatchRow`). Don't stack many small bordered cards.
6. **Broadcast numbers.** Scores, minutes, coins, points, ranks and big stats use the display font (Barlow Condensed). It is what makes Footon feel like football and not a dashboard.
7. **Learn by doing.** Teach with a real interaction (onboarding asks a sample question), not with explanatory paragraphs or numbered lists.
8. **Motion confirms, never decorates.** Every animation answers "what just changed?" Springs for things you touch; ease-out for things that appear.
9. **Not AI-generic.** No gradient washes, glowing blobs, emoji, left-border accent cards, "✨" sparkle icons or glassmorphism everywhere. Glass is allowed on exactly two surfaces: the dock and bottom sheets.
10. **Football first, tastefully.** Footon is a stadium at night: a green-tinted ground, a calm grass green for the brand (flat buttons: no gloss, no glow), and football's own language (pitch lines, scoreboards, league tables, medals, kit colours). Pitch texture lives only on **hero canvases** (scoreboards, the Home match hero, the score picker, the leaderboard header, result cards, empty states): `floodlight` (one top light + turf stripes) or `bg-turf`, plus `PitchMarkings`. Never on list cards, buttons or every card.

## Colour

All colours are CSS variables on `:root` in `globals.css`, exposed as Tailwind colours (`bg-surface`, `text-live`, `border-line-strong`…). **Never hard-code a hex in a component** if a token exists. A few one-off greys (e.g. `#27272a` tracks, `#3a3a42` avatar fill) are allowed inline; promote one to a token the second time you need it.

### Neutrals (stadium-green ladder, darkest to lightest)

| Token | Hex | Use |
| --- | --- | --- |
| `background` | `#06140F` | App ground (deep stadium green) |
| `surface` | `#0B1E17` | Cards, list groups, inputs |
| `surface-hover` | `#0F251C` | Hover on a row inside a `surface` card |
| `surface-2` | `#11281F` | Raised: question card, pills, dock, coin badge |
| `surface-3` | `#183327` | Secondary buttons, chat bubbles |
| `surface-4` | `#1F3D30` | Hover on `surface-3` |
| `line` | `#15302A` | Hairline border and dividers on `surface` |
| `line-strong` | `#224236` | Borders on raised elements |
| `track` | `#193429` | Empty progress tracks, switch off |
| `dim` / `dim-strong` | `#2E4B3F` / `#4A675A` | Score colons, inactive bars and ticks |
| `foreground` | `#F3F8F4` | Primary text |
| `muted-foreground` | `#9DB1A6` | Secondary text. Passes 4.5:1 on every surface |
| `subtle` | `#62786D` | **Decoration / ≥24px text only**: placeholders, axis labels, "vs". Fails AA for small text |
| `nav-muted` | `#8AA095` | Inactive dock items |

### Colour roles (accents)

| Role | Token | Means | Use it for | Never for |
| --- | --- | --- | --- | --- |
| **Primary / win / you** | `primary` `#43B883` (calm grass green, matte, never neon) on `primary-foreground` `#04170E` | "Do this", "you got it right", "this is you" | Main CTA, Yes, win bars, correct calls, your rank, active dock dot, active segmented pill | Decoration, headings, links, more than one CTA |
| Primary soft | `primary-soft` + `primary-line` + `text-primary` | Selected / on | Selected chips, quick replies, "ask" button, your standings tile, toggled states | Main actions |
| **Live** | `live` `#FFA83E`, `live-soft`, `live-foreground` | "Happening now", "time", "money" | LIVE minute, pulsing dot, countdown ring, coins, boosts | Wins, buttons, selection |
| **Trophy** | `gold` `#F5C451`, `gold-soft`, `gold-line`, `gold-foreground`; medals `silver` `#C9D4CE`, `bronze` `#D9925E` | "A trophy moment" | 1st/2nd/3rd medal discs in tables, a won league (finished 1st), gold-tier achievements, the Silver division card | Coins (amber), actions, "you" (lime), live |
| **Loss** | `loss` `#F87171`, `loss-soft` | Wrong / lost | Loss bars, wrong calls, destructive actions | Errors that aren't the user's fault (use neutral copy) |
| Pitch | `pitch`, `pitch-2`, `pitch-line` | The field | Fantasy pitch, match line-ups, `PitchMarkings` on hero canvases | Fills on cards or buttons |
| Kit colours | data (`team.colors`, `LeagueBadge`) | A club's / league's identity | Crests, the hero's kit stripe and the soft pool of each side's colour behind its crest on hero canvases | Text, UI states |
| Booking | `booking-yellow`, `booking-red` | A referee's card | The card glyphs in `MatchFacts` and next to a team with a red | Anything that isn't a literal yellow/red card |

Accessibility for colour:
- Text contrast ≥ 4.5:1 (≥ 3:1 for 24px+). Lime text on dark and dark text on lime both pass; **white text on lime fails**, so don't use it.
- Never rely on hue alone: wins vs losses also differ in **height/shape/icon** (tall vs short bars, ✓ vs ✗, filled vs ring dots).

## Typography

| Role | Font / class | Size / weight | Example |
| --- | --- | --- | --- |
| Display numbers | `font-display` (Barlow Condensed) | 88 / 64 / 56 / 28 / 22 / 16, 700 | `+450`, `1 : 1`, `LIVE 67'`, `2,450`, `2nd` |
| Display title (rare) | `font-display italic uppercase` | 44, 700 | League name on the invite ticket |
| Screen title | Geist | 26–32, 700, `tracking-[-0.03em]` | "Your matches" |
| Question | Geist | 26, 700, `-0.03em`, `text-balance` | "Next corner before 75'?" |
| Section label | Geist | 13, 500, `text-muted-foreground` | "League name", "Achievements" |
| Eyebrow | Geist | 11, 600, `tracking-[0.08em]`, uppercase | "QUESTION 4 OF 10", "LEAGUE INVITE" |
| Body strong | Geist | 15, 600 | Row titles |
| Body | Geist | 14, 400 | Chat messages |
| Caption | Geist | 12–13, 400, muted | Row subtitles |
| Code / IDs | `font-mono` | 11–12, 500 | `#sun9k`, invite links, char counters |

| Section heading | `font-display` uppercase (`SectionHeading`) | 17, 700, `tracking-[0.04em]` | "BIG MATCHES", "YOUR LEAGUES", "CALL THE SCORE" |

Rules: no font sizes under 11px. Use `tabular-nums` (`font-display` already looks tabular) for anything that ticks. Large Geist headings get negative tracking; Barlow never does.

## Shape, spacing, elevation

- **Radius scale:** chips/pills `rounded-full`; small buttons `rounded-sm` (10px); buttons/inputs `rounded-md` (14px); large buttons `rounded-lg` (16px); cards `rounded-xl` (18px) to `rounded-2xl` (22px); sheets/dock `rounded-3xl` / 24–28px. Nested radius = outer radius − padding.
- **Spacing:** 4px grid. Screen gutter 20px (`px-5`). Vertical rhythm between screen sections 18px (`gap-[18px]` in `AppShell`). Card padding 16px; row padding `px-4 py-3.5`.
- **Touch targets** ≥ 44px (`size="default"` and up). `sm` (32–36px) only for secondary chips inside a row.
- **Elevation:** flat by default (borders, not shadows). Shadows only on floating things: question card (`variant="raised"`), dock, live island.
- **Width:** mobile column, `max-w-[430px]` (560px from `md`), centred. Design at 390×844. `AppShell wide` opens a 1080px desktop grid (`lg:`) for Home (match column + competition column, interleaved on phones with `order-*` inside `contents` wrappers), Profile and Leaderboard. Don't stretch single-list screens.
- **Textures:** `bg-dots` (quiet: locked/dashed states, the invite ticket), `bg-turf` (mown stripes), `floodlight` (top light + stripes, hero canvases only), `PitchMarkings` (centre circle or penalty box SVG, plus `corners` for corner-flag arcs; `aria-hidden`, behind content with `-z-10` in an `isolate` parent). The floodlight is white at 5%, never tinted.

## Motion

Tokens (in `globals.css`): `ease-spring` (overshoot, for presses and toggles), `ease-spring-soft`, `ease-out-soft`, `animate-live-pulse`, `animate-shimmer`, `animate-in-up`; `motion` springs (`stiffness 300–500, damping 24–34`).

| Pattern | Where | How |
| --- | --- | --- |
| Press | Every button / tappable | `active:scale-95` + `ease-spring` (built into `Button`) |
| Sliding pill | Segmented tabs | `motion` `layoutId` spring |
| Island morph | Live island | `motion.div layout`, radius + width spring, blur-in body |
| Card deal | Question card | Spring in from `y:24, rotate:-2`; two cards peek behind |
| Number tick | Rewards, wallet | `NumberTicker` (ease-out 1.2s) |
| Draw check | Answer locked | SVG `pathLength` 0→1, 450ms |
| Crowd split | After answering | Bar widths spring from 0 |
| Shimmer status | "Waiting for 75'…" | `text-shimmer` utility |
| Live pulse | Live dot only | `animate-live-pulse` |
| Countdown | Question timer | Amber ring `stroke-dashoffset`, linear |
| Score roll | `ScorePicker` | Digit rolls up/down on change (spring), fade only with reduced motion |
| Drawn check (CSS) | "Locked in" confirmation | `animate-draw` on a path with `pathLength={1}` + `[stroke-dasharray:1]` |
| Skeleton | `loading.tsx` | `Skeleton` breathes (`animate-skeleton`) |

Rules:
- Animate `transform`, `opacity`, `filter` only. Never `transition: all`; name the properties.
- Durations: presses 150–200ms, appear 250–450ms, celebrations ≤ 1.2s.
- Infinite loops are allowed only for genuinely live state (pulse, shimmer while waiting).
- `prefers-reduced-motion` is handled globally in `globals.css` and via `useReducedMotion()` in motion components. New motion components must respect it.

## Components

### Primitives (`components/ui`)

- **Button**, variants: `default` (lime, the main action), `secondary` (dark, the "No"/alternative), `outline`, `ghost`, `soft` (selected state), `destructive`, `link`. Sizes: `sm`, `default` (44), `lg` (56, screen CTAs), `icon`, `icon-sm`, `icon-lg`. Use `asChild` with `next/link` for navigation.
- **Badge**: `default` (lime), `soft`, `live`, `neutral`, `loss`, `outline`.
- **Card**: `default`, `raised`, `dashed` (suggestions / locked). `CardRow` gives auto dividers.
- **Input + Label**: 50px tall, label above in muted 13px. Counters go inside the field on the right in mono.
- **Switch**: lime track, dark thumb when on. Put it in a `CardRow` with a `<label htmlFor>`.
- **Slider**: lime range + glowing thumb. Show the discrete stop labels under it in display font.
- **Avatar / AvatarGroup**: initials fallback; your own avatar is lime.
- **Progress**: lime on `track`.
- **Skeleton**: `surface-2` block that breathes; shape it like what's coming. Used by `app/match/[id]/loading.tsx`.
- **Dialog**: Radix Dialog. `variant="sheet"` (default) is a glass bottom sheet with a grabber, for invites, achievements and the quick-reply palette; `variant="center"` for short confirmations. Always a `DialogTitle`; the close button is built in.
- **Tabs**: Radix Tabs as a scrollable underline bar (lime underline on the active tab) for *sections* of one screen, like the match page. For 2–4 *filters* over one list use `SegmentedTabs`.

### Product (`components/footon`)

| Component | Purpose / rules |
| --- | --- |
| `AppShell` | Mobile column. `dock={false}` for focus mode (live match, create flow); otherwise it reserves room for the dock, which `app/(tabs)/layout.tsx` renders once. |
| `Dock` | Floating glass nav, 5 tabs: Home · Challenges · Predictions · Live · Profile, with the `nav-icons` set (Predictions = a crystal ball; its label reads "Predict" under 360px). Active item: filled icon + white label + lime dot. The Live tab carries a pulsing `LiveDot` while a match is on. No centre "+": creating lives on the Challenges screen. Fantasy and favourite team are not tabs (Fantasy is reached from its Home card and Profile; favourite team lives in Profile settings). |
| `LiveIsland` | Sticky top pill on every dock tab, rendered once by `app/(tabs)/layout.tsx`. Left: live minute, score and the open question (lime `Q4 open` chip, soft-lime `Q4 · Yes` once answered); tap to expand over the page and answer in place. Right: the wallet (coins → `/wallet`). Collapses on scroll, outside tap or Escape. With no live match it shows only the wallet. Pages don't render their own coin badge. |
| `QuestionCard` | The live question. Yes/No → crowd split + drawn check + shimmer. Timer ring is amber. `compact` = one-row widget. |
| `MatchCentre` | Match page frame (after FotMob): sticky top bar (back · title) → dotted scoreboard that scrolls away (the top bar then crossfades to the compact score + live minute) → sticky underline `Tabs` for sections. Sections arrive as server-rendered nodes; only the frame is client. |
| `LiveMatch` | A live match in `MatchCentre`. Scoreboard: xl crests, scorers under each name, red-card glyphs, display score, `LiveMinute`, match clock bar. Sections: **Predict** (first, amber dot while a question is open) · Chat · Facts · Stats · Lineups · Table · H2H; a section only shows when there's data. With your league: Predict = `QuestionCard` → league card (standings tiles, "N of M asked", your calls right, streak, lime `+points`) → `CrowdPoll`. Without: `CrowdPoll` + a dashed "Start a league" card (the one lime CTA). |
| `CrowdPoll` | "Who wins?" 1 · X · 2 poll with the total votes. The split stays hidden until you vote, then each choice fills to its share; yours soft-lime. Free, no coins. On live and upcoming match pages. |
| `MatchFacts` | Event timeline, newest first: minute pill in a centre column, home events on the start side, away on the end side; goals carry the running score; "Half time" and "Kick-off" rules. Icons: `Football` (goal), booking-card glyphs, lucide `ArrowRightLeft` (sub), `MonitorPlay` (VAR). |
| `MatchStats` | value · label · value rows with a split bar; the side ahead is bright, the other dims. Neutral, never lime. |
| `MatchLineups` | Both XIs on one striped pitch (FotMob view): home top half attacking down, away bottom half attacking up, rows from the formation string. Player = disc in the team's shirt colours (data, like crests) with the number in display font and the surname on a dark tag; goals (`Football`) and booking glyphs sit on the disc. Each side is an `<ol>` and every player has a full `aria-label`. |
| `MatchTable` / `HeadToHead` | Table rows around the match (the two teams raised on `surface-2`, not coloured); last meetings as three display numbers over a split bar. |
| `MatchScoreboard` / `CompactScore` | The dotted scoreboard on every match page and its one-line top-bar form. Live: score + `LiveMinute` + clock bar. Upcoming: display kickoff + `Countdown` (today) or the day. Finished: score + FULL TIME. |
| `Countdown` | Time to kick-off `01:53:39`, ticking; rendered after mount; one static `aria-label`. |
| `MatchInfo` / `TeamForm` / `MatchNews` | Preview-tab pieces. `MatchInfo` is one divided card: date + kickoff, venue + city, capacity + surface, weather, referee, where to watch (muted lucide icons). `TeamForm`: last five as W/D/L chips, shape-coded (W solid, D dark, L outline), neutral. `MatchNews`: one headline card. |
| `MatchDays` | The Live tab body: title + "N on now", a **Live only** `BallSwitch` (label turns amber when on) that narrows to live matches; a switch, not a toggle pill, so the on/off state is obvious and turning it off is the same tap, otherwise an underline day strip (two days back to five ahead, Today centred). Each day: folding competition groups headed `ENG · England · Premier League`. No CTA: rows are the action. |
| `BallSwitch` | Same size as `Switch`, but the thumb is the `Football`: dimmed when off, full on an amber-soft track when on (it means "live now"), turning slightly as it moves. No extra marks or shadow; keep it quiet. Only for live filters; settings use the plain lime `Switch`. |
| `LeagueChat` | League chat as a match section: who's in, thread (yours right, soft-lime), friends' questions as inline Yes/No cards (answering records your pick), quick reactions and the composer pinned to the bottom. The soft-lime + turns the composer into "ask the league": a short question (60 chars, mono counter), your own Yes/No call, and "Post · 250" (`COSTS.chatQuestion`). |
| `MatchRow` | One-line scoreboard row (~60px) inside a list card: home name + `xs` shield · centre box (score or kickoff, with amber live minute / day / FT under it; amber-soft while live) · shield + away name · "you" column (lime `+points` and a `StreakFlame` for a hot streak, or calls made before kickoff; chevron if you're not in). Every row links: your live match → `/play`, everything else → `/match/[id]`. Names become 3-letter codes under 360px. |
| `MatchList` | Now/Today/Upcoming `SegmentedTabs` that actually filter one divided list of `MatchRow`s. |
| `InviteStrip` | All pending league invites as a swipeable row of cards (Challenges) (who, league, stake, match, members; Decline / Join). Join is `secondary` since several show at once; joined cards turn soft-lime with "Open" → `/challenges/[id]` (the next step). Header has "See all" → `/invites`. |
| `InviteRow` | One invite as a row in the `/invites` list (one divided card): crests + match, members, coin limit. Join / ✕ resolve in place: drawn check "You're in …", or "Declined" with Undo. |
| `StreakFlame` | Hot streak (`streak ≥ HOT_STREAK`, 3): amber-soft pill, lucide `Flame` + count in display font. Amber because a streak is a boost. Pops in once, never loops. |
| `PredictionBuilder` | Your own predictions on a match (Predict tab of `/match/[id]` and `/challenges/[id]`). `ScorePicker` first (correct score), then type tiles (Win / draw, Goals, Corners, Yellow cards, Red card, Penalty) toggle rows into one divided slip; each row: options as soft-lime radio chips, a coin stake (numeric field + `STAKE_STEPS` chips, at least `PREDICTION_MIN_STAKE`), and what it wins (`payout()`). A challenge's `rules` can fix the stake ("set by Sara") and cap the total. Header status chip: dashed "Draft" → soft-lime "Locked in" (check) → "Locked at kickoff" (lock). One lime "Lock in N predictions · cost"; locking in shows a `role="status"` confirmation with a drawn check; over the cap / short of coins / unpicked → disabled with the reason (short adds "Ways to earn"). Locked slips stay editable until kickoff (secondary "Edit predictions"); after kickoff they read back ✓ Right / ✗ Wrong. |
| `ChallengeList` / `ChallengeRow` | Challenges as Joined · Invited · Expired `SegmentedTabs` over one divided card. Row: name (+ `BoostBadge`), match codes + time, who made it, entry, players, then your place / "Invite" / "Expired". Every row opens `/challenges/[id]` (your live one → `/play`). `ChallengeRow` is reused on Home. |
| `ChallengeGate` | An invite on its challenge page: the rules (entry, stake per prediction, cap, pool), secondary Decline + lime "Accept · entry". Accepting reveals the `PredictionBuilder` in place; declining leaves Undo. |
| `BoostBadge` | A big match (`match.boost`): amber-soft pill, lucide `Zap` + "2x" (amber: it's a boost). On `MatchRow` (amber "2x" over the day), challenge rows, Home's big matches, the scoreboard ("Wins pay 2x") and the builder. Boosts coins a right prediction wins, never points. |
| `LevelBar` | XP · Level · Badges strip under the live island on every dock tab (`app/(tabs)/layout.tsx`) → `/me#level`. Neutral fill, never lime. **Placeholder** until the gamification doc lands. |
| `FavouriteClubs` | Profile's "Your clubs": crest chips with ✕, "Add club" opens a sheet with a search field (name or code, clear ✕, "No club matches" empty state, result count announced) over the crest grid of `clubDirectory` (`aria-pressed`, soft-lime when picked). |
| `ShopPreview` | Home's shop card: full width, dotted, neutral; "Shop" + "Opening soon" over three real items with their amber coin prices. Links to `/shop`. Never lime, never after a loss or on a low balance. |
| `SegmentedTabs` | 2–4 filters with sliding lime pill. |
| `CoinBadge` / `Coin` / `CoinAmount` | Wallet pill. Coins are always amber with an "F". `CoinAmount` is a coin figure in a row: gains amber, spends neutral with a minus (an entry isn't a loss). |
| `StarterMissions` | First-week missions (15,000 over 7 days): progress, open rows first, done rows muted with the reason they paid. |
| `MatchTables` | "Two tables, same calls" card on a match: Free table (always open, top 3 get coins) and Coin table (your league's pool, or "Start a league"). Footer: entry never changes rank. `poolLine()` gives "winner takes 5,700". |
| `Shop` | Phase 2 "coming soon" shop: item rows → sheet saying it's not open yet, nothing charged, lime "Notify me". Fires `track()` events. |
| `NumberTicker` | Count-up for rewards. Starts from `from` on both server and client (hydration-safe), jumps to the value with reduced motion. |
| `SectionHeading` | Matchday section title (display, uppercase) + optional inline `meta` + one quiet text link outside the `<h2>`. Use for screen section headings on dock tabs. |
| `PitchMarkings` | Decorative pitch lines (`centre` / `box` / `none`) and optional `corners` (corner-flag arcs) for hero canvases. |
| `KitAvatar` | A player in a league table as a tiny shirt with their initial; yours is green. Used by `Standings`. |
| `MatchHero` | Home's match centre for the one fixture that matters now (your live league match, else the next big one): kit stripe, corner flags, crests facing off over a faint pool of each side's colour, score or kickoff on a scoreboard plate + countdown, competition, your league + place, the open question, then a matchday-ticket tear line (dashed, notched) above the stub holding the screen's one flat green CTA. |
| `LeagueBadge` | A friends' league as a competition roundel (clubs are shields, competitions are round), kit colours hashed from the name; `tone="silver"` = the division. On challenge rows, league cards, the challenge League tab and the leaderboard. |
| `Standings` / `RankCell` / `RankMove` | A real `<table>` leaderboard: gold/silver/bronze medal discs for 1–3, movement chevrons (shape + colour), `KitAvatar` shirt + name, `Right` (right/calls) and points; your row soft-lime with `aria-current`. `zones` draws Promotion / Drop zone lines; rows with a fixed `rank` that skip places get a gap row. `compact` for cards. |
| `LeagueCard` | Home's competition card: badge, match + players, your place in display numbers with `gapLine()` ("50 pts clear of Sara"), compact `Standings`, link to the league. |
| `DivisionCard` / `RankStrip` | Your weekly division: badge, week, place `8th of 30`, points to promotion (`toPromotion()`), and the whole division as ticks (promotion zone lime-tinted, drop zone short and red, you tall). Links to `/leaderboard`. `RankStrip tone="light"` sits on the silver Profile card. |
| `ResultCard` | Your latest result: full-time score, then +points (lime) · right/calls · your place (gold trophy when you won), and a right/wrong bar with the streak. Points only. |
| `AchievementBadge` | Medallion tile: gold tier (wins, promotions) in gold, standard on turf, locked dashed with a lock and what unlocks it. |
| `ScorePicker` | "Call the score" in `PredictionBuilder`: both sides with crests and a −/+ goal stepper (stacks vertically under 380px). First tap adds a `score` prediction to the slip; its stake lives in the slip row. |
| `FormBars` | Last-N results as bars (height + colour). `fill` stretches them across the width (Profile's recent-form card). |
| `FantasyUnlock` | Compact Home tile, a bit wider than `InviteTile` (it matters more). Locked must read as locked: dashed border (the "locked" card style), lock icon + "Fantasy locked", display `3/5`, and a row of tiny shirts (made = lime, popping in one after another; next = dashed soft-lime; rest = dark) with "N to go". Under 360px the words "locked" and "N to go" drop; lock + dashed border carry it. At full: solid soft-lime "Fantasy open". Links to `/fantasy`. |
| `InviteTile` | Compact Home tile: "Invites" + count over the senders' avatars ("Sara +2"). Links to `/invites`, where Join / Decline happen. |
| `ProgressRing` | Circular progress for compact spots. |
| `TeamCrest` | 3-letter code placeholder until real crests are licensed. |
| `LiveDot` / `LiveMinute` | Pulsing amber dot / "● LIVE 67'". |
| `EmptyState` | Dotted canvas, title, one line, one secondary action. |
| `Football` | The ball mark. `FootballPattern` (spins) + `FootballShade` (static light) for animation. Neutral, never lime. |
| `Splash` | Launch brand moment: ball drops, bounces, rolls into the wordmark as the first O (~2.6s). Reduced motion: static wordmark. |
| `SplashGate` | In the root layout: plays `Splash` on every app open (full page load, any route), never on in-app navigation. Page is `inert` until it lifts; `useSplashDone()` lets a screen hold its entrance animations until then. |

### Screen patterns (from the canvas)

- **Splash → Onboarding (`/welcome`):** the launch splash (from `SplashGate`), then 3 steps with a segmented progress bar, back button and wallet badge (ticks to 10,000 on claim). 1) Try one: dealt card stack; the sample question resolves to a right/wrong result; Continue is `secondary` until answered, then lime. 2) Pick clubs: crest tiles with `aria-pressed`, soft-lime when selected. 3) Claim: coin stack + ticking amount, the three numbered steps, lime "Claim 10,000 coins". Claiming or "Skip to Home" sets the `footon_onboarded` cookie. Links to `/` from here use `prefetch={false}` so a pre-cookie redirect isn't cached.
- **Onboarding (canvas):** dealt card stack on a dotted canvas with one real sample question; three steps as a single numbered row; lime CTA "Claim 10,000 coins" with an inset arrow; "Skip to Home" as a text link.
- **Home (matchday):** (sticky island + `LevelBar` from the tabs layout) → `MatchHero` (the one lime CTA: "Answer Q4 now" → `/play`, or "Make your predictions") → **Big fixtures · Wins pay 2x** (`MatchRow`s; "All matches" → `/live`) → **Your leagues** (`LeagueCard` for your live league, other joined leagues as `ChallengeRow`s) → `DivisionCard` → **Results** (`ResultCard` + your three latest `AchievementBadge`s, "Trophies" → `/me#achievements`) → two compact tiles (`InviteTile`, `FantasyUnlock`) → `ShopPreview`. Desktop: match column (hero, big matches, result) beside the competition column. No match → `EmptyState`.
- **Leaderboard (`/leaderboard`, from the division card and Profile):** floodlit header (silver `LeagueBadge`, week, `8th of 30`, points, to promotion, `RankStrip`, the rule line) → **Table** (`Standings` with zones) → **Friends' leagues** (each → its league table via `#league`). No lime CTA.
- **Section deep links:** `MatchCentre` opens the section named in the URL hash after mount (`/challenges/ch-3#league`, `/play#league`). Your challenges live on the Challenges tab and open predictions on the Predictions tab, not Home. Browsing every fixture is the Live tab's job; don't put the full match list back on Home.
- **Predictions (`/predictions`, its own dock tab):** title + "N matches open" → Open · Staked · Could win strip (display numbers, coins amber) → **Open · editable until kickoff** (one divided card, a group per match: crests, name, `BoostBadge`, "Edit until", secondary Edit pill → `/match/[id]`; each pick as a row with type icon, summary, stake → `payout()`) → **Settled** (✓ rows soft-lime with `+50 pts` and coins, ✗ rows muted with the stake) → "Predict another match" text link → `/live`. No lime CTA.
- **Create league:** close button, a live **invite ticket** (lime, notched, dashed tear line) that updates as you edit; name input, stake slider, mode switches, reward note, then `Copy` (secondary) + `Create and share` (lime).
- **Live tab (`/live`):** FotMob's Matches screen via `MatchDays`: title + "Live only" switch → day strip (Yesterday · **Today** · Tomorrow · dates) → one folding card per competition (your own matches live on Home, not pinned here). No lime CTA here: your live match row and the island's "Q4 open" already take you in. Your live match → `/play`; everything else → `/match/[id]`.
- **Match page (`/match/[id]`, focus mode):** same `MatchCentre` frame as live. Upcoming: **Predict** (`PredictionBuilder` with the one lime "Lock in", `MatchTables`, `CrowdPoll`) · **Preview** (`MatchInfo`, `TeamForm`, `MatchNews`) · Table · H2H. Finished: **Result** (your +points, streak, right/wrong bars, your resolved predictions, coins) · Facts · Stats · Table · H2H.
- **Challenge page (`/challenges/[id]`, focus mode):** `MatchCentre` titled with the league. **Predict** (invited → `ChallengeGate`, then the builder with the league's rules; joined → the builder; expired → a read-only note, nothing charged) · Chat (once you're in) · League (players, pool) · Match (preview or facts). Your league's live match redirects to `/play`.
- **Live match (`/play` for your league, `/match/[id]` for any other live match; focus mode, no dock):** `LiveMatch`. FotMob's flow (score always visible, everything one tap away in sticky section tabs), Footon's job: Predict is the first tab, and the question card is the first thing in it. Chat is its own tab, not a panel under the details.
- **Full time:** ticking `+450`, streak pill with lime "Next match 2x", podium (yours lime-soft, tallest), match-timeline of calls (lime filled dots = right, red rings = wrong), rematch chat replies, lime "Rematch with same friends".
- **Fantasy (`/fantasy`, was My team):** stats header (display 56), striped pitch with shirt tokens (selected = lime, captain = amber "C"), captain + transfers list, lime "Save lineup".
- **Create league:** entry slider uses `ENTRY_TIERS`; the pool preview under it; "Prediction stakes": a "Same stake for everyone" switch with `STAKE_STEPS` chips and a "Most one player can stake" cap slider (both shown on the ticket); the lime CTA carries the total cost (create + your entry). Short of coins → disabled "Need N more coins" + "Ways to earn".
- **Profile:** silver division card (`silver`, penalty-box lines, slight 3D tilt on hover) with score + `RankStrip` and "View leaderboard" → `/leaderboard`, recent-form card (win rate, won/lost/void, full-width `FormBars`), a Level card (`#level`, placeholder XP / badges), `FavouriteClubs`, amber boost tokens, achievement medallions (`#achievements`, `AchievementBadge`, "N of M"), collection list (locked rows muted with a lock).

## Economy (coins, points, prizes)

From the Footon economy doc. Numbers live in `lib/economy.ts`; mock state in `mock-data.ts`.

- **Three things never mix.** Points = skill (right calls only; rank and prizes read points only; show in lime/neutral, never with a coin). Coins = play money (amber; entries, leagues, moments, looks). Prizes = real things from sponsors by weekly/monthly rank. A right call shows `+50 pts`, never coins.
- **Two tables per match.** Free table always open (top 3 get 400/300/200, 2,000/week cap). Coin table = a friends' league pool, entry 500 / 1,500 / 2,500 (the cap). 5% of each pool burns; under 5 players the winner takes the rest, from 5 it's 70/30. Use `splitPool()`.
- **Coins are earned with a reason.** Starter coins come mission by mission (onboarding pays only mission one, 1,000); every coin row says why ("Watched to the end").
- **Never sell pressure.** No shop or purchase prompt after a loss or on a low balance, no fake timers, no "sold out". Short of coins → say how many and link to ways to earn (`/wallet`). The shop is reached from the Wallet header and Home's `ShopPreview` card, nowhere else.
- **Predictions carry a coin stake.** Each prediction costs a stake (the player's pick, at least `PREDICTION_MIN_STAKE`, or the challenge's fixed amount); a challenge can cap the total per player. A right one pays `payout()` = stake × `PAYOUT_MULTIPLIER` (2), ×`BOOST_MULTIPLIER` again on a big (`boost`) match, plus `POINTS_PER_RIGHT_CALL` points. Stakes and payouts are coins (amber); rank still reads points only.
- **Never sell advantage.** Nothing that earns points (the 2x boost) is for sale; no mystery boxes; coins can't be cashed out or sent. Packs are 18+ with a monthly limit.
- **Wallet (`/wallet`):** balance + Points/Coins/Prizes strip, first-week missions, this week's mission and caps (amber bars: allowances), ways to earn, activity, the rules line.
- **Shop (`/shop`, Phase 2):** real items and prices, no payment. Tap → "Coming soon" sheet → "Notify me". We measure opens, item taps, notify taps.

## Adapting shadcn components

When you add a new shadcn component:
1. Replace neutral colour classes with tokens: `bg-background` stays, but primary actions → `bg-primary text-primary-foreground`; popovers → `bg-surface-2 border-line-strong`; muted text → `text-muted-foreground`.
2. Bump radii to this scale (shadcn defaults are too small).
3. Heights: 44px default controls, 56px for screen CTAs.
4. Add `active:scale-95 ease-spring` to anything pressable.
5. Keep Radix accessibility props intact; don't swap Radix parts for divs.

## Copy and content

- Short, spoken, a little cheeky: "Call the next moment.", "You will miss that one.", "Rematch with same friends".
- Questions end with the minute: "Yellow card before 80'?". Use the typographic prime-style apostrophe in JSX as `&apos;`.
- Numbers: thousands separators (`10,000`), no decimals for coins, ordinals for ranks (`2nd`).
- Never invent stats in UI. Unknown values come from data or show an explicit placeholder.
- No emoji in UI. Icons are lucide.

## Accessibility checklist (every PR)

- Real `<button>`, `<a>`/`Link`, `<input>` + `<label>`; no clickable divs.
- Icon-only buttons have `aria-label`; decorative SVGs `aria-hidden`.
- Charts/visual data (`FormBars`, timelines, rings) have `role="img"` + a text `aria-label`.
- Live-updating text uses `aria-live="polite"`.
- Focus visible: `focus-visible:ring-[3px] ring-ring/60`.
- Works at 320px wide; no horizontal scroll.
- Future RTL (Persian) support: prefer logical utilities (`ps-*`, `pe-*`, `ms-*`, `start-*`) in new code, and avoid hard-coded left/right where direction matters.

## Don'ts

- ❌ White or light-grey filled buttons.
- ❌ Two lime CTAs in the same view (Yes/No pair excepted).
- ❌ Lime for coins or live; amber for wins; gold for coins or actions.
- ❌ Pitch textures (`floodlight`, `bg-turf`, `PitchMarkings`) on ordinary list cards.
- ❌ Gradients as backgrounds, glows, blobs, emoji, sparkle icons.
- ❌ `subtle` grey for small body text.
- ❌ New colours, fonts or radii without adding a token here and in `globals.css`.
- ❌ `"use client"` on whole pages.
- ❌ `transition: all`, layout-thrashing animations, motion without a reduced-motion path.
