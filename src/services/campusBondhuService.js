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

/**
 * Fetch Firebase ID Token if user is authenticated
 */
async function getAuthToken() {
  try {
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken()
    }
  } catch (error) {
    console.warn('[CampusBondhu] Error getting Firebase ID token:', error)
  }
  return null
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
