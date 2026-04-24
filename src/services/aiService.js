// src/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
//  Vertex AI / Gemini integration for issue classification
//
//  HOW TO GET YOUR API KEY:
//  1. Go to https://aistudio.google.com/app/apikey
//  2. Click "Create API key" → copy it
//  3. Paste it as VITE_GEMINI_API_KEY in your .env file
//
//  WHY GEMINI API vs VERTEX AI SDK:
//  - Gemini API (Google AI Studio key): zero GCP setup, ideal for hackathons ✓
//  - Vertex AI SDK: needs GCP project + service account — better for production
//  Both use the same Gemini model under the hood. We use Gemini API here.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

// Model: gemini-1.5-flash is fast + cheap — perfect for real-time classification
const GEMINI_MODEL    = 'gemini-1.5-flash'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// The API key is read at runtime from the browser env (set in .env)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Valid categories that match your existing frontend + Firestore schema
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
]

// Urgency score → urgency label mapping
const SCORE_TO_LABEL = {
  9: 'critical', 10: 'critical',
  7: 'high',     8:  'high',
  5: 'medium',   6:  'medium',
  1: 'low',      2:  'low',     3: 'low', 4: 'low',
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * buildClassificationPrompt — constructs the strict prompt sent to Gemini
 * We use few-shot examples + a JSON schema to guarantee parseable output.
 *
 * @param {string} title
 * @param {string} description
 * @param {string} location
 * @returns {string} — the full prompt string
 */
function buildClassificationPrompt(title, description, location) {
  return `
You are an AI dispatch coordinator for "Civitas AI", an emergency volunteer management system.

Your job is to analyze a reported issue and return a structured classification in STRICT JSON.

VALID CATEGORIES (pick exactly one):
${VALID_CATEGORIES.map((c) => `- ${c}`).join('\n')}

URGENCY SCORE GUIDE (integer 1–10):
- 9–10: CRITICAL  — immediate life risk, mass displacement, no access to aid
- 7–8:  HIGH      — serious harm within hours, urgent medical or rescue needed
- 5–6:  MEDIUM    — important but currently stable, can wait 2–4 hours
- 1–4:  LOW       — minor issue, no immediate danger

RESPONSE FORMAT — return ONLY this JSON, nothing else, no markdown, no explanation:
{
  "category":     "<one of the valid categories above>",
  "urgencyScore": <integer 1–10>,
  "urgency":      "<critical|high|medium|low>",
  "summary":      "<1–2 sentence action-oriented summary for dispatch operators>",
  "tags":         ["<keyword1>", "<keyword2>", "<keyword3>"]
}

EXAMPLES:

Issue: "Flooding in residential block, families trapped on rooftops"
Response: {"category":"Flood Relief","urgencyScore":9,"urgency":"critical","summary":"Immediate water rescue needed. Multiple families stranded — deploy boat crew and evacuation team.","tags":["flood","rescue","evacuation"]}

Issue: "Elderly person needs blood pressure medication, pharmacy closed"
Response: {"category":"Medical Aid","urgencyScore":6,"urgency":"medium","summary":"Non-emergency medical supply needed. Volunteer with vehicle can deliver medication within 2–3 hours.","tags":["medical","elderly","medication"]}

Issue: "Tree fallen on road, blocking traffic"
Response: {"category":"Infrastructure","urgencyScore":4,"urgency":"low","summary":"Road clearance needed. No reported injuries. Chainsaw crew can clear during next available window.","tags":["road-block","tree-fall","infrastructure"]}

---

NOW CLASSIFY THIS ISSUE:
Title:       ${title}
Description: ${description}
Location:    ${location || 'Unknown'}

Return ONLY the JSON object:
`.trim()
}

// ─── Core API call ────────────────────────────────────────────────────────────

/**
 * callGeminiAPI — sends a prompt to Gemini and returns the raw text response
 *
 * @param {string} prompt
 * @returns {Promise<string>} — raw model output text
 * @throws if the API call fails or quota is exceeded
 */
async function callGeminiAPI(prompt) {
  if (!API_KEY) {
    throw new Error(
      'VITE_GEMINI_API_KEY is not set. Add it to your .env file. ' +
      'Get a key at https://aistudio.google.com/app/apikey'
    )
  }

  const url      = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${API_KEY}`
  const payload  = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature:     0.1,   // low temp = deterministic, structured output
      maxOutputTokens: 300,   // JSON response is small — cap tokens to save quota
      topP:            0.8,
      topK:            10,
    },
    safetySettings: [
      // Relax safety filters for emergency/disaster content
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  }

  const response = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json()

  // Navigate the Gemini response structure to extract text
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error('Gemini returned an empty response. Check your API key and quota.')
  }

  return text
}

// ─── JSON parser with fallback ─────────────────────────────────────────────────

/**
 * parseAIResponse — safely parse the JSON from Gemini's text output
 * Gemini sometimes wraps JSON in ```json ... ``` — this handles both cases.
 *
 * @param {string} rawText
 * @returns {Object} — parsed JSON object
 */
function parseAIResponse(rawText) {
  // Strip markdown code fences if present (e.g. ```json ... ```)
  let cleaned = rawText.trim()
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
  cleaned = cleaned.replace(/^```\s*/,      '').replace(/```\s*$/,    '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // If JSON.parse fails, try to extract just the JSON object portion
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error(`Could not parse AI response as JSON. Raw output: ${rawText.slice(0, 200)}`)
  }
}

// ─── Validation + normalisation ───────────────────────────────────────────────

/**
 * normaliseAIResult — validate and fix any invalid fields from the AI
 * Acts as a guard so bad AI output never corrupts the database.
 *
 * @param {Object} parsed — raw parsed JSON from Gemini
 * @returns {Object} — clean, validated classification result
 */
function normaliseAIResult(parsed) {
  // Validate category
  const category = VALID_CATEGORIES.includes(parsed.category)
    ? parsed.category
    : 'Other'

  // Validate urgency score (clamp to 1–10)
  const urgencyScore = Math.min(10, Math.max(1, Math.round(Number(parsed.urgencyScore) || 5)))

  // Derive urgency label from score (don't trust AI's label — derive it)
  const urgency = SCORE_TO_LABEL[urgencyScore] ?? 'medium'

  // Sanitise summary
  const summary = typeof parsed.summary === 'string' && parsed.summary.length > 5
    ? parsed.summary.slice(0, 500)   // cap length
    : 'Issue requires volunteer assessment. Please review and assign.'

  // Sanitise tags
  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.filter((t) => typeof t === 'string').slice(0, 5).map((t) => t.toLowerCase())
    : []

  return { category, urgencyScore, urgency, summary, tags }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * classifyIssue — the main export. Send issue text → receive AI classification.
 *
 * @param {string} title       — short issue title
 * @param {string} description — detailed description
 * @param {string} location    — location string (optional but improves accuracy)
 * @returns {Promise<{
 *   category:     string,
 *   urgencyScore: number,
 *   urgency:      string,
 *   summary:      string,
 *   tags:         string[],
 * }>}
 *
 * Usage:
 *   const result = await classifyIssue(
 *     'Flood damage',
 *     'Families displaced in Lane 7',
 *     'Koregaon Park, Pune'
 *   )
 *   // result → { category: 'Flood Relief', urgencyScore: 9, urgency: 'critical', ... }
 */
export async function classifyIssue(title, description, location = '') {
  // Guard: don't call AI with empty input
  if (!title?.trim() && !description?.trim()) {
    throw new Error('classifyIssue requires at least a title or description.')
  }

  console.log('[AI] Classifying issue:', title)

  const prompt   = buildClassificationPrompt(title, description, location)
  const rawText  = await callGeminiAPI(prompt)

  console.log('[AI] Raw Gemini response:', rawText)

  const parsed   = parseAIResponse(rawText)
  const result   = normaliseAIResult(parsed)

  console.log('[AI] Classification result:', result)
  return result
}

/**
 * classifyIssueWithFallback — same as classifyIssue but never throws.
 * Returns a safe default if AI call fails (network error, quota exceeded, etc.)
 * Ideal for production flows where you want graceful degradation.
 *
 * @param {string} title
 * @param {string} description
 * @param {string} location
 * @returns {Promise<Object>} — AI result or sensible default
 */
export async function classifyIssueWithFallback(title, description, location = '') {
  try {
    return await classifyIssue(title, description, location)
  } catch (error) {
    console.warn('[AI] Classification failed, using fallback:', error.message)

    // Keyword-based fallback so the app keeps working without AI
    const text = `${title} ${description}`.toLowerCase()
    let category     = 'Other'
    let urgencyScore = 5

    if (text.includes('flood')   || text.includes('water'))              { category = 'Flood Relief';   urgencyScore = 8 }
    else if (text.includes('medical') || text.includes('hospital') || text.includes('injur')) { category = 'Medical Aid';    urgencyScore = 7 }
    else if (text.includes('food')   || text.includes('hunger'))         { category = 'Food & Water';   urgencyScore = 6 }
    else if (text.includes('road')   || text.includes('tree') || text.includes('bridge'))    { category = 'Infrastructure'; urgencyScore = 4 }
    else if (text.includes('missing') || text.includes('rescue') || text.includes('trap'))   { category = 'Search & Rescue'; urgencyScore = 9 }
    else if (text.includes('animal'))                                     { category = 'Animal Welfare'; urgencyScore = 3 }

    const urgency = SCORE_TO_LABEL[urgencyScore] ?? 'medium'

    return {
      category,
      urgencyScore,
      urgency,
      summary:   `${category} issue reported. Manual review recommended. (AI classification unavailable)`,
      tags:      [],
      _fallback: true,   // flag so you can show a warning in the UI
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────────
//  VERTEX AI ALTERNATIVE (for production / GCP deployment)
//  Uncomment and replace classifyIssue above when you have a GCP service account.
// ──────────────────────────────────────────────────────────────────────────────
/*
export async function classifyIssueVertexAI(title, description, location = '') {
  const PROJECT  = import.meta.env.VITE_GCP_PROJECT_ID
  const LOCATION = import.meta.env.VITE_GCP_LOCATION || 'us-central1'
  const TOKEN    = import.meta.env.VITE_VERTEX_AI_TOKEN  // OAuth2 bearer token

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/gemini-1.5-flash:generateContent`

  const response = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildClassificationPrompt(title, description, location) }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
    }),
  })

  const data  = await response.json()
  const text  = data.candidates[0].content.parts[0].text
  const parsed = parseAIResponse(text)
  return normaliseAIResult(parsed)
}
*/
