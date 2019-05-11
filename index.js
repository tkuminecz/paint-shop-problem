const { argv } = require('yargs')
const { parseFile, solve } = require('./lib')

const { _: [filename] } = argv
const problemData = parseFile(filename)
console.log(solve(problemData))
