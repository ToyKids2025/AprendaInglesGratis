/**
 * ANALYTICS SERVICE
 * Track user activity, study time, and engagement metrics
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StudySession {
  userId: string
  startTime: Date
  endTime?: Date
  duration?: number
  phrasesStudied: number
  activity: string
}

interface DailyStats {
  date: string
  studyTime: number
  phrasesStudied: number
  xpGained: number
  lessonsCompleted: number
}

/**
 * Track study session start
 */
export async function startStudySession(userId: string, activity: string = 'general') {
  const session = {
    userId,
    startTime: new Date(),
    activity,
    phrasesStudied: 0,
  }

  // Store in memory or cache (for now)
  // In production, use Redis or database
  return session
}

/**
 * End study session and calculate duration
 */
export async function endStudySession(
  userId: string,
  startTime: Date,
  phrasesStudied: number
): Promise<number> {
  const endTime = new Date()
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000) // seconds

  // TODO: Store session in database for analytics
  // await prisma.studySession.create({
  //   data: { userId, startTime, endTime, duration, phrasesStudied }
  // })

  return duration
}

/**
 * Get user's total study time
 */
export async function getTotalStudyTime(userId: string): Promise<number> {
  // TODO: Query from study sessions table
  // For now, estimate based on progress

  const progress = await prisma.userProgress.findMany({
    where: { userId },
    select: {
      timesReviewed: true,
    },
  })

  // Estimate: ~30 seconds per review
  const totalReviews = progress.reduce((sum, p) => sum + p.timesReviewed, 0)
  const estimatedSeconds = totalReviews * 30

  return estimatedSeconds
}

/**
 * Get study time for last N days
 */
export async function getStudyTimeByDay(
  userId: string,
  days: number = 7
): Promise<DailyStats[]> {
  // TODO: Query from study sessions table
  // For now, return mock data structure

  const stats: DailyStats[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    stats.push({
      date: date.toISOString().split('T')[0],
      studyTime: 0, // TODO: Calculate from sessions
      phrasesStudied: 0,
      xpGained: 0,
      lessonsCompleted: 0,
    })
  }

  return stats
}

/**
 * Get user engagement metrics
 */
export async function getEngagementMetrics(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      lastStudyDate: true,
      streak: true,
      xp: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get total phrases learned
  const phrasesLearned = await prisma.userProgress.count({
    where: {
      userId,
      mastery: {
        gte: 3,
      },
    },
  })

  // Get total reviews
  const totalReviews = await prisma.userProgress.aggregate({
    where: { userId },
    _sum: {
      timesReviewed: true,
    },
  })

  // Get achievements unlocked
  const achievements = await prisma.userAchievement.count({
    where: { userId },
  })

  // Calculate days since signup
  const daysSinceSignup = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Calculate average XP per day
  const avgXpPerDay = daysSinceSignup > 0 ? Math.round(user.xp / daysSinceSignup) : 0

  return {
    daysSinceSignup,
    currentStreak: user.streak,
    totalXp: user.xp,
    avgXpPerDay,
    phrasesLearned,
    totalReviews: totalReviews._sum.timesReviewed || 0,
    achievementsUnlocked: achievements,
    lastActive: user.lastStudyDate,
  }
}

/**
 * Get learning velocity (phrases/day, XP/day trend)
 */
export async function getLearningVelocity(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      xp: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const daysSinceSignup = Math.max(
    1,
    Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
  )

  const phrasesLearned = await prisma.userProgress.count({
    where: {
      userId,
      mastery: {
        gte: 3,
      },
    },
  })

  return {
    phrasesPerDay: phrasesLearned / daysSinceSignup,
    xpPerDay: user.xp / daysSinceSignup,
    daysActive: daysSinceSignup,
  }
}

/**
 * Get mastery distribution
 */
export async function getMasteryDistribution(userId: string) {
  const progress = await prisma.userProgress.groupBy({
    by: ['mastery'],
    where: { userId },
    _count: true,
  })

  const distribution = {
    new: 0,
    learning: 0,
    familiar: 0,
    known: 0,
    proficient: 0,
    mastered: 0,
  }

  progress.forEach((item) => {
    switch (item.mastery) {
      case 0:
        distribution.new = item._count
        break
      case 1:
        distribution.learning = item._count
        break
      case 2:
        distribution.familiar = item._count
        break
      case 3:
        distribution.known = item._count
        break
      case 4:
        distribution.proficient = item._count
        break
      case 5:
        distribution.mastered = item._count
        break
    }
  })

  return distribution
}

export default {
  startStudySession,
  endStudySession,
  getTotalStudyTime,
  getStudyTimeByDay,
  getEngagementMetrics,
  getLearningVelocity,
  getMasteryDistribution,
}
