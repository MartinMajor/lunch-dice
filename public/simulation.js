const oneStepIterations = 3000000
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
    let sums = initials.map(a => 0.0)
    for (let i = 0; i < oneStepIterations; i++){
        const payer = oneLunch(initials)
        sums[payer] += sum
    }
    return sums.map(a => a / oneStepIterations)
}

function improve(initials, result, wanted) {
    let results = []
    for (let i = 0; i < initials.length; i++) {
        results.push(initials[i] - result[i] + wanted[i])
    }
    return results
}

function simulation(prices) {
    const sum = prices.reduce((a, b) => a + b)

    let initials = prices
    for (let i = 0; i < optimizationIterations; i++){
        // debug the improvements
        // console.log(initials)
        const result = oneStep(initials, sum)
        initials = improve(initials, result, prices)
    }

    return initials
}

function roundTo2(num) {
    return Math.round(num * 100) / 100
}

function start() {
    const output = document.getElementById('output')
    output.innerText = 'Calculating ...'
    const prices = document.getElementById('input').value.split(" ").map(a => parseFloat(a))
    const result = simulation(prices).map(num => Math.round(num))
    const testRun = oneStep(result, result.reduce((a, b) => a + b)).map(num => roundTo2(num))
    output.innerHTML = result.join(", ") + "<br />" + testRun.join(", ")
}
