import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CampusDataProvider } from './context/CampusDataContext'
import { registerServiceWorker, initPwaInstallListener } from './services/pwaService'
import './index.css'

// Initialize PWA Lifecycle & Service Worker
registerServiceWorker()
initPwaInstallListener()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CampusDataProvider>
      <App />
    </CampusDataProvider>
  </React.StrictMode>,
)
