// src/hooks/useIssues.js
// ─────────────────────────────────────────────────────────────────────────────
//  React hook — subscribes to Firestore issues in real time
//  Automatically unsubscribes when the component using it unmounts.
//
//  Usage:
//    const { issues, loading, error } = useIssues()
//    const { issues } = useIssues({ status: 'open' })  // filtered
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { subscribeToIssues }           from '../services/firebase.js'
import { ISSUES as DUMMY_ISSUES }      from '../data/dummyData.js'

/**
 * useIssues — live Firestore subscription hook
 *
 * @param {Object}      options
 * @param {string|null} [options.status]     — filter by status ('open', 'in-progress', etc.)
 * @param {boolean}     [options.useDummyFallback=true] — fall back to dummy data if Firestore fails
 *
 * @returns {{
 *   issues:   Object[],
 *   loading:  boolean,
 *   error:    string|null,
 *   refresh:  () => void,   ← force a re-subscribe
 * }}
 */
export function useIssues({ status = null, useDummyFallback = true } = {}) {
  const [issues,  setIssues]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tick,    setTick]    = useState(0)    // increment to force re-subscribe

  // Keep a ref to the unsubscribe function so we can call it on cleanup
  const unsubRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Subscribe to real-time updates
    const unsub = subscribeToIssues(
      (freshIssues) => {
        // Apply client-side status filter if provided
        const filtered = status
          ? freshIssues.filter((i) => i.status === status)
          : freshIssues

        setIssues(filtered)
        setLoading(false)
      },
      (err) => {
        console.error('[useIssues] Firestore subscription error:', err)
        setError(err.message)
        setLoading(false)

        // Fall back to dummy data so the UI doesn't break during development
        if (useDummyFallback) {
          console.warn('[useIssues] Falling back to dummy data.')
          const filtered = status
            ? DUMMY_ISSUES.filter((i) => i.status === status)
            : DUMMY_ISSUES
          setIssues(filtered)
        }
      },
    )

    unsubRef.current = unsub

    // Cleanup: unsubscribe when component unmounts or dependencies change
    return () => {
      if (unsubRef.current) {
        unsubRef.current()
        unsubRef.current = null
      }
    }
  }, [status, tick])  // re-run if status filter or tick changes

  // refresh() forces a new subscription (useful after manual data changes)
  function refresh() {
    if (unsubRef.current) unsubRef.current()
    setTick((t) => t + 1)
  }

  return { issues, loading, error, refresh }
}

/**
 * useIssueMetrics — derived metrics computed from the live issues array
 * Avoids redundant Firestore queries — all derived from the already-subscribed data.
 *
 * @param {Object[]} issues — from useIssues()
 * @returns {{
 *   activeIssues:        number,
 *   resolvedToday:       number,
 *   criticalCount:       number,
 *   openCount:           number,
 *   inProgressCount:     number,
 * }}
 */
export function useIssueMetrics(issues = []) {
  const today       = new Date().toDateString()

  const activeIssues    = issues.filter((i) => i.status !== 'resolved').length
  const resolvedToday   = issues.filter((i) => {
    if (i.status !== 'resolved') return false
    const resolvedDate  = new Date(i.reportedAt).toDateString()
    return resolvedDate === today
  }).length
  const criticalCount   = issues.filter((i) => i.urgency === 'critical' && i.status !== 'resolved').length
  const openCount       = issues.filter((i) => i.status === 'open').length
  const inProgressCount = issues.filter((i) => i.status === 'in-progress').length

  return { activeIssues, resolvedToday, criticalCount, openCount, inProgressCount }
}
