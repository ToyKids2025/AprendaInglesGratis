/**
 * ADMIN DASHBOARD PAGE
 * Main admin page with analytics and management tools
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  BarChart3,
  Loader2,
  AlertCircle,
  Crown,
  Mail,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface Analytics {
  summary: {
    totalUsers: number
    premiumUsers: number
    freeUsers: number
    conversionRate: string
    recentUsers: number
    activeUsers: number
    totalProgress: number
    totalAchievements: number
    newsletterSubscribers: number
  }
  revenue: {
    total: number
    transactions: number
    average: string
    byMonth: Array<{
      month: string
      revenue: number
      count: number
    }>
  }
  growth: {
    userGrowth: Array<{
      date: string
      count: number
    }>
  }
  leaderboard: {
    topUsers: Array<{
      id: string
      name: string
      email: string
      xp: number
      level: number
      streak: number
    }>
  }
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/analytics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Você não tem permissão para acessar esta área')
        }
        throw new Error('Erro ao carregar analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 max-w-md">
          <div className="flex items-start gap-3 text-red-600">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-lg">Erro de Acesso</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const { summary, revenue, leaderboard } = analytics

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Visão geral da plataforma English Flow
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary.totalUsers.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  +{summary.recentUsers} últimos 30 dias
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Premium Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Premium</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary.premiumUsers.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {summary.conversionRate}% conversão
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  R$ {Number(revenue.total).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {revenue.transactions} transações
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary.activeUsers.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500 mt-1">Últimos 7 dias</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition text-left"
          >
            <Users className="w-10 h-10 text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciar Usuários
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ver, editar e gerenciar todos os usuários
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition text-left"
          >
            <BarChart3 className="w-10 h-10 text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Analytics Detalhado
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ver gráficos e estatísticas avançadas
            </p>
          </button>

          <button
            onClick={() => navigate('/admin/content')}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition text-left"
          >
            <Award className="w-10 h-10 text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">
              Gerenciar Conteúdo
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Frases, conquistas e níveis
            </p>
          </button>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top 10 Usuários (XP)
            </h3>
            <div className="space-y-3">
              {leaderboard.topUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        Nível {user.level} • {user.streak} dias streak
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-purple-600">
                    {user.xp.toLocaleString('pt-BR')} XP
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estatísticas Gerais
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total de Progresso</span>
                <span className="font-semibold text-gray-900">
                  {summary.totalProgress.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conquistas Desbloqueadas</span>
                <span className="font-semibold text-gray-900">
                  {summary.totalAchievements.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Inscritos Newsletter
                </span>
                <span className="font-semibold text-gray-900">
                  {summary.newsletterSubscribers.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ticket Médio</span>
                <span className="font-semibold text-gray-900">
                  R$ {revenue.average}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
