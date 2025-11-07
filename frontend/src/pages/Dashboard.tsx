import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import authService from '../services/auth.service'
import { Trophy, Flame, Zap, BookOpen, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    // TODO: Fetch user stats from API
    // For now, use mock data
    setStats({
      phrasesCompleted: 25,
      totalPhrases: 100,
      xp: user?.xp || 0,
      level: user?.level || 1,
      streak: user?.streak || 0,
      achievements: 2,
    })
  }, [user])

  const handleLogout = async () => {
    await authService.logout()
    logout()
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const progressPercentage = (stats.phrasesCompleted / stats.totalPhrases) * 100

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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, {user?.name || 'Aluno'}!
          </h1>
          <p className="text-gray-600">Continue sua jornada para a fluência</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Zap className="w-8 h-8" />}
            value={stats.xp}
            label="XP Total"
            color="text-yellow-600"
            bgColor="bg-yellow-50"
          />
          <StatCard
            icon={<Flame className="w-8 h-8" />}
            value={stats.streak}
            label="Dias de Sequência"
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            value={stats.achievements}
            label="Conquistas"
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<BookOpen className="w-8 h-8" />}
            value={`${stats.phrasesCompleted}/${stats.totalPhrases}`}
            label="Frases Aprendidas"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Seu Progresso - Level 1</h2>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {stats.phrasesCompleted} de {stats.totalPhrases} frases
              </span>
              <span className="text-sm font-medium text-primary-600">
                {progressPercentage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Continue estudando para completar o Level 1!
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/lessons"
            className="bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-xl p-8 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Continuar Estudando</h3>
                <p className="text-primary-100">Praticar frases do Level 1</p>
              </div>
              <BookOpen className="w-12 h-12 group-hover:scale-110 transition" />
            </div>
            <div className="text-sm text-primary-200">
              Você tem {stats.totalPhrases - stats.phrasesCompleted} frases novas para aprender
            </div>
          </Link>

          <Link
            to="/conversation"
            className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-xl p-8 hover:shadow-lg transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">🤖 Conversar com IA</h3>
                <p className="text-green-100">Pratique inglês com IA 24/7</p>
              </div>
              <Zap className="w-12 h-12 group-hover:scale-110 transition" />
            </div>
            <div className="text-sm text-green-200">
              ✨ NOVO! Converse em inglês com inteligência artificial
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color,
  bgColor,
}: {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`${bgColor} ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
