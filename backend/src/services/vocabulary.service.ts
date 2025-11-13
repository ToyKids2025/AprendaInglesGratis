/**
 * VOCABULARY BUILDER SERVICE
 * Spaced repetition system using SM-2 algorithm
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create vocabulary list
 */
export async function createList(userId: string, data: {
  name: string
  description?: string
  category?: string
  isPublic?: boolean
  dailyGoal?: number
}) {
  const list = await prisma.vocabularyList.create({
    data: {
      userId,
      ...data,
    },
  })

  return list
}

/**
 * Get user's vocabulary lists
 */
export async function getUserLists(userId: string) {
  return await prisma.vocabularyList.findMany({
    where: { userId },
    include: {
      words: {
        select: {
          id: true,
          masteryLevel: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * Add word to list
 */
export async function addWord(userId: string, listId: string, data: {
  word: string
  translation: string
  definition?: string
  pronunciation?: string
  exampleSentence?: string
  exampleTranslation?: string
  partOfSpeech?: string
  difficulty?: string
  tags?: string[]
}) {
  // Check list ownership
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  })

  if (!list) {
    throw new Error('List not found or access denied')
  }

  // Create word
  const word = await prisma.vocabularyWord.create({
    data: {
      listId,
      userId,
      word: data.word,
      translation: data.translation,
      definition: data.definition,
      pronunciation: data.pronunciation,
      exampleSentence: data.exampleSentence,
      exampleTranslation: data.exampleTranslation,
      partOfSpeech: data.partOfSpeech,
      difficulty: data.difficulty || 'medium',
      tags: data.tags,
    },
  })

  // Update list stats
  await prisma.vocabularyList.update({
    where: { id: listId },
    data: {
      totalWords: { increment: 1 },
    },
  })

  // Update user stats
  await updateUserStats(userId, { wordsAddedToday: { increment: 1 } })

  return word
}

/**
 * Get words due for review (spaced repetition)
 */
export async function getDueWords(userId: string, limit: number = 20) {
  const now = new Date()

  const words = await prisma.vocabularyWord.findMany({
    where: {
      userId,
      isActive: true,
      nextReviewAt: {
        lte: now,
      },
    },
    orderBy: [
      { masteryLevel: 'asc' }, // Prioritize less mastered words
      { nextReviewAt: 'asc' },
    ],
    take: limit,
    include: {
      list: {
        select: {
          name: true,
        },
      },
    },
  })

  return words
}

/**
 * Review word (Spaced Repetition SM-2 Algorithm)
 * @param quality: 0-5 rating (5 = perfect recall)
 */
export async function reviewWord(
  userId: string,
  wordId: string,
  quality: number,
  timeTaken?: number,
  answer?: string
) {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5')
  }

  const word = await prisma.vocabularyWord.findFirst({
    where: { id: wordId, userId },
  })

  if (!word) {
    throw new Error('Word not found')
  }

  const wasCorrect = quality >= 3

  // SM-2 Algorithm Calculation
  let newEaseFactor = word.easeFactor
  let newInterval = word.interval
  let newRepetitions = word.repetitions

  if (quality >= 3) {
    // Correct answer
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(newInterval * newEaseFactor)
    }
    newRepetitions += 1
  } else {
    // Incorrect answer - reset
    newRepetitions = 0
    newInterval = 1
  }

  // Update ease factor
  newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3
  }

  // Calculate next review date
  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

  // Calculate mastery level (0-5)
  let masteryLevel = word.masteryLevel
  if (wasCorrect) {
    masteryLevel = Math.min(5, masteryLevel + 1)
  } else {
    masteryLevel = Math.max(0, masteryLevel - 1)
  }

  // Update word
  const updatedWord = await prisma.vocabularyWord.update({
    where: { id: wordId },
    data: {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewAt,
      lastReviewAt: new Date(),
      masteryLevel,
      correctCount: wasCorrect ? { increment: 1 } : undefined,
      wrongCount: wasCorrect ? undefined : { increment: 1 },
    },
  })

  // Create review record
  await prisma.vocabularyReview.create({
    data: {
      wordId,
      userId,
      quality,
      timeTaken,
      answer,
      wasCorrect,
    },
  })

  // Update user stats
  await updateUserStats(userId, {
    wordsReviewedToday: { increment: 1 },
    totalReviews: { increment: 1 },
  })

  // Update list stats if word is mastered
  if (masteryLevel === 5 && word.masteryLevel < 5) {
    await prisma.vocabularyList.update({
      where: { id: word.listId },
      data: {
        masteredWords: { increment: 1 },
      },
    })
  }

  return updatedWord
}

/**
 * Get vocabulary statistics
 */
export async function getStats(userId: string) {
  let stats = await prisma.vocabularyStats.findUnique({
    where: { userId },
  })

  if (!stats) {
    stats = await prisma.vocabularyStats.create({
      data: { userId },
    })
  }

  // Get additional real-time stats
  const [totalWords, masteredWords, dueToday] = await Promise.all([
    prisma.vocabularyWord.count({
      where: { userId, isActive: true },
    }),
    prisma.vocabularyWord.count({
      where: { userId, isActive: true, masteryLevel: 5 },
    }),
    prisma.vocabularyWord.count({
      where: {
        userId,
        isActive: true,
        nextReviewAt: {
          lte: new Date(),
        },
      },
    }),
  ])

  return {
    ...stats,
    totalWords,
    masteredWords,
    learningWords: totalWords - masteredWords,
    dueToday,
  }
}

/**
 * Search words in user's vocabulary
 */
export async function searchWords(userId: string, query: string, filters?: {
  listId?: string
  masteryLevel?: number
  partOfSpeech?: string
  isFavorite?: boolean
}) {
  return await prisma.vocabularyWord.findMany({
    where: {
      userId,
      isActive: true,
      ...(query && {
        OR: [
          { word: { contains: query, mode: 'insensitive' } },
          { translation: { contains: query, mode: 'insensitive' } },
          { definition: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.listId && { listId: filters.listId }),
      ...(filters?.masteryLevel !== undefined && { masteryLevel: filters.masteryLevel }),
      ...(filters?.partOfSpeech && { partOfSpeech: filters.partOfSpeech }),
      ...(filters?.isFavorite !== undefined && { isFavorite: filters.isFavorite }),
    },
    include: {
      list: {
        select: {
          name: true,
        },
      },
    },
    take: 50,
  })
}

/**
 * Share vocabulary list
 */
export async function shareList(userId: string, listId: string, expiresInDays?: number) {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  })

  if (!list) {
    throw new Error('List not found')
  }

  // Generate unique share code
  const shareCode = generateShareCode()

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined

  const sharedList = await prisma.sharedVocabularyList.create({
    data: {
      listId,
      ownerId: userId,
      shareCode,
      title: list.name,
      description: list.description,
      expiresAt,
    },
  })

  return {
    shareCode,
    shareUrl: `https://englishflow.com/vocabulary/shared/${shareCode}`,
    expiresAt,
  }
}

/**
 * Copy shared list
 */
export async function copySharedList(userId: string, shareCode: string) {
  const sharedList = await prisma.sharedVocabularyList.findUnique({
    where: { shareCode },
  })

  if (!sharedList || !sharedList.isActive) {
    throw new Error('Shared list not found or expired')
  }

  if (sharedList.expiresAt && sharedList.expiresAt < new Date()) {
    throw new Error('Shared list has expired')
  }

  // Get original list with words
  const originalList = await prisma.vocabularyList.findUnique({
    where: { id: sharedList.listId },
    include: {
      words: true,
    },
  })

  if (!originalList) {
    throw new Error('Original list not found')
  }

  // Create copy for user
  const newList = await prisma.vocabularyList.create({
    data: {
      userId,
      name: `${originalList.name} (Copy)`,
      description: originalList.description,
      category: originalList.category,
      dailyGoal: originalList.dailyGoal,
      totalWords: originalList.words.length,
    },
  })

  // Copy all words
  const wordsCopy = originalList.words.map((word) => ({
    listId: newList.id,
    userId,
    word: word.word,
    translation: word.translation,
    definition: word.definition,
    pronunciation: word.pronunciation,
    exampleSentence: word.exampleSentence,
    exampleTranslation: word.exampleTranslation,
    partOfSpeech: word.partOfSpeech,
    difficulty: word.difficulty,
    tags: word.tags,
  }))

  await prisma.vocabularyWord.createMany({
    data: wordsCopy,
  })

  // Update share stats
  await prisma.sharedVocabularyList.update({
    where: { id: sharedList.id },
    data: {
      copyCount: { increment: 1 },
    },
  })

  return newList
}

/**
 * Get learning progress for a list
 */
export async function getListProgress(userId: string, listId: string) {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
    include: {
      words: true,
    },
  })

  if (!list) {
    throw new Error('List not found')
  }

  const byMasteryLevel = list.words.reduce((acc: any, word) => {
    const level = word.masteryLevel
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {})

  const avgMastery =
    list.words.length > 0
      ? list.words.reduce((sum, w) => sum + w.masteryLevel, 0) / list.words.length
      : 0

  return {
    totalWords: list.totalWords,
    masteredWords: list.masteredWords,
    byMasteryLevel,
    avgMastery: avgMastery.toFixed(2),
    completionPercentage: list.totalWords > 0 ? (list.masteredWords / list.totalWords) * 100 : 0,
  }
}

/**
 * Delete word
 */
export async function deleteWord(userId: string, wordId: string) {
  const word = await prisma.vocabularyWord.findFirst({
    where: { id: wordId, userId },
  })

  if (!word) {
    throw new Error('Word not found')
  }

  await prisma.vocabularyWord.delete({
    where: { id: wordId },
  })

  // Update list stats
  await prisma.vocabularyList.update({
    where: { id: word.listId },
    data: {
      totalWords: { decrement: 1 },
      masteredWords: word.masteryLevel === 5 ? { decrement: 1 } : undefined,
    },
  })

  return { success: true }
}

/**
 * Toggle favorite
 */
export async function toggleFavorite(userId: string, wordId: string) {
  const word = await prisma.vocabularyWord.findFirst({
    where: { id: wordId, userId },
  })

  if (!word) {
    throw new Error('Word not found')
  }

  return await prisma.vocabularyWord.update({
    where: { id: wordId },
    data: {
      isFavorite: !word.isFavorite,
    },
  })
}

/**
 * Get review history
 */
export async function getReviewHistory(userId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const reviews = await prisma.vocabularyReview.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  // Group by date
  const byDate = reviews.reduce((acc: any, review) => {
    const date = review.createdAt.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { total: 0, correct: 0, wrong: 0 }
    }
    acc[date].total++
    if (review.wasCorrect) {
      acc[date].correct++
    } else {
      acc[date].wrong++
    }
    return acc
  }, {})

  return {
    reviews,
    byDate,
    totalReviews: reviews.length,
    accuracy: reviews.length > 0
      ? (reviews.filter(r => r.wasCorrect).length / reviews.length) * 100
      : 0,
  }
}

