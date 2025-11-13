import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function createExercise(data: any) {
  return await prisma.grammarExercise.create({ data })
}

export async function getExercises(filters?: any) {
  return await prisma.grammarExercise.findMany({ where: filters || {} })
}

export async function submitExercise(userId: string, exerciseId: string, answers: any[]) {
  const exercise = await prisma.grammarExercise.findUnique({ where: { id: exerciseId } })
  const questions = exercise?.questions as any[]
  const correctCount = answers.filter((a, i) => a.answer === questions[i].correctAnswer).length
  const score = (correctCount / questions.length) * 100
  
  return await prisma.grammarAttempt.create({
    data: { userId, exerciseId, answers, score, completedAt: new Date() },
  })
}
