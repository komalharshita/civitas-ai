// src/App.jsx
// ─── Root shell — routing, global state, live sidebar badges ──

<<<<<<< HEAD
import React, { useState } from 'react'
import Sidebar         from './components/layout/Sidebar'
import Header          from './components/layout/Header'
import Dashboard       from './pages/Dashboard'
import Analytics       from './pages/Analytics'
import PlaceholderPage from './pages/PlaceholderPage'
import { useIssues }     from './hooks/useIssues'
import { useVolunteers } from './hooks/useVolunteers'
=======
import React, { useState, useEffect } from 'react'
import Sidebar          from './components/layout/Sidebar'
import Header           from './components/layout/Header'
import Dashboard        from './pages/Dashboard'
import PlaceholderPage  from './pages/PlaceholderPage'
import { ALERTS }       from './data/dummyData'
import { getVolunteers } from "./services/firestoreService";
>>>>>>> 2429b90 (Add volunteer fetching functionality and integrate useEffect in App component)

const PLACEHOLDER_PAGES = {
  issues:     'Issue Management',
  dispatch:   'Dispatch Map',
  volunteers: 'Volunteer Registry',
  comms:      'Communications Log',
  admin:      'Administration',
  settings:   'System Settings',
}

export default function App() {
  const [activePage,    setActivePage]    = useState('dashboard')
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [unreadAlerts,  setUnreadAlerts]  = useState(0)

  // Live counts for sidebar badges — subscribed at root so they persist across page changes
  const { issues }       = useIssues()
  const { volunteers, availableCount } = useVolunteers()

  const activeIssues = issues.filter((i) => i.status !== 'resolved').length

  const sidebarBadges = {
    activeIssues: activeIssues,
    availableVols: availableCount,
  }

  // ✅ Correct placement of useEffect
  useEffect(() => {
    const fetchData = async () => {
      const data = await getVolunteers();
      console.log("Volunteers:", data);
    };

    fetchData();
  }, []);

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
      default:
        return <PlaceholderPage title={PLACEHOLDER_PAGES[activePage] || 'Page'} />
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