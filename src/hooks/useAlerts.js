// src/hooks/useAlerts.js
// ─────────────────────────────────────────────────────────────────────────────
//  Generates a unified, real-time alert feed from three sources:
//
//  1. FIRESTORE ALERTS  — alerts explicitly saved to the `alerts` collection
//                         (written by issueService.js on every new submission)
//
//  2. DERIVED ALERTS    — auto-generated from live issue data:
//     • High-urgency unassigned issues (urgencyScore ≥ 8, no volunteers)
//     • Critical issues open for more than 30 minutes without assignment
//     • No available volunteers when critical issues exist
//
//  3. DUMMY FALLBACK    — the original ALERTS array if Firestore is not connected
//
//  Returns one sorted, de-duplicated array ready for AlertPanel to consume.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react'
import { subscribeToAlerts }           from '../services/firebase.js'
import { ALERTS as DUMMY_ALERTS }      from '../data/dummyData.js'

// ─── How long before an unassigned critical issue becomes an escalation ────────
const ESCALATION_THRESHOLD_MINUTES = 30

// ─── Derive alerts from current issues state ──────────────────────────────────
//  Pure function — given the live issues array, produce synthetic alert objects.
//  These are NOT stored in Firestore — they are computed on the client in real time.

function deriveAlertsFromIssues(issues, volunteers) {
  const derived   = []
  const now       = Date.now()

  issues.forEach((issue) => {
    // Skip resolved issues — no alert needed
    if (issue.status === 'resolved') return

    const reportedAt    = new Date(issue.reportedAt).getTime()
    const ageMinutes    = (now - reportedAt) / 60000
    const isUnassigned  = !issue.assignedVolunteers?.length
    const urgencyScore  = issue.urgencyScore ?? 5

    // ── Alert 1: High-urgency issue with no volunteers assigned ──────────────
    if (urgencyScore >= 8 && isUnassigned) {
      derived.push({
        id:        `derived-unassigned-${issue.id}`,
        type:      'critical',
        message:   `"${issue.title}" (${issue.category}) is UNASSIGNED. Urgency score: ${urgencyScore}/10. Immediate dispatch required.`,
        source:    'Auto-Monitor',
        timestamp: issue.reportedAt,
        isRead:    false,
        _derived:  true,
      })
    }

    // ── Alert 2: Critical issue open > threshold minutes without assignment ──
    if (
      issue.urgency === 'critical'          &&
      isUnassigned                          &&
      ageMinutes > ESCALATION_THRESHOLD_MINUTES
    ) {
      derived.push({
        id:        `derived-escalation-${issue.id}`,
        type:      'critical',
        message:   `ESCALATION: "${issue.title}" has been unassigned for ${Math.round(ageMinutes)} minutes. Escalate to field commander.`,
        source:    'Escalation Engine',
        timestamp: new Date().toISOString(),
        isRead:    false,
        _derived:  true,
      })
    }

    // ── Alert 3: High-urgency issue just resolved → success notification ─────
    if (issue.status === 'in-progress' && urgencyScore >= 7 && !isUnassigned) {
      derived.push({
        id:        `derived-active-${issue.id}`,
        type:      'info',
        message:   `${issue.assignedVolunteers?.length} volunteer(s) deployed to "${issue.title}" (${issue.location}).`,
        source:    'Dispatch Log',
        timestamp: issue.reportedAt,
        isRead:    true,   // info-level — pre-marked as read
        _derived:  true,
      })
    }
  })

  // ── Alert 4: No available volunteers when critical issues exist ─────────────
  const criticalOpen    = issues.filter((i) => i.urgency === 'critical' && i.status !== 'resolved').length
  const availableVols   = volunteers?.filter((v) => v.status === 'active').length ?? 0

  if (criticalOpen > 0 && availableVols === 0) {
    derived.push({
      id:        'derived-no-volunteers',
      type:      'critical',
      message:   `NO AVAILABLE VOLUNTEERS: ${criticalOpen} critical issue(s) pending with zero free responders. Contact reserve teams immediately.`,
      source:    'Resource Monitor',
      timestamp: new Date().toISOString(),
      isRead:    false,
      _derived:  true,
    })
  }

  // ── Alert 5: Low volunteer availability warning ──────────────────────────
  if (availableVols === 1 && criticalOpen > 0) {
    derived.push({
      id:        'derived-low-volunteers',
      type:      'warning',
      message:   `Only 1 volunteer available with ${criticalOpen} critical issue(s) active. Request backup deployment.`,
      source:    'Resource Monitor',
      timestamp: new Date().toISOString(),
      isRead:    false,
      _derived:  true,
    })
  }

  return derived
}

