/**
 * ADMIN FEEDBACK PAGE
 * Manage user feedback, bug reports, and surveys
 */

import { useState, useEffect } from 'react'
import { Bug, Lightbulb, MessageCircle, Star, CheckCircle, Clock, XCircle } from 'lucide-react'
import { api } from '../services/api'

interface Feedback {
  id: string
  type: string
  category?: string
  title: string
  description: string
  rating?: number
  status: string
  priority: string
  createdAt: string
  user?: {
    name?: string
    email: string
    isPremium: boolean
  }
}

interface Stats {
  total: number
  recent: number
  averageRating: number
  byType: Record<string, number>
  byStatus: Record<string, number>
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    loadFeedback()
    loadStats()
  }, [filterType, filterStatus])

  const loadFeedback = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (filterType) params.type = filterType
      if (filterStatus) params.status = filterStatus

      const response = await api.get('/api/feedback/admin/all', { params })
      if (response.data.success) {
        setFeedback(response.data.feedback)
      }
    } catch (error) {
      console.error('Failed to load feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await api.get('/api/feedback/admin/stats')
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const updateStatus = async (id: string, status: string, priority?: string) => {
    try {
      const response = await api.patch(`/api/feedback/admin/${id}`, {
        status,
        priority,
      })

      if (response.data.success) {
        loadFeedback()
        loadStats()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <Bug className="w-5 h-5 text-red-600" />
      case 'feature':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />
      case 'improvement':
        return <Star className="w-5 h-5 text-blue-600" />
      default:
        return <MessageCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      planned: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.new}`}>
        {status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-gray-500 text-white',
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[priority] || styles.medium}`}>
        {priority}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Bug Reports</h1>
          <p className="text-gray-600">Gerencie feedback dos usuários e resolva problemas</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Feedback</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
              <div className="text-sm text-gray-600">Últimos 7 dias</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                {stats.averageRating.toFixed(1)}
                <Star className="w-5 h-5" />
              </div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-red-600">{stats.byType.bug || 0}</div>
              <div className="text-sm text-gray-600">Bugs Reportados</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos os tipos</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="improvement">Improvement</option>
            <option value="general">General</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos os status</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {feedback.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Nenhum feedback encontrado
              </div>
            ) : (
              feedback.map((item) => (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedFeedback(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(item.type)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">
                          {item.user?.email || 'Anonymous'} •{' '}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(item.id, 'reviewing')
                      }}
                      className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                    >
                      Em revisão
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(item.id, 'completed')
                      }}
                      className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                    >
                      Concluído
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStatus(item.id, 'rejected')
                      }}
                      className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
