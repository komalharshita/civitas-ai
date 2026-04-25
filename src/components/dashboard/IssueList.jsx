// src/components/dashboard/IssueList.jsx
// ─── Left panel: scrollable filtered issue list ────────────────

import React, { useState, useMemo } from 'react'
import { AlertTriangle, Filter, SortAsc, Search, Plus } from 'lucide-react'
import IssueCard from './IssueCard'
import { URGENCY_COLOR } from '../../utils/formatters'

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

const FILTER_TABS = [
  { id: 'all',         label: 'ALL'    },
  { id: 'open',        label: 'OPEN'   },
  { id: 'in-progress', label: 'ACTIVE' },
  { id: 'resolved',    label: 'DONE'   },
]

export default function IssueList({ issues, selectedIssue, onSelectIssue, onNewIssue }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [sortBy,       setSortBy]       = useState('urgency')

  const criticalCount = issues.filter((i) => i.urgency === 'critical' && i.status !== 'resolved').length

  const filtered = useMemo(() =>
    issues
      .filter((i) => activeFilter === 'all' || i.status === activeFilter)
      .filter((i) =>
        searchQuery === '' ||
        i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) =>
        sortBy === 'urgency'
          ? (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
          : new Date(b.reportedAt) - new Date(a.reportedAt)
      ),
    [issues, activeFilter, searchQuery, sortBy]
  )

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', width: '100%' }}>

      {/* ── Panel Header ── */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>

        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} color="var(--color-amber)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
              Issues
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
              {issues.length}
            </span>
            {criticalCount > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', animation: 'statusPulse 1.5s infinite' }}>
                {criticalCount} CRIT
              </span>
            )}
          </div>
          <button
            className="btn-ghost"
            style={{ padding: '4px 8px', fontSize: 10 }}
            onClick={() => setSortBy((s) => s === 'urgency' ? 'time' : 'urgency')}
            title="Toggle sort"
          >
            <SortAsc size={11} />
            {sortBy === 'urgency' ? 'URGENCY' : 'RECENT'}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={11} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search issues…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 28, fontSize: 11 }}
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id
            const count    = tab.id === 'all' ? issues.length : issues.filter((i) => i.status === tab.id).length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  flex: 1, padding: '4px 0', borderRadius: 4,
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}`,
                  background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color: isActive ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label} {count > 0 ? `(${count})` : ''}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Issue Cards (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)', gap: 8 }}>
            <Filter size={28} strokeWidth={1} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.05em' }}>
              {searchQuery ? 'No matching issues' : 'No issues yet'}
            </span>
            {!searchQuery && (
              <button className="btn-primary" style={{ fontSize: 10, marginTop: 4 }} onClick={onNewIssue}>
                <Plus size={11} /> Report First Issue
              </button>
            )}
          </div>
        ) : (
          filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isSelected={selectedIssue?.id === issue.id}
              onClick={onSelectIssue}
            />
          ))
        )}
      </div>

      {/* ── Footer CTA ── */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button className="btn-primary w-full justify-center" onClick={onNewIssue}>
          + REPORT NEW ISSUE
        </button>
      </div>
    </div>
  )
}
