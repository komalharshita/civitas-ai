# Project Structure

A detailed explanation of every folder and file in Civitas AI, what it does, and how it fits into the overall architecture.

---

## Top-Level Files

```
civitas-ai/
├── README.md                    # Project overview, setup, and deployment guide
├── CONTRIBUTING.md              # How to contribute to this project
├── CODE_OF_CONDUCT.md           # Community behavior standards
├── CHANGELOG.md                 # Version history
├── LICENSE                      # MIT License
├── PROJECT_STRUCTURE.md         # This file
├── CIVITAS_COMPLETE_GUIDE.md    # Full testing + deployment + AI integration guide
│
├── .env.example                 # Template for environment variables
├── .gitignore                   # Files excluded from git
│
├── package.json                 # npm dependencies and scripts
├── vite.config.js               # Vite build configuration + manual chunk splitting
├── tailwind.config.js           # Tailwind CSS custom theme tokens
├── postcss.config.js            # PostCSS processing (Tailwind + Autoprefixer)
│
├── firebase.json                # Firebase Hosting config (SPA URL rewrites)
├── .firebaserc                  # Firebase project alias (maps "default" to project ID)
│
├── index.html                   # HTML shell — Vite injects JS bundle here
```

---

## `scripts/` — Utility Scripts

```
scripts/
└── seedFirestore.js
```

**`seedFirestore.js`** — A one-time Node.js script that uses the Firebase Admin SDK to populate the `volunteers` Firestore collection with 8 realistic volunteer documents. Run this on a fresh database before demoing or testing.

```bash
node --env-file=.env scripts/seedFirestore.js
```

---

## `tests/` — Unit Tests

```
tests/
├── matchService.test.mjs       # 26 tests for the volunteer matching engine
└── formatters.test.mjs         # 34 tests for utility formatting functions
```

Both files are pure Node.js ESM — no test runner, no Jest. Run with:
```bash
node tests/matchService.test.mjs
node tests/formatters.test.mjs
```

---

## `src/` — Application Source

### `src/main.jsx` — Entry Point

The ReactDOM render call. Mounts `<App />` into `#root` in `index.html`. Also imports `index.css`.

### `src/App.jsx` — Root Shell

The top-level component responsible for:
- **Routing** — switches between Dashboard, Analytics, and placeholder pages
- **Layout** — renders `<Sidebar>` + `<Header>` + main content area
- **Live sidebar badges** — subscribes to `useIssues()` and `useVolunteers()` at the root level so badge counts persist across page navigation
- **Global state** — `showIssueForm` boolean, `unreadAlerts` count

### `src/index.css` — Global Styles

Defines:
- **CSS custom properties** — all color tokens (`--color-cyan`, `--color-base`, etc.), font families, layout dimensions
- **Global resets** — box-sizing, body background, scrollbar styling
- **Utility classes** — `.nav-item`, `.btn-primary`, `.btn-ghost`, `.form-input`, `.cat-tag`, `.urgency-*`, `.status-dot`
- **Animations** — `statusPulse`, `scanline-overlay`, `fadeIn`, `slideUp`

---

### `src/data/` — Fallback Data

```
data/
└── dummyData.js
```

**`dummyData.js`** — Contains 6 issues, 8 volunteers, 5 alerts, and default metrics as JavaScript arrays. This data is used as a fallback when:
- Firestore is not configured
- The app is running offline
- Firestore subscription fails

The hooks (`useIssues`, `useVolunteers`, `useAlerts`) automatically fall back to this data and log a warning. The app never crashes due to missing DB.

---

### `src/utils/` — Shared Utilities

```
utils/
├── formatters.js
└── constants.js
```

