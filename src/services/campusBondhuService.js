/**
 * Campus-Bondhu Live Backend Integration Service
 * Connects frontend to https://campus-bondhu.onrender.com (FastAPI Grounded RAG + Multimodal Vision)
 */

import { auth } from './firebase.js'

// In development, use Vite's proxy ('') to bypass browser CORS preflight restrictions
const BACKEND_URL = (
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? ''
    : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CAMPUS_BONDHU_API_URL
        ? import.meta.env.VITE_CAMPUS_BONDHU_API_URL
        : 'https://campus-bondhu.onrender.com')
).replace(/\/+$/, '')

const DEFAULT_SUPABASE_TOKEN =
  'eyJhbGciOiJFUzI1NiIsImtpZCI6ImJjNmU0NWIwLWYzNDUtNDllMS1iZmYxLWE0YWU5ZWE0NzNhMyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3NldmNyY2JwYW1zeGhwaXVsdGpiLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1ZTJlNjVhMy0zN2UxLTQxMTktYjA4Mi02YTViZDA3ZGRmMzgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzkzNzg4MDA2LCJpYXQiOjE3OTM3ODQ0MDYsImVtYWlsIjoiYXJ5eWFtYW5ib3JhdHNrYWIwNEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc5Mzc4NDQwNn1dLCJzZXNzaW9uX2lkIjoiNjM1OTJiYzEtMmIzZS00ZjM5LTgyNWYtM2JiYWJhNDNiZGZkIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0._AqJIfWbvyLkW0l2rBMytYuFZjizqgMtWSA_Lh87zStfC5hf2WnMW8l3KtZsOEBGOPYKhoLg0zrUy856MWCb0A'

/**
 * Fetch authentication bearer token (Supabase JWT with runtime and environment fallbacks)
 */
async function getAuthToken() {
  // 1. Check runtime override if set
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('campusiq_supabase_token')
      if (stored) return stored
    }
  } catch (_) {}

  // 2. Check environment variable
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CAMPUS_BONDHU_STUDENT_TOKEN) {
    return import.meta.env.VITE_CAMPUS_BONDHU_STUDENT_TOKEN
  }

  // 3. Check active Firebase user if available
  try {
    if (auth && auth.currentUser) {
      const fbToken = await auth.currentUser.getIdToken()
      if (fbToken) return fbToken
    }
  } catch (error) {
    console.warn('[CampusBondhu] Error getting Firebase ID token:', error)
  }

  // 4. Default verified Supabase student token
  return DEFAULT_SUPABASE_TOKEN
}

/**
 * Quick health probe to check if Campus-Bondhu backend is active
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const response = await fetch(`${BACKEND_URL}/api/v1/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return { online: true, data }
    }
    return { online: false, status: response.status }
  } catch (error) {
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
 * @param {Array} [params.history] - Array of recent chat messages [{ role, content }]
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
  // Allow 25 seconds for Render free tier wake-up / AI generation
  const timeoutId = setTimeout(() => controller.abort(), 25000)

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

    // Target the primary Grounded RAG chat endpoint
    console.log(`[CampusBondhu] Dispatching request to: ${BACKEND_URL || window.location.origin}/api/v1/chat/query`, {
      query: payload.query,
      language: payload.selected_language,
      hasImage: !!payload.image,
      hasAuthToken: !!token,
    })

    let response = await fetch(`${BACKEND_URL}/api/v1/chat/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    // If 404 or method not allowed, try alternate chat route
    if (response.status === 404) {
      response = await fetch(`${BACKEND_URL}/api/v1/chat`, {
        method: 'POST',
        headers,
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
      const reply =
        data.answer ||
        data.reply ||
        data.response ||
        data.message ||
        (typeof data === 'string' ? data : null)

      if (reply) {
        console.log('[CampusBondhu] Received live AI reply:', reply.slice(0, 80))
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
    }

    const errDetail = await response.text().catch(() => '')
    console.warn(`[CampusBondhu] HTTP ${response.status} from backend. Details:`, errDetail, '→ Engaging local fallback.')
    return {
      success: false,
      status: response.status,
      fallback: true,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      console.warn('[CampusBondhu] Request timed out (Render cold-boot). Using local fallback.')
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
