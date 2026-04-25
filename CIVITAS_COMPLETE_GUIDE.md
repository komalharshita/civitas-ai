# Civitas AI — Complete Testing, Deployment & AI Integration Guide

> **60 automated tests passing · Firebase Hosting ready · Gemini 1.5 Flash integrated**

---

## Table of Contents

- [Part 1 — Complete Testing Plan](#part-1--complete-testing-plan)
- [Part 2 — Deployment Guide](#part-2--deployment-guide)
- [Part 3 — AI Service Integration Guide](#part-3--ai-service-integration-guide)

---

# Part 1 — Complete Testing Plan

## 1.1 Running the Automated Test Suite

The project ships with **60 unit tests** that run in pure Node.js — no Jest, no test runner setup needed.

```bash
# From project root
node tests/matchService.test.mjs   # 26 tests — volunteer matching engine
node tests/formatters.test.mjs     # 34 tests — utility functions
```

Expected output: `🎉 All tests passed!`

---

## 1.2 Functional Testing

### IssueForm Submission

| # | Test Case | Steps | Expected Result | Pass Criteria |
|---|---|---|---|---|
| F-01 | Happy path submission | Fill all fields → click Submit | Progress bar appears → AI classifies → volunteers matched → issue saved | Firestore doc created, form closes, issue appears in list |
| F-02 | AI auto-classify | Fill title + description → click "AUTO-CLASSIFY WITH AI" | AI badge appears with category, urgency score, summary | Result applied to form dropdowns |
| F-03 | Form validation — empty title | Leave title blank → submit | Error message under title field | Submit blocked, no API call made |
| F-04 | Form validation — empty description | Leave description blank → submit | Error message under description field | Submit blocked |
| F-05 | Form validation — empty location | Leave location blank → submit | Error message under location field | Submit blocked |
| F-06 | Form validation — no category | Don't select category → submit | Error message on category field | Submit blocked |
| F-07 | Manual category override | AI classifies as X → user changes to Y → submits | Firestore stores Y (user's choice) | User override wins |
| F-08 | Progress bar during submit | Submit valid form | Progress bar shows 5 steps: 0% → 35% → 60% → 80% → 100% | Each step label changes as pipeline progresses |
| F-09 | Success state | Complete submission | Green success panel shows issueId + top 3 matched volunteers | Modal stays open showing results; closes on DONE button |

### AI Classification

| # | Test Case | Input | Expected AI Output | Pass Criteria |
|---|---|---|---|---|
| A-01 | Flood scenario | "Flooding in Lane 7, families trapped" | category: Flood Relief, urgencyScore: 8–10 | Score ≥ 8, correct category |
| A-02 | Medical scenario | "Elderly person needs insulin, pharmacy closed" | category: Medical Aid, urgencyScore: 6–8 | Correct category |
| A-03 | Food scenario | "200 people at relief camp with no food for 8h" | category: Food & Water, urgencyScore: 7–9 | Correct category, urgency HIGH+ |
| A-04 | Infrastructure | "Tree fell on Baner Road, blocking traffic" | category: Infrastructure, urgencyScore: 3–5 | No life risk → medium/low |
| A-05 | Rescue scenario | "Person missing in Panshet area since yesterday" | category: Search & Rescue, urgencyScore: 8–10 | Critical |
| A-06 | Ambiguous input | "Need help urgently" | category: Other, valid urgencyScore | Falls back gracefully |
| A-07 | API key missing | Remove VITE_GEMINI_API_KEY | Keyword-based fallback runs | App continues working, `_fallback: true` flag set |
| A-08 | API timeout | Simulate slow network | Fallback classification runs | No crash, error logged to console |

### Volunteer Matching

| # | Test Case | Input | Expected Output | Pass Criteria |
|---|---|---|---|---|
| M-01 | Exact skill match | Flood Relief issue + volunteer with Flood Relief skill | That volunteer appears in top 3 | Top match has _score ≥ 75 |
| M-02 | 3-skill match → 50 pts | Volunteer has 3 required skills | skills score = 50 | `_breakdown.skills === 50` |
| M-03 | 2-skill match → 35 pts | Volunteer has 2 required skills | skills score = 35 | `_breakdown.skills === 35` |
| M-04 | 1-skill match → 20 pts | Volunteer has 1 required skill | skills score = 20 | `_breakdown.skills === 20` |
| M-05 | Active beats busy | Same skills, one active one busy | Active volunteer ranks higher | Active volunteer is #1 |
| M-06 | Offline excluded | All volunteers offline | Empty result array | `matches.length === 0` |
| M-07 | Zone match | Volunteer same zone as issue | location score = 15 | `_breakdown.location === 15` |
| M-08 | Adjacent zone | Volunteer in adjacent zone | location score = 8 | `_breakdown.location === 8` |
| M-09 | Top N respected | 10 volunteers, topN = 3 | Only 3 returned | `matches.length === 3` |
| M-10 | No skill match | Issue category with no matching volunteers | Generic match by availability | Empty or low-score matches |

### Firestore Storage

| # | Test Case | Steps | Expected Result | How to Verify |
|---|---|---|---|---|
| DB-01 | Issue saved | Submit valid form | Document appears in `issues` collection | Firebase Console → Firestore → issues |
| DB-02 | AI fields stored | Check saved document | `category`, `urgencyScore`, `aiSummary`, `tags` all present | Check Firestore doc fields |
| DB-03 | Timestamp server-set | Check `reportedAt` field | Firestore Timestamp type (not string) | Type shows as Timestamp in Console |
| DB-04 | Status defaults to "open" | New issue submitted | `status: "open"` in document | Check Firestore |
| DB-05 | Real-time update | Submit issue in Tab A | Issue appears in Tab B without refresh | Both tabs show the issue within 1–2 seconds |
| DB-06 | Volunteer fetch | Seed script run | All 8 volunteers in collection | Firebase Console → volunteers |

### Dashboard Update

| # | Test Case | Expected Behavior |
|---|---|---|
| D-01 | New issue appears in IssueList | Optimistic update: instant; Firestore confirm: <2s |
| D-02 | MetricsBar increments | activeIssues count increases by 1 after submit |
| D-03 | Selected issue shows in MapPanel | Clicking issue card highlights map pin + shows detail drawer |
| D-04 | VolunteerPanel shows matches | Clicking an issue switches MATCHED tab to show top 3 |
| D-05 | Alert auto-generated | New high-urgency issue → orange chip appears in AlertPanel |
| D-06 | Sidebar badge updates | Issues badge (red number) increments for each new issue |

---

## 1.3 UI/UX Testing

### Layout & Responsiveness

| # | Test Case | How to Test | Pass Criteria |
|---|---|---|---|
| U-01 | Three-column layout (desktop) | Open at 1440px wide | IssueList + MapPanel + VolunteerPanel all visible |
| U-02 | Sidebar navigation | Click each nav item | Page switches without full reload |
| U-03 | Modal centering | Open IssueForm | Modal centered with blur backdrop |
| U-04 | Scrollable panels | Add 10+ issues | IssueList scrolls, header stays fixed |
| U-05 | Alert bar horizontal scroll | 5+ alerts | Alert chips scroll horizontally, not overflow |
| U-06 | Font rendering | View on Chrome/Firefox/Safari | Rajdhani + Share Tech Mono load correctly |
| U-07 | Dark theme consistency | Inspect all panels | No white backgrounds, all text readable |
| U-08 | Hover states | Hover over issue cards, buttons | Border color changes, smooth transitions |
| U-09 | Loading spinner | Submit form | Spinner appears, submit button disabled |
| U-10 | Progress bar animation | Watch form submit | Bar fills smoothly 0% → 100% |

### Analytics Page

| # | Test Case | Expected Result |
|---|---|---|
| AN-01 | CategoryPieChart renders | Navigate to Reports — doughnut chart appears |
| AN-02 | UrgencyBarChart renders | Horizontal bars for critical/high/medium/low |
| AN-03 | StatusLineChart renders | Line chart with 7 day labels |
| AN-04 | Charts update on new data | Add issue → charts re-render with new data |
| AN-05 | Stat cards show live counts | Numbers match MetricsBar totals on Dashboard |
| AN-06 | Empty state | No issues → charts show "NO DATA" gracefully |

---

## 1.4 Integration Testing

### End-to-End Flow Test

Run this manually to verify the complete integration:

```
1. Open app → Dashboard loads with real/dummy data       ✓
2. Click "+ New Issue"                                    ✓
3. Fill: "Flood in Koregaon Park" + detailed description ✓
4. Click "AUTO-CLASSIFY WITH AI"                          ✓
   → Expect: category=Flood Relief, urgency=critical      ✓
5. Click "APPLY SUGGESTION"                               ✓
6. Fill location: "Koregaon Park, Pune"                   ✓
7. Click "SUBMIT ISSUE"                                   ✓
   → Watch progress: AI... → Volunteers... → Matching... → Saving... ✓
8. Success panel shows: issueId + 3 matched volunteers    ✓
9. Click "DONE"                                           ✓
10. New issue appears #1 in IssueList                     ✓
11. Click the new issue → MapPanel shows detail           ✓
12. VolunteerPanel (MATCHED tab) shows top 3              ✓
13. AlertPanel shows new alert chip                       ✓
14. MetricsBar activeIssues increased by 1                ✓
15. Analytics page → charts updated                       ✓
16. Firebase Console → issue document created             ✓
```

---

## 1.5 Edge Case Testing

| # | Edge Case | How to Trigger | Expected Behavior | Status |
|---|---|---|---|---|
| E-01 | Empty form submit | Click submit with blank form | 4 validation errors shown | Handled ✅ |
| E-02 | Title only (no description) | Fill title, leave description empty | Validation error on description | Handled ✅ |
| E-03 | Very long title (500 chars) | Paste 500-char string as title | Form accepts; AI truncates in prompt | Handled ✅ |
| E-04 | Special characters in input | Use `<script>alert(1)</script>` | Stored as plain text (no XSS) | Handled ✅ |
| E-05 | AI API key missing | Remove `VITE_GEMINI_API_KEY` from .env | Keyword fallback activates | Handled ✅ |
| E-06 | AI API rate limit | Send 60+ requests/minute | Falls back to keyword classifier | Handled ✅ |
| E-07 | AI returns malformed JSON | Simulate bad API response | `parseAIResponse()` extracts JSON with regex fallback | Handled ✅ |
| E-08 | No volunteers in DB | Empty volunteers collection | Empty match array, no-match warning alert | Handled ✅ |
| E-09 | All volunteers busy | Set all `status: 'busy'` | Busy volunteers ranked below active | Handled ✅ |
| E-10 | All volunteers offline | Set all `status: 'offline'` | Returns [], alert shown | Handled ✅ |
| E-11 | Firestore offline | No internet / wrong config | Falls back to `dummyData.js`, error banner shown | Handled ✅ |
| E-12 | Duplicate issue submit | Click submit twice quickly | Second click ignored (button disabled during processing) | Handled ✅ |
| E-13 | Network timeout mid-submit | Throttle to 2G in DevTools | Error message in form, issue not saved | Handled ✅ |
| E-14 | Issue with no category | Manually set `category: null` | Displays "Uncategorised" tag | Handled ✅ |
| E-15 | Urgency score out of range | AI returns score 11 | `Math.min(10, Math.max(1, score))` clamps it | Handled ✅ |

---

## 1.6 Performance Testing

### Benchmarks to Check

Open Chrome DevTools → Network tab → set to "Fast 3G":

| Metric | Target | How to Measure |
|---|---|---|
| Initial page load | < 3s on Fast 3G | DevTools → Network → DOMContentLoaded |
| Firestore first data | < 1s on WiFi | Console log timestamps |
| AI classification | < 3s on WiFi (Gemini Flash) | Progress bar timer |
| Volunteer matching | < 50ms | `console.time()` around `matchVolunteers()` |
| Chart rendering | < 200ms | DevTools → Performance tab |
| Issue list re-render | < 100ms | React DevTools profiler |

### Bundle Size

```bash
npm run build
# Check dist/assets/ output:
# firebase chunk: ~342KB gzip → 85KB   ✓ acceptable
# react chunk:    ~141KB gzip → 45KB   ✓ excellent
# app chunk:      ~296KB gzip → 92KB   ✓ acceptable
# css:            ~14KB  gzip → 4KB    ✓ excellent
```

---

## 1.7 Error Handling Testing

### Testing Error States Manually

**Test Firestore error:**
```bash
# In .env, change project ID to something invalid:
VITE_FIREBASE_PROJECT_ID=invalid-project-xyz-999
npm run dev
# → Red error banner appears: "Firestore connection issue — showing cached data"
# → Dashboard loads with dummy data (graceful fallback)
```

**Test Gemini API error:**
```bash
VITE_GEMINI_API_KEY=invalid-key-xyz
# → Click "AUTO-CLASSIFY" → no crash, keyword fallback activates
# → form shows AI result with _fallback: true flag
```

**Test network failure:**
```
Chrome DevTools → Network tab → Offline
Submit a form → Form shows: "Submission failed: ..."
```

---

## 1.8 Common Bugs & Fixes

| Bug | Symptom | Root Cause | Fix |
|---|---|---|---|
| Blank dashboard on load | White screen, no data | Firebase env vars missing | Check all `VITE_FIREBASE_*` vars in `.env` |
| AI classify does nothing | No spinner, no result | `VITE_GEMINI_API_KEY` not set | Add key to `.env`, restart `npm run dev` |
| Charts not rendering | Empty chart areas | Chart.js components not registering | Import `Chart.register(...)` at top of each chart file |
| "Permission denied" Firestore | Red error in console | Firestore rules too strict | Set to test mode in Firebase Console |
| Volunteers not appearing | Empty volunteer panel | Seed script not run | Run `node --env-file=.env scripts/seedFirestore.js` |
| Sidebar badges always 0 | Badges show 0 even with issues | Hook subscriptions not mounted | Ensure `useIssues()` and `useVolunteers()` called in `App.jsx` |
| Modal doesn't close | DONE button unresponsive | `onClose` prop missing | Check `Dashboard.jsx` passes `onCloseForm` to `IssueForm` |
| Duplicate issues on submit | Same issue appears twice | Optimistic update + Firestore snapshot both adding | Filter by ID in `allIssues` merge logic in `Dashboard.jsx` |
| Timestamps show "Invalid Date" | "NaN ago" in cards | Firestore Timestamp not converted | Call `.toDate().toISOString()` on all Firestore timestamps |
| Match scores all 0 | VolunteerPanel shows all 0pts | Skill strings case mismatch | `matchService.js` does `.toLowerCase()` comparison — check skill spelling in DB |

---

# Part 2 — Deployment Guide

## Step 1 — Local Setup

### Prerequisites

| Tool | Minimum Version | Check | Install |
|---|---|---|---|
| Node.js | 18.x | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | 9.x | `npm --version` | Bundled with Node |
| Git | Any | `git --version` | [git-scm.com](https://git-scm.com) |

### Clone and Install

```bash
# 1. Clone the project (or extract the .tar.gz)
git clone https://github.com/your-username/civitas-ai.git
cd civitas-ai

# 2. Install all dependencies (~237MB with node_modules)
npm install

# 3. Verify installation
npm run build
# → Should complete with "✓ built in Xs" and zero errors
```

---

## Step 2 — Environment Variables

### Create the .env file

```bash
# Copy the template
cp .env.example .env

# Open in your editor
code .env         # VS Code
nano .env         # terminal
notepad .env      # Windows
```

### Fill in all variables

```bash
# ── Firebase Config ──────────────────────────────────────────
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# ── Gemini AI API Key ─────────────────────────────────────────
VITE_GEMINI_API_KEY=AIzaSy...
```

> ⚠️ **IMPORTANT:** All keys must start with `VITE_` — Vite only exposes variables with this prefix to the browser. Never commit `.env` to git.

### Variable Explanation

| Variable | What it is | Where to find it |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Identifies your Firebase project to Google's servers | Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain for Firebase authentication | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | Your project's unique ID | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage URL (for file uploads) | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | For Firebase Cloud Messaging | Firebase Console |
| `VITE_FIREBASE_APP_ID` | Unique ID for your web app registration | Firebase Console |
| `VITE_GEMINI_API_KEY` | Authenticates requests to Gemini API | Google AI Studio |

---

## Step 3 — Firebase Setup

### 3.1 Create a Firebase Project

```
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name: civitas-ai
4. Disable Google Analytics (not needed for hackathon)
5. Click "Create project"
6. Wait ~30 seconds for creation
```

### 3.2 Register a Web App

```
1. In project overview, click the </> (web) icon
2. App nickname: civitas-ai-web
3. Check "Also set up Firebase Hosting"
4. Click "Register app"
5. COPY the firebaseConfig object — you need these values for .env
```

The config looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // → VITE_FIREBASE_API_KEY
  authDomain: "project.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",    // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "project.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",  // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc"           // → VITE_FIREBASE_APP_ID
}
```

### 3.3 Enable Firestore

```
1. Firebase Console → left sidebar → Build → Firestore Database
2. Click "Create database"
3. Select "Start in test mode" (for hackathon)
4. Choose region: asia-south1 (Mumbai) for India, us-central1 for US
5. Click "Enable"
```

### 3.4 Set Firestore Security Rules

For hackathon (allows all reads/writes):
```
Firebase Console → Firestore → Rules tab → paste:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

→ Click "Publish"
```

### 3.5 Seed Volunteer Data

```bash
# Install Firebase Admin SDK
npm install firebase-admin --save-dev

# Download service account key:
# Firebase Console → Project Settings → Service accounts tab
# → "Generate new private key" → download JSON
# → Save as: scripts/serviceAccountKey.json

# Run seed script
node --env-file=.env scripts/seedFirestore.js

# Expected output:
# 🌱 Seeding Firestore...
# 📋 Seeding volunteers collection...
#   ✓ Arjun Mehta (VOL-001)
#   ✓ Sneha Kapoor (VOL-002)
#   ... (8 volunteers)
# ✅ Seeded 8 volunteers
```

Verify in Firebase Console: Firestore → Data → `volunteers` collection should have 8 documents.

---

## Step 4 — Gemini API Setup

### 4.1 Get an API Key (2 minutes)

```
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API key"
4. Select "Create API key in new project" (or choose existing)
5. Copy the key (starts with AIzaSy...)
6. Paste into .env as VITE_GEMINI_API_KEY
```

> ✅ This is the simplest method — no Google Cloud billing required for development usage. Free tier: 15 requests/minute, 1M tokens/day.

### 4.2 Test the API Manually

Before running the app, test your key works:

```bash
# Replace YOUR_KEY with your actual key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Say hello in JSON: {\"message\": \"...\"}"}]}]
  }'

# Expected: HTTP 200 with JSON containing a "candidates" array
# If you see 400 or 403: key is invalid or not yet activated
```

### 4.3 Vertex AI Alternative (Production)

If you need Vertex AI proper (GCP service accounts):

```
1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable Vertex AI API: APIs & Services → Enable APIs → search "Vertex AI"
4. Create service account: IAM & Admin → Service Accounts → Create
5. Grant role: "Vertex AI User"
6. Create JSON key → download
7. Use in backend only (never expose in frontend)
```

> ⚠️ For the hackathon, stick with the Gemini API key. Vertex AI via service account requires backend proxying (not needed for demo).

---

## Step 5 — Run Locally

```bash
npm run dev
# → Vite dev server starts at http://localhost:5173
# → Hot reload enabled (changes reflect instantly)
# → Open http://localhost:5173 in your browser
```

**Verify checklist:**
- [ ] Dashboard loads without white screen
- [ ] Sidebar shows all navigation items
- [ ] Click "+ New Issue" → modal opens
- [ ] "AUTO-CLASSIFY WITH AI" button works
- [ ] Submit a test issue → success panel appears
- [ ] Firebase Console → new document in `issues` collection

---

## Step 6 — Deploy to Firebase Hosting

### 6.1 Install Firebase CLI

```bash
npm install -g firebase-tools

# Verify
firebase --version
# → 13.x.x
```

### 6.2 Login

```bash
firebase login
# → Opens browser for Google sign-in
# → Select the same account used for Firebase Console
```

### 6.3 Update .firebaserc

```bash
# Open .firebaserc in editor and replace the project ID:
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 6.4 Build the React App

```bash
npm run build

# Output in dist/ folder:
# dist/index.html
# dist/assets/   (JS + CSS bundles)
```

### 6.5 Deploy

```bash
firebase deploy --only hosting

# Expected output:
# === Deploying to 'your-project-id'...
# i  hosting: beginning deploy...
# ✔  hosting[your-project-id]: file upload complete
# ✔  Deploy complete!
#
# Project Console: https://console.firebase.google.com/project/your-project-id
# Hosting URL: https://your-project-id.web.app
```

### 6.6 Access Your Live App

```
https://your-project-id.web.app
https://your-project-id.firebaseapp.com   (alternative URL)
```

Both URLs work. Share the `web.app` URL for your hackathon demo.

### 6.7 Subsequent Deployments

```bash
# After making changes:
npm run build && firebase deploy --only hosting
```

---

## Step 7 — Alternative: Deploy to Netlify (from GitHub)

### 7.1 Push to GitHub

```bash
git init
git add .
git commit -m "feat: complete civitas-ai application"
git branch -M main
git remote add origin https://github.com/your-username/civitas-ai.git
git push -u origin main
```

### 7.2 Connect Netlify

```
1. Go to https://app.netlify.com
2. "Add new site" → "Import an existing project"
3. Connect to GitHub → select civitas-ai repo
4. Build settings:
   - Build command:  npm run build
   - Publish directory: dist
5. Click "Deploy site"
```

### 7.3 Add Environment Variables in Netlify

```
Netlify Dashboard → Site → Site configuration → Environment variables
→ Add all VITE_* variables from your .env file
→ Click "Save"
→ Trigger redeploy: Deploys → "Trigger deploy" → "Deploy site"
```

> ⚠️ **Important:** Without env vars, the deployed Netlify app won't connect to Firebase or Gemini. Add them before the demo.

---

# Part 3 — AI Service Integration Guide

## 3.1 How Vertex AI / Gemini Works in This Project

The AI integration is in `src/services/aiService.js`. Here's the complete architecture:

```
IssueForm
    │  (title, description, location)
    ▼
classifyIssueWithFallback()      ← entry point, never throws
    │
    ├─ classifyIssue()            ← real API path
    │       │
    │       ├─ buildClassificationPrompt()   ← formats the prompt
    │       ├─ callGeminiAPI()               ← HTTP POST to Google
    │       ├─ parseAIResponse()             ← extracts JSON from response
    │       └─ normaliseAIResult()           ← validates + clamps output
    │
    └─ keyword fallback           ← activates if API call fails
           │
           └─ Returns { category, urgencyScore, urgency, summary, _fallback: true }
```

**The model used:** `gemini-1.5-flash`
- Fastest Gemini model (~500ms response time)
- 1M token context window
- Free tier: 15 RPM, 1M tokens/day
- Returns structured JSON reliably when prompted correctly

---

## 3.2 How the Prompt is Structured

The prompt uses three techniques that guarantee reliable JSON output:

### Technique 1 — Role + Context

```
You are an AI dispatch coordinator for "Civitas AI", an emergency volunteer management system.
Your job is to analyze a reported issue and return a structured classification in STRICT JSON.
```

Giving the model a specific role reduces hallucinations.

### Technique 2 — Constrained output (closed-set categories)

```
VALID CATEGORIES (pick exactly one):
- Flood Relief
- Medical Aid
- Food & Water
- Infrastructure
- Search & Rescue
- Animal Welfare
- Shelter
- Communication
- Other
```

Listing valid options prevents the model from inventing new categories.

### Technique 3 — Few-shot examples (most important)

```
EXAMPLES:

Issue: "Flooding in residential block, families trapped on rooftops"
Response: {"category":"Flood Relief","urgencyScore":9,"urgency":"critical",...}

Issue: "Elderly person needs blood pressure medication, pharmacy closed"
Response: {"category":"Medical Aid","urgencyScore":6,"urgency":"medium",...}
```

Two worked examples teach the model the exact format expected. This is why the output is reliably parseable.

### Complete prompt structure

```javascript
function buildClassificationPrompt(title, description, location) {
  return `
[ROLE DEFINITION]
[VALID CATEGORIES LIST]
[URGENCY SCORE GUIDE]
[RESPONSE FORMAT — strict JSON schema]
[FEW-SHOT EXAMPLES]
---
NOW CLASSIFY THIS ISSUE:
Title:       ${title}
Description: ${description}
Location:    ${location}

Return ONLY the JSON object:
`.trim()
}
```

---

## 3.3 How the API Request is Sent

```javascript
// src/services/aiService.js — callGeminiAPI()

const url     = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`
const payload = {
  contents: [
    { parts: [{ text: prompt }] }
  ],
  generationConfig: {
    temperature:     0.1,   // LOW temp = deterministic output (critical for JSON)
    maxOutputTokens: 300,   // JSON response is small — cap tokens to save quota
    topP:            0.8,
    topK:            10,
  },
  safetySettings: [
    // Relax safety filters so emergency/disaster content isn't blocked
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
  ],
}

const response = await fetch(url, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify(payload),
})
```

**Key parameter: `temperature: 0.1`**
This is the most important setting. Temperature controls randomness:
- `1.0` = creative, varied responses (good for writing)
- `0.1` = deterministic, consistent responses (essential for JSON)

---

## 3.4 How the Response is Parsed

```javascript
// Raw Gemini response structure:
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\"category\":\"Flood Relief\",\"urgencyScore\":9,...}"
      }]
    }
  }]
}

