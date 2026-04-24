/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core dark palette
        void:    '#060810',
        base:    '#0a0e1a',
        surface: '#0f1629',
        panel:   '#131d35',
        card:    '#182040',
        border:  '#1e2d50',
        muted:   '#263354',

        // Accent palette
        cyan:    { DEFAULT: '#00d4ff', dim: '#0099bb', glow: '#00d4ff33' },
        amber:   { DEFAULT: '#f59e0b', dim: '#b37a0a', glow: '#f59e0b33' },
        crimson: { DEFAULT: '#ef4444', dim: '#b03232', glow: '#ef444433' },
        jade:    { DEFAULT: '#10b981', dim: '#0d916a', glow: '#10b98133' },
        violet:  { DEFAULT: '#8b5cf6', dim: '#6d48c2', glow: '#8b5cf633' },

        // Text scale
        text: {
          primary:   '#e2eaf8',
          secondary: '#8899bb',
          muted:     '#4a5a7a',
          accent:    '#00d4ff',
        },
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        mono:    ['"Share Tech Mono"', 'monospace'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow':    'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scan':         'scan 6s linear infinite',
        'fade-in':      'fadeIn 0.3s ease forwards',
        'slide-up':     'slideUp 0.3s ease forwards',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'cyan-glow':   '0 0 20px #00d4ff22, 0 0 40px #00d4ff11',
        'amber-glow':  '0 0 20px #f59e0b22, 0 0 40px #f59e0b11',
        'red-glow':    '0 0 20px #ef444422, 0 0 40px #ef444411',
        'panel':       '0 4px 24px rgba(0,0,0,0.5)',
        'card':        'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'grid-pattern': `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
}
