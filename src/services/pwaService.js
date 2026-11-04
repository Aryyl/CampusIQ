/**
 * CampusIQ Progressive Web App (PWA) Service
 * Manages service worker lifecycle, standalone launch detection, and install prompts.
 */

let deferredPrompt = null
const listeners = new Set()

/**
 * Register the PWA service worker
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service worker registered with scope:', reg.scope)
        reg.onupdatefound = () => {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available; please refresh.')
              }
            }
          }
        }
      })
      .catch((error) => {
        console.warn('[PWA] Service worker registration failed:', error)
      })
  })
}

/**
 * Check if the application is currently running in Standalone PWA mode
 */
export function isStandaloneMode() {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    window.location.search.includes('pwa=student')
  )
}

/**
 * Detect iOS device (iPhone / iPad) running in Safari
 */
export function isIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(ua)
  const isSafari = ua.includes('safari') && !ua.includes('crios') && !ua.includes('fxios')
  return isIos && isSafari && !isStandaloneMode()
}

/**
 * Initialize beforeinstallprompt listener
 */
export function initPwaInstallListener() {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    notifyListeners(true)
    console.log('[PWA] beforeinstallprompt event captured and ready.')
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    try {
      localStorage.setItem('campusiq_pwa_installed', 'true')
    } catch (_) {}
    notifyListeners(false)
    console.log('[PWA] CampusIQ successfully installed to home screen.')
  })
}

/**
 * Trigger the native OS installation dialog
 * @returns {Promise<boolean>} true if accepted, false otherwise
 */
export async function promptPwaInstall() {
  if (!deferredPrompt) {
    return false
  }

  deferredPrompt.prompt()
  const choiceResult = await deferredPrompt.userChoice
  deferredPrompt = null
  notifyListeners(false)
  return choiceResult.outcome === 'accepted'
}

/**
 * Subscribe to install availability changes
 */
export function subscribePwaInstallState(callback) {
  listeners.add(callback)
  callback(Boolean(deferredPrompt))
  return () => listeners.delete(callback)
}

function notifyListeners(available) {
  listeners.forEach((callback) => {
    try {
      callback(available)
    } catch (err) {
      console.error('[PWA] Listener callback error:', err)
    }
  })
}

