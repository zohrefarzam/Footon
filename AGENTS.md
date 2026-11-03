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
  app/                    routes (/, /welcome, /play, /match/[id], /challenges/new, /styleguide)
    (tabs)/               /, /challenges, /live, /me, /fantasy — layout holds the sticky LiveIsland and the Dock (persist across tabs)
    globals.css           ALL design tokens, utilities, keyframes
  components/
    ui/                   shadcn primitives, restyled (button, badge, card, input, label,
                          switch, slider, avatar, separator, progress, dialog, tabs)
    footon/               product components (app-shell, dock, live-island, question-card,
                          match-row, segmented-tabs, match-centre, live-match, crowd-poll,
                          match-facts, match-stats, match-lineups, match-table, league-chat, coin, number-ticker, form-bars,
                          progress-ring, team-crest, live, empty-state, match-filter, match-list, invite-strip, streak,
                          prematch-calls, fantasy-unlock, football, splash, splash-gate, nav-icons)
  lib/
    utils.ts              cn()
    mock-data.ts          typed mock data mirroring the canvas — replace with API, keep types
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

## Colour

All colours are CSS variables on `:root` in `globals.css`, exposed as Tailwind colours (`bg-surface`, `text-live`, `border-line-strong`…). **Never hard-code a hex in a component** if a token exists. A few one-off greys (e.g. `#27272a` tracks, `#3a3a42` avatar fill) are allowed inline; promote one to a token the second time you need it.

### Neutrals (zinc ladder, darkest to lightest)

| Token | Hex | Use |
| --- | --- | --- |
| `background` | `#09090B` | App ground |
| `surface` | `#111114` | Cards, list groups, inputs |
| `surface-2` | `#18181B` | Raised: question card, pills, dock, coin badge |
| `surface-3` | `#232328` | Secondary buttons, chat bubbles |
| `line` | `#1E1E23` | Hairline border and dividers on `surface` |
| `line-strong` | `#2E2E35` | Borders on raised elements |
| `foreground` | `#FAFAFA` | Primary text |
| `muted-foreground` | `#A1A1AA` | Secondary text. Passes 4.5:1 on every surface |
| `subtle` | `#71717A` | **Decoration / ≥24px text only**: placeholders, axis labels, "vs". Fails AA for small text |
| `nav-muted` | `#8E8E97` | Inactive dock items |

### Colour roles (accents)

| Role | Token | Means | Use it for | Never for |
| --- | --- | --- | --- | --- |
| **Primary / win / you** | `primary` `#C8F542` on `primary-foreground` `#0B0F02` | "Do this", "you got it right", "this is you" | Main CTA, Yes, win bars, correct calls, your rank, active dock dot, active segmented pill | Decoration, headings, links, more than one CTA |
| Primary soft | `primary-soft` + `primary-line` + `text-primary` | Selected / on | Selected chips, quick replies, "ask" button, your standings tile, toggled states | Main actions |
| **Live** | `live` `#FFB547`, `live-soft`, `live-foreground` | "Happening now", "time", "money" | LIVE minute, pulsing dot, countdown ring, coins, boosts | Wins, buttons, selection |
| **Loss** | `loss` `#F87171`, `loss-soft` | Wrong / lost | Loss bars, wrong calls, destructive actions | Errors that aren't the user's fault (use neutral copy) |
| Pitch | `pitch`, `pitch-2`, `pitch-line` | The field | Team screen pitch only | Anywhere else |
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

Rules: no font sizes under 11px. Use `tabular-nums` (`font-display` already looks tabular) for anything that ticks. Large Geist headings get negative tracking; Barlow never does.

## Shape, spacing, elevation

