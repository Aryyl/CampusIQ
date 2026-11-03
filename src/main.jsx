import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CampusDataProvider } from './context/CampusDataContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CampusDataProvider>
      <App />
    </CampusDataProvider>
  </React.StrictMode>,
)
