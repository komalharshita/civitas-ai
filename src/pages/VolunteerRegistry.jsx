// src/pages/VolunteerRegistry.jsx
// ─── Volunteer Registry: list, search, filter, register form ──

import React, { useState } from 'react'
import {
  Search, Plus, X, User, Phone, MapPin, Star, CheckCircle,
  Clock, AlertCircle, Users, Filter, Briefcase, Shield,
} from 'lucide-react'
import { useVolunteers } from '../hooks/useVolunteers'
import { addVolunteer } from '../services/firestoreService'
import { CATEGORIES } from '../data/dummyData'

const STATUS_CFG = {
  active:  { color: '#10b981', label: 'Available',    dot: 'active' },
  busy:    { color: '#f59e0b', label: 'Deployed',     dot: 'busy' },
  offline: { color: '#4a5a7a', label: 'Offline',      dot: 'offline' },
}

const ALL_SKILLS = [
  'First Aid', 'Medical', 'CPR', 'Search & Rescue', 'Navigation',
  'Flood Relief', 'Boat Operation', 'Food Distribution', 'Logistics',
  'Counselling', 'Infrastructure', 'Chainsaw', 'Communication',
  'Satellite Ops', 'Nursing', 'Triage', 'Evacuation', 'Heavy Lifting',
]

