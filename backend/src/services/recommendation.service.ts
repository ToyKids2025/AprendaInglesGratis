/**
 * AI CONTENT RECOMMENDATION SERVICE
 * Personalized learning recommendations using multiple algorithms
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get personalized phrase recommendations for user
 */
export async function getRecommendedPhrases(
  userId: string,
  limit: number = 20,
  algorithm: 'hybrid' | 'collaborative' | 'content_based' | 'spaced_repetition' = 'hybrid'
) {
  // Get or create recommendation engine for user
  let engine = await prisma.recommendationEngine.findUnique({
    where: { userId },
  })

  if (!engine) {
    engine = await initializeRecommendationEngine(userId)
  }

  // Get user's learning history
  const userProgress = await getUserLearningContext(userId)

  // Generate recommendations based on algorithm
  let recommendations: any[] = []

  switch (algorithm) {
    case 'collaborative':
      recommendations = await collaborativeFiltering(userId, userProgress, limit)
      break
    case 'content_based':
      recommendations = await contentBasedFiltering(userId, userProgress, limit)
      break
    case 'spaced_repetition':
      recommendations = await spacedRepetitionRecommendations(userId, limit)
      break
    case 'hybrid':
    default:
      recommendations = await hybridRecommendations(userId, userProgress, limit)
      break
  }

  // Log recommendations
  await logRecommendations(userId, recommendations, algorithm)

  // Update last recommendation time
  await prisma.recommendationEngine.update({
    where: { userId },
    data: { lastRecommendation: new Date() },
  })

  return recommendations
}

/**
 * Initialize recommendation engine for new user
 */
async function initializeRecommendationEngine(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true },
  })

  // Set initial preferences based on level
  let difficulty = 'beginner'
  if (user && user.level >= 3) difficulty = 'intermediate'
  if (user && user.level >= 6) difficulty = 'advanced'

  return await prisma.recommendationEngine.create({
    data: {
      userId,
      preferredDifficulty: difficulty,
      preferredTopics: [],
      strongCategories: [],
      weakCategories: [],
    },
  })
}

/**
 * Get user learning context
 */
async function getUserLearningContext(userId: string) {
  const [studiedPhrases, preferences, recentActivity] = await Promise.all([
    // Get all studied phrases
    prisma.userPhrase.findMany({
      where: { userId },
      select: {
        phraseId: true,
        status: true,
        masteryLevel: true,
        lastReviewedAt: true,
        nextReviewAt: true,
        correctCount: true,
        incorrectCount: true,
      },
    }),
    // Get user preferences
    prisma.userPreference.findUnique({
      where: { userId },
    }),
    // Get recent study sessions
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      take: 10,
      select: {
        categoryId: true,
        accuracy: true,
        phrasesStudied: true,
      },
    }),
  ])

  // Calculate statistics
  const studiedPhraseIds = studiedPhrases.map((p) => p.phraseId)
  const masteredPhraseIds = studiedPhrases
    .filter((p) => p.masteryLevel >= 4)
    .map((p) => p.phraseId)

  const weakPhrases = studiedPhrases
    .filter((p) => p.incorrectCount > p.correctCount)
    .map((p) => p.phraseId)

  // Calculate average accuracy
  const totalAttempts = studiedPhrases.reduce(
    (sum, p) => sum + p.correctCount + p.incorrectCount,
    0
  )
  const correctAttempts = studiedPhrases.reduce((sum, p) => sum + p.correctCount, 0)
  const averageAccuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0

  // Get category performance
  const categoryPerformance = new Map<string, { correct: number; total: number }>()
  recentActivity.forEach((session) => {
    if (session.categoryId) {
      const current = categoryPerformance.get(session.categoryId) || {
        correct: 0,
        total: 0,
      }
      current.total += session.phrasesStudied
      current.correct += Math.round(session.phrasesStudied * session.accuracy)
      categoryPerformance.set(session.categoryId, current)
    }
  })

  return {
    studiedPhraseIds,
    masteredPhraseIds,
    weakPhrases,
    averageAccuracy,
    categoryPerformance,
    preferences,
  }
}

/**
 * HYBRID RECOMMENDATIONS
 * Combines multiple algorithms with weighted scoring
 */
