/**
 * STREAK CARD COMPONENT
 * Displays user's current streak with visual indicators
 */

import { Flame, Zap, Trophy, Share2 } from 'lucide-react'
import { share, generateStreakShareText } from '../../utils/sharing'
import { useHaptic } from '../../hooks/useTouch'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
  isPremium: boolean
  daysUntilFreeze?: number
}

export default function StreakCard({
  currentStreak,
  longestStreak,
  isPremium,
  daysUntilFreeze = 0,
}: StreakCardProps) {
  const { success } = useHaptic()

  const handleShare = async () => {
    const shareData = generateStreakShareText(currentStreak)
    const shared = await share(shareData)

    if (shared) {
      success()
    }
  }

  // Streak color based on length
  const getStreakColor = () => {
    if (currentStreak >= 30) return 'from-red-500 to-orange-500'
    if (currentStreak >= 7) return 'from-orange-500 to-yellow-500'
    return 'from-yellow-500 to-amber-500'
  }

  // Streak message
  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Comece sua sequência hoje!'
    if (currentStreak === 1) return 'Primeiro dia! Continue assim!'
    if (currentStreak < 7) return 'Ótimo começo! Continue firme!'
    if (currentStreak < 30) return 'Uma semana ou mais! Incrível!'
    if (currentStreak < 100) return 'Mais de um mês! Persistência impressionante!'
    return 'Você é uma lenda! 🌟'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getStreakColor()} opacity-10`}></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Sequência
          </h3>

          {currentStreak > 0 && (
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Compartilhar sequência"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {/* Current Streak */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getStreakColor()} text-white mb-3 relative`}
          >
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-br ${getStreakColor()} bg-clip-text text-transparent">
                  {currentStreak}
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  {currentStreak === 1 ? 'dia' : 'dias'}
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 font-medium">{getStreakMessage()}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Longest Streak */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600">Recorde</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{longestStreak}</div>
          </div>

          {/* Streak Freeze */}
          {isPremium && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-blue-600">Congelar</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {daysUntilFreeze > 0 ? `${daysUntilFreeze}d` : '3d'}
              </div>
            </div>
          )}

          {/* Next milestone */}
          {!isPremium && (
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Próxima meta</div>
              <div className="text-2xl font-bold text-gray-900">
                {currentStreak < 7
                  ? 7
                  : currentStreak < 30
                  ? 30
                  : currentStreak < 100
                  ? 100
                  : currentStreak + 100}
              </div>
            </div>
          )}
        </div>

        {/* Premium Feature */}
        {!isPremium && currentStreak >= 3 && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-primary-900">Proteção Premium</span>
            </div>
            <p className="text-primary-700 text-xs">
              Proteja sua sequência por até 3 dias com o plano Premium!
            </p>
          </div>
        )}

        {/* Freeze Active */}
        {isPremium && daysUntilFreeze > 0 && daysUntilFreeze < 3 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-900">Sequência Congelada</span>
            </div>
            <p className="text-blue-700 text-xs">
              Sua sequência está protegida por {daysUntilFreeze}{' '}
              {daysUntilFreeze === 1 ? 'dia' : 'dias'}. Continue estudando!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
