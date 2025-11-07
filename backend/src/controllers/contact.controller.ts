/**
 * CONTACT CONTROLLER
 * Handles contact form submissions
 */

import { Request, Response } from 'express'
import { sendEmail, EmailType } from '../services/email.service'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

// Rate limiting: Track submissions by IP
const submissionTracker = new Map<
  string,
  { count: number; firstSubmission: number }
>()

const RATE_LIMIT = {
  MAX_SUBMISSIONS: 3, // Max 3 submissions
  WINDOW_MS: 60 * 60 * 1000, // Per hour
}

/**
 * Check if IP has exceeded rate limit
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const tracker = submissionTracker.get(ip)

  if (!tracker) {
    submissionTracker.set(ip, { count: 1, firstSubmission: now })
    return true
  }

  // Reset if window has passed
  if (now - tracker.firstSubmission > RATE_LIMIT.WINDOW_MS) {
    submissionTracker.set(ip, { count: 1, firstSubmission: now })
    return true
  }

  // Check if limit exceeded
  if (tracker.count >= RATE_LIMIT.MAX_SUBMISSIONS) {
    return false
  }

  // Increment count
  tracker.count++
  return true
}

/**
 * Clean up old entries (run periodically)
 */
setInterval(() => {
  const now = Date.now()
  for (const [ip, tracker] of submissionTracker.entries()) {
    if (now - tracker.firstSubmission > RATE_LIMIT.WINDOW_MS) {
      submissionTracker.delete(ip)
    }
  }
}, 15 * 60 * 1000) // Every 15 minutes

/**
 * POST /api/contact
 * Submit contact form
 */
export async function submitContactForm(req: Request, res: Response) {
  try {
    const { name, email, subject, message }: ContactFormData = req.body

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Todos os campos são obrigatórios',
      })
    }

    // Name validation
    if (name.trim().length < 2) {
      return res.status(400).json({
        error: 'Nome deve ter pelo menos 2 caracteres',
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
      })
    }

    // Message validation
    if (message.trim().length < 10) {
      return res.status(400).json({
        error: 'Mensagem deve ter pelo menos 10 caracteres',
      })
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        error: 'Mensagem deve ter no máximo 2000 caracteres',
      })
    }

    // Subject validation
    const validSubjects = [
      'general',
      'technical',
      'billing',
      'feedback',
      'partnership',
      'other',
    ]
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({
        error: 'Assunto inválido',
      })
    }

    // Rate limiting
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        error:
          'Limite de envios excedido. Tente novamente em 1 hora ou envie um email para suporte@englishflow.com',
      })
    }

    // Map subject to readable text
    const subjectMap: Record<string, string> = {
      general: 'Dúvida Geral',
      technical: 'Problema Técnico',
      billing: 'Pagamento e Cobrança',
      feedback: 'Sugestão ou Feedback',
      partnership: 'Parceria ou Business',
      other: 'Outro Assunto',
    }

    const subjectText = subjectMap[subject] || 'Outro Assunto'

    // Send email to support team
    const supportEmail = await sendEmail(
      process.env.SUPPORT_EMAIL || 'suporte@englishflow.com',
      EmailType.CONTACT_CONFIRMATION, // We'll use this template for internal notification
      {
        name: 'Equipe English Flow',
        message: `
Nova mensagem de contato recebida:

Nome: ${name}
Email: ${email}
Assunto: ${subjectText}

Mensagem:
${message}

---
IP: ${ip}
Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
        `,
      }
    )

    // Send confirmation email to user
    const userEmail = await sendEmail(email, EmailType.CONTACT_CONFIRMATION, {
      name,
      message: message.substring(0, 150) + (message.length > 150 ? '...' : ''),
    })

    if (!supportEmail && !userEmail) {
      throw new Error('Failed to send emails')
    }

    // Log to database (optional - you can create a Contact model if needed)
    console.log(`Contact form submitted by ${name} (${email})`)

    return res.status(200).json({
      message:
        'Mensagem enviada com sucesso! Responderemos em até 24 horas (dias úteis).',
    })
  } catch (error) {
    console.error('Error submitting contact form:', error)
    return res.status(500).json({
      error: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
    })
  }
}

/**
 * GET /api/contact/health
 * Health check endpoint
 */
export async function contactHealthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    service: 'contact',
    timestamp: new Date().toISOString(),
  })
}

export default {
  submitContactForm,
  contactHealthCheck,
}
