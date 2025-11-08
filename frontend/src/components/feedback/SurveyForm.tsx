/**
 * SURVEY FORM COMPONENT
 * NPS and satisfaction surveys
 */

import { useState } from 'react'
import { Send, ThumbsUp, ThumbsDown } from 'lucide-react'
import { api } from '../../services/api'

interface SurveyFormProps {
  type: 'nps' | 'weekly' | 'onboarding' | 'cancellation'
  onComplete?: () => void
}

export default function SurveyForm({ type, onComplete }: SurveyFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      const response = await api.post('/api/feedback/survey', {
        surveyType: type,
        responses,
        npsScore,
      })

      if (response.data.success) {
        if (onComplete) onComplete()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao enviar pesquisa')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateResponse = (key: string, value: any) => {
    setResponses((prev) => ({ ...prev, [key]: value }))
  }

  // NPS Survey
  if (type === 'nps') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Ajude-nos a melhorar! 🌟
        </h3>

        <p className="text-gray-600 mb-6">
          Em uma escala de 0 a 10, o quanto você recomendaria o English Flow para um amigo?
        </p>

        {/* NPS Scale */}
        <div className="mb-6">
          <div className="grid grid-cols-11 gap-1 mb-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
              <button
                key={score}
                onClick={() => setNpsScore(score)}
                className={`aspect-square rounded-lg border-2 font-bold transition ${
                  npsScore === score
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Nada provável</span>
            <span>Muito provável</span>
          </div>
        </div>

        {/* Follow-up question */}
        {npsScore !== null && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Por que você deu esta nota?
            </label>
            <textarea
              value={responses.reason || ''}
              onChange={(e) => updateResponse('reason', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={4}
              placeholder="Conte-nos o que você pensa..."
            />
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={npsScore === null || isSubmitting}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar (Ganhe 50 XP!)
            </>
          )}
        </button>
      </div>
    )
  }

  // Weekly Satisfaction Survey
  if (type === 'weekly') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Como foi sua semana? 📅
        </h3>

        {/* Question 1 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Você conseguiu estudar quantas vezes esta semana?
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['0-1', '2-3', '4-5', '6-7'].map((option) => (
              <button
                key={option}
                onClick={() => updateResponse('studyDays', option)}
                className={`p-3 rounded-lg border-2 transition ${
                  responses.studyDays === option
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Como você se sente sobre seu progresso?
          </label>
          <div className="space-y-2">
            {[
              { value: 'great', label: 'Ótimo! Estou avançando', icon: '🎉' },
              { value: 'good', label: 'Bom, mas pode melhorar', icon: '👍' },
              { value: 'slow', label: 'Lento demais', icon: '🐌' },
              { value: 'stuck', label: 'Travado/sem progresso', icon: '😔' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => updateResponse('progress', option.value)}
                className={`w-full p-3 rounded-lg border-2 transition text-left ${
                  responses.progress === option.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O que poderia ajudar você a estudar mais?
          </label>
          <textarea
            value={responses.suggestions || ''}
            onChange={(e) => updateResponse('suggestions', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Suas sugestões..."
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!responses.studyDays || !responses.progress || isSubmitting}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar (Ganhe 50 XP!)
            </>
          )}
        </button>
      </div>
    )
  }

  // Onboarding Survey
  if (type === 'onboarding') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Bem-vindo! Conte-nos sobre você 👋
        </h3>

        {/* English Level */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Qual seu nível atual de inglês?
          </label>
          <div className="space-y-2">
            {[
              'Iniciante (quase nada)',
              'Básico (frases simples)',
              'Intermediário (conversar básico)',
              'Avançado (quase fluente)',
              'Fluente',
            ].map((level) => (
              <button
                key={level}
                onClick={() => updateResponse('englishLevel', level)}
                className={`w-full p-3 rounded-lg border-2 transition text-left ${
                  responses.englishLevel === level
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Qual seu principal objetivo?
          </label>
          <div className="space-y-2">
            {[
              'Viajar',
              'Trabalho/carreira',
              'Estudos/escola',
              'Hobby/interesse pessoal',
              'Exames (TOEFL, IELTS)',
            ].map((goal) => (
              <button
                key={goal}
                onClick={() => updateResponse('goal', goal)}
                className={`w-full p-3 rounded-lg border-2 transition text-left ${
                  responses.goal === goal
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!responses.englishLevel || !responses.goal || isSubmitting}
          className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
        >
          {isSubmitting ? 'Salvando...' : 'Começar a Aprender!'}
        </button>
      </div>
    )
  }

  return null
}
