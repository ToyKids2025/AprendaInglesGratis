/**
 * PWA Registration Hook
 * Registers service worker for offline functionality
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60000) // Check every minute

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (confirm('Nova versão disponível! Atualizar agora?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    })
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister()
    })
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Show offline indicator
export function showOfflineIndicator() {
  const indicator = document.createElement('div')
  indicator.id = 'offline-indicator'
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ef4444;
    color: white;
    padding: 8px;
    text-align: center;
    font-size: 14px;
    z-index: 9999;
  `
  indicator.textContent = '📴 Você está offline. Algumas funcionalidades podem estar limitadas.'
  document.body.appendChild(indicator)
}

export function hideOfflineIndicator() {
  const indicator = document.getElementById('offline-indicator')
  if (indicator) {
    indicator.remove()
  }
}

// Monitor online/offline status
export function setupOnlineStatusMonitor() {
  window.addEventListener('online', () => {
    hideOfflineIndicator()
    console.log('✅ Conectado à internet')
  })

  window.addEventListener('offline', () => {
    showOfflineIndicator()
    console.log('📴 Desconectado da internet')
  })

  // Initial check
  if (!navigator.onLine) {
    showOfflineIndicator()
  }
}
