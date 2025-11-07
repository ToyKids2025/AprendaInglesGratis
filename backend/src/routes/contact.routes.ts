/**
 * CONTACT ROUTES
 * Routes for contact form submissions
 */

import { Router } from 'express'
import {
  submitContactForm,
  contactHealthCheck,
} from '../controllers/contact.controller'

const router = Router()

/**
 * POST /api/contact
 * Submit contact form
 */
router.post('/', submitContactForm)

/**
 * GET /api/contact/health
 * Health check
 */
router.get('/health', contactHealthCheck)

export default router
