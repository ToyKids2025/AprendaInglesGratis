/**
 * PAYMENT CONTROLLER
 * Handles payment operations and Stripe webhooks
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import {
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  getSubscription,
} from '../services/stripe.service'
import { sendEmail, EmailType } from '../services/email.service'

const prisma = new PrismaClient()

/**
 * POST /api/payments/create-checkout-session
 * Create Stripe Checkout Session
 */
export async function createCheckout(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const { plan } = req.body

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ error: 'Plano inválido' })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Check if user already has premium
    if (user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > new Date()) {
      return res.status(400).json({
        error: 'Você já tem uma assinatura ativa',
      })
    }

    // Create checkout session
    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      plan,
      successUrl: `${process.env.FRONTEND_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL}/pricing?payment=cancelled`,
    })

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return res.status(500).json({ error: 'Erro ao criar sessão de pagamento' })
  }
}

/**
 * POST /api/payments/create-portal-session
 * Create Customer Portal Session
 */
export async function createPortal(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Get user's Stripe customer ID from payments
    const payment = await prisma.payment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (!payment) {
      return res.status(400).json({
        error: 'Nenhum histórico de pagamento encontrado',
      })
    }

    // Extract customer ID from Stripe payment ID
    // This is a simplification - in production you'd store customerId separately
    const customerId = payment.stripePaymentId.split('_')[0]

    const session = await createPortalSession({
      customerId,
      returnUrl: `${process.env.FRONTEND_URL}/dashboard`,
    })

    return res.status(200).json({
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return res.status(500).json({ error: 'Erro ao abrir portal de pagamentos' })
  }
}

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks
 */
export async function handleWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    return res.status(400).json({ error: 'No signature found' })
  }

  try {
    const event = constructWebhookEvent(req.body, signature)

    console.log('Stripe webhook received:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any

        // Get user ID from metadata
        const userId = session.metadata?.userId || session.client_reference_id

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Get subscription
        const subscriptionId = session.subscription as string
        const subscription = await getSubscription(subscriptionId)

        if (!subscription) {
          console.error('Subscription not found')
          break
        }

        // Update user to premium
        const expiresAt = new Date(subscription.current_period_end * 1000)

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            premiumExpiresAt: expiresAt,
          },
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            userId,
            stripePaymentId: subscriptionId,
            plan: session.metadata?.plan || 'monthly',
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'BRL',
            status: 'completed',
            paidAt: new Date(),
          },
        })

        // Get user for email
        const user = await prisma.user.findUnique({ where: { id: userId } })

        if (user) {
          // Send success email
          await sendEmail(user.email, EmailType.SUBSCRIPTION_SUCCESS, {
            name: user.name || 'Estudante',
            plan: session.metadata?.plan === 'yearly' ? 'Anual' : 'Mensal',
            price: session.metadata?.plan === 'yearly' ? 'R$ 399,90/ano' : 'R$ 39,90/mês',
            nextBillingDate: expiresAt.toLocaleDateString('pt-BR'),
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
          })
        }

        console.log(`User ${userId} upgraded to premium until ${expiresAt}`)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any

        // Renew subscription
        const subscriptionId = invoice.subscription as string
        const subscription = await getSubscription(subscriptionId)

        if (!subscription) {
          console.error('Subscription not found')
          break
        }

        // Find user by subscription
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: subscriptionId },
        })

        if (!payment) {
          console.error('Payment not found for subscription')
          break
        }

        // Update premium expiration
        const expiresAt = new Date(subscription.current_period_end * 1000)

        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            isPremium: true,
            premiumExpiresAt: expiresAt,
          },
        })

        // Send receipt email
        const user = await prisma.user.findUnique({ where: { id: payment.userId } })

        if (user) {
          await sendEmail(user.email, EmailType.PAYMENT_RECEIPT, {
            name: user.name || 'Estudante',
            amount: `R$ ${(invoice.amount_paid / 100).toFixed(2)}`,
            date: new Date().toLocaleDateString('pt-BR'),
            invoiceUrl: invoice.invoice_pdf || invoice.hosted_invoice_url || '#',
            nextBillingDate: expiresAt.toLocaleDateString('pt-BR'),
          })
        }

        console.log(`Subscription ${subscriptionId} renewed until ${expiresAt}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any

        // Find user
        const subscriptionId = invoice.subscription as string
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: subscriptionId },
        })

        if (!payment) {
          console.error('Payment not found for subscription')
          break
        }

        const user = await prisma.user.findUnique({ where: { id: payment.userId } })

        if (user) {
          // Send failed payment email
          await sendEmail(user.email, EmailType.PAYMENT_FAILED, {
            name: user.name || 'Estudante',
            amount: `R$ ${(invoice.amount_due / 100).toFixed(2)}`,
            reason: invoice.last_payment_error?.message || 'Pagamento recusado',
            updatePaymentUrl: `${process.env.FRONTEND_URL}/dashboard/billing`,
          })
        }

        console.log(`Payment failed for subscription ${subscriptionId}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any

        // Find user
        const payment = await prisma.payment.findFirst({
          where: { stripePaymentId: subscription.id },
        })

        if (!payment) {
          console.error('Payment not found for subscription')
          break
        }

        // Remove premium status
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            isPremium: false,
            premiumExpiresAt: null,
          },
        })

        // Send cancellation email
        const user = await prisma.user.findUnique({ where: { id: payment.userId } })

        if (user) {
          await sendEmail(user.email, EmailType.SUBSCRIPTION_CANCELLED, {
            name: user.name || 'Estudante',
            plan: payment.plan || 'Mensal',
            endDate: new Date().toLocaleDateString('pt-BR'),
          })
        }

        console.log(`Subscription ${subscription.id} cancelled`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return res.status(400).json({ error: `Webhook Error: ${error.message}` })
  }
}

/**
 * GET /api/payments/subscription-status
 * Get user's subscription status
 */
export async function getSubscriptionStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumExpiresAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    return res.status(200).json({
      isPremium: user.isPremium,
      expiresAt: user.premiumExpiresAt,
      isActive: user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > new Date(),
    })
  } catch (error) {
    console.error('Error getting subscription status:', error)
    return res.status(500).json({ error: 'Erro ao buscar status de assinatura' })
  }
}

/**
 * GET /api/payments/health
 * Health check
 */
export async function paymentHealthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    service: 'payments',
    timestamp: new Date().toISOString(),
  })
}

export default {
  createCheckout,
  createPortal,
  handleWebhook,
  getSubscriptionStatus,
  paymentHealthCheck,
}
