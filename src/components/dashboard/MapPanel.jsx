// src/components/dashboard/MapPanel.jsx
// ─── Center panel: visual dispatch map + issue detail ──────────

import React, { useState } from 'react'
import {
  Map, Crosshair, Layers, ZoomIn, ZoomOut,
  Brain, MapPin, Clock, Users, Tag, X
} from 'lucide-react'

const URGENCY_COLOR = {
  critical: '#ef4444',
  high:     '#f59e0b',
  medium:   '#8b5cf6',
  low:      '#10b981',
}

// Simulated pin positions on the placeholder map (percentage-based)
const PIN_POSITIONS = {
  'ISS-001': { x: 62, y: 42 },
  'ISS-002': { x: 68, y: 70 },
  'ISS-003': { x: 36, y: 55 },
  'ISS-004': { x: 20, y: 35 },
  'ISS-005': { x: 14, y: 28 },
  'ISS-006': { x: 48, y: 85 },
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ${diff % 60}m ago`
}

export default function MapPanel({ issues, selectedIssue, onSelectIssue }) {
  const [mapLayer, setMapLayer] = useState('dispatch')
  const [showDetail, setShowDetail] = useState(true)

  const layers = ['dispatch', 'heatmap', 'zones']

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--color-base)', position: 'relative' }}
    >
      {/* ── Map Toolbar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 flex-shrink-0"
        style={{
          background:   'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Map size={13} color="var(--color-cyan)" />
          <span
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      12,
              fontWeight:    700,
              letterSpacing: '0.1em',
              color:         'var(--color-text-primary)',
              textTransform: 'uppercase',
            }}
          >
            Dispatch Map — Pune District
          </span>

          {/* Coordinates HUD */}
          <span
            style={{
              fontFamily:   'var(--font-mono)',
              fontSize:     9,
              color:        'var(--color-text-muted)',
              letterSpacing: '0.06em',
              marginLeft:   8,
            }}
          >
            18.5204°N 73.8567°E
          </span>
        </div>

        {/* Layer switcher */}
        <div className="flex items-center gap-1">
          <Layers size={11} color="var(--color-text-muted)" />
          {layers.map((layer) => (
            <button
              key={layer}
              onClick={() => setMapLayer(layer)}
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      9,
                padding:       '3px 8px',
                borderRadius:  3,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor:        'pointer',
                border:        `1px solid ${mapLayer === layer ? 'rgba(0,212,255,0.4)' : 'var(--color-border)'}`,
                background:    mapLayer === layer ? 'rgba(0,212,255,0.12)' : 'transparent',
                color:         mapLayer === layer ? 'var(--color-cyan)' : 'var(--color-text-muted)',
                transition:    'all 0.15s',
              }}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map Area ── */}
      <div className="flex-1 relative overflow-hidden map-grid" style={{ background: '#080d1c' }}>

        {/* Crosshair center */}
        <div
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', zIndex: 1,
          }}
        >
          <Crosshair size={24} color="rgba(0,212,255,0.15)" />
        </div>

        {/* Radial pulse rings (simulated sonar) */}
        {[60, 120, 180].map((r) => (
          <div
            key={r}
            style={{
              position:    'absolute', top: '50%', left: '50%',
              transform:   'translate(-50%, -50%)',
              width:       r * 2, height: r * 2,
              borderRadius: '50%',
              border:      '1px solid rgba(0,212,255,0.06)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Road-like lines (purely decorative) */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          preserveAspectRatio="none"
        >
          {/* Horizontal "roads" */}
          <line x1="0" y1="35%" x2="100%" y2="37%" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <line x1="0" y1="55%" x2="100%" y2="53%" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
          <line x1="0" y1="72%" x2="100%" y2="74%" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          {/* Vertical "roads" */}
          <line x1="25%" y1="0" x2="23%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <line x1="50%" y1="0" x2="52%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
          <line x1="72%" y1="0" x2="70%" y2="100%" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          {/* Diagonal highway */}
          <line x1="5%" y1="20%" x2="95%" y2="80%" stroke="rgba(0,212,255,0.05)" strokeWidth="3" />
        </svg>

        {/* Issue Pins */}
        {issues.map((issue) => {
          const pos     = PIN_POSITIONS[issue.id] || { x: 50, y: 50 }
          const color   = URGENCY_COLOR[issue.urgency]
          const isActive = selectedIssue?.id === issue.id

          return (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              style={{
                position:  'absolute',
                left:      `${pos.x}%`,
                top:       `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                border:    'none',
                cursor:    'pointer',
                zIndex:    isActive ? 10 : 5,
              }}
              title={issue.title}
            >
              {/* Pulse ring */}
              {(issue.urgency === 'critical' || isActive) && (
                <span
                  style={{
                    position:     'absolute',
                    top: '50%',   left: '50%',
                    transform:    'translate(-50%, -50%)',
                    width:        isActive ? 36 : 28,
                    height:       isActive ? 36 : 28,
                    borderRadius: '50%',
                    background:   `${color}20`,
                    border:       `1px solid ${color}50`,
                    animation:    'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
                    display:      'block',
                  }}
                />
              )}

              {/* Pin dot */}
              <span
                style={{
                  width:        isActive ? 16 : 12,
                  height:       isActive ? 16 : 12,
                  borderRadius: '50%',
                  background:   color,
                  display:      'block',
                  border:       `2px solid ${isActive ? '#fff' : color}88`,
                  boxShadow:    `0 0 ${isActive ? 16 : 8}px ${color}80`,
                  transition:   'all 0.2s ease',
                  position:     'relative',
                  zIndex:       2,
                }}
              />

              {/* Label */}
              {isActive && (
                <span
                  style={{
                    position:     'absolute',
                    top: '100%',  left: '50%',
                    transform:    'translateX(-50%)',
                    marginTop:    4,
                    fontFamily:   'var(--font-mono)',
                    fontSize:     9,
                    color,
                    letterSpacing: '0.06em',
                    whiteSpace:   'nowrap',
                    background:   'rgba(6,8,16,0.8)',
                    padding:      '2px 5px',
                    borderRadius: 3,
                    border:       `1px solid ${color}40`,
                  }}
                >
                  {issue.id}
                </span>
              )}
            </button>
          )
        })}

        {/* Map info overlay */}
        <div
          style={{
            position: 'absolute', bottom: 12, left: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'rgba(0,212,255,0.4)',
            letterSpacing: '0.08em',
          }}
        >
          CIVITAS DISPATCH MAP v1.0 · PUNE REGION · {mapLayer.toUpperCase()} LAYER
        </div>

        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute', bottom: 12, right: 12,
            display:  'flex', flexDirection: 'column', gap: 4,
          }}
        >
          {[ZoomIn, ZoomOut].map((Icon, i) => (
            <button
              key={i}
              className="btn-ghost"
              style={{ padding: '5px', width: 28, height: 28, justifyContent: 'center' }}
            >
              <Icon size={12} />
            </button>
          ))}
        </div>

        {/* Legend */}
        <div
          style={{
            position:     'absolute', top: 12, right: 12,
            background:   'rgba(6,8,16,0.7)',
            border:       '1px solid var(--color-border)',
            borderRadius: 6,
            padding:      '8px 10px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      8,
              color:         'var(--color-text-muted)',
              letterSpacing: '0.1em',
              marginBottom:  6,
            }}
          >
            URGENCY LEGEND
          </div>
          {Object.entries(URGENCY_COLOR).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2 mb-1">
              <span
                style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background:   color,
                  boxShadow:    `0 0 4px ${color}`,
                  display:      'inline-block',
                }}
              />
              <span
                style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      9,
                  color:         'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Issue Detail Drawer (bottom of map) ── */}
      {selectedIssue && showDetail && (
        <div
          className="flex-shrink-0 animate-slide-up"
          style={{
            background:   'var(--color-panel)',
            borderTop:    '1px solid rgba(0,212,255,0.2)',
            padding:      '12px 16px',
            boxShadow:    '0 -4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize:   10,
                    color:      'var(--color-text-muted)',
                  }}
                >
                  {selectedIssue.id}
                </span>
                <span className={`urgency-${selectedIssue.urgency}`}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    padding: '1px 6px', borderRadius: 3, letterSpacing: '0.1em',
                  }}
                >
                  {selectedIssue.urgency.toUpperCase()}
                </span>
                <span className="cat-tag">{selectedIssue.category}</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   15,
                  fontWeight: 600,
                  color:      'var(--color-text-primary)',
                }}
              >
                {selectedIssue.title}
              </div>
            </div>
            <button
              className="btn-ghost"
              style={{ padding: '4px' }}
              onClick={() => setShowDetail(false)}
            >
              <X size={13} />
            </button>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-1.5">
              <MapPin size={10} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {selectedIssue.location}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={10} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-secondary)' }}>
                {timeAgo(selectedIssue.reportedAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={10} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: selectedIssue.assignedVolunteers.length ? '#10b981' : '#4a5a7a' }}>
                {selectedIssue.assignedVolunteers.length
                  ? `${selectedIssue.assignedVolunteers.length} assigned`
                  : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* AI summary */}
          {selectedIssue.aiSummary && (
            <div
              className="flex items-start gap-2 mt-2 px-3 py-2 rounded"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <Brain size={12} color="var(--color-cyan)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize:   11,
                  color:      'var(--color-text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: 'var(--color-cyan)', fontWeight: 600 }}>AI: </span>
                {selectedIssue.aiSummary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Re-open detail if closed */}
      {selectedIssue && !showDetail && (
        <button
          onClick={() => setShowDetail(true)}
          className="flex-shrink-0 text-center py-2"
          style={{
            background:   'var(--color-panel)',
            borderTop:    '1px solid var(--color-border)',
            fontFamily:   'var(--font-mono)',
            fontSize:     9,
            color:        'var(--color-cyan)',
            letterSpacing: '0.1em',
            cursor:        'pointer',
            border:        'none',
            width:         '100%',
          }}
        >
          ▲ SHOW ISSUE DETAIL — {selectedIssue.id}
        </button>
      )}
    </div>
  )
}
