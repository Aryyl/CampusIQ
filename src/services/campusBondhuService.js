/**
 * Campus-Bondhu Live Backend Integration Service
 * Connects frontend to https://campus-bondhu.onrender.com (FastAPI Grounded RAG + Multimodal Vision)
 */

import { auth } from './firebase.js'

/**
 * Endpoint routing:
 *  DEV  → Vite proxy at '' so /api/v1/... is proxied to campus-bondhu.onrender.com (no CORS)
 *  PROD → Vercel serverless functions at /api/chat-proxy and /api/health-proxy (no CORS)
 *
 * Both approaches avoid browser CORS entirely by keeping the request same-origin.
 */
const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV

// In dev, BACKEND_URL is '' (Vite proxy handles /api/v1/... → Render)
// In prod, BACKEND_URL is unused — we call /api/chat-proxy instead
const BACKEND_URL = IS_DEV ? '' : ''

// Chat endpoint: dev uses Vite proxy to Render directly; prod uses Vercel function
const CHAT_ENDPOINT = IS_DEV ? '/api/v1/chat/query' : '/api/chat-proxy'
const HEALTH_ENDPOINT = IS_DEV ? '/api/v1/health' : '/api/health-proxy'

// NOTE: This token may expire. If you see 401 errors, generate a fresh Supabase token
// and update VITE_CAMPUS_BONDHU_STUDENT_TOKEN in .env
const DEFAULT_SUPABASE_TOKEN =
  'eyJhbGciOiJFUzI1NiIsImtpZCI6ImJjNmU0NWIwLWYzNDUtNDllMS1iZmYxLWE0YWU5ZWE0NzNhMyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3NldmNyY2JwYW1zeGhwaXVsdGpiLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1ZTJlNjVhMy0zN2UxLTQxMTktYjA4Mi02YTViZDA3ZGRmMzgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkzNzk1OTg3LCJpYXQiOjE3OTM3OTIzODcsImVtYWlsIjoiYXJ5eWFtYW5ib3JhdHNrYWIwNEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwxIjoiYWFswMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3OTM3OTIzODd9XSwic2Vzc2lvbl9pZCI6ImNlYzIwYTg1LTBhZWQtNDEwNS1iMGIzLWE1ZjY3MmFmMzZjZSIsImlzX2Fub255bW91cyI6ZmFsc2V9.RsDWTAgh1Yy6TRvsFdcCJVb1GKTkz07pwVmCdqNb6ew6FoU6cavq0FTu8U9t1iBcP0C1ASVKS0yLNidJ9E_79Q'

/**
 * Check if a JWT token is expired (client-side check without full verification).
 * Uses regex to extract exp so it's resilient to malformed JSON payloads.
 */
function isTokenExpired(token) {
  try {
    // Use regex to extract exp value directly — avoids JSON.parse failing on malformed payloads
    const payloadB64 = token.split('.')[1]
    const decoded = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))
    const match = decoded.match(/"exp"\s*:\s*(\d+)/)
    if (!match) return false
    return Date.now() / 1000 > parseInt(match[1], 10)
  } catch {
    return false
  }
}

/**
 * Fetch authentication bearer token (Supabase JWT with runtime and environment fallbacks)
 * Returns null if no valid token is available (backend may allow optional auth)
 */
async function getAuthToken() {
  // 1. Check runtime override if set in localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('campusiq_supabase_token')
      if (stored && !isTokenExpired(stored)) return stored
    }
  } catch (_) {}

  // 2. Check environment variable
  const envToken =
    typeof import.meta !== 'undefined' && import.meta.env?.VITE_CAMPUS_BONDHU_STUDENT_TOKEN
  if (envToken && !isTokenExpired(envToken)) return envToken

  // 3. Check active Firebase user if available
  try {
    if (auth && auth.currentUser) {
      const fbToken = await auth.currentUser.getIdToken()
      if (fbToken) return fbToken
    }
  } catch (error) {
    console.warn('[CampusBondhu] Error getting Firebase ID token:', error)
  }

  // 4. Try default Supabase token only if not expired
  if (!isTokenExpired(DEFAULT_SUPABASE_TOKEN)) {
    return DEFAULT_SUPABASE_TOKEN
  }

  // 5. No valid token — return null and try unauthenticated request
  console.warn('[CampusBondhu] All tokens expired. Attempting unauthenticated request.')
  return null
}

