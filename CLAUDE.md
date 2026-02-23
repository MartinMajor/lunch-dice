# Lunch Gamble — Project Context

A fair, randomized game for deciding who pays for a group lunch. Fairness means each person's long-run average payment equals exactly their own lunch price.

## Core Algorithm

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

### Implementation

```js
function pickWho(costs) {
  let minScore = Infinity;
  let minIdx = 0;
  for (let i = 0; i < costs.length; i++) {
    const u = Math.random();
    const score = -Math.log(u > 0 ? u : 1e-300) / costs[i];
    if (score < minScore) {
      minScore = score;
      minIdx = i;
    }
  }
  return minIdx; // this person pays
}
```

The `u > 0` guard handles the astronomically rare case of `Math.random()` returning exactly `0`, which would produce `Infinity`.

## What Not to Do

**Do not** use integer ranges like `roll = random(1, round(total / cost))`. This looks intuitive but introduces rounding errors that compound badly with extreme price ratios (e.g. 100:10), producing systematically unfair results.

## Key Invariants

- Costs must be positive numbers (> 0)
- At least 2 players required
- No mutation of `costs` array inside `pickWho`
- All monetary values stored as plain floats (dollars), never integers or cents