/**
 * VOICE RECOGNITION & PRONUNCIATION SERVICE
 * Speech-to-text, pronunciation analysis, and practice tracking
 */

import { PrismaClient } from '@prisma/client'
import { S3 } from 'aws-sdk'

const prisma = new PrismaClient()

// Configure AWS S3 for audio storage (optional)
const s3 = process.env.AWS_ACCESS_KEY_ID
  ? new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    })
  : null

/**
 * Analyze pronunciation from audio or transcript
 */
export async function analyzePronunciation(data: {
  userId: string
  phraseId: string
  transcribedText: string
  expectedText: string
  audioBuffer?: Buffer
  audioFormat?: string
  audioDuration?: number
  studySessionId?: string
}) {
  const {
    userId,
    phraseId,
    transcribedText,
    expectedText,
    audioBuffer,
    audioFormat = 'webm',
    audioDuration = 0,
    studySessionId,
  } = data

  // Upload audio to S3 if provided
  let audioUrl: string | undefined
  if (audioBuffer && s3) {
    audioUrl = await uploadAudioToS3(userId, phraseId, audioBuffer, audioFormat)
  }

  // Calculate pronunciation scores
  const analysis = calculatePronunciationScores(transcribedText, expectedText)

  // Get attempt number
  const previousAttempts = await prisma.pronunciationAttempt.count({
    where: { userId, phraseId },
  })

  // Create pronunciation attempt record
  const attempt = await prisma.pronunciationAttempt.create({
    data: {
      userId,
      phraseId,
      audioUrl,
      audioDuration,
      audioFormat,
      transcribedText,
      expectedText,
      pronunciationScore: analysis.pronunciationScore,
      accuracyScore: analysis.accuracyScore,
      fluencyScore: analysis.fluencyScore,
      completenessScore: analysis.completenessScore,
      wordScores: analysis.wordScores,
      phonemeAnalysis: analysis.phonemeAnalysis,
      commonMistakes: analysis.commonMistakes,
      level: analysis.level,
      feedback: analysis.feedback,
      attemptNumber: previousAttempts + 1,
      studySessionId,
    },
  })

  // Update pronunciation progress
  await updatePronunciationProgress(userId, phraseId, analysis.pronunciationScore)

  // Update voice settings analytics
  await updateVoiceAnalytics(userId, analysis.pronunciationScore)

  // Update daily analytics
  await updateDailyAnalytics(userId, analysis.pronunciationScore, audioDuration)

  return {
    attempt,
    analysis,
    improvement: await getImprovementStats(userId, phraseId),
  }
}

/**
 * Calculate pronunciation scores using multiple metrics
 */
function calculatePronunciationScores(transcribed: string, expected: string) {
  const normalizedTranscribed = normalize(transcribed)
  const normalizedExpected = normalize(expected)

  // 1. Overall pronunciation score (Levenshtein-based)
  const pronunciationScore = calculateSimilarityScore(
    normalizedTranscribed,
    normalizedExpected
  )

  // 2. Word-level accuracy
  const wordAnalysis = analyzeWords(normalizedTranscribed, normalizedExpected)
  const accuracyScore = wordAnalysis.accuracy

  // 3. Fluency score (based on word order and completeness)
  const fluencyScore = calculateFluency(normalizedTranscribed, normalizedExpected)

  // 4. Completeness score (how much of expected text was spoken)
  const completenessScore = calculateCompleteness(normalizedTranscribed, normalizedExpected)

  // 5. Phoneme analysis (simplified - can be enhanced with real phoneme detection)
  const phonemeAnalysis = analyzePhonemes(transcribed, expected)

  // 6. Common mistakes detection
  const commonMistakes = detectCommonMistakes(transcribed, expected, wordAnalysis)

  // Determine performance level
  const level = getPerformanceLevel(pronunciationScore)

  // Generate feedback
  const feedback = generateFeedback(
    pronunciationScore,
    accuracyScore,
    fluencyScore,
    completenessScore,
    commonMistakes
  )

  return {
    pronunciationScore,
    accuracyScore,
    fluencyScore,
    completenessScore,
    wordScores: wordAnalysis.wordScores,
    phonemeAnalysis,
    commonMistakes,
    level,
    feedback,
  }
}

/**
 * Normalize text for comparison
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate similarity score (0-100) using Levenshtein distance
 */
