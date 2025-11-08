/**
 * STRIPE SERVICE
 * Handles all Stripe payment operations
 */

import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

export interface CreateCheckoutSessionParams {
  userId: string
  userEmail: string
  plan: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}

export interface CreatePortalSessionParams {
  customerId: string
  returnUrl: string
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const { userId, userEmail, plan, successUrl, cancelUrl } = params

  // Define prices (you'll need to create these in Stripe Dashboard)
  const prices = {
    monthly: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
    yearly: process.env.STRIPE_PRICE_YEARLY || 'price_yearly_placeholder',
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    mode: 'subscription',
    line_items: [
      {
        price: prices[plan],
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    tax_id_collection: {
      enabled: true, // For Brazil CPF/CNPJ
    },
  })

  return session
}

/**
 * Create a Stripe Customer Portal Session
 * Allows users to manage subscriptions, payment methods, billing history
 */
export async function createPortalSession(
  params: CreatePortalSessionParams
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  })

  return session
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(
  email: string
): Promise<Stripe.Customer | null> {
  const customers = await stripe.customers.list({ email, limit: 1 })

  if (customers.data.length > 0) {
    return customers.data[0]
  }

  return null
}

/**
 * Create customer
 */
export async function createCustomer(params: {
  email: string
  name?: string
  metadata?: Record<string, string>
}): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata || {},
  })

  return customer
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)

  return event
}

/**
 * Get invoice by subscription
 */
export async function getInvoicesBySubscription(
  subscriptionId: string
): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    subscription: subscriptionId,
    limit: 10,
  })

  return invoices.data
}

/**
 * Create a one-time payment intent (for future use: bundles, courses, etc.)
 */
export async function createPaymentIntent(params: {
  amount: number
  currency: string
  customerId?: string
  metadata?: Record<string, string>
}): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount * 100, // Convert to cents
    currency: params.currency,
    customer: params.customerId,
    metadata: params.metadata || {},
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return paymentIntent
}

export default {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
  cancelSubscription,
  getCustomerByEmail,
  createCustomer,
  constructWebhookEvent,
  getInvoicesBySubscription,
  createPaymentIntent,
}
