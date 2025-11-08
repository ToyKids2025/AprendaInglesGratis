/**
 * LEADERBOARD SERVICE
 * Rankings, competitions, and social comparison
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type LeaderboardType = 'global_xp' | 'global_streak' | 'weekly_xp' | 'monthly_xp' | 'friends_xp'
type Period = 'all_time' | 'weekly' | 'monthly' | 'daily'

/**
 * Update user's leaderboard position
 */
export async function updateLeaderboard(
  userId: string,
  type: LeaderboardType,
  period: Period,
  score: number
) {
  await prisma.leaderboard.upsert({
    where: {
      type_period_userId: {
        type,
        period,
        userId,
      },
    },
    update: {
      score,
    },
    create: {
      type,
      period,
      userId,
      score,
      rank: 0, // Will be calculated
    },
  })

  // Recalculate ranks
  await recalculateRanks(type, period)
}

/**
 * Recalculate ranks for a leaderboard
 */
async function recalculateRanks(type: LeaderboardType, period: Period) {
  const entries = await prisma.leaderboard.findMany({
    where: {
      type,
      period,
    },
    orderBy: {
      score: 'desc',
    },
  })

  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboard.update({
      where: {
        id: entries[i].id,
      },
      data: {
        rank: i + 1,
      },
    })
  }
}

/**
 * Get global XP leaderboard
 */
export async function getGlobalXPLeaderboard(limit: number = 100, offset: number = 0) {
  const users = await prisma.user.findMany({
    where: {
      xp: {
        gt: 0,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      xp: true,
      level: true,
      streak: true,
    },
    orderBy: {
      xp: 'desc',
    },
    take: limit,
    skip: offset,
  })

  return users.map((user, index) => ({
    rank: offset + index + 1,
    user,
    score: user.xp,
  }))
}

/**
 * Get global streak leaderboard
 */
export async function getGlobalStreakLeaderboard(limit: number = 100, offset: number = 0) {
  const users = await prisma.user.findMany({
    where: {
      streak: {
        gt: 0,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      xp: true,
      level: true,
      streak: true,
    },
    orderBy: {
      streak: 'desc',
    },
    take: limit,
    skip: offset,
  })

  return users.map((user, index) => ({
    rank: offset + index + 1,
    user,
    score: user.streak,
  }))
}

/**
 * Get weekly XP leaderboard
 */
export async function getWeeklyXPLeaderboard(limit: number = 100) {
  // Get start of week
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // Calculate XP gained this week from progress
  const userProgress = await prisma.$queryRaw<
    Array<{ userId: string; weeklyXP: number }>
  >`
    SELECT
      "userId",
      SUM(CASE WHEN "updatedAt" >= ${startOfWeek} THEN "timesReviewed" * 10 ELSE 0 END) as "weeklyXP"
    FROM "UserProgress"
    GROUP BY "userId"
    ORDER BY "weeklyXP" DESC
    LIMIT ${limit}
  `

  // Get user details
  const userIds = userProgress.map((u) => u.userId)
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
    },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))

  return userProgress
    .map((progress, index) => {
      const user = userMap.get(progress.userId)
      if (!user) return null

      return {
        rank: index + 1,
        user,
        score: Number(progress.weeklyXP),
      }
    })
    .filter((entry) => entry !== null)
}

/**
 * Get friends leaderboard
 */
export async function getFriendsLeaderboard(userId: string) {
  // Get user's friends
  const friendships = await prisma.friendship.findMany({
    where: {
      userId,
      status: 'accepted',
    },
    select: {
      friendId: true,
    },
  })

  const friendIds = friendships.map((f) => f.friendId)

  // Get users (friends + current user)
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: [userId, ...friendIds],
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
      streak: true,
    },
    orderBy: {
      xp: 'desc',
    },
  })

  return users.map((user, index) => ({
    rank: index + 1,
    user,
    score: user.xp,
    isCurrentUser: user.id === userId,
  }))
}

/**
 * Get user's rank in different leaderboards
 */
export async function getUserRanks(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xp: true,
      streak: true,
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get global XP rank
  const xpRank = await prisma.user.count({
    where: {
      xp: {
        gt: user.xp,
      },
    },
  })

  // Get global streak rank
  const streakRank = await prisma.user.count({
    where: {
      streak: {
        gt: user.streak,
      },
    },
  })

  // Get total users
  const totalUsers = await prisma.user.count()

  return {
    globalXP: {
      rank: xpRank + 1,
      total: totalUsers,
      score: user.xp,
      percentile: Math.round((1 - xpRank / totalUsers) * 100),
    },
    globalStreak: {
      rank: streakRank + 1,
      total: totalUsers,
      score: user.streak,
      percentile: Math.round((1 - streakRank / totalUsers) * 100),
    },
  }
}

/**
 * Get nearby users on leaderboard (context around current user)
 */
export async function getNearbyUsers(userId: string, range: number = 5) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get users above
  const usersAbove = await prisma.user.findMany({
    where: {
      xp: {
        gt: user.xp,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
    },
    orderBy: {
      xp: 'asc',
    },
    take: range,
  })

  // Get users below
  const usersBelow = await prisma.user.findMany({
    where: {
      xp: {
        lt: user.xp,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
    },
    orderBy: {
      xp: 'desc',
    },
    take: range,
  })

  // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatar: true,
      xp: true,
      level: true,
    },
  })

  // Combine and sort
  const allUsers = [...usersAbove.reverse(), currentUser!, ...usersBelow]

  return allUsers.map((user, index) => ({
    user,
    score: user.xp,
    isCurrentUser: user.id === userId,
  }))
}

/**
 * Refresh all user leaderboards
 * Should be run periodically (e.g., daily via cron)
 */
export async function refreshLeaderboards() {
  console.log('Refreshing leaderboards...')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      xp: true,
      streak: true,
    },
  })

  // Update global XP leaderboard
  for (const user of users) {
    await updateLeaderboard(user.id, 'global_xp', 'all_time', user.xp)
    await updateLeaderboard(user.id, 'global_streak', 'all_time', user.streak)
  }

  console.log(`Refreshed leaderboards for ${users.length} users`)
}

export default {
  updateLeaderboard,
  getGlobalXPLeaderboard,
  getGlobalStreakLeaderboard,
  getWeeklyXPLeaderboard,
  getFriendsLeaderboard,
  getUserRanks,
  getNearbyUsers,
  refreshLeaderboards,
}
