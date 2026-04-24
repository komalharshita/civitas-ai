// src/components/layout/Header.jsx
// ─── Top header bar for Civitas AI dispatch system ────────────

import React, { useState, useEffect } from 'react'
import { Bell, Plus, Search, RefreshCw, Wifi, Activity } from 'lucide-react'

// Format date/time like a command center HUD
function formatTime(date) {
  return date.toLocaleTimeString('en-IN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDate(date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

export default function Header({ onNewIssue, unreadAlerts = 0, activePage }) {
  const [time, setTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Simulate refresh animation
  function handleRefresh() {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  // Page title mapping
  const PAGE_TITLES = {
    dashboard:  'Mission Dashboard',
    issues:     'Issue Management',
    dispatch:   'Dispatch Map',
    volunteers: 'Volunteer Registry',
    reports:    'Analytics & Reports',
    comms:      'Communications Log',
    admin:      'Administration',
    settings:   'System Settings',
  }

  return (
    <header
      className="flex items-center justify-between px-5"
      style={{
        height: 'var(--header-height)',
        minHeight: 'var(--header-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
        gap: 16,
      }}
    >
      {/* ── Left: Page title + breadcrumb ── */}
      <div className="flex items-center gap-3">
        {/* Active indicator */}
        <div
          style={{
            width: 3, height: 20,
            background: 'var(--color-cyan)',
            borderRadius: 2,
            boxShadow: '0 0 8px rgba(0,212,255,0.6)',
          }}
        />
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {PAGE_TITLES[activePage] || 'Dashboard'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.1em',
            }}
          >
            CIVITAS AI / {(PAGE_TITLES[activePage] || 'DASHBOARD').toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Center: Search bar ── */}
      <div className="flex-1" style={{ maxWidth: 360 }}>
        <div className="relative">
          <Search
            size={13}
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search issues, volunteers, locations…"
            className="form-input"
            style={{ paddingLeft: 32, fontSize: 12 }}
          />
        </div>
      </div>

      {/* ── Right: Status + Actions ── */}
      <div className="flex items-center gap-2">

        {/* Live network indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <Wifi size={11} color="#10b981" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: '#10b981',
              letterSpacing: '0.1em',
            }}
          >
            LIVE
          </span>
        </div>

        {/* Activity pulse */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded"
          style={{
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          <Activity size={11} color="var(--color-cyan)" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--color-cyan)',
              letterSpacing: '0.08em',
            }}
          >
            7 ACTIVE
          </span>
        </div>

        {/* Live clock */}
        <div
          className="px-3 py-1.5 rounded hidden md:block"
          style={{
            background: 'var(--color-panel)',
            border: '1px solid var(--color-border)',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              color: 'var(--color-text-primary)',
              letterSpacing: '0.05em',
              lineHeight: 1.1,
            }}
          >
            {formatTime(time)}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.08em',
            }}
          >
            {formatDate(time)}
          </div>
        </div>

        {/* Refresh */}
        <button
          className="btn-ghost p-2"
          onClick={handleRefresh}
          title="Refresh data"
          style={{ padding: '7px' }}
        >
          <RefreshCw
            size={14}
            style={{
              transition: 'transform 0.5s ease',
              transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Notifications */}
        <button
          className="btn-ghost p-2 relative"
          title="Alerts"
          style={{ padding: '7px' }}
        >
          <Bell size={14} />
          {unreadAlerts > 0 && (
            <span
              style={{
                position: 'absolute', top: 4, right: 4,
                width: 8, height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid var(--color-surface)',
                boxShadow: '0 0 6px rgba(239,68,68,0.7)',
              }}
            />
          )}
        </button>

        {/* New Issue CTA */}
        <button className="btn-primary" onClick={onNewIssue}>
          <Plus size={13} strokeWidth={2.5} />
          New Issue
        </button>
      </div>
    </header>
  )
}
