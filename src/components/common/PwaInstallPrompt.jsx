import { useEffect, useState } from 'react'
import { Download, Share2, Smartphone, X } from 'lucide-react'
import { isIosSafari, isStandaloneMode, promptPwaInstall, subscribePwaInstallState } from '../../services/pwaService'

const DISMISS_KEY = 'campusiq_pwa_prompt_dismissed_until'

export default function PwaInstallPrompt({ currentLang = 'en', t }) {
  const [canInstall, setCanInstall] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // If already running as installed standalone app, never show
    if (isStandaloneMode()) {
      return
    }

    // Check if user previously dismissed prompt
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_KEY)
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return
      }
    } catch (_) {}

    // Check iOS Safari status
    if (isIosSafari()) {
      setIsIos(true)
      setDismissed(false)
      return
    }

    // Subscribe to standard beforeinstallprompt readiness (Chrome, Edge, Android)
    const unsub = subscribePwaInstallState((available) => {
      setCanInstall(available)
      if (available) {
        setDismissed(false)
      }
    })

    return () => unsub()
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    try {
      // Dismiss for 5 days
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 5 * 24 * 60 * 60 * 1000))
    } catch (_) {}
  }

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      const accepted = await promptPwaInstall()
      if (accepted) {
        setDismissed(true)
      }
    } finally {
      setInstalling(false)
    }
  }

  if (dismissed || (!canInstall && !isIos)) {
    return null
  }

  const isAssamese = currentLang === 'as'

  return (
    <aside className="pwa-install-banner" aria-label="Install CampusIQ App">
      <div className="pwa-install-pill">
        <div className="pwa-pill-badge">
          <Smartphone size={16} />
        </div>

        <div className="pwa-pill-text">
          <strong>{isAssamese ? 'CampusIQ ম\'বাইল এপ' : 'CampusIQ Student App'}</strong>
          <span>
            {isIos
              ? isAssamese
                ? 'হোম স্ক্ৰীণত যোগ কৰিবলৈ Share ⎋ আৰু Add to Home Screen ⊕ টিপক'
                : 'Tap Share ⎋ then "Add to Home Screen" ⊕ to install'
              : isAssamese
              ? 'দ্ৰুত অফলাইন ব্যৱহাৰৰ বাবে এপটো ইনষ্টল কৰক'
              : 'Install for instant full-screen & offline access'}
          </span>
        </div>

        <div className="pwa-pill-actions">
          {!isIos && (
            <button
              type="button"
              className="pwa-install-btn"
              onClick={handleInstallClick}
              disabled={installing}
            >
              <Download size={13} />
              <span>{isAssamese ? 'ইনষ্টল' : 'Install'}</span>
            </button>
          )}

          <button
            type="button"
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

