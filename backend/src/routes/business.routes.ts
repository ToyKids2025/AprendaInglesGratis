import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const router = Router()
const prisma = new PrismaClient()

router.get('/lessons', async (req, res) => {
  const lessons = await prisma.businessLesson.findMany()
  res.json({ success: true, data: lessons })
})

router.get('/scenarios', async (req, res) => {
  const scenarios = await prisma.businessScenario.findMany()
  res.json({ success: true, data: scenarios })
})

export default router
