/**
 * SUBSCRIPTION MANAGEMENT COMPONENT
 * Displays subscription status and allows users to manage their subscription
 */

import { useState, useEffect } from 'react'
import { Calendar, CreditCard, Loader2, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface SubscriptionStatus {
  isPremium: boolean
  expiresAt: string | null
  isActive: boolean
}

export default function SubscriptionManagement() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/subscription-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar status')
      }

      setStatus(data)
    } catch (err: any) {
      console.error('Error fetching subscription status:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    setPortalLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao abrir portal')
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL do portal não recebida')
      }
    } catch (err: any) {
      console.error('Portal error:', err)
      setError(err.message || 'Erro ao abrir portal de pagamentos')
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 text-red-600">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar assinatura</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Assinatura</h2>
        {status.isActive && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Ativa
          </span>
        )}
      </div>

      {status.isActive ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Plano Premium</p>
              <p className="text-sm text-gray-600 mt-1">
                Você tem acesso completo a todos os recursos premium
              </p>
            </div>
          </div>

          {status.expiresAt && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Próxima cobrança</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(status.expiresAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={openCustomerPortal}
              disabled={portalLoading}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Abrindo portal...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Gerenciar Assinatura
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Atualize forma de pagamento, veja faturas ou cancele sua assinatura
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Plano Gratuito</p>
              <p className="text-sm text-gray-600 mt-1">
                Faça upgrade para Premium e tenha acesso ilimitado
              </p>
            </div>
          </div>

          <a
            href="/pricing"
            className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-all text-center"
          >
            Ver Planos Premium
          </a>
        </div>
      )}
    </div>
  )
}
