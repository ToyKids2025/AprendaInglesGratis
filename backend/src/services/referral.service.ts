/**
 * REFERRAL & AFFILIATE SERVICE
 * Manages referral program, affiliate tracking, and commission calculations
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Commission rates by tier
 */
const COMMISSION_RATES = {
  standard: {
    signupBonus: 5.0, // R$ 5 per signup
    firstPayment: 30, // 30% of first payment
    recurring: 10, // 10% of recurring payments (60 days)
  },
  premium: {
    signupBonus: 10.0,
    firstPayment: 40,
    recurring: 15,
  },
  vip: {
    signupBonus: 15.0,
    firstPayment: 50,
    recurring: 20,
  },
}

/**
 * Generate unique referral code for user
 */
export async function generateReferralCode(userId: string, customCode?: string) {
  // Check if user already has a code
  const existing = await prisma.referralCode.findUnique({
    where: { userId },
  })

  if (existing) {
    return existing
  }

  // Generate code based on user data
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  let code = customCode

  if (!code) {
    // Generate from name
    const namePart = user.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 6)
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase()
    code = `${namePart}${randomPart}`
  }

  // Ensure uniqueness
  const codeExists = await prisma.referralCode.findUnique({
    where: { code },
  })

  if (codeExists) {
    throw new Error('Referral code already exists. Please choose another.')
  }

  return await prisma.referralCode.create({
    data: {
      userId,
      code,
    },
  })
}

/**
 * Track referral click
 */
export async function trackClick(
  code: string,
  data: {
    ipAddress: string
    userAgent?: string
    referrer?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
  }
) {
  const referralCode = await prisma.referralCode.findUnique({
    where: { code },
  })

  if (!referralCode || !referralCode.isActive) {
    throw new Error('Invalid or inactive referral code')
  }

  // Create click record
  await prisma.referralClick.create({
    data: {
      referralCodeId: referralCode.id,
      ...data,
    },
  })

  // Increment clicks count
  await prisma.referralCode.update({
    where: { id: referralCode.id },
    data: {
      clicks: { increment: 1 },
      lastUsedAt: new Date(),
    },
  })

  return referralCode
}

/**
 * Process referral signup
 */
export async function processReferralSignup(
  referralCode: string,
  newUserId: string,
  metadata?: {
    source?: string
    campaign?: string
    ipAddress?: string
    userAgent?: string
  }
) {
  const code = await prisma.referralCode.findUnique({
    where: { code: referralCode },
  })

  if (!code || !code.isActive) {
    return null
  }

  // Check if user was already referred
  const existingReferral = await prisma.referral.findUnique({
    where: { referredId: newUserId },
  })

  if (existingReferral) {
    return existingReferral
  }

  // Create referral record
  const referral = await prisma.referral.create({
    data: {
      referrerId: code.userId,
      referredId: newUserId,
      referralCodeId: code.id,
      signupAt: new Date(),
      source: metadata?.source,
      campaign: metadata?.campaign,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    },
  })

  // Update referral code stats
  await prisma.referralCode.update({
    where: { id: code.id },
    data: {
      signups: { increment: 1 },
    },
  })

  // Get affiliate program details
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId: code.userId },
  })

  const tier = affiliate?.tier || 'standard'
  const signupBonus = affiliate?.signupBonus || COMMISSION_RATES[tier as keyof typeof COMMISSION_RATES].signupBonus

  // Create signup commission
  await prisma.commission.create({
    data: {
      userId: code.userId,
      referralCodeId: code.id,
      referralId: referral.id,
      type: 'signup_bonus',
      amount: signupBonus,
      status: 'pending',
    },
  })

  // Give reward to new user (optional)
  await prisma.referralReward.create({
    data: {
      userId: newUserId,
      type: 'discount',
      value: 10.0, // R$ 10 discount
      description: 'Bônus de boas-vindas por indicação',
      triggeredBy: 'friend_signup',
      referralId: referral.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  return referral
}

/**
 * Process referral conversion (when referred user makes first payment)
 */
export async function processReferralConversion(
  userId: string,
  paymentAmount: number,
  paymentId: string
) {
  const referral = await prisma.referral.findUnique({
    where: { referredId: userId },
    include: { referralCode: true },
  })

  if (!referral || referral.status === 'converted') {
    return null
  }

  // Update referral status
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'converted',
      convertedAt: new Date(),
      totalRevenue: { increment: paymentAmount },
    },
  })

  // Update referral code stats
  await prisma.referralCode.update({
    where: { id: referral.referralCodeId },
    data: {
      conversions: { increment: 1 },
    },
  })

  // Get affiliate program details
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId: referral.referrerId },
  })

  const tier = affiliate?.tier || 'standard'
  const rate =
    affiliate?.firstPaymentRate ||
    COMMISSION_RATES[tier as keyof typeof COMMISSION_RATES].firstPayment

  const commissionAmount = (paymentAmount * rate) / 100

  // Create first payment commission
  const commission = await prisma.commission.create({
    data: {
      userId: referral.referrerId,
      referralCodeId: referral.referralCodeId,
      referralId: referral.id,
      paymentId,
      type: 'first_payment',
      amount: commissionAmount,
      percentage: rate,
      status: 'approved', // Auto-approve first payment commissions
      approvedAt: new Date(),
    },
  })

  // Update earnings
  await prisma.referralCode.update({
    where: { id: referral.referralCodeId },
    data: {
      totalEarned: { increment: commissionAmount },
      pendingEarnings: { increment: commissionAmount },
    },
  })

  // Check for milestone rewards
  await checkMilestoneRewards(referral.referrerId)

  return commission
}

