// tests/formatters.test.mjs
// ─── Unit tests for src/utils/formatters.js ───────────────────
// Run: node tests/formatters.test.mjs

import {
  timeAgo, formatTimestamp, formatDate,
  urgencyScoreToLabel,
  groupByCategory, groupByUrgency, groupByStatus,
  avgUrgencyScore, resolutionRate,
  truncate, initials,
  URGENCY_COLOR, CATEGORY_COLOR,
} from '../src/utils/formatters.js'

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); console.log(`  ✅  ${name}`); passed++ }
  catch(e) { console.log(`  ❌  ${name}\n      → ${e.message}`); failed++ }
}
function expect(actual) {
  return {
    toBe:   (e) => { if (actual !== e)         throw new Error(`Expected ${JSON.stringify(e)}, got ${JSON.stringify(actual)}`) },
    toEqual:(e) => { if (JSON.stringify(actual) !== JSON.stringify(e)) throw new Error(`Expected ${JSON.stringify(e)}, got ${JSON.stringify(actual)}`) },
    toContain:(e)=>{ if (!actual.includes(e))  throw new Error(`Expected "${actual}" to contain "${e}"`) },
    toBeGreaterThan:(e) => { if (!(actual>e))  throw new Error(`Expected >  ${e}, got ${actual}`) },
    toBeLessThanOrEqual:(e)=>{ if(!(actual<=e))throw new Error(`Expected <= ${e}, got ${actual}`) },
    toMatch:(r)=>{ if(!r.test(actual))         throw new Error(`"${actual}" did not match ${r}`) },
    toBeTruthy:()=>{ if(!actual)               throw new Error(`Expected truthy, got ${actual}`) },
  }
}

const NOW = Date.now()

console.log('\n📋 formatters.js — Unit Tests\n')

console.log('  ▶ timeAgo()')
test('returns "just now" for < 60 seconds ago', () => {
  expect(timeAgo(new Date(NOW - 30000).toISOString())).toBe('just now')
})
test('returns "Xm ago" for < 1 hour', () => {
  expect(timeAgo(new Date(NOW - 900000).toISOString())).toBe('15m ago')
})
test('returns "Xh Ym ago" for > 1 hour', () => {
  expect(timeAgo(new Date(NOW - 5400000).toISOString())).toBe('1h 30m ago')
})
test('returns "Xh ago" for exact hours', () => {
  expect(timeAgo(new Date(NOW - 7200000).toISOString())).toBe('2h ago')
})
test('handles empty string gracefully', () => {
  expect(timeAgo('')).toBe('')
})
test('handles null gracefully', () => {
  expect(timeAgo(null)).toBe('')
})

console.log('\n  ▶ urgencyScoreToLabel()')
test('9  → critical', () => expect(urgencyScoreToLabel(9)).toBe('critical'))
test('10 → critical', () => expect(urgencyScoreToLabel(10)).toBe('critical'))
test('7  → high',     () => expect(urgencyScoreToLabel(7)).toBe('high'))
test('8  → high',     () => expect(urgencyScoreToLabel(8)).toBe('high'))
test('5  → medium',   () => expect(urgencyScoreToLabel(5)).toBe('medium'))
test('6  → medium',   () => expect(urgencyScoreToLabel(6)).toBe('medium'))
test('1  → low',      () => expect(urgencyScoreToLabel(1)).toBe('low'))
test('4  → low',      () => expect(urgencyScoreToLabel(4)).toBe('low'))

