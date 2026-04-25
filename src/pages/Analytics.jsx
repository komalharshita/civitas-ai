// src/pages/Analytics.jsx
// ─── Analytics & Reports page — all Chart.js visualisations ──────────────────

import React, { useMemo } from 'react'
import {
  BarChart3, TrendingUp, Users, AlertTriangle,
  CheckCircle2, Clock, Zap, Target,
} from 'lucide-react'

import CategoryPieChart    from '../components/charts/CategoryPieChart'
import UrgencyBarChart     from '../components/charts/UrgencyBarChart'
import StatusLineChart     from '../components/charts/StatusLineChart'
import VolunteerDonutChart from '../components/charts/VolunteerDonutChart'

import { useIssues }     from '../hooks/useIssues'
import { useVolunteers } from '../hooks/useVolunteers'
import {
  groupByCategory,
  groupByUrgency,
  groupByStatus,
  avgUrgencyScore,
  resolutionRate,
  URGENCY_COLOR,
  CATEGORY_COLOR,
} from '../utils/formatters'

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, pulse = false }) {
  return (
    <div
      style={{
        background:   'var(--color-panel)',
        border:       `1px solid ${color}33`,
        borderRadius: 8,
        padding:      '14px 18px',
        transition:   'transform 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          {label}
        </span>
        <Icon size={14} color={color} style={pulse ? { animation: 'statusPulse 2s infinite' } : {}} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, span = 1 }) {
  return (
    <div
      style={{
        background:   'var(--color-panel)',
        border:       '1px solid var(--color-border)',
        borderRadius: 8,
        padding:      '16px 18px',
        gridColumn:   `span ${span}`,
      }}
    >
      <div className="mb-4">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { issues }     = useIssues()
  const { volunteers } = useVolunteers()

  // Derived stats
  const categoryData = useMemo(() => groupByCategory(issues), [issues])
  const urgencyData  = useMemo(() => groupByUrgency(issues),  [issues])
  const statusData   = useMemo(() => groupByStatus(issues),   [issues])
  const avgUrgency   = useMemo(() => avgUrgencyScore(issues), [issues])
  const resolveRate  = useMemo(() => resolutionRate(issues),  [issues])

  const topCategory  = useMemo(() => {
    const entries = Object.entries(categoryData)
    if (!entries.length) return '—'
    return entries.sort((a, b) => b[1] - a[1])[0][0]
  }, [categoryData])

  const available  = volunteers.filter((v) => v.status === 'active').length
  const deployed   = volunteers.filter((v) => v.status === 'busy').length
  const deployRate = volunteers.length ? Math.round((deployed / volunteers.length) * 100) : 0

  // Category breakdown table rows
  const categoryRows = useMemo(() =>
    Object.entries(categoryData)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, count]) => ({
        cat,
        count,
        pct: issues.length ? Math.round((count / issues.length) * 100) : 0,
        color: CATEGORY_COLOR[cat] ?? '#64748b',
      })),
    [categoryData, issues.length]
  )

  return (
    <div
      className="flex-1 overflow-y-auto bg-grid"
      style={{ background: 'var(--color-base)', padding: '20px 24px' }}
    >
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div style={{ width: 3, height: 24, background: 'var(--color-cyan)', borderRadius: 2, boxShadow: '0 0 8px rgba(0,212,255,0.6)' }} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-text-primary)' }}>
            ANALYTICS & REPORTS
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.12em', marginTop: 2 }}>
            CIVITAS AI · LIVE DATA · {issues.length} ISSUES · {volunteers.length} VOLUNTEERS
          </div>
        </div>
      </div>

      {/* ── KPI stat row ── */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        <StatCard
          label="Total Issues"
          value={issues.length}
          sub={`${statusData.open ?? 0} open · ${statusData['in-progress'] ?? 0} active`}
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <StatCard
          label="Resolution Rate"
          value={`${resolveRate}%`}
          sub={`${statusData.resolved ?? 0} resolved today`}
          icon={CheckCircle2}
          color="#10b981"
        />
        <StatCard
          label="Avg Urgency Score"
          value={avgUrgency || '—'}
          sub="Scale of 1 – 10"
          icon={Zap}
          color={avgUrgency >= 7 ? '#ef4444' : avgUrgency >= 5 ? '#f59e0b' : '#10b981'}
          pulse={avgUrgency >= 8}
        />
        <StatCard
          label="Top Category"
          value={topCategory === '—' ? '—' : topCategory.split(' ')[0]}
          sub={topCategory !== '—' ? topCategory : 'No issues yet'}
          icon={Target}
          color={CATEGORY_COLOR[topCategory] ?? '#00d4ff'}
        />
      </div>

      {/* ── Volunteer stat row ── */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        <StatCard label="Total Volunteers" value={volunteers.length} sub="Registered responders"  icon={Users}       color="#00d4ff" />
        <StatCard label="Available Now"    value={available}         sub="Ready to deploy"        icon={UserCheck2}  color="#10b981" />
        <StatCard label="Deployed"         value={deployed}          sub="On active missions"     icon={TrendingUp}  color="#f59e0b" pulse={deployed > 0} />
        <StatCard label="Deployment Rate"  value={`${deployRate}%`}  sub="% currently on mission" icon={BarChart3}   color="#8b5cf6" />
      </div>

      {/* ── Charts grid ── */}
      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        {/* Issues opened vs resolved — spans 2 cols */}
        <ChartCard
          title="Issue Trend"
          subtitle="Opened vs resolved — last 7 days"
          span={2}
        >
          <StatusLineChart issues={issues} />
        </ChartCard>

        {/* Volunteer breakdown */}
        <ChartCard title="Volunteer Status" subtitle="Current availability">
          <VolunteerDonutChart volunteers={volunteers} />
        </ChartCard>
      </div>

      <div
        className="grid gap-4 mb-6"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        {/* Category pie */}
        <ChartCard title="Issues by Category" subtitle="All time distribution">
          <CategoryPieChart issues={issues} />
        </ChartCard>

        {/* Urgency bar */}
        <ChartCard title="Urgency Distribution" subtitle="Count per severity level">
          <UrgencyBarChart issues={issues} />
        </ChartCard>

        {/* Category breakdown table */}
        <ChartCard title="Category Breakdown" subtitle="Issues per category">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categoryRows.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                NO DATA YET
              </div>
            ) : (
              categoryRows.map(({ cat, count, pct, color }) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {cat}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        height:       '100%',
                        width:        `${pct}%`,
                        background:   color,
                        borderRadius: 2,
                        transition:   'width 0.6s ease',
                        boxShadow:    `0 0 6px ${color}66`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* ── Urgency level breakdown table ── */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}
      >
        {(['critical', 'high', 'medium', 'low']).map((level) => {
          const count = urgencyData[level] ?? 0
          const color = URGENCY_COLOR[level]
          const pct   = issues.length ? Math.round((count / issues.length) * 100) : 0
          return (
            <div
              key={level}
              style={{
                background:   'var(--color-panel)',
                border:       `1px solid ${color}33`,
                borderLeft:   `3px solid ${color}`,
                borderRadius: 8,
                padding:      '12px 16px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
                {level}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color, lineHeight: 1 }}>
                {count}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {pct}% of total issues
              </div>
              {/* Mini progress bar */}
              <div style={{ height: 2, background: 'var(--color-border)', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Inline icon not in lucide-react default export — use a simple svg fallback
function UserCheck2({ size = 16, color = 'currentColor', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}
