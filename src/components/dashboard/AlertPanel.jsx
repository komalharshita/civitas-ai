// src/components/dashboard/AlertPanel.jsx
// ─── Alerts/notifications panel ───────────────────────────────

import React, { useState } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle, AlertOctagon, X } from 'lucide-react'

const ALERT_CONFIG = {
  critical: {
    icon:    AlertOctagon,
    color:   '#ef4444',
    bg:      'rgba(239,68,68,0.08)',
    border:  'rgba(239,68,68,0.25)',
    label:   'CRITICAL',
  },
  warning: {
    icon:    AlertTriangle,
    color:   '#f59e0b',
    bg:      'rgba(245,158,11,0.08)',
    border:  'rgba(245,158,11,0.25)',
    label:   'WARNING',
  },
  info: {
    icon:    Info,
    color:   '#00d4ff',
    bg:      'rgba(0,212,255,0.06)',
    border:  'rgba(0,212,255,0.2)',
    label:   'INFO',
  },
  success: {
    icon:    CheckCircle,
    color:   '#10b981',
    bg:      'rgba(16,185,129,0.08)',
    border:  'rgba(16,185,129,0.2)',
    label:   'RESOLVED',
  },
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}

export default function AlertPanel({ alerts: initialAlerts }) {
  const [alerts, setAlerts] = useState(initialAlerts)

  function dismissAlert(id) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
  }

  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <div
      className="flex flex-col"
      style={{
        background:   'var(--color-surface)',
        borderTop:    '1px solid var(--color-border)',
        maxHeight:    220,
      }}
    >
      {/* ── Panel Header ── */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Bell size={12} color="var(--color-amber)" />
          <span
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: '0.12em',
              color:         'var(--color-text-primary)',
              textTransform: 'uppercase',
            }}
          >
            System Alerts
          </span>

          {unreadCount > 0 && (
            <span
              style={{
                fontFamily:   'var(--font-mono)',
                fontSize:     9,
                padding:      '1px 6px',
                borderRadius: 10,
                background:   'rgba(239,68,68,0.15)',
                color:        '#ef4444',
                border:       '1px solid rgba(239,68,68,0.3)',
                animation:    'statusPulse 1.5s infinite',
              }}
            >
              {unreadCount} NEW
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            className="btn-ghost"
            style={{ padding: '2px 8px', fontSize: 9, letterSpacing: '0.08em' }}
            onClick={markAllRead}
          >
            MARK ALL READ
          </button>
        )}
      </div>

      {/* ── Alert Items ── */}
      <div
        className="overflow-x-auto flex-1"
        style={{ display: 'flex', gap: 8, padding: '8px 12px', alignItems: 'flex-start' }}
      >
        {alerts.length === 0 ? (
          <div
            className="flex items-center gap-2 w-full justify-center py-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <CheckCircle size={14} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12 }}>
              All clear — no active alerts
            </span>
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg  = ALERT_CONFIG[alert.type] || ALERT_CONFIG.info
            const Icon = cfg.icon

            return (
              <div
                key={alert.id}
                style={{
                  flexShrink:   0,
                  width:        280,
                  background:   cfg.bg,
                  border:       `1px solid ${cfg.border}`,
                  borderRadius: 6,
                  padding:      '8px 10px',
                  opacity:      alert.isRead ? 0.55 : 1,
                  transition:   'opacity 0.2s',
                  position:     'relative',
                }}
              >
                {/* Dismiss button */}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  style={{
                    position:  'absolute', top: 6, right: 6,
                    background: 'transparent', border: 'none',
                    cursor:    'pointer', padding: 2,
                    color:     'var(--color-text-muted)',
                  }}
                >
                  <X size={10} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} color={cfg.color} />
                  <span
                    style={{
                      fontFamily:   'var(--font-mono)',
                      fontSize:     9,
                      color:        cfg.color,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {cfg.label}
                  </span>
                  {!alert.isRead && (
                    <span
                      style={{
                        width: 5, height: 5,
                        borderRadius: '50%',
                        background: cfg.color,
                        display: 'inline-block',
                        animation: 'statusPulse 1.5s infinite',
                        marginLeft: 2,
                      }}
                    />
                  )}
                </div>

                {/* Message */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize:   11,
                    color:      'var(--color-text-primary)',
                    lineHeight: 1.4,
                    marginBottom: 6,
                    paddingRight: 14,
                  }}
                >
                  {alert.message}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily:   'var(--font-mono)',
                      fontSize:     9,
                      color:        'var(--color-text-muted)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {alert.source}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize:   9,
                      color:      'var(--color-text-muted)',
                    }}
                  >
                    {timeAgo(alert.timestamp)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