console.log('\n  ▶ groupByCategory()')
const SAMPLE_ISSUES = [
  { category: 'Flood Relief', urgency: 'critical', urgencyScore: 9, status: 'open',        reportedAt: new Date(NOW - 86400000).toISOString() },
  { category: 'Medical Aid',  urgency: 'high',     urgencyScore: 8, status: 'in-progress', reportedAt: new Date(NOW - 86400000).toISOString() },
  { category: 'Flood Relief', urgency: 'medium',   urgencyScore: 5, status: 'resolved',    reportedAt: new Date(NOW - 86400000).toISOString() },
  { category: 'Food & Water', urgency: 'low',      urgencyScore: 2, status: 'open',        reportedAt: new Date(NOW).toISOString() },
]
test('counts correctly per category', () => {
  const result = groupByCategory(SAMPLE_ISSUES)
  expect(result['Flood Relief']).toBe(2)
  expect(result['Medical Aid']).toBe(1)
  expect(result['Food & Water']).toBe(1)
})
test('handles empty array', () => {
  expect(JSON.stringify(groupByCategory([]))).toBe('{}')
})
test('uses "Other" for missing category', () => {
  const result = groupByCategory([{ status: 'open' }])
  expect(result['Other']).toBe(1)
})

console.log('\n  ▶ groupByUrgency()')
test('counts correctly', () => {
  const result = groupByUrgency(SAMPLE_ISSUES)
  expect(result['critical']).toBe(1)
  expect(result['high']).toBe(1)
  expect(result['medium']).toBe(1)
  expect(result['low']).toBe(1)
})
test('always includes all 4 keys even with no data', () => {
  const result = groupByUrgency([])
  expect(result['critical']).toBe(0)
  expect(result['high']).toBe(0)
  expect(result['medium']).toBe(0)
  expect(result['low']).toBe(0)
})

console.log('\n  ▶ groupByStatus()')
test('counts open, in-progress, resolved correctly', () => {
  const result = groupByStatus(SAMPLE_ISSUES)
  expect(result['open']).toBe(2)
  expect(result['in-progress']).toBe(1)
  expect(result['resolved']).toBe(1)
})

console.log('\n  ▶ avgUrgencyScore()')
test('calculates correctly: (9+8+5+2)/4 = 6', () => {
  expect(avgUrgencyScore(SAMPLE_ISSUES)).toBe(6)
})
test('returns 0 for empty array', () => {
  expect(avgUrgencyScore([])).toBe(0)
})

console.log('\n  ▶ resolutionRate()')
test('1 of 4 resolved → 25%', () => {
  expect(resolutionRate(SAMPLE_ISSUES)).toBe(25)
})
test('returns 0 for empty array', () => {
  expect(resolutionRate([])).toBe(0)
})
test('all resolved → 100%', () => {
  const all = SAMPLE_ISSUES.map((i) => ({ ...i, status: 'resolved' }))
  expect(resolutionRate(all)).toBe(100)
})

console.log('\n  ▶ truncate()')
test('short string unchanged', () => {
  expect(truncate('hello', 80)).toBe('hello')
})
test('long string gets ellipsis', () => {
  const s = 'a'.repeat(100)
  const t = truncate(s, 80)
  expect(t.length).toBeLessThanOrEqual(80)
  expect(t.endsWith('…')).toBeTruthy()
})
test('handles empty string', () => {
  expect(truncate('', 80)).toBe('')
})

console.log('\n  ▶ initials()')
test('"Arjun Mehta" → "AM"', () => expect(initials('Arjun Mehta')).toBe('AM'))
test('"Divya Iyer"  → "DI"', () => expect(initials('Divya Iyer')).toBe('DI'))
test('single name   → one letter', () => expect(initials('Alice')).toBe('A'))
test('empty string  → ""', () => expect(initials('')).toBe(''))

console.log('\n  ▶ Color maps')
test('URGENCY_COLOR has all 4 levels', () => {
  expect(typeof URGENCY_COLOR['critical']).toBe('string')
  expect(typeof URGENCY_COLOR['high']).toBe('string')
  expect(typeof URGENCY_COLOR['medium']).toBe('string')
  expect(typeof URGENCY_COLOR['low']).toBe('string')
})
test('CATEGORY_COLOR includes Flood Relief', () => {
  expect(typeof CATEGORY_COLOR['Flood Relief']).toBe('string')
})

console.log(`\n${'─'.repeat(50)}`)
console.log(`  Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`)
if (failed === 0) console.log('  🎉 All tests passed!\n')
else { console.log(`  ⚠️  ${failed} failed\n`); process.exit(1) }
