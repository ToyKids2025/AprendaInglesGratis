export async function searchPhrases(query: string, filters: any = {}) {
  return await prisma.phrase.findMany({
    where: {
      OR: [
        { english: { contains: query, mode: 'insensitive' } },
        { portuguese: { contains: query, mode: 'insensitive' } }
      ],
      ...filters
    },
    take: 50
  })
}

export async function searchUsers(query: string) {
  return await prisma.user.findMany({
    where: { name: { contains: query, mode: 'insensitive' } },
    take: 20
  })
}