async function hybridRecommendations(userId: string, context: any, limit: number) {
  const weights = {
    spacedRepetition: 0.35, // 35% - Review phrases due
    contentBased: 0.30, // 30% - Similar to what user likes
    collaborative: 0.20, // 20% - What similar users study
    exploration: 0.15, // 15% - New topics/categories
  }

  // Get recommendations from each algorithm
  const [spaced, content, collaborative, exploration] = await Promise.all([
    spacedRepetitionRecommendations(userId, Math.ceil(limit * 1.5)),
    contentBasedFiltering(userId, context, Math.ceil(limit * 1.5)),
    collaborativeFiltering(userId, context, Math.ceil(limit * 1.5)),
    explorationRecommendations(userId, context, Math.ceil(limit * 1.5)),
  ])

  // Combine and score
  const scoreMap = new Map<string, { score: number; phrase: any; reasons: string[] }>()

  // Add spaced repetition recommendations
  spaced.forEach((item, index) => {
    const score = weights.spacedRepetition * (1 - index / spaced.length)
    scoreMap.set(item.phrase.id, {
      score,
      phrase: item.phrase,
      reasons: ['Due for review'],
    })
  })

  // Add content-based recommendations
  content.forEach((item, index) => {
    const score = weights.contentBased * (1 - index / content.length)
    const existing = scoreMap.get(item.phrase.id)
    if (existing) {
      existing.score += score
      existing.reasons.push('Similar to your interests')
    } else {
      scoreMap.set(item.phrase.id, {
        score,
        phrase: item.phrase,
        reasons: ['Similar to your interests'],
      })
    }
  })

  // Add collaborative recommendations
  collaborative.forEach((item, index) => {
    const score = weights.collaborative * (1 - index / collaborative.length)
    const existing = scoreMap.get(item.phrase.id)
    if (existing) {
      existing.score += score
      existing.reasons.push('Popular with similar learners')
    } else {
      scoreMap.set(item.phrase.id, {
        score,
        phrase: item.phrase,
        reasons: ['Popular with similar learners'],
      })
    }
  })

  // Add exploration recommendations
  exploration.forEach((item, index) => {
    const score = weights.exploration * (1 - index / exploration.length)
    const existing = scoreMap.get(item.phrase.id)
    if (existing) {
      existing.score += score
      existing.reasons.push('New topic to explore')
    } else {
      scoreMap.set(item.phrase.id, {
        score,
        phrase: item.phrase,
        reasons: ['New topic to explore'],
      })
    }
  })

  // Sort by score and return top N
  const recommendations = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({
      phrase: item.phrase,
      confidence: item.score,
      reason: item.reasons.join(', '),
      position: index,
    }))

  return recommendations
}

/**
 * SPACED REPETITION RECOMMENDATIONS
 * Phrases due for review based on forgetting curve
 */
async function spacedRepetitionRecommendations(userId: string, limit: number) {
  const now = new Date()

  // Get phrases due for review
  const dueForReview = await prisma.userPhrase.findMany({
    where: {
      userId,
      status: { in: ['learning', 'reviewing'] },
      nextReviewAt: { lte: now },
    },
    orderBy: {
      nextReviewAt: 'asc', // Most overdue first
    },
    take: limit,
    include: {
      phrase: {
        include: {
          category: true,
          difficulty: true,
        },
      },
    },
  })

  return dueForReview.map((up, index) => ({
    phrase: up.phrase,
    confidence: 1.0 - index / dueForReview.length,
    reason: 'spaced_repetition',
    position: index,
    metadata: {
      masteryLevel: up.masteryLevel,
      daysSinceReview: Math.floor(
        (now.getTime() - (up.lastReviewedAt?.getTime() || now.getTime())) / (1000 * 60 * 60 * 24)
      ),
    },
  }))
}

/**
 * CONTENT-BASED FILTERING
 * Recommend phrases similar to what user has studied and liked
 */
async function contentBasedFiltering(userId: string, context: any, limit: number) {
  // Get user's top categories (based on accuracy and frequency)
  const topCategories = Array.from(context.categoryPerformance.entries())
    .filter(([_, perf]) => perf.correct / perf.total > 0.7) // Good performance
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([catId]) => catId)

  if (topCategories.length === 0) {
    // New user - recommend beginner phrases
    return await getBeginnerRecommendations(limit)
  }

  // Find phrases in these categories that user hasn't studied
  const recommendations = await prisma.phrase.findMany({
    where: {
      categoryId: { in: topCategories },
      id: { notIn: context.studiedPhraseIds },
      isActive: true,
    },
    take: limit * 2,
    include: {
      category: true,
      difficulty: true,
    },
  })

  // Score based on category performance
  const scored = recommendations.map((phrase) => {
    const categoryPerf = context.categoryPerformance.get(phrase.categoryId)
    const confidence = categoryPerf
      ? categoryPerf.correct / categoryPerf.total
      : 0.5

    return {
      phrase,
      confidence,
      reason: 'content_based',
      position: 0,
    }
  })

  // Sort by confidence and return top N
  return scored.sort((a, b) => b.confidence - a.confidence).slice(0, limit)
}

