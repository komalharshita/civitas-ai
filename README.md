<div align="center">

# ⚡ Civitas AI

### *Community crises don't wait — your dispatch system shouldn't either.*

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini_1.5_Flash-4285F4?style=flat-square&logo=google)](https://aistudio.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.3-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat-square&logo=chart.js)](https://www.chartjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[🚀 Live Demo](#demo) · [📖 Docs](#installation) · [🐛 Report Bug](../../issues) · [✨ Request Feature](../../issues)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [System Workflow](#-system-workflow)
- [Screenshots](#-screenshots)
- [Demo](#-demo)
- [Installation](#️-installation)
- [Environment Variables](#-environment-variables)
- [Firebase Setup](#-firebase-setup)
- [Vertex AI Setup](#-vertex-ai-setup)
- [Deployment](#-deployment)
- [Folder Structure](#-folder-structure)
- [Testing](#-testing)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌐 About the Project

**Civitas AI** is an AI-powered volunteer dispatch system designed for NGOs, disaster response teams, and community organizations. It transforms the chaotic, manual process of coordinating volunteers during a crisis into a fast, intelligent, automated workflow — all from a single command-center-style dashboard.

When a community issue is reported — a flood, a medical emergency, a food shortage — Civitas AI instantly classifies it using Google's Gemini AI, assigns an urgency score, matches the top 3 best-suited volunteers from the roster, and updates the dashboard in real time. What used to take phone calls and spreadsheets now takes seconds.

Built for the modern NGO operator. Inspired by emergency dispatch systems. Optimized for hackathons and real-world impact.

---

## 🔴 Problem Statement

When disasters strike or community crises unfold, volunteer coordinators face three compounding problems:

1. **Information overload** — dozens of issues reported simultaneously with no clear priority ranking
2. **Manual matching** — coordinators spend precious time manually searching for available volunteers with the right skills
3. **Communication lag** — no central system means issues fall through the cracks, and critical moments are lost

Traditional solutions (WhatsApp groups, Excel sheets, email chains) are slow, error-prone, and impossible to scale during a surge. The result: volunteers are mismatched, high-urgency cases are delayed, and people who need help don't get it in time.

---

## 💡 Solution

Civitas AI solves this with a three-part intelligence layer:

| Layer | Technology | What it does |
|---|---|---|
| **Classification** | Google Gemini 1.5 Flash | Reads issue text → assigns category + urgency score 1–10 |
| **Matching** | Custom scoring engine | Ranks every volunteer by skill fit + availability + proximity |
| **Dispatch** | Firebase Firestore | Stores everything in real time, updates all connected dashboards instantly |

The coordinator only needs to verify and approve — the AI does the cognitive heavy lifting.

---

## ✨ Key Features

- 🤖 **AI-powered issue classification** — Gemini 1.5 Flash categorizes issues and assigns urgency scores in under 3 seconds
- 🎯 **Smart volunteer matching** — weighted scoring across skills (50pts), availability (25pts), location (15pts), and experience (10pts)
- 🗺️ **Visual dispatch map** — pin-coded issue map with urgency colour coding and detail drawers
- 📊 **Live analytics dashboard** — Chart.js visualisations for issue trends, urgency distribution, and volunteer availability
- 🔔 **Auto-generated alerts** — system flags unassigned critical issues, escalations, and resource shortages automatically
- ⚡ **Real-time updates** — Firebase Firestore `onSnapshot` keeps all panels live without page refresh
- 📱 **Fallback-first architecture** — works offline with dummy data; degrades gracefully when AI or DB is unavailable
- 🏗️ **Modular service layer** — clean separation of AI, database, and matching logic for easy extension
- 🎨 **Command-center UI** — dark dispatch theme with monospace fonts, scanline effects, and pulsing status indicators
- 🛡️ **Input validation + error handling** — every failure path (API down, bad JSON, network timeout) is caught and handled

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| [React](https://react.dev/) | 18.2 | UI framework |
| [Vite](https://vitejs.dev/) | 5.0 | Build tool + dev server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.3 | Utility-first styling |
| [Lucide React](https://lucide.dev/) | 0.383 | Icon system |
| [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/) | 4.4 / 5.2 | Analytics charts |

### Backend & AI
| Technology | Version | Role |
|---|---|---|
| [Firebase Firestore](https://firebase.google.com/docs/firestore) | 12.x | Real-time NoSQL database |
| [Firebase Hosting](https://firebase.google.com/docs/hosting) | — | Production deployment |
| [Google Gemini 1.5 Flash](https://aistudio.google.com/) | REST API | Issue classification + urgency scoring |

### Fonts
- **Rajdhani** — display headings and labels
- **Share Tech Mono** — monospace data, IDs, codes
- **DM Sans** — body text and descriptions

---

## 🔄 System Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CIVITAS AI FLOW                          │
└─────────────────────────────────────────────────────────────────┘

  1. REPORT          User submits issue via IssueForm
                     (title + description + location)
         │
         ▼
  2. AI CLASSIFY     Gemini 1.5 Flash reads the text
                     → assigns: category, urgency score (1-10),
                                urgency label, AI summary, tags
         │
         ▼
  3. FETCH ROSTER    All volunteers loaded from Firestore
                     (8+ responders with skills, zones, status)
         │
         ▼
  4. MATCH           Scoring engine runs on every volunteer:
                     Skills match    → up to 50 pts
                     Availability    → up to 25 pts
                     Location/zone   → up to 15 pts
                     Rating + exp    → up to 10 pts
                     → Top 3 volunteers selected
         │
         ▼
  5. SAVE            Enriched issue document written to Firestore
                     System alert logged to alerts collection
         │
         ▼
  6. DASHBOARD       All connected clients update via onSnapshot:
                     IssueList ← new issue at top
                     MapPanel  ← new pin on map
                     VolunteerPanel ← matched tab shows top 3
                     AlertPanel ← new alert chip
                     MetricsBar ← counts increment
                     Analytics  ← charts update
```

---

## 📸 Screenshots

> *Screenshots will be added after the first deployed version. See [Demo](#-demo) for the live link.*

```
┌── Dashboard Overview ─────────────────────────────────────────┐
│  [Sidebar Nav] │ [KPI Metrics Bar (6 cards)]                   │
│                │ ─────────────────────────────────────────────│
│  CIVITAS       │ [Issue List] │ [Dispatch Map] │ [Volunteer]  │
│  AI DISPATCH   │              │   (pin map)    │  (matched)   │
│                │ [Alert Bar ──────────────────────────────── ] │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎬 Demo

> 🔗 **Live Demo:** [https://civitas-ai.web.app](https://civitas-ai.web.app) *(link active after deployment)*

**Quick Demo Flow (2 minutes)**

1. Open the app → dispatch dashboard loads
2. Click **"+ New Issue"** in the header
3. Type: *"Severe flooding in residential area, 30 families displaced"*
4. Click **"AUTO-CLASSIFY WITH AI"** → watch Gemini respond
5. Click **"SUBMIT ISSUE"** → watch the full pipeline run
6. See the issue on the map + matched volunteers on the right panel
7. Navigate to **Reports & Charts** → live analytics

---

## ⚙️ Installation

### Prerequisites

| Requirement | Minimum Version |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| Git | Any |

### Clone and run in 5 steps

```bash
# 1. Clone
git clone https://github.com/your-username/civitas-ai.git
cd civitas-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# → Fill in your Firebase and Gemini keys (see below)

# 4. Seed volunteer data (first time only)
npm install firebase-admin --save-dev
# Download service account key from Firebase Console
# Save as scripts/serviceAccountKey.json
node --env-file=.env scripts/seedFirestore.js

# 5. Start dev server
npm run dev
# → Open http://localhost:5173
```

---

## 🔐 Environment Variables

Create `.env` from the template:

```bash
cp .env.example .env
```

| Variable | Description | Where to get it |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase project API key | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Firebase Console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console → Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage URL | Firebase Console → Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | Firebase Console → Project Settings |
| `VITE_FIREBASE_APP_ID` | Web app registration ID | Firebase Console → Project Settings |
| `VITE_GEMINI_API_KEY` | Gemini AI API key | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

> ⚠️ All variables must start with `VITE_`. Never commit your `.env` file.

---

## 🔥 Firebase Setup

```
1. Go to console.firebase.google.com
2. Create project → "civitas-ai"
3. Add web app → copy firebaseConfig values to .env
4. Build → Firestore Database → Create database → test mode
5. Choose region (asia-south1 for India)
6. Paste into Firestore Rules:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} { allow read, write: if true; }
     }
   }
7. Run seed script to add volunteers
```

---

## 🤖 Vertex AI Setup

**Easiest path (no billing required):**

```
1. Go to aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API key"
4. Copy key → paste as VITE_GEMINI_API_KEY in .env
```

**Free tier:** 15 requests/minute · 1M tokens/day

Test your key:
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Reply: {\"status\":\"ok\"}"}]}]}'
# Expect: HTTP 200
```

---

## 🚀 Deployment

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
# Update .firebaserc with your project ID

npm run build
firebase deploy --only hosting
# → https://your-project-id.web.app
```

### Netlify (Alternative)

1. Push to GitHub
2. [app.netlify.com](https://app.netlify.com) → Import from GitHub
3. Build: `npm run build` · Publish: `dist`
4. Add all `VITE_*` env vars in Site Settings
5. Redeploy

---

## 📁 Folder Structure

```
civitas-ai/
├── .env.example
├── firebase.json                   # Hosting config (SPA rewrites)
├── scripts/
│   └── seedFirestore.js            # Volunteer seed script
├── tests/
│   ├── matchService.test.mjs       # 26 unit tests
│   └── formatters.test.mjs         # 34 unit tests
└── src/
    ├── App.jsx                     # Root shell + routing
    ├── index.css                   # CSS variables + global styles
    ├── data/
    │   └── dummyData.js            # Offline fallback data
    ├── utils/
    │   ├── formatters.js           # Shared formatting utilities
    │   └── constants.js            # App-wide constants
    ├── services/
    │   ├── firebase.js             # Firestore CRUD + real-time
    │   ├── aiService.js            # Gemini API integration
    │   ├── matchService.js         # Volunteer scoring engine
    │   └── issueService.js         # Orchestration pipeline
    ├── hooks/
    │   ├── useIssues.js            # Live issues subscription
    │   ├── useVolunteers.js        # Live volunteers subscription
    │   ├── useMatchedVolunteers.js # Reactive matching hook
    │   └── useAlerts.js            # Unified alert feed
    ├── components/
    │   ├── layout/                 # Sidebar, Header
    │   ├── dashboard/              # All dashboard panels
    │   ├── charts/                 # Chart.js components
    │   └── modals/                 # IssueForm modal
    └── pages/
        ├── Dashboard.jsx           # Main dashboard page
        ├── Analytics.jsx           # Charts + stats page
        └── PlaceholderPage.jsx
```

---

## 🧪 Testing

60 automated unit tests, zero dependencies:

```bash
node tests/matchService.test.mjs   # 26 tests — matching engine
node tests/formatters.test.mjs     # 34 tests — utility functions
```

Both exit with `🎉 All tests passed!`

---

## 🔭 Future Improvements

| Feature | Priority |
|---|---|
| Firebase Authentication (role-based access) | 🔴 High |
| Real geocoding (Google Maps API) | 🔴 High |
| Push notifications (Firebase Cloud Messaging) | 🔴 High |
| Volunteer mobile app (React Native) | 🔴 High |
| Google Maps integration (Leaflet) | 🟡 Medium |
| One-click dispatch + volunteer confirmation | 🟡 Medium |
| WhatsApp/SMS integration (Twilio) | 🟡 Medium |
| Multilingual support (Hindi, Marathi) | 🟡 Medium |
| Offline PWA mode | 🟢 Low |
| Analytics export (PDF/Excel) | 🟢 Low |

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

```bash
git checkout -b feat/your-feature
# make changes
git commit -m "feat: add your feature"
git push origin feat/your-feature
# open a Pull Request
```

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

<div align="center">

**Komal** · *The Gilded Girl*

[![GitHub](https://img.shields.io/badge/GitHub-The_Gilded_Girl-181717?style=flat-square&logo=github)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/your-profile)

*Built with ❤️ for communities that can't afford slow response times.*

---

⭐ **Star this repo** if Civitas AI helped or inspired you!

</div>
