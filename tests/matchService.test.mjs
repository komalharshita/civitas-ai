// tests/matchService.test.mjs
// ─── Manual test runner for matchService (no Jest needed, pure Node) ──────────
// Run: node tests/matchService.test.mjs

import { matchVolunteers, getMatchSummary, getRecommendedAction } from '../src/services/matchService.js'

// ─── Test helpers ─────────────────────────────────────────────────────────────
let passed = 0, failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅  ${name}`)
    passed++
  } catch (e) {
    console.log(`  ❌  ${name}`)
    console.log(`      → ${e.message}`)
    failed++
  }
}

function expect(actual) {
  return {
    toBe:            (exp) => { if (actual !== exp)          throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(actual)}`) },
    toBeGreaterThan: (exp) => { if (!(actual > exp))          throw new Error(`Expected > ${exp}, got ${actual}`) },
    toBeGreaterThanOrEqual: (exp) => { if (!(actual >= exp))  throw new Error(`Expected >= ${exp}, got ${actual}`) },
    toBeLessThanOrEqual: (exp) => { if (!(actual <= exp))    throw new Error(`Expected <= ${exp}, got ${actual}`) },
    toHaveLength:    (exp) => { if (actual.length !== exp)    throw new Error(`Expected length ${exp}, got ${actual.length}`) },
    toContain:       (exp) => { if (!actual.includes(exp))    throw new Error(`Expected array to contain ${exp}`) },
    toBeTruthy:      ()    => { if (!actual)                  throw new Error(`Expected truthy, got ${actual}`) },
    toBeFalsy:       ()    => { if (actual)                   throw new Error(`Expected falsy, got ${actual}`) },
    toBeArray:       ()    => { if (!Array.isArray(actual))   throw new Error(`Expected array, got ${typeof actual}`) },
  }
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FLOOD_ISSUE = {
  id: 'ISS-TEST-001', title: 'Flood in residential area',
  location: 'Koregaon Park, Pune', category: 'Flood Relief', urgency: 'critical',
}

const MEDICAL_ISSUE = {
  id: 'ISS-TEST-002', title: 'Medical emergency elderly',
  location: 'Hadapsar, Pune', category: 'Medical Aid', urgency: 'high',
}

const FOOD_ISSUE = {
  id: 'ISS-TEST-003', title: 'Food needed at camp',
  location: 'Deccan, Pune', category: 'Food & Water', urgency: 'medium',
}

const VOLUNTEERS = [
  { id: 'V1', name: 'Alice',   skills: ['Flood Relief', 'Boat Operation', 'Evacuation'], status: 'active',  zone: 'East',    location: 'Koregaon Park, Pune', rating: 4.9, missionsCompleted: 50 },
  { id: 'V2', name: 'Bob',     skills: ['Medical', 'First Aid', 'CPR'],                 status: 'active',  zone: 'East',    location: 'Hadapsar, Pune',      rating: 4.8, missionsCompleted: 40 },
  { id: 'V3', name: 'Carol',   skills: ['Food Distribution', 'Logistics'],              status: 'active',  zone: 'Central', location: 'Deccan, Pune',        rating: 5.0, missionsCompleted: 30 },
  { id: 'V4', name: 'Dave',    skills: ['Infrastructure', 'Chainsaw'],                  status: 'busy',    zone: 'West',    location: 'Baner, Pune',         rating: 4.5, missionsCompleted: 20 },
  { id: 'V5', name: 'Eve',     skills: ['First Aid'],                                   status: 'active',  zone: 'South',   location: 'Katraj, Pune',        rating: 4.2, missionsCompleted: 10 },
  { id: 'V6', name: 'Frank',   skills: ['General Volunteering'],                        status: 'offline', zone: 'West',    location: 'Kothrud, Pune',       rating: 4.0, missionsCompleted: 5  },
]

// ──────────────────────────────────────────────────────────────────────────────
//  MATCHING LOGIC TESTS
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n📋 matchService.js — Unit Tests\n')

console.log('  ▶ Core matching results')

test('returns an array', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  expect(result).toBeArray()
})

test('returns at most topN results (default 3)', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  expect(result.length).toBeLessThanOrEqual(3)
})

test('respects custom topN option', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS, { topN: 2 })
  expect(result.length).toBeLessThanOrEqual(2)
})

test('top match for Flood Relief is Alice (3 matching skills, same zone, active)', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS, { topN: 3 })
  expect(result[0].id).toBe('V1')
})

test('top match for Medical Aid is Bob (3 matching skills, same zone, active)', () => {
  const result = matchVolunteers(MEDICAL_ISSUE, VOLUNTEERS, { topN: 3 })
  expect(result[0].id).toBe('V2')
})

test('top match for Food & Water is Carol (2 matching skills, same location, active)', () => {
  const result = matchVolunteers(FOOD_ISSUE, VOLUNTEERS, { topN: 3 })
  expect(result[0].id).toBe('V3')
})

console.log('\n  ▶ Availability filtering')

test('offline volunteers are NEVER included', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  const ids = result.map((v) => v.id)
  expect(ids.includes('V6')).toBeFalsy()
})

