/**
 * Vercel Serverless Function — Campus-Bondhu Health Proxy with Auto-Auth
 *
 * Warms up the Render backend. Called silently on student portal mount.
 * Route: GET /api/health-proxy
 */

const CAMPUS_BONDHU_URL = 'https://campus-bondhu.onrender.com'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const upstream = await fetch(`${CAMPUS_BONDHU_URL}/api/v1/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(90000),
    })
    const data = await upstream.text()
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
    return res.status(upstream.status).send(data)
  } catch (error) {
    return res.status(502).json({ online: false, error: error.message })
  }
}
