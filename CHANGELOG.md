# Changelog

All notable changes to **Civitas AI** are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Firebase Authentication with role-based access control
- Google Maps / Leaflet integration for real dispatch map
- Firebase Cloud Messaging push notifications
- WhatsApp / SMS volunteer notification via Twilio
- Multilingual support (Hindi, Marathi)
- React Native volunteer mobile app
- Analytics export to PDF / Excel

---

## [1.0.0] — 2025-07-14

### 🎉 Initial Release — Hackathon Edition

This is the first complete, deployable version of Civitas AI.

### Added

#### Core Application
- React 18 + Vite 5 project setup with Tailwind CSS dark theme
- Firebase Firestore integration with real-time `onSnapshot` listeners
- Google Gemini 1.5 Flash AI integration via REST API
- Firebase Hosting deployment configuration
- Complete `.env.example` with all required variable descriptions

#### AI Service (`src/services/aiService.js`)
- `classifyIssue()` — sends issue text to Gemini API, returns structured JSON
- `classifyIssueWithFallback()` — graceful degradation with keyword-based fallback
- Few-shot prompted classification into 9 categories
- Urgency score (1–10) with label derivation (`critical`, `high`, `medium`, `low`)
- AI summary generation for dispatch operators
- Keyword tag extraction
- JSON response parsing with markdown fence stripping and regex fallback
- Input validation and output normalisation (clamping, type checking)

#### Volunteer Matching Engine (`src/services/matchService.js`)
- `matchVolunteers(issue, volunteers, options)` — 100-point weighted scoring system
  - Skills match: up to 50 pts (3+ skills = 50, 2 = 35, 1 = 20, 0 = 0)
  - Availability: 25 pts for active, 0 for busy/offline
  - Location/zone: 15 pts exact, 8 pts adjacent, 5 pts keyword match
  - Rating + experience: up to 10 pts (diminishing returns)
- `getMatchSummary()` — human-readable dispatch summary string
- `getRecommendedAction()` — urgency-based action recommendation
- Offline volunteers always excluded; busy volunteers ranked lower

#### Orchestration Pipeline (`src/services/issueService.js`)
- `submitIssue(formData, options)` — full pipeline: AI → fetch → match → save → alert
- Progress callback system (`onProgress`) for live UI updates
- Optimistic UI support (returns result before Firestore confirms)
- `reclassifyIssue()` — re-run AI on existing issue
- `reassignVolunteers()` — re-run matching without saving

#### Firebase Layer (`src/services/firebase.js`)
- Firebase singleton initialisation from `VITE_*` environment variables
- `addIssue()`, `fetchIssues()`, `fetchIssueById()`, `updateIssue()`
- `fetchVolunteers()`, `fetchAvailableVolunteers()`, `updateVolunteerStatus()`
- `subscribeToIssues()`, `subscribeToVolunteers()`, `subscribeToAlerts()` — real-time listeners
- `addAlert()` — writes system alerts to Firestore

#### React Hooks
- `useIssues()` — real-time Firestore subscription with dummy data fallback
- `useIssueMetrics()` — derived metrics from live issues array
- `useVolunteers()` — real-time Firestore subscription with dummy data fallback
- `useMatchedVolunteers()` — reactive matching on selected issue change
- `useAlerts()` — unified alert feed from Firestore + auto-derived alerts

#### Dashboard UI
- Three-column dispatch layout: IssueList | MapPanel | VolunteerPanel
- `MetricsBar` — 6 live KPI cards with hover lift animations
- `IssueList` — filter by status, search, sort by urgency/recency, empty state CTA
- `IssueCard` — urgency-coloured left border, AI summary, category tag, time ago
- `MapPanel` — grid map with urgency-coded pins, legend, layer switcher, detail drawer
- `VolunteerPanel` — dual mode: MATCHED tab (top 3) + ROSTER tab (full list)
- `VolunteerCard` — avatar, skills chips, status badge, mission assignment tag
- `AlertPanel` — horizontal scrolling chips with markRead/dismiss actions
- `Sidebar` — navigation with live badge counts from real data
- `Header` — live clock, search bar, unread alert bell, "+ New Issue" button

#### IssueForm Modal
- Full form with title, description, location, category, urgency fields
- "AUTO-CLASSIFY WITH AI" button with real Gemini API integration
- Progress bar during submission (5 labelled steps, 0%–100%)
- Success state showing Firestore issue ID + top 3 matched volunteers with scores
- Client-side validation with per-field error messages
- AI suggestion apply button
- Handles AI failure gracefully (shows fallback result, no crash)

#### Analytics Page
- `CategoryPieChart` — Chart.js doughnut chart
- `UrgencyBarChart` — Chart.js horizontal bar chart
- `StatusLineChart` — Chart.js line chart (opened vs resolved, 7 days)
- `VolunteerDonutChart` — Chart.js donut chart
- 8 KPI stat cards (issues, resolution rate, avg urgency, volunteers)
- Category breakdown table with animated progress bars
- Urgency level cards with mini progress bars

#### Utilities
- `formatters.js` — `timeAgo`, `groupByCategory`, `groupByUrgency`, `groupByStatus`, `avgUrgencyScore`, `resolutionRate`, `URGENCY_COLOR`, `CATEGORY_COLOR`, `truncate`, `initials`
- `constants.js` — `STATUS`, `URGENCY`, `VOL_STATUS`, `COLLECTION`, `CHART_PALETTE`

#### Data & Seeding
- `dummyData.js` — 6 realistic issues, 8 volunteers, 5 alerts, default metrics
- `scripts/seedFirestore.js` — Firebase Admin SDK seed script for volunteer collection

#### Testing
- `tests/matchService.test.mjs` — 26 unit tests for the matching engine
- `tests/formatters.test.mjs` — 34 unit tests for utility functions
- Zero external test dependencies (pure Node.js ESM)
- All 60 tests passing on first release

#### Documentation
- `README.md` — full project overview, setup, and deployment guide
- `CIVITAS_COMPLETE_GUIDE.md` — 900-line QA, deployment, and AI integration guide
- `PROJECT_STRUCTURE.md` — detailed file-by-file documentation
- `CONTRIBUTING.md` — contributor guidelines
- `CODE_OF_CONDUCT.md` — Contributor Covenant style
- `CHANGELOG.md` — this file

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)

### Security
- All secrets loaded from environment variables (never hardcoded)
- `.env` and `serviceAccountKey.json` in `.gitignore`
- Firestore write validation via `normaliseAIResult()` prevents corrupt data

---

## Version Format

```
MAJOR.MINOR.PATCH

MAJOR — breaking changes (new architecture, removed features)
MINOR — new features (backward compatible)
PATCH — bug fixes, small improvements
```

[Unreleased]: https://github.com/your-username/civitas-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/civitas-ai/releases/tag/v1.0.0
