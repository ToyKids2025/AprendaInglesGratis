/**
 * ADMIN MONITORING PAGE
 * System health, errors, and performance monitoring
 */

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Activity,
  Database,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Zap,
} from 'lucide-react'
import { api } from '../services/api'

interface ErrorLog {
  id: string
  type: string
  severity: string
  message: string
  endpoint?: string
  method?: string
  userId?: string
  user?: {
    name?: string
    email: string
  }
  resolved: boolean
  createdAt: string
}

interface ErrorStats {
  total: number
  recent: number
  resolved: number
  unresolved: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
}

interface PerformanceMetric {
  id: string
  endpoint: string
  method: string
  duration: number
  statusCode: number
  isSlow: boolean
  createdAt: string
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical'
  uptime: number
  memory: {
    total: number
    used: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  database: {
    connected: boolean
    responseTime: number
  }
  application: {
    activeUsers: number
    requestsPerMin: number
    errorsPerMin: number
  }
}

type TabType = 'health' | 'errors' | 'performance'

export default function AdminMonitoring() {
  const [activeTab, setActiveTab] = useState<TabType>('health')
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null)
  const [performance, setPerformance] = useState<PerformanceMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [activeTab])

  const loadData = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'health') {
        const response = await api.get('/api/monitoring/health')
        if (response.data.success) {
          setHealth(response.data.health)
        }
      } else if (activeTab === 'errors') {
        const [errorsRes, statsRes] = await Promise.all([
          api.get('/api/monitoring/errors', { params: { limit: 50 } }),
          api.get('/api/monitoring/errors/stats'),
        ])
        if (errorsRes.data.success) setErrors(errorsRes.data.errors)
        if (statsRes.data.success) setErrorStats(statsRes.data.stats)
      } else if (activeTab === 'performance') {
        const response = await api.get('/api/monitoring/performance', {
          params: { limit: 50 },
        })
        if (response.data.success) {
          setPerformance(response.data.metrics)
        }
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resolveError = async (id: string) => {
    try {
      await api.patch(`/api/monitoring/errors/${id}`, { resolved: true })
      loadData()
    } catch (error) {
      console.error('Failed to resolve error:', error)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[severity] || colors.medium
  }

  const getHealthColor = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[status] || colors.healthy
  }

  if (isLoading && !health && !errors.length && !performance.length) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
          <p className="text-gray-600">Monitor system health, errors, and performance</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('health')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'health'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity className="w-5 h-5 inline-block mr-2" />
              System Health
            </button>
            <button
              onClick={() => setActiveTab('errors')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'errors'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertTriangle className="w-5 h-5 inline-block mr-2" />
              Error Logs
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition ${
                activeTab === 'performance'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline-block mr-2" />
              Performance
            </button>
          </div>
        </div>

        {/* Health Tab */}
        {activeTab === 'health' && health && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">System Status</h2>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getHealthColor(health.status)}`}>
                  {health.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Uptime</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatUptime(health.uptime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Active Users</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {health.application.activeUsers}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Requests/min</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {health.application.requestsPerMin}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Errors/min</div>
                  <div className="text-2xl font-bold text-red-600">
                    {health.application.errorsPerMin}
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Usage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Memory */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Memory</h3>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Used</span>
                    <span className="font-semibold">
                      {health.memory.used} MB / {health.memory.total} MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        health.memory.percentage > 80
                          ? 'bg-red-600'
                          : health.memory.percentage > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${health.memory.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {health.memory.percentage.toFixed(1)}%
                </div>
              </div>

              {/* CPU */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">CPU</h3>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Load Average</span>
                    <span className="font-semibold">{health.cpu.cores} cores</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        health.cpu.usage > health.cpu.cores * 0.8
                          ? 'bg-red-600'
                          : health.cpu.usage > health.cpu.cores * 0.6
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{
                        width: `${Math.min((health.cpu.usage / health.cpu.cores) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {health.cpu.usage.toFixed(2)}
                </div>
              </div>

              {/* Database */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Database</h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    {health.database.connected ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {health.database.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">Response Time</div>
                <div className="text-2xl font-bold text-gray-900">
                  {health.database.responseTime}ms
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Errors Tab */}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            {/* Error Stats */}
            {errorStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{errorStats.total}</div>
                  <div className="text-sm text-gray-600">Total Errors</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{errorStats.unresolved}</div>
                  <div className="text-sm text-gray-600">Unresolved</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{errorStats.resolved}</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{errorStats.recent}</div>
                  <div className="text-sm text-gray-600">Last 24h</div>
                </div>
              </div>
            )}

            {/* Error List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {errors.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No errors found</div>
                ) : (
                  errors.map((error) => (
                    <div key={error.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(error.severity)}`}>
                              {error.severity}
                            </span>
                            <span className="text-xs text-gray-500">{error.type}</span>
                            {error.endpoint && (
                              <span className="text-xs font-mono text-gray-600">
                                {error.method} {error.endpoint}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{error.message}</h3>
                          <p className="text-sm text-gray-500">
                            {error.user?.email || 'System'} •{' '}
                            {new Date(error.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!error.resolved && (
                          <button
                            onClick={() => resolveError(error.id)}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition text-sm"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No performance data
                        </td>
                      </tr>
                    ) : (
                      performance.map((metric) => (
                        <tr key={metric.id} className={metric.isSlow ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {metric.endpoint}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {metric.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-semibold ${
                                metric.isSlow ? 'text-red-600' : 'text-gray-900'
                              }`}
                            >
                              {metric.duration}ms
                              {metric.isSlow && (
                                <Zap className="w-4 h-4 inline-block ml-1 text-red-600" />
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                metric.statusCode >= 500
                                  ? 'bg-red-100 text-red-800'
                                  : metric.statusCode >= 400
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {metric.statusCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(metric.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
