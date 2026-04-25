// src/components/layout/Sidebar.jsx
// ─── Left navigation sidebar ───────────────────────────────────

import React from 'react'
import {
  LayoutDashboard, AlertTriangle, Users, Map,
  Settings, BarChart3, Radio, Shield, ChevronRight, Zap,
} from 'lucide-react'

// ── Live badge counts are passed in as props so they reflect real data ─────────
// Static nav definition — live badge values are injected below
const NAV_SECTIONS = [
  {
    label: 'OPERATIONS',
    items: [
      { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
      { id: 'issues',     label: 'Issues',       icon: AlertTriangle,  badgeKey: 'activeIssues' },
      { id: 'dispatch',   label: 'Dispatch Map', icon: Map },
      { id: 'volunteers', label: 'Volunteers',   icon: Users,          badgeKey: 'availableVols' },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { id: 'reports', label: 'Reports & Charts', icon: BarChart3 },
      { id: 'comms',   label: 'Comms Log',        icon: Radio },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'admin',    label: 'Admin',    icon: Shield },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
]

const SYSTEM_STATUS = [
  { label: 'AI Engine',    color: '#10b981', status: 'online'  },
  { label: 'Firestore DB', color: '#10b981', status: 'online'  },
  { label: 'Vertex AI',    color: '#f59e0b', status: 'pending' },
  { label: 'Map Service',  color: '#10b981', status: 'online'  },
]

export default function Sidebar({ activePage, onNavigate, badges = {} }) {
  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        flexShrink: 0,
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center gap-3 px-4 py-4"
        style={{ borderBottom: '1px solid var(--color-border)', minHeight: 'var(--header-height)' }}
      >
        <div
          className="flex items-center justify-center rounded"
          style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #00d4ff22, #00d4ff44)',
            border: '1px solid rgba(0,212,255,0.4)',
            boxShadow: '0 0 12px rgba(0,212,255,0.2)',
          }}
        >
          <Zap size={16} color="#00d4ff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-text-primary)', lineHeight: 1 }}>
            CIVITAS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-cyan)', letterSpacing: '0.15em', marginTop: 1 }}>
            AI DISPATCH v1.0
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>
              {section.label}
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {section.items.map(({ id, label, icon: Icon, badgeKey }) => {
                const isActive   = activePage === id
                const badgeValue = badgeKey ? badges[badgeKey] : undefined
                const showBadge  = badgeValue !== undefined && badgeValue > 0
                return (
                  <li key={id}>
                    <button
                      className={`nav-item w-full${isActive ? ' active' : ''}`}
                      onClick={() => onNavigate(id)}
                    >
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                      {showBadge && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 10,
                          padding: '1px 6px', borderRadius: 10,
                          background: isActive ? 'rgba(0,212,255,0.2)' : 'rgba(239,68,68,0.15)',
                          color: isActive ? 'var(--color-cyan)' : '#ef4444',
                          border: isActive ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(239,68,68,0.3)',
                        }}>
                          {badgeValue}
                        </span>
                      )}
                      {isActive && <ChevronRight size={12} style={{ color: 'var(--color-cyan)', opacity: 0.6 }} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── System Status ── */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>
          SYSTEM STATUS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {SYSTEM_STATUS.map(({ label, color, status }) => (
            <div key={label} className="flex items-center justify-between">
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {label}
              </span>
              <div className="flex items-center gap-1.5">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', animation: 'statusPulse 2.5s infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
