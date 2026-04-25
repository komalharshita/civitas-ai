// src/components/charts/CategoryPieChart.jsx
// ─── Doughnut chart: issues broken down by category ───────────

import React, { useEffect, useRef } from 'react'
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { groupByCategory, CATEGORY_COLOR } from '../../utils/formatters'

// Register only what we need (tree-shakeable)
Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

export default function CategoryPieChart({ issues = [] }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // ── Prepare data ──────────────────────────────────────────
    const grouped = groupByCategory(issues)
    const labels  = Object.keys(grouped)
    const data    = Object.values(grouped)
    const colors  = labels.map((l) => CATEGORY_COLOR[l] ?? '#64748b')

    // ── Destroy previous chart instance before re-creating ────
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // ── Create chart ──────────────────────────────────────────
    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.map((c) => c + 'cc'),   // 80% opacity fill
          borderColor:     colors,
          borderWidth:     1.5,
          hoverOffset:     6,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        cutout:              '65%',
        plugins: {
          legend: {
            position:  'bottom',
            labels: {
              color:      '#8899bb',
              font:       { family: "'Share Tech Mono', monospace", size: 9 },
              padding:    10,
              boxWidth:   10,
              boxHeight:  10,
              usePointStyle: true,
              pointStyle:    'circle',
            },
          },
          tooltip: {
            backgroundColor: '#0f1629',
            borderColor:     '#1e2d50',
            borderWidth:     1,
            titleColor:      '#e2eaf8',
            bodyColor:       '#8899bb',
            titleFont:       { family: "'Rajdhani', sans-serif", size: 13, weight: '700' },
            bodyFont:        { family: "'Share Tech Mono', monospace", size: 10 },
            padding:         10,
            callbacks: {
              label: (ctx) => `  ${ctx.label}: ${ctx.parsed} issue${ctx.parsed !== 1 ? 's' : ''}`,
            },
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [issues])

  if (issues.length === 0) {
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 200, color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.08em',
        }}
      >
        NO DATA
      </div>
    )
  }

  return (
    <div style={{ padding: '8px 0' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
