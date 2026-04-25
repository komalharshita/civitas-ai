// src/components/charts/VolunteerDonutChart.jsx
// ─── Donut chart: volunteer status breakdown ───────────────────

import React, { useEffect, useRef } from 'react'
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js'

Chart.register(DoughnutController, ArcElement, Tooltip)

export default function VolunteerDonutChart({ volunteers = [] }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const active  = volunteers.filter((v) => v.status === 'active').length
    const busy    = volunteers.filter((v) => v.status === 'busy').length
    const offline = volunteers.filter((v) => v.status === 'offline').length

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Available', 'Deployed', 'Offline'],
        datasets: [{
          data:            [active, busy, offline],
          backgroundColor: ['rgba(16,185,129,0.75)', 'rgba(245,158,11,0.75)', 'rgba(74,90,122,0.5)'],
          borderColor:     ['#10b981', '#f59e0b', '#4a5a7a'],
          borderWidth:     1.5,
          hoverOffset:     4,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        cutout:              '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color:         '#8899bb',
              font:          { family: "'Share Tech Mono', monospace", size: 9 },
              padding:       8,
              boxWidth:      8,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: '#0f1629',
            borderColor:     '#1e2d50',
            borderWidth:     1,
            titleColor:      '#e2eaf8',
            bodyColor:       '#8899bb',
            padding:         8,
          },
        },
      },
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [volunteers])

  return (
    <div style={{ padding: '4px 0', maxWidth: 200, margin: '0 auto' }}>
      <canvas ref={canvasRef} />
    </div>
  )
}