function calculateSimilarityScore(str1: string, str2: string): number {
  if (str1 === str2) return 100

  const distance = levenshteinDistance(str1, str2)
  const maxLength = Math.max(str1.length, str2.length)

  if (maxLength === 0) return 0

  const similarity = ((maxLength - distance) / maxLength) * 100
  return Math.max(0, Math.min(100, Math.round(similarity)))
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Analyze individual words
 */
function analyzeWords(transcribed: string, expected: string) {
  const transcribedWords = transcribed.split(' ')
  const expectedWords = expected.split(' ')

  const wordScores: Array<{ word: string; expected: string; score: number; issues: string[] }> =
    []
  let correctWords = 0

  const maxLength = Math.max(transcribedWords.length, expectedWords.length)

  for (let i = 0; i < maxLength; i++) {
    const transcribedWord = transcribedWords[i] || ''
    const expectedWord = expectedWords[i] || ''

    if (!expectedWord) {
      wordScores.push({
        word: transcribedWord,
        expected: '',
        score: 0,
        issues: ['Extra word'],
      })
      continue
    }

    if (!transcribedWord) {
      wordScores.push({
        word: '',
        expected: expectedWord,
        score: 0,
        issues: ['Missing word'],
      })
      continue
    }

    const wordScore = calculateSimilarityScore(transcribedWord, expectedWord)
    const issues: string[] = []

    if (wordScore === 100) {
      correctWords++
    } else if (wordScore >= 80) {
      issues.push('Minor pronunciation issue')
    } else if (wordScore >= 60) {
      issues.push('Pronunciation needs work')
    } else {
      issues.push('Incorrect pronunciation')
    }

    wordScores.push({
      word: transcribedWord,
      expected: expectedWord,
      score: wordScore,
      issues,
    })
  }

  const accuracy = expectedWords.length > 0 ? correctWords / expectedWords.length : 0

  return {
    wordScores,
    accuracy,
    correctWords,
    totalWords: expectedWords.length,
  }
}

/**
 * Calculate fluency score
 */
function calculateFluency(transcribed: string, expected: string): number {
  const transcribedWords = transcribed.split(' ')
  const expectedWords = expected.split(' ')

  // Check word order preservation
  let orderedMatches = 0
  let lastMatchIndex = -1

  transcribedWords.forEach((word) => {
    const index = expectedWords.indexOf(word, lastMatchIndex + 1)
    if (index > lastMatchIndex) {
      orderedMatches++
      lastMatchIndex = index
    }
  })

  const fluency =
    expectedWords.length > 0 ? orderedMatches / expectedWords.length : 0

  return Math.round(fluency * 100) / 100
}

/**
 * Calculate completeness score
 */
function calculateCompleteness(transcribed: string, expected: string): number {
  const transcribedWords = new Set(transcribed.split(' '))
  const expectedWords = expected.split(' ')

  const matchedWords = expectedWords.filter((word) => transcribedWords.has(word)).length

  const completeness = expectedWords.length > 0 ? matchedWords / expectedWords.length : 0

  return Math.round(completeness * 100) / 100
}

/**
 * Analyze phonemes (simplified version)
 */
function analyzePhonemes(transcribed: string, expected: string) {
  // This is a simplified version. In production, use a proper phoneme analysis library
  // or API like Google Cloud Speech-to-Text with phoneme recognition

  const commonPhonemeSubstitutions: Record<string, string[]> = {
    th: ['t', 'd', 'f', 'v'],
    r: ['l', 'w'],
    l: ['r', 'w'],
    v: ['b', 'w'],
    w: ['v', 'u'],
  }

  const issues: Array<{ phoneme: string; substitution: string; position: number }> = []

  Object.entries(commonPhonemeSubstitutions).forEach(([phoneme, substitutions]) => {
    substitutions.forEach((sub) => {
      const regex = new RegExp(sub, 'gi')
      const expectedMatches = Array.from(expected.matchAll(new RegExp(phoneme, 'gi')))
      const transcribedMatches = Array.from(transcribed.matchAll(regex))

      if (expectedMatches.length > 0 && transcribedMatches.length > 0) {
        issues.push({
          phoneme,
          substitution: sub,
          position: transcribedMatches[0].index || 0,
        })
      }
    })
  })

  return issues
}

/**
 * Detect common pronunciation mistakes
 */
function detectCommonMistakes(
  transcribed: string,
  expected: string,
  wordAnalysis: any
): string[] {
  const mistakes: string[] = []

  // Missing words
  const missingWords = wordAnalysis.wordScores.filter((w: any) =>
    w.issues.includes('Missing word')
  )
  if (missingWords.length > 0) {
    mistakes.push(`Missing ${missingWords.length} word(s)`)
  }

  // Extra words
  const extraWords = wordAnalysis.wordScores.filter((w: any) =>
    w.issues.includes('Extra word')
  )
  if (extraWords.length > 0) {
    mistakes.push(`${extraWords.length} extra word(s)`)
  }

  // Poor pronunciation
  const poorWords = wordAnalysis.wordScores.filter(
    (w: any) => w.score > 0 && w.score < 70
  )
  if (poorWords.length > 0) {
    mistakes.push(
      `Pronunciation issues: ${poorWords.map((w: any) => w.expected).join(', ')}`
    )
  }

  // Word order
  if (wordAnalysis.accuracy < 0.8) {
    mistakes.push('Word order issues detected')
  }

  return mistakes
}

/**
 * Get performance level from score
 */
function getPerformanceLevel(score: number): string {
  if (score >= 95) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 60) return 'fair'
  return 'poor'
}

