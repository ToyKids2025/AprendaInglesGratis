/**
 * EMAIL MARKETING CONTROLLER
 * Campaign management and automation
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as emailMarketingService from '../services/emailMarketing.service'

// Validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(200),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  segment: z.enum(['all', 'premium', 'free', 'inactive', 'custom']).optional(),
  customQuery: z.any().optional(),
  scheduledFor: z.string().datetime().optional(),
  fromName: z.string().optional(),
  fromEmail: z.string().email().optional(),
  replyTo: z.string().email().optional(),
})

const createDripSequenceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  trigger: z.enum(['signup', 'premium_purchase', 'inactivity', 'level_up']),
  steps: z.array(
    z.object({
      name: z.string().min(1),
      subject: z.string().min(1),
      htmlContent: z.string().min(1),
      textContent: z.string().optional(),
      delayDays: z.number().min(0),
      delayHours: z.number().min(0).optional(),
      conditions: z.any().optional(),
    })
  ),
})

/**
 * POST /api/email-marketing/campaigns
 * Create new campaign
 */
export async function createCampaign(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = createCampaignSchema.parse(req.body)

    const campaign = await emailMarketingService.createCampaign({
      ...validatedData,
      scheduledFor: validatedData.scheduledFor
        ? new Date(validatedData.scheduledFor)
        : undefined,
      createdBy: userId,
    })

    res.json({
      success: true,
      campaign,
    })
  } catch (error: any) {
    console.error('Failed to create campaign:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/email-marketing/campaigns/:id/send
 * Send campaign
 */
export async function sendCampaign(req: Request, res: Response) {
  try {
    const { id } = req.params

    const result = await emailMarketingService.sendCampaign(id)

    res.json({
      success: true,
      result,
    })
  } catch (error: any) {
    console.error('Failed to send campaign:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/email-marketing/campaigns/:id/analytics
 * Get campaign analytics
 */
export async function getCampaignAnalytics(req: Request, res: Response) {
  try {
    const { id } = req.params

    const analytics = await emailMarketingService.getCampaignAnalytics(id)

    res.json({
      success: true,
      analytics,
    })
  } catch (error: any) {
    console.error('Failed to get analytics:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/email-marketing/drip-sequences
 * Create drip sequence
 */
export async function createDripSequence(req: Request, res: Response) {
  try {
    const validatedData = createDripSequenceSchema.parse(req.body)

    const sequence = await emailMarketingService.createDripSequence(validatedData)

    res.json({
      success: true,
      sequence,
    })
  } catch (error: any) {
    console.error('Failed to create drip sequence:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/email-marketing/templates
 * Get email templates
 */
export async function getTemplates(req: Request, res: Response) {
  try {
    const { category } = req.query

    const templates = await emailMarketingService.getTemplates(category as string)

    res.json({
      success: true,
      templates,
    })
  } catch (error: any) {
    console.error('Failed to get templates:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  createCampaign,
  sendCampaign,
  getCampaignAnalytics,
  createDripSequence,
  getTemplates,
}
