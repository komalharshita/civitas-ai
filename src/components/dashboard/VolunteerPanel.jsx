// src/components/dashboard/VolunteerPanel.jsx
// ─── Right panel: volunteer roster + status overview ───────────

import React, { useState } from 'react'
import { Users, UserCheck, UserX, Search } from 'lucide-react'
import VolunteerCard from './VolunteerCard'

const FILTER_TABS = [
  { id: 'all',    label: 'ALL' },
  { id: 'active', label: 'FREE' },
  { id: 'busy',   label: 'BUSY' },
]

export default function VolunteerPanel({ volunteers }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')

  const available = volunteers.filter((v) => v.status === 'active').length
  const deployed  = volunteers.filter((v) => v.status === 'busy').length

  const filtered = volunteers
    .filter((v) => activeFilter === 'all' || v.status === activeFilter)
    .filter((v) =>
      search === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background:  'var(--color-surface)',
        borderLeft:  '1px solid var(--color-border)',
        width:       '100%',
      }}
    >
      {/* ── Panel Header ── */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={14} color="var(--color-cyan)" />
            <span
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      13,
                fontWeight:    700,
                letterSpacing: '0.08em',
                color:         'var(--color-text-primary)',
                textTransform: 'uppercase',
              }}
            >
              Volunteers
            </span>
          </div>

          {/* Availability summary pills */}
          <div className="flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <UserCheck size={10} color="#10b981" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#10b981' }}>
                {available}
              </span>
            </div>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <UserX size={10} color="#f59e0b" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b' }}>
                {deployed}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={11}
            style={{
              position: 'absolute', left: 9, top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by name or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 28, fontSize: 11 }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id
            const count =
              tab.id === 'all'
                ? volunteers.length
                : volunteers.filter((v) => v.status === tab.id).length

            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  flex:          1,
                  padding:       '4px 0',
                  borderRadius:  4,
                  fontFamily:    'var(--font-mono)',
                  fontSize:      9,
                  letterSpacing: '0.08em',
                  cursor:        'pointer',
                  border:        `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}`,
                  background:    isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                  color:         isActive ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                  transition:    'all 0.15s',
                }}
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Volunteer Cards ── */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 stagger-children"
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full"
            style={{ color: 'var(--color-text-muted)', gap: 8 }}
          >
            <Users size={28} strokeWidth={1} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.05em' }}>
              No volunteers found
            </span>
          </div>
        ) : (
          filtered.map((v) => (
            <VolunteerCard key={v.id} volunteer={v} />
          ))
        )}
      </div>

      {/* ── Footer: Quick action ── */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          className="btn-ghost w-full justify-center"
          style={{ fontSize: 11 }}
        >
          + REGISTER VOLUNTEER
        </button>
      </div>
    </div>
  )
}
