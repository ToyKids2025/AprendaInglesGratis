/**
 * ADMIN PANEL
 * Painel de controle para gerenciar conteúdo, usuários e estatísticas
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  DollarSign,
  BarChart3,
  FileText,
  Zap,
} from 'lucide-react'
import { api } from '../services/api'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalPhrases: number
  totalCategories: number
  premiumUsers: number
  revenue: number
  avgDailyXP: number
  completionRate: number
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPhrases: 0,
    totalCategories: 0,
    premiumUsers: 0,
    revenue: 0,
    avgDailyXP: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'analytics'>('overview')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Simulated data for now
      // TODO: Create admin endpoints in backend
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        totalPhrases: 100,
        totalCategories: 80,
        premiumUsers: 324,
        revenue: 12960,
        avgDailyXP: 245,
        completionRate: 68,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-primary-700">Admin Panel</h1>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<BarChart3 className="w-5 h-5" />}
          >
            Overview
          </TabButton>
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users className="w-5 h-5" />}
          >
            Usuários
          </TabButton>
          <TabButton
            active={activeTab === 'content'}
            onClick={() => setActiveTab('content')}
            icon={<BookOpen className="w-5 h-5" />}
          >
            Conteúdo
          </TabButton>
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<TrendingUp className="w-5 h-5" />}
          >
            Analytics
          </TabButton>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Users className="w-8 h-8" />}
                value={stats.totalUsers.toLocaleString()}
                label="Total Usuários"
                trend="+12% este mês"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={<Zap className="w-8 h-8" />}
                value={stats.activeUsers.toLocaleString()}
                label="Usuários Ativos"
                trend={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}% taxa`}
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatCard
                icon={<DollarSign className="w-8 h-8" />}
                value={`R$ ${stats.revenue.toLocaleString()}`}
                label="Receita Mensal"
                trend="+18% este mês"
                color="text-purple-600"
                bgColor="bg-purple-50"
              />
              <StatCard
                icon={<BookOpen className="w-8 h-8" />}
                value={stats.totalPhrases.toLocaleString()}
                label="Frases Totais"
                trend={`${stats.totalCategories} categorias`}
                color="text-orange-600"
                bgColor="bg-orange-50"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <ActionCard
                title="Gerar Frases com IA"
                description="Use o script para criar novas frases"
                icon={<Zap className="w-8 h-8" />}
                buttonText="Executar Script"
                onClick={() => alert('Executar: cd backend && tsx scripts/generate-phrases.ts')}
              />
              <ActionCard
                title="Gerenciar Categorias"
                description="Adicionar, editar ou remover categorias"
                icon={<FileText className="w-8 h-8" />}
                buttonText="Ver Categorias"
                onClick={() => setActiveTab('content')}
              />
              <ActionCard
                title="Ver Relatórios"
                description="Analytics e métricas detalhadas"
                icon={<BarChart3 className="w-8 h-8" />}
                buttonText="Ver Analytics"
                onClick={() => setActiveTab('analytics')}
              />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciar Usuários</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total de Usuários</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Premium</p>
                <p className="text-3xl font-bold text-green-900">{stats.premiumUsers}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Free</p>
                <p className="text-3xl font-bold text-orange-900">
                  {stats.totalUsers - stats.premiumUsers}
                </p>
              </div>
            </div>
            <p className="text-gray-600">
              💡 Funcionalidade completa em desenvolvimento. Use Prisma Studio para gerenciar usuários.
            </p>
            <code className="block mt-4 p-3 bg-gray-100 rounded text-sm">
              cd backend && npm run prisma:studio
            </code>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciar Conteúdo</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📊 Estatísticas de Conteúdo</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total de Frases:</span>
                    <span className="ml-2 font-semibold">{stats.totalPhrases}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Categorias:</span>
                    <span className="ml-2 font-semibold">{stats.totalCategories}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Meta:</span>
                    <span className="ml-2 font-semibold">10.000 frases</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Progresso:</span>
                    <span className="ml-2 font-semibold">
                      {((stats.totalPhrases / 10000) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🤖 Gerar Novas Frases</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Execute o script para gerar frases usando IA
                </p>
                <code className="block p-3 bg-gray-100 rounded text-sm mb-3">
                  cd backend && tsx scripts/generate-phrases.ts 1 2
                </code>
                <p className="text-xs text-gray-500">
                  Argumentos: números dos níveis (1-8). Ex: 1 2 para níveis 1 e 2
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📝 Editar Banco de Dados</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Use Prisma Studio para editar frases, categorias e níveis
                </p>
                <code className="block p-3 bg-gray-100 rounded text-sm">
                  cd backend && npm run prisma:studio
                </code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics & Métricas</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Engajamento</h3>
                <div className="space-y-3">
                  <MetricRow label="XP Médio Diário" value={stats.avgDailyXP} />
                  <MetricRow label="Taxa de Conclusão" value={`${stats.completionRate}%`} />
                  <MetricRow
                    label="Usuários Ativos"
                    value={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}%`}
                  />
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Financeiro</h3>
                <div className="space-y-3">
                  <MetricRow label="MRR" value={`R$ ${stats.revenue.toLocaleString()}`} />
                  <MetricRow
                    label="Conversão Premium"
                    value={`${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%`}
                  />
                  <MetricRow
                    label="Ticket Médio"
                    value={`R$ ${(stats.revenue / stats.premiumUsers).toFixed(2)}`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Em breve:</strong> Gráficos detalhados, exportação de relatórios, e
                analytics em tempo real
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Components
function StatCard({
  icon,
  value,
  label,
  trend,
  color,
  bgColor,
}: {
  icon: React.ReactNode
  value: string
  label: string
  trend: string
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <div className={`inline-flex p-3 rounded-lg ${bgColor} ${color} mb-4`}>{icon}</div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <p className="text-green-600 text-xs font-medium">{trend}</p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
        active
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function ActionCard({
  title,
  description,
  icon,
  buttonText,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  buttonText: string
  onClick: () => void
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <button
        onClick={onClick}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
      >
        {buttonText}
      </button>
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  )
}
