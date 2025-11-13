/**
 * READING COMPREHENSION CONTROLLER
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as readingService from '../services/reading.service'

const createPassageSchema = z.object({
  title: z.string().min(1).max(200),
  author: z.string().optional(),
  source: z.string().optional(),
  content: z.string().min(100),
  excerpt: z.string().optional(),
  type: z.enum(['article', 'story', 'essay', 'news', 'academic', 'dialogue']),
  genre: z.string().optional(),
  topic: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  vocabularyLevel: z.enum(['basic', 'intermediate', 'advanced']).optional(),
  keyVocabulary: z.array(z.string()).optional(),
  idioms: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
  isPremium: z.boolean().optional(),
})

const addQuestionSchema = z.object({
  question: z.string().min(1),
  questionType: z.enum(['multiple_choice', 'true_false', 'short_answer', 'inference', 'vocabulary']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  acceptableAnswers: z.array(z.string()).optional(),
  relevantParagraph: z.number().optional(),
  relevantText: z.string().optional(),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  skillTested: z.enum(['main_idea', 'details', 'inference', 'vocabulary', 'tone', 'purpose']).optional(),
  order: z.number().optional(),
  points: z.number().optional(),
})

const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string().min(1),
  timeSpent: z.number().min(0).optional(),
})

const createHighlightSchema = z.object({
  text: z.string().min(1),
  startOffset: z.number().min(0),
  endOffset: z.number().min(0),
  color: z.enum(['yellow', 'green', 'blue', 'pink']).optional(),
  category: z.enum(['important', 'vocabulary', 'question', 'confusing']).optional(),
  note: z.string().optional(),
})

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  paragraph: z.number().optional(),
  type: z.enum(['general', 'question', 'summary', 'reflection']).optional(),
  isPrivate: z.boolean().optional(),
})

const saveVocabularySchema = z.object({
  word: z.string().min(1),
  definition: z.string().optional(),
  context: z.string().optional(),
  userNote: z.string().optional(),
})

const createCollectionSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  type: z.enum(['curated', 'course', 'level_based', 'topic_based']),
  passageIds: z.array(z.string().uuid()).optional(),
  isOrdered: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  level: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

const createChallengeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  type: z.enum(['speed_reading', 'comprehension', 'weekly', 'marathon']),
  passageCount: z.number().min(1).optional(),
  timeLimit: z.number().min(1).optional(),
  minScore: z.number().min(0).max(100).optional(),
  level: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  xpReward: z.number().min(0).optional(),
  badgeId: z.string().uuid().optional(),
})

export async function createPassage(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const data = createPassageSchema.parse(req.body)
    const passage = await readingService.createPassage(instructorId, data)
    res.json({ success: true, data: passage })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getPassage(req: Request, res: Response) {
  try {
    const { passageId } = req.params
    const userId = req.user?.id
    const passage = await readingService.getPassage(passageId, userId)
    res.json({ success: true, data: passage })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getPassages(req: Request, res: Response) {
  try {
    const filters = {
      level: req.query.level as string,
      type: req.query.type as string,
      topic: req.query.topic as string,
      genre: req.query.genre as string,
      isPremium: req.query.isPremium === 'true' ? true : req.query.isPremium === 'false' ? false : undefined,
    }
    const passages = await readingService.getPassages(filters)
    res.json({ success: true, data: passages, count: passages.length })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function updatePassage(req: Request, res: Response) {
  try {
    const { passageId } = req.params
    const updates = createPassageSchema.partial().parse(req.body)
    const passage = await readingService.updatePassage(passageId, updates)
    res.json({ success: true, data: passage })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function publishPassage(req: Request, res: Response) {
  try {
    const { passageId } = req.params
    const passage = await readingService.publishPassage(passageId)
    res.json({ success: true, data: passage, message: 'Passage published successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function addQuestion(req: Request, res: Response) {
  try {
    const { passageId } = req.params
    const data = addQuestionSchema.parse(req.body)
    const question = await readingService.addQuestion(passageId, data)
    res.json({ success: true, data: question })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function startReading(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { passageId } = req.params
    const attempt = await readingService.startReading(userId, passageId)
    res.json({ success: true, data: attempt })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function updateReadingProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { attemptId } = req.params
    const { scrollProgress, timeSpent } = req.body
    await readingService.updateReadingProgress(attemptId, userId, { scrollProgress, timeSpent })
    res.json({ success: true })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function submitAnswer(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { attemptId } = req.params
    const data = submitAnswerSchema.parse(req.body)
    const attempt = await readingService.submitAnswer(attemptId, userId, data.questionId, data.answer, data.timeSpent)
    res.json({ success: true, data: attempt })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function completeReading(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { attemptId } = req.params
    const attempt = await readingService.completeReading(attemptId, userId)
    res.json({ success: true, data: attempt, message: 'Reading completed!' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getUserAttempts(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const filters = {
      passageId: req.query.passageId as string,
      status: req.query.status as string,
    }
    const attempts = await readingService.getUserAttempts(userId, filters)
    res.json({ success: true, data: attempts })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function createHighlight(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { passageId } = req.params
    const data = createHighlightSchema.parse(req.body)
    const highlight = await readingService.createHighlight(userId, passageId, data)
    res.json({ success: true, data: highlight })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getHighlights(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { passageId } = req.params
    const highlights = await readingService.getHighlights(userId, passageId)
    res.json({ success: true, data: highlights })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function deleteHighlight(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { highlightId } = req.params
    await readingService.deleteHighlight(userId, highlightId)
    res.json({ success: true, message: 'Highlight deleted' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function createNote(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { passageId } = req.params
    const data = createNoteSchema.parse(req.body)
    const note = await readingService.createNote(userId, passageId, data)
    res.json({ success: true, data: note })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getNotes(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { passageId } = req.params
    const notes = await readingService.getNotes(userId, passageId)
    res.json({ success: true, data: notes })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function saveVocabulary(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { passageId } = req.params
    const data = saveVocabularySchema.parse(req.body)
    const vocab = await readingService.saveVocabulary(userId, passageId, data)
    res.json({ success: true, data: vocab })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getSavedVocabulary(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const passageId = req.query.passageId as string
    const vocab = await readingService.getSavedVocabulary(userId, passageId)
    res.json({ success: true, data: vocab })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function markVocabularyLearned(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { vocabId } = req.params
    const vocab = await readingService.markVocabularyLearned(userId, vocabId)
    res.json({ success: true, data: vocab })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function createCollection(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const data = createCollectionSchema.parse(req.body)
    const collection = await readingService.createCollection(instructorId, data)
    res.json({ success: true, data: collection })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getCollections(req: Request, res: Response) {
  try {
    const filters = {
      type: req.query.type as string,
      level: req.query.level as string,
      category: req.query.category as string,
    }
    const collections = await readingService.getCollections(filters)
    res.json({ success: true, data: collections })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function subscribeToCollection(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { collectionId } = req.params
    const subscription = await readingService.subscribeToCollection(userId, collectionId)
    res.json({ success: true, data: subscription })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const progress = await readingService.getProgress(userId)
    res.json({ success: true, data: progress })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function createChallenge(req: Request, res: Response) {
  try {
    const data = createChallengeSchema.parse(req.body)
    const challenge = await readingService.createChallenge({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    })
    res.json({ success: true, data: challenge })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.errors })
    }
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function joinChallenge(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { challengeId } = req.params
    const progress = await readingService.joinChallenge(userId, challengeId)
    res.json({ success: true, data: progress })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getActiveChallenges(req: Request, res: Response) {
  try {
    const challenges = await readingService.getActiveChallenges()
    res.json({ success: true, data: challenges })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