- **Radius scale:** chips/pills `rounded-full`; small buttons `rounded-sm` (10px); buttons/inputs `rounded-md` (14px); large buttons `rounded-lg` (16px); cards `rounded-xl` (18px) to `rounded-2xl` (22px); sheets/dock `rounded-3xl` / 24–28px. Nested radius = outer radius − padding.
- **Spacing:** 4px grid. Screen gutter 20px (`px-5`). Vertical rhythm between screen sections 18px (`gap-[18px]` in `AppShell`). Card padding 16px; row padding `px-4 py-3.5`.
- **Touch targets** ≥ 44px (`size="default"` and up). `sm` (32–36px) only for secondary chips inside a row.
- **Elevation:** flat by default (borders, not shadows). Shadows only on floating things: question card (`variant="raised"`), dock, live island.
- **Width:** mobile column, `max-w-[430px]`, centred. Design at 390×844.

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
- **Progress**: lime on `#27272a`.
- **Dialog**: Radix Dialog. `variant="sheet"` (default) is a glass bottom sheet with a grabber, for invites, achievements and the quick-reply palette; `variant="center"` for short confirmations. Always a `DialogTitle`; the close button is built in.
- **Tabs**: Radix Tabs as a scrollable underline bar (lime underline on the active tab) for *sections* of one screen, like the match page. For 2–4 *filters* over one list use `SegmentedTabs`.

### Product (`components/footon`)

