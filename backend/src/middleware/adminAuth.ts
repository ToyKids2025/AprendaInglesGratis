/**
 * ADMIN AUTHENTICATION MIDDLEWARE
 * Verifies that authenticated user has admin privileges
 */

import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Middleware to check if user is admin
 * Must be used AFTER authenticateToken middleware
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check if user is authenticated (added by authenticateToken middleware)
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({
        error: 'Não autenticado',
        message: 'Você precisa estar logado para acessar esta área',
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, email: true },
    })

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
      })
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar esta área',
      })
    }

    // User is admin, continue
    next()
  } catch (error) {
    console.error('Admin auth error:', error)
    return res.status(500).json({
      error: 'Erro ao verificar permissões',
    })
  }
}

/**
 * Optional: Check if user is admin (doesn't block request)
 * Adds isAdmin flag to request object
 */
export async function checkAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      })

      if (user) {
        ;(req as any).isAdmin = user.isAdmin
      }
    }

    next()
  } catch (error) {
    console.error('Check admin error:', error)
    next()
  }
}
