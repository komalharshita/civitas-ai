// src/components/dashboard/MetricsBar.jsx
// ─── Top row of KPI metric cards ──────────────────────────────

import React from 'react'
import {
  AlertTriangle, CheckCircle2, Users, UserCheck,
  Siren, Timer, TrendingUp,
} from 'lucide-react'

const METRIC_CARDS = [
  {
    id:      'active',
    label:   'Active Issues',
    key:     'activeIssues',
    icon:    AlertTriangle,
    color:   '#f59e0b',
    bg:      'rgba(245,158,11,0.08)',
    border:  'rgba(245,158,11,0.2)',
    suffix:  '',
  },
  {
    id:      'resolved',
    label:   'Resolved Today',
    key:     'resolvedToday',
    icon:    CheckCircle2,
    color:   '#10b981',
    bg:      'rgba(16,185,129,0.08)',
    border:  'rgba(16,185,129,0.2)',
    suffix:  '',
  },
  {
    id:      'deployed',
    label:   'Deployed',
    key:     'volunteersDeployed',
    icon:    Users,
    color:   '#00d4ff',
    bg:      'rgba(0,212,255,0.06)',
    border:  'rgba(0,212,255,0.2)',
    suffix:  ' vols',
  },
  {
    id:      'available',
    label:   'Available',
    key:     'volunteersAvailable',
    icon:    UserCheck,
    color:   '#10b981',
    bg:      'rgba(16,185,129,0.08)',
    border:  'rgba(16,185,129,0.2)',
    suffix:  ' vols',
  },
  {
    id:      'critical',
    label:   'Critical',
    key:     'criticalCount',
    icon:    Siren,
    color:   '#ef4444',
    bg:      'rgba(239,68,68,0.08)',
    border:  'rgba(239,68,68,0.25)',
    suffix:  '',
    pulse:   true,
  },
  {
    id:      'response',
    label:   'Avg Response',
    key:     'averageResponseTime',
    icon:    Timer,
    color:   '#8b5cf6',
    bg:      'rgba(139,92,246,0.08)',
    border:  'rgba(139,92,246,0.2)',
    suffix:  '',
  },
]

export default function MetricsBar({ metrics }) {
  return (
    <div
      className="grid gap-3 flex-shrink-0 px-4 py-3"
      style={{
        gridTemplateColumns: 'repeat(6, 1fr)',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}
    >
      {METRIC_CARDS.map(({ id, label, key, icon: Icon, color, bg, border, suffix, pulse }) => (
        <div
          key={id}
          style={{
            background:   bg,
            border:       `1px solid ${border}`,
            borderRadius: 7,
            padding:      '10px 14px',
            transition:   'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      10,
                letterSpacing: '0.08em',
                color:         'var(--color-text-muted)',
                textTransform: 'uppercase',
                fontWeight:    600,
              }}
            >
              {label}
            </span>
            <Icon
              size={13}
              color={color}
              style={pulse ? { animation: 'statusPulse 1.5s infinite' } : {}}
            />
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize:   22,
              fontWeight: 700,
              color,
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}
          >
            {metrics[key]}
            {suffix && (
              <span
                style={{
                  fontSize:   11,
                  fontWeight: 400,
                  color:      'var(--color-text-muted)',
                  marginLeft: 3,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
