// src/pages/DispatchMap.jsx
// ─── Dispatch Map page with mock map, issue points, toggle modes ──

import React, { useState, useEffect } from 'react'
import { Map, Layers, Thermometer, Grid3X3, MapPin, Zap, Navigation, AlertTriangle, Users } from 'lucide-react'
import { useIssues } from '../hooks/useIssues'
import { useVolunteers } from '../hooks/useVolunteers'

const URGENCY_COLOR = { critical: '#ef4444', high: '#f59e0b', medium: '#8b5cf6', low: '#10b981' }
const STATUS_COLOR  = { open: '#ef4444', 'in-progress': '#f59e0b', resolved: '#10b981' }

// Normalize coords to svg viewBox (Pune-centric)
function toMapCoords(lat, lng) {
  // Bounding box roughly around Pune
  const latMin = 18.30, latMax = 18.65
  const lngMin = 73.70, lngMax = 74.00
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 860
  const y = ((latMax - lat) / (latMax - latMin)) * 480
  return { x, y }
}

// Zone definitions (static mock)
const ZONES = [
  { name: 'North-East', color: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)', path: '0,0 430,0 430,240 0,240' },
  { name: 'North-West', color: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)', path: '430,0 860,0 860,240 430,240' },
  { name: 'South-East', color: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', path: '0,240 430,240 430,480 0,480' },
  { name: 'South-West', color: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', path: '430,240 860,240 860,480 430,480' },
]

// Heatmap circles
function HeatBlob({ x, y, intensity, color }) {
  return (
    <g>
      <circle cx={x} cy={y} r={intensity * 2.5} fill={color} opacity={0.07} />
      <circle cx={x} cy={y} r={intensity * 1.5} fill={color} opacity={0.12} />
      <circle cx={x} cy={y} r={intensity * 0.8} fill={color} opacity={0.25} />
    </g>
  )
}

const TOGGLE_MODES = [
  { id: 'dispatch', label: 'Dispatch', icon: Navigation },
  { id: 'heatmap', label: 'Heatmap', icon: Thermometer },
  { id: 'zones',   label: 'Zones',    icon: Grid3X3 },
]

export default function DispatchMap() {
  const { issues } = useIssues()
  const { volunteers } = useVolunteers()
  const [mode, setMode] = useState('dispatch')
  const [hoveredIssue, setHoveredIssue] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [showVols, setShowVols] = useState(true)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPulse(p => (p + 1) % 100), 50)
    return () => clearInterval(t)
  }, [])

  const activeIssues = issues.filter(i => i.status !== 'resolved')
  const availableVols = volunteers.filter(v => v.status === 'active')

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Map canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--color-base)' }}>
        {/* Mode toggles */}
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 2, zIndex: 10,
          background: 'rgba(15,22,41,0.9)', border: '1px solid var(--color-border)',
          borderRadius: 6, padding: 3, backdropFilter: 'blur(8px)',
        }}>
          {TOGGLE_MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
                background: mode === id ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: mode === id ? 'var(--color-cyan)' : 'var(--color-text-secondary)',
                boxShadow: mode === id ? '0 0 10px rgba(0,212,255,0.2)' : 'none',
              }}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {/* Toggle volunteers */}
        <button
          onClick={() => setShowVols(v => !v)}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: showVols ? 'rgba(16,185,129,0.15)' : 'rgba(15,22,41,0.9)',
            border: `1px solid ${showVols ? 'rgba(16,185,129,0.4)' : 'var(--color-border)'}`,
            borderRadius: 5, cursor: 'pointer', transition: 'all 0.15s',
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
            color: showVols ? '#10b981' : 'var(--color-text-muted)',
          }}
        >
          <Users size={11} /> Volunteers
        </button>

        {/* SVG Map */}
        <svg
          viewBox="0 0 860 480"
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid */}
          <defs>
            <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,212,255,0.04)" strokeWidth="1"/>
            </pattern>
            <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0f1629" />
              <stop offset="100%" stopColor="#060810" />
            </radialGradient>
          </defs>

          <rect width="860" height="480" fill="url(#bgGrad)" />
          <rect width="860" height="480" fill="url(#mapgrid)" />

          {/* ── ZONES mode ── */}
          {mode === 'zones' && ZONES.map(z => (
            <g key={z.name}>
              <polygon points={z.path} fill={z.color} stroke={z.border} strokeWidth="1" />
              <text
                x={z.path.split(' ').map(p => parseInt(p)).filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0) / 4}
                y={z.path.split(' ').map(p => parseInt(p)).filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0) / 4}
                textAnchor="middle"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}
              >
                {z.name.toUpperCase()} ZONE
              </text>
            </g>
          ))}

          {/* ── HEATMAP mode ── */}
          {mode === 'heatmap' && activeIssues.map(issue => {
            if (!issue.coordinates) return null
            const { x, y } = toMapCoords(issue.coordinates.lat, issue.coordinates.lng)
            const intensity = { critical: 40, high: 30, medium: 20, low: 12 }[issue.urgency] || 15
            return <HeatBlob key={issue.id} x={x} y={y} intensity={intensity} color={URGENCY_COLOR[issue.urgency] || '#fff'} />
          })}

          {/* Issue points — always shown in dispatch, shown in heatmap/zones */}
          {activeIssues.map(issue => {
            if (!issue.coordinates) return null
            const { x, y } = toMapCoords(issue.coordinates.lat, issue.coordinates.lng)
            const color = URGENCY_COLOR[issue.urgency] || '#8899bb'
            const isSelected = selectedIssue?.id === issue.id
            const isHovered = hoveredIssue?.id === issue.id

            return (
              <g key={issue.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIssue(issue)}
                onMouseLeave={() => setHoveredIssue(null)}
                onClick={() => setSelectedIssue(isSelected ? null : issue)}
              >
                {/* Pulse ring for critical */}
                {issue.urgency === 'critical' && (
                  <circle cx={x} cy={y} r={12 + (pulse % 20) * 0.4} fill="none" stroke={color} strokeWidth="1" opacity={1 - (pulse % 20) * 0.05} />
                )}
                <circle cx={x} cy={y} r={isSelected ? 9 : isHovered ? 7 : 5} fill={color} opacity={0.9}
                  stroke={isSelected ? '#fff' : 'none'} strokeWidth={isSelected ? 1.5 : 0} />

                {/* Label */}
                {(isHovered || isSelected) && (
                  <g>
                    <rect x={x + 10} y={y - 14} width={140} height={26} rx={4}
                      fill="rgba(10,14,26,0.95)" stroke={color} strokeWidth="0.5" />
                    <text x={x + 16} y={y - 3} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: color, letterSpacing: '0.06em' }}>
                      {issue.id}
                    </text>
                    <text x={x + 16} y={y + 7} style={{ fontFamily: 'sans-serif', fontSize: 9, fill: 'rgba(200,210,230,0.9)' }}>
                      {issue.title.slice(0, 22)}…
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Volunteer markers */}
          {showVols && volunteers.filter(v => v.status === 'busy' && v.location).map((vol, i) => {
            // Mock coords for volunteers (randomised around Pune)
            const mockCoords = [
              { lat: 18.536, lng: 73.894 }, { lat: 18.502, lng: 73.925 },
              { lat: 18.559, lng: 73.787 }, { lat: 18.516, lng: 73.840 },
              { lat: 18.596, lng: 73.762 }, { lat: 18.324, lng: 73.678 },
              { lat: 18.490, lng: 73.870 },
            ]
            const coords = mockCoords[i % mockCoords.length]
            const { x, y } = toMapCoords(coords.lat, coords.lng)
            return (
              <g key={vol.id}>
                <circle cx={x} cy={y} r={6} fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1" />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: '#10b981', fontWeight: 'bold' }}>
                  {vol.avatar}
                </text>
              </g>
            )
          })}

          {/* Compass */}
          <g transform="translate(820,440)">
            <circle cx={0} cy={0} r={16} fill="rgba(15,22,41,0.8)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
            <text x={0} y={-6} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: 'var(--color-cyan)' }}>N</text>
            <line x1={0} y1={-3} x2={0} y2={4} stroke="var(--color-cyan)" strokeWidth="1.5" />
            <line x1={0} y1={4} x2={-3} y2={8} stroke="rgba(136,153,187,0.5)" strokeWidth="1" />
            <line x1={0} y1={4} x2={3} y2={8} stroke="rgba(136,153,187,0.5)" strokeWidth="1" />
          </g>

          {/* Scale */}
          <g transform="translate(20,460)">
            <line x1={0} y1={0} x2={60} y2={0} stroke="rgba(136,153,187,0.4)" strokeWidth="1" />
            <line x1={0} y1={-3} x2={0} y2={3} stroke="rgba(136,153,187,0.4)" strokeWidth="1" />
            <line x1={60} y1={-3} x2={60} y2={3} stroke="rgba(136,153,187,0.4)" strokeWidth="1" />
            <text x={30} y={-5} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'rgba(136,153,187,0.6)' }}>~5 km</text>
          </g>

          {/* Mode watermark */}
          <text x={20} y={24} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'rgba(0,212,255,0.3)', letterSpacing: '0.15em' }}>
            {mode.toUpperCase()} VIEW · PUNE DISTRICT
          </text>
        </svg>

        {/* Selected issue popup */}
        {selectedIssue && (
          <div style={{
            position: 'absolute', bottom: 20, left: 20,
            background: 'rgba(15,22,41,0.97)', border: '1px solid var(--color-border)',
            borderLeft: `3px solid ${URGENCY_COLOR[selectedIssue.urgency]}`,
            borderRadius: 6, padding: '12px 16px', maxWidth: 280,
            backdropFilter: 'blur(8px)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: URGENCY_COLOR[selectedIssue.urgency], letterSpacing: '0.1em' }}>
                {selectedIssue.id} · {selectedIssue.urgency.toUpperCase()}
              </span>
              <button onClick={() => setSelectedIssue(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600, marginBottom: 4 }}>{selectedIssue.title}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={9} /> {selectedIssue.location}
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{
        width: 260, background: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Stats */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-header" style={{ marginBottom: 12 }}>Dispatch Overview</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Active Issues', value: activeIssues.length, color: '#ef4444' },
              { label: 'Deployed Vols', value: volunteers.filter(v => v.status === 'busy').length, color: '#f59e0b' },
              { label: 'Available Vols', value: availableVols.length, color: '#10b981' },
              { label: 'Critical Zones', value: activeIssues.filter(i => i.urgency === 'critical').length, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="section-header" style={{ marginBottom: 10 }}>Legend</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(URGENCY_COLOR).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: v, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', border: '1px solid #10b981', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.08em' }}>VOLUNTEER</span>
            </div>
          </div>
        </div>

        {/* Active issue list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
          <div className="section-header" style={{ marginBottom: 10 }}>Active Issues</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeIssues.map(issue => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                style={{
                  padding: '8px 10px', borderRadius: 5, cursor: 'pointer',
                  background: selectedIssue?.id === issue.id ? 'rgba(0,212,255,0.08)' : 'var(--color-card)',
                  border: `1px solid ${selectedIssue?.id === issue.id ? 'rgba(0,212,255,0.3)' : 'var(--color-border)'}`,
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: URGENCY_COLOR[issue.urgency], flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)' }}>{issue.id}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                  {issue.title.slice(0, 45)}{issue.title.length > 45 ? '…' : ''}
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{issue.location}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
