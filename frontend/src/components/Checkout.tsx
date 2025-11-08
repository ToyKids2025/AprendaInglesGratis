/**
 * CHECKOUT COMPONENT
 * Handles Stripe checkout session creation
 */

import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface CheckoutProps {
  plan: 'monthly' | 'yearly'
  buttonText?: string
  buttonClass?: string
}

export default function Checkout({ plan, buttonText, buttonClass }: CheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, isAuthenticated } = useAuthStore()

  const handleCheckout = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      // Redirect to register with return URL
      window.location.href = `/register?redirect=/pricing&plan=${plan}`
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar sessão de pagamento')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={
          buttonClass ||
          'w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          buttonText || 'Assinar Agora'
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Erro ao processar pagamento</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
