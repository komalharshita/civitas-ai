// src/utils/constants.js
// ─── App-wide constants — single source of truth ─────────────────────────────

export const APP_NAME    = 'Civitas AI'
export const APP_VERSION = '1.0.0'
export const APP_REGION  = 'Pune, Maharashtra'

// ─── Issue status ─────────────────────────────────────────────────────────────
export const STATUS = {
  OPEN:        'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED:    'resolved',
}

export const STATUS_LABEL = {
  [STATUS.OPEN]:        'Open',
  [STATUS.IN_PROGRESS]: 'In Progress',
  [STATUS.RESOLVED]:    'Resolved',
}

// ─── Volunteer status ─────────────────────────────────────────────────────────
export const VOL_STATUS = {
  ACTIVE:  'active',
  BUSY:    'busy',
  OFFLINE: 'offline',
}

// ─── Urgency ──────────────────────────────────────────────────────────────────
export const URGENCY = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
}

// Alert type thresholds
export const URGENCY_SCORE_HIGH_THRESHOLD = 8   // urgencyScore ≥ this → auto-alert

// ─── Firestore collection names ───────────────────────────────────────────────
export const COLLECTION = {
  ISSUES:     'issues',
  VOLUNTEERS: 'volunteers',
  ALERTS:     'alerts',
}

// ─── Chart colours (matches CATEGORY_COLOR in formatters.js) ─────────────────
export const CHART_PALETTE = [
  '#00d4ff', '#ef4444', '#f59e0b', '#8b5cf6',
  '#f97316', '#10b981', '#06b6d4', '#6366f1', '#64748b',
]
