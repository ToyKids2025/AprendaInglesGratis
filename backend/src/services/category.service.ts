/**
 * CATEGORY SERVICE
 * Content organization and advanced filtering
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get all categories (hierarchical)
 */
export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    include: {
      children: {
        where: {
          isActive: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
      _count: {
        select: {
          phrases: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  })

  // Filter only top-level categories
  return categories.filter((c) => !c.parentId)
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: {
          isActive: true,
        },
      },
      _count: {
        select: {
          phrases: true,
        },
      },
    },
  })
}

/**
 * Create category
 */
export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parentId?: string
  order?: number
}) {
  return await prisma.category.create({
    data,
  })
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: {
    name?: string
    slug?: string
    description?: string
    icon?: string
    color?: string
    parentId?: string
    order?: number
    isActive?: boolean
  }
) {
  return await prisma.category.update({
    where: { id },
    data,
  })
}

/**
 * Get all tags
 */
export async function getTags(limit: number = 100) {
  return await prisma.tag.findMany({
    orderBy: {
      usageCount: 'desc',
    },
    take: limit,
  })
}

/**
 * Get tag by slug
 */
export async function getTagBySlug(slug: string) {
  return await prisma.tag.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          phrases: true,
        },
      },
    },
  })
}

/**
 * Create or get tag
 */
export async function createOrGetTag(name: string) {
  const slug = name.toLowerCase().replace(/\s+/g, '-')

  let tag = await prisma.tag.findUnique({
    where: { slug },
  })

  if (!tag) {
    tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    })
  }

  return tag
}

/**
 * Get all topics
 */
