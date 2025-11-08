/**
 * ADMIN CONTENT PAGE
 * AI-powered phrase generation and content management
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Loader2,
  Save,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface Category {
  id: number
  name: string
  level: {
    name: string
    number: number
  }
  _count: {
    phrases: number
  }
}

interface GeneratedPhrase {
  en: string
  pt: string
  tip?: string
  difficulty: number
}

export default function AdminContent() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [level, setLevel] = useState('beginner')
  const [difficulty, setDifficulty] = useState('3')
  const [count, setCount] = useState('10')
  const [context, setContext] = useState('')

  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatedPhrases, setGeneratedPhrases] = useState<GeneratedPhrase[]>([])
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const { token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/categories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setMessage(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/phrases/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            category: categories.find(c => c.id.toString() === selectedCategory)?.name || 'General',
            level,
            difficulty: parseInt(difficulty),
            count: parseInt(count),
            context: context || undefined,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao gerar frases')
      }

      setGeneratedPhrases(data.phrases)
      setMessage({ type: 'success', text: data.message })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!selectedCategory) {
      setMessage({ type: 'error', text: 'Selecione uma categoria' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/phrases/batch-create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            categoryId: parseInt(selectedCategory),
            phrases: generatedPhrases,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar frases')
      }

      setMessage({ type: 'success', text: data.message })
      setGeneratedPhrases([])
      fetchCategories() // Refresh counts
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Gerador de Frases com IA
              </h1>
              <p className="text-gray-600 mt-1">
                Use IA para gerar frases de estudo rapidamente
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Voltar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Generation Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configuração da Geração
          </h2>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.level.name} - {cat.name} ({cat._count.phrases} frases)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nível
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="beginner">Iniciante</option>
                <option value="intermediate">Intermediário</option>
                <option value="advanced">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dificuldade (1-5)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade (máx. 50)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contexto/Tema (opcional)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: conversas telefônicas, viagens, restaurantes..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Frases com IA
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Generated Phrases */}
        {generatedPhrases.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Frases Geradas ({generatedPhrases.length})
              </h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Todas
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {generatedPhrases.map((phrase, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{phrase.en}</p>
                      <p className="text-gray-600 text-sm mt-1">{phrase.pt}</p>
                      {phrase.tip && (
                        <p className="text-purple-600 text-xs mt-2">
                          💡 {phrase.tip}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Dif. {phrase.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
