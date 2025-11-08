/**
 * PWA INSTALL PROMPT COMPONENT
 * Prompts users to install the app on their device
 */

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone

    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Don't show prompt if already installed
    if (isInStandaloneMode) {
      return
    }

    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

    // Show again after 7 days
    if (daysSinceDismissed < 7) {
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay (better UX)
      setTimeout(() => {
        setShowPrompt(true)
      }, 10000) // Show after 10 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show manual instructions after delay
    if (iOS && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 15000) // Show after 15 seconds on iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if already installed or dismissed
  if (!showPrompt || isStandalone) {
    return null
  }

  // iOS instructions
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-xl shadow-2xl p-4 max-w-sm mx-auto border-2 border-primary-500">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-primary-100 p-3 rounded-full">
            <Smartphone className="w-6 h-6 text-primary-600" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-2">
              Instalar English Flow
            </h3>

            <p className="text-sm text-gray-600 mb-3">
              Instale o app para uma experiência melhor e acesso offline!
            </p>

            <div className="bg-primary-50 p-3 rounded-lg text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Como instalar:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Toque no ícone de compartilhar <span className="inline-block">📤</span></li>
                <li>Role e toque em "Adicionar à Tela de Início"</li>
                <li>Toque em "Adicionar"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-2xl p-4 max-w-md mx-auto text-white">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-full">
          <Download className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">
            Instalar English Flow
          </h3>
          <p className="text-sm text-white/90">
            Acesso rápido, notificações e modo offline!
          </p>
        </div>

        <button
          onClick={handleInstallClick}
          className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition text-sm whitespace-nowrap"
        >
          Instalar
        </button>
      </div>
    </div>
  )
}
