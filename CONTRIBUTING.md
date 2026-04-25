# Contributing to Civitas AI

Thank you for taking the time to contribute! 🎉
Every pull request, bug report, and idea helps make Civitas AI better for communities everywhere.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [How to Fork and Clone](#how-to-fork-and-clone)
- [Branch Naming](#branch-naming)
- [Making Changes](#making-changes)
- [Commit Messages](#commit-messages)
- [Running Tests](#running-tests)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Guidelines](#code-guidelines)
- [What We Welcome](#what-we-welcome)

---

## Getting Started

Before contributing, please:

1. Read the [README](README.md) to understand the project
2. Check [existing issues](../../issues) so you don't duplicate work
3. For large changes, **open an issue first** to discuss your idea
4. Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

---

## How to Fork and Clone

### Step 1 — Fork the repository

Click the **Fork** button at the top right of this page. This creates a copy of the project under your GitHub account.

### Step 2 — Clone your fork

```bash
git clone https://github.com/YOUR-USERNAME/civitas-ai.git
cd civitas-ai
```

### Step 3 — Add the original repo as upstream

This keeps your fork up to date with the main project:

```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/civitas-ai.git
git remote -v
# origin    https://github.com/YOUR-USERNAME/civitas-ai.git (fetch)
# upstream  https://github.com/ORIGINAL-OWNER/civitas-ai.git (fetch)
```

### Step 4 — Install dependencies

```bash
npm install
cp .env.example .env
# Fill in your keys
npm run dev
```

---

## Branch Naming

Always create a new branch for your work. **Never commit directly to `main`.**

Use this naming convention:

| Type | Pattern | Example |
|---|---|---|
| New feature | `feat/description` | `feat/google-maps-integration` |
| Bug fix | `fix/description` | `fix/volunteer-score-calculation` |
| Documentation | `docs/description` | `docs/update-api-guide` |
| Refactor | `refactor/description` | `refactor/ai-service-cleanup` |
| Tests | `test/description` | `test/add-firebase-mock-tests` |

```bash
# Create and switch to a new branch
git checkout -b feat/your-feature-name
```

---

## Making Changes

### Syncing with upstream before you start

```bash
git fetch upstream
git checkout main
git merge upstream/main
git checkout -b feat/your-feature-name
```

### Keep changes focused

- One feature or bug fix per pull request
- Don't mix unrelated changes in a single PR
- Keep components small and single-purpose

---

## Commit Messages

Follow the **Conventional Commits** format. This keeps the git history clean and readable.

```
<type>: <short description>

[optional body — explain WHY, not WHAT]

[optional footer — links to issues]
```

### Types

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons (no logic change) |
| `refactor` | Code restructure (no feature change, no bug fix) |
| `test` | Adding or updating tests |
| `chore` | Dependency updates, build config changes |

### Good examples

```bash
git commit -m "feat: add WhatsApp notification for volunteer dispatch"
git commit -m "fix: handle null urgencyScore in IssueCard rendering"
git commit -m "docs: add Vertex AI production setup instructions"
git commit -m "refactor: extract scoring logic into separate helper functions"
git commit -m "test: add unit tests for location zone matching"
```

### Bad examples

```bash
git commit -m "fix stuff"          # ❌ too vague
git commit -m "WIP"                # ❌ not descriptive
git commit -m "updated files"      # ❌ tells us nothing
```

---

## Running Tests

Before submitting any PR, make sure all tests pass:

```bash
node tests/matchService.test.mjs   # must show: 26 passed, 0 failed
node tests/formatters.test.mjs     # must show: 34 passed, 0 failed
npm run build                       # must complete with zero errors
```

If you add a new feature, add tests for it in the `tests/` folder.

---

## Submitting a Pull Request

### Step 1 — Push your branch

```bash
git push origin feat/your-feature-name
```

### Step 2 — Open a Pull Request

1. Go to your fork on GitHub
2. Click **"Compare & pull request"**
3. Fill in the PR template (it will appear automatically)
4. Link to the related issue: `Closes #42`

### Step 3 — Wait for review

- A maintainer will review within 48–72 hours
- Be responsive to feedback and requested changes
- Don't force-push to a branch with an open PR (it destroys review context)

### PR Checklist

Before submitting, confirm:

- [ ] My branch is up to date with `main`
- [ ] All 60 tests pass (`node tests/*.test.mjs`)
- [ ] `npm run build` completes without errors
- [ ] I haven't committed `.env` or `serviceAccountKey.json`
- [ ] New functions have JSDoc comments
- [ ] I've updated the README if I changed a public API

---

## Code Guidelines

### JavaScript / React

- **No class components** — use functional components + hooks only
- **Hooks in `src/hooks/`** — all `useXxx()` hooks go here, not inside components
- **Services in `src/services/`** — all API calls, DB operations go here
- **No hardcoded strings** — use `src/utils/constants.js` for repeated values
- **Pure functions** — `matchService.js` and `formatters.js` must have zero side effects

### Formatting

```javascript
// ✅ Good: named exports, JSDoc, clear naming
/**
 * matchVolunteers — rank all volunteers against an issue
 * @param {Object} issue
 * @param {Object[]} volunteers
 * @returns {Object[]}
 */
export function matchVolunteers(issue, volunteers) { ... }

// ❌ Avoid: default exports for utilities, no docs
export default function match(i, v) { ... }
```

### CSS / Tailwind

- Use CSS variables defined in `src/index.css` (`var(--color-cyan)`, etc.)
- Prefer `style={{}}` props for dynamic values over conditional Tailwind classes
- Don't add new global CSS unless absolutely necessary

### File naming

- Components: `PascalCase.jsx` (e.g., `IssueCard.jsx`)
- Hooks: `camelCase.js` prefixed with `use` (e.g., `useAlerts.js`)
- Services: `camelCase.js` (e.g., `aiService.js`)
- Tests: `camelCase.test.mjs` (e.g., `matchService.test.mjs`)

---

## What We Welcome

🟢 **Always welcome:**
- Bug fixes with test cases
- Performance improvements
- Accessibility improvements
- New test coverage
- Documentation improvements
- Typo fixes

🟡 **Discuss first (open an issue):**
- New dependencies
- Breaking changes to existing APIs
- Large refactors
- New pages or major UI changes

🔴 **Not accepted:**
- Changes that break existing tests
- Code without comments/docs
- PRs that mix multiple unrelated changes
- Direct commits to `main`

---

Thank you for contributing to Civitas AI! Your work helps communities get faster, smarter disaster response. 🌍