/**
 * Process recurring payment commission
 */
export async function processRecurringCommission(
  userId: string,
  paymentAmount: number,
  paymentId: string,
  paymentNumber: number
) {
  const referral = await prisma.referral.findUnique({
    where: { referredId: userId },
    include: { referralCode: true },
  })

  if (!referral || referral.status !== 'converted') {
    return null
  }

  // Check if we should give commission (only first 2 months = payments 2 and 3)
  if (paymentNumber < 2 || paymentNumber > 3) {
    return null
  }

  // Get affiliate program details
  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId: referral.referrerId },
  })

  const tier = affiliate?.tier || 'standard'
  const rate =
    affiliate?.recurringRate ||
    COMMISSION_RATES[tier as keyof typeof COMMISSION_RATES].recurring

  const commissionAmount = (paymentAmount * rate) / 100

  // Create recurring commission
  const commission = await prisma.commission.create({
    data: {
      userId: referral.referrerId,
      referralCodeId: referral.referralCodeId,
      referralId: referral.id,
      paymentId,
      type: `recurring_${paymentNumber * 30}`,
      amount: commissionAmount,
      percentage: rate,
      status: 'approved',
      approvedAt: new Date(),
    },
  })

  // Update earnings
  await prisma.referralCode.update({
    where: { id: referral.referralCodeId },
    data: {
      totalEarned: { increment: commissionAmount },
      pendingEarnings: { increment: commissionAmount },
    },
  })

  // Update referral total revenue
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      totalRevenue: { increment: paymentAmount },
    },
  })

  return commission
}

/**
 * Get referral statistics for user
 */
export async function getReferralStats(userId: string) {
  const referralCode = await prisma.referralCode.findUnique({
    where: { userId },
  })

  if (!referralCode) {
    return null
  }

  const [
    totalReferrals,
    convertedReferrals,
    pendingCommissions,
    approvedCommissions,
    paidCommissions,
    topReferrals,
  ] = await Promise.all([
    prisma.referral.count({
      where: { referrerId: userId },
    }),
    prisma.referral.count({
      where: { referrerId: userId, status: 'converted' },
    }),
    prisma.commission.aggregate({
      where: { userId, status: 'pending' },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { userId, status: 'approved' },
      _sum: { amount: true },
    }),
    prisma.commission.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true },
    }),
    prisma.referral.findMany({
      where: { referrerId: userId },
      orderBy: { totalRevenue: 'desc' },
      take: 10,
      include: {
        // Get referred user's name
      },
    }),
  ])

  const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0

  return {
    code: referralCode.code,
    link: `https://englishflow.com.br/?ref=${referralCode.code}`,
    clicks: referralCode.clicks,
    signups: referralCode.signups,
    conversions: referralCode.conversions,
    conversionRate: conversionRate.toFixed(2),
    earnings: {
      total: referralCode.totalEarned,
      pending: pendingCommissions._sum.amount || 0,
      approved: approvedCommissions._sum.amount || 0,
      paid: paidCommissions._sum.amount || 0,
    },
    topReferrals,
  }
}

