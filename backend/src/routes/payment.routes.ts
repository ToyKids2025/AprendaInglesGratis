/**
 * PAYMENT ROUTES
 * Stripe payment endpoints
 */

import { Router } from 'express'
import {
  createCheckout,
  createPortal,
  handleWebhook,
  getSubscriptionStatus,
  paymentHealthCheck,
} from '../controllers/payment.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Webhook endpoint (no auth, raw body parsing handled in server.ts)
router.post('/webhook', handleWebhook)

// Public health check
router.get('/health', paymentHealthCheck)

// Protected routes (require authentication)
router.post('/create-checkout-session', authenticateToken, createCheckout)
router.post('/create-portal-session', authenticateToken, createPortal)
router.get('/subscription-status', authenticateToken, getSubscriptionStatus)

export default router
