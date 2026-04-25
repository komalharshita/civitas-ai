## 📋 Summary

<!-- 
Clearly describe what this PR does in 1–3 sentences. 
Start with: "This PR adds...", "This PR fixes...", "This PR refactors..."
-->



---

## 🔗 Related Issue

<!-- Link the issue this PR closes (if applicable) -->
Closes #___

---

## 🔄 Type of Change

<!-- Check all that apply -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that changes existing behavior)
- [ ] 📖 Documentation update
- [ ] ♻️ Refactor (no feature change, no bug fix)
- [ ] 🧪 Test addition / improvement
- [ ] 🎨 UI / style change
- [ ] ⚙️ Build / config change

---

## 🧪 How Has This Been Tested?

<!-- Describe how you tested your changes. -->

- [ ] Ran `node tests/matchService.test.mjs` — all 26 tests pass
- [ ] Ran `node tests/formatters.test.mjs` — all 34 tests pass
- [ ] Ran `npm run build` — builds without errors or warnings
- [ ] Tested manually in local dev (`npm run dev`)
- [ ] Tested the affected user flow end-to-end:

**Manual test steps:**
1. 
2. 
3. 

---

## 📸 Screenshots (UI changes only)

<!-- If your PR changes the UI, include before/after screenshots. -->
<!-- Delete this section if there are no UI changes. -->

| Before | After |
|---|---|
| <!-- screenshot --> | <!-- screenshot --> |

---

## 📝 What Changed and Why

<!-- 
Explain the technical decisions you made.
Why did you choose this approach? What alternatives did you consider?
-->



---

## ⚠️ Does This Introduce Breaking Changes?

- [ ] No
- [ ] Yes — describe the impact and migration path:

<!-- Describe what breaks and how existing users should update. -->

---

## 📋 Checklist

Before requesting a review, confirm all items:

**Code quality:**
- [ ] My code follows the style guidelines in [CONTRIBUTING.md](../CONTRIBUTING.md)
- [ ] I've added JSDoc comments to all new exported functions
- [ ] I've used constants from `src/utils/constants.js` (no magic strings)
- [ ] New service functions are in `src/services/`, not inside components
- [ ] New hooks are in `src/hooks/`, follow `useXxx` naming

**Testing:**
- [ ] All existing tests still pass (`node tests/*.test.mjs`)
- [ ] I've added unit tests for any new service/utility functions
- [ ] `npm run build` completes without errors

**Security:**
- [ ] I have NOT committed `.env`, `serviceAccountKey.json`, or any API keys
- [ ] No secrets are hardcoded in source files

**Docs:**
- [ ] I've updated `README.md` if I changed a public-facing feature
- [ ] I've updated `PROJECT_STRUCTURE.md` if I added new files/folders
- [ ] I've updated `CHANGELOG.md` under `[Unreleased]`

**Branch:**
- [ ] My branch is up to date with `main`
- [ ] Branch name follows convention: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`

---

## 🗒️ Additional Notes for Reviewer

<!-- Anything the reviewer should know while reviewing this PR. -->
<!-- e.g. "Focus on the scoring logic in matchService.js — I changed the weighting." -->
