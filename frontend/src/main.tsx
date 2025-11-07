import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupOnlineStatusMonitor } from './utils/pwa'

// Register Service Worker for PWA
registerServiceWorker()

// Setup online/offline monitoring
setupOnlineStatusMonitor()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
