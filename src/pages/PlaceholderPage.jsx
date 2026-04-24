// src/pages/PlaceholderPage.jsx
// ─── Generic placeholder for pages not yet built ──────────────

import React from 'react'
import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title }) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ background: 'var(--color-base)', gap: 16 }}
    >
      {/* Decorative grid */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          background:   'var(--color-panel)',
          border:       '1px solid var(--color-border)',
          borderRadius: 12,
          padding:      '40px 60px',
          textAlign:    'center',
          position:     'relative',
        }}
      >
        <Construction
          size={40}
          color="var(--color-cyan)"
          strokeWidth={1.2}
          style={{ margin: '0 auto 16px', opacity: 0.7 }}
        />

        <div
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      22,
            fontWeight:    700,
            letterSpacing: '0.08em',
            color:         'var(--color-text-primary)',
            textTransform: 'uppercase',
            marginBottom:  8,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize:   13,
            color:      'var(--color-text-muted)',
            maxWidth:   300,
            lineHeight: 1.5,
          }}
        >
          This module is under construction and will be available in the next sprint.
        </div>

        <div
          style={{
            marginTop:     20,
            display:       'inline-block',
            fontFamily:    'var(--font-mono)',
            fontSize:      10,
            color:         'var(--color-cyan)',
            letterSpacing: '0.12em',
            padding:       '4px 12px',
            border:        '1px solid rgba(0,212,255,0.3)',
            borderRadius:  4,
            background:    'rgba(0,212,255,0.06)',
          }}
        >
          COMING SOON
        </div>
      </div>
    </div>
  )
}
