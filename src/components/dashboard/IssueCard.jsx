// src/components/dashboard/IssueCard.jsx
// ─── Single issue card displayed in the IssueList panel ───────

import React from 'react'
import { MapPin, Clock, Users, Brain, ChevronRight } from 'lucide-react'

// Map urgency → display config
const URGENCY_CONFIG = {
  critical: { label: 'CRITICAL', className: 'urgency-critical', dot: '#ef4444' },
  high:     { label: 'HIGH',     className: 'urgency-high',     dot: '#f59e0b' },
  medium:   { label: 'MEDIUM',   className: 'urgency-medium',   dot: '#8b5cf6' },
  low:      { label: 'LOW',      className: 'urgency-low',      dot: '#10b981' },
}

const STATUS_CONFIG = {
  'open':        { label: 'OPEN',        color: '#ef4444' },
  'in-progress': { label: 'IN PROGRESS', color: '#f59e0b' },
  'resolved':    { label: 'RESOLVED',    color: '#10b981' },
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`
}

export default function IssueCard({ issue, isSelected, onClick }) {
  const urgency = URGENCY_CONFIG[issue.urgency] || URGENCY_CONFIG.low
  const status  = STATUS_CONFIG[issue.status]   || STATUS_CONFIG['open']

  return (
    <button
      onClick={() => onClick(issue)}
      className="w-full text-left animate-slide-up"
      style={{
        background:   isSelected ? 'var(--color-card)' : 'var(--color-panel)',
        border:       `1px solid ${isSelected ? 'rgba(0,212,255,0.35)' : 'var(--color-border)'}`,
        borderLeft:   `3px solid ${urgency.dot}`,
        borderRadius: 8,
        padding:      '12px 14px',
        cursor:       'pointer',
        transition:   'all 0.15s ease',
        boxShadow:    isSelected
          ? '0 0 16px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.04)'
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
    >
      {/* ── Row 1: ID + Urgency + Status ── */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.08em',
            }}
          >
            {issue.id}
          </span>
          <span
            className={urgency.className}
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      9,
              padding:       '1px 6px',
              borderRadius:  3,
              letterSpacing: '0.1em',
            }}
          >
            {urgency.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: status.color,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: status.color,
              letterSpacing: '0.08em',
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Row 2: Title ── */}
      <div
        style={{
          fontFamily:  'var(--font-display)',
          fontSize:    14,
          fontWeight:  600,
          color:       isSelected ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
          lineHeight:  1.35,
          marginBottom: 6,
        }}
      >
        {issue.title}
      </div>

      {/* ── Row 3: Category tag ── */}
      <div className="mb-2">
        <span className="cat-tag">{issue.category}</span>
      </div>

      {/* ── Row 4: AI Summary (if exists) ── */}
      {issue.aiSummary && (
        <div
          className="flex items-start gap-1.5 mb-2 rounded px-2 py-1.5"
          style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid rgba(0,212,255,0.12)',
          }}
        >
          <Brain size={10} color="var(--color-cyan)" style={{ marginTop: 2, flexShrink: 0 }} />
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize:   11,
              color:      'var(--color-text-secondary)',
              lineHeight: 1.4,
            }}
          >
            {issue.aiSummary}
          </p>
        </div>
      )}

      {/* ── Row 5: Meta info ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Location */}
          <div className="flex items-center gap-1">
            <MapPin size={10} color="var(--color-text-muted)" />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                color: 'var(--color-text-muted)',
              }}
            >
              {issue.location}
            </span>
          </div>

          {/* Assigned volunteers */}
          <div className="flex items-center gap-1">
            <Users size={10} color="var(--color-text-muted)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: issue.assignedVolunteers.length > 0 ? 'var(--color-jade)' : 'var(--color-text-muted)',
              }}
            >
              {issue.assignedVolunteers.length > 0
                ? `${issue.assignedVolunteers.length} assigned`
                : 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Time + arrow */}
        <div className="flex items-center gap-1.5">
          <Clock size={9} color="var(--color-text-muted)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-text-muted)',
            }}
          >
            {timeAgo(issue.reportedAt)}
          </span>
          <ChevronRight
            size={12}
            color={isSelected ? 'var(--color-cyan)' : 'var(--color-text-muted)'}
          />
        </div>
      </div>
    </button>
  )
}
