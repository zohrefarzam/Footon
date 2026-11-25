# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Quick reference (not covered above)

- Single test: `npx vitest run src/path/to/file.test.ts` (add `-t "name"` to filter). `npm run test:watch` for watch mode.
- Lint is plain `eslint` (`npm run lint`). Type-check with `npx tsc --noEmit`.
- Env: copy `.env.example` to `.env.local`. With `NEXT_PUBLIC_GAMIFICATION_API` unset, the in-memory mock server runs and no login is required. With it set, `src/proxy.ts` redirects signed-out players to `/login`.
- `NEXT_PUBLIC_UNLOCK_ALL=1` opens every level-gated feature (Fantasy, weekly quests, shop items) outside production builds. If something that should be locked shows as open, check this first (see `src/lib/gamification/unlocks.ts`).
- Only auth and gamification hit the real backend; every other screen reads `src/lib/mock-data.ts`.
- Brand and Winky mascot masters live in `docs/brand/`.
