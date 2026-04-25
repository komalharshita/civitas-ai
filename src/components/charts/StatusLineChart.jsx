// src/components/charts/StatusLineChart.jsx
// ─── Line chart: issues opened vs resolved per day (last 7 days) ──

import React, { useEffect, useRef } from 'react'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, Legend)

// Build last-N-days labels and bucket issues into them
function buildDailyBuckets(issues, days = 7) {
  const labels   = []
  const opened   = []
  const resolved = []

  for (let i = days - 1; i >= 0; i--) {
    const d    = new Date()
    d.setDate(d.getDate() - i)
    const key  = d.toDateString()
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

    labels.push(label)
    opened.push(
      issues.filter((iss) => new Date(iss.reportedAt).toDateString() === key).length
    )
    resolved.push(
      issues.filter(
        (iss) => iss.status === 'resolved' && new Date(iss.reportedAt).toDateString() === key
      ).length
    )
  }

  return { labels, opened, resolved }
}

export default function StatusLineChart({ issues = [] }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const { labels, opened, resolved } = buildDailyBuckets(issues, 7)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label:           'Opened',
            data:            opened,
            borderColor:     '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.08)',
            pointBackgroundColor: '#ef4444',
            pointRadius:     4,
            pointHoverRadius: 6,
            tension:         0.4,
            fill:            true,
            borderWidth:     2,
          },
          {
            label:           'Resolved',
            data:            resolved,
            borderColor:     '#10b981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            pointBackgroundColor: '#10b981',
            pointRadius:     4,
            pointHoverRadius: 6,
            tension:         0.4,
            fill:            true,
            borderWidth:     2,
          },
        ],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align:    'end',
            labels: {
              color:         '#8899bb',
              font:          { family: "'Share Tech Mono', monospace", size: 9 },
              padding:       12,
              boxWidth:      10,
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
          },
        },
        scales: {
          x: {
            ticks:  { color: '#4a5a7a', font: { family: "'Share Tech Mono', monospace", size: 9 } },
            grid:   { color: 'rgba(255,255,255,0.04)' },
            border: { color: '#1e2d50' },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color:     '#4a5a7a',
              font:      { family: "'Share Tech Mono', monospace", size: 9 },
              stepSize:  1,
              precision: 0,
            },
            grid:   { color: 'rgba(255,255,255,0.04)' },
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

  return (
    <div style={{ padding: '8px 0' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