// ══════════════════════════════════════════════════════════════════════════════
//  useAlerts hook
// ══════════════════════════════════════════════════════════════════════════════

/**
 * useAlerts — unified real-time alert feed
 *
 * @param {Object}   options
 * @param {Object[]} options.issues      — live issues array (from useIssues)
 * @param {Object[]} options.volunteers  — live volunteers array (from useVolunteers)
 * @param {number}   [options.maxAlerts] — cap the total alerts returned (default 20)
 *
 * @returns {{
 *   alerts:      Object[],   ← sorted: unread critical first, then by timestamp
 *   unreadCount: number,
 *   markRead:    (id: string) => void,
 *   dismissAll:  () => void,
 * }}
 */
export function useAlerts({ issues = [], volunteers = [], maxAlerts = 20 } = {}) {
  // Firestore alerts (persisted)
  const [firestoreAlerts, setFirestoreAlerts] = useState([])
  const [firestoreError,  setFirestoreError]  = useState(false)

  // Local read/dismiss state (not persisted — resets on refresh, which is fine for hackathon)
  const [readIds,      setReadIds]      = useState(new Set())
  const [dismissedIds, setDismissedIds] = useState(new Set())

  // ── Subscribe to Firestore alerts collection ─────────────────────────────
  useEffect(() => {
    const unsub = subscribeToAlerts(
      (fresh) => {
        setFirestoreAlerts(fresh)
        setFirestoreError(false)
      },
      (err) => {
        console.warn('[useAlerts] Firestore subscription failed — using derived only:', err.message)
        setFirestoreError(true)
        // Fall back to dummy alerts when Firestore is not connected
        setFirestoreAlerts(DUMMY_ALERTS)
      },
    )
    return () => unsub()
  }, [])

  // ── Derive alerts from live issue state ──────────────────────────────────
  const derivedAlerts = deriveAlertsFromIssues(issues, volunteers)

  // ── Merge + deduplicate ───────────────────────────────────────────────────
  //  Derived alerts take priority over Firestore alerts with the same base issue ID.
  //  Firestore alerts that are duplicated by a derived alert are removed.
  const derivedIds = new Set(derivedAlerts.map((a) => a.id))

  const merged = [
    ...derivedAlerts,
    ...firestoreAlerts.filter((a) => !derivedIds.has(a.id)),
  ]

  // ── Apply local read/dismiss state ────────────────────────────────────────
  const withLocalState = merged
    .filter((a) => !dismissedIds.has(a.id))
    .map((a) => ({
      ...a,
      isRead: a.isRead || readIds.has(a.id),
    }))

  // ── Sort: unread critical first → then by timestamp desc ─────────────────
  const TYPE_PRIORITY = { critical: 0, warning: 1, info: 2, success: 3 }
  const sorted = withLocalState.sort((a, b) => {
    // Unread before read
    if (!a.isRead && b.isRead) return -1
    if (a.isRead && !b.isRead) return  1
    // Within same read status: sort by type priority
    const typeDiff = (TYPE_PRIORITY[a.type] ?? 9) - (TYPE_PRIORITY[b.type] ?? 9)
    if (typeDiff !== 0) return typeDiff
    // Finally: newest first
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

  const alerts      = sorted.slice(0, maxAlerts)
  const unreadCount = alerts.filter((a) => !a.isRead).length

  // ── Actions ───────────────────────────────────────────────────────────────
  function markRead(id) {
    setReadIds((prev) => new Set([...prev, id]))
  }

  function markAllRead() {
    setReadIds((prev) => new Set([...prev, ...alerts.map((a) => a.id)]))
  }

  function dismiss(id) {
    setDismissedIds((prev) => new Set([...prev, id]))
    markRead(id)
  }

  function dismissAll() {
    alerts.forEach((a) => {
      setDismissedIds((prev) => new Set([...prev, a.id]))
    })
  }

  return { alerts, unreadCount, markRead, markAllRead, dismiss, dismissAll }
}
