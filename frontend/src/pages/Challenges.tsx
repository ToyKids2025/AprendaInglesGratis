/**
 * CHALLENGES PAGE
 * Daily goals, challenges, and quests
 */

import { useState, useEffect } from 'react'
import { Trophy, Target, Zap, Gift, Clock, CheckCircle } from 'lucide-react'
import { api } from '../services/api'

interface Challenge {
  id: string
  type: string
  title: string
  description: string
  icon?: string
  targetType: string
  targetValue: number
  xpReward: number
  coinReward: number
  endDate?: string
  userProgress?: {
    progress: number
    isCompleted: boolean
    rewardClaimed: boolean
  }
}

interface DailyGoal {
  id: string
  phraseGoal: number
  xpGoal: number
  studyTimeGoal: number
  phrasesCompleted: number
  xpEarned: number
  studyTime: number
  isCompleted: boolean
  rewardClaimed: boolean
  bonusXP: number
  bonusCoins: number
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [challengesRes, goalRes] = await Promise.all([
        api.get('/api/gamification/challenges'),
        api.get('/api/gamification/daily-goal'),
      ])

      if (challengesRes.data.success) setChallenges(challengesRes.data.challenges)
      if (goalRes.data.success) setDailyGoal(goalRes.data.goal)
    } catch (error) {
      console.error('Failed to load challenges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const joinChallenge = async (challengeId: string) => {
    try {
      await api.post(`/api/gamification/challenges/${challengeId}/join`)
      loadData()
    } catch (error) {
      console.error('Failed to join challenge:', error)
    }
  }

  const claimReward = async (challengeId: string) => {
    try {
      await api.post(`/api/gamification/challenges/${challengeId}/claim`)
      loadData()
    } catch (error) {
      console.error('Failed to claim reward:', error)
    }
  }

  const claimDailyReward = async () => {
    try {
      await api.post('/api/gamification/daily-goal/claim')
      loadData()
    } catch (error) {
      console.error('Failed to claim daily reward:', error)
    }
  }

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100)
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-600" />
            Desafios & Missões
          </h1>
          <p className="text-gray-600">Complete desafios e ganhe recompensas incríveis</p>
        </div>

        {/* Daily Goal */}
        {dailyGoal && (
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Meta Diária</h2>
                  <p className="text-primary-100">Complete hoje e ganhe bônus!</p>
                </div>
              </div>
              {dailyGoal.isCompleted && !dailyGoal.rewardClaimed && (
                <button
                  onClick={claimDailyReward}
                  className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold flex items-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  Resgatar Recompensa
                </button>
              )}
              {dailyGoal.rewardClaimed && (
                <span className="px-4 py-2 bg-green-500 rounded-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Concluído
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Phrases */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Frases</span>
                  <span className="font-semibold">
                    {dailyGoal.phrasesCompleted} / {dailyGoal.phraseGoal}
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all"
                    style={{
                      width: `${getProgressPercentage(dailyGoal.phrasesCompleted, dailyGoal.phraseGoal)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* XP */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>XP</span>
                  <span className="font-semibold">
                    {dailyGoal.xpEarned} / {dailyGoal.xpGoal}
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all"
                    style={{
                      width: `${getProgressPercentage(dailyGoal.xpEarned, dailyGoal.xpGoal)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Study Time */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tempo de Estudo</span>
                  <span className="font-semibold">
                    {Math.floor(dailyGoal.studyTime / 60)}min / {Math.floor(dailyGoal.studyTimeGoal / 60)}min
                  </span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all"
                    style={{
                      width: `${getProgressPercentage(dailyGoal.studyTime, dailyGoal.studyTimeGoal)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {dailyGoal.isCompleted && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-30 flex items-center gap-4 text-sm">
                <span>Bônus:</span>
                <span className="font-semibold">+{dailyGoal.bonusXP} XP</span>
                <span className="font-semibold">+{dailyGoal.bonusCoins} Moedas</span>
              </div>
            )}
          </div>
        )}

        {/* Active Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Desafios Ativos</h2>

          {challenges.filter((c) => c.type === 'daily' || c.type === 'weekly').length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum desafio ativo no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges
                .filter((c) => c.type === 'daily' || c.type === 'weekly')
                .map((challenge) => (
                  <div key={challenge.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                          {challenge.icon || '🎯'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      {challenge.endDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-4 h-4" />
                          {new Date(challenge.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {challenge.userProgress ? (
                      <>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-semibold">
                              {challenge.userProgress.progress} / {challenge.targetValue}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 rounded-full h-2 transition-all"
                              style={{
                                width: `${getProgressPercentage(challenge.userProgress.progress, challenge.targetValue)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {challenge.userProgress.isCompleted && !challenge.userProgress.rewardClaimed ? (
                          <button
                            onClick={() => claimReward(challenge.id)}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                          >
                            <Gift className="w-4 h-4 inline-block mr-2" />
                            Resgatar Recompensa
                          </button>
                        ) : challenge.userProgress.rewardClaimed ? (
                          <div className="w-full px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-center font-semibold">
                            <CheckCircle className="w-4 h-4 inline-block mr-2" />
                            Concluído
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <button
                        onClick={() => joinChallenge(challenge.id)}
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                      >
                        Participar
                      </button>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-sm text-gray-600">
                      <span>Recompensas:</span>
                      <span className="font-semibold text-primary-600">+{challenge.xpReward} XP</span>
                      <span className="font-semibold text-yellow-600">+{challenge.coinReward} Moedas</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
