// src/components/dashboard/VolunteerCard.jsx
// ─── Single volunteer card for the VolunteerPanel ─────────────

import React from 'react'
import { Star, Phone, MapPin, Briefcase } from 'lucide-react'

const STATUS_CONFIG = {
  active:  { label: 'AVAILABLE', color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  busy:    { label: 'DEPLOYED',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  offline: { label: 'OFFLINE',   color: '#4a5a7a', bg: 'rgba(74,90,122,0.1)',  border: 'rgba(74,90,122,0.25)' },
}

// Generate a consistent avatar hue from the volunteer name
function avatarColor(name) {
  const colors = [
    ['#00d4ff', '#0099bb'],
    ['#10b981', '#0d916a'],
    ['#8b5cf6', '#6d48c2'],
    ['#f59e0b', '#b37a0a'],
    ['#ef4444', '#b03232'],
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export default function VolunteerCard({ volunteer, compact = false }) {
  const status = STATUS_CONFIG[volunteer.status] || STATUS_CONFIG.offline
  const [colorFrom, colorTo] = avatarColor(volunteer.name)

  return (
    <div
      style={{
        background:   'var(--color-panel)',
        border:       '1px solid var(--color-border)',
        borderRadius: 8,
        padding:      compact ? '10px 12px' : '12px 14px',
        transition:   'border-color 0.15s ease',
        boxShadow:    'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    >
      {/* ── Top row: avatar + name + status ── */}
      <div className="flex items-start gap-3 mb-2">
        {/* Avatar */}
        <div
          style={{
            width:        36, height: 36,
            borderRadius: 6,
            background:   `linear-gradient(135deg, ${colorFrom}22, ${colorTo}44)`,
            border:       `1px solid ${colorFrom}44`,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            flexShrink:   0,
            fontFamily:   'var(--font-display)',
            fontSize:     13,
            fontWeight:   700,
            color:        colorFrom,
            letterSpacing: '0.05em',
          }}
        >
          {volunteer.avatar}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   14,
              fontWeight: 600,
              color:      'var(--color-text-primary)',
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            {volunteer.name}
          </div>

          <div className="flex items-center gap-2">
            {/* Status badge */}
            <span
              style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     9,
                padding:      '1px 7px',
                borderRadius: 3,
                background:   status.bg,
                color:        status.color,
                border:       `1px solid ${status.border}`,
                letterSpacing: '0.1em',
              }}
            >
              {status.label}
            </span>

            {/* Zone */}
            <span
              style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     9,
                color:        'var(--color-text-muted)',
                letterSpacing: '0.06em',
              }}
            >
              ZONE {volunteer.zone}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star size={10} color="#f59e0b" fill="#f59e0b" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   10,
              color:      '#f59e0b',
            }}
          >
            {volunteer.rating}
          </span>
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="flex flex-wrap gap-1 mb-2">
        {volunteer.skills.map((skill) => (
          <span
            key={skill}
            style={{
              fontFamily:   'var(--font-body)',
              fontSize:     10,
              padding:      '1px 7px',
              borderRadius: 10,
              background:   'rgba(255,255,255,0.05)',
              color:        'var(--color-text-secondary)',
              border:       '1px solid var(--color-border)',
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* ── Bottom meta ── */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-1">
          <MapPin size={9} color="var(--color-text-muted)" />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize:   10,
              color:      'var(--color-text-muted)',
            }}
          >
            {volunteer.location}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Missions */}
          <div className="flex items-center gap-1">
            <Briefcase size={9} color="var(--color-text-muted)" />
            <span
              style={{
                fontFamily:  'var(--font-mono)',
                fontSize:    10,
                color:       'var(--color-text-secondary)',
              }}
            >
              {volunteer.missionsCompleted}
            </span>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-1">
            <Phone size={9} color="var(--color-text-muted)" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize:   10,
                color:      'var(--color-text-muted)',
              }}
            >
              {volunteer.phone.slice(-5)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Assigned issue tag ── */}
      {volunteer.assignedIssue && (
        <div
          className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded"
          style={{
            background: 'rgba(245,158,11,0.06)',
            border:     '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <span
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: '#f59e0b',
              display: 'inline-block',
              animation: 'statusPulse 1.5s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize:   9,
              color:      '#f59e0b',
              letterSpacing: '0.08em',
            }}
          >
            ON MISSION: {volunteer.assignedIssue}
          </span>
        </div>
      )}
    </div>
  )
}
