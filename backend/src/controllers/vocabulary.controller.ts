/**
 * VOCABULARY CONTROLLER
 * Request handlers for vocabulary builder endpoints
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as vocabularyService from '../services/vocabulary.service'

/**
 * Validation schemas
 */
const createListSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  isPublic: z.boolean().optional(),
  dailyGoal: z.number().min(1).max(500).optional(),
})

const addWordSchema = z.object({
  listId: z.string().uuid(),
  word: z.string().min(1).max(100),
  translation: z.string().min(1).max(200),
  definition: z.string().max(1000).optional(),
  pronunciation: z.string().max(200).optional(),
  exampleSentence: z.string().max(500).optional(),
  exampleTranslation: z.string().max(500).optional(),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'other']).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
})

const reviewWordSchema = z.object({
  wordId: z.string().uuid(),
  quality: z.number().min(0).max(5),
  timeTaken: z.number().min(0).optional(),
  answer: z.string().max(500).optional(),
})

const searchWordsSchema = z.object({
  query: z.string().optional(),
  listId: z.string().uuid().optional(),
  masteryLevel: z.number().min(0).max(5).optional(),
  partOfSpeech: z.string().optional(),
  isFavorite: z.boolean().optional(),
})

const shareListSchema = z.object({
  listId: z.string().uuid(),
  expiresInDays: z.number().min(1).max(365).optional(),
})

/**
 * Create vocabulary list
 */
export async function createList(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = createListSchema.parse(req.body)

    const list = await vocabularyService.createList(userId, data)

    res.json({
      success: true,
      data: list,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get user's vocabulary lists
 */
export async function getUserLists(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const lists = await vocabularyService.getUserLists(userId)

    res.json({
      success: true,
      data: lists,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Add word to list
 */
export async function addWord(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = addWordSchema.parse(req.body)

    const word = await vocabularyService.addWord(userId, data.listId, data)

    res.json({
      success: true,
      data: word,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get words due for review
 */
export async function getDueWords(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const limit = parseInt(req.query.limit as string) || 20

    const words = await vocabularyService.getDueWords(userId, limit)

    res.json({
      success: true,
      data: words,
      count: words.length,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Review word (Spaced Repetition)
 */
export async function reviewWord(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = reviewWordSchema.parse(req.body)

    const updatedWord = await vocabularyService.reviewWord(
      userId,
      data.wordId,
      data.quality,
      data.timeTaken,
      data.answer
    )

    res.json({
      success: true,
      data: updatedWord,
      message: data.quality >= 3 ? 'Great job!' : 'Keep practicing!',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get vocabulary statistics
 */
export async function getStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const stats = await vocabularyService.getStats(userId)

    res.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Search words in vocabulary
 */
export async function searchWords(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const filters = searchWordsSchema.parse(req.query)
    const query = filters.query || ''

    const words = await vocabularyService.searchWords(userId, query, {
      listId: filters.listId,
      masteryLevel: filters.masteryLevel,
      partOfSpeech: filters.partOfSpeech,
      isFavorite: filters.isFavorite,
    })

    res.json({
      success: true,
      data: words,
      count: words.length,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Share vocabulary list
 */
export async function shareList(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = shareListSchema.parse(req.body)

    const shareInfo = await vocabularyService.shareList(
      userId,
      data.listId,
      data.expiresInDays
    )

    res.json({
      success: true,
      data: shareInfo,
      message: 'List shared successfully',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Copy shared list
 */
export async function copySharedList(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { shareCode } = req.body

    if (!shareCode) {
      return res.status(400).json({
        success: false,
        error: 'Share code is required',
      })
    }

    const newList = await vocabularyService.copySharedList(userId, shareCode)

    res.json({
      success: true,
      data: newList,
      message: 'List copied successfully to your vocabulary',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get list progress
 */
export async function getListProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { listId } = req.params

    if (!listId) {
      return res.status(400).json({
        success: false,
        error: 'List ID is required',
      })
    }

    const progress = await vocabularyService.getListProgress(userId, listId)

    res.json({
      success: true,
      data: progress,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Delete word
 */
export async function deleteWord(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { wordId } = req.params

    if (!wordId) {
      return res.status(400).json({
        success: false,
        error: 'Word ID is required',
      })
    }

    await vocabularyService.deleteWord(userId, wordId)

    res.json({
      success: true,
      message: 'Word deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Toggle favorite word
 */
export async function toggleFavorite(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { wordId } = req.params

    if (!wordId) {
      return res.status(400).json({
        success: false,
        error: 'Word ID is required',
      })
    }

    const updatedWord = await vocabularyService.toggleFavorite(userId, wordId)

    res.json({
      success: true,
      data: updatedWord,
      message: updatedWord.isFavorite ? 'Added to favorites' : 'Removed from favorites',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get review history
 */
export async function getReviewHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const days = parseInt(req.query.days as string) || 30

    const history = await vocabularyService.getReviewHistory(userId, days)

    res.json({
      success: true,
      data: history,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Update vocabulary list
 */
export async function updateList(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { listId } = req.params
    const updates = createListSchema.partial().parse(req.body)

    if (!listId) {
      return res.status(400).json({
        success: false,
        error: 'List ID is required',
      })
    }

    // Verify ownership
    const lists = await vocabularyService.getUserLists(userId)
    const list = lists.find((l) => l.id === listId)

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'List not found or access denied',
      })
    }

    // Update list
    const updatedList = await vocabularyService.updateList(userId, listId, updates)

    res.json({
      success: true,
      data: updatedList,
      message: 'List updated successfully',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Delete vocabulary list
 */
export async function deleteList(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { listId } = req.params

    if (!listId) {
      return res.status(400).json({
        success: false,
        error: 'List ID is required',
      })
    }

    await vocabularyService.deleteList(userId, listId)

    res.json({
      success: true,
      message: 'List deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Update word
 */
export async function updateWord(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { wordId } = req.params
    const updates = addWordSchema.omit({ listId: true }).partial().parse(req.body)

    if (!wordId) {
      return res.status(400).json({
        success: false,
        error: 'Word ID is required',
      })
    }

    const updatedWord = await vocabularyService.updateWord(userId, wordId, updates)

    res.json({
      success: true,
      data: updatedWord,
      message: 'Word updated successfully',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get single word details
 */
export async function getWord(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { wordId } = req.params

    if (!wordId) {
      return res.status(400).json({
        success: false,
        error: 'Word ID is required',
      })
    }

    const word = await vocabularyService.getWord(userId, wordId)

    res.json({
      success: true,
      data: word,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get words by list
 */
export async function getListWords(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { listId } = req.params
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    if (!listId) {
      return res.status(400).json({
        success: false,
        error: 'List ID is required',
      })
    }

    const words = await vocabularyService.getListWords(userId, listId, limit, offset)

    res.json({
      success: true,
      data: words,
      count: words.length,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Bulk add words to list
 */
export async function bulkAddWords(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { listId, words } = req.body

    if (!listId || !Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'List ID and words array are required',
      })
    }

    if (words.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 words per bulk operation',
      })
    }

    // Validate each word
    const validatedWords = words.map((word) =>
      addWordSchema.omit({ listId: true }).parse(word)
    )

    const addedWords = await vocabularyService.bulkAddWords(userId, listId, validatedWords)

    res.json({
      success: true,
      data: addedWords,
      count: addedWords.length,
      message: `${addedWords.length} words added successfully`,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}
