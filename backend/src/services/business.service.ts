import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function createLesson(data: any) {
  return await prisma.businessLesson.create({ data })
}

export async function getLessons(topic?: string) {
  return await prisma.businessLesson.findMany({
    where: topic ? { topic } : {},
  })
}

export async function createScenario(data: any) {
  return await prisma.businessScenario.create({ data })
}

export async function getScenarios() {
  return await prisma.businessScenario.findMany()
}
