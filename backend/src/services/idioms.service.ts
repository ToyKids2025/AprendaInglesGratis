import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function createIdiom(data: any) {
  return await prisma.idiom.create({ data })
}

export async function getIdioms(filters?: any) {
  return await prisma.idiom.findMany({ where: filters || {} })
}

export async function saveIdiom(userId: string, idiomId: string, notes?: string) {
  return await prisma.userIdiom.create({
    data: { userId, idiomId, notes },
  })
}

export async function markLearned(userId: string, idiomId: string) {
  return await prisma.userIdiom.updateMany({
    where: { userId, idiomId },
    data: { isLearned: true },
  })
}