/**
 * Apply for affiliate program
 */
export async function applyForAffiliateProgram(
  userId: string,
  data: {
    companyName?: string
    website?: string
    audience?: string
    channels?: string[]
  }
) {
  // Check if already applied
  const existing = await prisma.affiliateProgram.findUnique({
    where: { userId },
  })

  if (existing) {
    throw new Error('You have already applied to the affiliate program')
  }

  // Create application
  return await prisma.affiliateProgram.create({
    data: {
      userId,
      ...data,
      status: 'pending',
    },
  })
}

/**
 * Request payout
 */
export async function requestPayout(userId: string) {
  const referralCode = await prisma.referralCode.findUnique({
    where: { userId },
  })

  if (!referralCode) {
    throw new Error('No referral code found')
  }

  const affiliate = await prisma.affiliateProgram.findUnique({
    where: { userId },
  })

  const minPayout = affiliate?.minPayout || 50

  if (referralCode.pendingEarnings < minPayout) {
    throw new Error(`Minimum payout is R$ ${minPayout}`)
  }

  // Get all approved but unpaid commissions
  const commissions = await prisma.commission.findMany({
    where: {
      userId,
      status: 'approved',
    },
  })

  const total = commissions.reduce((sum, c) => sum + Number(c.amount), 0)

  // Mark commissions as paid (in real app, integrate with payment provider)
  await prisma.commission.updateMany({
    where: {
      userId,
      status: 'approved',
    },
    data: {
      status: 'paid',
      paidAt: new Date(),
      payoutMethod: affiliate?.paymentMethod || 'pending',
    },
  })

  // Update earnings
  await prisma.referralCode.update({
    where: { id: referralCode.id },
    data: {
      pendingEarnings: { decrement: total },
      paidEarnings: { increment: total },
    },
  })

  return {
    amount: total,
    commissionsCount: commissions.length,
    payoutMethod: affiliate?.paymentMethod,
  }
}

/**
 * Check and award milestone rewards
 */
async function checkMilestoneRewards(userId: string) {
  const conversions = await prisma.referral.count({
    where: { referrerId: userId, status: 'converted' },
  })

  const milestones = [
    { count: 5, reward: 50, type: 'credits' },
    { count: 10, reward: 100, type: 'credits' },
    { count: 25, reward: 300, type: 'credits' },
    { count: 50, reward: 750, type: 'credits' },
    { count: 100, reward: 2000, type: 'credits' },
  ]

  for (const milestone of milestones) {
    if (conversions >= milestone.count) {
      // Check if reward already given
      const existing = await prisma.referralReward.findFirst({
        where: {
          userId,
          triggeredBy: `milestone_${milestone.count}`,
        },
      })

      if (!existing) {
        await prisma.referralReward.create({
          data: {
            userId,
            type: milestone.type,
            value: milestone.reward,
            description: `Bônus por atingir ${milestone.count} conversões`,
            triggeredBy: `milestone_${milestone.count}`,
          },
        })
      }
    }
  }
}

/**
 * Get affiliate leaderboard
 */
export async function getLeaderboard(limit: number = 10) {
  const topAffiliates = await prisma.referralCode.findMany({
    where: { isActive: true },
    orderBy: [{ conversions: 'desc' }, { totalEarned: 'desc' }],
    take: limit,
    include: {
      // Include user data
    },
  })

  return topAffiliates.map((code, index) => ({
    rank: index + 1,
    userId: code.userId,
    conversions: code.conversions,
    earnings: code.totalEarned,
  }))
}
