import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerServiceWorker, setupOnlineStatusMonitor } from './utils/pwa'
import { setupReminderChecker, requestNotificationPermission } from './utils/reminders'

// Register Service Worker for PWA
registerServiceWorker()

// Setup online/offline monitoring
setupOnlineStatusMonitor()

// Setup daily reminders (request permission first)
requestNotificationPermission().then((granted) => {
  if (granted) {
    setupReminderChecker()
    console.log('✅ Daily reminders enabled')
  } else {
    console.log('ℹ️ Notification permission not granted')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
