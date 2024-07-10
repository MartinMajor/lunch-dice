const oneStepIterations = 3_000_000;
const optimizationIterations = 7;

function oneLunch(prices: number[]) {
  let minIndex = 0;
  let minValue = Number.MAX_VALUE;

  for (let i = 0; i < prices.length; i++) {
    const random = Math.random() / prices[i];
    if (random < minValue) {
      minIndex = i;
      minValue = random;
    }
  }

  return minIndex;
}

function oneStep(initials: number[], sum: number) {
  const sums = initials.map((_n) => 0.0);

  for (let i = 0; i < oneStepIterations; i++) {
    const payer = oneLunch(initials);
    sums[payer] += sum;
  }

  return sums.map((n) => n / oneStepIterations);
}

function improve(initials: number[], result: number[], wanted: number[]) {
  const results = [];

  for (let i = 0; i < initials.length; i++) {
    results.push(initials[i] - result[i] + wanted[i]);
  }

  return results;
}

export function simulation(prices: number[]) {
  const sum = prices.reduce((a, b) => a + b);
  let initials = prices;

  for (let i = 0; i < optimizationIterations; i++) {
    const result = oneStep(initials, sum);
    initials = improve(initials, result, prices);
  }

  return initials;
}
