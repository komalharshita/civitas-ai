// src/services/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
//  Firebase initialisation + all Firestore data operations
//
//  HOW TO SET UP:
//  1. Go to https://console.firebase.google.com
//  2. Create project → Add web app → copy the config object
//  3. Paste your values into .env (see .env.example)
//  4. Enable Firestore: Firebase Console → Build → Firestore Database → Create
//  5. Set Firestore rules to test mode for hackathon (lock down before launch)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp }          from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
}                                  from 'firebase/firestore'

// ─── 1. Firebase config from env variables ────────────────────────────────────
//  Vite exposes only vars prefixed with VITE_ to the browser bundle.
//  Never hardcode keys here — always use import.meta.env.VITE_*
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// ─── 2. Initialise Firebase app (singleton — safe to import anywhere) ─────────
const app = initializeApp(firebaseConfig)

// ─── 3. Firestore database instance ──────────────────────────────────────────
export const db = getFirestore(app)

// ─── 4. Collection references (centralised — change name in one place) ────────
export const COLLECTIONS = {
  ISSUES:     'issues',
  VOLUNTEERS: 'volunteers',
  ALERTS:     'alerts',
}

// ══════════════════════════════════════════════════════════════════════════════
//  ISSUE OPERATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * addIssue — saves a new issue document to Firestore
 *
 * @param {Object} issueData — shape matches the Issue schema below
 * @returns {Promise<string>} — the new Firestore document ID
 *
 * Firestore document schema (issues collection):
 * {
 *   title:              string,
 *   description:        string,
 *   location:           string,
 *   coordinates:        { lat: number, lng: number },
 *   category:           string,           ← set by AI
 *   urgency:            'critical'|'high'|'medium'|'low',
 *   urgencyScore:       number (1–10),    ← set by AI
 *   status:             'open'|'in-progress'|'resolved',
 *   reportedBy:         string,
 *   reportedAt:         Timestamp,        ← serverTimestamp()
 *   assignedVolunteers: string[],         ← volunteer doc IDs
 *   aiSummary:          string,           ← set by AI
 *   tags:               string[],
 * }
 */
export async function addIssue(issueData) {
  try {
    const issuesRef = collection(db, COLLECTIONS.ISSUES)

    // Build the document — serverTimestamp() is set by Firestore itself
    const docData = {
      title:              issueData.title              ?? '',
      description:        issueData.description        ?? '',
      location:           issueData.location           ?? '',
      coordinates:        issueData.coordinates        ?? { lat: 0, lng: 0 },
      category:           issueData.category           ?? 'Other',
      urgency:            issueData.urgency            ?? 'medium',
      urgencyScore:       issueData.urgencyScore       ?? 5,
      status:             issueData.status             ?? 'open',
      reportedBy:         issueData.reportedBy         ?? 'Anonymous',
      reportedAt:         serverTimestamp(),            // ← always use server time
      assignedVolunteers: issueData.assignedVolunteers ?? [],
      aiSummary:          issueData.aiSummary          ?? '',
      tags:               issueData.tags               ?? [],
    }

    const docRef = await addDoc(issuesRef, docData)
    console.log('[Firestore] Issue added with ID:', docRef.id)
    return docRef.id

  } catch (error) {
    console.error('[Firestore] addIssue failed:', error)
    throw error  // re-throw so the caller can handle it (e.g. show toast)
  }
}

/**
 * fetchIssues — one-time fetch of all issues, newest first
 * Use subscribeToIssues() instead for real-time updates in React components
 *
 * @returns {Promise<Object[]>} — array of issue objects (with id field added)
 */
export async function fetchIssues() {
  try {
    const q        = query(
      collection(db, COLLECTIONS.ISSUES),
      orderBy('reportedAt', 'desc'),   // newest first
    )
    const snapshot = await getDocs(q)

    // Map each Firestore doc → plain JS object with id attached
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp → ISO string for easier display
      reportedAt: doc.data().reportedAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    }))

  } catch (error) {
    console.error('[Firestore] fetchIssues failed:', error)
    throw error
  }
}

/**
 * fetchIssueById — fetch a single issue document
 *
 * @param {string} issueId — Firestore document ID
 * @returns {Promise<Object|null>}
 */
export async function fetchIssueById(issueId) {
  try {
    const docRef  = doc(db, COLLECTIONS.ISSUES, issueId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) return null

    return {
      id: docSnap.id,
      ...docSnap.data(),
      reportedAt: docSnap.data().reportedAt?.toDate?.().toISOString() ?? new Date().toISOString(),
    }
  } catch (error) {
    console.error('[Firestore] fetchIssueById failed:', error)
    throw error
  }
}

