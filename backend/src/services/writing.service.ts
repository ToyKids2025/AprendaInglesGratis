/**
 * WRITING EXERCISES SERVICE
 * AI-powered writing practice with intelligent correction using GPT-4
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/**
 * EXERCISE MANAGEMENT
 */

/**
 * Create writing exercise
 */
export async function createExercise(instructorId: string, data: {
  title: string
  description: string
  type: string
  prompt: string
  wordCountMin?: number
  wordCountMax?: number
  timeLimit?: number
  level: string
  category: string
  topic?: string
  gradingCriteria?: any
  sampleAnswer?: string
  tips?: string[]
  vocabulary?: string[]
  keywords?: string[]
  difficulty?: number
  estimatedTime?: number
  tags?: string[]
}) {
  const defaultCriteria = {
    grammar: 30,
    vocabulary: 25,
    coherence: 25,
    style: 20,
  }

  return await prisma.writingExercise.create({
    data: {
      createdBy: instructorId,
      title: data.title,
      description: data.description,
      type: data.type,
      prompt: data.prompt,
      wordCountMin: data.wordCountMin,
      wordCountMax: data.wordCountMax,
      timeLimit: data.timeLimit,
      level: data.level,
      category: data.category,
      topic: data.topic,
      gradingCriteria: data.gradingCriteria || defaultCriteria,
      sampleAnswer: data.sampleAnswer,
      tips: data.tips || [],
      vocabulary: data.vocabulary || [],
      keywords: data.keywords || [],
      difficulty: data.difficulty || 3,
      estimatedTime: data.estimatedTime,
      tags: data.tags || [],
    },
  })
}

/**
 * Get exercise
 */
export async function getExercise(exerciseId: string) {
  return await prisma.writingExercise.findUnique({
    where: { id: exerciseId },
  })
}

/**
 * Get exercises
 */
export async function getExercises(filters?: {
  level?: string
  category?: string
  type?: string
}) {
  const where: any = {
    isPublished: true,
  }

  if (filters?.level) where.level = filters.level
  if (filters?.category) where.category = filters.category
  if (filters?.type) where.type = filters.type

  return await prisma.writingExercise.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * SUBMISSION & GRADING
 */

/**
 * Submit writing
 */
export async function submitWriting(userId: string, exerciseId: string, data: {
  content: string
  timeSpent?: number
}) {
  const exercise = await prisma.writingExercise.findUnique({
    where: { id: exerciseId },
  })

  if (!exercise) {
    throw new Error('Exercise not found')
  }

  const wordCount = countWords(data.content)
  const characterCount = data.content.length

  // Check word count requirements
  if (exercise.wordCountMin && wordCount < exercise.wordCountMin) {
    throw new Error(`Minimum ${exercise.wordCountMin} words required (you wrote ${wordCount})`)
  }

  if (exercise.wordCountMax && wordCount > exercise.wordCountMax) {
    throw new Error(`Maximum ${exercise.wordCountMax} words allowed (you wrote ${wordCount})`)
  }

  const submission = await prisma.writingSubmission.create({
    data: {
      exerciseId,
      userId,
      content: data.content,
      wordCount,
      characterCount,
      timeSpent: data.timeSpent,
      status: 'grading',
    },
  })

  // Grade asynchronously
  gradeSubmission(submission.id, exercise)

  return submission
}

/**
 * Grade submission using AI
 */
async function gradeSubmission(submissionId: string, exercise: any) {
  const submission = await prisma.writingSubmission.findUnique({
    where: { id: submissionId },
  })

  if (!submission) return

  try {
    // Call GPT-4 for comprehensive analysis
    const analysis = await analyzeWritingWithAI(
      submission.content,
      exercise.prompt,
      exercise.level,
      exercise.type,
      exercise.gradingCriteria
    )

    // Extract errors and categorize
    const errors = analysis.errors || []
    const errorsByType = categorizeErrors(errors, submission.userId)

    // Calculate scores
    const scores = calculateScores(analysis, exercise.gradingCriteria)

    // Update submission
    await prisma.writingSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'graded',
        aiAnalysis: analysis,
        overallScore: scores.overall,
        grammarScore: scores.grammar,
        vocabularyScore: scores.vocabulary,
        coherenceScore: scores.coherence,
        styleScore: scores.style,
        errors,
        errorCount: errors.length,
        corrections: analysis.corrections || [],
        aiFeedback: analysis.feedback,
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        gradedAt: new Date(),
      },
    })

    // Update user progress
    await updateWritingProgress(submission.userId, submission, scores.overall)

    // Track common errors
    await trackErrors(submission.userId, errors, exerciseId, submissionId)

  } catch (error) {
    console.error('Grading error:', error)
    await prisma.writingSubmission.update({
      where: { id: submissionId },
      data: { status: 'submitted' }, // Reset to submitted on error
    })
  }
}

