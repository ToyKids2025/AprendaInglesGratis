import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import authService from '../services/auth.service'
import { useAuthStore } from '../store/authStore'

interface Category {
  id: number
  name: string
  slug: string
  icon: string
  description: string
  phrasesCount: number
  completed: number
}

export default function Lessons() {
  const { logout } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from API
    // Mock data for now
    setTimeout(() => {
      setCategories([
        { id: 1, name: 'Greetings & Introductions', slug: 'greetings', icon: '👋', description: 'Saudações e apresentações', phrasesCount: 10, completed: 5 },
        { id: 2, name: 'Restaurant & Food', slug: 'restaurant', icon: '🍽️', description: 'Restaurante e comida', phrasesCount: 10, completed: 3 },
        { id: 3, name: 'Airport & Travel', slug: 'airport', icon: '✈️', description: 'Aeroporto e viagens', phrasesCount: 10, completed: 0 },
        { id: 4, name: 'Hotel Check-in/out', slug: 'hotel', icon: '🏨', description: 'Hotel entrada/saída', phrasesCount: 10, completed: 0 },
        { id: 5, name: 'Shopping & Prices', slug: 'shopping', icon: '🛍️', description: 'Compras e preços', phrasesCount: 10, completed: 0 },
        { id: 6, name: 'Directions & Location', slug: 'directions', icon: '🗺️', description: 'Direções e localização', phrasesCount: 10, completed: 0 },
        { id: 7, name: 'Emergency & Help', slug: 'emergency', icon: '🚨', description: 'Emergência e ajuda', phrasesCount: 10, completed: 0 },
        { id: 8, name: 'Asking for Help', slug: 'help', icon: '🙋', description: 'Pedindo ajuda', phrasesCount: 10, completed: 0 },
        { id: 9, name: 'Numbers & Time', slug: 'numbers', icon: '🕐', description: 'Números e horários', phrasesCount: 10, completed: 0 },
        { id: 10, name: 'Survival Phrases', slug: 'survival', icon: '🆘', description: 'Frases essenciais', phrasesCount: 10, completed: 0 },
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const handleLogout = async () => {
    await authService.logout()
    logout()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-700">
            English Flow
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Level 1: Survival English
          </h1>
          <p className="text-gray-600">
            100 frases essenciais para sobrevivência - Escolha uma categoria para começar
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const progressPercentage = (category.completed / category.phrasesCount) * 100

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{category.icon}</div>
                  <div className="text-sm text-gray-500">
                    {category.completed}/{category.phrasesCount}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {category.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition font-semibold">
                  {category.completed === 0 ? 'Começar' : 'Continuar'}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
