import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function createExam(data: any) {
  return await prisma.testPrepExam.create({ data })
}

export async function getExams(examType?: string) {
  return await prisma.testPrepExam.findMany({
    where: examType ? { examType } : {},
  })
}

export async function submitExam(userId: string, examId: string, answers: any[]) {
  const exam = await prisma.testPrepExam.findUnique({ where: { id: examId } })
  const questions = exam?.questions as any[]
  const correctCount = answers.filter((a, i) => a.answer === questions[i].correctAnswer).length
  const score = (correctCount / questions.length) * 100
  
  return await prisma.testAttempt.create({
    data: { userId, examId, answers, score, completedAt: new Date() },
  })
}
