// src/services/matchService.js
// ─────────────────────────────────────────────────────────────────────────────
//  Volunteer matching engine — pure JavaScript, no external dependencies
//
//  Scoring system (max 100 points per volunteer):
//  ┌─────────────────────────────┬────────────────────────────────────────────┐
//  │ Factor                      │ Max Points   │ Description                 │
//  ├─────────────────────────────┼──────────────┼─────────────────────────────┤
//  │ Skill match                 │ 50 pts       │ Highest weight — core fit   │
//  │ Availability                │ 25 pts       │ Only active vols get points │
//  │ Location / zone             │ 15 pts       │ Proximity to issue          │
//  │ Rating & experience         │ 10 pts       │ Tie-breaker                 │
//  └─────────────────────────────┴──────────────┴─────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

// ─── Skill → Category mapping ─────────────────────────────────────────────────
//  Maps each AI-assigned category to a list of relevant volunteer skills.
//  The matching engine checks how many of a volunteer's skills appear here.

const CATEGORY_SKILL_MAP = {
  'Flood Relief':    ['Flood Relief', 'Boat Operation', 'Evacuation', 'Swimming', 'Heavy Lifting', 'First Aid'],
  'Medical Aid':     ['Medical', 'First Aid', 'CPR', 'Nursing', 'Triage', 'Paramedic'],
  'Food & Water':    ['Food Distribution', 'Logistics', 'Cooking', 'Supply Chain', 'Coordination'],
  'Infrastructure':  ['Infrastructure', 'Chainsaw', 'Heavy Equipment', 'Construction', 'Electrical'],
  'Search & Rescue': ['Search & Rescue', 'Navigation', 'First Aid', 'Rope Rescue', 'Dog Handling'],
  'Animal Welfare':  ['Animal Welfare', 'Veterinary', 'Animal Rescue', 'Transportation'],
  'Shelter':         ['Shelter Management', 'Logistics', 'Coordination', 'Counselling'],
  'Communication':   ['Communication', 'Satellite Ops', 'Coordination', 'Translation', 'Radio Ops'],
  'Other':           ['General Volunteering', 'Coordination', 'Logistics', 'First Aid'],
}

// ─── Zone → nearby zones mapping ─────────────────────────────────────────────
//  Defines which zones are adjacent — used for partial location matching.
//  (This is Pune-district specific; adapt for your geography)

const ADJACENT_ZONES = {
  'Central':    ['North-East', 'East', 'West', 'South'],
  'East':       ['Central', 'North-East', 'South'],
  'North-East': ['Central', 'East'],
  'West':       ['Central', 'South'],
  'South':      ['Central', 'West', 'East'],
}

// ──────────────────────────────────────────────────────────────────────────────
//  SCORING FUNCTIONS
//  Each returns a partial score (0 → max for that factor)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * scoreSkills — how well does this volunteer's skill set match the issue category?
 *
 * Points breakdown:
 *   - 3+ matching skills → 50 pts (perfect match)
 *   - 2 matching skills  → 35 pts
 *   - 1 matching skill   → 20 pts
 *   - 0 matching skills  → 0 pts
 *
 * @param {string[]} volunteerSkills  — e.g. ['First Aid', 'Medical', 'CPR']
 * @param {string}   issueCategory    — e.g. 'Medical Aid'
 * @returns {{ score: number, matchedSkills: string[] }}
 */
function scoreSkills(volunteerSkills, issueCategory) {
  const requiredSkills = CATEGORY_SKILL_MAP[issueCategory] ?? CATEGORY_SKILL_MAP['Other']

  // Find which of the volunteer's skills appear in the required list
  const matchedSkills = volunteerSkills.filter((skill) =>
    requiredSkills.some(
      (req) => req.toLowerCase() === skill.toLowerCase()
    )
  )

  const count = matchedSkills.length
  let score   = 0

  if      (count >= 3) score = 50
  else if (count === 2) score = 35
  else if (count === 1) score = 20
  // else score stays 0

  return { score, matchedSkills }
}

/**
 * scoreAvailability — is the volunteer free to take this assignment?
 *
 * Points breakdown:
 *   - 'active' (available)  → 25 pts
 *   - 'busy' (on mission)   → 0 pts (can't be assigned)
 *   - 'offline'             → 0 pts
 *
 * @param {string} volunteerStatus
 * @returns {number}
 */
function scoreAvailability(volunteerStatus) {
  return volunteerStatus === 'active' ? 25 : 0
}

