# Footon

Predict the match live with your friends. Mobile-first Next.js app.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

| Route | Screen |
| --- | --- |
| `/` | Home (live island, form, matches, invite) |
| `/play` | Live match (focus mode: question card, standings, chat sheet) |
| `/league/new` | Create league (live invite ticket, stake slider, modes) |
| `/team`, `/me` | Placeholders: next screens to build from the canvas |
| `/styleguide` | Tokens and components |

## Design system

Read **[AGENTS.md](./AGENTS.md)**: colour roles, type, motion, components and rules.
Tokens live in `src/app/globals.css` (Tailwind v4 `@theme`). UI primitives are shadcn/ui
(`components.json`) restyled to Footon tokens; product components are in `src/components/footon`.

Add shadcn components with `npx shadcn@latest add <name>`, then restyle them per AGENTS.md.
