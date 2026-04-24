// src/components/modals/IssueForm.jsx
// ─── Modal form to report a new issue ────────────────────────
// ─── Now wired to real Gemini AI + Firestore backend ─────────

import React, { useState } from 'react'
import { X, Brain, MapPin, Send, AlertTriangle, Loader, CheckCircle, Users } from 'lucide-react'
import { CATEGORIES, URGENCY_LEVELS } from '../../data/dummyData'
import { classifyIssueWithFallback }  from '../../services/aiService'
import { submitIssue }                from '../../services/issueService'

const DEFAULT_FORM = {
  title:       '',
  description: '',
  location:    '',
  category:    '',
  urgency:     'medium',
  reportedBy:  '',
}

const URGENCY_CONFIG = {
  critical: { color: '#ef4444', label: 'Critical — Immediate life risk' },
  high:     { color: '#f59e0b', label: 'High — Urgent attention needed' },
  medium:   { color: '#8b5cf6', label: 'Medium — Important but stable' },
  low:      { color: '#10b981', label: 'Low — Can wait' },
}

export default function IssueForm({ onClose, onSubmit }) {
  const [form,           setForm]           = useState(DEFAULT_FORM)
  const [aiLoading,      setAiLoading]      = useState(false)
  const [aiResult,       setAiResult]       = useState(null)
  const [isSubmitting,   setIsSubmitting]   = useState(false)
  const [submitProgress, setSubmitProgress] = useState(null)  // { step, progress }
  const [submitResult,   setSubmitResult]   = useState(null)  // final result from backend
  const [errors,         setErrors]         = useState({})

  // ── Field change handler ─────────────────────────────────────────────────
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  // ── Real AI classification via Gemini API ────────────────────────────────
  async function handleAiAnalyze() {
    if (!form.title || !form.description) {
      setErrors({
        title:       !form.title       ? 'Required to run AI analysis' : '',
        description: !form.description ? 'Required to run AI analysis' : '',
      })
      return
    }

    setAiLoading(true)
    setAiResult(null)

    try {
      // ← Real Gemini API call (replaces the old simulated setTimeout)
      const result = await classifyIssueWithFallback(
        form.title,
        form.description,
        form.location,
      )

      setAiResult(result)
      // Auto-apply AI's category and urgency into the form
      setForm((prev) => ({
        ...prev,
        category: result.category,
        urgency:  result.urgency,
      }))
    } catch (err) {
      console.error('[IssueForm] AI analysis failed:', err)
      setErrors((e) => ({ ...e, _ai: 'AI classification failed. You can set category manually.' }))
    } finally {
      setAiLoading(false)
    }
  }

  // ── Apply AI suggestion manually ─────────────────────────────────────────
  function applyAiSuggestion() {
    if (!aiResult) return
    setForm((prev) => ({
      ...prev,
      category: aiResult.category,
      urgency:  aiResult.urgency,
    }))
  }

  // ── Validate & submit — full pipeline ────────────────────────────────────
  async function handleSubmit() {
    // Client-side validation
    const newErrors = {}
    if (!form.title.trim())       newErrors.title       = 'Issue title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.location.trim())    newErrors.location    = 'Location is required'
    if (!form.category)           newErrors.category    = 'Select a category'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitProgress({ step: 'Starting…', progress: 0 })

    try {
      // ← This is the real orchestration call:
      //   1. Classifies with Gemini (if not already done)
      //   2. Fetches volunteers from Firestore
      //   3. Runs the matching engine
      //   4. Saves the issue to Firestore
      //   5. Returns { issueId, aiResult, matchedVolunteers, matchSummary }
      const result = await submitIssue(
        {
          ...form,
          coordinates: { lat: 18.5204, lng: 73.8567 },   // default Pune coords — replace with geocoder
        },
        {
          topN:       3,
          autoAssign: false,   // set true to auto-mark matched volunteers as busy
          onProgress: ({ step, progress }) => {
            setSubmitProgress({ step, progress })
          },
        },
      )

      setSubmitResult(result)

      // Notify the parent component (Dashboard) with a local issue object
      // shaped the same as dummyData.js so the UI updates instantly
      onSubmit({
        id:                 result.issueId,
        ...form,
        category:           result.aiResult.category,
        urgency:            result.aiResult.urgency,
        urgencyScore:       result.aiResult.urgencyScore,
        aiSummary:          result.aiResult.summary,
        tags:               result.aiResult.tags ?? [],
        status:             'open',
        assignedVolunteers: [],
        reportedAt:         new Date().toISOString(),
        coordinates:        { lat: 18.5204, lng: 73.8567 },
        _matchedVolunteers: result.matchedVolunteers,
        _matchSummary:      result.matchSummary,
      })

    } catch (err) {
      console.error('[IssueForm] submitIssue failed:', err)
      setErrors((e) => ({
        ...e,
        _submit: `Submission failed: ${err.message}. Check your Firebase config in .env`,
      }))
      setIsSubmitting(false)
      setSubmitProgress(null)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="animate-slide-up"
        style={{
          background:   'var(--color-panel)',
          border:       '1px solid var(--color-border)',
          borderRadius: 10,
          width:        '100%',
          maxWidth:     560,
          maxHeight:    '90vh',
          overflowY:    'auto',
          boxShadow:    '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* ── Modal Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <div>
            <div
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      17,
                fontWeight:    700,
                letterSpacing: '0.06em',
                color:         'var(--color-text-primary)',
              }}
            >
              REPORT NEW ISSUE
            </div>
            <div
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      9,
                color:         'var(--color-text-muted)',
                letterSpacing: '0.1em',
                marginTop:     2,
              }}
            >
              CIVITAS AI DISPATCH · ISSUE INTAKE FORM
            </div>
          </div>
          <button
            className="btn-ghost"
            style={{ padding: 6 }}
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Form Body ── */}
        <div className="px-5 py-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Title */}
          <div>
            <label className="form-label">Issue Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Brief description of the issue"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            {errors.title && (
              <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-body)', marginTop: 3, display: 'block' }}>
                {errors.title}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-input"
              placeholder="Describe the situation in detail — number of people affected, current conditions, what is needed…"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              style={{ resize: 'vertical' }}
            />
            {errors.description && (
              <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-body)', marginTop: 3, display: 'block' }}>
                {errors.description}
              </span>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="form-label">
              <MapPin size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Location *
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Koregaon Park Lane 7, Pune"
              value={form.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
            {errors.location && (
              <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-body)', marginTop: 3, display: 'block' }}>
                {errors.location}
              </span>
            )}
          </div>

          {/* AI Analyze Button */}
          <button
            onClick={handleAiAnalyze}
            disabled={aiLoading}
            style={{
              display:       'flex',
              alignItems:    'center',
              justifyContent: 'center',
              gap:           8,
              padding:       '10px',
              borderRadius:  6,
              border:        '1px dashed rgba(0,212,255,0.4)',
              background:    'rgba(0,212,255,0.05)',
              color:         'var(--color-cyan)',
              fontFamily:    'var(--font-display)',
              fontSize:      12,
              fontWeight:    600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor:        aiLoading ? 'wait' : 'pointer',
              transition:    'all 0.15s',
            }}
          >
            {aiLoading ? (
              <>
                <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} />
                AI ANALYZING…
              </>
            ) : (
              <>
                <Brain size={13} />
                AUTO-CLASSIFY WITH AI
              </>
            )}
          </button>

          {/* AI Result */}
          {aiResult && (
            <div
              className="animate-slide-up"
              style={{
                background:   'rgba(0,212,255,0.05)',
                border:       '1px solid rgba(0,212,255,0.2)',
                borderRadius: 6,
                padding:      '12px 14px',
              }}
            >
              <div
                className="flex items-center gap-2 mb-2"
                style={{ borderBottom: '1px solid rgba(0,212,255,0.1)', paddingBottom: 8 }}
              >
                <Brain size={12} color="var(--color-cyan)" />
                <span
                  style={{
                    fontFamily:    'var(--font-display)',
                    fontSize:      11,
                    fontWeight:    700,
                    letterSpacing: '0.1em',
                    color:         'var(--color-cyan)',
                    textTransform: 'uppercase',
                  }}
                >
                  AI Recommendation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 3 }}>
                    CATEGORY
                  </span>
                  <span className="cat-tag">{aiResult.category}</span>
                </div>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 3 }}>
                    URGENCY
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      padding: '2px 8px',
                      borderRadius: 3,
                      letterSpacing: '0.08em',
                      color: URGENCY_CONFIG[aiResult.urgency].color,
                      border: `1px solid ${URGENCY_CONFIG[aiResult.urgency].color}55`,
                      background: `${URGENCY_CONFIG[aiResult.urgency].color}15`,
                    }}
                  >
                    {aiResult.urgency.toUpperCase()}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize:   11,
                  color:      'var(--color-text-secondary)',
                  lineHeight: 1.4,
                  marginBottom: 8,
                }}
              >
                {aiResult.summary}
              </p>

              <button
                onClick={applyAiSuggestion}
                className="btn-ghost"
                style={{ fontSize: 10, padding: '4px 10px' }}
              >
                ✓ APPLY SUGGESTION
              </button>
            </div>
          )}

          {/* Category + Urgency row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && (
                <span style={{ fontSize: 11, color: '#ef4444', fontFamily: 'var(--font-body)', marginTop: 3, display: 'block' }}>
                  {errors.category}
                </span>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="form-label">Urgency Level</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {URGENCY_LEVELS.map((level) => {
                  const cfg      = URGENCY_CONFIG[level]
                  const isActive = form.urgency === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => handleChange('urgency', level)}
                      style={{
                        display:       'flex',
                        alignItems:    'center',
                        gap:           8,
                        padding:       '5px 10px',
                        borderRadius:  4,
                        border:        `1px solid ${isActive ? cfg.color + '55' : 'var(--color-border)'}`,
                        background:    isActive ? cfg.color + '15' : 'transparent',
                        cursor:        'pointer',
                        transition:    'all 0.12s',
                        textAlign:     'left',
                      }}
                    >
                      <span
                        style={{
                          width: 7, height: 7,
                          borderRadius: '50%',
                          background: cfg.color,
                          display: 'inline-block',
                          boxShadow: isActive ? `0 0 6px ${cfg.color}` : 'none',
                        }}
                      />
                      <span
                        style={{
                          fontFamily:    'var(--font-body)',
                          fontSize:      11,
                          color:         isActive ? cfg.color : 'var(--color-text-secondary)',
                          transition:    'color 0.12s',
                        }}
                      >
                        {cfg.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Reporter name */}
          <div>
            <label className="form-label">Reported By</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your name or organization"
              value={form.reportedBy}
              onChange={(e) => handleChange('reportedBy', e.target.value)}
            />
          </div>
        </div>

        {/* ── Submission progress bar ── */}
        {isSubmitting && submitProgress && (
          <div className="px-5 pb-3">
            <div
              style={{
                background:   'rgba(0,212,255,0.05)',
                border:       '1px solid rgba(0,212,255,0.15)',
                borderRadius: 6,
                padding:      '10px 12px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-cyan)' }}>
                  {submitProgress.step}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-muted)' }}>
                  {submitProgress.progress}%
                </span>
              </div>
              {/* Progress bar track */}
              <div style={{ height: 3, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    height:     '100%',
                    width:      `${submitProgress.progress}%`,
                    background: 'var(--color-cyan)',
                    borderRadius: 2,
                    transition: 'width 0.3s ease',
                    boxShadow:  '0 0 8px rgba(0,212,255,0.6)',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Success state: show matched volunteers ── */}
        {submitResult && (
          <div
            className="mx-5 mb-4 animate-slide-up"
            style={{
              background:   'rgba(16,185,129,0.06)',
              border:       '1px solid rgba(16,185,129,0.25)',
              borderRadius: 8,
              padding:      '12px 14px',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={13} color="#10b981" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.08em' }}>
                ISSUE SAVED — ID: {submitResult.issueId?.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
              {submitResult.matchSummary}
            </p>

            {/* Matched volunteers */}
            {submitResult.matchedVolunteers?.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  TOP MATCHES
                </div>
                {submitResult.matchedVolunteers.map((vol, i) => (
                  <div
                    key={vol.id}
                    className="flex items-center justify-between mb-1"
                    style={{
                      padding:      '5px 8px',
                      borderRadius: 4,
                      background:   'rgba(255,255,255,0.03)',
                      border:       '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)' }}>
                        #{i + 1}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {vol.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-text-muted)' }}>
                        {vol._matchReason}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily:   'var(--font-mono)',
                        fontSize:     10,
                        color:        '#10b981',
                        background:   'rgba(16,185,129,0.1)',
                        border:       '1px solid rgba(16,185,129,0.25)',
                        padding:      '1px 6px',
                        borderRadius: 3,
                      }}
                    >
                      {vol._score}pts
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-primary w-full justify-center mt-3"
              onClick={onClose}
              style={{ fontSize: 11 }}
            >
              <CheckCircle size={11} /> DONE — CLOSE
            </button>
          </div>
        )}

        {/* ── Global submit error ── */}
        {errors._submit && (
          <div className="mx-5 mb-3 px-3 py-2 rounded" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#ef4444' }}>{errors._submit}</span>
          </div>
        )}

        {/* ── Modal Footer ── */}
        {!submitResult && (
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={11} color="var(--color-text-muted)" />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--color-text-muted)' }}>
                Fields marked * are required
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                    PROCESSING…
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    SUBMIT ISSUE
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
