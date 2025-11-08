/**
 * CHALLENGE SERVICE
 * Gamification, challenges, quests, and competitive features
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get active challenges
 */
export async function getActiveChallenges(userId?: string) {
  const now = new Date()

  const challenges = await prisma.challenge.findMany({
    where: {
      isActive: true,
      startDate: {
        lte: now,
      },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    },
    orderBy: {
      startDate: 'desc',
    },
  })

  if (!userId) return challenges

  // Get user's progress for each challenge
  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      challengeId: {
        in: challenges.map((c) => c.id),
      },
    },
  })

  const progressMap = new Map(userChallenges.map((uc) => [uc.challengeId, uc]))

  return challenges.map((challenge) => ({
    ...challenge,
    userProgress: progressMap.get(challenge.id) || null,
  }))
}

/**
 * Join challenge
 */
export async function joinChallenge(userId: string, challengeId: string) {
  // Check if already joined
  const existing = await prisma.userChallenge.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  })

  if (existing) {
    return existing
  }

  return await prisma.userChallenge.create({
    data: {
      userId,
      challengeId,
    },
  })
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progress: number
) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  })

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  const isCompleted = progress >= challenge.targetValue

  const userChallenge = await prisma.userChallenge.upsert({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
    update: {
      progress,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    },
    create: {
      userId,
      challengeId,
      progress,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    },
  })

  // If just completed, grant rewards
  if (isCompleted && !userChallenge.rewardClaimed) {
    await claimChallengeReward(userId, challengeId)
  }

  return userChallenge
}

/**
 * Claim challenge reward
 */
export async function claimChallengeReward(userId: string, challengeId: string) {
  const [challenge, userChallenge] = await Promise.all([
    prisma.challenge.findUnique({ where: { id: challengeId } }),
    prisma.userChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    }),
  ])

  if (!challenge || !userChallenge || !userChallenge.isCompleted || userChallenge.rewardClaimed) {
    throw new Error('Cannot claim reward')
  }

  // Grant rewards
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: challenge.xpReward,
      },
      coins: {
        increment: challenge.coinReward,
      },
    },
  })

  // Mark as claimed
  await prisma.userChallenge.update({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
    data: {
      rewardClaimed: true,
    },
  })

  // Grant badge if applicable
  if (challenge.badgeId) {
    await grantBadge(userId, challenge.badgeId)
  }

  return {
    xpReward: challenge.xpReward,
    coinReward: challenge.coinReward,
    badgeId: challenge.badgeId,
  }
}

/**
 * Get or create daily goal
 */
export async function getDailyGoal(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let goal = await prisma.dailyGoal.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  })

  if (!goal) {
    goal = await prisma.dailyGoal.create({
      data: {
        userId,
        date: today,
      },
    })
  }

  return goal
}

/**
 * Update daily goal progress
 */
export async function updateDailyGoal(
  userId: string,
  updates: {
    phrasesCompleted?: number
    xpEarned?: number
    studyTime?: number
  }
) {
  const goal = await getDailyGoal(userId)

  const newPhrases = goal.phrasesCompleted + (updates.phrasesCompleted || 0)
  const newXP = goal.xpEarned + (updates.xpEarned || 0)
  const newStudyTime = goal.studyTime + (updates.studyTime || 0)

  const isCompleted =
    newPhrases >= goal.phraseGoal &&
    newXP >= goal.xpGoal &&
    newStudyTime >= goal.studyTimeGoal

  return await prisma.dailyGoal.update({
    where: { id: goal.id },
    data: {
      phrasesCompleted: newPhrases,
      xpEarned: newXP,
      studyTime: newStudyTime,
      isCompleted,
      completedAt: isCompleted && !goal.isCompleted ? new Date() : goal.completedAt,
    },
  })
}

/**
 * Claim daily goal reward
 */
export async function claimDailyGoalReward(userId: string) {
  const goal = await getDailyGoal(userId)

  if (!goal.isCompleted || goal.rewardClaimed) {
    throw new Error('Cannot claim reward')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: goal.bonusXP,
      },
      coins: {
        increment: goal.bonusCoins,
      },
    },
  })

  await prisma.dailyGoal.update({
    where: { id: goal.id },
    data: {
      rewardClaimed: true,
    },
  })

  return {
    bonusXP: goal.bonusXP,
    bonusCoins: goal.bonusCoins,
  }
}

/**
 * Grant badge to user
 */
export async function grantBadge(userId: string, badgeId: string) {
  // Check if already earned
  const existing = await prisma.userAchievement.findFirst({
    where: {
      userId,
      type: 'badge',
      metadata: {
        path: ['badgeId'],
        equals: badgeId,
      },
    },
  })

  if (existing) return existing

  // Grant badge
  const badge = await prisma.badge.findUnique({
    where: { id: badgeId },
  })

  if (!badge) {
    throw new Error('Badge not found')
  }

  // Create achievement
  const achievement = await prisma.userAchievement.create({
    data: {
      userId,
      type: 'badge',
      title: badge.name,
      description: badge.description,
      metadata: {
        badgeId: badge.id,
        rarity: badge.rarity,
      },
    },
  })

  // Update badge earned count
  await prisma.badge.update({
    where: { id: badgeId },
    data: {
      earnedCount: {
        increment: 1,
      },
    },
  })

  return achievement
}

/**
 * Get active quests for user
 */
export async function getActiveQuests(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get available quests
  const quests = await prisma.quest.findMany({
    where: {
      isActive: true,
      requiredLevel: {
        lte: user.level,
      },
    },
  })

  // Get user's progress
  const userQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      questId: {
        in: quests.map((q) => q.id),
      },
    },
  })

  const progressMap = new Map(userQuests.map((uq) => [uq.questId, uq]))

  return quests.map((quest) => ({
    ...quest,
    userProgress: progressMap.get(quest.id) || null,
  }))
}

/**
 * Start quest
 */
export async function startQuest(userId: string, questId: string) {
  const existing = await prisma.userQuest.findUnique({
    where: {
      userId_questId: {
        userId,
        questId,
      },
    },
  })

  if (existing) {
    return existing
  }

  return await prisma.userQuest.create({
    data: {
      userId,
      questId,
    },
  })
}

/**
 * Update quest progress
 */
export async function updateQuestProgress(
  userId: string,
  questId: string,
  stepData: any
) {
  const userQuest = await prisma.userQuest.findUnique({
    where: {
      userId_questId: {
        userId,
        questId,
      },
    },
  })

  if (!userQuest) {
    throw new Error('Quest not started')
  }

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
  })

  if (!quest) {
    throw new Error('Quest not found')
  }

  const steps = quest.steps as any[]
  const currentStep = userQuest.currentStep + 1
  const isCompleted = currentStep >= steps.length

  return await prisma.userQuest.update({
    where: {
      userId_questId: {
        userId,
        questId,
      },
    },
    data: {
      currentStep,
      stepsData: stepData,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    },
  })
}

export default {
  getActiveChallenges,
  joinChallenge,
  updateChallengeProgress,
  claimChallengeReward,
  getDailyGoal,
  updateDailyGoal,
  claimDailyGoalReward,
  grantBadge,
  getActiveQuests,
  startQuest,
  updateQuestProgress,
}
