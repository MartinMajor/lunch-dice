# Lunch Dice

A fair, randomized game for deciding who pays for a group lunch. Each person enters their meal price; the algorithm ensures that over many rounds, everyone's average payment equals exactly what they ordered.

## How it works

Each player draws a random score based on their meal price using a competing exponentials algorithm — the person with the lowest score pays the full bill. The probability of paying is proportional to your price, so expensive orders carry higher risk. See [docs/GAME.md](docs/GAME.md) for the math.

## Tech stack

- **Next.js 15** (App Router) deployed on Vercel
- **Neon Postgres** + Drizzle ORM
- **Tailwind CSS** with a custom casino theme
- **Framer Motion** for die animations

## Development

```bash
npm install
npm run dev
```

Requires a `DATABASE_URL` environment variable pointing at a Neon Postgres instance.

## Docs

- [`docs/GAME.md`](docs/GAME.md) — core algorithm, fairness proof, die face mapping
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — file structure, DB schema, API routes, state machine, component patterns
