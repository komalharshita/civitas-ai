// src/App.jsx
// ─── Root shell — routing, global state, live sidebar badges ──

import React, { useState } from 'react'
import Sidebar            from './components/layout/Sidebar'
import Header             from './components/layout/Header'
import Dashboard          from './pages/Dashboard'
import Analytics          from './pages/Analytics'
import IssueManagement    from './pages/IssueManagement'
import DispatchMap        from './pages/DispatchMap'
import VolunteerRegistry  from './pages/VolunteerRegistry'
import CommunicationsLog  from './pages/CommunicationsLog'
import AdminPanel         from './pages/AdminPanel'
import Settings           from './pages/Settings'
import PlaceholderPage    from './pages/PlaceholderPage'
import { useIssues }      from './hooks/useIssues'
import { useVolunteers }  from './hooks/useVolunteers'

export default function App() {
  const [activePage,    setActivePage]    = useState('dashboard')
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [unreadAlerts,  setUnreadAlerts]  = useState(0)

  // Live counts for sidebar badges
  const { issues }                        = useIssues()
  const { volunteers, availableCount }    = useVolunteers()

  const activeIssues = issues.filter((i) => i.status !== 'resolved').length

  const sidebarBadges = {
    activeIssues:  activeIssues,
    availableVols: availableCount,
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            onNewIssue={() => setShowIssueForm(true)}
            showIssueForm={showIssueForm}
            onCloseForm={() => setShowIssueForm(false)}
            onUnreadChange={setUnreadAlerts}
          />
        )
      case 'reports':
        return <Analytics />
      case 'issues':
        return <IssueManagement />
      case 'dispatch':
        return <DispatchMap />
      case 'volunteers':
        return <VolunteerRegistry />
      case 'comms':
        return <CommunicationsLog />
      case 'admin':
        return <AdminPanel />
      case 'settings':
        return <Settings />
      default:
        return <PlaceholderPage title="Page" />
    }
  }

  return (
    <div className="scanline-overlay" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        activePage={activePage}
        onNewIssue={() => setShowIssueForm(true)}
        unreadAlerts={unreadAlerts}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          badges={sidebarBadges}
        />
        <main className="flex-1 overflow-hidden flex flex-col" style={{ background: 'var(--color-base)' }}>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}