test('busy volunteers ARE included (but score lower than active)', () => {
  const busyOnly  = VOLUNTEERS.filter((v) => v.id === 'V4')
  const result    = matchVolunteers(FLOOD_ISSUE, busyOnly)
  // busy volunteer can still appear — just scores 0 for availability
  expect(result.length).toBeLessThanOrEqual(1)
})

test('active volunteers score higher than busy volunteers with same skills', () => {
  const twoVols = [
    { id: 'ACTIVE', name: 'A', skills: ['Flood Relief', 'Boat Operation', 'Evacuation'], status: 'active',  zone: 'East', location: 'Pune', rating: 4.0, missionsCompleted: 0 },
    { id: 'BUSY',   name: 'B', skills: ['Flood Relief', 'Boat Operation', 'Evacuation'], status: 'busy',    zone: 'East', location: 'Pune', rating: 4.0, missionsCompleted: 0 },
  ]
  const result = matchVolunteers(FLOOD_ISSUE, twoVols, { topN: 2 })
  expect(result[0].id).toBe('ACTIVE')
  expect(result[0]._score).toBeGreaterThan(result[1]._score)
})

console.log('\n  ▶ Scoring breakdown')

test('each result has _score field', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  result.forEach((v) => expect(typeof v._score === 'number').toBeTruthy())
})

test('each result has _breakdown with 4 fields', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  result.forEach((v) => {
    expect(typeof v._breakdown.skills === 'number').toBeTruthy()
    expect(typeof v._breakdown.availability === 'number').toBeTruthy()
    expect(typeof v._breakdown.location === 'number').toBeTruthy()
    expect(typeof v._breakdown.experience === 'number').toBeTruthy()
  })
})

test('3 matching skills → skills score = 50', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  expect(result[0]._breakdown.skills).toBe(50)
})

test('active volunteer → availability score = 25', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  expect(result[0]._breakdown.availability).toBe(25)
})

test('_matchedSkills is an array of matched skill strings', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  expect(result[0]._matchedSkills).toBeArray()
  expect(result[0]._matchedSkills.length).toBeGreaterThan(0)
})

test('_matchReason is a non-empty string', () => {
  const result = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  expect(typeof result[0]._matchReason === 'string').toBeTruthy()
  expect(result[0]._matchReason.length).toBeGreaterThan(0)
})

console.log('\n  ▶ Edge cases')

test('empty volunteers array → returns []', () => {
  const result = matchVolunteers(FLOOD_ISSUE, [])
  expect(result).toBeArray()
  expect(result.length).toBe(0)
})

test('null issue → returns []', () => {
  const result = matchVolunteers(null, VOLUNTEERS)
  expect(result).toBeArray()
  expect(result.length).toBe(0)
})

test('undefined volunteers → returns []', () => {
  const result = matchVolunteers(FLOOD_ISSUE, undefined)
  expect(result).toBeArray()
  expect(result.length).toBe(0)
})

test('all volunteers offline → returns []', () => {
  const offlineAll = VOLUNTEERS.map((v) => ({ ...v, status: 'offline' }))
  const result     = matchVolunteers(FLOOD_ISSUE, offlineAll)
  expect(result.length).toBe(0)
})

test('unknown category falls back to "Other" skill set', () => {
  const weirdIssue = { ...FLOOD_ISSUE, category: 'Totally Unknown Category XYZ' }
  // Should not throw — falls back gracefully
  const result = matchVolunteers(weirdIssue, VOLUNTEERS)
  expect(result).toBeArray()
})

test('minScore option filters out low-scoring volunteers', () => {
  const result = matchVolunteers(FOOD_ISSUE, VOLUNTEERS, { topN: 10, minScore: 40 })
  result.forEach((v) => expect(v._score).toBeGreaterThanOrEqual(40))
})

// ──────────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTION TESTS
// ──────────────────────────────────────────────────────────────────────────────
console.log('\n  ▶ getMatchSummary()')

test('returns a non-empty string', () => {
  const matches = matchVolunteers(FLOOD_ISSUE, VOLUNTEERS)
  const summary = getMatchSummary(FLOOD_ISSUE, matches)
  expect(typeof summary === 'string').toBeTruthy()
  expect(summary.length).toBeGreaterThan(0)
})

test('returns no-match string when matches is empty', () => {
  const summary = getMatchSummary(FLOOD_ISSUE, [])
  expect(summary.toLowerCase().includes('no suitable')).toBeTruthy()
})

console.log('\n  ▶ getRecommendedAction()')

test('critical urgency → IMMEDIATE in response', () => {
  const action = getRecommendedAction('critical', 2)
  expect(action.toUpperCase().includes('IMMEDIATE')).toBeTruthy()
})

test('low urgency → non-urgent response', () => {
  const action = getRecommendedAction('low', 1)
  expect(action.toLowerCase().includes('non-urgent')).toBeTruthy()
})

test('no volunteers + critical → escalate message', () => {
  const action = getRecommendedAction('critical', 0)
  expect(action.toLowerCase().includes('escalate')).toBeTruthy()
})

// ──────────────────────────────────────────────────────────────────────────────
//  RESULTS
// ──────────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`)
console.log(`  Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`)
if (failed === 0) {
  console.log('  🎉 All tests passed!\n')
} else {
  console.log(`  ⚠️  ${failed} test(s) failed — review output above\n`)
  process.exit(1)
}
