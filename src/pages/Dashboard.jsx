// src/pages/Dashboard.jsx
// ─── Main dashboard — now powered by live Firestore data ───────

import React, { useState }         from 'react'
import IssueList                   from '../components/dashboard/IssueList'
import MapPanel                    from '../components/dashboard/MapPanel'
import VolunteerPanel              from '../components/dashboard/VolunteerPanel'
import AlertPanel                  from '../components/dashboard/AlertPanel'
import MetricsBar                  from '../components/dashboard/MetricsBar'
import IssueForm                   from '../components/modals/IssueForm'
import { useIssues, useIssueMetrics } from '../hooks/useIssues'
import { useVolunteers }           from '../hooks/useVolunteers'
import { ALERTS, METRICS }         from '../data/dummyData'

export default function Dashboard({ onNewIssue, showIssueForm, onCloseForm }) {
  const [selectedIssue, setSelectedIssue] = useState(null)

  // ── Real-time Firestore data (with dummy data fallback during dev) ──────────
  const { issues,     loading: issuesLoading   } = useIssues()
  const { volunteers, loading: volunteersLoading,
          availableCount, deployedCount         } = useVolunteers()

  // ── Metrics derived from live issues + volunteers ──────────────────────────
  const issueMetrics = useIssueMetrics(issues)
  const liveMetrics  = {
    ...METRICS,
    activeIssues:        issueMetrics.activeIssues,
    criticalCount:       issueMetrics.criticalCount,
    resolvedToday:       issueMetrics.resolvedToday,
    volunteersAvailable: availableCount,
    volunteersDeployed:  deployedCount,
  }

  // ── Optimistic update: prepend a newly submitted issue locally ─────────────
  const [optimisticIssues, setOptimisticIssues] = useState([])
  const allIssues = [...optimisticIssues, ...issues.filter(
    (i) => !optimisticIssues.some((o) => o.id === i.id)
  )]

  function handleIssueSubmit(newIssue) {
    setOptimisticIssues((prev) => [newIssue, ...prev])
    setSelectedIssue(newIssue)
  }

  if (issuesLoading && allIssues.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--color-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '2px solid var(--color-border)', borderTop: '2px solid var(--color-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>CONNECTING TO FIRESTORE…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <MetricsBar metrics={liveMetrics} />
      <div className="flex flex-1 overflow-hidden">
        <div style={{ width: 320, minWidth: 300, flexShrink: 0, overflow: 'hidden', display: 'flex' }}>
          <IssueList issues={allIssues} selectedIssue={selectedIssue} onSelectIssue={setSelectedIssue} onNewIssue={onNewIssue} />
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <MapPanel issues={allIssues} selectedIssue={selectedIssue} onSelectIssue={setSelectedIssue} />
        </div>
        <div style={{ width: 300, minWidth: 280, flexShrink: 0, overflow: 'hidden', display: 'flex' }}>
          <VolunteerPanel volunteers={volunteers} />
        </div>
      </div>
      <AlertPanel alerts={ALERTS} />
      {showIssueForm && (
        <IssueForm onClose={onCloseForm} onSubmit={handleIssueSubmit} />
      )}
    </div>
  )
}
