/**
 * Vercel Serverless Function — Campus-Bondhu Chat Proxy with Auto-Auth
 *
 * Signs in to Supabase automatically (server-side, using Vercel env vars),
 * then proxies the request to the Campus-Bondhu Render backend.
 *
 * Completely bypasses browser CORS and manual token management.
 *
 * Required Vercel Environment Variables:
 *   SUPABASE_URL      = https://sevcrcbpamsxhpiultjb.supabase.co
 *   SUPABASE_ANON_KEY = your-supabase-anon-key (from Supabase dashboard → Settings → API)
 *   SUPABASE_EMAIL    = aryyamanboratskab04@gmail.com
 *   SUPABASE_PASSWORD = your-supabase-password
 *
 * Route: POST /api/chat-proxy
 */

const CAMPUS_BONDHU_URL = 'https://campus-bondhu.onrender.com'

// In-memory token cache (lives for the duration of the serverless function instance)
let cachedToken = null
let tokenExpiresAt = 0

/**
 * Sign in to Supabase and get a fresh access token.
 * Uses cached token if still valid (within 5-min safety margin).
 */
async function getSupabaseToken() {
  const now = Date.now() / 1000
  const SAFETY_MARGIN = 300 // refresh 5 minutes before expiry

  // Return cached token if still valid
  if (cachedToken && tokenExpiresAt - SAFETY_MARGIN > now) {
    return cachedToken
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
  const email = process.env.SUPABASE_EMAIL
  const password = process.env.SUPABASE_PASSWORD

  if (!supabaseUrl || !supabaseAnonKey || !email || !password) {
    console.warn('[chat-proxy] Supabase env vars not configured — trying unauthenticated')
    return null
  }

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[chat-proxy] Supabase sign-in failed:', res.status, err.slice(0, 200))
      return null
    }

    const data = await res.json()
    cachedToken = data.access_token
    // data.expires_in is seconds from now
    tokenExpiresAt = now + (data.expires_in || 3600)
    console.log('[chat-proxy] Supabase sign-in successful, token valid for', data.expires_in, 'seconds')
    return cachedToken
  } catch (err) {
    console.error('[chat-proxy] Supabase sign-in error:', err.message)
    return null
  }
}

export default async function handler(req, res) {
  // CORS headers — allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Get a valid token — from client header OR auto sign-in
  const clientToken = req.headers.authorization?.replace('Bearer ', '')
  const token = clientToken || (await getSupabaseToken())

  const forwardHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    forwardHeaders['Authorization'] = `Bearer ${token}`
  }

  console.log('[chat-proxy] Forwarding request to Campus-Bondhu, hasToken:', !!token)

  try {
    let upstream = await fetch(`${CAMPUS_BONDHU_URL}/api/v1/chat/query`, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(85000),
    })

    console.log('[chat-proxy] Upstream status:', upstream.status)

    // If client token was rejected, try with fresh auto-auth token
    if ((upstream.status === 401 || upstream.status === 422) && clientToken) {
      console.warn('[chat-proxy] Client token rejected — retrying with auto-auth token')
      cachedToken = null // force refresh
      const freshToken = await getSupabaseToken()
      if (freshToken) {
        upstream = await fetch(`${CAMPUS_BONDHU_URL}/api/v1/chat/query`, {
          method: 'POST',
          headers: { ...forwardHeaders, Authorization: `Bearer ${freshToken}` },
          body: JSON.stringify(req.body),
          signal: AbortSignal.timeout(85000),
        })
        console.log('[chat-proxy] Auto-auth retry status:', upstream.status)
      }
    }

    // If still 401, try completely unauthenticated (backend may allow optional auth)
    if (upstream.status === 401 || upstream.status === 422) {
      console.warn('[chat-proxy] All auth failed — trying unauthenticated request')
      upstream = await fetch(`${CAMPUS_BONDHU_URL}/api/v1/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(85000),
      })
      console.log('[chat-proxy] Unauthenticated status:', upstream.status)
    }

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const responseText = await upstream.text()
    res.setHeader('Content-Type', contentType)
    return res.status(upstream.status).send(responseText)
  } catch (error) {
    console.error('[chat-proxy] Error:', error.message)
    return res.status(502).json({ error: 'Campus-Bondhu backend unreachable', detail: error.message })
  }
}
