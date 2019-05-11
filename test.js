const test = require('tape')
const { parseFile, solve } = require('./lib')

const cases = {
  'case1.txt': 'G G G G M',
  'case2.txt': 'No solution exists',
  'case3.txt': 'G M G M G',
  'case4.txt': 'M M',
  'case5.txt': 'M M M',
  'case6.txt': 'M G G G G G G',
  'case7.txt': 'G G G M',
  'case8.txt': 'No solution exists',
  'case9.txt': 'M G M G'

}

test('test cases', t => {
  const caseFiles = Object.keys(cases)
  t.plan(caseFiles.length)
  for (const filepath of caseFiles) {
    const answer = cases[filepath]
    t.equal(solve(parseFile(filepath)), answer)
  }
})
