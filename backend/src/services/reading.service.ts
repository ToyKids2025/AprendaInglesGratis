/**
 * READING COMPREHENSION SERVICE
 * Interactive reading with comprehension tracking
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * PASSAGE MANAGEMENT
 */

/**
 * Create reading passage
 */
export async function createPassage(instructorId: string, data: {
  title: string
  author?: string
  source?: string
  content: string
  excerpt?: string
  type: string
  genre?: string
  topic?: string
  level: string
  cefrLevel?: string
  difficulty?: number
  vocabularyLevel?: string
  keyVocabulary?: string[]
  idioms?: string[]
  learningObjectives?: string[]
  themes?: string[]
  tags?: string[]
  imageUrl?: string
  audioUrl?: string
  isPremium?: boolean
}) {
  const wordCount = countWords(data.content)
  const readingTime = Math.ceil(wordCount / 200) // Avg 200 wpm

  return await prisma.readingPassage.create({
    data: {
      createdBy: instructorId,
      title: data.title,
      author: data.author,
      source: data.source,
      content: data.content,
      excerpt: data.excerpt || data.content.substring(0, 200) + '...',
      type: data.type,
      genre: data.genre,
      topic: data.topic,
      level: data.level,
      cefrLevel: data.cefrLevel,
      difficulty: data.difficulty || 3,
      wordCount,
      readingTime,
      vocabularyLevel: data.vocabularyLevel,
      keyVocabulary: data.keyVocabulary || [],
      idioms: data.idioms || [],
      learningObjectives: data.learningObjectives || [],
      themes: data.themes || [],
      tags: data.tags || [],
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      isPremium: data.isPremium || false,
    },
  })
}

/**
 * Get passage with questions
 */
export async function getPassage(passageId: string, userId?: string) {
  const passage = await prisma.readingPassage.findUnique({
    where: { id: passageId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!passage) {
    throw new Error('Passage not found')
  }

  // Track view
  await prisma.readingPassage.update({
    where: { id: passageId },
    data: { viewCount: { increment: 1 } },
  })

  // Get user's progress if userId provided
  let userAttempt = null
  if (userId) {
    userAttempt = await prisma.readingAttempt.findFirst({
      where: {
        userId,
        passageId,
        status: 'in_progress',
      },
    })
  }

  return { ...passage, userAttempt }
}

/**
 * Get passages
 */
export async function getPassages(filters?: {
  level?: string
  type?: string
  topic?: string
  genre?: string
  isPremium?: boolean
}) {
  const where: any = {
    isPublished: true,
  }

  if (filters?.level) where.level = filters.level
  if (filters?.type) where.type = filters.type
  if (filters?.topic) where.topic = filters.topic
  if (filters?.genre) where.genre = filters.genre
  if (filters?.isPremium !== undefined) where.isPremium = filters.isPremium

  return await prisma.readingPassage.findMany({
    where,
    select: {
      id: true,
      title: true,
      author: true,
      excerpt: true,
      type: true,
      level: true,
      difficulty: true,
      wordCount: true,
      readingTime: true,
      imageUrl: true,
      viewCount: true,
      avgScore: true,
      isPremium: true,
    },
    orderBy: [
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
  })
}

/**
 * Update passage
 */
export async function updatePassage(passageId: string, updates: any) {
  if (updates.content) {
    const wordCount = countWords(updates.content)
    updates.wordCount = wordCount
    updates.readingTime = Math.ceil(wordCount / 200)
  }

  return await prisma.readingPassage.update({
    where: { id: passageId },
    data: updates,
  })
}

/**
 * Publish passage
 */
export async function publishPassage(passageId: string) {
  return await prisma.readingPassage.update({
    where: { id: passageId },
    data: { isPublished: true },
  })
}

/**
 * QUESTIONS
 */

/**
 * Add question to passage
 */
export async function addQuestion(passageId: string, data: {
  question: string
  questionType: string
  options?: string[]
  correctAnswer: string
  acceptableAnswers?: string[]
  relevantParagraph?: number
  relevantText?: string
  explanation?: string
  hint?: string
  difficulty?: number
  skillTested?: string
  order?: number
  points?: number
}) {
  return await prisma.readingQuestion.create({
    data: {
      passageId,
      question: data.question,
      questionType: data.questionType,
      options: data.options || [],
      correctAnswer: data.correctAnswer,
      acceptableAnswers: data.acceptableAnswers || [],
      relevantParagraph: data.relevantParagraph,
      relevantText: data.relevantText,
      explanation: data.explanation,
      hint: data.hint,
      difficulty: data.difficulty || 3,
      skillTested: data.skillTested,
      order: data.order || 0,
      points: data.points || 1,
    },
  })
}

/**
 * READING ATTEMPTS
 */

/**
 * Start reading attempt
 */
export async function startReading(userId: string, passageId: string) {
  // Check for existing in-progress attempt
  const existing = await prisma.readingAttempt.findFirst({
    where: {
      userId,
      passageId,
      status: 'in_progress',
    },
  })

  if (existing) {
    // Resume existing attempt
    return existing
  }

  // Get passage to count questions
  const passage = await prisma.readingPassage.findUnique({
    where: { id: passageId },
    include: {
      questions: true,
    },
  })

  if (!passage) {
    throw new Error('Passage not found')
  }

  // Create new attempt
  return await prisma.readingAttempt.create({
    data: {
      userId,
      passageId,
      totalQuestions: passage.questions.length,
    },
  })
}

/**
 * Update reading progress
 */
export async function updateReadingProgress(
  attemptId: string,
  userId: string,
  data: {
    scrollProgress?: number
    timeSpent?: number
  }
) {
  return await prisma.readingAttempt.updateMany({
    where: {
      id: attemptId,
      userId,
      status: 'in_progress',
    },
    data: {
      scrollProgress: data.scrollProgress,
      timeSpent: data.timeSpent,
    },
  })
}

/**
 * Submit answer
 */
export async function submitAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  answer: string,
  timeSpent?: number
) {
  const attempt = await prisma.readingAttempt.findFirst({
    where: {
      id: attemptId,
      userId,
    },
    include: {
      passage: {
        include: {
          questions: true,
        },
      },
    },
  })

  if (!attempt) {
    throw new Error('Attempt not found')
  }

  const question = attempt.passage.questions.find((q) => q.id === questionId)

  if (!question) {
    throw new Error('Question not found')
  }

  // Check if answer is correct
  const isCorrect = checkAnswer(answer, question.correctAnswer, question.acceptableAnswers)

  // Update answers array
  const answers = attempt.answers as any[]
  const answerData = {
    questionId,
    answer,
    isCorrect,
    timeSpent: timeSpent || 0,
    skillTested: question.skillTested,
  }

  answers.push(answerData)

  // Calculate score
  const correctCount = answers.filter((a) => a.isCorrect).length
  const score = (correctCount / attempt.totalQuestions) * 100

  // Update attempt
  return await prisma.readingAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      correctAnswers: correctCount,
      score,
    },
  })
}