/**
 * Helper: Update user stats
 */
async function updateUserStats(userId: string, updates: any) {
  await prisma.vocabularyStats.upsert({
    where: { userId },
    update: updates,
    create: {
      userId,
      ...updates,
    },
  })
}

/**
 * Helper: Generate unique share code
 */
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Update vocabulary list
 */
export async function updateList(userId: string, listId: string, updates: any) {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  })

  if (!list) {
    throw new Error('List not found or access denied')
  }

  return await prisma.vocabularyList.update({
    where: { id: listId },
    data: updates,
  })
}

/**
 * Delete vocabulary list
 */
export async function deleteList(userId: string, listId: string) {
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  })

  if (!list) {
    throw new Error('List not found or access denied')
  }

  // Delete all words in the list
  await prisma.vocabularyWord.deleteMany({
    where: { listId },
  })

  // Delete the list
  await prisma.vocabularyList.delete({
    where: { id: listId },
  })

  return { success: true }
}

/**
 * Update word
 */
export async function updateWord(userId: string, wordId: string, updates: any) {
  const word = await prisma.vocabularyWord.findFirst({
    where: { id: wordId, userId },
  })

  if (!word) {
    throw new Error('Word not found or access denied')
  }

  return await prisma.vocabularyWord.update({
    where: { id: wordId },
    data: updates,
  })
}

