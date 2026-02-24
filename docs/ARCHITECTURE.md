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
    page.tsx                  Server component: fetches group + roster, calls notFound()
    GameClient.tsx            Client: owns all game state, routes between phases
    SetupPhase.tsx            Setup UI: roster-first inline player selection
    RollingPhase.tsx          Rolling UI: die cards, total bill
    CompletePhase.tsx         Result UI: winner + confetti + new game
  api/
    groups/route.ts                   POST create group
    groups/[id]/route.ts              GET group + roster
    groups/[id]/players/route.ts      POST add player to roster
    groups/[id]/sessions/route.ts     POST save completed session

components/
  Header.tsx          Share button (clipboard) + GroupSwitcher
  GroupSwitcher.tsx   Dropdown: current group, saved groups, create, join
  RosterCard.tsx      Setup card — two states (see Setup section)
  RollingCard.tsx     Rolling/result card with die, score, roll values
  Die.tsx             Animated 3D die (Framer Motion)
  ProbabilityBar.tsx  Horizontal gold bar showing win probability
  Confetti.tsx        Falling card suits (♠♦♣♥) animation

lib/
  db.ts               Drizzle client (Neon serverless)
  schema.ts           Table definitions
  algorithm.ts        roll() — see GAME.md

hooks/
  useLocalGroups.ts   localStorage: group list management

types/
  game.ts             RosterPlayer, SessionPlayer, GamePhase
```

---

## Database Schema

```
groups          id varchar(16) PK | name text | created_at
players         id uuid PK | group_id FK | name text | created_at
sessions        id uuid PK | group_id FK | played_at
session_players id uuid PK | session_id FK | player_id FK | price real | rolled_score real | rolled_u real
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
| POST | `/api/groups/[id]/sessions` | `{ players: [{ playerId, price, rolledScore, rolledU }] }` |

Session save is fire-and-forget (no await in the UI). Requires `players.length >= 2` and all `price > 0`.

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
- `rolling → complete`: triggered when last player's die animation finishes; 600ms delay then phase change; session saved
- `complete → setup`: "NEW GAME" resets `phase` and clears `sessionPlayers`

---

## Component Architecture

### GameClient (state owner)

Holds: `phase`, `roster`, `sessionPlayers`, `showPicker`.

Computes derived values (`prices`, `total`, `probabilities`, `canStart`) and passes them down. All callbacks live here. Phase components are pure UI.

### SessionPlayer type

```ts
interface SessionPlayer {
  playerId: string;
  name: string;
  price: string;          // kept as string for input flexibility
  rolledU?: number;
  rolledScore?: number;
  dieFace?: number;
  isRolling?: boolean;
}
```

`price` is a string throughout setup and rolling. Only parsed to float at roll-time and when saving.

### SetupPhase layout

Two sections:

1. **Selected players** — full-width column (`flex flex-col`). Each row: name left, `$` + price input right, `×` deselect. Probability bar below (opacity-0 when no valid price to preserve height).
2. **Unselected roster + `+` card** — 2-column grid. Ghost buttons; tap to select (auto-focuses price input). `+` card expands inline for new person (name only; price entered after selection like any other player).

### RollingCard states

`RollState = "waiting" | "rolling" | "safe" | "danger" | "payer"`

- `waiting` — gold border, "Tap to roll"
- `rolling` — pulsing "Rolling…"
- `safe` — dimmed green, "✓ Safe"
- `danger` — red glow, "⚠ In Danger" (current lowest score during rolling)
- `payer` — red glow, "PAYS!" (used on complete phase; same styling as danger)

`CompletePhase` reuses `RollingCard` with `payer` / `safe` states. No separate result card component.

### Die component

`rolling` prop drives the animation. Key implementation detail: `onRollComplete` and `face` are stored in refs inside the effect — **do not** add them to the `useEffect` dependency array. If they are deps, re-renders triggered by other players rolling will cancel the in-progress `setTimeout` chain via cleanup, freezing the animation mid-roll.

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
| `danger` | `#8b1a1a` | Background of payer card |
| `danger-bright` | `#cc2222` | Payer text, borders |
| `safe` | `#1a4a1a` | Safe player tint |

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

`addGroup(id, name)` upserts and updates `lastVisited`. On `/`, the group with the most recent `lastVisited` triggers an auto-redirect. Used by `GroupSwitcher` to populate the dropdown.

---

## Key Design Decisions (don't change without good reason)

1. **No server-side game state** — setup and rolling are local React state only. Simplifies the API to 4 routes and avoids sync complexity.

2. **Group ID = auth** — the unguessable nanoid URL is the only access control. No login, no sessions.

3. **Roster vs. session** — the group maintains a permanent `roster`. Each game uses a subset (`sessionPlayers`). Players are selected fresh each game; prices are never pre-filled.

4. **Fire-and-forget session save** — no await, no error recovery. If the save fails, the game still completes normally for the users.

5. **price as string** — `SessionPlayer.price` is kept as a string from input to roll-time to avoid controlled input jank and allow empty/partial values during editing.

6. **Roster-first setup** — the full roster is shown upfront; users tap to select, not search/add. Selected players move to a full-width stack at top; unselected stay in a 2-col ghost grid below.
