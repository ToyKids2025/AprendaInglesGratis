import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const router = Router()
const prisma = new PrismaClient()

router.get('/exams', async (req, res) => {
  const exams = await prisma.testPrepExam.findMany()
  res.json({ success: true, data: exams })
})

router.post('/submit', async (req, res) => {
  const { userId, examId, answers } = req.body
  const exam = await prisma.testPrepExam.findUnique({ where: { id: examId } })
  const questions = exam?.questions as any[]
  const correctCount = answers.filter((a: any, i: number) => a.answer === questions[i].correctAnswer).length
  const score = (correctCount / questions.length) * 100
  
  const attempt = await prisma.testAttempt.create({
    data: { userId, examId, answers, score, completedAt: new Date() },
  })
  res.json({ success: true, data: attempt })
})

export default router