/**
 * Generate user-friendly feedback
 */
function generateFeedback(
  score: number,
  accuracy: number,
  fluency: number,
  completeness: number,
  mistakes: string[]
): string {
  let feedback = ''

  if (score >= 95) {
    feedback = '🎉 Perfect pronunciation! Excellent work!'
  } else if (score >= 85) {
    feedback = '🌟 Excellent pronunciation! Keep up the great work!'
  } else if (score >= 70) {
    feedback = '👍 Good pronunciation! A few minor improvements needed.'
  } else if (score >= 50) {
    feedback = '🔄 Fair pronunciation. Keep practicing!'
  } else {
    feedback = '💪 Keep practicing! Try speaking slower and clearer.'
  }

  // Add specific advice
  if (accuracy < 0.7) {
    feedback += ' Focus on pronouncing each word clearly.'
  }

  if (fluency < 0.7) {
    feedback += ' Try to maintain a smooth flow when speaking.'
  }

  if (completeness < 0.8) {
    feedback += ' Make sure to say all the words in the phrase.'
  }

  if (mistakes.length > 0) {
    feedback += ` Issues detected: ${mistakes.slice(0, 2).join(', ')}.`
  }

  return feedback
}

/**
 * Update pronunciation progress for user/phrase
 */
async function updatePronunciationProgress(
  userId: string,
  phraseId: string,
  newScore: number
) {
  const existing = await prisma.pronunciationProgress.findUnique({
    where: {
      userId_phraseId: {
        userId,
        phraseId,
      },
    },
  })

  if (!existing) {
    // First attempt
    return await prisma.pronunciationProgress.create({
      data: {
        userId,
        phraseId,
        firstAttemptScore: newScore,
        lastAttemptScore: newScore,
        bestScore: newScore,
        averageScore: newScore,
        attemptCount: 1,
        masteryAchieved: newScore >= 90,
        masteryDate: newScore >= 90 ? new Date() : undefined,
      },
    })
  }

  // Update existing progress
  const newAttemptCount = existing.attemptCount + 1
  const newAverageScore =
    (existing.averageScore * existing.attemptCount + newScore) / newAttemptCount
  const newBestScore = Math.max(existing.bestScore, newScore)
  const improvementRate =
    ((newScore - existing.firstAttemptScore) / existing.firstAttemptScore) * 100

  return await prisma.pronunciationProgress.update({
    where: {
      userId_phraseId: {
        userId,
        phraseId,
      },
    },
    data: {
      lastAttemptScore: newScore,
      bestScore: newBestScore,
      averageScore: newAverageScore,
      attemptCount: newAttemptCount,
      improvementRate,
      masteryAchieved: newBestScore >= 90,
      masteryDate: newBestScore >= 90 && !existing.masteryAchieved ? new Date() : existing.masteryDate,
      lastPracticed: new Date(),
    },
  })
}

/**
 * Update voice analytics for user
 */
