const oneStepIterations = 3_000_000
const optimizationIterations = 7

function oneLunch(prices) {
  let minIndex = 0
  let minValue = Number.MAX_VALUE

  for (let i = 0; i < prices.length; i++) {
    const random = Math.random() / prices[i]
    if (random < minValue) {
      minIndex = i
      minValue = random
    }
  }

  return minIndex
}

function oneStep(initials, sum) {
  const sums = initials.map(_n => 0.0)

  for (let i = 0; i < oneStepIterations; i++) {
    const payer = oneLunch(initials)
    sums[payer] += sum
  }

  return sums.map(n => n / oneStepIterations)
}

function improve(initials, result, wanted) {
  const results = []
  for (let i = 0; i < initials.length; i++) {
    results.push(initials[i] - result[i] + wanted[i])
  }
  return results
}

export function simulation(prices) {
  const sum = prices.reduce((a, b) => a + b)

  let initials = prices

  for (let i = 0; i < optimizationIterations; i++) {
    const result = oneStep(initials, sum)
    initials = improve(initials, result, prices)
  }

  return initials
}
