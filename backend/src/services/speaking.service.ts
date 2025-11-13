import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function createExercise(data: any) {
  return await prisma.speakingExercise.create({ data })
}

export async function getExercises(filters?: any) {
  const where: any = { isPublished: true }
  if (filters?.level) where.level = filters.level
  return await prisma.speakingExercise.findMany({ where })
}

export async function saveRecording(userId: string, exerciseId: string, audioUrl: string, duration: number) {
  return await prisma.speakingRecording.create({
    data: { userId, exerciseId, audioUrl, duration },
  })
}

export async function analyzeRecording(recordingId: string) {
  // Placeholder for AI analysis integration
  const scores = {
    fluencyScore: 75,
    pronunciationScore: 80,
    grammarScore: 85,
    vocabularyScore: 78,
    overallScore: 79.5,
  }
  
  return await prisma.speakingRecording.update({
    where: { id: recordingId },
    data: { ...scores, feedback: 'Good pronunciation. Work on fluency.' },
  })
}

export async function getUserRecordings(userId: string) {
  return await prisma.speakingRecording.findMany({
    where: { userId },
    include: { exercise: true },
    orderBy: { createdAt: 'desc' },
  })
}

// Pronunciation
export async function getPronunciationExercises() {
  return await prisma.pronunciationExercise.findMany()
}

export async function submitPronunciation(userId: string, exerciseId: string, userAudioUrl: string) {
  const accuracyScore = Math.random() * 100 // Placeholder for real analysis
  
  return await prisma.pronunciationAttempt.create({
    data: {
      userId,
      exerciseId,
      userAudioUrl,
      accuracyScore,
      feedback: accuracyScore > 80 ? 'Excellent!' : 'Keep practicing!',
    },
  })
}
