/**
 * ACHIEVEMENTS PAGE
 * Display all achievements and progress
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Zap,
  Flame,
  Star,
  Award,
  Crown,
  Target,
  TrendingUp,
  Lock,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  iconComponent: React.ReactNode
  requirement: number
  current: number
  unlocked: boolean
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  reward: string
}

export default function Achievements() {
  const { user } = useAuthStore()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => {
    // Mock achievements data
    // TODO: Fetch from API
    setAchievements([
      {
        id: '1',
        name: 'Primeira Frase',
        description: 'Complete sua primeira frase',
        icon: '🎯',
        iconComponent: <Target className="w-8 h-8" />,
        requirement: 1,
        current: user?.xp || 0 > 0 ? 1 : 0,
        unlocked: (user?.xp || 0) > 0,
        rarity: 'common',
        reward: '+10 XP',
      },
      {
        id: '2',
        name: 'Sequência de 7 Dias',
        description: 'Mantenha streak de 7 dias',
        icon: '🔥',
        iconComponent: <Flame className="w-8 h-8" />,
        requirement: 7,
        current: user?.streak || 0,
        unlocked: (user?.streak || 0) >= 7,
        rarity: 'rare',
        reward: '+50 XP',
      },
      {
        id: '3',
        name: 'Nível 3 Alcançado',
        description: 'Alcance o nível 3',
        icon: '⭐',
        iconComponent: <Star className="w-8 h-8" />,
        requirement: 3,
        current: user?.level || 1,
        unlocked: (user?.level || 1) >= 3,
        rarity: 'epic',
        reward: '+100 XP',
      },
      {
        id: '4',
        name: 'Mestre do XP',
        description: 'Acumule 10.000 XP',
        icon: '⚡',
        iconComponent: <Zap className="w-8 h-8" />,
        requirement: 10000,
        current: user?.xp || 0,
        unlocked: (user?.xp || 0) >= 10000,
        rarity: 'legendary',
        reward: '+500 XP + Badge Exclusivo',
      },
      {
        id: '5',
        name: 'Conversador',
        description: 'Complete 10 conversas com IA',
        icon: '💬',
        iconComponent: <Trophy className="w-8 h-8" />,
        requirement: 10,
        current: 0, // TODO: Get from API
        unlocked: false,
        rarity: 'rare',
        reward: '+75 XP',
      },
      {
        id: '6',
        name: 'Poliglota em Potencial',
        description: 'Domine 500 frases',
        icon: '📚',
        iconComponent: <Award className="w-8 h-8" />,
        requirement: 500,
        current: 0, // TODO: Get from API
        unlocked: false,
        rarity: 'epic',
        reward: '+200 XP',
      },
      {
        id: '7',
        name: 'Lenda Viva',
        description: 'Complete todos os 8 níveis',
        icon: '👑',
        iconComponent: <Crown className="w-8 h-8" />,
        requirement: 8,
        current: user?.level || 1,
        unlocked: (user?.level || 1) >= 8,
        rarity: 'legendary',
        reward: '+1000 XP + Certificado Premium',
      },
      {
        id: '8',
        name: 'Madrugador',
        description: 'Estude antes das 6h da manhã',
        icon: '🌅',
        iconComponent: <TrendingUp className="w-8 h-8" />,
        requirement: 1,
        current: 0,
        unlocked: false,
        rarity: 'common',
        reward: '+25 XP',
      },
    ])
  }, [user])

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length
  const completionPercentage = (unlockedCount / totalCount) * 100

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-500'
      case 'rare':
        return 'from-blue-400 to-blue-600'
      case 'epic':
        return 'from-purple-400 to-purple-600'
      case 'legendary':
        return 'from-yellow-400 to-orange-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300'
      case 'rare':
        return 'border-blue-400'
      case 'epic':
        return 'border-purple-400'
      case 'legendary':
        return 'border-yellow-400'
      default:
        return 'border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              Conquistas
            </h1>
            <p className="text-primary-600">
              Desbloqueie badges e ganhe XP extra
            </p>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {unlockedCount} de {totalCount} Conquistas
                </h2>
                <p className="text-gray-600">
                  {completionPercentage.toFixed(0)}% Completo
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">
                  {unlockedCount}
                </div>
                <div className="text-sm text-gray-500">Desbloqueadas</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-primary-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todas ({totalCount})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'unlocked'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Desbloqueadas ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                filter === 'locked'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Bloqueadas ({totalCount - unlockedCount})
            </button>
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-white rounded-xl shadow hover:shadow-lg transition p-6 border-2 ${getRarityBorder(
                  achievement.rarity
                )} ${!achievement.unlocked && 'opacity-60'}`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-full bg-gradient-to-br ${getRarityColor(
                    achievement.rarity
                  )} text-white mb-4 relative`}
                >
                  {achievement.unlocked ? (
                    <span className="text-3xl">{achievement.icon}</span>
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {achievement.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {achievement.description}
                </p>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium text-gray-900">
                      {achievement.current}/{achievement.requirement}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${getRarityColor(
                        achievement.rarity
                      )} h-2 rounded-full`}
                      style={{
                        width: `${Math.min(
                          (achievement.current / achievement.requirement) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Rarity & Reward */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span
                    className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      achievement.rarity === 'legendary'
                        ? 'bg-yellow-100 text-yellow-800'
                        : achievement.rarity === 'epic'
                        ? 'bg-purple-100 text-purple-800'
                        : achievement.rarity === 'rare'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {achievement.rarity}
                  </span>
                  <span className="text-xs text-gray-600">{achievement.reward}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Back button */}
          <div className="text-center">
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
