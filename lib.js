const fs = require('fs')

// parse the file into a workable structure
function parseFile (filename) {
  const contents = fs.readFileSync(filename, 'utf8')
  const [ numColors, ...customers ] = contents.split(/\n+/).filter(l => l.length > 0)
  const parsedCustomers = customers
    .map(line => line.split(/\s+/))
    .filter(line => line.length > 0)
    .map(customer =>
      customer.reduce((prefs, cur) => {
        if (/^[GM]$/.test(cur)) {
          prefs[prefs.length - 1].type = cur
          return prefs
        } else {
          return [ ...prefs, { color: parseInt(cur, 10) } ]
        }
      }, []))
  return {
    customers: parsedCustomers,
    numColors: parseInt(numColors, 10)
  }
}

// sort function to order prefs by finish type and then color ordinal position
function rankPrefs (a, b) {
  if (a.type === 'G' && b.type === 'M') {
    return -1
  } else if (a.type === 'M' && b.type === 'G') {
    return 1
  } else {
    return (a.color > b.color) ? 1 : -1
  }
}

// generates all permutations of the elements of the passed arrays
function* combine (head, ...tail) {
  const rest = tail.length ? combine(...tail) : [[]]
  for (const r of rest) {
    for (const h of head) {
      yield [h, ...r]
    }
  }
}

// generates all possible solutions
function* generateSolutions (customers) {
  for (const candidate of combine(...customers)) {
    yield candidate
  }
}

// fills in missing color values
function hydrateColors (colors, solution) {
  return colors
    .map((color, i) => {
      if (color) return color
      return { color: i + 1, type: 'G' }
    })
}

// check if the given solution makes every customer happy
function meetsCriteria (customers, combo) {
  return customers.every(prefs =>
    prefs.some(pref => combo[pref.color - 1] === pref.type))
}

// helper functions
const isNeeded = (paint, stagedColor) => (paint && paint.req) || (stagedColor && stagedColor.req)
const typeMatches = (paint, stagedColor) => paint.type === stagedColor.type
const conflicts = (paint, stagedColor) => stagedColor && isNeeded(paint, stagedColor) && !typeMatches(paint, stagedColor)

// checks if the given combo is a valid solution
function isValid (numColors, customers, solution) {
  const stagedColors = new Array(numColors).fill(null)

  const validCombo = solution.every(paint => {
    const cIndex = paint.color - 1
    const color = stagedColors[cIndex]
    if (conflicts(paint, color)) {
      return false
    } else {
      stagedColors[cIndex] = color || paint
      if (isNeeded(paint, color)) stagedColors[cIndex].need = true
      return true
    }
  })

  if (validCombo) {
    const hydratedCombo = hydrateColors(stagedColors, validCombo).map(color => color.type)
    return (!meetsCriteria(customers, hydratedCombo))
      ? false
      : hydratedCombo
  } else {
    return false
  }
}

// solves the problem
function solve (problem) {
  const { customers, numColors } = problem

  const preppedCustomers = customers
    .map(prefs => prefs.sort(rankPrefs))
    .map(prefs => {
      if (prefs.length === 1) prefs[0].need = true
      return prefs
    })

  for (const possibility of generateSolutions(preppedCustomers)) {
    const validSolution = isValid(numColors, preppedCustomers, possibility)
    if (validSolution) return validSolution.join(' ')
  }

  return 'No solution exists'
}

module.exports = { parseFile, solve }