/**
 * COLLABORATIVE FILTERING
 * Recommend what similar users are studying
 */
async function collaborativeFiltering(userId: string, context: any, limit: number) {
  // Find similar users (same level, similar accuracy, similar categories)
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, xp: true },
  })

  if (!currentUser) {
    return []
  }

  // Find users with similar level (±1 level)
  const similarUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      level: {
        gte: Math.max(1, currentUser.level - 1),
        lte: currentUser.level + 1,
      },
    },
    take: 50,
    select: { id: true },
  })

  const similarUserIds = similarUsers.map((u) => u.id)

  if (similarUserIds.length === 0) {
    return []
  }

  // Find phrases these users are studying (but current user hasn't)
  const popularPhrases = await prisma.userPhrase.groupBy({
    by: ['phraseId'],
    where: {
      userId: { in: similarUserIds },
      phraseId: { notIn: context.studiedPhraseIds },
      masteryLevel: { gte: 3 }, // Only well-received phrases
    },
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: limit,
  })

  // Get full phrase details
  const phraseIds = popularPhrases.map((p) => p.phraseId)
  const phrases = await prisma.phrase.findMany({
    where: {
      id: { in: phraseIds },
      isActive: true,
    },
    include: {
      category: true,
      difficulty: true,
    },
  })

  // Map back to maintain order
  return popularPhrases
    .map((pp) => {
      const phrase = phrases.find((p) => p.id === pp.phraseId)
      if (!phrase) return null

      return {
        phrase,
        confidence: Math.min(1.0, pp._count.userId / 10), // Normalize
        reason: 'collaborative',
        position: 0,
        metadata: {
          studiedByCount: pp._count.userId,
        },
      }
    })
    .filter((x) => x !== null) as any[]
}

/**
 * EXPLORATION RECOMMENDATIONS
 * Help users discover new topics and categories
 */
async function explorationRecommendations(userId: string, context: any, limit: number) {
  // Get categories user hasn't studied yet
  const studiedCategories = new Set(context.categoryPerformance.keys())

  const unexploredCategories = await prisma.category.findMany({
    where: {
      id: { notIn: Array.from(studiedCategories) },
      isActive: true,
    },
    take: 5,
  })

  if (unexploredCategories.length === 0) {
    return []
  }

  // Get phrases from unexplored categories
  const recommendations = await prisma.phrase.findMany({
    where: {
      categoryId: { in: unexploredCategories.map((c) => c.id) },
      id: { notIn: context.studiedPhraseIds },
      isActive: true,
    },
    take: limit,
    include: {
      category: true,
      difficulty: true,
    },
  })

  return recommendations.map((phrase, index) => ({
    phrase,
    confidence: 0.5, // Medium confidence for exploration
    reason: 'exploration',
    position: index,
  }))
}

/**
 * Get beginner recommendations for new users
 */
async function getBeginnerRecommendations(limit: number) {
  const phrases = await prisma.phrase.findMany({
    where: {
      isActive: true,
      difficulty: {
        level: { lte: 2 }, // Easy phrases
      },
    },
    take: limit,
    include: {
      category: true,
      difficulty: true,
    },
    orderBy: {
      priority: 'desc',
    },
  })

  return phrases.map((phrase, index) => ({
    phrase,
    confidence: 0.8,
    reason: 'beginner_path',
    position: index,
  }))
}

/**
 * Log recommendations for analytics
 */
async function logRecommendations(
  userId: string,
  recommendations: any[],
  algorithm: string
) {
  const logs = recommendations.map((rec) => ({
    userId,
    phraseId: rec.phrase.id,
    reason: rec.reason,
    confidence: rec.confidence,
    position: rec.position,
    algorithm,
    metadata: rec.metadata || {},
  }))

  await prisma.recommendationLog.createMany({
    data: logs,
  })
}

/**
 * Update user preferences based on behavior
 */