/**
 * scoreLocation — how close is the volunteer to the issue location?
 *
 * Strategy: We compare zone strings and keyword overlap in location names.
 * For a hackathon this is a good approximation; use real geo-distance in prod.
 *
 * Points breakdown:
 *   - Exact zone match          → 15 pts
 *   - Adjacent zone             → 8 pts
 *   - Same city keyword match   → 5 pts
 *   - No overlap                → 0 pts
 *
 * @param {Object} volunteer   — { location: string, zone: string }
 * @param {string} issueLocation — e.g. 'Koregaon Park, Pune'
 * @param {string} issueZone   — zone hint if available (can be derived from location)
 * @returns {number}
 */
function scoreLocation(volunteer, issueLocation, issueZone = '') {
  const volZone  = volunteer.zone?.trim()   ?? ''
  const volLoc   = volunteer.location?.toLowerCase() ?? ''
  const issueLoc = issueLocation?.toLowerCase()      ?? ''

  // 1. Exact zone match (best)
  if (volZone && issueZone && volZone.toLowerCase() === issueZone.toLowerCase()) {
    return 15
  }

  // 2. Adjacent zones
  const adjacent = ADJACENT_ZONES[volZone] ?? []
  if (issueZone && adjacent.map((z) => z.toLowerCase()).includes(issueZone.toLowerCase())) {
    return 8
  }

  // 3. Keyword overlap in location strings (city / neighbourhood names)
  const issueWords = issueLoc.split(/[,\s]+/).filter((w) => w.length > 3)
  const volWords   = volLoc.split(/[,\s]+/).filter((w) => w.length > 3)
  const overlap    = issueWords.filter((w) => volWords.includes(w))

  if (overlap.length > 0) return 5

  return 0
}

/**
 * scoreExperience — rating + missions as a tie-breaker
 *
 * Points breakdown:
 *   - rating × 1.2          (max ~6 pts for rating 5.0)
 *   - log of missions × 1.5 (max ~4 pts for 30+ missions, diminishing returns)
 *
 * @param {number} rating
 * @param {number} missionsCompleted
 * @returns {number}
 */
function scoreExperience(rating = 0, missionsCompleted = 0) {
  const ratingPts   = Math.min(rating * 1.2, 6)
  const missionPts  = Math.min(Math.log1p(missionsCompleted) * 1.5, 4)
  return Math.round(ratingPts + missionPts)
}

// ──────────────────────────────────────────────────────────────────────────────
//  MAIN MATCHING FUNCTION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * matchVolunteers — score all volunteers against an issue and return the top 3
 *
 * @param {Object}   issue      — issue object (needs category, location, urgency)
 * @param {Object[]} volunteers — full volunteer array from Firestore
 * @param {Object}   options
 * @param {number}   options.topN              — how many to return (default 3)
 * @param {boolean}  options.availableOnly     — if true, skip busy volunteers (default false)
 * @param {number}   options.minScore          — minimum score threshold (default 0)
 * @returns {Object[]} — top N volunteers with score breakdown attached
 *
 * Return shape:
 * [
 *   {
 *     ...volunteer,         ← all original volunteer fields
 *     _score: 78,           ← total score (0–100)
 *     _breakdown: {
 *       skills:       50,
 *       availability: 25,
 *       location:     3,
 *       experience:   0,
 *     },
 *     _matchedSkills: ['Flood Relief', 'Evacuation'],
 *     _matchReason:   'Strong skill match (Flood Relief, Evacuation) · Available · Nearby zone',
 *   },
 *   ...
 * ]
 *
 * Usage:
 *   const volunteers = await fetchVolunteers()
 *   const matches    = matchVolunteers(issue, volunteers, { topN: 3 })
 */