/**
 * Quick health probe to warm up Campus-Bondhu backend (Render free tier cold boot)
 * Uses a long timeout so the server has time to start before the user sends a message
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController()
    // 90s — enough time for Render free-tier to wake from sleep
    const timeoutId = setTimeout(() => controller.abort(), 90000)

    const response = await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      console.log('[CampusBondhu] Backend is awake:', data)
      return { online: true, data }
    }
    console.warn('[CampusBondhu] Health check returned:', response.status)
    return { online: false, status: response.status }
  } catch (error) {
    console.warn('[CampusBondhu] Health check failed:', error.message)
    return { online: false, error: error.message }
  }
}

/**
 * Send a chat message (text and/or image) to Campus-Bondhu
 *
 * @param {Object} params
 * @param {string} params.message - The text message from the student
 * @param {string} params.language - 'en' | 'as' | 'hi'
 * @param {string} [params.studentId] - Student identifier or roll number
 * @param {Object} [params.attachment] - Optional file/image attachment { name, size, type, isImage, dataUrl }
 * @param {Array}  [params.history] - Array of recent chat messages [{ role, content }]
 * @param {string} [params.conversationId] - Optional conversation UUID
 * @returns {Promise<{ success: boolean, reply?: string, citations?: Array, claims?: Array, source?: string, error?: string }>}
 */
export async function sendChatMessage({
  message,
  language = 'en',
  studentId = 'student_user',
  attachment = null,
  history = [],
  conversationId = null,
}) {
  const controller = new AbortController()
  // 90 seconds — Render free tier can take up to 60-80s to cold-boot
  const timeoutId = setTimeout(() => controller.abort(), 90000)

  const startTime = Date.now()

  try {
    const token = await getAuthToken()
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const payload = {
      query: message || (attachment ? `Analyze this document: ${attachment.name}` : 'Hello'),
      selected_language: language === 'as' ? 'as' : 'en',
      conversation_id: conversationId || null,
      student_id: studentId,
    }

    // Attach multimodal image payload if provided
    if (attachment && attachment.dataUrl) {
      payload.image = attachment.dataUrl
      payload.image_name = attachment.name
      payload.image_type = attachment.type
    }

    const targetUrl = CHAT_ENDPOINT
    console.log(`[CampusBondhu] → POST ${targetUrl} (${IS_DEV ? 'dev/Vite-proxy' : 'prod/Vercel-proxy'})`, {
      query: payload.query.slice(0, 60),
      language: payload.selected_language,
      hasImage: !!payload.image,
      hasAuthToken: !!token,
    })

    let response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    console.log(`[CampusBondhu] Response status: ${response.status} in ${Date.now() - startTime}ms`)

    // If auth failed (401) or unprocessable entity (422 = bad JWT structure), retry without auth
    if ((response.status === 401 || response.status === 422) && token) {
      const bodyPreview = await response.clone().text().catch(() => '')
      console.warn(`[CampusBondhu] ${response.status} — token rejected (${bodyPreview.slice(0, 120)}). Retrying without auth...`)
      const noAuthHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: noAuthHeaders,
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      console.log(`[CampusBondhu] No-auth retry status: ${response.status} in ${Date.now() - startTime}ms`)
    }

    // If 404 on primary route, try alternate chat route (dev only — Vercel proxy handles prod)
    if (response.status === 404 && IS_DEV) {
      console.warn('[CampusBondhu] 404 on /chat/query — trying /api/v1/chat fallback route...')
      response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: token ? headers : { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          message: payload.query,
          language: payload.selected_language,
          image: payload.image,
          image_name: payload.image_name,
          history: history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })
    }

    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      console.log('[CampusBondhu] 200 OK — raw response keys:', Object.keys(data), '| full:', JSON.stringify(data).slice(0, 300))
      const reply =
        data.answer ||
        data.reply ||
        data.response ||
        data.message ||
        (typeof data === 'string' ? data : null)

      if (reply) {
        console.log(`[CampusBondhu] Live AI reply received in ${Date.now() - startTime}ms:`, reply.slice(0, 80))
        return {
          success: true,
          reply,
          citations: data.citations || [],
          claims: data.claims || [],
          detectedLanguage: data.detected_language,
          modelUsed: data.model_used,
          source: 'Campus-Bondhu',
        }
      }
      console.warn('[CampusBondhu] 200 OK but no reply field found in response. Keys:', Object.keys(data))
    }

    const errDetail = await response.text().catch(() => '')
    console.warn(
      `[CampusBondhu] HTTP ${response.status} from backend after ${Date.now() - startTime}ms. Details:`,
      errDetail.slice(0, 200),
      '→ Engaging local fallback.',
    )
    return {
      success: false,
      status: response.status,
      fallback: true,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.warn(`[CampusBondhu] Request timed out after ${Date.now() - startTime}ms (Render cold-boot takes ~60-80s).`)
    } else {
      console.warn('[CampusBondhu] Network error:', error.message)
    }
    return {
      success: false,
      fallback: true,
      error: error.message,
    }
  }
}