**`formatters.js`** — Pure functions with no side effects:
- `timeAgo(iso)` — "just now", "14m ago", "2h 30m ago"
- `formatTimestamp(iso)` — "14 Jul 2025, 09:47"
- `urgencyScoreToLabel(score)` — `9 → 'critical'`
- `groupByCategory(issues)` — `{ 'Flood Relief': 3, 'Medical Aid': 2 }`
- `groupByUrgency(issues)` — `{ critical: 2, high: 1, medium: 2, low: 1 }`
- `groupByStatus(issues)` — `{ open: 4, 'in-progress': 1, resolved: 1 }`
- `avgUrgencyScore(issues)` — `6.4`
- `resolutionRate(issues)` — `25` (percent)
- `truncate(str, maxLen)` — "Long string that gets truncated…"
- `initials(name)` — `"Arjun Mehta" → "AM"`
- `URGENCY_COLOR` — `{ critical: '#ef4444', high: '#f59e0b', ... }`
- `CATEGORY_COLOR` — `{ 'Flood Relief': '#00d4ff', 'Medical Aid': '#ef4444', ... }`

**`constants.js`** — Single source of truth for magic strings:
- `STATUS` — `{ OPEN: 'open', IN_PROGRESS: 'in-progress', RESOLVED: 'resolved' }`
- `VOL_STATUS` — `{ ACTIVE: 'active', BUSY: 'busy', OFFLINE: 'offline' }`
- `URGENCY` — `{ CRITICAL: 'critical', HIGH: 'high', ... }`
- `COLLECTION` — `{ ISSUES: 'issues', VOLUNTEERS: 'volunteers', ALERTS: 'alerts' }`
- `CHART_PALETTE` — array of hex colors for Chart.js

---

### `src/services/` — Backend Logic

All API calls, database operations, and business logic live here. Components **never** call Firebase or fetch directly — they always go through a service.

```
services/
├── firebase.js        # Firebase init + all Firestore operations
├── aiService.js       # Gemini API integration
├── matchService.js    # Volunteer scoring/matching engine
└── issueService.js    # Orchestration: AI → match → save
```

**`firebase.js`**
- Initialises the Firebase app singleton using `import.meta.env.VITE_*` variables
- Exports `db` (Firestore instance)
- CRUD functions: `addIssue()`, `fetchIssues()`, `fetchIssueById()`, `updateIssue()`
- Real-time listeners: `subscribeToIssues()`, `subscribeToVolunteers()`, `subscribeToAlerts()`
- Volunteer operations: `fetchVolunteers()`, `updateVolunteerStatus()`
- Alert operations: `addAlert()`

**`aiService.js`**
- `classifyIssue(title, description, location)` — calls Gemini API, returns `{ category, urgencyScore, urgency, summary, tags }`
- `classifyIssueWithFallback(...)` — same but never throws; uses keyword-based fallback on failure
- `buildClassificationPrompt()` — constructs the few-shot prompt
- `parseAIResponse()` — strips markdown fences, parses JSON with regex fallback
- `normaliseAIResult()` — validates and clamps all fields

**`matchService.js`**
- `matchVolunteers(issue, volunteers, options)` — pure scoring engine, returns top N volunteers with `_score`, `_breakdown`, `_matchedSkills`, `_matchReason`
- `getMatchSummary(issue, matches)` — returns human-readable dispatch summary string
- `getRecommendedAction(urgency, matchCount)` — returns urgency-based action string
- Internal: `scoreSkills()`, `scoreAvailability()`, `scoreLocation()`, `scoreExperience()`

**`issueService.js`**
- `submitIssue(formData, options)` — the full pipeline: AI → volunteers → match → save → alert → return result
- `reclassifyIssue(issueId, issueData)` — re-run AI on existing issue, update Firestore
- `reassignVolunteers(issue, topN)` — re-run matching without re-saving the issue

---

### `src/hooks/` — React Hooks

Custom hooks that provide live data to components. Components should use hooks, not call services directly.

```
hooks/
├── useIssues.js
├── useVolunteers.js
├── useMatchedVolunteers.js
└── useAlerts.js
```

**`useIssues.js`**
- `useIssues(options)` — subscribes to Firestore `issues` collection, returns `{ issues, loading, error, refresh }`
- `useIssueMetrics(issues)` — derives `{ activeIssues, resolvedToday, criticalCount, openCount, inProgressCount }` from the live issues array

**`useVolunteers.js`**
- `useVolunteers(options)` — subscribes to Firestore `volunteers` collection, returns `{ volunteers, loading, error, availableCount, deployedCount }`

