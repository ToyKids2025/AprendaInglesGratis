/**
 * VALIDATION MIDDLEWARE
 * Request validation using Zod schemas
 */

import { Request, Response, NextFunction } from 'express'
import { z, ZodError } from 'zod'

/**
 * Create validation middleware from Zod schema
 */
export function validate(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json({
          error: 'Dados inválidos',
          details: errors,
        })
      }

      return res.status(500).json({
        error: 'Erro de validação',
      })
    }
  }
}

// Common validation schemas
export const schemas = {
  // Auth schemas
  register: z.object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(100, 'Senha muito longa'),
    name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo').optional(),
  }),

  login: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
  }),

  // User update schema
  updateProfile: z.object({
    name: z.string().min(2).max(100).optional(),
    avatar: z.string().url('URL de avatar inválida').optional(),
  }),

  // Phrase generation schema
  generatePhrases: z.object({
    category: z.string().min(1, 'Categoria é obrigatória'),
    level: z.enum(['beginner', 'intermediate', 'advanced'], {
      errorMap: () => ({ message: 'Nível inválido' }),
    }),
    difficulty: z.number().int().min(1).max(5),
    count: z.number().int().min(1).max(50, 'Máximo de 50 frases por vez'),
    context: z.string().optional(),
  }),

  // Batch create phrases schema
  batchCreatePhrases: z.object({
    categoryId: z.number().int().positive(),
    phrases: z
      .array(
        z.object({
          en: z.string().min(1, 'Frase em inglês é obrigatória'),
          pt: z.string().min(1, 'Tradução é obrigatória'),
          tip: z.string().optional(),
          difficulty: z.number().int().min(1).max(5).optional(),
        })
      )
      .min(1, 'Pelo menos uma frase é obrigatória'),
  }),

  // Contact form schema
  contact: z.object({
    name: z.string().min(2, 'Nome muito curto').max(100, 'Nome muito longo'),
    email: z.string().email('Email inválido'),
    subject: z.string().min(5, 'Assunto muito curto').max(200, 'Assunto muito longo'),
    message: z.string().min(10, 'Mensagem muito curta').max(2000, 'Mensagem muito longa'),
  }),

  // Newsletter schema
  newsletter: z.object({
    email: z.string().email('Email inválido'),
    name: z.string().max(100).optional(),
  }),

  // Payment schema
  createCheckout: z.object({
    plan: z.enum(['monthly', 'yearly'], {
      errorMap: () => ({ message: 'Plano inválido' }),
    }),
  }),

  // AI Conversation schema
  sendMessage: z.object({
    message: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem muito longa'),
    scenario: z.string().min(1).max(100).optional(),
  }),
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json({
          error: 'Parâmetros inválidos',
          details: errors,
        })
      }

      return res.status(500).json({
        error: 'Erro de validação',
      })
    }
  }
}

/**
 * Validate route parameters
 */
export function validateParams(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }))

        return res.status(400).json({
          error: 'Parâmetros de rota inválidos',
          details: errors,
        })
      }

      return res.status(500).json({
        error: 'Erro de validação',
      })
    }
  }
}

export default {
  validate,
  validateQuery,
  validateParams,
  schemas,
}