async function updateVoiceAnalytics(userId: string, score: number) {
  const settings = await prisma.voiceSettings.findUnique({
    where: { userId },
  })

  if (!settings) {
    return await prisma.voiceSettings.create({
      data: {
        userId,
        totalAttempts: 1,
        averageScore: score,
        bestScore: score,
      },
    })
  }

  const newTotalAttempts = settings.totalAttempts + 1
  const newAverageScore =
    (settings.averageScore * settings.totalAttempts + score) / newTotalAttempts
  const newBestScore = Math.max(settings.bestScore, score)

  return await prisma.voiceSettings.update({
    where: { userId },
    data: {
      totalAttempts: newTotalAttempts,
      averageScore: newAverageScore,
      bestScore: newBestScore,
    },
  })
}

/**
 * Update daily analytics
 */
async function updateDailyAnalytics(
  userId: string,
  score: number,
  practiceTime: number
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.speechAnalytics.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  })

  if (!existing) {
    return await prisma.speechAnalytics.create({
      data: {
        userId,
        date: today,
        attemptsToday: 1,
        averageScore: score,
        practiceTime,
        phrasesCompleted: score >= 70 ? 1 : 0,
        currentStreak: 1,
      },
    })
  }

  const newAttempts = existing.attemptsToday + 1
  const newAverageScore =
    (existing.averageScore * existing.attemptsToday + score) / newAttempts

  return await prisma.speechAnalytics.update({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    data: {
      attemptsToday: newAttempts,
      averageScore: newAverageScore,
      practiceTime: existing.practiceTime + practiceTime,
      phrasesCompleted:
        score >= 70
          ? existing.phrasesCompleted + 1
          : existing.phrasesCompleted,
    },
  })
}

/**
 * Get improvement stats for user/phrase
 */
async function getImprovementStats(userId: string, phraseId: string) {
  const progress = await prisma.pronunciationProgress.findUnique({
    where: {
      userId_phraseId: {
        userId,
        phraseId,
      },
    },
  })

  if (!progress) {
    return null
  }

  return {
    improvement: progress.lastAttemptScore - progress.firstAttemptScore,
    improvementRate: progress.improvementRate,
    attemptCount: progress.attemptCount,
    bestScore: progress.bestScore,
    masteryAchieved: progress.masteryAchieved,
  }
}

/**
 * Upload audio to S3
 */
async function uploadAudioToS3(
  userId: string,
  phraseId: string,
  audioBuffer: Buffer,
  format: string
): Promise<string> {
  if (!s3) {
    throw new Error('S3 not configured')
  }

  const key = `pronunciation/${userId}/${phraseId}/${Date.now()}.${format}`

  await s3
    .putObject({
      Bucket: process.env.AWS_S3_BUCKET || 'english-flow-audio',
      Key: key,
      Body: audioBuffer,
      ContentType: `audio/${format}`,
    })
    .promise()

  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`
}

/**
 * Get user pronunciation history
 */
export async function getPronunciationHistory(
  userId: string,
  phraseId?: string,
  limit: number = 20
) {
  return await prisma.pronunciationAttempt.findMany({
    where: {
      userId,
      ...(phraseId && { phraseId }),
    },
    include: {
      phrase: {
        select: {
          english: true,
          portuguese: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

/**
 * Get user voice statistics
 */
export async function getVoiceStatistics(userId: string) {
  const [settings, progress, recentAnalytics] = await Promise.all([
    prisma.voiceSettings.findUnique({
      where: { userId },
    }),
    prisma.pronunciationProgress.findMany({
      where: { userId },
      orderBy: { lastPracticed: 'desc' },
      take: 10,
    }),
    prisma.speechAnalytics.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    }),
  ])

  // Calculate stats
  const totalPracticeTime = recentAnalytics.reduce((sum, a) => sum + a.practiceTime, 0)
  const totalAttempts = recentAnalytics.reduce((sum, a) => sum + a.attemptsToday, 0)
  const masteredPhrases = progress.filter((p) => p.masteryAchieved).length

  return {
    settings,
    totalAttempts: settings?.totalAttempts || 0,
    averageScore: settings?.averageScore || 0,
    bestScore: settings?.bestScore || 0,
    totalPracticeTime,
    masteredPhrases,
    recentProgress: progress,
    dailyAnalytics: recentAnalytics,
  }
}

/**
 * Update voice settings
 */
export async function updateVoiceSettings(userId: string, settings: any) {
  return await prisma.voiceSettings.upsert({
    where: { userId },
    create: {
      userId,
      ...settings,
    },
    update: settings,
  })
}

export default {
  analyzePronunciation,
  getPronunciationHistory,
  getVoiceStatistics,
  updateVoiceSettings,
}