function VolunteerCard({ vol, isSelected, onClick }) {
  const cfg = STATUS_CFG[vol.status] || STATUS_CFG.offline
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? 'rgba(0,212,255,0.06)' : 'var(--color-card)',
        border: `1px solid ${isSelected ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}`,
        borderRadius: 8, padding: '14px 16px', cursor: 'pointer',
        transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-card)' } }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.2))',
          border: `1.5px solid ${cfg.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
          color: 'var(--color-text-primary)', letterSpacing: '0.05em',
        }}>
          {vol.avatar || vol.name?.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
            {vol.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', animation: vol.status !== 'offline' ? 'statusPulse 2s infinite' : 'none' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: cfg.color, letterSpacing: '0.1em' }}>{cfg.label.toUpperCase()}</span>
          </div>
        </div>
        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <Star size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f59e0b' }}>{vol.rating?.toFixed(1) ?? '—'}</span>
        </div>
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {(vol.skills || []).slice(0, 3).map(s => (
          <span key={s} className="cat-tag" style={{ fontSize: 9 }}>{s}</span>
        ))}
        {(vol.skills || []).length > 3 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', padding: '2px 6px' }}>
            +{vol.skills.length - 3}
          </span>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={9} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{vol.zone || vol.location || '—'}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
          {vol.missionsCompleted ?? 0} missions
        </span>
      </div>
    </div>
  )
}

function DetailPanel({ vol, onClose }) {
  const cfg = STATUS_CFG[vol.status] || STATUS_CFG.offline
  return (
    <div style={{
      width: 320, minWidth: 320, background: 'var(--color-surface)',
      borderLeft: '1px solid var(--color-border)', display: 'flex',
      flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Volunteer Profile
        </div>
        <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={13} /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(139,92,246,0.25))',
            border: `2px solid ${cfg.color}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)',
          }}>{vol.avatar || vol.name?.slice(0, 2).toUpperCase()}</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '0.03em' }}>{vol.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{vol.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{vol.rating?.toFixed(1) ?? '—'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)' }}>RATING</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--color-cyan)' }}>{vol.missionsCompleted ?? 0}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)' }}>MISSIONS</div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <div className="section-header" style={{ marginBottom: 8 }}>Current Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: cfg.color, letterSpacing: '0.1em' }}>{cfg.label.toUpperCase()}</span>
            {vol.assignedIssue && (
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>→ {vol.assignedIssue}</span>
            )}
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="section-header" style={{ marginBottom: 8 }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(vol.skills || []).map(s => (
              <span key={s} className="cat-tag">{s}</span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="section-header" style={{ marginBottom: 8 }}>Contact & Location</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vol.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>{vol.phone}</span>
              </div>
            )}
            {vol.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{vol.location}</span>
              </div>
            )}
            {vol.zone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={12} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{vol.zone} Zone</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', location: '', zone: 'Central', skills: [], status: 'active' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) { setError('Name is required'); return }
    setSubmitting(true)
    setError(null)
    try {
      await addVolunteer({ ...form, avatar: form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), rating: 0, missionsCompleted: 0 })
      onSuccess()
    } catch (e) {
      setError(e.message || 'Failed to register volunteer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div style={{
        background: 'var(--color-panel)', border: '1px solid var(--color-border)',
        borderRadius: 10, width: 520, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '0.05em' }}>Register Volunteer</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>NEW VOLUNTEER REGISTRATION</div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}><X size={14} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 5, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Rahul Desai" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Kothrud, Pune" />
            </div>
            <div>
              <label className="form-label">Zone</label>
              <select className="form-input" value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))} style={{ appearance: 'none' }}>
                {['North', 'South', 'East', 'West', 'Central', 'North-East', 'South-West'].map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: 8 }}>Skills (select all that apply)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ALL_SKILLS.map(skill => {
                const active = form.skills.includes(skill)
                return (
                  <button key={skill} onClick={() => toggleSkill(skill)} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 10px',
                    borderRadius: 4, border: '1px solid', letterSpacing: '0.06em', cursor: 'pointer',
                    background: active ? 'rgba(0,212,255,0.15)' : 'transparent',
                    borderColor: active ? 'rgba(0,212,255,0.4)' : 'var(--color-border)',
                    color: active ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                    transition: 'all 0.15s',
                  }}>
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
            <Plus size={13} />{submitting ? 'Registering...' : 'Register Volunteer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VolunteerRegistry() {
  const { volunteers, loading, availableCount, deployedCount } = useVolunteers()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const filtered = volunteers
    .filter(v => filterStatus === 'all' || v.status === filterStatus)
    .filter(v => !search
      || v.name?.toLowerCase().includes(search.toLowerCase())
      || v.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()))
      || v.location?.toLowerCase().includes(search.toLowerCase())
    )

  const FilterBtn = ({ value, label, count }) => {
    const active = filterStatus === value
    return (
      <button onClick={() => setFilterStatus(value)} style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 12px',
        borderRadius: 4, border: '1px solid', letterSpacing: '0.08em',
        background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
        borderColor: active ? 'rgba(0,212,255,0.4)' : 'var(--color-border)',
        color: active ? 'var(--color-cyan)' : 'var(--color-text-muted)',
        cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {label}
        {count !== undefined && (
          <span style={{ fontSize: 9, opacity: 0.8 }}>({count})</span>
        )}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Stats bar */}
      <div style={{ display: 'flex', padding: '12px 20px', gap: 1, borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
        {[
          { label: 'Total', value: volunteers.length, color: 'var(--color-text-primary)' },
          { label: 'Available', value: availableCount, color: '#10b981' },
          { label: 'Deployed', value: deployedCount, color: '#f59e0b' },
          { label: 'Offline', value: volunteers.filter(v => v.status === 'offline').length, color: 'var(--color-text-muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', padding: '4px 0', borderRight: '1px solid var(--color-border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-panel)', flexShrink: 0 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, skill, location..." className="form-input" style={{ paddingLeft: 30, fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <FilterBtn value="all" label="All" count={volunteers.length} />
          <FilterBtn value="active" label="Available" count={availableCount} />
          <FilterBtn value="busy" label="Deployed" count={deployedCount} />
          <FilterBtn value="offline" label="Offline" count={volunteers.filter(v => v.status === 'offline').length} />
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginLeft: 'auto' }}>
          <Plus size={13} /> Register Volunteer
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Loading volunteers...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>No volunteers match current filters</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(vol => (
                <VolunteerCard
                  key={vol.id || vol.docId}
                  vol={vol}
                  isSelected={selected?.id === vol.id}
                  onClick={() => setSelected(selected?.id === vol.id ? null : vol)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && <DetailPanel vol={selected} onClose={() => setSelected(null)} />}
      </div>

      {showForm && (
        <RegisterForm
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