| Component | Purpose / rules |
| --- | --- |
| `AppShell` | Mobile column. `dock={false}` for focus mode (live match, create flow); otherwise it reserves room for the dock, which `app/(tabs)/layout.tsx` renders once. |
| `Dock` | Floating glass nav, 4 tabs: Home · Challenges · Live · Profile, with the `nav-icons` set. Active item: filled icon + white label + lime dot. The Live tab carries a pulsing `LiveDot` while a match is on. No centre "+": creating lives on the Challenges screen. Fantasy and favourite team are not tabs (Fantasy is reached from its Home card and Profile; favourite team lives in Profile settings). |
| `LiveIsland` | Sticky top pill on every dock tab, rendered once by `app/(tabs)/layout.tsx`. Left: live minute, score and the open question (lime `Q4 open` chip, soft-lime `Q4 · Yes` once answered); tap to expand over the page and answer in place. Right: the wallet (coins → `/me`). Collapses on scroll, outside tap or Escape. With no live match it shows only the wallet. Pages don't render their own coin badge. |
| `QuestionCard` | The live question. Yes/No → crowd split + drawn check + shimmer. Timer ring is amber. `compact` = one-row widget. |
| `MatchCentre` | Match page frame (after FotMob): sticky top bar (back · title) → dotted scoreboard that scrolls away (the top bar then crossfades to the compact score + live minute) → sticky underline `Tabs` for sections. Sections arrive as server-rendered nodes; only the frame is client. |
| `LiveMatch` | A live match in `MatchCentre`. Scoreboard: xl crests, scorers under each name, red-card glyphs, display score, `LiveMinute`, match clock bar. Sections: **Predict** (first, amber dot while a question is open) · Chat · Facts · Stats · Lineups · Table · H2H; a section only shows when there's data. With your league: Predict = `QuestionCard` → league card (standings tiles, "N of M asked", your calls right, streak, lime `+points`) → `CrowdPoll`. Without: `CrowdPoll` + a dashed "Start a league" card (the one lime CTA). |
| `CrowdPoll` | "Who wins?" 1 · X · 2 poll with the total votes. The split stays hidden until you vote, then each choice fills to its share; yours soft-lime. Free, no coins. On live and upcoming match pages. |
| `MatchFacts` | Event timeline, newest first: minute pill in a centre column, home events on the start side, away on the end side; goals carry the running score; "Half time" and "Kick-off" rules. Icons: `Football` (goal), booking-card glyphs, lucide `ArrowRightLeft` (sub), `MonitorPlay` (VAR). |
| `MatchStats` | value · label · value rows with a split bar; the side ahead is bright, the other dims. Neutral, never lime. |
| `MatchLineups` | `SegmentedTabs` between the two XIs; divided list with the shirt number in display font and the position in mono. No pitch (that colour belongs to Fantasy). |
| `MatchTable` / `HeadToHead` | Table rows around the match (the two teams raised on `surface-2`, not coloured); last meetings as three display numbers over a split bar. |
| `LeagueChat` | League chat as a match section: who's watching, thread (yours right, soft-lime), a friend's question as an inline Yes/No card, quick reactions and the composer pinned to the bottom. |
| `MatchRow` | One-line scoreboard row (~60px) inside a list card: home name + `xs` shield · centre box (score or kickoff, with amber live minute / day / FT under it; amber-soft while live) · shield + away name · "you" column (lime `+points` and a `StreakFlame` for a hot streak, or calls made before kickoff; chevron if you're not in). Every row links: your live match → `/play`, everything else → `/match/[id]`. Names become 3-letter codes under 360px. |
| `MatchList` | Now/Today/Upcoming `SegmentedTabs` that actually filter one divided list of `MatchRow`s. |
| `InviteStrip` | All pending league invites as a swipeable row of cards (Challenges) (who, league, stake, match, members; Decline / Join). Join is `secondary` since several show at once; joined cards turn soft-lime. Header has "See all" → `/invites`. |
| `InviteRow` | One invite as a row in the `/invites` list (one divided card): crests + match, members, coin limit. Join / ✕ resolve in place: drawn check "You're in …", or "Declined" with Undo. |
| `StreakFlame` | Hot streak (`streak ≥ HOT_STREAK`, 3): amber-soft pill, lucide `Flame` + count in display font. Amber because a streak is a boost. Pops in once, never loops. |
| `PrematchCalls` | Pre-match questions on `/match/[id]`, each with a Yes/No toggle (soft-lime when picked) and one lime "Lock in N calls". |
| `SegmentedTabs` | 2–4 filters with sliding lime pill. |
| `CoinBadge` / `Coin` | Wallet pill. Coins are always amber with an "F". |
| `NumberTicker` | Count-up for rewards. |
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
- **Home:** (sticky island from the tabs layout) → "Your matches" → one row of two compact tiles (`InviteTile` → `/invites`, `FantasyUnlock` → `/fantasy`) → segmented filter → one card of one-line scoreboard rows → dock. The match list gets the screen; keep anything else on Home tile-sized.
- **Match (`/match/[id]`, focus mode):** back + competition; dotted scoreboard (xl crests, display kickoff or score). Upcoming → `PrematchCalls`. Finished → "You scored +240", a `StreakFlame`, right/wrong bars (tall lime vs short red) and "5 of 6 calls right".
- **Create league:** close button, a live **invite ticket** (lime, notched, dashed tear line) that updates as you edit; name input, stake slider, mode switches, reward note, then `Copy` (secondary) + `Create and share` (lime).
- **Live tab (`/live`):** FotMob's live filter. "N matches on now", then folding groups (`<details>` cards with a header row: live dot, name, count): **Your leagues** pinned first with the lime "Play LIV v MCI", then one group per competition, then "Later today". Your live match → `/play`; any other → `/match/[id]`.
- **Live match (`/play` for your league, `/match/[id]` for any other live match; focus mode, no dock):** `LiveMatch`. FotMob's flow (score always visible, everything one tap away in sticky section tabs), Footon's job: Predict is the first tab, and the question card is the first thing in it. Chat is its own tab, not a panel under the details.
- **Full time:** ticking `+450`, streak pill with lime "Next match 2x", podium (yours lime-soft, tallest), match-timeline of calls (lime filled dots = right, red rings = wrong), rematch chat replies, lime "Rematch with same friends".
- **Fantasy (`/fantasy`, was My team):** stats header (display 56), striped pitch with shirt tokens (selected = lime, captain = amber "C"), captain + transfers list, lime "Save lineup".
- **Profile:** silver league card (light zinc, dotted, slight 3D tilt on hover) with score + 30-tick rank strip, recent-form card (win rate, won/lost/void, full-width `FormBars`), amber boost tokens, achievement tiles, collection list (locked rows muted with a lock).

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
- ❌ Lime for coins or live; amber for wins.
- ❌ Gradients as backgrounds, glows, blobs, emoji, sparkle icons.
- ❌ `subtle` grey for small body text.
- ❌ New colours, fonts or radii without adding a token here and in `globals.css`.
- ❌ `"use client"` on whole pages.
- ❌ `transition: all`, layout-thrashing animations, motion without a reduced-motion path.
