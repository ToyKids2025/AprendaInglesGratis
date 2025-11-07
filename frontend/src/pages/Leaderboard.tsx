/**
 * LEADERBOARD PAGE
 * Global ranking system for competitive learning
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Zap,
  Flame,
  Star,
  Award,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  level: number
  xp: number
  streak: number
  phrasesCompleted: number
  isCurrentUser: boolean
}

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [category, setCategory] = useState<'xp' | 'streak' | 'phrases'>('xp')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [timeframe, category])

  const loadLeaderboard = async () => {
    setLoading(true)

    // Mock data - TODO: Fetch from API
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        userId: '1',
        name: 'Carlos Silva',
        level: 5,
        xp: 15420,
        streak: 45,
        phrasesCompleted: 850,
        isCurrentUser: false,
      },
      {
        rank: 2,
        userId: '2',
        name: 'Ana Costa',
        level: 4,
        xp: 12350,
        streak: 32,
        phrasesCompleted: 720,
        isCurrentUser: false,
      },
      {
        rank: 3,
        userId: '3',
        name: 'Ricardo Moura',
        level: 4,
        xp: 11890,
        streak: 28,
        phrasesCompleted: 680,
        isCurrentUser: false,
      },
      {
        rank: 4,
        userId: user?.id || '4',
        name: user?.name || 'Você',
        level: user?.level || 1,
        xp: user?.xp || 0,
        streak: user?.streak || 0,
        phrasesCompleted: 100,
        isCurrentUser: true,
      },
      {
        rank: 5,
        userId: '5',
        name: 'Maria Santos',
        level: 3,
        xp: 8520,
        streak: 21,
        phrasesCompleted: 550,
        isCurrentUser: false,
      },
      {
        rank: 6,
        userId: '6',
        name: 'João Pedro',
        level: 3,
        xp: 7850,
        streak: 18,
        phrasesCompleted: 480,
        isCurrentUser: false,
      },
      {
        rank: 7,
        userId: '7',
        name: 'Patricia Lima',
        level: 3,
        xp: 7200,
        streak: 15,
        phrasesCompleted: 420,
        isCurrentUser: false,
      },
      {
        rank: 8,
        userId: '8',
        name: 'Lucas Oliveira',
        level: 2,
        xp: 5600,
        streak: 12,
        phrasesCompleted: 350,
        isCurrentUser: false,
      },
      {
        rank: 9,
        userId: '9',
        name: 'Fernanda Souza',
        level: 2,
        xp: 4890,
        streak: 10,
        phrasesCompleted: 290,
        isCurrentUser: false,
      },
      {
        rank: 10,
        userId: '10',
        name: 'Roberto Alves',
        level: 2,
        xp: 4200,
        streak: 8,
        phrasesCompleted: 250,
        isCurrentUser: false,
      },
    ]

    // Sort by selected category
    const sorted = [...mockData].sort((a, b) => {
      if (category === 'xp') return b.xp - a.xp
      if (category === 'streak') return b.streak - a.streak
      return b.phrasesCompleted - a.phrasesCompleted
    })

    // Update ranks
    sorted.forEach((entry, index) => {
      entry.rank = index + 1
    })

    setLeaderboard(sorted)
    setLoading(false)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Crown className="w-8 h-8 text-yellow-400" />
    if (rank === 2)
      return <Medal className="w-8 h-8 text-gray-400" />
    if (rank === 3)
      return <Medal className="w-8 h-8 text-orange-600" />
    return <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-600">{rank}</div>
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
    return 'bg-gray-100 text-gray-700'
  }

  const getCategoryIcon = () => {
    if (category === 'xp') return <Zap className="w-5 h-5" />
    if (category === 'streak') return <Flame className="w-5 h-5" />
    return <Star className="w-5 h-5" />
  }

  const getCategoryValue = (entry: LeaderboardEntry) => {
    if (category === 'xp') return `${entry.xp.toLocaleString()} XP`
    if (category === 'streak') return `${entry.streak} dias`
    return `${entry.phrasesCompleted} frases`
  }

  const currentUserEntry = leaderboard.find(e => e.isCurrentUser)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              Ranking Global
            </h1>
            <p className="text-primary-600">
              Compete com estudantes do mundo todo
            </p>
          </div>

          {/* User Stats Card */}
          {currentUserEntry && (
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl shadow-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm mb-1">Sua Posição</p>
                  <div className="flex items-center gap-3">
                    <div className="text-5xl font-bold">#{currentUserEntry.rank}</div>
                    <div>
                      <p className="text-2xl font-bold">{currentUserEntry.name}</p>
                      <p className="text-primary-200">Nível {currentUserEntry.level}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-2xl font-bold mb-2">
                    {getCategoryIcon()}
                    {getCategoryValue(currentUserEntry)}
                  </div>
                  <p className="text-primary-200 text-sm">Continue estudando para subir!</p>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <div className="flex gap-2">
                  {['today', 'week', 'month', 'all'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t as any)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        timeframe === t
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t === 'today' && 'Hoje'}
                      {t === 'week' && 'Semana'}
                      {t === 'month' && 'Mês'}
                      {t === 'all' && 'Geral'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'xp', label: 'XP', icon: '⚡' },
                    { id: 'streak', label: 'Streak', icon: '🔥' },
                    { id: 'phrases', label: 'Frases', icon: '⭐' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id as any)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition ${
                        category === c.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Top 10 Estudantes</h2>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Atualizado em tempo real</span>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-200">
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.userId}
                  className={`px-6 py-4 hover:bg-gray-50 transition ${
                    entry.isCurrentUser ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-lg font-bold text-gray-900 truncate">
                            {entry.name}
                          </p>
                          {entry.isCurrentUser && (
                            <span className="px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded">
                              VOCÊ
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Nível {entry.level} • {entry.phrasesCompleted} frases dominadas
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-xl font-bold text-primary-600 mb-1">
                          {getCategoryIcon()}
                          {getCategoryValue(entry)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {entry.streak}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-purple-500" />
                            Lvl {entry.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 text-center">
              <p className="text-sm text-gray-600">
                🏆 Estude diariamente para subir no ranking!
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Como funciona o ranking?
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Ganhe pontos completando frases e mantendo streaks</li>
              <li>• Compete por XP, sequências ou frases dominadas</li>
              <li>• Ranking atualizado em tempo real</li>
              <li>• Top 3 ganham badges especiais no perfil</li>
            </ul>
          </div>

          {/* Back button */}
          <div className="text-center mt-8">
            <Link
              to="/dashboard"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
