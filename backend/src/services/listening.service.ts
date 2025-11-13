/**
 * LISTENING EXERCISES SERVICE
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createExercise(data: any) {
  return await prisma.listeningExercise.create({ data })
}

export async function getExercise(exerciseId: string) {
  return await prisma.listeningExercise.findUnique({
    where: { id: exerciseId },
  })
}

export async function getExercises(filters?: any) {
  const where: any = { isPublished: true }
  if (filters?.level) where.level = filters.level
  if (filters?.type) where.type = filters.type
  if (filters?.accent) where.accent = filters.accent

  return await prisma.listeningExercise.findMany({ where })
}

export async function startExercise(userId: string, exerciseId: string) {
  return await prisma.listeningAttempt.create({
    data: { userId, exerciseId },
  })
}

export async function submitAnswer(attemptId: string, questionId: string, answer: string) {
  const attempt = await prisma.listeningAttempt.findUnique({
    where: { id: attemptId },
    include: { exercise: true },
  })

  if (!attempt) throw new Error('Attempt not found')

  const questions = attempt.exercise.questions as any[]
  const question = questions.find((q: any) => q.id === questionId)
  const isCorrect = question?.correctAnswer === answer

  const answers = [...(attempt.answers as any[]), { questionId, answer, isCorrect }]
  const correctCount = answers.filter((a: any) => a.isCorrect).length
  const score = (correctCount / questions.length) * 100

  return await prisma.listeningAttempt.update({
    where: { id: attemptId },
    data: { answers, score },
  })
}

export async function completeExercise(attemptId: string, userId: string) {
  const attempt = await prisma.listeningAttempt.update({
    where: { id: attemptId },
    data: { completedAt: new Date() },
  })

  await updateProgress(userId, attempt.score || 0)
  return attempt
}

async function updateProgress(userId: string, score: number) {
  const progress = await prisma.listeningProgress.findUnique({
    where: { userId },
  })

  if (progress) {
    const newAvg = ((progress.avgScore || 0) * progress.totalExercises + score) / (progress.totalExercises + 1)
    await prisma.listeningProgress.update({
      where: { userId },
      data: {
        totalExercises: { increment: 1 },
        avgScore: newAvg,
      },
    })
  } else {
    await prisma.listeningProgress.create({
      data: { userId, totalExercises: 1, avgScore: score },
    })
  }
}

export async function getProgress(userId: string) {
  return await prisma.listeningProgress.findUnique({
    where: { userId },
  }) || await prisma.listeningProgress.create({
    data: { userId },
  })
}
