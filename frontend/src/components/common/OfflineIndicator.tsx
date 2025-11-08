/**
 * OFFLINE INDICATOR COMPONENT
 * Shows connection status and offline mode notification
 */

import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowNotification(true)

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowNotification(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show anything if online and no recent status change
  if (isOnline && !showNotification) {
    return null
  }

  return (
    <>
      {/* Persistent offline banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4 text-center text-sm shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Você está offline. Algumas funcionalidades podem não estar disponíveis.</span>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {showNotification && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl transition-all duration-300 transform ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          } ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Conexão restaurada!</p>
                  <p className="text-sm opacity-90">Você está online novamente.</p>
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Sem conexão</p>
                  <p className="text-sm opacity-90">Modo offline ativado.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
