# Lucky Fan v2: plan for the new IA and screens

## Context
The product brief (in Persian) redesigns six areas: Home, the bottom nav, Challenges/Leagues, Match details, Fantasy and Profile. The aim is to fit 3–4 matches above the fold, add Polymarket-style quick calls and FOMO cues, use a 4-tab nav, give invites their own hub, add a tabbed match page with preset-phrase banter, show Fantasy as a "coming soon" tease, and add a profile with history.

The codebase already has most of the building blocks: `MatchRow`, `LiveIsland`, `InviteStrip`, `QuestionCard`, `LiveFocus`, `FantasyUnlock`, `Pitch`, onboarding and `CreateLeagueForm`. This plan extends those under AGENTS.md rather than rebuilding them.

**Branch:** create `claude/footon-v2-ia` from the current `claude/practical-gauss-ajfx52`, so it includes the Fantasy-unlock work, and push with `git push -u origin claude/footon-v2-ia`. Make one commit per phase below.

**Your decisions:**
- **Chain + lock:** bring back the chain and padlock on the Fantasy banner and the Fantasy page.
- **Nav icons:** a custom SVG nav icon set.
- **Chat:** preset phrases plus in-house stickers; the GIF tab is a placeholder.

AGENTS.md is updated to match (Phase 0).

## Design-system calls (how the brief maps onto the rules)
- **Quick calls on match cards vs "one lime thing per view":**
  - Collapsed rows show Yes/No odds as `soft`/`secondary` chips.
  - Only one card expands at a time (accordion). Its confirm button, "Call Yes · 100", is the single lime CTA.
- **10x matches:** amber (`live` role = boosts/money).
  - Badge: `Badge variant="live"` with lucide `Flame` + display "10x".
  - The row's centre box gets an amber-soft ring.
  - It must differ from `StreakFlame` by its "10x" label and its position (by the caption, not the "you" column).
- **FOMO on live rows:**
  - Amber minute, plus "7/10 calls" as a tiny 10-tick bar.
  - "Q8 closes 0:38" uses `text-shimmer`.
  - Countdowns use `aria-live="polite"`.
- **Expand/collapse:**
  - Per card, plus a global "Compact / Detailed" toggle (icon button next to the filter).
  - The toggle is remembered in `localStorage` with try/catch.
- **Invites badge:**
  - A bell icon with a count (`+3`) in the `LiveIsland` header, linking to `/challenges#invites`.
  - The `InviteStrip` moves off Home to free the first fold.
- **Header widget:** `LiveIsland` right side becomes coins + "N active" calls. It stays the only wallet surface.
- **Glass:** still only on the dock and bottom sheets. The invite modal and achievement popup are bottom sheets, so glass is allowed there.

## Phase 0: groundwork
- `AGENTS.md`:
  - New routes: `/challenges`, `/challenges/new`, `/live`, `/fantasy`; `/me` sections.
  - 4-tab dock.
  - Exception to "lucide only" for `components/footon/nav-icons.tsx`.
  - Allow chain/padlock on `FantasyUnlock` + the Fantasy locked state only.
  - New component rows.
- `src/lib/mock-data.ts`: extend types and keep existing shapes.
  - `Match`:
    - `boost?: number`
    - `market?: { id; question; yesShare; closesIn?: number; stakes: number[] }`
    - `progress?: { made: number; total: number }`
    - `events` kinds widened to `goal | yellow | red | sub | var`
    - `lineups?`, `h2h?`, `table?`, `crowd?: { home; draw; away; topScore }`
  - `Challenge` type (`id, name, matchId, entry, members, status, mine`), plus `challenges[]`.
  - `PredictionRecord` type (`question, match, stake, result: "won"|"lost"|"void", delta`), plus `history[]`.
  - `profile` = `{ level, xp, xpNext, streak, best, referral: { code, bonus, joined } }`, plus `favoriteTeam`.
  - `chatPresets` (grouped: Banter / Ref / Goal) and `stickers` ids.
  - `achievements` moves here from `me/page.tsx`.
- Add restyled shadcn **dialog/sheet** (Radix Dialog) and **tabs** primitives in `components/ui`:
  - `bg-surface-2 border-line-strong`, `rounded-3xl`, glass on the sheet only.
  - Keep Radix a11y.
- Add a `/styleguide` section for each new component.

## Phase 1: bottom nav (4 tabs)
- `src/components/footon/nav-icons.tsx`: 4 custom SVGs, each with `active` (filled) and inactive (stroke 1.8) states, `currentColor`, `aria-hidden`.
  - Home: pitch-house.
  - Challenges: crossed boots/trophy.
  - Live: ball with signal arcs.
  - Profile: shirt-avatar.
