/**
 * LISTENING EXERCISES SERVICE - ADVANCED
 * Interactive transcription, speed control, dictation, multiple accents
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * LISTENING EXERCISES MANAGEMENT
 */

export async function createExercise(data: {
  title: string
  description?: string
  audioUrl: string
  transcript: string
  type: string // conversation, lecture, podcast, interview, news, story, dictation
  level: string // A1, A2, B1, B2, C1, C2
  accent: string // american, british, australian, canadian, indian
  duration: number // in seconds
  speakerCount?: number
  topic?: string
  vocabulary?: string[]
  idioms?: string[]
  hasBackgroundNoise?: boolean
  speedNormal?: string // URL for normal speed
  speedSlow?: string // URL for slow speed (0.75x)
  imageUrl?: string
  tags?: string[]
  isPremium?: boolean
}) {
  // Generate word-level timestamps for interactive transcript
  const wordTimings = generateWordTimings(data.transcript, data.duration)

  return await prisma.listeningExercise.create({
    data: {
      ...data,
      wordTimings: wordTimings as any,
      isPublished: false,
    },
  })
}

export async function getExercise(exerciseId: string) {
  return await prisma.listeningExercise.findUnique({
    where: { id: exerciseId },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function getExercises(filters?: {
  level?: string
  type?: string
  accent?: string
  topic?: string
  duration?: { min?: number; max?: number }
}) {
  const where: any = { isPublished: true }

  if (filters?.level) where.level = filters.level
  if (filters?.type) where.type = filters.type
  if (filters?.accent) where.accent = filters.accent
  if (filters?.topic) where.topic = filters.topic

  if (filters?.duration) {
    where.duration = {}
    if (filters.duration.min) where.duration.gte = filters.duration.min
    if (filters.duration.max) where.duration.lte = filters.duration.max
  }

  return await prisma.listeningExercise.findMany({
    where,
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      level: true,
      accent: true,
      duration: true,
      topic: true,
      imageUrl: true,
      isPremium: true,
      completionCount: true,
      avgScore: true,
    },
    orderBy: [{ completionCount: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function publishExercise(exerciseId: string) {
  return await prisma.listeningExercise.update({
    where: { id: exerciseId },
    data: { isPublished: true },
  })
}

/**
 * QUESTIONS
 */

export async function addQuestion(
  exerciseId: string,
  data: {
    question: string
    questionType: string // multiple_choice, true_false, fill_blank, short_answer, matching
    options?: string[]
    correctAnswer: string
    acceptableAnswers?: string[]
    timeReference?: number // timestamp in seconds where answer can be found
    explanation?: string
    skillTested?: string // main_idea, details, inference, vocabulary, pronunciation
    difficulty?: number
    order?: number
    points?: number
  }
) {
  return await prisma.listeningQuestion.create({
    data: {
      exerciseId,
      ...data,
      options: data.options || [],
      acceptableAnswers: data.acceptableAnswers || [],
      difficulty: data.difficulty || 3,
      order: data.order || 0,
      points: data.points || 1,
    },
  })
}

/**
 * USER ATTEMPTS
 */

export async function startExercise(userId: string, exerciseId: string) {
  // Check for existing in-progress attempt
  const existing = await prisma.listeningAttempt.findFirst({
    where: {
      userId,
      exerciseId,
      status: 'in_progress',
    },
  })

  if (existing) {
    return existing
  }

  // Get question count
  const questions = await prisma.listeningQuestion.count({
    where: { exerciseId },
  })

  return await prisma.listeningAttempt.create({
    data: {
      userId,
      exerciseId,
      totalQuestions: questions,
      playbackSpeed: 1.0,
    },
  })
}

export async function submitAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  answer: string,
  timeSpent?: number
) {
  const attempt = await prisma.listeningAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      exercise: {
        include: { questions: true },
      },
    },
  })

  if (!attempt) {
    throw new Error('Attempt not found')
  }

  const question = attempt.exercise.questions.find((q) => q.id === questionId)

  if (!question) {
    throw new Error('Question not found')
  }

  // Check answer
  const isCorrect = checkAnswer(answer, question.correctAnswer, question.acceptableAnswers)

  // Update answers array
  const answers = attempt.answers as any[]
  const answerData = {
    questionId,
    answer,
    isCorrect,
    timeSpent: timeSpent || 0,
    skillTested: question.skillTested,
    timestamp: Date.now(),
  }

  answers.push(answerData)

  // Calculate score
  const correctCount = answers.filter((a) => a.isCorrect).length
  const score = (correctCount / attempt.totalQuestions) * 100

  return await prisma.listeningAttempt.update({
    where: { id: attemptId },
    data: {
      answers,
      correctAnswers: correctCount,
      score,
    },
  })
}

export async function completeExercise(attemptId: string, userId: string) {
  const attempt = await prisma.listeningAttempt.findFirst({
    where: { id: attemptId, userId },
    include: { exercise: true },
  })

  if (!attempt) {
    throw new Error('Attempt not found')
  }

  // Calculate skill scores
  const skillScores = calculateSkillScores(attempt.answers as any[])

  // Generate feedback
  const feedback = generateFeedback(
    attempt.score || 0,
    skillScores,
    attempt.playbackSpeed,
    attempt.replayCount || 0
  )

  // Update attempt
  const completed = await prisma.listeningAttempt.update({
    where: { id: attemptId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      skillScores: skillScores as any,
      feedback,
    },
  })

  // Update exercise stats
  await updateExerciseStats(attempt.exerciseId, attempt.score || 0)

  // Update user progress
  await updateProgress(userId, attempt.score || 0, attempt.exercise.accent)

  return completed
}

/**
 * INTERACTIVE TRANSCRIPT
 */

export async function getTranscript(exerciseId: string) {
  const exercise = await prisma.listeningExercise.findUnique({
    where: { id: exerciseId },
    select: {
      transcript: true,
      wordTimings: true,
    },
  })

  if (!exercise) {
    throw new Error('Exercise not found')
  }

  return {
    transcript: exercise.transcript,
    wordTimings: exercise.wordTimings,
  }
}

export async function saveTranscriptHighlight(
  userId: string,
  exerciseId: string,
  data: {
    startTime: number
    endTime: number
    text: string
    note?: string
    color?: string
  }
) {
  return await prisma.transcriptHighlight.create({
    data: {
      userId,
      exerciseId,
      ...data,
      color: data.color || 'yellow',
    },
  })
}

export async function getTranscriptHighlights(userId: string, exerciseId: string) {
  return await prisma.transcriptHighlight.findMany({
    where: { userId, exerciseId },
    orderBy: { startTime: 'asc' },
  })
}

/**
 * DICTATION EXERCISES
 */

export async function createDictationExercise(data: {
  title: string
  audioUrl: string
  fullText: string
  level: string
  accent: string
  type: string // sentence, paragraph, conversation
  blankedWords?: string[] // words to blank out for fill-in
}) {
  // Generate blanked version
  const blankedText = generateBlankedText(data.fullText, data.blankedWords)

  return await prisma.dictationExercise.create({
    data: {
      title: data.title,
      audioUrl: data.audioUrl,
      fullText: data.fullText,
      blankedText,
      blankedWords: data.blankedWords || [],
      level: data.level,
      accent: data.accent,
      type: data.type,
      isPublished: true,
    },
  })
}

export async function submitDictation(
  userId: string,
  exerciseId: string,
  userText: string
) {
  const exercise = await prisma.dictationExercise.findUnique({
    where: { id: exerciseId },
  })

  if (!exercise) {
    throw new Error('Exercise not found')
  }

  // Compare user text with correct text
  const comparison = compareTexts(userText, exercise.fullText)

  const accuracy = Math.round(
    (comparison.correctWords / comparison.totalWords) * 100
  )

  const attempt = await prisma.dictationAttempt.create({
    data: {
      userId,
      exerciseId,
      userText,
      accuracyScore: accuracy,
      correctWords: comparison.correctWords,
      totalWords: comparison.totalWords,
      errors: comparison.errors as any,
      completedAt: new Date(),
    },
  })

  // Update user progress
  await updateProgress(userId, accuracy, exercise.accent)

  return {
    ...attempt,
    comparison,
  }
}

/**
 * PLAYBACK CONTROLS & TRACKING
 */

export async function updatePlaybackProgress(
  attemptId: string,
  userId: string,
  data: {
    currentTime?: number
    playbackSpeed?: number
    replayCount?: number
    pauseCount?: number
    segmentReplays?: any[] // [{start, end, count}]
  }
) {
  return await prisma.listeningAttempt.updateMany({
    where: {
      id: attemptId,
      userId,
      status: 'in_progress',
    },
    data: {
      currentTime: data.currentTime,
      playbackSpeed: data.playbackSpeed,
      replayCount: data.replayCount,
      pauseCount: data.pauseCount,
      segmentReplays: data.segmentReplays as any,
    },
  })
}

export async function trackWordLookup(
  userId: string,
  exerciseId: string,
  word: string,
  timestamp: number
) {
  return await prisma.wordLookup.create({
    data: {
      userId,
      exerciseId,
      word,
      timestamp,
      context: 'listening',
    },
  })
}

/**
 * USER PROGRESS & STATISTICS
 */

export async function getProgress(userId: string) {
  let progress = await prisma.listeningProgress.findUnique({
    where: { userId },
  })

  if (!progress) {
    progress = await prisma.listeningProgress.create({
      data: { userId },
    })
  }

  // Get real-time stats
  const attempts = await prisma.listeningAttempt.findMany({
    where: { userId, status: 'completed' },
  })

  const avgScore =
    attempts.length > 0
      ? attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length
      : 0

  const bestScore = Math.max(...attempts.map((a) => a.score || 0), 0)

  // Accent breakdown
  const accentStats = await getAccentStats(userId)

  return {
    ...progress,
    totalExercises: attempts.length,
    avgScore: Math.round(avgScore),
    bestScore,
    accentStats,
  }
}

async function updateProgress(userId: string, score: number, accent: string) {
  const progress = await prisma.listeningProgress.findUnique({
    where: { userId },
  })

  if (progress) {
    const newAvg =
      ((progress.avgScore || 0) * progress.totalExercises + score) /
      (progress.totalExercises + 1)

    // Update accent-specific stats
    const accentKey = `${accent}Count` as any
    const accentScoreKey = `${accent}Score` as any

    await prisma.listeningProgress.update({
      where: { userId },
      data: {
        totalExercises: { increment: 1 },
        avgScore: newAvg,
        bestScore: Math.max(progress.bestScore || 0, score),
        [accentKey]: { increment: 1 },
        [accentScoreKey]: newAvg,
      },
    })
  } else {
    await prisma.listeningProgress.create({
      data: {
        userId,
        totalExercises: 1,
        avgScore: score,
        bestScore: score,
      },
    })
  }
}

async function getAccentStats(userId: string): Promise<any> {
  const attempts = await prisma.listeningAttempt.findMany({
    where: { userId, status: 'completed' },
    include: {
      exercise: {
        select: { accent: true },
      },
    },
  })

  const stats: any = {}

  attempts.forEach((attempt) => {
    const accent = attempt.exercise.accent
    if (!stats[accent]) {
      stats[accent] = { count: 0, totalScore: 0, avgScore: 0 }
    }
    stats[accent].count++
    stats[accent].totalScore += attempt.score || 0
  })

  Object.keys(stats).forEach((accent) => {
    stats[accent].avgScore = Math.round(stats[accent].totalScore / stats[accent].count)
  })

  return stats
}

export async function getUserAttempts(
  userId: string,
  filters?: {
    exerciseId?: string
    status?: string
    limit?: number
  }
) {
  const where: any = { userId }

  if (filters?.exerciseId) where.exerciseId = filters.exerciseId
  if (filters?.status) where.status = filters.status

  return await prisma.listeningAttempt.findMany({
    where,
    include: {
      exercise: {
        select: {
          title: true,
          type: true,
          level: true,
          accent: true,
          duration: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: filters?.limit || 20,
  })
}

/**
 * RECOMMENDATIONS
 */

export async function getRecommendations(userId: string) {
  const progress = await getProgress(userId)

  // Recommend based on weak accents
  const weakAccent = findWeakestAccent(progress.accentStats)

  // Recommend based on level
  const level = determineLevel(progress.avgScore)

  // Get exercises
  const recommended = await prisma.listeningExercise.findMany({
    where: {
      isPublished: true,
      OR: [
        { accent: weakAccent },
        { level },
      ],
    },
    take: 10,
    orderBy: { avgScore: 'desc' },
  })

  return recommended
}

/**
 * HELPER FUNCTIONS
 */

function generateWordTimings(transcript: string, duration: number): any[] {
  // Simplified word timing generation
  // In production, would use Google Speech-to-Text or similar
  const words = transcript.split(/\s+/)
  const avgWordDuration = duration / words.length

  return words.map((word, index) => ({
    word,
    startTime: index * avgWordDuration,
    endTime: (index + 1) * avgWordDuration,
  }))
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

function generateFeedback(
  score: number,
  skillScores: any,
  playbackSpeed: number,
  replayCount: number
): string {
  let feedback = ''

  // Overall assessment
  if (score >= 90) {
    feedback += '🌟 Excellent listening comprehension! '
  } else if (score >= 75) {
    feedback += '👍 Good job! Your listening skills are solid. '
  } else if (score >= 60) {
    feedback += '📚 Keep practicing! You are improving. '
  } else {
    feedback += '💪 Don\'t give up! Regular listening practice helps a lot. '
  }

  // Speed feedback
  if (playbackSpeed < 1.0) {
    feedback += 'Try practicing at normal speed to improve. '
  } else if (playbackSpeed >= 1.0) {
    feedback += 'Great! You are listening at normal speed. '
  }

  // Replay feedback
  if (replayCount > 5) {
    feedback += 'You replayed the audio several times. Try to focus on key words. '
  }

  // Skill-specific feedback
  Object.keys(skillScores).forEach((skill) => {
    if (skillScores[skill] < 60) {
      feedback += `Work on your ${skill.replace('_', ' ')} skills. `
    }
  })

  return feedback
}

async function updateExerciseStats(exerciseId: string, score: number) {
  const exercise = await prisma.listeningExercise.findUnique({
    where: { id: exerciseId },
  })

  if (!exercise) return

  const completionCount = exercise.completionCount + 1

  const newAvgScore = exercise.avgScore
    ? (exercise.avgScore * exercise.completionCount + score) / completionCount
    : score

  await prisma.listeningExercise.update({
    where: { id: exerciseId },
    data: {
      completionCount,
      avgScore: newAvgScore,
    },
  })
}

function generateBlankedText(fullText: string, wordsToBlank?: string[]): string {
  if (!wordsToBlank || wordsToBlank.length === 0) {
    // Auto-blank every 7th word (approximately)
    const words = fullText.split(/\s+/)
    return words
      .map((word, index) => (index % 7 === 0 && index > 0 ? '_____' : word))
      .join(' ')
  }

  let blankedText = fullText
  wordsToBlank.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    blankedText = blankedText.replace(regex, '_____')
  })

  return blankedText
}

function compareTexts(userText: string, correctText: string): any {
  const userWords = userText.toLowerCase().trim().split(/\s+/)
  const correctWords = correctText.toLowerCase().trim().split(/\s+/)

  const errors: any[] = []
  let correctCount = 0

  correctWords.forEach((correctWord, index) => {
    const userWord = userWords[index] || ''

    if (correctWord === userWord) {
      correctCount++
    } else {
      errors.push({
        position: index,
        expected: correctWord,
        received: userWord,
        type: userWord ? 'wrong' : 'missing',
      })
    }
  })

  // Check for extra words
  if (userWords.length > correctWords.length) {
    for (let i = correctWords.length; i < userWords.length; i++) {
      errors.push({
        position: i,
        expected: '',
        received: userWords[i],
        type: 'extra',
      })
    }
  }

  return {
    correctWords: correctCount,
    totalWords: correctWords.length,
    errors,
    accuracy: (correctCount / correctWords.length) * 100,
  }
}

function findWeakestAccent(accentStats: any): string {
  if (!accentStats || Object.keys(accentStats).length === 0) {
    return 'american'
  }

  let weakest = 'american'
  let lowestScore = 100

  Object.keys(accentStats).forEach((accent) => {
    if (accentStats[accent].avgScore < lowestScore) {
      lowestScore = accentStats[accent].avgScore
      weakest = accent
    }
  })

  return weakest
}

function determineLevel(avgScore: number): string {
  if (avgScore >= 90) return 'C1'
  if (avgScore >= 80) return 'B2'
  if (avgScore >= 70) return 'B1'
  if (avgScore >= 60) return 'A2'
  return 'A1'
}

export const listeningService = {
  createExercise,
  getExercise,
  getExercises,
  publishExercise,
  addQuestion,
  startExercise,
  submitAnswer,
  completeExercise,
  getTranscript,
  saveTranscriptHighlight,
  getTranscriptHighlights,
  createDictationExercise,
  submitDictation,
  updatePlaybackProgress,
  trackWordLookup,
  getProgress,
  getUserAttempts,
  getRecommendations,
}