/**
 * updateIssue — update specific fields on an existing issue
 *
 * @param {string} issueId  — Firestore document ID
 * @param {Object} updates  — partial object with fields to update
 * @returns {Promise<void>}
 *
 * Example:
 *   updateIssue('abc123', { status: 'in-progress', assignedVolunteers: ['VOL-001'] })
 */
export async function updateIssue(issueId, updates) {
  try {
    const docRef = doc(db, COLLECTIONS.ISSUES, issueId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    console.log('[Firestore] Issue updated:', issueId)
  } catch (error) {
    console.error('[Firestore] updateIssue failed:', error)
    throw error
  }
}

/**
 * subscribeToIssues — REAL-TIME listener for the issues collection
 * Returns an unsubscribe function — call it when your component unmounts.
 *
 * @param {Function} onData  — called with updated issue array on every change
 * @param {Function} onError — called if the listener fails
 * @returns {Function} unsubscribe
 *
 * Usage in a React component:
 *   useEffect(() => {
 *     const unsub = subscribeToIssues(setIssues, console.error)
 *     return unsub   // cleanup on unmount
 *   }, [])
 */
export function subscribeToIssues(onData, onError) {
  const q = query(
    collection(db, COLLECTIONS.ISSUES),
    orderBy('reportedAt', 'desc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const issues = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate?.().toISOString() ?? new Date().toISOString(),
      }))
      onData(issues)
    },
    onError,
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  VOLUNTEER OPERATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * fetchVolunteers — one-time fetch of all volunteers
 *
 * @param {string|null} statusFilter — optional 'active'|'busy'|'offline' filter
 * @returns {Promise<Object[]>}
 *
 * Firestore document schema (volunteers collection):
 * {
 *   name:               string,
 *   avatar:             string,       ← 2-letter initials
 *   skills:             string[],
 *   status:             'active'|'busy'|'offline',
 *   assignedIssue:      string|null,  ← issue doc ID or null
 *   location:           string,
 *   zone:               string,
 *   rating:             number,
 *   missionsCompleted:  number,
 *   phone:              string,
 * }
 */
export async function fetchVolunteers(statusFilter = null) {
  try {
    // Build query — with or without status filter
    const constraints = [collection(db, COLLECTIONS.VOLUNTEERS)]
    if (statusFilter) {
      constraints.push(where('status', '==', statusFilter))
    }

    const q        = query(...constraints)
    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

  } catch (error) {
    console.error('[Firestore] fetchVolunteers failed:', error)
    throw error
  }
}

/**
 * fetchAvailableVolunteers — convenience wrapper: only active (unassigned) volunteers
 * @returns {Promise<Object[]>}
 */
export async function fetchAvailableVolunteers() {
  return fetchVolunteers('active')
}

/**
 * subscribeToVolunteers — REAL-TIME listener for the volunteers collection
 *
 * @param {Function} onData
 * @param {Function} onError
 * @returns {Function} unsubscribe
 */
export function subscribeToVolunteers(onData, onError) {
  return onSnapshot(
    collection(db, COLLECTIONS.VOLUNTEERS),
    (snapshot) => {
      onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    },
    onError,
  )
}

/**
 * updateVolunteerStatus — mark a volunteer as busy/active after assignment
 *
 * @param {string}      volunteerId
 * @param {'active'|'busy'|'offline'} status
 * @param {string|null} assignedIssueId
 */
export async function updateVolunteerStatus(volunteerId, status, assignedIssueId = null) {
  try {
    const docRef = doc(db, COLLECTIONS.VOLUNTEERS, volunteerId)
    await updateDoc(docRef, {
      status,
      assignedIssue: assignedIssueId,
      updatedAt:     serverTimestamp(),
    })
  } catch (error) {
    console.error('[Firestore] updateVolunteerStatus failed:', error)
    throw error
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  ALERTS OPERATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * addAlert — push a new system alert into Firestore
 *
 * @param {'critical'|'warning'|'info'|'success'} type
 * @param {string} message
 * @param {string} source
 */
export async function addAlert(type, message, source = 'Civitas AI') {
  try {
    await addDoc(collection(db, COLLECTIONS.ALERTS), {
      type,
      message,
      source,
      isRead:    false,
      timestamp: serverTimestamp(),
    })
  } catch (error) {
    console.error('[Firestore] addAlert failed:', error)
    // Don't throw — alerts are non-critical
  }
}

/**
 * subscribeToAlerts — REAL-TIME listener for alerts (latest 20)
 *
 * @param {Function} onData
 * @param {Function} onError
 * @returns {Function} unsubscribe
 */
export function subscribeToAlerts(onData, onError) {
  const q = query(
    collection(db, COLLECTIONS.ALERTS),
    orderBy('timestamp', 'desc'),
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const alerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.().toISOString() ?? new Date().toISOString(),
      }))
      onData(alerts)
    },
    onError,
  )
}