// Step 1: Extract text
const text = data.candidates[0].content.parts[0].text

// Step 2: Strip markdown fences (Gemini sometimes wraps in ```json```)
let cleaned = text.trim()
cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

// Step 3: Parse JSON
const parsed = JSON.parse(cleaned)
// If fails → regex fallback: extract { ... } from text

// Step 4: Validate + clamp all fields
const result = {
  category:     VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'Other',
  urgencyScore: Math.min(10, Math.max(1, Math.round(Number(parsed.urgencyScore)))),
  urgency:      SCORE_TO_LABEL[urgencyScore] ?? 'medium',  // derive from score, don't trust AI's label
  summary:      String(parsed.summary).slice(0, 500),
  tags:         Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
}
```

> Note: `urgency` is **derived from `urgencyScore`** using a lookup table, not trusted from the AI's text output. This prevents the AI from saying "critical" but giving a score of 3.

---

## 3.5 Common Errors and Fixes

| Error | Console Message | Cause | Fix |
|---|---|---|---|
| 400 Bad Request | `Gemini API error 400` | Malformed request or empty prompt | Check `buildClassificationPrompt()` returns non-empty string |
| 403 Forbidden | `Gemini API error 403` | API key invalid or not activated | Verify key at aistudio.google.com → My API Keys |
| 429 Too Many Requests | `Gemini API error 429` | Rate limit exceeded (15 RPM free tier) | Add delay between requests; upgrade to paid tier |
| JSON parse error | `Could not parse AI response` | Model returned plain text instead of JSON | Improve prompt; add `"Return ONLY the JSON"` line |
| Empty response | `Gemini returned an empty response` | Content blocked by safety filters | Check `safetySettings` — relax thresholds for emergency content |
| Network timeout | `TypeError: Failed to fetch` | Internet down or request too slow | Fallback activates automatically |
| `_fallback: true` in result | Not an error — expected | API unavailable, keyword fallback ran | Add your real API key; works fine for demo |

### Debugging AI Responses

Add this to `callGeminiAPI()` during development:

```javascript
const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
console.log('[AI RAW RESPONSE]', text)  // ← add this line
```

This shows exactly what Gemini returned before parsing.

---

## 3.6 How to Modify AI Behavior

### Change categories

```javascript
// src/services/aiService.js — VALID_CATEGORIES array