**`useMatchedVolunteers.js`**
- `useMatchedVolunteers({ issue, volunteers, topN })` — runs `matchVolunteers()` reactively whenever the selected issue or volunteer roster changes. Returns `{ matches, isMatching, matchSummary, recommendedAction, hasMatches }`

**`useAlerts.js`**
- `useAlerts({ issues, volunteers, maxAlerts })` — combines Firestore alerts with auto-derived alerts (unassigned criticals, escalations, resource warnings). Returns `{ alerts, unreadCount, markRead, markAllRead, dismiss, dismissAll }`

---

### `src/components/` — UI Components

#### `layout/` — App Shell

| File | Purpose |
|---|---|
| `Sidebar.jsx` | Left navigation with live badge counts for active issues and available volunteers |
| `Header.jsx` | Top bar with live clock, search input, alert bell, and "+ New Issue" button |

#### `dashboard/` — Main Dashboard Panels

| File | Purpose |
|---|---|
| `MetricsBar.jsx` | Row of 6 live KPI cards (active issues, resolved, deployed vols, available vols, critical count, avg response time) |
| `IssueList.jsx` | Left panel: filterable by status, searchable, sortable by urgency or recency, with empty states |
| `IssueCard.jsx` | Individual issue card with urgency-coloured left border, AI summary, category tag, and meta row |
| `MapPanel.jsx` | Centre panel: grid-pattern map with urgency-coloured pins, legend, layer switcher, and issue detail drawer |
| `VolunteerPanel.jsx` | Right panel with dual mode: MATCHED tab (top 3 for selected issue) and ROSTER tab (full searchable list) |
| `VolunteerCard.jsx` | Individual volunteer card with avatar, skills chips, status badge, zone, rating, and mission tag |
| `AlertPanel.jsx` | Bottom horizontal-scrolling strip of alert chips with type icons, dismiss, and mark-read actions |

#### `charts/` — Analytics Charts

| File | Chart Type | Data |
|---|---|---|
| `CategoryPieChart.jsx` | Doughnut | Issues by category |
| `UrgencyBarChart.jsx` | Horizontal bar | Issues by urgency level |
| `StatusLineChart.jsx` | Line with fill | Opened vs resolved (7 days) |
| `VolunteerDonutChart.jsx` | Doughnut | Volunteer availability breakdown |

All charts self-register only the Chart.js modules they need (tree-shakeable). They re-render when the `issues` or `volunteers` props change.

#### `modals/` — Overlay Modals

| File | Purpose |
|---|---|
| `IssueForm.jsx` | Full issue submission modal with AI auto-classify, form validation, progress bar during submit, and success state showing matched volunteers |

---

### `src/pages/` — Full Pages

| File | Route | Purpose |
|---|---|---|
| `Dashboard.jsx` | `dashboard` | Master orchestrator: mounts all hooks, manages selectedIssue state, renders 3-column layout + alert bar + modal |
| `Analytics.jsx` | `reports` | Full analytics page with 4 charts, 8 KPI stat cards, and category breakdown table |
| `PlaceholderPage.jsx` | all others | Stub page for nav items not yet built |

---

## Component Data Flow

```
App.jsx
 ├─ useIssues()      ──────────────────────────────► sidebar badge (activeIssues)
 ├─ useVolunteers()  ──────────────────────────────► sidebar badge (availableVols)
 │
 └─ Dashboard.jsx
      ├─ useIssues()           ──► IssueList, MapPanel, MetricsBar
      ├─ useVolunteers()        ──► VolunteerPanel (ROSTER tab), MetricsBar
      ├─ useMatchedVolunteers() ──► VolunteerPanel (MATCHED tab) — re-runs on issue select
      └─ useAlerts()            ──► AlertPanel, Header (unreadCount)
```

---

## Adding a New Feature: Checklist

When adding a new feature, touch files in this order:

1. **`src/utils/constants.js`** — add any new constants
2. **`src/services/`** — add business logic / API calls
3. **`src/hooks/`** — add a hook if the component needs reactive data
4. **`src/components/`** — build the UI component
5. **`src/pages/`** — mount it in the right page
6. **`tests/`** — add unit tests for any new service functions
7. **`src/data/dummyData.js`** — add fallback data if needed
8. **`PROJECT_STRUCTURE.md`** — document the new file