/**
 * Analyze writing with GPT-4
 */
async function analyzeWritingWithAI(
  content: string,
  prompt: string,
  level: string,
  type: string,
  criteria: any
) {
  const systemPrompt = `You are an expert English writing tutor. Analyze the student's writing and provide detailed feedback.

Student Level: ${level}
Exercise Type: ${type}
Exercise Prompt: ${prompt}

Grading Criteria: ${JSON.stringify(criteria)}

Analyze the writing and return a JSON object with:
{
  "overallScore": number (0-100),
  "scores": {
    "grammar": number (0-100),
    "vocabulary": number (0-100),
    "coherence": number (0-100),
    "style": number (0-100)
  },
  "errors": [
    {
      "type": "grammar|spelling|punctuation|word_choice|style",
      "category": "specific category",
      "severity": "critical|major|minor",
      "originalText": "text with error",
      "correctedText": "corrected version",
      "explanation": "why it's wrong and how to fix",
      "position": number,
      "sentence": "full sentence containing error"
    }
  ],
  "corrections": [
    {
      "before": "original sentence",
      "after": "corrected sentence",
      "reason": "explanation"
    }
  ],
  "feedback": "Overall feedback paragraph",
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["area to improve 1", "area to improve 2", ...]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Please analyze this writing:\n\n${content}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(response.choices[0].message.content || '{}')
  return result
}

/**
 * Calculate weighted scores
 */
function calculateScores(analysis: any, criteria: any) {
  const scores = analysis.scores || {}

  const grammarWeight = criteria.grammar || 30
  const vocabularyWeight = criteria.vocabulary || 25
  const coherenceWeight = criteria.coherence || 25
  const styleWeight = criteria.style || 20

  const overall =
    (scores.grammar * grammarWeight / 100) +
    (scores.vocabulary * vocabularyWeight / 100) +
    (scores.coherence * coherenceWeight / 100) +
    (scores.style * styleWeight / 100)

  return {
    overall: Math.round(overall * 10) / 10,
    grammar: scores.grammar || 0,
    vocabulary: scores.vocabulary || 0,
    coherence: scores.coherence || 0,
    style: scores.style || 0,
  }
}

/**
 * Get submission
 */
export async function getSubmission(submissionId: string, userId: string) {
  const submission = await prisma.writingSubmission.findFirst({
    where: { id: submissionId, userId },
    include: {
      exercise: true,
      revisions: {
        orderBy: { revisionNumber: 'asc' },
      },
    },
  })

  if (!submission) {
    throw new Error('Submission not found')
  }

  return submission
}

/**
 * Get user submissions
 */
export async function getUserSubmissions(userId: string, filters?: {
  exerciseId?: string
  status?: string
}) {
  const where: any = { userId }

  if (filters?.exerciseId) where.exerciseId = filters.exerciseId
  if (filters?.status) where.status = filters.status

  return await prisma.writingSubmission.findMany({
    where,
    include: {
      exercise: {
        select: {
          title: true,
          type: true,
          level: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })
}

/**
 * REVISIONS
 */

/**
 * Submit revision
 */
export async function submitRevision(
  userId: string,
  submissionId: string,
  content: string,
  changesDescription?: string
) {
  const submission = await prisma.writingSubmission.findFirst({
    where: { id: submissionId, userId },
    include: {
      exercise: true,
      revisions: true,
    },
  })

  if (!submission) {
    throw new Error('Submission not found')
  }

  const revisionNumber = submission.revisionCount + 1
  const wordCount = countWords(content)

  // Save previous version
  const previousVersions = [...submission.previousVersions, submission.content]

  // Create revision
  const revision = await prisma.writingRevision.create({
    data: {
      submissionId,
      content,
      wordCount,
      changesDescription,
      revisionNumber,
    },
  })

  // Update original submission
  await prisma.writingSubmission.update({
    where: { id: submissionId },
    data: {
      content,
      wordCount,
      isRevised: true,
      revisionCount: revisionNumber,
      previousVersions,
      status: 'grading',
    },
  })

  // Re-grade revision
  gradeRevision(revision.id, submission.exercise)

  return revision
}

/**
 * Grade revision
 */
async function gradeRevision(revisionId: string, exercise: any) {
  const revision = await prisma.writingRevision.findUnique({
    where: { id: revisionId },
    include: { submission: true },
  })

  if (!revision) return

  try {
    const analysis = await analyzeWritingWithAI(
      revision.content,
      exercise.prompt,
      exercise.level,
      exercise.type,
      exercise.gradingCriteria
    )

    const errors = analysis.errors || []
    const scores = calculateScores(analysis, exercise.gradingCriteria)

    await prisma.writingRevision.update({
      where: { id: revisionId },
      data: {
        aiAnalysis: analysis,
        overallScore: scores.overall,
        errors,
        errorCount: errors.length,
      },
    })

    // Update main submission with new scores
    await prisma.writingSubmission.update({
      where: { id: revision.submissionId },
      data: {
        aiAnalysis: analysis,
        overallScore: scores.overall,
        grammarScore: scores.grammar,
        vocabularyScore: scores.vocabulary,
        coherenceScore: scores.coherence,
        styleScore: scores.style,
        errors,
        errorCount: errors.length,
        aiFeedback: analysis.feedback,
        status: 'graded',
      },
    })
  } catch (error) {
    console.error('Revision grading error:', error)
  }
}

/**
 * ERROR TRACKING
 */

/**
 * Track errors for learning
 */
async function trackErrors(
  userId: string,
  errors: any[],
  exerciseId: string,
  submissionId: string
) {
  for (const error of errors) {
    // Check if this error type exists for user
    const existing = await prisma.grammarError.findFirst({
      where: {
        userId,
        type: error.type,
        category: error.category,
        originalText: error.originalText,
      },
    })

    if (existing) {
      // Update occurrence count
      await prisma.grammarError.update({
        where: { id: existing.id },
        data: {
          occurrences: { increment: 1 },
          lastOccurrence: new Date(),
        },
      })
    } else {
      // Create new error record
      await prisma.grammarError.create({
        data: {
          userId,
          type: error.type,
          category: error.category,
          severity: error.severity,
          originalText: error.originalText,
          correctedText: error.correctedText,
          explanation: error.explanation,
          rule: error.rule,
          sentence: error.sentence,
          position: error.position,
          exerciseId,
          submissionId,
        },
      })
    }
  }
}

/**
 * Get user's common errors
 */
export async function getCommonErrors(userId: string) {
  return await prisma.grammarError.findMany({
    where: { userId },
    orderBy: [
      { occurrences: 'desc' },
      { lastOccurrence: 'desc' },
    ],
    take: 20,
  })
}

/**
 * Mark error as learned
 */
export async function markErrorAsLearned(userId: string, errorId: string) {
  return await prisma.grammarError.update({
    where: { id: errorId, userId },
    data: { isLearned: true },
  })
}

/**
 * PROGRESS TRACKING
 */

/**
 * Update user progress
 */
async function updateWritingProgress(userId: string, submission: any, score: number) {
  const progress = await prisma.writingProgress.findUnique({
    where: { userId },
  })

  const stats: any = {
    totalSubmissions: { increment: 1 },
    totalWords: { increment: submission.wordCount },
  }

  // Update type counters
  const exercise = await prisma.writingExercise.findUnique({
    where: { id: submission.exerciseId },
  })

  if (exercise) {
    if (exercise.type === 'essay') stats.essayCount = { increment: 1 }
    if (exercise.type === 'email') stats.emailCount = { increment: 1 }
    if (exercise.type === 'paragraph') stats.paragraphCount = { increment: 1 }
  }

  // Update best score
  if (!progress || !progress.bestScore || score > progress.bestScore) {
    stats.bestScore = score
  }

  // Update average score
  if (progress) {
    const newAvg = ((progress.avgScore || 0) * progress.totalSubmissions + score) / (progress.totalSubmissions + 1)
    stats.avgScore = newAvg
  } else {
    stats.avgScore = score
  }

  // Update streak
  const today = new Date().toDateString()
  const lastSubmission = progress?.lastSubmission?.toDateString()

  if (lastSubmission !== today) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()

    if (lastSubmission === yesterday) {
      stats.currentStreak = { increment: 1 }
      if (progress) {
        stats.longestStreak = Math.max(progress.longestStreak, progress.currentStreak + 1)
      }
    } else {
      stats.currentStreak = 1
    }

    stats.lastSubmission = new Date()
  }

  await prisma.writingProgress.upsert({
    where: { userId },
    update: stats,
    create: {
      userId,
      totalSubmissions: 1,
      totalWords: submission.wordCount,
      avgScore: score,
      bestScore: score,
      currentStreak: 1,
      longestStreak: 1,
      lastSubmission: new Date(),
    },
  })
}

/**
 * Get user progress
 */
export async function getProgress(userId: string) {
  let progress = await prisma.writingProgress.findUnique({
    where: { userId },
  })

  if (!progress) {
    progress = await prisma.writingProgress.create({
      data: { userId },
    })
  }

  return progress
}

/**
 * WRITING CHALLENGES
 */

/**
 * Create writing challenge
 */
export async function createChallenge(data: {
  title: string
  description: string
  challengeType: string
  topic: string
  prompt: string
  wordCountMin?: number
  wordCountMax?: number
  timeLimit?: number
  level: string
  startDate: Date
  endDate: Date
  timezone?: string
  xpReward?: number
  badgeId?: string
}) {
  return await prisma.writingChallenge.create({
    data: {
      title: data.title,
      description: data.description,
      challengeType: data.challengeType,
      topic: data.topic,
      prompt: data.prompt,
      wordCountMin: data.wordCountMin,
      wordCountMax: data.wordCountMax,
      timeLimit: data.timeLimit,
      level: data.level,
      startDate: data.startDate,
      endDate: data.endDate,
      timezone: data.timezone || 'UTC',
      xpReward: data.xpReward || 0,
      badgeId: data.badgeId,
    },
  })
}

/**
 * Join challenge
 */
export async function joinChallenge(userId: string, challengeId: string) {
  const challenge = await prisma.writingChallenge.findUnique({
    where: { id: challengeId },
  })

  if (!challenge) {
    throw new Error('Challenge not found')
  }

  if (!challenge.isActive) {
    throw new Error('Challenge is not active')
  }

  if (new Date() > challenge.endDate) {
    throw new Error('Challenge has ended')
  }

  const existing = await prisma.challengeParticipant.findUnique({
    where: {
      userId_challengeId: { userId, challengeId },
    },
  })

  if (existing) {
    return existing
  }

  const participant = await prisma.challengeParticipant.create({
    data: {
      userId,
      challengeId,
    },
  })

  await prisma.writingChallenge.update({
    where: { id: challengeId },
    data: { participantCount: { increment: 1 } },
  })

  return participant
}

/**
 * Get active challenges
 */
export async function getActiveChallenges() {
  const now = new Date()

  return await prisma.writingChallenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: 'asc' },
  })
}

/**
 * TEMPLATES & RESOURCES
 */

/**
 * Get writing templates
 */
export async function getTemplates(type?: string, level?: string) {
  const where: any = { isPublic: true }

  if (type) where.type = type
  if (level) where.level = level

  return await prisma.writingTemplate.findMany({
    where,
    orderBy: { usageCount: 'desc' },
  })
}

/**
 * Get writing topics
 */
export async function getTopics(filters?: {
  category?: string
  level?: string
  type?: string
}) {
  const where: any = { isActive: true }

  if (filters?.category) where.category = filters.category
  if (filters?.level) where.level = filters.level
  if (filters?.type) where.type = filters.type

  return await prisma.writingTopic.findMany({
    where,
    orderBy: { usageCount: 'desc' },
  })
}

/**
 * HELPER FUNCTIONS
 */

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length
}

function categorizeErrors(errors: any[], userId: string) {
  const categorized: any = {}

  errors.forEach((error) => {
    const type = error.type || 'other'
    if (!categorized[type]) {
      categorized[type] = 0
    }
    categorized[type]++
  })

  return categorized
}

export const writingService = {
  createExercise,
  getExercise,
  getExercises,
  submitWriting,
  getSubmission,
  getUserSubmissions,
  submitRevision,
  getCommonErrors,
  markErrorAsLearned,
  getProgress,
  createChallenge,
  joinChallenge,
  getActiveChallenges,
  getTemplates,
  getTopics,
}
