/**
 * NEWSLETTER CONTROLLER
 * Handles newsletter subscriptions and email campaigns
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendEmail, EmailType, sendBulkEmails } from '../services/email.service'

const prisma = new PrismaClient()

// Rate limiting for newsletter subscriptions
const subscriptionTracker = new Map<string, { count: number; firstAttempt: number }>()

const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60 * 60 * 1000, // 1 hour
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const tracker = subscriptionTracker.get(ip)

  if (!tracker) {
    subscriptionTracker.set(ip, { count: 1, firstAttempt: now })
    return true
  }

  if (now - tracker.firstAttempt > RATE_LIMIT.WINDOW_MS) {
    subscriptionTracker.set(ip, { count: 1, firstAttempt: now })
    return true
  }

  if (tracker.count >= RATE_LIMIT.MAX_ATTEMPTS) {
    return false
  }

  tracker.count++
  return true
}

// Cleanup old entries
setInterval(() => {
  const now = Date.now()
  for (const [ip, tracker] of subscriptionTracker.entries()) {
    if (now - tracker.firstAttempt > RATE_LIMIT.WINDOW_MS) {
      subscriptionTracker.delete(ip)
    }
  }
}, 15 * 60 * 1000)

/**
 * POST /api/newsletter/subscribe
 * Subscribe to newsletter
 */
export async function subscribe(req: Request, res: Response) {
  try {
    const { email, name } = req.body

    // Validation
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' })
    }

    // Rate limiting
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown'

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error: 'Muitas tentativas. Tente novamente em 1 hora.',
      })
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.active) {
        return res.status(200).json({
          message: 'Você já está inscrito na newsletter!',
          alreadySubscribed: true,
        })
      } else {
        // Reactivate subscription
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { active: true, unsubscribedAt: null },
        })

        return res.status(200).json({
          message: 'Bem-vindo de volta! Sua inscrição foi reativada.',
          reactivated: true,
        })
      }
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        name: name || null,
        subscribedAt: new Date(),
        active: true,
      },
    })

    // Send welcome email
    await sendEmail(email, EmailType.NEWSLETTER, {
      name: name || 'Estudante',
      message: 'Você se inscreveu na newsletter do English Flow!',
    })

    console.log(`New newsletter subscriber: ${email}`)

    return res.status(201).json({
      message: 'Inscrição realizada com sucesso! Confira seu email.',
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
      },
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return res.status(500).json({
      error: 'Erro ao processar inscrição. Tente novamente.',
    })
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from newsletter
 */
export async function unsubscribe(req: Request, res: Response) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (!subscriber) {
      return res.status(404).json({ error: 'Email não encontrado na lista' })
    }

    if (!subscriber.active) {
      return res.status(200).json({
        message: 'Você já estava desinscrito.',
      })
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        active: false,
        unsubscribedAt: new Date(),
      },
    })

    return res.status(200).json({
      message: 'Você foi removido da newsletter. Sentiremos sua falta! 😢',
    })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    return res.status(500).json({
      error: 'Erro ao processar cancelamento.',
    })
  }
}

/**
 * GET /api/newsletter/stats
 * Get newsletter statistics (admin only)
 */
export async function getStats(req: Request, res: Response) {
  try {
    const totalSubscribers = await prisma.newsletterSubscriber.count({
      where: { active: true },
    })

    const totalUnsubscribed = await prisma.newsletterSubscriber.count({
      where: { active: false },
    })

    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const newLast30Days = await prisma.newsletterSubscriber.count({
      where: {
        active: true,
        subscribedAt: { gte: last30Days },
      },
    })

    return res.status(200).json({
      totalSubscribers,
      totalUnsubscribed,
      newLast30Days,
      growthRate: totalSubscribers > 0 ? ((newLast30Days / totalSubscribers) * 100).toFixed(2) + '%' : '0%',
    })
  } catch (error) {
    console.error('Error getting newsletter stats:', error)
    return res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
}

/**
 * POST /api/newsletter/send-campaign
 * Send email campaign to all subscribers (admin only)
 */
export async function sendCampaign(req: Request, res: Response) {
  try {
    const { subject, content, type } = req.body

    if (!subject || !content) {
      return res.status(400).json({ error: 'Assunto e conteúdo são obrigatórios' })
    }

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
      select: { email: true, name: true },
    })

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Nenhum inscrito ativo encontrado' })
    }

    // Send emails in bulk
    const recipients = subscribers.map((sub) => ({
      email: sub.email,
      data: {
        name: sub.name || 'Estudante',
        message: content,
      },
    }))

    const result = await sendBulkEmails(
      recipients,
      type || EmailType.NEWSLETTER,
      100 // 100ms delay between emails
    )

    // Log campaign
    await prisma.newsletterCampaign.create({
      data: {
        subject,
        content,
        sentAt: new Date(),
        recipientCount: subscribers.length,
        successCount: result.success,
        failureCount: result.failed,
      },
    })

    return res.status(200).json({
      message: 'Campanha enviada com sucesso!',
      totalRecipients: subscribers.length,
      sent: result.success,
      failed: result.failed,
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    return res.status(500).json({ error: 'Erro ao enviar campanha' })
  }
}

/**
 * GET /api/newsletter/health
 * Health check
 */
export async function newsletterHealthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    service: 'newsletter',
    timestamp: new Date().toISOString(),
  })
}

export default {
  subscribe,
  unsubscribe,
  getStats,
  sendCampaign,
  newsletterHealthCheck,
}
