/**
 * SUBSCRIPTION MANAGEMENT SERVICE
 * Handle premium subscriptions, trials, and billing
 */

import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
}

export const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: ['10 phrases per day', 'Basic exercises', 'Community access'],
    stripePriceId: '',
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 3990, // R$ 39.90 in cents
    interval: 'month',
    features: [
      'Unlimited phrases',
      'All exercises',
      'AI features',
      'Offline mode',
      'Priority support',
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 39900, // R$ 399.00 in cents (2 months free)
    interval: 'year',
    features: [
      'All Premium features',
      '2 months FREE',
      'Early access to new features',
    ],
    stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
  },
]

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  userId: string,
  planId: string,
  successUrl: string,
  cancelUrl: string
) {
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan || !plan.stripePriceId) {
    throw new Error('Invalid plan')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Create or get Stripe customer
  let customerId = user.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId },
    })
    customerId = customer.id

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    })
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
  })

  return session
}

/**
 * Handle successful subscription
 */
export async function activateSubscription(
  userId: string,
  stripeSubscriptionId: string
) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: true,
      stripeSubscriptionId,
      subscriptionStatus: subscription.status,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000),
    },
  })

  // Grant premium benefits
  await grantPremiumBenefits(userId)
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  })

  if (!user?.stripeSubscriptionId) {
    throw new Error('No active subscription')
  }

  // Cancel at period end (user keeps access until then)
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'canceling',
    },
  })
}

/**
 * Resume subscription
 */
export async function resumeSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true },
  })

  if (!user?.stripeSubscriptionId) {
    throw new Error('No subscription to resume')
  }

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: false,
  })

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'active',
    },
  })
}

/**
 * Handle subscription webhook events
 */
export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: subscription.status === 'active',
          subscriptionStatus: subscription.status,
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
        },
      })
      break

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription
      const deletedUserId = deletedSub.metadata.userId

      await prisma.user.update({
        where: { id: deletedUserId },
        data: {
          isPremium: false,
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
        },
      })
      break

    case 'invoice.payment_succeeded':
      // Payment successful - extend subscription
      break

    case 'invoice.payment_failed':
      // Payment failed - notify user
      break
  }
}

/**
 * Grant premium benefits
 */
async function grantPremiumBenefits(userId: string) {
  // Grant premium badge
  await prisma.userAchievement.create({
    data: {
      userId,
      type: 'badge',
      title: 'Premium Member',
      description: 'Unlocked all premium features',
      icon: '👑',
    },
  })

  // Unlock all content
  // Add bonus XP
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: {
        increment: 500,
      },
    },
  })
}

/**
 * Check if user has active premium
 */
export async function hasPremium(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPremium: true,
      subscriptionEndDate: true,
    },
  })

  if (!user) return false

  if (user.isPremium && user.subscriptionEndDate) {
    // Check if subscription is still valid
    if (new Date() > user.subscriptionEndDate) {
      // Expired - revoke premium
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false },
      })
      return false
    }
  }

  return user.isPremium
}

export default {
  createCheckoutSession,
  activateSubscription,
  cancelSubscription,
  resumeSubscription,
  handleWebhook,
  hasPremium,
  PLANS,
}
