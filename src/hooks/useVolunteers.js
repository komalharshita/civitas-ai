// src/hooks/useVolunteers.js
// ─────────────────────────────────────────────────────────────────────────────
//  React hook — subscribes to Firestore volunteers in real time
//
//  Usage:
//    const { volunteers, loading } = useVolunteers()
//    const { volunteers } = useVolunteers({ status: 'active' })
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { subscribeToVolunteers } from '../services/firebase.js'
import { VOLUNTEERS as DUMMY_VOLUNTEERS } from '../data/dummyData.js'

/**
 * useVolunteers — live Firestore subscription hook
 *
 * @param {Object}      options
 * @param {string|null} [options.status]           — 'active'|'busy'|'offline'|null (all)
 * @param {boolean}     [options.useDummyFallback] — fall back to dummy data on error
 *
 * @returns {{
 *   volunteers:    Object[],
 *   loading:       boolean,
 *   error:         string|null,
 *   availableCount: number,
 *   deployedCount:  number,
 * }}
 */
export function useVolunteers({ status = null, useDummyFallback = true } = {}) {
  const [volunteers, setVolunteers] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsub = subscribeToVolunteers(
      (freshVolunteers) => {
        const filtered = status
          ? freshVolunteers.filter((v) => v.status === status)
          : freshVolunteers
        setVolunteers(filtered)
        setLoading(false)
      },
      (err) => {
        console.error('[useVolunteers] Firestore subscription error:', err)
        setError(err.message)
        setLoading(false)

        if (useDummyFallback) {
          console.warn('[useVolunteers] Falling back to dummy data.')
          const filtered = status
            ? DUMMY_VOLUNTEERS.filter((v) => v.status === status)
            : DUMMY_VOLUNTEERS
          setVolunteers(filtered)
        }
      },
    )

    return () => unsub()
  }, [status])

  const availableCount = volunteers.filter((v) => v.status === 'active').length
  const deployedCount  = volunteers.filter((v) => v.status === 'busy').length

  return { volunteers, loading, error, availableCount, deployedCount }
}
