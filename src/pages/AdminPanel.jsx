// src/pages/AdminPanel.jsx
// ─── Admin Panel: stats, system toggles, logs ─────────────────

import React, { useState } from 'react'
import {
  Shield, Activity, Cpu, Database, Wifi, Zap, AlertTriangle,
  CheckCircle, Terminal, Server, BarChart3, Users, Map,
  Eye, EyeOff, RefreshCw, Lock, Unlock,
} from 'lucide-react'
import { useIssues } from '../hooks/useIssues'
import { useVolunteers } from '../hooks/useVolunteers'

const STATIC_LOGS = [
  { time: '09:47:23', level: 'INFO',  msg: 'Firestore subscription active — 6 issues, 8 volunteers loaded' },
  { time: '09:45:11', level: 'INFO',  msg: 'AI engine initialized — Gemini 1.5 Flash connected' },
  { time: '09:44:58', level: 'WARN',  msg: 'Vertex AI latency spike detected: 2.3s avg (threshold: 2s)' },
  { time: '09:43:30', level: 'INFO',  msg: 'Volunteer VOL-003 status changed: active → busy' },
  { time: '09:42:05', level: 'INFO',  msg: 'Issue ISS-006 created — urgency: CRITICAL' },
  { time: '09:41:50', level: 'DEBUG', msg: 'Match score computed: VOL-002 ↔ ISS-006 = 0.94' },
  { time: '09:40:22', level: 'INFO',  msg: 'User session started — admin@civitas.ai' },
  { time: '09:39:00', level: 'INFO',  msg: 'Civitas AI Dispatch System v1.0 boot complete' },
  { time: '09:38:45', level: 'INFO',  msg: 'Firebase Auth initialized' },
  { time: '09:38:20', level: 'DEBUG', msg: 'Loading environment configuration...' },
]

const LOG_COLORS = { INFO: '#10b981', WARN: '#f59e0b', ERROR: '#ef4444', DEBUG: '#4a5a7a' }

const INITIAL_TOGGLES = [
  { id: 'ai_dispatch',   label: 'AI Auto-Dispatch',     desc: 'Automatically match volunteers to issues', icon: Zap,      enabled: true },
  { id: 'live_alerts',   label: 'Live Alert Push',       desc: 'Real-time push alerts for critical events', icon: AlertTriangle, enabled: true },
  { id: 'map_service',   label: 'Map Service',           desc: 'Location tracking and dispatch map', icon: Map,      enabled: true },
  { id: 'firestore',     label: 'Firestore Sync',        desc: 'Real-time database synchronisation', icon: Database, enabled: true },
  { id: 'vertex_ai',     label: 'Vertex AI (Gemini)',    desc: 'Large language model inference', icon: Cpu,      enabled: false },
  { id: 'volunteer_notif', label: 'Volunteer Notifications', desc: 'SMS/Email alerts to volunteers', icon: Users,   enabled: false },
]

