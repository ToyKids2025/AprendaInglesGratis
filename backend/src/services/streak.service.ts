/**
 * STREAK SERVICE
 * Manages user study streaks and daily engagement
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastStudyDate: Date | null
  streakBroken: boolean
  daysUntilFreeze: number
}

/**
 * Check and update user streak
 */
export async function checkStreak(userId: string): Promise<StreakData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streak: true,
      lastStudyDate: true,
      isPremium: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // No previous study date - this is their first day
  if (!user.lastStudyDate) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: null,
      streakBroken: false,
      daysUntilFreeze: user.isPremium ? 3 : 0,
    }
  }

  const lastStudy = new Date(user.lastStudyDate)
  const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate())

  const daysDiff = Math.floor((today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24))

  // Already studied today
  if (daysDiff === 0) {
    return {
      currentStreak: user.streak,
      longestStreak: user.streak, // TODO: Store this in database
      lastStudyDate: user.lastStudyDate,
      streakBroken: false,
      daysUntilFreeze: user.isPremium ? 3 : 0,
    }
  }

  // Studied yesterday - continue streak
  if (daysDiff === 1) {
    return {
      currentStreak: user.streak,
      longestStreak: user.streak,
      lastStudyDate: user.lastStudyDate,
      streakBroken: false,
      daysUntilFreeze: user.isPremium ? 3 : 0,
    }
  }

  // Premium users get 3-day grace period (streak freeze)
  if (user.isPremium && daysDiff <= 3) {
    return {
      currentStreak: user.streak,
      longestStreak: user.streak,
      lastStudyDate: user.lastStudyDate,
      streakBroken: false,
      daysUntilFreeze: 3 - daysDiff + 1,
    }
  }

  // Streak is broken
  return {
    currentStreak: user.streak,
    longestStreak: user.streak,
    lastStudyDate: user.lastStudyDate,
    streakBroken: true,
    daysUntilFreeze: 0,
  }
}

/**
 * Update streak when user studies
 */
export async function updateStreak(userId: string): Promise<StreakData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streak: true,
      lastStudyDate: true,
      isPremium: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // First time studying
  if (!user.lastStudyDate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: 1,
        lastStudyDate: now,
      },
    })

    return {
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: now,
      streakBroken: false,
      daysUntilFreeze: user.isPremium ? 3 : 0,
    }
  }

  const lastStudy = new Date(user.lastStudyDate)
  const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate())

  const daysDiff = Math.floor((today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24))

  // Already studied today - just update timestamp
  if (daysDiff === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastStudyDate: now,
      },
    })

    return {
      currentStreak: user.streak,
      longestStreak: user.streak,
      lastStudyDate: now,
      streakBroken: false,
      daysUntilFreeze: user.isPremium ? 3 : 0,
    }
  }

  // Studied yesterday - increment streak
  if (daysDiff === 1) {
    const newStreak = user.streak + 1

    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        lastStudyDate: now,
      },
    })

    return {
      currentStreak: newStreak,
      longestStreak: newStreak,
      lastStudyDate: now,
      streakBroken: false,
      daysUntilFreeze: user.isPremium ? 3 : 0,
    }
  }

  // Premium users get grace period
  if (user.isPremium && daysDiff <= 3) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastStudyDate: now,
      },
    })

    return {
      currentStreak: user.streak,
      longestStreak: user.streak,
      lastStudyDate: now,
      streakBroken: false,
      daysUntilFreeze: 3 - daysDiff + 1,
    }
  }

  // Streak is broken - reset to 1
  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: 1,
      lastStudyDate: now,
    },
  })

  return {
    currentStreak: 1,
    longestStreak: user.streak, // Keep old streak as longest
    lastStudyDate: now,
    streakBroken: true,
    daysUntilFreeze: user.isPremium ? 3 : 0,
  }
}

/**
 * Get streak leaderboard
 */
export async function getStreakLeaderboard(limit: number = 10) {
  const users = await prisma.user.findMany({
    where: {
      streak: {
        gt: 0,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      streak: true,
      isPremium: true,
    },
    orderBy: {
      streak: 'desc',
    },
    take: limit,
  })

  return users
}

/**
 * Calculate streak statistics
 */
export async function getStreakStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streak: true,
      lastStudyDate: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Calculate total days since signup
  const now = new Date()
  const signupDate = new Date(user.createdAt)
  const totalDays = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24))

  // TODO: Get actual study days from activity log
  const studyDays = user.streak // Simplified for now

  return {
    currentStreak: user.streak,
    longestStreak: user.streak, // TODO: Store and track this
    totalDays,
    studyDays,
    consistencyRate: totalDays > 0 ? (studyDays / totalDays) * 100 : 0,
    lastStudyDate: user.lastStudyDate,
  }
}

export default {
  checkStreak,
  updateStreak,
  getStreakLeaderboard,
  getStreakStats,
}
