import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const router = Router()
const prisma = new PrismaClient()

router.get('/exercises', async (req, res) => {
  const exercises = await prisma.grammarExercise.findMany()
  res.json({ success: true, data: exercises })
})

router.post('/submit', async (req, res) => {
  const { userId, exerciseId, answers } = req.body
  const exercise = await prisma.grammarExercise.findUnique({ where: { id: exerciseId } })
  const questions = exercise?.questions as any[]
  const correctCount = answers.filter((a: any, i: number) => a.answer === questions[i].correctAnswer).length
  const score = (correctCount / questions.length) * 100
  
  const attempt = await prisma.grammarAttempt.create({
    data: { userId, exerciseId, answers, score, completedAt: new Date() },
  })
  res.json({ success: true, data: attempt })
})

export default router
