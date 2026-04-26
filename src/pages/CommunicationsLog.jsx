// src/pages/CommunicationsLog.jsx
// ─── Timeline-style comms activity log ────────────────────────

import React, { useState, useEffect } from 'react'
import {
  Radio, AlertTriangle, CheckCircle, UserPlus, Zap, Info,
  Bell, MessageSquare, Activity, Filter, Search, RefreshCw,
} from 'lucide-react'
import { useIssues } from '../hooks/useIssues'
import { useVolunteers } from '../hooks/useVolunteers'

const EVENT_TYPES = {
  issue_created:      { icon: AlertTriangle, color: '#ef4444', label: 'Issue Created',      bg: 'rgba(239,68,68,0.1)' },
  issue_resolved:     { icon: CheckCircle,   color: '#10b981', label: 'Issue Resolved',     bg: 'rgba(16,185,129,0.1)' },
  volunteer_assigned: { icon: UserPlus,      color: '#00d4ff', label: 'Volunteer Assigned', bg: 'rgba(0,212,255,0.1)' },
  ai_dispatch:        { icon: Zap,           color: '#8b5cf6', label: 'AI Dispatch',        bg: 'rgba(139,92,246,0.1)' },
  alert_raised:       { icon: Bell,          color: '#f59e0b', label: 'Alert Raised',       bg: 'rgba(245,158,11,0.1)' },
  status_update:      { icon: Activity,      color: '#00d4ff', label: 'Status Update',      bg: 'rgba(0,212,255,0.08)' },
  system_event:       { icon: Info,          color: '#4a5a7a', label: 'System Event',       bg: 'rgba(74,90,122,0.1)' },
}

// Generate realistic log events from live issues/volunteers
function buildEvents(issues, volunteers) {
  const events = []

  issues.forEach((issue, i) => {
    // Issue created
    events.push({
      id: `ev-create-${issue.id || i}`,
      type: 'issue_created',
      timestamp: new Date(issue.reportedAt || Date.now() - i * 3600000).getTime(),
      title: `Issue reported: ${issue.title?.slice(0, 50) || 'Unknown'}`,
      detail: `Urgency: ${issue.urgency?.toUpperCase()} · Location: ${issue.location || 'Unknown'} · Reported by ${issue.reportedBy || 'System'}`,
      source: issue.reportedBy || 'Field Report',
      ref: issue.id,
    })

    // Assigned volunteers
    if (issue.assignedVolunteers?.length) {
      const vol = volunteers.find(v => v.id === issue.assignedVolunteers[0])
      events.push({
        id: `ev-assign-${issue.id || i}`,
        type: 'volunteer_assigned',
        timestamp: new Date(issue.reportedAt || Date.now() - i * 3600000).getTime() + 600000,
        title: `Volunteer dispatched to ${issue.id}`,
        detail: vol ? `${vol.name} (${issue.assignedVolunteers.join(', ')}) assigned to "${issue.title?.slice(0, 40)}"` : `${issue.assignedVolunteers.join(', ')} dispatched`,
        source: 'Civitas AI Engine',
        ref: issue.id,
      })
    }

    // AI dispatch event
    if (i < 4) {
      events.push({
        id: `ev-ai-${issue.id || i}`,
        type: 'ai_dispatch',
        timestamp: new Date(issue.reportedAt || Date.now() - i * 3600000).getTime() + 120000,
        title: `AI matched volunteers for ${issue.id}`,
        detail: `Gemini matched ${issue.assignedVolunteers?.length || 0} volunteers based on skill requirements: ${issue.tags?.join(', ') || 'N/A'}`,
        source: 'Vertex AI / Civitas Engine',
        ref: issue.id,
      })
    }

    // Resolved
    if (issue.status === 'resolved') {
      events.push({
        id: `ev-resolve-${issue.id || i}`,
        type: 'issue_resolved',
        timestamp: new Date(issue.reportedAt || Date.now() - i * 3600000).getTime() + 5400000,
        title: `Issue resolved: ${issue.id}`,
        detail: `${issue.title?.slice(0, 60)} marked as resolved`,
        source: 'Field Confirmation',
        ref: issue.id,
      })
    }
  })

  // System events
  events.push(
    { id: 'ev-sys-1', type: 'system_event', timestamp: Date.now() - 120000, title: 'System health check passed', detail: 'Firestore DB, AI Engine, Map Service all operational.', source: 'Civitas Monitor' },
    { id: 'ev-sys-2', type: 'alert_raised', timestamp: Date.now() - 600000, title: 'Flash flood alert issued by IMD', detail: 'Mutha river basin alert. Expect water level rise by 19:00 IST.', source: 'IMD Weather Alert' },
    { id: 'ev-sys-3', type: 'system_event', timestamp: Date.now() - 1800000, title: 'Civitas AI online — dispatch active', detail: 'Real-time matching engine started. Monitoring all channels.', source: 'System Boot' },
    { id: 'ev-sys-4', type: 'status_update', timestamp: Date.now() - 3000000, title: '7 volunteers currently deployed', detail: '5 zone coverage active. 2 volunteers available for immediate dispatch.', source: 'Resource Monitor' },
  )

  return events.sort((a, b) => b.timestamp - a.timestamp)
}