export function matchVolunteers(issue, volunteers, options = {}) {
  const {
    topN          = 3,
    availableOnly = false,
    minScore      = 0,
  } = options

  if (!issue || !volunteers?.length) {
    return []
  }

  // ── Derive zone hint from issue location ──────────────────────────────────
  // Simple keyword-to-zone lookup for Pune (expand as needed)
  const issueZone = deriveZoneFromLocation(issue.location)

  // ── Score every volunteer ─────────────────────────────────────────────────
  const scored = volunteers
    .filter((vol) => {
      // Hard filter: skip offline volunteers entirely
      if (vol.status === 'offline') return false
      // Optional: skip busy volunteers
      if (availableOnly && vol.status !== 'active') return false
      return true
    })
    .map((vol) => {
      // Run each scoring component
      const { score: skillScore, matchedSkills } = scoreSkills(
        vol.skills ?? [], issue.category
      )
      const availScore  = scoreAvailability(vol.status)
      const locScore    = scoreLocation(vol, issue.location, issueZone)
      const expScore    = scoreExperience(vol.rating, vol.missionsCompleted)

      const totalScore  = skillScore + availScore + locScore + expScore

      // Build a human-readable reason string (shown in the UI)
      const reasons = []
      if (matchedSkills.length > 0) reasons.push(`Skills: ${matchedSkills.join(', ')}`)
      if (availScore > 0)           reasons.push('Available')
      if (locScore  > 0)            reasons.push('Nearby location')
      if (expScore  > 6)            reasons.push('Experienced responder')
      const matchReason = reasons.join(' · ') || 'General volunteer'

      return {
        ...vol,
        _score:         totalScore,
        _breakdown:     { skills: skillScore, availability: availScore, location: locScore, experience: expScore },
        _matchedSkills: matchedSkills,
        _matchReason:   matchReason,
      }
    })
    // Filter by minimum score
    .filter((vol) => vol._score >= minScore)

  // ── Sort by score (highest first) ─────────────────────────────────────────
  scored.sort((a, b) => {
    if (b._score !== a._score) return b._score - a._score
    // Tie-breaker: prefer available over busy
    if (a.status === 'active' && b.status !== 'active') return -1
    if (b.status === 'active' && a.status !== 'active') return  1
    // Final tie-breaker: rating
    return (b.rating ?? 0) - (a.rating ?? 0)
  })

  const top = scored.slice(0, topN)

  console.log(
    `[Match] Issue "${issue.title}" (${issue.category}) → ` +
    `top ${top.length} volunteers:`,
    top.map((v) => `${v.name} (${v._score}pts)`)
  )

  return top
}

// ──────────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * deriveZoneFromLocation — map a location string to a zone name
 * Extend this lookup as your data grows.
 *
 * @param {string} location
 * @returns {string} — zone name or ''
 */
function deriveZoneFromLocation(location = '') {
  const loc = location.toLowerCase()

  if (loc.includes('koregaon') || loc.includes('kalyani') || loc.includes('hadapsar') || loc.includes('viman')) {
    return 'East'
  }
  if (loc.includes('north') || loc.includes('wakad') || loc.includes('pimple')) {
    return 'North-East'
  }
  if (loc.includes('baner') || loc.includes('aundh') || loc.includes('kothrud') || loc.includes('bavdhan')) {
    return 'West'
  }
  if (loc.includes('panshet') || loc.includes('sinhgad') || loc.includes('katraj') || loc.includes('ambegaon')) {
    return 'South'
  }
  if (loc.includes('deccan') || loc.includes('shivaji') || loc.includes('fcroad') || loc.includes('camp') || loc.includes('pune station')) {
    return 'Central'
  }

  return ''  // unknown zone — location scoring will use keyword fallback
}

/**
 * getMatchSummary — generate a human-readable dispatch summary for an issue
 *
 * @param {Object}   issue    — the issue object
 * @param {Object[]} matches  — result from matchVolunteers()
 * @returns {string}
 *
 * Example output:
 *   "DISPATCH READY: 3 volunteers matched for Flood Relief issue.
 *    Recommended: Rahul Desai (50pts), Amit Kulkarni (35pts), Divya Iyer (20pts)"
 */
export function getMatchSummary(issue, matches) {
  if (!matches?.length) {
    return `No suitable volunteers found for "${issue.category}" in ${issue.location}. Consider expanding search criteria.`
  }

  const names    = matches.map((m) => `${m.name} (${m._score}pts)`).join(', ')
  const available = matches.filter((m) => m.status === 'active').length

  return (
    `DISPATCH READY: ${matches.length} volunteer(s) matched for ${issue.category} in ${issue.location}. ` +
    `${available} immediately available. ` +
    `Recommended: ${names}.`
  )
}

/**
 * getRecommendedAction — produce an urgency-based action recommendation
 *
 * @param {string} urgency — 'critical'|'high'|'medium'|'low'
 * @param {number} matchCount
 * @returns {string}
 */
export function getRecommendedAction(urgency, matchCount) {
  const actions = {
    critical: `IMMEDIATE DISPATCH REQUIRED. ${matchCount > 0 ? 'Contact all matched volunteers now.' : 'No volunteers available — escalate to EOC.'}`,
    high:     `Deploy within 1 hour. ${matchCount > 0 ? 'Notify top volunteer immediately.' : 'Alert backup teams.'}`,
    medium:   `Schedule within 2–4 hours. ${matchCount > 0 ? 'Assign to available volunteer.' : 'Queue for next available slot.'}`,
    low:      `Non-urgent. ${matchCount > 0 ? 'Assign during next check-in.' : 'Add to waitlist.'}`,
  }

  return actions[urgency] ?? actions.medium
}