const VALID_CATEGORIES = [
  'Flood Relief',
  'Medical Aid',
  'Food & Water',
  'Infrastructure',
  'Search & Rescue',
  'Animal Welfare',
  'Shelter',
  'Communication',
  'Other',
  'Education',      // ← add new category
  'Mental Health',  // ← add new category
]
```

Then update `src/services/matchService.js → CATEGORY_SKILL_MAP` to add the new categories' required skills, and `src/utils/formatters.js → CATEGORY_COLOR` for chart colours.

### Change urgency thresholds

```javascript
// src/services/aiService.js — in prompt text

URGENCY SCORE GUIDE (integer 1–10):
- 9–10: CRITICAL  — immediate life risk, mass displacement
- 7–8:  HIGH      — serious harm within hours
- 5–6:  MEDIUM    — important but stable
- 1–4:  LOW       — minor issue, no danger
```

Edit these descriptions to shift how urgently the AI grades issues. For example, to make it more conservative, change the CRITICAL description to require more severe conditions.

### Add output fields

```javascript
// In buildClassificationPrompt() — RESPONSE FORMAT section:

RESPONSE FORMAT — return ONLY this JSON:
{
  "category":         "<category>",
  "urgencyScore":     <1-10>,
  "urgency":          "<critical|high|medium|low>",
  "summary":          "<1–2 sentence dispatch summary>",
  "tags":             ["keyword1", "keyword2"],
  "estimatedPeople":  <number of people affected, or 0 if unknown>,  // ← new field
  "resourcesNeeded":  ["water pump", "medical kit"]                   // ← new field
}
```

Then update `normaliseAIResult()` to validate the new fields and `addIssue()` in `firebase.js` to store them.

### Use a different model

```javascript
// src/services/aiService.js

