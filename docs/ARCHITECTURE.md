# Lunch Dice — Architecture

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Neon Postgres via `@neondatabase/serverless` |
| ORM | Drizzle |
| Styling | Tailwind CSS with custom casino theme |
| Animation | Framer Motion |
| Group IDs | nanoid (16-char alphanumeric, URL-safe) |
| Deployment | Vercel |

---

## File Structure

```
app/
  layout.tsx                  Cinzel + Inter fonts, casino-black body
  globals.css                 Base styles (@apply bg-casino-black text-cream)
  page.tsx                    Landing: auto-redirect or create-group form
  not-found.tsx               Casino-themed 404 page
  g/[id]/
    page.tsx                  Server component: fetches group + roster ordered by last played, calls notFound()
    GameClient.tsx            Client: owns all game state, routes between phases, tracks save status
    SetupPhase.tsx            Setup UI: roster-first inline player selection
    RollingPhase.tsx          Rolling UI: die cards, total bill
    CompletePhase.tsx         Result UI: winner + confetti + save status + retry + new game
    stats/
      page.tsx                Server component: computes per-player and group stats
      StatsClient.tsx         Client: overview (balance leaderboard) + player detail drill-down
    history/
      page.tsx                Server component: reverse-chronological session log
  api/
    groups/route.ts                   POST create group
    groups/[id]/route.ts              GET group + roster
    groups/[id]/players/route.ts      POST add player to roster
    groups/[id]/sessions/route.ts     POST save completed session

components/
  Header.tsx          "Lunch Dice" title link (→ /g/[id]) + GroupSwitcher
  GroupSwitcher.tsx   Dropdown: current group (with forget), saved groups, copy link, create, join, stats, history, GitHub
  RosterCard.tsx      Setup card — two states (see Setup section)
  RollingCard.tsx     Rolling/result card with die, score, roll values
  Die.tsx             Animated 3D die (Framer Motion)
  ProbabilityBar.tsx  Horizontal gold bar showing win probability
  Confetti.tsx        Falling card suits (♠♦♣♥) animation
  FormattedDate.tsx   Client component: formats ISO date string in browser timezone

lib/
  db.ts               Drizzle client (Neon serverless)
  schema.ts           Table definitions
  algorithm.ts        roll() — see GAME.md

hooks/
  useLocalGroups.ts   localStorage: group list management (add, remove, getLastGroup)

types/
  game.ts             RosterPlayer, SessionPlayer, GamePhase
```

---

## Database Schema

```
groups          id varchar(16) PK | name text | created_at
players         id uuid PK | group_id FK | name text | created_at
sessions        id uuid PK | group_id FK | played_at
session_players id uuid PK | session_id FK | player_id FK | price real | rolled_score real
```

The **group ID is the auth token** — 16-char nanoid, unguessable, shared as a URL. No login.

Sessions are only written to the DB when a game **fully completes** (all players rolled). Game state is purely client-side React state until that point.

The payer is always derived at read time as the `session_player` with the lowest `rolled_score` — it is not stored explicitly.

---

## API Routes

| Method | Path | Body / Response |
|---|---|---|
| POST | `/api/groups` | `{ name }` → `{ id, name }` |
| GET | `/api/groups/[id]` | → `{ group, roster[] }` |
| POST | `/api/groups/[id]/players` | `{ name }` → player |
| POST | `/api/groups/[id]/sessions` | `{ players: [{ playerId, price, rolledScore }] }` |

Session save is **async with retry** — `GameClient` tracks `saveStatus: "idle" | "saving" | "saved" | "error"`. On error, `CompletePhase` shows a retry button. Requires `players.length >= 2` and all `price > 0`.

---

## Game State Machine

State lives entirely in `GameClient.tsx`. Three phases, represented by `GamePhase = "setup" | "rolling" | "complete"`.

```
SETUP  →  ROLLING  →  COMPLETE
  ↑__________________________|
```

| Phase | What happens |
|---|---|
| `setup` | Roster shown; players tap to select; enter prices inline |
| `rolling` | Each player taps their die card to roll; free-form order |
| `complete` | Payer revealed; confetti; session saved to DB |

**Transitions:**
- `setup → rolling`: "START ROLLING" clicked; requires all selected players have `price > 0` and `sessionPlayers.length >= 2`
- `rolling → complete`: detected by a `useEffect` watching `sessionPlayers` (all have `rolledScore` and `!isRolling`); 600ms delay then phase change; session saved. Uses `completionFiredRef` to guard against React re-invoking the effect.
- `complete → setup`: "NEW GAME" resets `phase`, clears `sessionPlayers`, resets save refs

---

## Component Architecture

### GameClient (state owner)

Holds: `phase`, `roster`, `sessionPlayers`, `saveStatus`.

Computes derived values (`prices`, `total`, `probabilities`, `canStart`) and passes them down. All callbacks live here. Phase components are pure UI.

**Save guard pattern:** `savedRef` and `completionFiredRef` are refs (not state) that prevent double-firing in React 18 concurrent mode. State updater functions must be pure — side effects (network calls) must live outside them, in effects or event handlers.

### SessionPlayer type

```ts
interface SessionPlayer {
  playerId: string;
  name: string;
  price: string;          // kept as string for input flexibility
  rolledU?: number;       // raw uniform draw (display only, not persisted)
  rolledScore?: number;
  dieFace?: number;
  isRolling?: boolean;
}
```