export async function updateUserPreferences(userId: string) {
  // Get recent study history
  const recentStudies = await prisma.userPhrase.findMany({
    where: { userId },
    include: {
      phrase: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      lastReviewedAt: 'desc',
    },
    take: 100,
  })

  // Analyze liked categories (high mastery + recent activity)
  const categoryScores = new Map<string, { positive: number; total: number }>()

  recentStudies.forEach((up) => {
    const catId = up.phrase.categoryId
    if (!catId) return

    const current = categoryScores.get(catId) || { positive: 0, total: 0 }
    current.total++
    if (up.masteryLevel >= 3) current.positive++
    categoryScores.set(catId, current)
  })

  const likedCategories = Array.from(categoryScores.entries())
    .filter(([_, scores]) => scores.positive / scores.total > 0.7)
    .map(([catId]) => catId)

  const dislikedCategories = Array.from(categoryScores.entries())
    .filter(([_, scores]) => scores.positive / scores.total < 0.3)
    .map(([catId]) => catId)

  // Update or create preferences
  await prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      likedCategories,
      dislikedCategories,
      likedTopics: [],
      neutralTopics: [],
    },
    update: {
      likedCategories,
      dislikedCategories,
      lastUpdated: new Date(),
    },
  })

  // Update recommendation engine
  const averageAccuracy =
    recentStudies.length > 0
      ? recentStudies.reduce((sum, up) => {
          const total = up.correctCount + up.incorrectCount
          return sum + (total > 0 ? up.correctCount / total : 0)
        }, 0) / recentStudies.length
      : 0

  await prisma.recommendationEngine.upsert({
    where: { userId },
    create: {
      userId,
      preferredTopics: [],
      strongCategories: likedCategories,
      weakCategories: dislikedCategories,
      averageAccuracy,
    },
    update: {
      strongCategories: likedCategories,
      weakCategories: dislikedCategories,
      averageAccuracy,
    },
  })

  return { likedCategories, dislikedCategories, averageAccuracy }
}

/**
 * Submit recommendation feedback
 */
export async function submitFeedback(data: {
  userId: string
  phraseId: string
  rating?: number
  isRelevant?: boolean
  isTooEasy?: boolean
  isTooHard?: boolean
  isInteresting?: boolean
  comment?: string
}) {
  const feedback = await prisma.recommendationFeedback.create({
    data,
  })

  // Update user preferences based on feedback
  if (data.isRelevant === false || data.isTooEasy === true || data.isTooHard === true) {
    await updateUserPreferences(data.userId)
  }

  return feedback
}

/**
 * Get recommendation analytics
 */
export async function getRecommendationAnalytics(userId: string) {
  const [logs, engine, recentFeedback] = await Promise.all([
    prisma.recommendationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.recommendationEngine.findUnique({
      where: { userId },
    }),
    prisma.recommendationFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  // Calculate acceptance rate
  const shown = logs.filter((l) => l.wasAccepted !== null).length
  const accepted = logs.filter((l) => l.wasAccepted === true).length
  const acceptanceRate = shown > 0 ? accepted / shown : 0

  // Calculate average accuracy on recommended phrases
  const studiedRecommendations = logs.filter((l) => l.accuracy !== null)
  const avgAccuracy =
    studiedRecommendations.length > 0
      ? studiedRecommendations.reduce((sum, l) => sum + (l.accuracy || 0), 0) /
        studiedRecommendations.length
      : 0

  // Algorithm performance
  const algorithmStats = logs.reduce((acc: any, log) => {
    if (!acc[log.algorithm]) {
      acc[log.algorithm] = { total: 0, accepted: 0 }
    }
    acc[log.algorithm].total++
    if (log.wasAccepted) acc[log.algorithm].accepted++
    return acc
  }, {})

  return {
    acceptanceRate,
    avgAccuracy,
    totalRecommendations: logs.length,
    algorithmStats,
    engine,
    recentFeedback,
  }
}

/**
 * Create custom learning path
 */
export async function createLearningPath(data: {
  name: string
  description?: string
  difficulty: string
  duration: number
  phraseIds: string[]
  milestones?: any[]
  createdBy?: string
}) {
  return await prisma.learningPath.create({
    data,
  })
}

/**
 * Enroll user in learning path
 */
export async function enrollInPath(userId: string, pathId: string) {
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
  })

  if (!path) {
    throw new Error('Learning path not found')
  }

  // Check if already enrolled
  const existing = await prisma.userPathProgress.findUnique({
    where: {
      userId_pathId: {
        userId,
        pathId,
      },
    },
  })

  if (existing) {
    return existing
  }

  // Create enrollment
  const enrollment = await prisma.userPathProgress.create({
    data: {
      userId,
      pathId,
      completedPhrases: [],
    },
  })

  // Increment enrolled count
  await prisma.learningPath.update({
    where: { id: pathId },
    data: {
      enrolledCount: { increment: 1 },
    },
  })

  return enrollment
}

/**
 * Get user's learning paths
 */
export async function getUserPaths(userId: string) {
  return await prisma.userPathProgress.findMany({
    where: { userId },
    include: {
      path: true,
    },
    orderBy: {
      lastAccessedAt: 'desc',
    },
  })
}

export default {
  getRecommendedPhrases,
  updateUserPreferences,
  submitFeedback,
  getRecommendationAnalytics,
  createLearningPath,
  enrollInPath,
  getUserPaths,
}