function formatTime(ts) {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function EventEntry({ event, isLast }) {
  const cfg = EVENT_TYPES[event.type] || EVENT_TYPES.system_event
  const Icon = cfg.icon

  return (
    <div style={{ display: 'flex', gap: 14, padding: '0 20px', position: 'relative' }} className="animate-fade-in">
      {/* Timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute', left: 35, top: 32, bottom: -8,
          width: 1, background: 'var(--color-border)',
        }} />
      )}

      {/* Icon dot */}
      <div style={{ flexShrink: 0, paddingTop: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: cfg.bg, border: `1px solid ${cfg.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 8px ${cfg.color}20`,
        }}>
          <Icon size={13} color={cfg.color} />
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, padding: '10px 14px 14px',
        background: 'var(--color-card)', borderRadius: 7,
        border: `1px solid var(--color-border)`,
        marginBottom: 8, minWidth: 0,
        borderLeft: `2px solid ${cfg.color}`,
        transition: 'border-color 0.15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
              padding: '2px 6px', borderRadius: 3, marginRight: 8,
              background: cfg.bg, color: cfg.color,
              border: `1px solid ${cfg.color}30`,
            }}>
              {cfg.label.toUpperCase()}
            </span>
            {event.ref && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
                #{event.ref}
              </span>
            )}
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', flexShrink: 0, letterSpacing: '0.05em' }}>
            {formatTime(event.timestamp)}
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
          {event.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {event.detail}
        </div>
        <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
          SOURCE: {event.source}
        </div>
      </div>
    </div>
  )
}

export default function CommunicationsLog() {
  const { issues } = useIssues()
  const { volunteers } = useVolunteers()
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!autoRefresh) return
    const t = setInterval(() => setTick(x => x + 1), 30000)
    return () => clearInterval(t)
  }, [autoRefresh])

  const allEvents = buildEvents(issues, volunteers)
  const filtered = allEvents
    .filter(e => filterType === 'all' || e.type === filterType)
    .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase()))

  const typeCounts = {}
  allEvents.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1 })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', padding: '10px 20px', gap: 12, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'statusPulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#10b981', letterSpacing: '0.1em' }}>LIVE FEED</span>
        </div>
        <div style={{ height: 20, width: 1, background: 'var(--color-border)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
          {allEvents.length} EVENTS LOGGED
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setAutoRefresh(r => !r)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 10px',
              borderRadius: 4, border: '1px solid',
              borderColor: autoRefresh ? 'rgba(16,185,129,0.4)' : 'var(--color-border)',
              background: autoRefresh ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: autoRefresh ? '#10b981' : 'var(--color-text-muted)',
              cursor: 'pointer', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <RefreshCw size={9} /> AUTO-REFRESH {autoRefresh ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-panel)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." className="form-input" style={{ paddingLeft: 30, fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['all', ...Object.keys(EVENT_TYPES)].map(type => {
            const active = filterType === type
            const cfg = EVENT_TYPES[type]
            return (
              <button key={type} onClick={() => setFilterType(type)} style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 10px',
                borderRadius: 4, border: '1px solid', letterSpacing: '0.08em', cursor: 'pointer',
                background: active ? (cfg ? cfg.bg : 'rgba(0,212,255,0.1)') : 'transparent',
                borderColor: active ? (cfg ? `${cfg.color}50` : 'rgba(0,212,255,0.4)') : 'var(--color-border)',
                color: active ? (cfg ? cfg.color : 'var(--color-cyan)') : 'var(--color-text-muted)',
                transition: 'all 0.15s',
              }}>
                {type === 'all' ? `ALL (${allEvents.length})` : (cfg?.label || type).toUpperCase().replace('_', ' ') + (typeCounts[type] ? ` (${typeCounts[type]})` : '')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16, paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            No events match current filters
          </div>
        ) : filtered.map((event, i) => (
          <EventEntry key={event.id} event={event} isLast={i === filtered.length - 1} />
        ))}
      </div>
    </div>
  )
}
