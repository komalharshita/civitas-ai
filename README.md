# ⚡ Civitas AI — Volunteer Dispatch System

An AI-powered community issue dispatch platform built with React, Firebase, and Google Gemini.

---

## 🚀 Quick Start (5 minutes)

### 1. Clone and install
```bash
git clone <your-repo>
cd civitas-ai
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

| Variable | Where to get it |
|---|---|
| `VITE_FIREBASE_API_KEY` | [Firebase Console](https://console.firebase.google.com) → Project Settings → Your Apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same as above |
| `VITE_FIREBASE_PROJECT_ID` | Same as above |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same as above |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
| `VITE_FIREBASE_APP_ID` | Same as above |
| `VITE_GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) → Create API key |

### 3. Enable Firestore
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Build** → **Firestore Database**
3. Click **Create database** → choose **Start in test mode**
4. Select a region close to you (e.g., `asia-south1` for India)

### 4. Seed volunteer data (first time only)
```bash
npm install firebase-admin --save-dev

# Download service account JSON from:
# Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save it as: scripts/serviceAccountKey.json

node --env-file=.env scripts/seedFirestore.js
```

### 5. Run locally
```bash
npm run dev
# → http://localhost:5173
```

---

## 🗂 Project Structure

```
civitas-ai/
├── .env.example               ← copy to .env, fill in keys
├── firebase.json              ← Firebase Hosting config
├── vite.config.js
├── tailwind.config.js
│
├── scripts/
│   └── seedFirestore.js       ← one-time volunteer seed script
│
└── src/
    ├── main.jsx               ← React entry point
    ├── App.jsx                ← root shell + routing
    ├── index.css              ← global CSS variables + utility classes
    │
    ├── data/
    │   └── dummyData.js       ← local fallback data (used when Firestore offline)
    │
    ├── utils/
    │   ├── formatters.js      ← timeAgo, groupBy*, URGENCY_COLOR, CATEGORY_COLOR
    │   └── constants.js       ← STATUS, URGENCY, COLLECTION names
    │
    ├── services/
    │   ├── firebase.js        ← Firebase init + all Firestore CRUD + real-time listeners
    │   ├── aiService.js       ← Gemini API classification (category + urgency + summary)
    │   ├── matchService.js    ← volunteer scoring/matching engine (pure JS)
    │   └── issueService.js    ← orchestration: AI → match → Firestore → return result
    │
    ├── hooks/
    │   ├── useIssues.js            ← real-time Firestore issues subscription
    │   ├── useVolunteers.js        ← real-time Firestore volunteers subscription
    │   ├── useMatchedVolunteers.js ← reactive matching when selected issue changes
    │   └── useAlerts.js            ← unified alert feed (derived + Firestore)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx    ← navigation with live badge counts
    │   │   └── Header.jsx     ← live clock, search, alert bell, new issue button
    │   │
    │   ├── dashboard/
    │   │   ├── MetricsBar.jsx     ← 6 live KPI cards
    │   │   ├── IssueList.jsx      ← filterable, searchable issue list
    │   │   ├── IssueCard.jsx      ← urgency border, AI summary, meta row
    │   │   ├── MapPanel.jsx       ← visual map with pins + issue detail drawer
    │   │   ├── VolunteerPanel.jsx ← MATCHED tab + ROSTER tab
    │   │   ├── VolunteerCard.jsx  ← skills, status, mission badge
    │   │   └── AlertPanel.jsx     ← horizontal scrolling alert chips
    │   │
    │   ├── charts/
    │   │   ├── CategoryPieChart.jsx    ← Chart.js doughnut by category
    │   │   ├── UrgencyBarChart.jsx     ← Chart.js horizontal bar by urgency
    │   │   ├── StatusLineChart.jsx     ← Chart.js line: opened vs resolved
    │   │   └── VolunteerDonutChart.jsx ← Chart.js donut: volunteer availability
    │   │
    │   └── modals/
    │       └── IssueForm.jsx  ← full form with AI auto-classify + progress bar
    │
    └── pages/
        ├── Dashboard.jsx      ← master orchestrator (all hooks + state)
        ├── Analytics.jsx      ← Chart.js analytics page
        └── PlaceholderPage.jsx
```

