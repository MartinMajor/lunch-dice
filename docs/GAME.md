# Lunch Dice — Core Algorithm

A fair, randomized game for deciding who pays for a group lunch. Fairness means each person's long-run average payment equals exactly their own lunch price.

## Algorithm

Each person draws `u ~ Uniform(0, 1)` and computes a score:

```
score_i = -ln(u) / cost_i
```

The person with the **lowest score pays** the full bill.

### Why It Is Fair

- `-ln(u)` follows an Exponential(1) distribution
- Therefore `score_i ~ Exponential(rate = cost_i)`
- For independent competing exponentials, the probability that person `i` has the minimum is:

```
P(i pays) = cost_i / (cost_1 + cost_2 + ... + cost_n)
```

- Expected payment per round = `P(i pays) × total = cost_i` ✓

This is **mathematically exact** — no integer rounding, no approximation, works for any price ratio.

### Implementation (`lib/algorithm.ts`)

```ts
export function roll(price: number): RollResult {
  const u = Math.random();
  const safeU = u > 0 ? u : 1e-300;       // guard against log(0)
  const score = -Math.log(safeU) / price;
  const face = Math.max(1, Math.ceil((1 - u) * 6));  // die face (cosmetic)
  return { u, score, face };
}
```

The `u > 0` guard handles the astronomically rare case of `Math.random()` returning exactly `0`.

### Display Transformation

Raw values are transformed for display so that **bigger numbers look better**:

| Value | Formula | Label |
|---|---|---|
| Roll | `(1 - u) × 10000` | "roll XXXX" |
| Score | `score × 1000000` | large number, "score XXXXXXX" |

Both are displayed as `toFixed(0)` integers. High roll → high luck → low score → safe. This inversion makes the UI intuitive: the player with the smallest displayed score is in danger.

### Die Face Mapping

`face = Math.ceil((1 - u) × 6)`, clamped to [1, 6].

- `u` close to 0 → `(1-u)` close to 1 → face 6 (lucky, safe)
- `u` close to 1 → `(1-u)` close to 0 → face 1 (unlucky, pays)

The die face is **cosmetic only** and does not affect the score.

## What Not to Do

**Do not** use integer ranges like `roll = random(1, round(total / cost))`. This introduces rounding errors that compound with extreme price ratios (e.g. 100:10), producing systematically unfair results.

## Key Invariants

- All costs must be positive (> 0)
- At least 2 players required to start
- Costs must not change after rolling begins
