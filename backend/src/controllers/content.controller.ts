/**
 * CONTENT CONTROLLER
 * Categories, topics, tags, and advanced search
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as categoryService from '../services/category.service'

// Validation schemas
const searchSchema = z.object({
  query: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  topicIds: z.array(z.string()).optional(),
  situationIds: z.array(z.string()).optional(),
  level: z.string().optional(),
  difficulty: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

const saveSearchSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.object({
    query: z.string().optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
    topicIds: z.array(z.string()).optional(),
    situationIds: z.array(z.string()).optional(),
    level: z.string().optional(),
    difficulty: z.string().optional(),
  }),
})

/**
 * GET /api/content/categories
 * Get all categories
 */
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await categoryService.getCategories()

    res.json({
      success: true,
      categories,
    })
  } catch (error: any) {
    console.error('Failed to get categories:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/content/categories/:slug
 * Get category by slug
 */
export async function getCategoryBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params

    const category = await categoryService.getCategoryBySlug(slug)

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      })
    }

    res.json({
      success: true,
      category,
    })
  } catch (error: any) {
    console.error('Failed to get category:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/content/tags
 * Get all tags
 */
export async function getTags(req: Request, res: Response) {
  try {
    const { limit = 100 } = req.query

    const tags = await categoryService.getTags(Number(limit))

    res.json({
      success: true,
      tags,
    })
  } catch (error: any) {
    console.error('Failed to get tags:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/content/topics
 * Get all topics
 */
export async function getTopics(req: Request, res: Response) {
  try {
    const { categoryId, level } = req.query

    const topics = await categoryService.getTopics(
      categoryId as string | undefined,
      level as string | undefined
    )

    res.json({
      success: true,
      topics,
    })
  } catch (error: any) {
    console.error('Failed to get topics:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/content/situations
 * Get all situations
 */
export async function getSituations(req: Request, res: Response) {
  try {
    const { formality, setting } = req.query

    const situations = await categoryService.getSituations(
      formality as string | undefined,
      setting as string | undefined
    )

    res.json({
      success: true,
      situations,
    })
  } catch (error: any) {
    console.error('Failed to get situations:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/content/search
 * Advanced phrase search
 */
export async function searchPhrases(req: Request, res: Response) {
  try {
    const validatedData = searchSchema.parse(req.body)

    const result = await categoryService.searchPhrases(validatedData)

    res.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Failed to search phrases:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/content/search/save
 * Save search for later
 */
export async function saveSearch(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = saveSearchSchema.parse(req.body)

    const savedSearch = await categoryService.saveSearch(
      userId,
      validatedData.name,
      validatedData.filters
    )

    res.json({
      success: true,
      savedSearch,
    })
  } catch (error: any) {
    console.error('Failed to save search:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/content/search/saved
 * Get user's saved searches
 */
export async function getSavedSearches(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const searches = await categoryService.getSavedSearches(userId)

    res.json({
      success: true,
      searches,
    })
  } catch (error: any) {
    console.error('Failed to get saved searches:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  getCategories,
  getCategoryBySlug,
  getTags,
  getTopics,
  getSituations,
  searchPhrases,
  saveSearch,
  getSavedSearches,
}