/**
 * Complete reading attempt
 */
export async function completeReading(attemptId: string, userId: string) {
  const attempt = await prisma.readingAttempt.findFirst({
    where: {
      id: attemptId,
      userId,
    },
    include: {
      passage: true,
    },
  })

  if (!attempt) {
    throw new Error('Attempt not found')
  }

  // Calculate final metrics
  const timeSpent = attempt.timeSpent || 0
  const wordsPerMinute = timeSpent > 0
    ? Math.round((attempt.passage.wordCount / timeSpent) * 60)
    : 0

  const comprehensionRate = attempt.score || 0

  // Calculate skill scores
  const skillScores = calculateSkillScores(attempt.answers as any[])

  // Generate feedback
  const feedback = generateFeedback(attempt.score || 0, skillScores, wordsPerMinute)

  // Update attempt
  const completed = await prisma.readingAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      wordsPerMinute,
      comprehensionRate,
      skillScores,
      feedback: feedback.text,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
    },
  })

  // Update passage stats
  await updatePassageStats(attempt.passageId, attempt.score || 0, timeSpent)

  // Update user progress
  await updateUserProgress(userId, attempt)

  return completed
}

/**
 * Get user attempts
 */
export async function getUserAttempts(userId: string, filters?: {
  passageId?: string
  status?: string
}) {
  const where: any = { userId }

  if (filters?.passageId) where.passageId = filters.passageId
  if (filters?.status) where.status = filters.status

  return await prisma.readingAttempt.findMany({
    where,
    include: {
      passage: {
        select: {
          title: true,
          type: true,
          level: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  })
}

/**
 * HIGHLIGHTS & NOTES
 */

/**
 * Create highlight
 */
export async function createHighlight(
  userId: string,
  passageId: string,
  data: {
    text: string
    startOffset: number
    endOffset: number
    color?: string
    category?: string
    note?: string
  }
) {
  return await prisma.readingHighlight.create({
    data: {
      userId,
      passageId,
      text: data.text,
      startOffset: data.startOffset,
      endOffset: data.endOffset,
      color: data.color || 'yellow',
      category: data.category,
      note: data.note,
    },
  })
}

/**
 * Get highlights for passage
 */
export async function getHighlights(userId: string, passageId: string) {
  return await prisma.readingHighlight.findMany({
    where: {
      userId,
      passageId,
    },
    orderBy: { startOffset: 'asc' },
  })
}

/**
 * Delete highlight
 */
export async function deleteHighlight(userId: string, highlightId: string) {
  await prisma.readingHighlight.delete({
    where: {
      id: highlightId,
      userId,
    },
  })

  return { success: true }
}

/**
 * Create note
 */
export async function createNote(
  userId: string,
  passageId: string,
  data: {
    content: string
    paragraph?: number
    type?: string
    isPrivate?: boolean
  }
) {
  return await prisma.readingNote.create({
    data: {
      userId,
      passageId,
      content: data.content,
      paragraph: data.paragraph,
      type: data.type || 'general',
      isPrivate: data.isPrivate !== false,
    },
  })
}

/**
 * Get notes for passage
 */
export async function getNotes(userId: string, passageId: string) {
  return await prisma.readingNote.findMany({
    where: {
      userId,
      passageId,
    },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * VOCABULARY FROM READING
 */

/**
 * Save vocabulary word
 */
export async function saveVocabulary(
  userId: string,
  passageId: string,
  data: {
    word: string
    definition?: string
    context?: string
    userNote?: string
  }
) {
  return await prisma.vocabularyFromReading.create({
    data: {
      userId,
      passageId,
      word: data.word,
      definition: data.definition,
      context: data.context,
      userNote: data.userNote,
    },
  })
}

/**
 * Get saved vocabulary
 */
export async function getSavedVocabulary(userId: string, passageId?: string) {
  const where: any = { userId }
  if (passageId) where.passageId = passageId

  return await prisma.vocabularyFromReading.findMany({
    where,
    orderBy: { savedAt: 'desc' },
  })
}

/**
 * Mark vocabulary as learned
 */
export async function markVocabularyLearned(userId: string, vocabId: string) {
  return await prisma.vocabularyFromReading.update({
    where: {
      id: vocabId,
      userId,
    },
    data: {
      isLearned: true,
      reviewCount: { increment: 1 },
      lastReviewed: new Date(),
    },
  })
}

/**
 * COLLECTIONS
 */

/**
 * Create collection
 */
export async function createCollection(instructorId: string, data: {
  name: string
  description?: string
  type: string
  passageIds?: string[]
  isOrdered?: boolean
  isPublic?: boolean
  isPremium?: boolean
  level?: string
  category?: string
  imageUrl?: string
}) {
  return await prisma.readingCollection.create({
    data: {
      createdBy: instructorId,
      name: data.name,
      description: data.description,
      type: data.type,
      passageIds: data.passageIds || [],
      totalPassages: data.passageIds?.length || 0,
      isOrdered: data.isOrdered || false,
      isPublic: data.isPublic !== false,
      isPremium: data.isPremium || false,
      level: data.level,
      category: data.category,
      imageUrl: data.imageUrl,
    },
  })
}

/**
 * Get collections
 */
export async function getCollections(filters?: {
  type?: string
  level?: string
  category?: string
}) {
  const where: any = {
    isPublic: true,
  }

  if (filters?.type) where.type = filters.type
  if (filters?.level) where.level = filters.level
  if (filters?.category) where.category = filters.category

  return await prisma.readingCollection.findMany({
    where,
    orderBy: { subscriberCount: 'desc' },
  })
}

/**
 * Subscribe to collection
 */
export async function subscribeToCollection(userId: string, collectionId: string) {
  const existing = await prisma.collectionSubscription.findUnique({
    where: {
      userId_collectionId: { userId, collectionId },
    },
  })

  if (existing) {
    return existing
  }

  const subscription = await prisma.collectionSubscription.create({
    data: {
      userId,
      collectionId,
    },
  })

  // Update collection stats
  await prisma.readingCollection.update({
    where: { id: collectionId },
    data: { subscriberCount: { increment: 1 } },
  })

  return subscription
}

/**
 * Update collection progress
 */
export async function updateCollectionProgress(
  userId: string,
  collectionId: string,
  completedPassageId: string
) {
  const subscription = await prisma.collectionSubscription.findUnique({
    where: {
      userId_collectionId: { userId, collectionId },
    },
    include: {
      collection: true,
    },
  })

  if (!subscription) {
    throw new Error('Not subscribed to this collection')
  }

  const completedPassages = [...subscription.completedPassages, completedPassageId]
  const progress = (completedPassages.length / subscription.collection.totalPassages) * 100

  return await prisma.collectionSubscription.update({
    where: {
      userId_collectionId: { userId, collectionId },
    },
    data: {
      completedPassages,
      progress,
      isCompleted: progress === 100,
      completedAt: progress === 100 ? new Date() : undefined,
    },
  })
}

/**
 * PROGRESS & ANALYTICS
 */

/**
 * Get user progress
 */
export async function getProgress(userId: string) {
  let progress = await prisma.readingProgress.findUnique({
    where: { userId },
  })

  if (!progress) {
    progress = await prisma.readingProgress.create({
      data: { userId },
    })
  }

  return progress
}

/**
 * Update user progress
 */
async function updateUserProgress(userId: string, attempt: any) {
  const progress = await prisma.readingProgress.findUnique({
    where: { userId },
  })

  const stats: any = {
    totalPassagesRead: { increment: 1 },
    totalTimeSpent: { increment: attempt.timeSpent || 0 },
    totalWordsRead: { increment: attempt.passage.wordCount },
  }

  // Update type counts
  if (attempt.passage.type === 'article') stats.articleCount = { increment: 1 }
  if (attempt.passage.type === 'story') stats.storyCount = { increment: 1 }
  if (attempt.passage.type === 'academic') stats.academicCount = { increment: 1 }

  // Update level counts
  if (attempt.passage.level === 'beginner') stats.beginnerCount = { increment: 1 }
  if (attempt.passage.level === 'intermediate') stats.intermediateCount = { increment: 1 }
  if (attempt.passage.level === 'advanced') stats.advancedCount = { increment: 1 }

  // Update scores
  if (!progress || !progress.bestScore || attempt.score > progress.bestScore) {
    stats.bestScore = attempt.score
  }

  if (progress) {
    const newAvg = ((progress.avgScore || 0) * progress.totalPassagesRead + attempt.score) / (progress.totalPassagesRead + 1)
    stats.avgScore = newAvg
  } else {
    stats.avgScore = attempt.score
  }

  // Update skill scores
  const skillScores = attempt.skillScores as any || {}
  if (skillScores.main_idea) stats.mainIdeaSkill = skillScores.main_idea
  if (skillScores.details) stats.detailsSkill = skillScores.details
  if (skillScores.inference) stats.inferenceSkill = skillScores.inference
  if (skillScores.vocabulary) stats.vocabularySkill = skillScores.vocabulary
  if (skillScores.tone) stats.toneSkill = skillScores.tone

  // Update reading speed
  if (attempt.wordsPerMinute) {
    if (progress?.avgWordsPerMinute) {
      stats.avgWordsPerMinute = (progress.avgWordsPerMinute + attempt.wordsPerMinute) / 2
    } else {
      stats.avgWordsPerMinute = attempt.wordsPerMinute
    }
  }

  // Update streak
  const today = new Date().toDateString()
  const lastRead = progress?.lastReadDate?.toDateString()

  if (lastRead !== today) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    if (lastRead === yesterday) {
      stats.currentStreak = { increment: 1 }
      if (progress) {
        stats.longestStreak = Math.max(progress.longestStreak, progress.currentStreak + 1)
      }
    } else {
      stats.currentStreak = 1
    }

    stats.lastReadDate = new Date()
  }

  await prisma.readingProgress.upsert({
    where: { userId },
    update: stats,
    create: {
      userId,
      totalPassagesRead: 1,
      totalTimeSpent: attempt.timeSpent || 0,
      totalWordsRead: attempt.passage.wordCount,
      avgScore: attempt.score,
      bestScore: attempt.score,
      currentStreak: 1,
      longestStreak: 1,
      lastReadDate: new Date(),
    },
  })
}

/**
 * Update passage stats
 */
async function updatePassageStats(passageId: string, score: number, timeSpent: number) {
  const passage = await prisma.readingPassage.findUnique({
    where: { id: passageId },
  })

  if (!passage) return

  const completionCount = passage.completionCount + 1

  const newAvgScore = passage.avgScore
    ? (passage.avgScore * passage.completionCount + score) / completionCount
    : score

  const newAvgTime = passage.avgReadingTime
    ? (passage.avgReadingTime * passage.completionCount + timeSpent / 60) / completionCount
    : timeSpent / 60

  await prisma.readingPassage.update({
    where: { id: passageId },
    data: {
      completionCount,
      avgScore: newAvgScore,
      avgReadingTime: newAvgTime,
    },
  })
}

/**
 * CHALLENGES
 */

/**
 * Create reading challenge
 */
export async function createChallenge(data: {
  title: string
  description: string
  type: string
  passageCount?: number
  timeLimit?: number
  minScore?: number
  level?: string
  startDate: Date
  endDate: Date
  xpReward?: number
  badgeId?: string
}) {
  return await prisma.readingChallenge.create({
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      passageCount: data.passageCount,
      timeLimit: data.timeLimit,
      minScore: data.minScore,
      level: data.level,
      startDate: data.startDate,
      endDate: data.endDate,
      xpReward: data.xpReward || 0,
      badgeId: data.badgeId,
    },
  })
}

/**
 * Join challenge
 */
export async function joinChallenge(userId: string, challengeId: string) {
  const existing = await prisma.challengeProgress.findUnique({
    where: {
      userId_challengeId: { userId, challengeId },
    },
  })

  if (existing) {
    return existing
  }

  const progress = await prisma.challengeProgress.create({
    data: {
      userId,
      challengeId,
    },
  })

  await prisma.readingChallenge.update({
    where: { id: challengeId },
    data: { participantCount: { increment: 1 } },
  })

  return progress
}

/**
 * Get active challenges
 */
export async function getActiveChallenges() {
  const now = new Date()

  return await prisma.readingChallenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
  })
}

/**
 * HELPER FUNCTIONS
 */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length
}

function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptableAnswers: string[]
): boolean {
  const normalized = userAnswer.trim().toLowerCase()
  const correct = correctAnswer.trim().toLowerCase()

  if (normalized === correct) return true

  return acceptableAnswers.some((ans) => ans.trim().toLowerCase() === normalized)
}

