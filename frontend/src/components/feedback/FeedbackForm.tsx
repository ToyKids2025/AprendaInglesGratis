/**
 * FEEDBACK FORM COMPONENT
 * Collects user feedback, bug reports, and feature requests
 */

import { useState } from 'react'
import { Send, Bug, Lightbulb, MessageCircle, Star } from 'lucide-react'
import { api } from '../../services/api'

interface FeedbackFormProps {
  onSuccess?: () => void
  onClose?: () => void
}

export default function FeedbackForm({ onSuccess, onClose }: FeedbackFormProps) {
  const [type, setType] = useState<'bug' | 'feature' | 'improvement' | 'general'>('general')
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)

    try {
      // Collect system info
      const systemInfo = {
        browser: navigator.userAgent,
        device: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        os: navigator.platform,
      }

      await api.post('/api/feedback', {
        type,
        category: category || undefined,
        title,
        description,
        rating: rating > 0 ? rating : undefined,
        ...systemInfo,
      })

      // Success
      if (onSuccess) onSuccess()
      if (onClose) onClose()

      // Reset form
      setTitle('')
      setDescription('')
      setRating(0)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: 'bug', label: 'Bug / Erro', icon: Bug, color: 'text-red-600' },
    { value: 'feature', label: 'Nova Funcionalidade', icon: Lightbulb, color: 'text-yellow-600' },
    { value: 'improvement', label: 'Melhoria', icon: Star, color: 'text-blue-600' },
    { value: 'general', label: 'Geral', icon: MessageCircle, color: 'text-gray-600' },
  ]

  const categoryOptions = [
    { value: 'ui', label: 'Interface/Design' },
    { value: 'performance', label: 'Performance' },
    { value: 'content', label: 'Conteúdo/Frases' },
    { value: 'audio', label: 'Áudio/Voz' },
    { value: 'other', label: 'Outro' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Enviar Feedback</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Feedback *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value as any)}
                className={`p-4 rounded-lg border-2 transition ${
                  type === option.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <option.icon className={`w-5 h-5 ${option.color}`} />
                  <span className="font-medium text-gray-900">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Selecione uma categoria</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Descreva brevemente o problema ou sugestão"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/200</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva em detalhes o que aconteceu, o que você esperava, e como podemos reproduzir (se for um bug)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows={6}
            required
            maxLength={5000}
          />
          <p className="text-xs text-gray-500 mt-1">{description.length}/5000</p>
        </div>

        {/* Rating (for general feedback) */}
        {type === 'general' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Como você avalia sua experiência?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Feedback
              </>
            )}
          </button>
        </div>
      </form>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Seu feedback é anônimo (a menos que você esteja logado). Não coletamos informações pessoais
        além das necessárias para resolver o problema.
      </p>
    </div>
  )
}
