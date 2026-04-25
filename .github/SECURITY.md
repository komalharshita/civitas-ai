# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.x | ✅ Active support |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Civitas AI, please report it responsibly:

1. **Email:** Send details to `your-email@example.com` with subject: `[Civitas AI] Security Vulnerability`
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

3. **Response time:** You will receive a response within **72 hours**

4. **Disclosure:** We ask that you give us **14 days** to fix the issue before public disclosure

---

## Common Security Notes for This Project

### API Keys
- All API keys must be in `.env` — never hardcoded in source files
- `.env` is in `.gitignore` and must never be committed
- The Gemini API key (`VITE_GEMINI_API_KEY`) is exposed in the browser bundle — this is expected for client-side AI calls. Rotate it if compromised.

### Firebase
- Firestore security rules should be tightened before production (test mode allows all reads/writes)
- The Firebase config values in `VITE_FIREBASE_*` are safe to expose — they identify the project but don't grant admin access
- The service account key (`scripts/serviceAccountKey.json`) grants full DB access — never commit or expose it

### Production Hardening (before going live)
- [ ] Update Firestore rules to require authentication
- [ ] Enable Firebase App Check
- [ ] Add rate limiting to the AI classification endpoint
- [ ] Implement Firebase Authentication for coordinator access
- [ ] Rotate all API keys after the hackathon

---

Thank you for helping keep Civitas AI secure! 🔐
