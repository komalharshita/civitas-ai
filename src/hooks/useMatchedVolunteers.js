// src/hooks/useMatchedVolunteers.js
// ─────────────────────────────────────────────────────────────────────────────
//  Runs the volunteer matching engine reactively whenever the selected issue
//  or the volunteer roster changes. Returns scored, ranked volunteer matches.
//
//  Usage:
//    const { matches, isMatching, matchSummary } = useMatchedVolunteers({
//      issue:      selectedIssue,
//      volunteers: allVolunteers,
//    })
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { matchVolunteers, getMatchSummary, getRecommendedAction } from '../services/matchService.js'

/**
 * useMatchedVolunteers
 *
 * @param {Object}   options
 * @param {Object|null} options.issue       — currently selected issue (or null)
 * @param {Object[]}    options.volunteers  — full volunteer roster from Firestore
 * @param {number}      [options.topN=3]   — how many top matches to return
 *
 * @returns {{
 *   matches:           Object[],   ← top N scored volunteers
 *   isMatching:        boolean,    ← true while engine is running
 *   matchSummary:      string,     ← human-readable dispatch summary
 *   recommendedAction: string,     ← urgency-based action string
 *   hasMatches:        boolean,
 * }}
 */
export function useMatchedVolunteers({ issue = null, volunteers = [], topN = 3 }) {
  const [matches,           setMatches]           = useState([])
  const [isMatching,        setIsMatching]         = useState(false)
  const [matchSummary,      setMatchSummary]       = useState('')
  const [recommendedAction, setRecommendedAction]  = useState('')

  useEffect(() => {
    // Nothing to match against if no issue is selected
    if (!issue || !volunteers.length) {
      setMatches([])
      setMatchSummary('')
      setRecommendedAction('')
      return
    }

    setIsMatching(true)

    // matchVolunteers is synchronous (pure JS scoring — no network needed)
    // Wrap in a tiny timeout so the "matching…" spinner is actually visible
    const timer = setTimeout(() => {
      try {
        const top     = matchVolunteers(issue, volunteers, { topN })
        const summary = getMatchSummary(issue, top)
        const action  = getRecommendedAction(issue.urgency, top.length)

        setMatches(top)
        setMatchSummary(summary)
        setRecommendedAction(action)
      } catch (err) {
        console.error('[useMatchedVolunteers] Matching failed:', err)
        setMatches([])
        setMatchSummary('Matching unavailable.')
        setRecommendedAction('')
      } finally {
        setIsMatching(false)
      }
    }, 120) // 120ms — just enough for the spinner to flash

    return () => clearTimeout(timer)
  }, [
    issue?.id,        // re-run when selected issue changes
    issue?.category,  // re-run if AI reclassifies the issue
    issue?.urgency,
    issue?.location,
    volunteers.length, // re-run when volunteer roster changes
  ])

  return {
    matches,
    isMatching,
    matchSummary,
    recommendedAction,
    hasMatches: matches.length > 0,
  }
}
