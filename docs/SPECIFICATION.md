# Lunch Dice — Application Specification

## Purpose

A fair, randomized game for deciding who pays for a group lunch. Fairness means each person's long-run average payment equals exactly their own lunch price. See `CLAUDE.md` for the core algorithm.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | Neon Postgres (via Vercel integration) |
| ORM | Drizzle |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Group IDs | nanoid (16-char alphanumeric, URL-safe) |
| Deployment | Vercel free tier |

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page (first-time users) or auto-redirect to last group |
| `/g/[id]` | Main game screen |
| `/g/[id]/history` | History & fairness stats *(out of scope for now)* |

### Entry behavior

- If localStorage contains previously visited groups, `/` auto-redirects to the most recently visited group (`/g/[lastId]`).
- If localStorage is empty, `/` shows a minimal landing page with a "Create new group" button.
- Visiting any `/g/[id]` link saves that group to localStorage automatically.

---

## Data Model

### `groups`
| Column | Type | Notes |
|---|---|---|
| id | varchar(16) | nanoid, primary key, serves as auth token |
| name | text | user-typed group name |
| created_at | timestamp | |

### `players` (roster)
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| group_id | varchar(16) | FK → groups |
| name | text | |
| created_at | timestamp | |

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| group_id | varchar(16) | FK → groups |
| played_at | timestamp | when the game completed |

### `session_players`
| Column | Type | Notes |
|---|---|---|
| id | uuid | primary key |
| session_id | uuid | FK → sessions |
| player_id | uuid | FK → players |
| price | float | price paid for this session |
| rolled_score | float | `-ln(u) / price`; lowest score pays |

Sessions are only written to the database when a game completes. All setup and rolling state lives in client-side React state.

---

## API Routes

| Method | Path | Action |
|---|---|---|
| POST | `/api/groups` | Create group, return `{ id, name }` |
| GET | `/api/groups/[id]` | Get group name + full roster |
| POST | `/api/groups/[id]/players` | Add player to roster, return player |
| POST | `/api/groups/[id]/sessions` | Save a completed session |

### Save session endpoint (`POST /api/groups/[id]/sessions`)

Called once when the last player rolls and the game is complete. Body:

```json
{
  "players": [
    { "playerId": "uuid", "price": 14.50, "rolledScore": 0.0842 },
    { "playerId": "uuid", "price": 9.00,  "rolledScore": 0.1563 }
  ]
}
```

Server inserts one `sessions` row and one `session_players` row per player. The payer is the player with the lowest `rolledScore` — this is derived, not explicitly stored.

---

## Game State Machine

The state machine lives entirely in client-side React state. Nothing is persisted until the game completes.

```
SETUP  →  ROLLING  →  COMPLETE
```

| State | What users can do |
|---|---|
| `setup` | Add/remove players from today's session, enter prices |
| `rolling` | Each player rolls their die (free-form order); no editing |
| `complete` | View result; hit "New Game" to reset |

### Transitions
- `setup → rolling`: user clicks "Start Rolling"; requires ≥ 2 players with valid prices (> 0)
- `rolling → complete`: triggered client-side when the last player rolls; completed session is saved to DB via one POST
- `complete → setup`: clicking "New Game" navigates to `/g/[id]`, resetting all local state

---

## Screens

### Landing page `/`

Shown only to first-time users (empty localStorage).

- App name + tagline
- "Create new group" button → input for group name → POST `/api/groups` → save to localStorage → redirect to `/g/[id]`

### Main game screen `/g/[id]`

Header: Share button + History link (left), group switcher (right).

#### Group switcher (top-right, game screen only)

A small dropdown:

```
[Office Crew ▾]
```

Dropdown contents:
- Checkmark next to the current group
- List of all groups from localStorage
- "Create new group" option
- "Join with a link" option (paste a URL or group ID)

Visiting a `/g/[id]` link (e.g. shared by a friend) automatically adds it to the localStorage list.

#### Setup state

- Grid of player cards (today's participants)
- Each card shows: name, price input field (empty, must be filled), remove (✕) button
- `+ Add player` button opens the add picker
- Probability bars + "Start Rolling" button appear only when ≥ 2 players have valid prices entered

**Add player picker:**

Two sections:

1. Roster members not yet in today's session — listed by name, each with an empty price input field. Click a name to activate its price input; confirm to add.
2. "New person" — enter name + price → adds to today's session and permanently to the roster via `POST /api/groups/[id]/players`.

#### Rolling state

- Cards are locked (no editing, no add/remove)
- Each card shows a 3D die that the player clicks to roll
- Die animates (tumbles, CSS 3D) for ~1.5s then lands on a face (decorative; actual score shown below)
- Roll computation happens client-side: `score = -Math.log(u > 0 ? u : 1e-300) / price`
- After rolling, the card shows the player's score (4 decimal places)

**Card visual states during rolling:**

| State | Visual |
|---|---|
| Waiting | Die idle, "Roll" label, neutral border |
| In danger | Red glowing border, "⚠ IN DANGER" badge (currently lowest score) |
| Safe | Dimmed, green tint, "✓ SAFE" badge |

The "IN DANGER" badge migrates to whoever currently has the lowest score. When a new player rolls and gets a lower score, the previous "in danger" card flips to "SAFE" and the new one turns red.

When the last player rolls, the complete state triggers immediately client-side, then the session is saved to DB in the background.

#### Complete state

The paying player's card transforms:
- Full red flood, pulsing glow
- Bold "PAYS — $14.50" label
- Total bill shown: "Total bill: $47.50"
- All other cards dim to grey

Gold confetti burst animation.

Single button: **"New Game"** → navigates to `/g/[id]` → resets all local React state.

---

## Local Storage Schema

```json
{
  "groups": [
    { "id": "xK9mP3vQ7nR2wT4s", "name": "Office Crew", "lastVisited": "2026-02-23T12:00:00Z" },
    { "id": "aB3cD5eF7gH9iJ1k", "name": "Friday Friends", "lastVisited": "2026-02-18T13:30:00Z" }
  ]
}
```

Sorted by `lastVisited` descending. The top entry is the auto-redirect target on `/`.

---

## History (out of scope for now)

Route `/g/[id]/history` will be designed and implemented later. The data needed is already stored:
- `sessions.played_at`
- `session_players.player_id`, `.price`, `.rolled_score`
- The payer is the `session_player` with the lowest `rolled_score`

---

## Key Invariants (from CLAUDE.md)

- Costs must be positive numbers (> 0)
- At least 2 players required to start rolling
- No mutation of costs after rolling begins
