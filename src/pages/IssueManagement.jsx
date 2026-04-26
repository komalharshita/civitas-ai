// src/pages/IssueManagement.jsx
// ─── Full Issue Management page ────────────────────────────────

import React, { useState } from 'react'
import {
  AlertTriangle, CheckCircle, Clock, Filter, Search,
  ChevronRight, X, MapPin, User, Tag, Zap, RefreshCw,
  AlertCircle, Circle, CheckSquare,
} from 'lucide-react'
import { useIssues } from '../hooks/useIssues'
import { resolveIssue } from '../services/firestoreService'

const URGENCY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

function UrgencyBadge({ urgency }) {
  return (
    <span className={`urgency-${urgency}`} style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px',
      borderRadius: 3, letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>
      {urgency}
    </span>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    open:        { color: '#ef4444', label: 'OPEN',        bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)' },
    'in-progress':{ color: '#f59e0b', label: 'IN PROGRESS', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)' },
    resolved:    { color: '#10b981', label: 'RESOLVED',    bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)' },
  }[status] || { color: '#8899bb', label: status.toUpperCase(), bg: 'rgba(136,153,187,0.1)', border: 'rgba(136,153,187,0.25)' }

  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px', borderRadius: 3,
      letterSpacing: '0.1em', color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

function IssueRow({ issue, isSelected, onClick }) {
  const ago = (() => {
    const diff = Date.now() - new Date(issue.reportedAt).getTime()
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return h > 0 ? `${h}h ago` : `${m}m ago`
  })()

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        background: isSelected ? 'rgba(0,212,255,0.06)' : 'transparent',
        borderLeft: isSelected ? '2px solid var(--color-cyan)' : '2px solid transparent',
        cursor: 'pointer', transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
    >
      {/* Urgency indicator */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: { critical: '#ef4444', high: '#f59e0b', medium: '#8b5cf6', low: '#10b981' }[issue.urgency] || '#8899bb',
        boxShadow: issue.urgency === 'critical' ? '0 0 8px rgba(239,68,68,0.7)' : 'none',
        animation: issue.urgency === 'critical' ? 'statusPulse 1s infinite' : 'none',
      }} />

      {/* ID */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', width: 60, flexShrink: 0 }}>
        {issue.id || 'ISS-???'}
      </span>

      {/* Title + location */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {issue.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
          <MapPin size={9} /> {issue.location}
        </div>
      </div>

      {/* Category */}
      <span className="cat-tag" style={{ flexShrink: 0 }}>{issue.category}</span>

      {/* Urgency */}
      <div style={{ flexShrink: 0, width: 72 }}><UrgencyBadge urgency={issue.urgency} /></div>

      {/* Status */}
      <div style={{ flexShrink: 0, width: 90 }}><StatusBadge status={issue.status} /></div>

      {/* Time */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0, width: 48, textAlign: 'right' }}>
        {ago}
      </span>

      <ChevronRight size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
    </div>
  )
}

function DetailPanel({ issue, onClose, onResolve, resolving }) {
  if (!issue) return null

  const volunteers = issue.assignedVolunteers || []

  return (
    <div style={{
      width: 360, minWidth: 360, background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)', display: 'flex',
      flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-cyan)', letterSpacing: '0.1em', marginBottom: 4 }}>
            {issue.id || 'ISS-???'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
            {issue.title}
          </div>
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ padding: 6, flexShrink: 0 }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <UrgencyBadge urgency={issue.urgency} />
          <StatusBadge status={issue.status} />
          <span className="cat-tag">{issue.category}</span>
        </div>

        {/* Description */}
        <div>
          <div className="section-header" style={{ marginBottom: 8 }}>Description</div>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {issue.description}
          </p>
        </div>

        {/* AI Summary */}
        {issue.aiSummary && (
          <div style={{
            background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 6, padding: '10px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Zap size={11} color="var(--color-cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-cyan)', letterSpacing: '0.1em' }}>AI SUMMARY</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{issue.aiSummary}</p>
          </div>
        )}

        {/* Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="section-header" style={{ marginBottom: 0 }}>Details</div>
          {[
            { icon: MapPin, label: 'Location', value: issue.location },
            { icon: User, label: 'Reported By', value: issue.reportedBy },
            { icon: Clock, label: 'Reported At', value: new Date(issue.reportedAt).toLocaleString('en-IN') },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Icon size={12} style={{ color: 'var(--color-text-muted)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {issue.tags?.length > 0 && (
          <div>
            <div className="section-header" style={{ marginBottom: 8 }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {issue.tags.map(t => (
                <span key={t} style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 7px',
                  borderRadius: 3, background: 'rgba(139,92,246,0.1)',
                  color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)',
                }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Volunteers */}
        <div>
          <div className="section-header" style={{ marginBottom: 8 }}>
            Assigned Volunteers ({volunteers.length})
          </div>
          {volunteers.length === 0 ? (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No volunteers assigned</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {volunteers.map(v => (
                <div key={v} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px', borderRadius: 5,
                  background: 'var(--color-card)', border: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-cyan)',
                  }}>{v.slice(-2)}</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {issue.status !== 'resolved' && (
        <div style={{ padding: 16, borderTop: '1px solid var(--color-border)' }}>
          <button
            className="btn-primary w-full"
            onClick={() => onResolve(issue)}
            disabled={resolving}
            style={{
              width: '100%', justifyContent: 'center',
              background: resolving ? 'var(--color-muted)' : undefined,
            }}
          >
            <CheckCircle size={13} />
            {resolving ? 'Resolving...' : 'Mark as Resolved'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function IssueManagement() {
  const { issues, loading, refresh } = useIssues()
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [search, setSearch] = useState('')
  const [resolving, setResolving] = useState(false)

  const filtered = issues
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .filter(i => filterUrgency === 'all' || i.urgency === filterUrgency)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.location?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9))

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    critical: issues.filter(i => i.urgency === 'critical' && i.status !== 'resolved').length,
  }

  async function handleResolve(issue) {
    setResolving(true)
    try {
      await resolveIssue(issue.id || issue.docId)
      refresh()
      setSelected(prev => prev ? { ...prev, status: 'resolved' } : null)
    } catch (e) {
      console.error(e)
    } finally {
      setResolving(false)
    }
  }

  const FilterBtn = ({ value, current, onChange, children }) => (
    <button
      onClick={() => onChange(value)}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px',
        borderRadius: 4, letterSpacing: '0.08em', textTransform: 'uppercase',
        border: '1px solid',
        borderColor: current === value ? 'rgba(0,212,255,0.4)' : 'var(--color-border)',
        background: current === value ? 'rgba(0,212,255,0.1)' : 'transparent',
        color: current === value ? 'var(--color-cyan)' : 'var(--color-text-muted)',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 1, padding: '12px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)', flexShrink: 0,
      }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--color-text-primary)' },
          { label: 'Open', value: stats.open, color: '#ef4444' },
          { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
          { label: 'Resolved', value: stats.resolved, color: '#10b981' },
          { label: 'Critical', value: stats.critical, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex: 1, textAlign: 'center', padding: '6px 10px',
            borderRight: '1px solid var(--color-border)',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-panel)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="form-input"
            style={{ paddingLeft: 30, fontSize: 12 }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Filter size={11} style={{ color: 'var(--color-text-muted)' }} />
          {['all', 'open', 'in-progress', 'resolved'].map(s => (
            <FilterBtn key={s} value={s} current={filterStatus} onChange={setFilterStatus}>
              {s === 'all' ? 'All' : s}
            </FilterBtn>
          ))}
        </div>

        {/* Urgency filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'critical', 'high', 'medium', 'low'].map(u => (
            <FilterBtn key={u} value={u} current={filterUrgency} onChange={setFilterUrgency}>
              {u}
            </FilterBtn>
          ))}
        </div>

        <button className="btn-ghost" onClick={refresh} style={{ padding: '6px 10px', marginLeft: 'auto' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Issue list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Column headers */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-panel)', position: 'sticky', top: 0, zIndex: 1,
          }}>
            {[
              { label: '', w: 8 },
              { label: 'ID', w: 60 },
              { label: 'Title / Location', flex: 1 },
              { label: 'Category', w: 90 },
              { label: 'Urgency', w: 72 },
              { label: 'Status', w: 90 },
              { label: 'Time', w: 48 },
              { label: '', w: 12 },
            ].map(({ label, w, flex }) => (
              <span key={label + w} style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                width: w, flex, flexShrink: w ? 0 : undefined,
              }}>{label}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Loading issues...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              No issues match current filters
            </div>
          ) : filtered.map(issue => (
            <IssueRow
              key={issue.id || issue.docId}
              issue={issue}
              isSelected={selected?.id === issue.id || selected?.docId === issue.docId}
              onClick={() => setSelected(issue)}
            />
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <DetailPanel
            issue={selected}
            onClose={() => setSelected(null)}
            onResolve={handleResolve}
            resolving={resolving}
          />
        )}
      </div>
    </div>
  )
}
