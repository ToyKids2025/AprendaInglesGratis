/**
 * ADVANCED SEARCH PAGE
 * Powerful filtering and content discovery
 */

import { useState, useEffect } from 'react'
import { Search, Filter, Save, X, Tag, Folder, Target, Users as SituationIcon } from 'lucide-react'
import { api } from '../services/api'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  phraseCount: number
}

interface Tag {
  id: string
  name: string
  usageCount: number
}

interface Topic {
  id: string
  name: string
  icon?: string
  level?: string
}

interface Situation {
  id: string
  name: string
  formality?: string
  setting?: string
}

interface Phrase {
  id: string
  english: string
  portuguese: string
  level: string
  difficulty: string
}

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedSituations, setSelectedSituations] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [situations, setSituations] = useState<Situation[]>([])

  const [results, setResults] = useState<Phrase[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadFilters()
  }, [])

  const loadFilters = async () => {
    try {
      const [categoriesRes, tagsRes, topicsRes, situationsRes] = await Promise.all([
        api.get('/api/content/categories'),
        api.get('/api/content/tags'),
        api.get('/api/content/topics'),
        api.get('/api/content/situations'),
      ])

      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories)
      if (tagsRes.data.success) setTags(tagsRes.data.tags)
      if (topicsRes.data.success) setTopics(topicsRes.data.topics)
      if (situationsRes.data.success) setSituations(situationsRes.data.situations)
    } catch (error) {
      console.error('Failed to load filters:', error)
    }
  }

  const handleSearch = async () => {
    setIsLoading(true)
    try {
      const response = await api.post('/api/content/search', {
        query: searchQuery || undefined,
        categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined,
        topicIds: selectedTopics.length > 0 ? selectedTopics : undefined,
        situationIds: selectedSituations.length > 0 ? selectedSituations : undefined,
        level: selectedLevel || undefined,
        difficulty: selectedDifficulty || undefined,
        limit: 50,
      })

      if (response.data.success) {
        setResults(response.data.phrases)
        setTotal(response.data.total)
      }
    } catch (error) {
      console.error('Failed to search:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setSelectedTags([])
    setSelectedTopics([])
    setSelectedSituations([])
    setSelectedLevel('')
    setSelectedDifficulty('')
    setResults([])
    setTotal(0)
  }

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedTags.length > 0 ||
    selectedTopics.length > 0 ||
    selectedSituations.length > 0 ||
    selectedLevel ||
    selectedDifficulty

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Search className="w-8 h-8 text-primary-600" />
            Busca Avançada
          </h1>
          <p className="text-gray-600">Encontre exatamente o que você precisa aprender</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Pesquisar frases em inglês ou português..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
                showFilters
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && !showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategories.map((id) => {
                const cat = categories.find((c) => c.id === id)
                return (
                  <span
                    key={id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                  >
                    <Folder className="w-4 h-4" />
                    {cat?.name}
                    <button
                      onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== id))}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
              {selectedTags.map((id) => {
                const tag = tags.find((t) => t.id === id)
                return (
                  <span
                    key={id}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                  >
                    <Tag className="w-4 h-4" />
                    {tag?.name}
                    <button
                      onClick={() => setSelectedTags(selectedTags.filter((t) => t !== id))}
                      className="hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )
              })}
              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200"
              >
                Limpar todos
              </button>
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  Categorias
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id])
                          } else {
                            setSelectedCategories(selectedCategories.filter((c) => c !== category.id))
                          }
                        }}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category.icon} {category.name} ({category.phraseCount})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Tópicos
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {topics.slice(0, 20).map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(topic.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTopics([...selectedTopics, topic.id])
                          } else {
                            setSelectedTopics(selectedTopics.filter((t) => t !== topic.id))
                          }
                        }}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {topic.icon} {topic.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tags.slice(0, 20).map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id])
                          } else {
                            setSelectedTags(selectedTags.filter((t) => t !== tag.id))
                          }
                        }}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level & Difficulty */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Nível & Dificuldade</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Nível</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Todos</option>
                      <option value="beginner">Iniciante</option>
                      <option value="intermediate">Intermediário</option>
                      <option value="advanced">Avançado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Dificuldade</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Todas</option>
                      <option value="easy">Fácil</option>
                      <option value="medium">Média</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Limpar Filtros
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {total} {total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </h2>
              <button className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition flex items-center gap-2">
                <Save className="w-4 h-4" />
                Salvar Busca
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {results.map((phrase) => (
                <div key={phrase.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900 mb-1">{phrase.english}</div>
                      <div className="text-gray-600">{phrase.portuguese}</div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {phrase.level}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                        {phrase.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && results.length === 0 && hasActiveFilters && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum resultado encontrado</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
