// src/utils/formatters.js
// ─── Shared pure utility functions used across all components ─────────────────

// ─── Time ─────────────────────────────────────────────────────────────────────

/**
 * timeAgo — human-readable relative time
 * @param {string|Date} isoString
 * @returns {string} e.g. "just now", "14m ago", "2h 30m ago"
 */
export function timeAgo(isoString) {
  if (!isoString) return ''
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (diff < 60)  return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

/**
 * formatTimestamp — full readable date-time string
 * @param {string|Date} isoString
 * @returns {string} e.g. "14 Jul 2025, 09:47"
 */
export function formatTimestamp(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-IN', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * formatDate — date only
 * @param {string|Date} isoString
 * @returns {string} e.g. "14 Jul 2025"
 */
export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Urgency ──────────────────────────────────────────────────────────────────

/**
 * urgencyScoreToLabel — convert numeric score to label
 * @param {number} score 1-10
 * @returns {'critical'|'high'|'medium'|'low'}
 */
export function urgencyScoreToLabel(score) {
  if (score >= 9) return 'critical'
  if (score >= 7) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

/** Urgency label → display colour */
export const URGENCY_COLOR = {
  critical: '#ef4444',
  high:     '#f59e0b',
  medium:   '#8b5cf6',
  low:      '#10b981',
}

/** Urgency label → short badge label */
export const URGENCY_LABEL = {
  critical: 'CRITICAL',
  high:     'HIGH',
  medium:   'MEDIUM',
  low:      'LOW',
}

// ─── Category ─────────────────────────────────────────────────────────────────

/** Category → accent colour used in charts and badges */
export const CATEGORY_COLOR = {
  'Flood Relief':    '#00d4ff',
  'Medical Aid':     '#ef4444',
  'Food & Water':    '#f59e0b',
  'Infrastructure':  '#8b5cf6',
  'Search & Rescue': '#f97316',
  'Animal Welfare':  '#10b981',
  'Shelter':         '#06b6d4',
  'Communication':   '#6366f1',
  'Other':           '#64748b',
}

// ─── Issue statistics helpers ─────────────────────────────────────────────────

/**
 * groupByCategory — count issues per category
 * @param {Object[]} issues
 * @returns {Object} e.g. { 'Flood Relief': 3, 'Medical Aid': 2 }
 */
export function groupByCategory(issues) {
  return issues.reduce((acc, issue) => {
    const cat = issue.category || 'Other'
    acc[cat] = (acc[cat] ?? 0) + 1
    return acc
  }, {})
}

/**
 * groupByUrgency — count issues per urgency level
 * @param {Object[]} issues
 * @returns {Object} e.g. { critical: 2, high: 3, medium: 1, low: 0 }
 */
export function groupByUrgency(issues) {
  const base = { critical: 0, high: 0, medium: 0, low: 0 }
  return issues.reduce((acc, issue) => {
    const u = issue.urgency ?? urgencyScoreToLabel(issue.urgencyScore ?? 5)
    acc[u] = (acc[u] ?? 0) + 1
    return acc
  }, base)
}

/**
 * groupByStatus — count issues per status
 * @param {Object[]} issues
 * @returns {Object}
 */
export function groupByStatus(issues) {
  const base = { open: 0, 'in-progress': 0, resolved: 0 }
  return issues.reduce((acc, issue) => {
    acc[issue.status ?? 'open'] = (acc[issue.status ?? 'open'] ?? 0) + 1
    return acc
  }, base)
}

/**
 * avgUrgencyScore — mean urgency score across issues
 * @param {Object[]} issues
 * @returns {number}
 */
export function avgUrgencyScore(issues) {
  if (!issues.length) return 0
  const sum = issues.reduce((a, i) => a + (i.urgencyScore ?? 5), 0)
  return Math.round((sum / issues.length) * 10) / 10
}

/**
 * resolutionRate — % of issues resolved
 * @param {Object[]} issues
 * @returns {number} 0–100
 */
export function resolutionRate(issues) {
  if (!issues.length) return 0
  const resolved = issues.filter((i) => i.status === 'resolved').length
  return Math.round((resolved / issues.length) * 100)
}

// ─── String helpers ───────────────────────────────────────────────────────────

/** Truncate a string to maxLen with ellipsis */
export function truncate(str = '', maxLen = 80) {
  return str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '…'
}

/** Title-case a string */
export function titleCase(str = '') {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

/** Generate initials from a name */
export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
