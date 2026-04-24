// src/services/issueService.js
// ─────────────────────────────────────────────────────────────────────────────
//  Main orchestration layer — the single function your IssueForm calls
//
//  Complete flow when a user submits a new issue:
//
//  IssueForm submits
//        │
//        ▼
//  [1] Classify with Gemini AI  ──────────────── gets category, urgency, summary
//        │
//        ▼
//  [2] Fetch all volunteers from Firestore
//        │
//        ▼
//  [3] Run matchVolunteers() scoring engine ───── top 3 best matches
//        │
//        ▼
//  [4] Save complete issue document to Firestore
//        │
//        ▼
//  [5] Log a system alert to Firestore
//        │
//        ▼
//  Return { issueId, aiResult, matchedVolunteers, matchSummary }
//
// ─────────────────────────────────────────────────────────────────────────────

import { classifyIssueWithFallback }        from './aiService.js'
import { matchVolunteers, getMatchSummary, getRecommendedAction } from './matchService.js'
import {
  addIssue,
  fetchVolunteers,
  updateIssue,
  updateVolunteerStatus,
  addAlert,
}                                           from './firebase.js'

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN ORCHESTRATION FUNCTION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * submitIssue — the complete issue submission pipeline
 *
 * @param {Object} formData — raw data from IssueForm
 * @param {string} formData.title
 * @param {string} formData.description
 * @param {string} formData.location
 * @param {string} [formData.reportedBy]
 * @param {Object} [formData.coordinates]   — { lat, lng } from map click or geocoder
 * @param {string} [formData.category]      — user-provided override (optional)
 * @param {string} [formData.urgency]       — user-provided override (optional)
 *
 * @param {Object} options
 * @param {boolean} [options.autoAssign=false]  — if true, update matched volunteers to 'busy'
 * @param {number}  [options.topN=3]            — number of volunteers to match
 * @param {Function} [options.onProgress]       — callback for progress steps
 *   Called with { step: string, progress: number (0–100), data?: any }
 *
 * @returns {Promise<{
 *   issueId:           string,          ← Firestore document ID
 *   aiResult:          Object,          ← classification from Gemini
 *   matchedVolunteers: Object[],        ← top N volunteers with scores
 *   matchSummary:      string,          ← human-readable dispatch summary
 *   recommendedAction: string,
 * }>}
 *
 * Usage in IssueForm.jsx:
 *   const result = await submitIssue(formData, {
 *     onProgress: ({ step, progress }) => setProgress({ step, progress })
 *   })
 */
