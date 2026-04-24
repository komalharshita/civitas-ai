// scripts/seedFirestore.js
// ─────────────────────────────────────────────────────────────────────────────
//  One-time seed script — populates Firestore with dummy volunteers and issues
//
//  HOW TO RUN:
//  1. Make sure .env is filled in (VITE_FIREBASE_* values)
//  2. Run:  node --env-file=.env scripts/seedFirestore.js
//
//  WARNING: This script REPLACES existing documents in the seeded collections.
//  Only run it once on a fresh database, or when you want to reset test data.
//
//  This script uses Firebase Admin SDK — a server-side SDK that bypasses
//  Firestore security rules. Perfect for seeding from your local machine.
//
//  Install admin SDK first:
//    npm install firebase-admin --save-dev
//
//  For the admin SDK you need a service account JSON:
//    Firebase Console → Project Settings → Service accounts → Generate new private key
//    Save as scripts/serviceAccountKey.json (already in .gitignore)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Use dynamic import check since this runs in Node, not the browser ────────
// If you prefer client SDK seeding (simpler but needs Firestore rules in test mode):
// import { initializeApp } from 'firebase/app'
// import { getFirestore, setDoc, doc, collection, addDoc } from 'firebase/firestore'

// ─── Service account path (keep this file out of git!) ───────────────────────
const SERVICE_ACCOUNT_PATH = './scripts/serviceAccountKey.json'

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED_VOLUNTEERS = [
  {
    id:                'VOL-001',
    name:              'Arjun Mehta',
    avatar:            'AM',
    skills:            ['First Aid', 'Medical', 'CPR'],
    status:            'active',
    assignedIssue:     null,
    location:          'Hadapsar, Pune',
    zone:              'East',
    rating:            4.9,
    missionsCompleted: 47,
    phone:             '+91 98220 11234',
  },
  {
    id:                'VOL-002',
    name:              'Sneha Kapoor',
    avatar:            'SK',
    skills:            ['Search & Rescue', 'Navigation', 'First Aid'],
    status:            'active',
    assignedIssue:     null,
    location:          'Katraj, Pune',
    zone:              'South',
    rating:            4.8,
    missionsCompleted: 62,
    phone:             '+91 99705 43210',
  },
  {
    id:                'VOL-003',
    name:              'Rahul Desai',
    avatar:            'RD',
    skills:            ['Flood Relief', 'Boat Operation', 'Heavy Lifting'],
    status:            'active',
    assignedIssue:     null,
    location:          'Viman Nagar, Pune',
    zone:              'East',
    rating:            4.7,
    missionsCompleted: 33,
    phone:             '+91 91234 56789',
  },
  {
    id:                'VOL-004',
    name:              'Divya Iyer',
    avatar:            'DI',
    skills:            ['Food Distribution', 'Logistics', 'Counselling'],
    status:            'active',
    assignedIssue:     null,
    location:          'Shivajinagar, Pune',
    zone:              'Central',
    rating:            5.0,
    missionsCompleted: 28,
    phone:             '+91 87654 32109',
  },
  {
    id:                'VOL-005',
    name:              'Kiran Bhosle',
    avatar:            'KB',
    skills:            ['Infrastructure', 'Chainsaw', 'Heavy Equipment'],
    status:            'active',
    assignedIssue:     null,
    location:          'Baner, Pune',
    zone:              'West',
    rating:            4.6,
    missionsCompleted: 19,
    phone:             '+91 94532 78901',
  },
  {
    id:                'VOL-006',
    name:              'Pooja Wagh',
    avatar:            'PW',
    skills:            ['Communication', 'Satellite Ops', 'Coordination'],
    status:            'active',
    assignedIssue:     null,
    location:          'Katraj, Pune',
    zone:              'South',
    rating:            4.8,
    missionsCompleted: 54,
    phone:             '+91 96321 00987',
  },
  {
    id:                'VOL-007',
    name:              'Amit Kulkarni',
    avatar:            'AK',
    skills:            ['Flood Relief', 'Evacuation', 'First Aid'],
    status:            'active',
    assignedIssue:     null,
    location:          'Koregaon Park, Pune',
    zone:              'North-East',
    rating:            4.5,
    missionsCompleted: 22,
    phone:             '+91 99234 10101',
  },
  {
    id:                'VOL-008',
    name:              'Nisha Gaikwad',
    avatar:            'NG',
    skills:            ['Medical', 'Nursing', 'Triage'],
    status:            'active',
    assignedIssue:     null,
    location:          'Kothrud, Pune',
    zone:              'West',
    rating:            4.9,
    missionsCompleted: 38,
    phone:             '+91 91111 22233',
  },
]

// ─── Main seed function ────────────────────────────────────────────────────────

async function seed() {
  let admin

  try {
    // Try to load firebase-admin — if not installed, show clear error
    admin = await import('firebase-admin')
  } catch {
    console.error(`
❌ firebase-admin is not installed.

Run:  npm install firebase-admin --save-dev
Then: node --env-file=.env scripts/seedFirestore.js

Alternatively, seed via the Firebase Console UI:
  https://console.firebase.google.com → Firestore → Add documents manually
    `)
    process.exit(1)
  }

  let serviceAccount
  try {
    const { createRequire } = await import('module')
    const require    = createRequire(import.meta.url)
    serviceAccount   = require(SERVICE_ACCOUNT_PATH)
  } catch {
    console.error(`
❌ Service account key not found at ${SERVICE_ACCOUNT_PATH}

Get it from:
  Firebase Console → Project Settings → Service Accounts → Generate new private key
Save the downloaded JSON as: scripts/serviceAccountKey.json
    `)
    process.exit(1)
  }

  // Initialise admin SDK
  admin.default.initializeApp({
    credential: admin.default.credential.cert(serviceAccount),
  })

  const db = admin.default.firestore()

  console.log('🌱 Seeding Firestore...\n')

  // ── Seed volunteers ──────────────────────────────────────────────────────
  console.log('📋 Seeding volunteers collection...')
  let volCount = 0

  for (const vol of SEED_VOLUNTEERS) {
    const { id, ...data } = vol
    await db.collection('volunteers').doc(id).set(data, { merge: true })
    console.log(`  ✓ ${vol.name} (${id})`)
    volCount++
  }

  console.log(`\n✅ Seeded ${volCount} volunteers\n`)

  // ── Seed a sample issue ──────────────────────────────────────────────────
  console.log('📝 Seeding sample issue...')
  const sampleIssue = await db.collection('issues').add({
    title:              'Sample: Flood damage in residential block',
    description:        'This is a seed record. Replace with real issues via the dashboard.',
    location:           'Koregaon Park, Pune',
    coordinates:        { lat: 18.5362, lng: 73.8943 },
    category:           'Flood Relief',
    urgency:            'high',
    urgencyScore:       8,
    status:             'open',
    reportedBy:         'Seed Script',
    reportedAt:         admin.default.firestore.FieldValue.serverTimestamp(),
    assignedVolunteers: [],
    aiSummary:          'Seeded issue. AI classification not run.',
    tags:               ['flood', 'sample'],
    aiFallback:         true,
  })

  console.log(`  ✓ Sample issue (${sampleIssue.id})`)
  console.log('\n🎉 Firestore seeded successfully!\n')
  console.log('Next steps:')
  console.log('  1. Open your app: npm run dev')
  console.log('  2. Submit a real issue via the dashboard form')
  console.log('  3. Watch Firestore in the Firebase Console update in real time\n')

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed script failed:', err)
  process.exit(1)
})