function StatCard({ icon: Icon, label, value, subLabel, color = 'var(--color-cyan)', trend }) {
  return (
    <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={13} color={color} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</span>
        </div>
        {trend && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: trend > 0 ? '#10b981' : '#ef4444', letterSpacing: '0.08em' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        {subLabel && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{subLabel}</div>}
      </div>
    </div>
  )
}

function Toggle({ toggle, onToggle }) {
  const Icon = toggle.icon
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 7, flexShrink: 0,
        background: toggle.enabled ? `rgba(0,212,255,0.12)` : 'rgba(74,90,122,0.15)',
        border: `1px solid ${toggle.enabled ? 'rgba(0,212,255,0.25)' : 'var(--color-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={toggle.enabled ? 'var(--color-cyan)' : 'var(--color-text-muted)'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>{toggle.label}</div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>{toggle.desc}</div>
      </div>
      {/* Toggle switch */}
      <button
        onClick={() => onToggle(toggle.id)}
        style={{
          width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', padding: 0,
          background: toggle.enabled ? 'var(--color-cyan)' : 'var(--color-muted)',
          position: 'relative', transition: 'background 0.25s', flexShrink: 0,
          boxShadow: toggle.enabled ? '0 0 10px rgba(0,212,255,0.4)' : 'none',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: toggle.enabled ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, width: 36, letterSpacing: '0.1em', color: toggle.enabled ? 'var(--color-cyan)' : 'var(--color-text-muted)' }}>
        {toggle.enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  )
}

export default function AdminPanel() {
  const { issues } = useIssues()
  const { volunteers, availableCount } = useVolunteers()
  const [toggles, setToggles] = useState(INITIAL_TOGGLES)
  const [logFilter, setLogFilter] = useState('ALL')

  function handleToggle(id) {
    setToggles(ts => ts.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  const stats = {
    activeIssues: issues.filter(i => i.status !== 'resolved').length,
    resolvedToday: issues.filter(i => i.status === 'resolved').length,
    deployedVols: volunteers.filter(v => v.status === 'busy').length,
    availableVols: availableCount,
    criticalIssues: issues.filter(i => i.urgency === 'critical' && i.status !== 'resolved').length,
    systemsOnline: toggles.filter(t => t.enabled).length,
  }

  const filteredLogs = logFilter === 'ALL' ? STATIC_LOGS : STATIC_LOGS.filter(l => l.level === logFilter)

  const systemHealth = Math.round((toggles.filter(t => t.enabled).length / toggles.length) * 100)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: Stats + toggles */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Health banner */}
        <div style={{
          padding: '14px 20px', borderRadius: 8,
          background: `rgba(${systemHealth > 70 ? '16,185,129' : '245,158,11'},0.08)`,
          border: `1px solid rgba(${systemHealth > 70 ? '16,185,129' : '245,158,11'},0.25)`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: `rgba(${systemHealth > 70 ? '16,185,129' : '245,158,11'},0.15)`,
            border: `2px solid rgba(${systemHealth > 70 ? '16,185,129' : '245,158,11'},0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800,
            color: systemHealth > 70 ? '#10b981' : '#f59e0b',
          }}>
            {systemHealth}%
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: systemHealth > 70 ? '#10b981' : '#f59e0b', letterSpacing: '0.05em' }}>
              System Health: {systemHealth > 80 ? 'NOMINAL' : systemHealth > 60 ? 'DEGRADED' : 'CRITICAL'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
              {toggles.filter(t => t.enabled).length} / {toggles.length} subsystems operational
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {[Lock, Shield, Activity].map((Icon, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={12} color="#10b981" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div>
          <div className="section-header" style={{ marginBottom: 12 }}>System Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <StatCard icon={AlertTriangle} label="Active Issues" value={stats.activeIssues} subLabel="Requiring attention" color="#ef4444" trend={-12} />
            <StatCard icon={CheckCircle} label="Resolved Today" value={stats.resolvedToday} subLabel="Closed in last 24h" color="#10b981" trend={25} />
            <StatCard icon={Users} label="Deployed" value={stats.deployedVols} subLabel={`${stats.availableVols} available`} color="#f59e0b" />
            <StatCard icon={AlertTriangle} label="Critical" value={stats.criticalIssues} subLabel="High-priority issues" color="#ef4444" />
            <StatCard icon={Zap} label="AI Matches" value="14" subLabel="Since session start" color="#8b5cf6" />
            <StatCard icon={Server} label="Systems Up" value={`${stats.systemsOnline}/${toggles.length}`} subLabel="Subsystems online" color="var(--color-cyan)" />
          </div>
        </div>

        {/* System toggles */}
        <div>
          <div className="section-header" style={{ marginBottom: 12 }}>Subsystem Controls</div>
          <div style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
            {toggles.map((toggle, i) => (
              <Toggle
                key={toggle.id}
                toggle={toggle}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right: System logs */}
      <div style={{
        width: 380, background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: 8, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={13} color="var(--color-cyan)" />
              <span className="section-header" style={{ margin: 0 }}>System Logs</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'statusPulse 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#10b981', letterSpacing: '0.1em' }}>LIVE</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map(level => (
              <button key={level} onClick={() => setLogFilter(level)} style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, padding: '2px 7px',
                borderRadius: 3, border: '1px solid', letterSpacing: '0.08em', cursor: 'pointer',
                background: logFilter === level ? `${(LOG_COLORS[level] || 'var(--color-cyan)')}20` : 'transparent',
                borderColor: logFilter === level ? (LOG_COLORS[level] || 'rgba(0,212,255,0.4)') : 'var(--color-border)',
                color: logFilter === level ? (LOG_COLORS[level] || 'var(--color-cyan)') : 'var(--color-text-muted)',
              }}>
                {level}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
          {filteredLogs.map((log, i) => (
            <div key={i} style={{
              display: 'flex', gap: 8, padding: '5px 14px',
              borderBottom: '1px solid rgba(30,45,80,0.5)',
              background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
            }}>
              <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, letterSpacing: '0.05em' }}>{log.time}</span>
              <span style={{ color: LOG_COLORS[log.level] || '#fff', flexShrink: 0, width: 40 }}>[{log.level}]</span>
              <span style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{log.msg}</span>
            </div>
          ))}
        </div>
        {/* Terminal prompt */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-cyan)' }}>civitas@admin:~$</span>
          <div style={{ flex: 1, height: 16, background: 'transparent', animation: 'none' }}>
            <span style={{ width: 7, height: 13, background: 'var(--color-cyan)', display: 'inline-block', animation: 'statusPulse 1s infinite', verticalAlign: 'middle', opacity: 0.8 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
