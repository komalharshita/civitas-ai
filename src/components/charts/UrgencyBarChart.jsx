// src/components/charts/UrgencyBarChart.jsx
// ─── Horizontal bar chart: issues by urgency level ────────────

import React, { useEffect, useRef } from 'react'
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { groupByUrgency, URGENCY_COLOR } from '../../utils/formatters'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function UrgencyBarChart({ issues = [] }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const grouped = groupByUrgency(issues)
    const labels  = ['Critical', 'High', 'Medium', 'Low']
    const keys    = ['critical', 'high', 'medium', 'low']
    const data    = keys.map((k) => grouped[k] ?? 0)
    const colors  = keys.map((k) => URGENCY_COLOR[k])

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label:           'Issues',
          data,
          backgroundColor: colors.map((c) => c + 'bb'),
          borderColor:     colors,
          borderWidth:     1.5,
          borderRadius:    4,
          borderSkipped:   false,
        }],
      },
      options: {
        indexAxis:           'y',    // horizontal bars
        responsive:          true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
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
              label: (ctx) => `  ${ctx.parsed.x} issue${ctx.parsed.x !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color:     '#4a5a7a',
              font:      { family: "'Share Tech Mono', monospace", size: 9 },
              stepSize:  1,
              precision: 0,
            },
            grid: {
              color:     'rgba(255,255,255,0.04)',
              lineWidth: 1,
            },
            border: { color: '#1e2d50' },
          },
          y: {
            ticks: {
              color: '#8899bb',
              font:  { family: "'Rajdhani', sans-serif", size: 12, weight: '600' },
            },
            grid:   { display: false },
            border: { color: '#1e2d50' },
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
          height: 160, color: 'var(--color-text-muted)',
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