- `src/components/footon/dock.tsx`:
  - `grid-cols-4`; remove the centre lime "+" (create moves into Challenges).
  - Active item = filled icon + white label + lime dot, as now.
  - Live tab shows a pulsing amber `LiveDot` badge when a match is live.
  - Hit area ≥ 48px.
- Route moves:
  - Move `(tabs)/team` to `src/app/fantasy/` (out of the dock).
  - Add `(tabs)/challenges` and `(tabs)/live`.
  - Redirects in `next.config` `redirects()`: `/team` → `/fantasy`, `/league/new` → `/challenges/new`.

## Phase 2: Home
- `src/app/(tabs)/page.tsx`: title → `MatchList` → `FantasyUnlock`. `InviteStrip` moves to Challenges.
- `src/app/(tabs)/layout.tsx` + `live-island.tsx`:
  - New props: `activeCalls`, `invites` (count).
  - Right cluster: bell-with-count `Link` (`aria-label="3 new invites"`) + coin pill with a small "2 active" sublabel.
- New `components/footon/match-card.tsx` (client) wraps `MatchRow` as the collapsed state:
  - Expanded state springs open (`motion` height via `layout`, reduced-motion path) and shows:
    - The `market` question.
    - A Yes/No crowd split bar with percentages; reuse the bar logic from `QuestionCard`.
    - Stake chips 100 / 500 (soft when picked).
    - One lime confirm button.
    - Then a locked state with the drawn check, reusing the existing `pathLength` pattern.
  - Polymarket hint while collapsed: right column shows `Yes 58%` when `!you` instead of the chevron.
  - Live FOMO strip: 10-tick progress + countdown.
  - 10x: boost badge + amber ring.
- `match-list.tsx`:
  - Renders `MatchCard`s; accordion state (`openId`); global density toggle.
  - Sorts the favourite team first, marked with a small star — one-off neutral, not lime.
- `fantasy-unlock.tsx` banner:
  - Thin SVG chain wrapping the card corner to corner, with a hanging padlock.
  - On unlock the chain falls (spring + opacity) and the padlock opens.
  - The segmented bar gains an amber "fire" state on the last segment when one prediction away (Flame icon + `animate-live-pulse` only on that segment, since it is genuinely near).
  - Add `data-cta="fantasy-banner"` for click measurement.
- Fold check at 390×844: island 54 + title 40 + tabs 44 + 4 rows × 60 ≈ 4 matches visible.

## Phase 3: Challenges / Leagues (`/challenges`)
- Page sections:
  - Header "Challenges" + lime "New challenge" (the only lime).
  - **Invites** (`id="invites"`): list card of `InviteRow`s.
    - Each row: avatar, from, league, entry coins, match, members.
    - Icon buttons: Accept (✓, `soft`) and Reject (✗, `ghost`), both with `aria-label`.
    - Folds out with the same exit animation as `InviteStrip`.
    - `InviteStrip` is kept as the source of the row logic and refactored into an `InviteRow` + list.
  - **My challenges:** `SegmentedTabs` Active / Created / Finished over one divided list (`ChallengeRow`: name, match, entry, members, your rank).
- `components/footon/invite-sheet.tsx` (client):
  - Bottom-sheet dialog on entry when unseen invites exist.
  - Shows up to 3 invites with Accept/Reject and "See all".
  - The "seen" flag is the cookie `footon_invites_seen=<latest id>`, set when it closes.
  - Focus trap and Escape via Radix.
- `/challenges/new` wizard (move `league/new/create-league-form.tsx` here):
  - Segmented progress bar like onboarding.
  - Steps:
    1. Pick match (MatchRow list, radio).
    2. Entry coins (existing slider + stops) + rules switches.
    3. Friends: avatar multi-select with `aria-pressed` + the share ticket (existing invite ticket) with `Copy` (secondary) + lime `Create and share` (Web Share API, falling back to copy).
  - Back/Next; the lime CTA is only on the current step.

## Phase 4: Live tab + match details
- `/live` (tab):
  - Live matches as `MatchCard`s.
  - "Your open calls" list (question, stake, resolves at, shimmer "Waiting for 75'…").
  - Lime "Play LIV v MCI" → `/play`.