function calculateSkillScores(answers: any[]): any {
  const skillGroups: any = {}

  answers.forEach((answer) => {
    const skill = answer.skillTested || 'general'

    if (!skillGroups[skill]) {
      skillGroups[skill] = { correct: 0, total: 0 }
    }

    skillGroups[skill].total++
    if (answer.isCorrect) {
      skillGroups[skill].correct++
    }
  })

  const scores: any = {}

  Object.keys(skillGroups).forEach((skill) => {
    scores[skill] = (skillGroups[skill].correct / skillGroups[skill].total) * 100
  })

  return scores
}

function generateFeedback(score: number, skillScores: any, wpm: number) {
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (score >= 90) {
    strengths.push('Excellent overall comprehension')
  } else if (score >= 70) {
    strengths.push('Good understanding of the text')
  }

  if (wpm >= 250) {
    strengths.push('Strong reading speed')
  } else if (wpm < 150) {
    weaknesses.push('Consider practicing to improve reading speed')
  }

  Object.keys(skillScores).forEach((skill) => {
    if (skillScores[skill] >= 80) {
      strengths.push(`Strong ${skill.replace('_', ' ')} skills`)
    } else if (skillScores[skill] < 60) {
      weaknesses.push(`Practice ${skill.replace('_', ' ')} questions`)
    }
  })

  let text = ''

  if (score >= 80) {
    text = 'Excellent work! You demonstrated strong reading comprehension. '
  } else if (score >= 60) {
    text = 'Good effort! You showed solid understanding with room for improvement. '
  } else {
    text = 'Keep practicing! Focus on careful reading and checking your answers. '
  }

  return { text, strengths, weaknesses }
}

export const readingService = {
  createPassage,
  getPassage,
  getPassages,
  updatePassage,
  publishPassage,
  addQuestion,
  startReading,
  updateReadingProgress,
  submitAnswer,
  completeReading,
  getUserAttempts,
  createHighlight,
  getHighlights,
  deleteHighlight,
  createNote,
  getNotes,
  saveVocabulary,
  getSavedVocabulary,
  markVocabularyLearned,
  createCollection,
  getCollections,
  subscribeToCollection,
  updateCollectionProgress,
  getProgress,
  createChallenge,
  joinChallenge,
  getActiveChallenges,
}