---

## 🔄 Data Flow

```
User submits IssueForm
     │
     ├─ 1. classifyIssueWithFallback()  ──► Gemini API
     │       returns: { category, urgencyScore, urgency, summary, tags }
     │
     ├─ 2. fetchVolunteers()  ──────────► Firestore
     │       returns: all volunteer documents
     │
     ├─ 3. matchVolunteers()  ──────────► Pure JS scoring engine
     │       scoring: skills(50) + availability(25) + location(15) + experience(10)
     │       returns: top 3 volunteers with _score, _matchReason
     │
     ├─ 4. addIssue()  ─────────────────► Firestore
     │       saves: enriched issue document with AI + match data
     │
     ├─ 5. addAlert()  ─────────────────► Firestore
     │       logs: system alert for the new issue
     │
     └─ 6. Dashboard updates instantly (optimistic + Firestore onSnapshot)
```

---

## 🛠 Services Reference

### `aiService.js`
```js
import { classifyIssueWithFallback } from './services/aiService'

const result = await classifyIssueWithFallback(title, description, location)
// → { category, urgencyScore, urgency, summary, tags, _fallback? }
```

### `matchService.js`
```js
import { matchVolunteers, getMatchSummary } from './services/matchService'

const matches = matchVolunteers(issue, volunteers, { topN: 3 })
// → volunteers with _score, _breakdown, _matchedSkills, _matchReason

const summary = getMatchSummary(issue, matches)
// → "DISPATCH READY: 3 volunteers matched for Flood Relief…"
```

### `firebase.js`
```js
import { addIssue, fetchIssues, subscribeToIssues, fetchVolunteers } from './services/firebase'

// One-time fetch
const issues = await fetchIssues()

// Real-time subscription
const unsub = subscribeToIssues(setIssues, console.error)
return () => unsub()  // cleanup
```

### `issueService.js` (orchestration)
```js
import { submitIssue } from './services/issueService'

const result = await submitIssue(formData, {
  topN:       3,
  autoAssign: false,
  onProgress: ({ step, progress }) => updateUI(step, progress),
})
// → { issueId, aiResult, matchedVolunteers, matchSummary, recommendedAction }
```

---

## 📊 Analytics Page

Navigate to **Reports & Charts** in the sidebar to see:
- **Issue Trend** — opened vs resolved over 7 days (line chart)
- **Issues by Category** — doughnut breakdown
- **Urgency Distribution** — horizontal bar chart
- **Volunteer Status** — availability donut
- **Category Breakdown** — bar progress table
- **4 KPI stat rows** — totals, resolution rate, avg urgency, top category

---

## 🚀 Deploy to Firebase Hosting

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Set your project ID in .firebaserc
# (replace "your-firebase-project-id")

# 4. Build
npm run build

# 5. Deploy
firebase deploy --only hosting

# → Your app is live at https://your-project-id.web.app
```

---

## 🔒 Firestore Security Rules (before launch)

Replace test mode rules in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for issues and volunteers (adjust for auth later)
    match /issues/{id} {
      allow read: if true;
      allow write: if true;  // tighten with auth before production
    }
    match /volunteers/{id} {
      allow read: if true;
      allow write: if false;  // only seed script can write
    }
    match /alerts/{id} {
      allow read, write: if true;
    }
  }
}
```

---

## 🧪 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (dark theme) |
| Database | Firebase Firestore (real-time) |
| AI | Google Gemini 1.5 Flash (via REST API) |
| Charts | Chart.js 4 + react-chartjs-2 |
| Hosting | Firebase Hosting |
| Fonts | Rajdhani (display) · Share Tech Mono · DM Sans |

---

## 🤝 Hackathon Tips

1. **No Gemini key?** — The app falls back to keyword-based classification automatically. Works without AI.
2. **No Firestore?** — The app falls back to `dummyData.js` automatically. Works without internet.
3. **Fast demo flow** — Submit an issue → watch AI classify → see matched volunteers → open Analytics tab.
4. **Live badge counts** — Sidebar badges update in real-time from Firestore as issues are added.

---

Built for hackathons. Powered by ⚡ Civitas AI.
