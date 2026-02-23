# Lunch Dice — Implementation Plan

## Overview

Migrate from the existing Create React App skeleton to a full Next.js 15 application with Neon Postgres backend, deployed on Vercel.

---

## Phase 1 — Project Bootstrap

**Goal:** Replace CRA with a clean Next.js 15 project, set up tooling.

Steps:
1. Delete CRA files (`src/`, `public/`, `package.json`, config files)
2. Initialize Next.js 15 with App Router, TypeScript, Tailwind CSS
3. Install dependencies:
   - `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless` — database
   - `framer-motion` — animations
   - `nanoid` — group ID generation
4. Set up Tailwind with a casino dark theme config (custom colors: near-black, felt-green, gold, cream)
5. Create `.env.local` with `DATABASE_URL` placeholder
6. Verify `npm run dev` works

---

## Phase 2 — Database Schema & Migrations

**Goal:** Define all tables and get them created in Neon.

Steps:
1. Create `lib/db.ts` — Drizzle client using `@neondatabase/serverless`
2. Create `lib/schema.ts` — define three tables:
   - `groups` (id varchar(16), name, created_at)
   - `players` (id uuid, group_id, name, created_at)
   - `sessions` (id uuid, group_id, played_at)
   - `session_players` (id uuid, session_id, player_id, price float, rolled_score float)
3. Configure `drizzle.config.ts`
4. Run `drizzle-kit push` to create tables in Neon
5. Create Vercel Postgres (Neon) integration and set `DATABASE_URL` in Vercel environment

---

## Phase 3 — API Routes

**Goal:** Minimal backend working and testable.

Implement in order:

1. `POST /api/groups` — generate nanoid, insert group, return `{ id, name }`
2. `GET /api/groups/[id]` — return group name + full roster
3. `POST /api/groups/[id]/players` — insert player into roster, return player
4. `POST /api/groups/[id]/sessions` — insert completed session + all session_players in one transaction

Helper: `lib/algorithm.ts` — export `computeScore(price: number): number`

---

## Phase 4 — Local Storage Hook

**Goal:** Persist and retrieve visited groups client-side.

1. Create `hooks/useLocalGroups.ts`:
   - Read/write `localStorage` key `groups` (array of `{ id, name, lastVisited }`)
   - `addGroup(id, name)` — upsert, update `lastVisited`
   - `getLastGroup()` — return entry with most recent `lastVisited`
   - `getAllGroups()` — sorted by `lastVisited` descending

---

## Phase 5 — Landing Page & Group Creation

**Goal:** First-time user can create a group; returning user is auto-redirected.

1. `app/page.tsx`:
   - Client component
   - On mount: check localStorage, if groups exist → `router.push('/g/[lastId]')`
   - Otherwise: render landing UI (app name, "Create new group" button)
   - "Create new group" → name input → POST `/api/groups` → save to localStorage → redirect to `/g/[id]`
2. Basic layout shell (`app/layout.tsx`) with casino dark background and global font setup

---

## Phase 6 — Group Page Shell & Header

**Goal:** `/g/[id]` renders with header and group switcher.

1. `app/g/[id]/page.tsx` — server component that fetches group name + roster, passes to client component
2. `components/Header.tsx`:
   - Left side: Share button (copies URL to clipboard), History link (placeholder)
   - Right side: group switcher dropdown
3. `components/GroupSwitcher.tsx`:
   - Reads groups from localStorage, highlights current group
   - "Create new group" and "Join with a link" options
4. On page load: call `addGroup(id, name)` to save/update localStorage

---

## Phase 7 — Setup Phase UI

**Goal:** Users can build today's player list entirely in local React state.

1. `components/PlayerCard.tsx` — setup variant:
   - Name, price input (empty, required), remove button
   - Probability bar (computed client-side from all current prices)
2. `components/AddPlayerPicker.tsx`:
   - Lists roster members not yet in today's session (name + empty price input)
   - "New person" form at bottom (name + price)
   - On confirm of new person: POST to add to roster, then add to local state
   - On confirm of existing person: add to local state only (no API call)
3. Setup state in `app/g/[id]/page.tsx` (client component):
   - Local state: `players: { playerId, name, price }[]`
   - Show probability bars + "Start Rolling" button only when ≥ 2 valid prices
4. "Start Rolling" → transition local state to `rolling`

---

## Phase 8 — Rolling Phase UI

**Goal:** Each player rolls their die; all state is local.

1. `components/Die.tsx` — 3D CSS die:
   - Idle state: static face
   - Rolling state: Framer Motion tumble animation (~1.5s)
   - Landed state: static face (random 1–6, decorative)
2. `components/PlayerCard.tsx` — rolling variant:
   - Shows die component
   - Click to roll → run `computeScore(price)` → update local state
   - Visual states: waiting / in-danger (red glow) / safe (green dim)
   - Score shown (4 decimal places) after rolling
3. Derive each card's visual state from local state:
   - Find current minimum `rolledScore` among rolled players
   - Player with minimum = `in-danger`; others who rolled = `safe`; not yet rolled = `waiting`
4. When last player rolls:
   - Transition local state to `complete`
   - Fire-and-forget POST to `/api/groups/[id]/sessions` to persist the completed session

---

## Phase 9 — Result Phase UI

**Goal:** Dramatic announcement when last player rolls.

1. Payer card transforms: red flood, pulsing glow, "PAYS — $X.XX" label, total bill
2. All other cards dim to grey
3. Framer Motion confetti burst (gold card suits or coins)
4. "New Game" button → navigate to `/g/[id]` → React state resets to `setup`

---

## Phase 10 — Polish & Deployment

**Goal:** Production-ready on Vercel.

1. Responsive layout (mobile-first, thumb-friendly roll buttons)
2. Loading states on API calls (group fetch, roster add)
3. Validate price inputs (must be > 0, numeric)
4. Handle edge cases:
   - Group ID not found → 404 page
5. Connect Vercel project to GitHub repo
6. Set `DATABASE_URL` in Vercel environment variables
7. Deploy and test on mobile

---

## File Structure

```
/app
  layout.tsx                   global layout, fonts, dark background
  page.tsx                     landing / auto-redirect
  /g/[id]
    page.tsx                   main game screen (server shell + client game)
    /history
      page.tsx                 (later)
  /api
    /groups
      route.ts                 POST create group
      /[id]
        route.ts               GET group + roster
        /players
          route.ts             POST add to roster
        /sessions
          route.ts             POST save completed session

/components
  Header.tsx
  GroupSwitcher.tsx
  PlayerCard.tsx               handles setup / rolling / complete visual states
  AddPlayerPicker.tsx
  Die.tsx
  ProbabilityBar.tsx
  Confetti.tsx

/lib
  db.ts                        Drizzle + Neon client
  schema.ts                    table definitions
  algorithm.ts                 computeScore()

/hooks
  useLocalGroups.ts            localStorage management
```

---

## Implementation Order Summary

| Phase | Deliverable |
|---|---|
| 1 | Next.js project runs locally |
| 2 | DB schema created in Neon |
| 3 | API routes working (testable via curl/Postman) |
| 4 | localStorage hook |
| 5 | Landing page + group creation |
| 6 | Group page shell + header + group switcher |
| 7 | Setup phase fully functional |
| 8 | Rolling phase with die animation |
| 9 | Result announcement |
| 10 | Polish + Vercel deployment |