export async function getTopics(categoryId?: string, level?: string) {
  const where: any = {
    isActive: true,
  }

  if (categoryId) where.categoryId = categoryId
  if (level) where.level = level

  return await prisma.topic.findMany({
    where,
    include: {
      _count: {
        select: {
          phrases: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

/**
 * Create topic
 */
export async function createTopic(data: {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  categoryId?: string
  level?: string
}) {
  return await prisma.topic.create({
    data,
  })
}

/**
 * Get all situations
 */
export async function getSituations(formality?: string, setting?: string) {
  const where: any = {
    isActive: true,
  }

  if (formality) where.formality = formality
  if (setting) where.setting = setting

  return await prisma.situation.findMany({
    where,
    include: {
      _count: {
        select: {
          phrases: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })
}

/**
 * Create situation
 */
export async function createSituation(data: {
  name: string
  slug: string
  description?: string
  icon?: string
  formality?: string
  setting?: string
}) {
  return await prisma.situation.create({
    data,
  })
}

/**
 * Add category to phrase
 */
export async function addPhraseCategory(phraseId: string, categoryId: string) {
  // Check if already exists
  const existing = await prisma.phraseCategory.findUnique({
    where: {
      phraseId_categoryId: {
        phraseId,
        categoryId,
      },
    },
  })

  if (existing) return existing

  // Create association
  const association = await prisma.phraseCategory.create({
    data: {
      phraseId,
      categoryId,
    },
  })

  // Update category phrase count
  await prisma.category.update({
    where: { id: categoryId },
    data: {
      phraseCount: {
        increment: 1,
      },
    },
  })

  return association
}

/**
 * Add tag to phrase
 */
export async function addPhraseTag(phraseId: string, tagName: string) {
  // Get or create tag
  const tag = await createOrGetTag(tagName)

  // Check if already exists
  const existing = await prisma.phraseTag.findUnique({
    where: {
      phraseId_tagId: {
        phraseId,
        tagId: tag.id,
      },
    },
  })

  if (existing) return existing

  // Create association
  const association = await prisma.phraseTag.create({
    data: {
      phraseId,
      tagId: tag.id,
    },
  })

  // Update tag usage count
  await prisma.tag.update({
    where: { id: tag.id },
    data: {
      usageCount: {
        increment: 1,
      },
    },
  })

  return association
}

/**
 * Add topic to phrase
 */
export async function addPhraseTopic(phraseId: string, topicId: string) {
  const existing = await prisma.phraseTopic.findUnique({
    where: {
      phraseId_topicId: {
        phraseId,
        topicId,
      },
    },
  })

  if (existing) return existing

  const association = await prisma.phraseTopic.create({
    data: {
      phraseId,
      topicId,
    },
  })

  await prisma.topic.update({
    where: { id: topicId },
    data: {
      phraseCount: {
        increment: 1,
      },
    },
  })

  return association
}

/**
 * Add situation to phrase
 */
export async function addPhraseSituation(phraseId: string, situationId: string) {
  const existing = await prisma.phraseSituation.findUnique({
    where: {
      phraseId_situationId: {
        phraseId,
        situationId,
      },
    },
  })

  if (existing) return existing

  const association = await prisma.phraseSituation.create({
    data: {
      phraseId,
      situationId,
    },
  })

  await prisma.situation.update({
    where: { id: situationId },
    data: {
      phraseCount: {
        increment: 1,
      },
    },
  })

  return association
}

/**
 * Advanced phrase search with filters
 */
export async function searchPhrases(filters: {
  query?: string
  categoryIds?: string[]
  tagIds?: string[]
  topicIds?: string[]
  situationIds?: string[]
  level?: string
  difficulty?: string
  limit?: number
  offset?: number
}) {
  const { query, categoryIds, tagIds, topicIds, situationIds, level, difficulty, limit = 50, offset = 0 } = filters

  const where: any = {}

  // Text search
  if (query) {
    where.OR = [
      { english: { contains: query, mode: 'insensitive' } },
      { portuguese: { contains: query, mode: 'insensitive' } },
    ]
  }

  // Level filter
  if (level) {
    where.level = level
  }

  // Difficulty filter
  if (difficulty) {
    where.difficulty = difficulty
  }

  // Category filter
  if (categoryIds && categoryIds.length > 0) {
    where.categories = {
      some: {
        categoryId: {
          in: categoryIds,
        },
      },
    }
  }

  // Tag filter
  if (tagIds && tagIds.length > 0) {
    where.tags = {
      some: {
        tagId: {
          in: tagIds,
        },
      },
    }
  }

  // Topic filter
  if (topicIds && topicIds.length > 0) {
    where.topics = {
      some: {
        topicId: {
          in: topicIds,
        },
      },
    }
  }

  // Situation filter
  if (situationIds && situationIds.length > 0) {
    where.situations = {
      some: {
        situationId: {
          in: situationIds,
        },
      },
    }
  }

  const [phrases, total] = await Promise.all([
    prisma.phrase.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        topics: {
          include: {
            topic: true,
          },
        },
        situations: {
          include: {
            situation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    }),
    prisma.phrase.count({ where }),
  ])

  return {
    phrases,
    total,
    limit,
    offset,
  }
}

/**
 * Save user search
 */
export async function saveSearch(
  userId: string,
  name: string,
  filters: {
    query?: string
    categoryIds?: string[]
    tagIds?: string[]
    topicIds?: string[]
    situationIds?: string[]
    level?: string
    difficulty?: string
  }
) {
  const result = await searchPhrases(filters)

  return await prisma.savedSearch.create({
    data: {
      userId,
      name,
      query: filters.query,
      categoryIds: filters.categoryIds,
      tagIds: filters.tagIds,
      topicIds: filters.topicIds,
      situationIds: filters.situationIds,
      level: filters.level,
      difficulty: filters.difficulty,
      resultCount: result.total,
    },
  })
}

/**
 * Get user's saved searches
 */
export async function getSavedSearches(userId: string) {
  return await prisma.savedSearch.findMany({
    where: {
      userId,
    },
    orderBy: {
      lastUsed: 'desc',
    },
  })
}

export default {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  getTags,
  getTagBySlug,
  createOrGetTag,
  getTopics,
  createTopic,
  getSituations,
  createSituation,
  addPhraseCategory,
  addPhraseTag,
  addPhraseTopic,
  addPhraseSituation,
  searchPhrases,
  saveSearch,
  getSavedSearches,
}