/**
 * Get single word details
 */
export async function getWord(userId: string, wordId: string) {
  const word = await prisma.vocabularyWord.findFirst({
    where: { id: wordId, userId },
    include: {
      list: {
        select: {
          name: true,
          category: true,
        },
      },
    },
  })

  if (!word) {
    throw new Error('Word not found or access denied')
  }

  return word
}

/**
 * Get words by list
 */
export async function getListWords(
  userId: string,
  listId: string,
  limit: number = 100,
  offset: number = 0
) {
  // Verify list ownership
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  })

  if (!list) {
    throw new Error('List not found or access denied')
  }

  return await prisma.vocabularyWord.findMany({
    where: { listId, isActive: true },
    orderBy: [{ masteryLevel: 'asc' }, { createdAt: 'desc' }],
    skip: offset,
    take: limit,
  })
}

/**
 * Bulk add words to list
 */
export async function bulkAddWords(userId: string, listId: string, words: any[]) {
  // Check list ownership
  const list = await prisma.vocabularyList.findFirst({
    where: { id: listId, userId },
  })

  if (!list) {
    throw new Error('List not found or access denied')
  }

  // Create all words
  const createdWords = await prisma.vocabularyWord.createMany({
    data: words.map((word) => ({
      listId,
      userId,
      word: word.word,
      translation: word.translation,
      definition: word.definition,
      pronunciation: word.pronunciation,
      exampleSentence: word.exampleSentence,
      exampleTranslation: word.exampleTranslation,
      partOfSpeech: word.partOfSpeech,
      difficulty: word.difficulty || 'medium',
      tags: word.tags,
    })),
  })

  // Update list stats
  await prisma.vocabularyList.update({
    where: { id: listId },
    data: {
      totalWords: { increment: words.length },
    },
  })

  // Update user stats
  await updateUserStats(userId, { wordsAddedToday: { increment: words.length } })

  // Return created words
  return await prisma.vocabularyWord.findMany({
    where: { listId, userId },
    orderBy: { createdAt: 'desc' },
    take: words.length,
  })
}

/**
 * Reset daily stats (to be called by cron job)
 */
export async function resetDailyStats() {
  await prisma.vocabularyStats.updateMany({
    data: {
      wordsReviewedToday: 0,
      wordsAddedToday: 0,
    },
  })
}
