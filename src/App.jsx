// src/App.jsx
// ─── Root component: layout shell + page routing ──────────────

import React, { useState } from 'react'
import Sidebar          from './components/layout/Sidebar'
import Header           from './components/layout/Header'
import Dashboard        from './pages/Dashboard'
import PlaceholderPage  from './pages/PlaceholderPage'
import { ALERTS }       from './data/dummyData'

const PLACEHOLDER_PAGES = {
  issues:     'Issue Management',
  dispatch:   'Dispatch Map',
  volunteers: 'Volunteer Registry',
  reports:    'Analytics & Reports',
  comms:      'Communications Log',
  admin:      'Administration',
  settings:   'System Settings',
}

export default function App() {
  const [activePage,     setActivePage]     = useState('dashboard')
  const [showIssueForm,  setShowIssueForm]  = useState(false)

  const unreadAlerts = ALERTS.filter((a) => !a.isRead).length

  function renderPage() {
    if (activePage === 'dashboard') {
      return (
        <Dashboard
          onNewIssue={() => setShowIssueForm(true)}
          showIssueForm={showIssueForm}
          onCloseForm={() => setShowIssueForm(false)}
        />
      )
    }
    return <PlaceholderPage title={PLACEHOLDER_PAGES[activePage] || 'Page'} />
  }

  return (
    // Scanline CRT effect overlay
    <div className="scanline-overlay" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ── Top Header ── */}
      <Header
        activePage={activePage}
        onNewIssue={() => setShowIssueForm(true)}
        unreadAlerts={unreadAlerts}
      />

      {/* ── Body: Sidebar + Page Content ── */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
        />

        {/* Main content area */}
        <main
          className="flex-1 overflow-hidden flex flex-col"
          style={{ background: 'var(--color-base)' }}
        >
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