- `/match/[id]`:
  - Stop redirecting live matches.
  - Header scoreboard (existing).
  - A restyled Radix `Tabs` with a horizontal-scroll underline tab bar, sticky under the header: **Predictions · Timeline · Stats · Lineups · Chat**. The default tab is Predictions (live/upcoming), or Timeline when finished.
  - **Predictions:**
    - Live: `QuestionCard`. Upcoming: `PrematchCalls`. Finished: the current result card.
    - A crowd W/D/L 3-segment bar (`role="img"`) + "Most called: 2–1".
  - **Timeline:**
    - New `components/footon/match-timeline.tsx`: vertical list, home events start-aligned, away end-aligned, minute in display font.
    - Custom event icons in a new `components/footon/event-icons.tsx`: ball, yellow/red card rects, sub arrows, VAR. Card colours are factual, so this is a documented allowed exception.
    - `aria-live` for live.
  - **Stats:** mirrored bars (shots, on target, fouls, corners, offsides, possession), plus a head-to-head W/D/L row and a mini league table with both teams highlighted. Neutral colours, and the leader's value in foreground.
  - **Lineups:**
    - Extract the striped `Pitch` from `fantasy/pitch.tsx` into `components/footon/pitch.tsx`, parameterised by formation + players.
    - Show both teams (toggle home/away with `SegmentedTabs`).
  - **Chat:**
    - Extract `ChatPanel` from `live-focus.tsx`.
    - Replace the free-text input with `components/footon/quick-reply-palette.tsx`: a sheet with tabs Phrases (grouped chips) / Stickers (grid of in-house SVG stickers, `components/footon/stickers.tsx`, ~8: VAR screen, red card, golden boot, crying ball, etc.) / GIF ("Coming soon" empty state).
    - Keep the soft "+ ask" button.
    - `LiveFocus` on `/play` uses the same palette.

## Phase 5: Fantasy (`/fantasy`, disabled MVP)
- `components/footon/player-card.tsx`: a cartoon card.
  - SVG chibi character: head + hair shape, shirt in team colours with number, no photos.
  - Rarity frame; captain "C" amber badge; `size` sm/md.
- `components/footon/pitch.tsx` (shared) renders `PlayerCard` tokens in formation; captain = #7.
- Locked state over the page:
  - Pitch + cards at reduced opacity.
  - Chain across with a padlock; `FantasyUnlock` progress; "Coming soon" copy; the "Save lineup" CTA is disabled (`aria-disabled`).
- `components/footon/achievement-sheet.tsx`: bottom-sheet popup "Achievement unlocked" (icon tile, name, +coins `NumberTicker`, lime "Nice"), triggered from mock data on first visit (cookie).

## Phase 6: Profile (`/me`)
- **Dashboard row:**
  - Coins (amber, display).
  - Level badge + XP `Progress`.
  - Streak card (current / best, `StreakFlame`).
  - The existing silver league card is kept.
- **Referral card:** "Invite a friend, both get +500" with the invite code (`font-mono`), Copy (secondary), joined count.
- **History:** `SegmentedTabs` Predictions / Challenges.
  - `components/footon/history-row.tsx`: ✓/✗/– icon (not hue alone), question + match, stake, delta (`+240` lime / `−100` loss, display font).
  - Grouped by day in one divided card.
- **Settings card** (`CardRow`s): Favourite team row (crest + name) → `/me/team` page.
  - Extract `ClubPicker` from `welcome/onboarding-flow.tsx` into `components/footon/club-picker.tsx`, reused by onboarding and settings.
  - Saves the cookie `footon_fav`, which Home sorting reads (server-side `cookies()`).
- **Onboarding:** "Pick clubs" step becomes "Pick your team" (single favourite, others optional) and sets `footon_fav`.
- Remove the Team tab references; link Fantasy from Profile.

## Critical files
`src/components/footon/{dock,live-island,match-row,match-list,fantasy-unlock,invite-strip,live-focus}.tsx`, `src/app/(tabs)/{layout,page}.tsx`, `src/app/(tabs)/me/page.tsx`, `src/app/match/[id]/page.tsx`, `src/app/(tabs)/team/*` → `src/app/fantasy/*`, `src/app/league/new/*` → `src/app/challenges/new/*`, `src/app/welcome/onboarding-flow.tsx`, `src/lib/mock-data.ts`, `src/proxy.ts` (keep matching), `next.config.*`, `AGENTS.md`, `src/app/styleguide/page.tsx`.

## Verification
- After each phase, run `npm run lint`, `npx tsc --noEmit` and `npm run build`; all must pass.
- Playwright script (scratchpad) on `npm run dev`:
  - Screenshots at 390×844 and 320×640 of `/`, `/challenges`, `/challenges/new` (each step), `/live`, `/match/liv-mci` (each tab), `/match/bha-eve`, `/fantasy` and `/me`.
  - Assert no horizontal scroll (`scrollWidth <= innerWidth`).
  - Count the visible `MatchRow`s on Home above 844px (≥ 4).
  - Assert at most one visible `.bg-primary` button per view (Yes/No excepted).
  - Check the invite sheet opens once and not after the cookie is set.
  - Check the dock has 4 links with `aria-current`.
  - Emulate reduced motion to confirm there are no infinite animations except the live pulse.
- Check `/styleguide` visually for the new primitives.
