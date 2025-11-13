/**
 * REFERRAL & AFFILIATE CONTROLLER
 * Endpoints for referral program and affiliate management
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as referralService from '../services/referral.service'

// Validation schemas
const generateCodeSchema = z.object({
  customCode: z
    .string()
    .min(4)
    .max(20)
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers')
    .optional(),
})

const trackClickSchema = z.object({
  code: z.string(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

const applyAffiliateSchema = z.object({
  companyName: z.string().optional(),
  website: z.string().url().optional(),
  audience: z.string().min(50).max(1000),
  channels: z.array(z.string()).min(1),
})

/**
 * Generate or get referral code for user
 */
export async function generateReferralCode(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { customCode } = generateCodeSchema.parse(req.body)

    const code = await referralService.generateReferralCode(userId, customCode)

    res.json({
      success: true,
      data: {
        code: code.code,
        link: `https://englishflow.com.br/?ref=${code.code}`,
        stats: {
          clicks: code.clicks,
          signups: code.signups,
          conversions: code.conversions,
        },
      },
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Track referral click (public endpoint)
 */
export async function trackClick(req: Request, res: Response) {
  try {
    const { code, utmSource, utmMedium, utmCampaign } = trackClickSchema.parse(req.body)

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown'
    const userAgent = req.headers['user-agent']
    const referrer = req.headers['referer']

    await referralService.trackClick(code, {
      ipAddress,
      userAgent,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
    })

    res.json({
      success: true,
      message: 'Click tracked successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get referral statistics
 */
export async function getStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const stats = await referralService.getReferralStats(userId)

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No referral code found. Create one first.',
      })
    }

    res.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Apply for affiliate program
 */
export async function applyAffiliate(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = applyAffiliateSchema.parse(req.body)

    const application = await referralService.applyForAffiliateProgram(userId, data)

    res.json({
      success: true,
      message: 'Application submitted successfully! We will review it within 2-3 business days.',
      data: application,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Request payout
 */
export async function requestPayout(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const payout = await referralService.requestPayout(userId)

    res.json({
      success: true,
      message: 'Payout requested successfully! Funds will be transferred within 5-7 business days.',
      data: payout,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 10

    const leaderboard = await referralService.getLeaderboard(limit)

    res.json({
      success: true,
      data: leaderboard,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get user's referrals list
 */
export async function getReferrals(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const skip = (page - 1) * limit

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.referral.count({
        where: { referrerId: userId },
      }),
    ])

    res.json({
      success: true,
      data: {
        referrals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get commissions history
 */
export async function getCommissions(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const status = req.query.status as string | undefined
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const skip = (page - 1) * limit

    const where = { userId, ...(status && { status }) }

    const [commissions, total] = await Promise.all([
      prisma.commission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.commission.count({ where }),
    ])

    res.json({
      success: true,
      data: {
        commissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
