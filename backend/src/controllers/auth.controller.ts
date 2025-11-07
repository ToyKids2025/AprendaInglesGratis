import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  name: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string(),
})

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        xp: true,
        level: true,
        isPremium: true,
        streak: true,
      },
    })

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message })
    }
    res.status(500).json({ message: 'Erro ao criar usuário' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message })
    }
    res.status(500).json({ message: 'Erro ao fazer login' })
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token não fornecido' })
    }

    // Verify token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string }

    // Check if token exists in database
    const tokenExists = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })

    if (!tokenExists) {
      return res.status(401).json({ message: 'Refresh token inválido' })
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    res.json({ accessToken })
  } catch (error) {
    res.status(401).json({ message: 'Refresh token inválido ou expirado' })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      })
    }

    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer logout' })
  }
}

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        xp: true,
        level: true,
        isPremium: true,
        streak: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário' })
  }
}