`price` is a string throughout setup and rolling. Only parsed to float at roll-time and when saving. `rolledU` is used for the display transformation (roll value shown on card) but is not stored in the database — `rolledScore` alone is persisted.

### SetupPhase layout

Two sections:

1. **Selected players** — full-width column (`flex flex-col`). Each row: name left, `$` + price input right, `×` deselect. Probability bar below (opacity-0 when no valid price to preserve height).
2. **Unselected roster + `+` card** — 2-column grid. Ghost buttons; tap to select (auto-focuses price input). `+` card expands inline for new person (name only; price entered after selection like any other player).

### RollingCard states

`RollState = "waiting" | "rolling" | "safe" | "danger" | "payer"`

- `waiting` — gold border, "Tap to roll"
- `rolling` — pulsing "Rolling…"
- `safe` — green border/bg, "✓ Safe"
- `danger` — red glow, "⚠ In Danger" (current lowest score during rolling)
- `payer` — red glow, "PAYS!" (used on complete phase; same styling as danger)

`CompletePhase` reuses `RollingCard` with `payer` / `safe` states. No separate result card component.

### Die component

`rolling` prop drives the animation. Key implementation detail: `onRollComplete` and `face` are stored in refs inside the effect — **do not** add them to the `useEffect` dependency array. If they are deps, re-renders triggered by other players rolling will cancel the in-progress animation via cleanup, freezing the die mid-roll.

### Stats pages

`stats/page.tsx` fetches all session rows for the group in one query, then computes everything in TypeScript:
- Groups rows by session → derives total bill and payer (min `rolledScore`) per session
- Groups rows by player → accumulates plays, paid times, expected/actual pay, streak, etc.
- `expectedPay = Σ own price` (equals fair share by the algorithm's proof)
- `balance = expectedPay − actualPay` — positive means lucky (paid less than fair share)
- Streak: sessions in reverse-chronological order, count of consecutive same outcome

`StatsClient.tsx` is client-only. Overview shows balance leaderboard; tapping a player shows a detail tile grid. No navigation — drill-down is client state.

---

## Styling / Design System

Custom Tailwind colors (defined in `tailwind.config.ts`):

| Token | Hex | Usage |
|---|---|---|
| `casino-black` | `#0a0a0f` | Page background |
| `felt` | `#1a2e1a` | Card backgrounds, inputs |
| `gold` | `#c9a84c` | Primary accent, buttons |
| `gold-light` | `#e8c96a` | Hover state for gold |
| `cream` | `#f5f0e8` | Body text |
| `danger` | `#8b1a1a` | Background tint of payer card |
| `danger-bright` | `#cc2222` | Payer text, borders, streak |
| `safe` | `#4a8a4a` | Safe player border/bg/text |

Custom shadows: `shadow-gold`, `shadow-danger`, `shadow-safe`.

Fonts:
- `font-display` → Cinzel (headings, labels, buttons)
- `font-sans` → Inter (body, prices, scores)

---

## Local Storage

Key: `"lunch-dice-groups"`. Schema:

```ts
interface LocalGroup {
  id: string;
  name: string;
  lastVisited: string; // ISO timestamp
}
```

`addGroup(id, name)` upserts and updates `lastVisited`. `removeGroup(id)` deletes. On `/`, the group with the most recent `lastVisited` triggers an auto-redirect. Used by `GroupSwitcher` to populate the saved-groups list.

---

## Key Design Decisions (don't change without good reason)

1. **No server-side game state** — setup and rolling are local React state only. Simplifies the API to 4 routes and avoids sync complexity.

2. **Group ID = auth** — the unguessable nanoid URL is the only access control. No login, no sessions.

3. **Roster vs. session** — the group maintains a permanent `roster`. Each game uses a subset (`sessionPlayers`). Players are selected fresh each game; prices are never pre-filled.

4. **Retryable session save** — save is async; `saveStatus` state drives UI feedback in `CompletePhase`. On network error a retry button appears. `savedRef` prevents double-saves from React concurrent mode re-runs.

5. **price as string** — `SessionPlayer.price` is kept as a string from input to roll-time to avoid controlled input jank and allow empty/partial values during editing.

6. **Roster-first setup** — the full roster is shown upfront; users tap to select, not search/add. Selected players move to a full-width stack at top; unselected stay in a 2-col ghost grid below.

7. **Stats computed at read time** — no pre-aggregated stats columns in the DB. All balance/streak/etc values are derived from raw `session_players` rows in the stats page server component. Keeps the write path simple and stats always consistent.

8. **Nothing fixed to the bottom of the viewport** — Brave on mobile renders a browser toolbar that permanently overlaps the bottom portion of the page. Any element with `position: fixed; bottom: 0` (or Tailwind's `fixed bottom-0`) will be hidden behind this toolbar and unreachable. All action buttons and bottom bars must flow naturally with the document so they are always above the fold and tappable.

9. **Input font size must be ≥ 16px** — iOS Safari auto-zooms the entire page when a focused input has `font-size < 16px`. This causes a horizontal scroll that looks like a layout bug. All `<input>` elements must use at least `text-base` (16px). Never use `text-sm` or `text-xs` on an input. If an input looks too large inside a compact container (e.g. a dropdown menu), move the form to a modal instead.