const GEMINI_MODEL = 'gemini-1.5-flash'   // fast, free tier
// const GEMINI_MODEL = 'gemini-1.5-pro'  // smarter, more expensive
// const GEMINI_MODEL = 'gemini-2.0-flash-exp'  // latest experimental
```

Switch to `gemini-1.5-pro` for harder classification tasks. Note: lower rate limits on free tier.

### Add language support

```javascript
// At the top of buildClassificationPrompt():

function buildClassificationPrompt(title, description, location, language = 'English') {
  return `
You are an AI dispatch coordinator for "Civitas AI".
Respond ONLY in JSON — the summary field should be in ${language}.
...
`
}

// Call with:
classifyIssue(title, description, location, 'Hindi')
classifyIssue(title, description, location, 'Marathi')
```

---

## Quick Reference Card

```
LOCAL DEV:        npm run dev          → http://localhost:5173
TESTS:            node tests/matchService.test.mjs
                  node tests/formatters.test.mjs
BUILD:            npm run build        → dist/ folder
DEPLOY:           firebase deploy --only hosting
SEED DB:          node --env-file=.env scripts/seedFirestore.js

AI API:           https://aistudio.google.com/app/apikey
FIREBASE CONSOLE: https://console.firebase.google.com
LIVE APP:         https://your-project-id.web.app

TOTAL TESTS:      60 (26 matching + 34 formatters) — all passing
```