export async function submitIssue(formData, options = {}) {
  const {
    autoAssign  = false,
    topN        = 3,
    onProgress  = () => {},   // no-op default
  } = options

  // Helper to report progress steps back to the UI
  function progress(step, pct, data = {}) {
    onProgress({ step, progress: pct, ...data })
    console.log(`[submitIssue] ${pct}% — ${step}`)
  }

  // ── Step 1: Classify with AI ───────────────────────────────────────────────
  progress('Analysing issue with Gemini AI…', 10)

  const aiResult = await classifyIssueWithFallback(
    formData.title,
    formData.description,
    formData.location,
  )

  // User can override AI category/urgency from the form — respect that
  const finalCategory = formData.category || aiResult.category
  const finalUrgency  = formData.urgency  || aiResult.urgency

  progress('AI classification complete', 35, { aiResult })

  // ── Step 2: Fetch volunteers ───────────────────────────────────────────────
  progress('Fetching volunteer roster…', 45)

  let volunteers = []
  try {
    volunteers = await fetchVolunteers()
  } catch (err) {
    console.warn('[submitIssue] Could not fetch volunteers from Firestore:', err.message)
    // Don't abort — issue can still be saved without matches
  }

  progress('Volunteer roster loaded', 60, { volunteerCount: volunteers.length })

  // ── Step 3: Match volunteers ───────────────────────────────────────────────
  progress('Running dispatch matching engine…', 65)

  // Build a temporary issue object for the matcher
  const issueForMatching = {
    title:    formData.title,
    location: formData.location,
    category: finalCategory,
    urgency:  finalUrgency,
  }

  const matchedVolunteers = matchVolunteers(issueForMatching, volunteers, { topN })
  const matchSummary      = getMatchSummary(issueForMatching, matchedVolunteers)
  const recommendedAction = getRecommendedAction(finalUrgency, matchedVolunteers.length)

  progress('Volunteers matched', 75, { matchedVolunteers })

  // ── Step 4: Save issue to Firestore ───────────────────────────────────────
  progress('Saving issue to database…', 80)

  const issueDocument = {
    // Form data
    title:              formData.title,
    description:        formData.description,
    location:           formData.location,
    coordinates:        formData.coordinates ?? { lat: 18.5204, lng: 73.8567 },
    reportedBy:         formData.reportedBy ?? 'Anonymous',

    // AI-enriched fields
    category:           finalCategory,
    urgency:            finalUrgency,
    urgencyScore:       aiResult.urgencyScore,
    aiSummary:          aiResult.summary,
    tags:               aiResult.tags ?? [],

    // Assignment
    status:             'open',
    assignedVolunteers: autoAssign
      ? matchedVolunteers.filter((v) => v.status === 'active').map((v) => v.id)
      : [],

    // Metadata
    matchSummary,
    recommendedAction,
    aiFallback:         aiResult._fallback ?? false,   // flag if AI was unavailable
  }

  const issueId = await addIssue(issueDocument)

  progress('Issue saved to database', 90, { issueId })

  // ── Step 5: Auto-assign — update volunteer status ──────────────────────────
  if (autoAssign && matchedVolunteers.length > 0) {
    progress('Updating volunteer assignments…', 92)

    const assignable = matchedVolunteers.filter((v) => v.status === 'active')
    await Promise.allSettled(   // allSettled so one failure doesn't block the rest
      assignable.map((v) => updateVolunteerStatus(v.id, 'busy', issueId))
    )
  }

  // ── Step 6: Add system alert ───────────────────────────────────────────────
  const alertType    = finalUrgency === 'critical' ? 'critical' : 'info'
  const alertMessage = `New ${finalCategory} issue reported: "${formData.title}". ${matchedVolunteers.length} volunteer(s) matched.`
  await addAlert(alertType, alertMessage, 'Civitas AI Engine')

  progress('Complete', 100, { issueId, matchedVolunteers })

  // ── Return everything the UI needs ─────────────────────────────────────────
  return {
    issueId,
    aiResult,
    matchedVolunteers,
    matchSummary,
    recommendedAction,
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONVENIENCE WRAPPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * reclassifyIssue — re-run AI on an existing issue (e.g. when description changes)
 * Does NOT create a new document — updates the existing one.
 *
 * @param {string} issueId
 * @param {Object} issueData — { title, description, location }
 * @returns {Promise<Object>} — new AI result
 */
export async function reclassifyIssue(issueId, issueData) {

  const aiResult = await classifyIssueWithFallback(
    issueData.title,
    issueData.description,
    issueData.location,
  )

  await updateIssue(issueId, {
    category:     aiResult.category,
    urgency:      aiResult.urgency,
    urgencyScore: aiResult.urgencyScore,
    aiSummary:    aiResult.summary,
    tags:         aiResult.tags,
  })

  return aiResult
}

/**
 * reassignVolunteers — re-run matching for an already-saved issue
 * Useful when new volunteers register or an issue description changes.
 *
 * @param {Object} issue      — existing issue object (from Firestore)
 * @param {number} [topN=3]
 * @returns {Promise<Object[]>} — new match list
 */
export async function reassignVolunteers(issue, topN = 3) {
  const volunteers        = await fetchVolunteers()
  const matchedVolunteers = matchVolunteers(issue, volunteers, { topN })
  return matchedVolunteers
}
