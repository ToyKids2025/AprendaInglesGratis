import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const idioms = await prisma.idiom.findMany()
  res.json({ success: true, data: idioms })
})

router.post('/save', async (req, res) => {
  const { userId, idiomId, notes } = req.body
  const saved = await prisma.userIdiom.create({ data: { userId, idiomId, notes } })
  res.json({ success: true, data: saved })
})

export default router
