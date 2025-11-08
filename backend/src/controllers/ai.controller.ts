/**
 * AI CONTROLLER
 * Endpoints para conversação com IA e feedback
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { aiService } from '../services/ai.service'

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const startConversationSchema = z.object({
  scenarioSlug: z.string().min(1, 'Scenario slug is required').optional(),
  scenario: z.string().min(3, 'Scenario must be at least 3 characters').optional(),
  difficulty: z.number().int().min(1).max(8).optional(),
})

const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1, 'Message cannot be empty'),
})

const evaluateAnswerSchema = z.object({
  phraseId: z.number().int(),
  userAnswer: z.string().min(1, 'Answer cannot be empty'),
})

// ============================================
// CONTROLLERS
// ============================================

/**
 * POST /api/ai/conversation/start
 * Inicia uma nova conversa de prática com IA
 */
export const startConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Validar input
    const { scenarioSlug, scenario: customScenario, difficulty: customDifficulty } = startConversationSchema.parse(req.body)

    // Verificar se AI está disponível
    if (!aiService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available. Please configure OPENAI_API_KEY.',
      })
    }

    let scenarioData
    let initialMessage: string
    let scenarioName: string
    let difficulty: number

    // Try to load scenario from database
    if (scenarioSlug) {
      scenarioData = await prisma.conversationScenario.findUnique({
        where: { slug: scenarioSlug, isActive: true },
      })

      if (!scenarioData) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found or inactive',
        })
      }

      scenarioName = scenarioData.name
      difficulty = scenarioData.difficulty
      initialMessage = scenarioData.initialMessage
    } else if (customScenario) {
      // Use custom scenario
      scenarioName = customScenario
      difficulty = customDifficulty || 1
      initialMessage = `Hello! I'm here to practice English with you. Let's talk about: ${customScenario}. Feel free to start the conversation!`
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either scenarioSlug or scenario must be provided',
      })
    }

    // Criar conversa no banco
    const conversation = await prisma.aIConversation.create({
      data: {
        userId,
        scenario: scenarioName,
        difficulty,
        messages: [
          {
            role: 'assistant',
            content: initialMessage,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    })

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: initialMessage,
        scenario: scenarioName,
        difficulty,
      },
    })
  } catch (error) {
    console.error('Error starting conversation:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to start conversation',
    })
  }
}

/**
 * POST /api/ai/conversation/message
 * Envia mensagem para conversa existente
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Validar input
    const { conversationId, message } = sendMessageSchema.parse(req.body)

    // Buscar conversa
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      })
    }

    // Verificar se é do usuário
    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation',
      })
    }

    // Verificar se AI está disponível
    if (!aiService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'AI service is not available',
      })
    }

    // Adicionar mensagem do usuário
    const messages = conversation.messages as any[]
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    })

    // Gerar resposta da IA
    const aiResponse = await aiService.createConversation(
      conversation.scenario,
      conversation.difficulty,
      message
    )

    // Adicionar resposta da IA
    messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    })

    // Atualizar conversa
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { messages },
    })

    res.json({
      success: true,
      data: {
        message: aiResponse,
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    })
  }
}

/**
 * GET /api/ai/conversation/:id
 * Busca conversa por ID
 */
export const getConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { id } = req.params

    const conversation = await prisma.aIConversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
      })
    }

    if (conversation.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      })
    }

    res.json({
      success: true,
      data: conversation,
    })
  } catch (error) {
    console.error('Error getting conversation:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation',
    })
  }
}

/**
 * GET /api/ai/conversations
 * Lista conversas do usuário
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    res.json({
      success: true,
      data: conversations,
    })
  } catch (error) {
    console.error('Error getting conversations:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations',
    })
  }
}

/**
 * POST /api/ai/evaluate
 * Avalia resposta do usuário para uma frase
 */
export const evaluateAnswer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId

    // Validar input
    const { phraseId, userAnswer } = evaluateAnswerSchema.parse(req.body)

    // Buscar frase original
    const phrase = await prisma.phrase.findUnique({
      where: { id: phraseId },
    })

    if (!phrase) {
      return res.status(404).json({
        success: false,
        error: 'Phrase not found',
      })
    }

    // Verificar se AI está disponível
    if (!aiService.isReady()) {
      // Fallback: avaliação simples sem IA
      const isCorrect =
        userAnswer.toLowerCase().trim() === phrase.en.toLowerCase().trim()

      return res.json({
        success: true,
        data: {
          score: isCorrect ? 100 : 50,
          feedback: isCorrect
            ? 'Perfeito! Resposta correta!'
            : 'Não exatamente. Tente novamente!',
          corrections: isCorrect ? [] : [`Correto: ${phrase.en}`],
          isCorrect,
        },
      })
    }

    // Avaliação com IA
    const evaluation = await aiService.evaluateUserInput(
      phrase.en,
      userAnswer,
      phrase.difficulty
    )

    // Atualizar progresso do usuário
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_phraseId: {
          userId,
          phraseId,
        },
      },
    })

    const isCorrect = evaluation.score >= 80

    if (progress) {
      // Atualizar progresso existente
      const newCorrect = isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers
      const newWrong = !isCorrect ? progress.wrongAnswers + 1 : progress.wrongAnswers
      const newMastery = calculateMastery(newCorrect, newWrong)

      await prisma.userProgress.update({
        where: { id: progress.id },
        data: {
          timesReviewed: progress.timesReviewed + 1,
          correctAnswers: newCorrect,
          wrongAnswers: newWrong,
          mastery: newMastery,
          lastReviewAt: new Date(),
          nextReviewAt: calculateNextReview(newMastery),
        },
      })
    } else {
      // Criar novo progresso
      await prisma.userProgress.create({
        data: {
          userId,
          phraseId,
          timesReviewed: 1,
          correctAnswers: isCorrect ? 1 : 0,
          wrongAnswers: isCorrect ? 0 : 1,
          mastery: isCorrect ? 1 : 0,
          lastReviewAt: new Date(),
          nextReviewAt: calculateNextReview(isCorrect ? 1 : 0),
        },
      })
    }

    res.json({
      success: true,
      data: {
        ...evaluation,
        isCorrect,
      },
    })
  } catch (error) {
    console.error('Error evaluating answer:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.errors[0].message,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to evaluate answer',
    })
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateMastery(correctAnswers: number, wrongAnswers: number): number {
  const total = correctAnswers + wrongAnswers
  if (total === 0) return 0

  const accuracy = correctAnswers / total

  if (accuracy >= 0.95 && total >= 5) return 5
  if (accuracy >= 0.85 && total >= 4) return 4
  if (accuracy >= 0.75 && total >= 3) return 3
  if (accuracy >= 0.6 && total >= 2) return 2
  if (total >= 1) return 1
  return 0
}

function calculateNextReview(mastery: number): Date {
  const intervals: Record<number, number> = {
    0: 1 * 60 * 60 * 1000, // 1 hour
    1: 1 * 24 * 60 * 60 * 1000, // 1 day
    2: 3 * 24 * 60 * 60 * 1000, // 3 days
    3: 7 * 24 * 60 * 60 * 1000, // 7 days
    4: 14 * 24 * 60 * 60 * 1000, // 14 days
    5: 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const interval = intervals[mastery] || intervals[5]
  return new Date(Date.now() + interval)
}
