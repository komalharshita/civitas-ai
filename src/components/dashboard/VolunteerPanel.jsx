// src/components/dashboard/VolunteerPanel.jsx
// ─── Right panel: matched volunteers + full roster ────────────

import React, { useState } from 'react'
import { Users, UserCheck, UserX, Search, Crosshair, Star, Loader } from 'lucide-react'
import VolunteerCard from './VolunteerCard'

const FILTER_TABS = [
  { id: 'all',    label: 'ALL' },
  { id: 'active', label: 'FREE' },
  { id: 'busy',   label: 'BUSY' },
]

export default function VolunteerPanel({ volunteers, matchedVolunteers = [], isMatching = false, selectedIssue = null }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [search,       setSearch]       = useState('')
  const [showMode,     setShowMode]     = useState('matched')

  const available  = volunteers.filter((v) => v.status === 'active').length
  const deployed   = volunteers.filter((v) => v.status === 'busy').length
  const hasMatches = matchedVolunteers.length > 0

  const filteredRoster = volunteers
    .filter((v) => activeFilter === 'all' || v.status === activeFilter)
    .filter((v) =>
      search === '' ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', width: '100%' }}>
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={14} color="var(--color-cyan)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
              Volunteers
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <UserCheck size={10} color="#10b981" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#10b981' }}>{available}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <UserX size={10} color="#f59e0b" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#f59e0b' }}>{deployed}</span>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-3">
          {['matched', 'roster'].map((mode) => (
            <button key={mode} onClick={() => setShowMode(mode)} style={{
              flex: 1, padding: '5px 0', borderRadius: 4,
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
              cursor: 'pointer',
              border: `1px solid ${showMode === mode ? 'rgba(0,212,255,0.4)' : 'var(--color-border)'}`,
              background: showMode === mode ? 'rgba(0,212,255,0.12)' : 'transparent',
              color: showMode === mode ? 'var(--color-cyan)' : 'var(--color-text-muted)',
              transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}>
              {mode === 'matched' && <Crosshair size={9} />}
              {mode.toUpperCase()}
              {mode === 'matched' && isMatching && <Loader size={8} style={{ animation: 'spin 1s linear infinite' }} />}
              {mode === 'matched' && hasMatches && !isMatching && (
                <span style={{ background: 'rgba(0,212,255,0.2)', color: 'var(--color-cyan)', padding: '0px 5px', borderRadius: 8, fontSize: 8 }}>
                  {matchedVolunteers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Roster filters */}
        {showMode === 'roster' && (
          <>
            <div className="relative mb-3">
              <Search size={11} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" placeholder="Search by name or skill…" value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 28, fontSize: 11 }} />
            </div>
            <div className="flex gap-1">
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab.id
                const count = tab.id === 'all' ? volunteers.length : volunteers.filter((v) => v.status === tab.id).length
                return (
                  <button key={tab.id} onClick={() => setActiveFilter(tab.id)} style={{
                    flex: 1, padding: '4px 0', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 9,
                    letterSpacing: '0.08em', cursor: 'pointer',
                    border: `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}`,
                    background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: isActive ? 'var(--color-cyan)' : 'var(--color-text-muted)', transition: 'all 0.15s',
                  }}>
                    {tab.label} ({count})
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Matched mode — issue context label */}
        {showMode === 'matched' && selectedIssue && (
          <div className="px-2 py-1.5 rounded" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)', fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>{selectedIssue.id}</span>{' '}
            · {selectedIssue.category} · {selectedIssue.location}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3 py-3 stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Matched — no issue selected */}
        {showMode === 'matched' && !selectedIssue && (
          <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)', gap: 10, textAlign: 'center', padding: 20 }}>
            <Crosshair size={32} strokeWidth={1} style={{ opacity: 0.4 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.05em' }}>Select an issue to see matched volunteers</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, maxWidth: 180 }}>The AI dispatch engine will rank the best available volunteers.</div>
          </div>
        )}

        {/* Matched — running */}
        {showMode === 'matched' && selectedIssue && isMatching && (
          <div className="flex flex-col items-center justify-center h-full" style={{ gap: 10, color: 'var(--color-cyan)' }}>
            <Loader size={28} strokeWidth={1.5} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em' }}>MATCHING ENGINE RUNNING…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Matched — results */}
        {showMode === 'matched' && selectedIssue && !isMatching && hasMatches && matchedVolunteers.map((vol, idx) => (
          <div key={vol.id} className="animate-slide-up">
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: idx === 0 ? 'var(--color-cyan)' : 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
                  #{idx + 1} MATCH
                </span>
                {vol._matchedSkills?.length > 0 && (
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--color-text-muted)' }}>{vol._matchedSkills.join(', ')}</span>
                )}
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: idx === 0 ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${idx === 0 ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}` }}>
                <Star size={8} color={idx === 0 ? 'var(--color-cyan)' : 'var(--color-text-muted)'} fill={idx === 0 ? 'var(--color-cyan)' : 'none'} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: idx === 0 ? 'var(--color-cyan)' : 'var(--color-text-muted)' }}>{vol._score}pts</span>
              </div>
            </div>
            <VolunteerCard volunteer={vol} />
          </div>
        ))}

        {/* Matched — no results */}
        {showMode === 'matched' && selectedIssue && !isMatching && !hasMatches && (
          <div className="flex flex-col items-center justify-center h-full" style={{ gap: 10, textAlign: 'center', padding: 20 }}>
            <UserX size={28} strokeWidth={1} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>No matches found</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 180, lineHeight: 1.4 }}>No available volunteers match this issue's skills or location.</div>
            <button className="btn-ghost" style={{ fontSize: 10, padding: '5px 12px' }} onClick={() => setShowMode('roster')}>VIEW FULL ROSTER →</button>
          </div>
        )}

        {/* Roster */}
        {showMode === 'roster' && (
          filteredRoster.length === 0
            ? <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)', gap: 8 }}>
                <Users size={28} strokeWidth={1} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.05em' }}>No volunteers found</span>
              </div>
            : filteredRoster.map((v) => <VolunteerCard key={v.id} volunteer={v} />)
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button className="btn-ghost w-full justify-center" style={{ fontSize: 11 }}>+ REGISTER VOLUNTEER</button>
      </div>
    </div>
  )
}
