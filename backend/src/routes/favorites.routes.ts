import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
  const data = await prisma.favorite.findMany()
  res.json({ success: true, data })
})

router.post('/', async (req, res) => {
  const data = await prisma.favorite.create({ data: req.body })
  res.json({ success: true, data })
})

export default router
