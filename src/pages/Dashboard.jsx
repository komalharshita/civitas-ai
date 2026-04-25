// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
//  Master dashboard orchestrator.
//  Owns ALL shared state and connects every service hook to every UI panel.
//
//  Data flow:
//    Firestore ──► useIssues()       ──► IssueList + IssueCard + MapPanel
//    Firestore ──► useVolunteers()   ──► VolunteerPanel (roster tab)
//    selectedIssue + volunteers ──► useMatchedVolunteers() ──► VolunteerPanel (matched tab)
//    issues + volunteers ──► useAlerts() ──► AlertPanel + Header unread count
//    IssueForm.onSubmit ──► optimistic update ──► all panels refresh instantly
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'

// UI panels
import IssueList      from '../components/dashboard/IssueList'
import MapPanel       from '../components/dashboard/MapPanel'
import VolunteerPanel from '../components/dashboard/VolunteerPanel'
import AlertPanel     from '../components/dashboard/AlertPanel'
import MetricsBar     from '../components/dashboard/MetricsBar'
import IssueForm      from '../components/modals/IssueForm'

// Data hooks
import { useIssues, useIssueMetrics }    from '../hooks/useIssues'
import { useVolunteers }                  from '../hooks/useVolunteers'
import { useMatchedVolunteers }           from '../hooks/useMatchedVolunteers'
import { useAlerts }                      from '../hooks/useAlerts'

// Static fallback for the averageResponseTime metric (computed from real data in v2)
import { METRICS } from '../data/dummyData'

export default function Dashboard({ onNewIssue, showIssueForm, onCloseForm, onUnreadChange }) {
  // ── Selected issue (drives matching + map detail) ─────────────────────────
  const [selectedIssue, setSelectedIssue] = useState(null)

  // ── Optimistic issues (added locally before Firestore confirms) ───────────
  // Gives instant UI feedback after IssueForm submit without waiting for Firestore snapshot
  const [optimisticIssues, setOptimisticIssues] = useState([])

  // ── Live Firestore subscriptions ──────────────────────────────────────────
  const {
    issues:   firestoreIssues,
    loading:  issuesLoading,
    error:    issuesError,
  } = useIssues()

  const {
    volunteers,
    loading:        volunteersLoading,
    error:          volunteersError,
    availableCount,
    deployedCount,
  } = useVolunteers()

  // ── Merge optimistic + Firestore issues (deduplicate by id) ──────────────
  // Optimistic issues sit at the top; once Firestore confirms them they are
  // removed from the optimistic array (ids will match and be deduplicated).
  const allIssues = [
    ...optimisticIssues,
    ...firestoreIssues.filter(
      (fi) => !optimisticIssues.some((oi) => oi.id === fi.id)
    ),
  ]

  // ── Reactive volunteer matching ───────────────────────────────────────────
  // Re-runs automatically whenever selectedIssue or volunteers change
  const {
    matches:           matchedVolunteers,
    isMatching,
    matchSummary,
    recommendedAction,
  } = useMatchedVolunteers({ issue: selectedIssue, volunteers, topN: 3 })

  // ── Derived metrics from live data ───────────────────────────────────────
  const issueMetrics = useIssueMetrics(allIssues)
  const liveMetrics  = {
    ...METRICS,
    activeIssues:        issueMetrics.activeIssues,
    criticalCount:       issueMetrics.criticalCount,
    resolvedToday:       issueMetrics.resolvedToday,
    volunteersAvailable: availableCount,
    volunteersDeployed:  deployedCount,
  }

  // ── Live alerts (derived from issue state + Firestore alerts collection) ──
  const {
    alerts,
    unreadCount,
    markRead,
    markAllRead,
    dismiss,
  } = useAlerts({ issues: allIssues, volunteers })

  // ── Propagate unread count up to App → Header bell badge ─────────────────
  React.useEffect(() => {
    onUnreadChange?.(unreadCount)
  }, [unreadCount])

  // ── Issue form submit handler ─────────────────────────────────────────────
  // Called by IssueForm after the full pipeline (AI → match → Firestore save) completes.
  // newIssue is the enriched issue object returned by issueService.submitIssue().
  const handleIssueSubmit = useCallback((newIssue) => {
    // 1. Optimistically prepend the new issue so the list updates instantly
    setOptimisticIssues((prev) => [newIssue, ...prev])
    // 2. Auto-select it so matching runs and map zooms in immediately
    setSelectedIssue(newIssue)
    // 3. Close the form
    onCloseForm()
  }, [onCloseForm])

  // ── Select issue handler (also switches VolunteerPanel to matched mode) ───
  function handleSelectIssue(issue) {
    setSelectedIssue((prev) => prev?.id === issue.id ? null : issue)
  }

  // ── Loading screen (shown only on the very first load) ───────────────────
  const isInitialLoading = issuesLoading && allIssues.length === 0
  if (isInitialLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center" style={{ background: 'var(--color-base)', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '2px solid var(--color-border)', borderTop: '2px solid var(--color-cyan)', borderRadius: '50%', animation: 'dashSpin 1s linear infinite' }} />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
          CONNECTING TO FIRESTORE…
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)' }}>
          Loading live issue and volunteer data
        </div>
        <style>{`@keyframes dashSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Connection error banner (non-blocking — falls back to dummy data) ─────
  const hasError = issuesError || volunteersError

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Error banner (dismissable) ── */}
      {hasError && (
        <div
          className="flex items-center gap-3 px-4 py-2 flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'statusPulse 1.5s infinite', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#ef4444', flex: 1 }}>
            Firestore connection issue — showing cached data. Check your <code>.env</code> config and Firestore rules.
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(239,68,68,0.6)', letterSpacing: '0.08em' }}>
            FALLBACK MODE
          </span>
        </div>
      )}

      {/* ── KPI metric bar ── */}
      <MetricsBar metrics={liveMetrics} />

      {/* ── Three-column main area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Column 1: Issue List — shows all issues, handles selection */}
        <div style={{ width: 320, minWidth: 300, flexShrink: 0, overflow: 'hidden', display: 'flex' }}>
          <IssueList
            issues={allIssues}
            selectedIssue={selectedIssue}
            onSelectIssue={handleSelectIssue}
            onNewIssue={onNewIssue}
          />
        </div>

        {/* Column 2: Map — shows pins for all issues, detail drawer for selected */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MapPanel
            issues={allIssues}
            selectedIssue={selectedIssue}
            onSelectIssue={handleSelectIssue}
          />
        </div>

        {/* Column 3: Volunteer Panel — matched tab + full roster tab */}
        <div style={{ width: 300, minWidth: 280, flexShrink: 0, overflow: 'hidden', display: 'flex' }}>
          <VolunteerPanel
            volunteers={volunteers}
            matchedVolunteers={matchedVolunteers}
            isMatching={isMatching}
            selectedIssue={selectedIssue}
          />
        </div>
      </div>

      {/* ── Alert bar — live derived + Firestore alerts ── */}
      <AlertPanel
        alerts={alerts}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDismiss={dismiss}
      />

      {/* ── Issue form modal — full AI + Firestore pipeline ── */}
      {showIssueForm && (
        <IssueForm
          onClose={onCloseForm}
          onSubmit={handleIssueSubmit}
        />
      )}
    </div>
  )
}
