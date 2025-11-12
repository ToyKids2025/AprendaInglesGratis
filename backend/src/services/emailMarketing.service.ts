/**
 * EMAIL MARKETING SERVICE
 * Automated campaigns, drip sequences, and analytics
 */

import { PrismaClient } from '@prisma/client'
import { sendEmail, EmailType } from './email.service'

const prisma = new PrismaClient()

/**
 * Create email campaign
 */
export async function createCampaign(data: {
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  segment?: string
  customQuery?: any
  scheduledFor?: Date
  fromName?: string
  fromEmail?: string
  replyTo?: string
  createdBy: string
}) {
  return await prisma.emailCampaign.create({
    data: {
      ...data,
      status: data.scheduledFor ? 'scheduled' : 'draft',
    },
  })
}

/**
 * Send campaign to recipients
 */
export async function sendCampaign(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  if (campaign.status === 'sent') {
    throw new Error('Campaign already sent')
  }

  // Get recipients based on segment
  const recipients = await getRecipientsBySegment(campaign.segment, campaign.customQuery)

  // Update campaign status
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'sending',
      recipientCount: recipients.length,
    },
  })

  // Send emails
  let successCount = 0
  for (const recipient of recipients) {
    try {
      // Replace variables in content
      const personalizedContent = replaceVariables(campaign.htmlContent, recipient)
      const personalizedSubject = replaceVariables(campaign.subject, recipient)

      // Send email
      await sendEmail(recipient.email, EmailType.MARKETING, {
        subject: personalizedSubject,
        html: personalizedContent,
        from: `${campaign.fromName} <${campaign.fromEmail}>`,
        replyTo: campaign.replyTo,
      })

      // Log success
      await prisma.emailLog.create({
        data: {
          campaignId,
          userId: recipient.id,
          type: 'campaign',
          subject: personalizedSubject,
          recipient: recipient.email,
          status: 'sent',
          sentAt: new Date(),
        },
      })

      successCount++
    } catch (error) {
      // Log failure
      await prisma.emailLog.create({
        data: {
          campaignId,
          userId: recipient.id,
          type: 'campaign',
          subject: campaign.subject,
          recipient: recipient.email,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }
  }

  // Update campaign status
  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  })

  return {
    totalRecipients: recipients.length,
    successCount,
    failureCount: recipients.length - successCount,
  }
}

/**
 * Get recipients based on segment
 */
async function getRecipientsBySegment(segment?: string | null, customQuery?: any) {
  let where: any = {}

  switch (segment) {
    case 'all':
      break
    case 'premium':
      where.isPremium = true
      break
    case 'free':
      where.isPremium = false
      break
    case 'inactive':
      // Users who haven't studied in 7 days
      where.lastStudyDate = {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
      break
    case 'custom':
      where = customQuery || {}
      break
  }

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      xp: true,
      level: true,
      streak: true,
      isPremium: true,
    },
  })
}

/**
 * Replace variables in content
 */
function replaceVariables(content: string, user: any): string {
  return content
    .replace(/{{name}}/g, user.name || 'Student')
    .replace(/{{email}}/g, user.email)
    .replace(/{{xp}}/g, user.xp?.toString() || '0')
    .replace(/{{level}}/g, user.level?.toString() || '1')
    .replace(/{{streak}}/g, user.streak?.toString() || '0')
}

/**
 * Create drip sequence
 */
export async function createDripSequence(data: {
  name: string
  description?: string
  trigger: string
  steps: Array<{
    name: string
    subject: string
    htmlContent: string
    textContent?: string
    delayDays: number
    delayHours?: number
    conditions?: any
  }>
}) {
  const sequence = await prisma.dripSequence.create({
    data: {
      name: data.name,
      description: data.description,
      trigger: data.trigger,
    },
  })

  // Create steps
  for (let i = 0; i < data.steps.length; i++) {
    await prisma.dripStep.create({
      data: {
        sequenceId: sequence.id,
        order: i,
        ...data.steps[i],
      },
    })
  }

  return sequence
}

/**
 * Start drip sequence for user
 */
export async function startDripSequence(userId: string, trigger: string) {
  // Find active sequences for this trigger
  const sequences = await prisma.dripSequence.findMany({
    where: {
      trigger,
      isActive: true,
    },
  })

  for (const sequence of sequences) {
    // Check if user already in this sequence
    const existing = await prisma.userDripProgress.findUnique({
      where: {
        userId_sequenceId: {
          userId,
          sequenceId: sequence.id,
        },
      },
    })

    if (existing) continue

    // Get first step
    const firstStep = await prisma.dripStep.findFirst({
      where: {
        sequenceId: sequence.id,
        order: 0,
      },
    })

    if (!firstStep) continue

    // Calculate when to send first email
    const nextStepAt = new Date()
    nextStepAt.setDate(nextStepAt.getDate() + firstStep.delayDays)
    nextStepAt.setHours(nextStepAt.getHours() + firstStep.delayHours)

    // Create progress record
    await prisma.userDripProgress.create({
      data: {
        userId,
        sequenceId: sequence.id,
        currentStep: 0,
        nextStepAt,
      },
    })
  }
}

/**
 * Process drip sequences (run via cron)
 */
export async function processDripSequences() {
  const now = new Date()

  // Find users ready for next step
  const readyUsers = await prisma.userDripProgress.findMany({
    where: {
      status: 'active',
      nextStepAt: {
        lte: now,
      },
    },
    include: {
      user: true,
    },
  })

  for (const progress of readyUsers) {
    try {
      // Get current step
      const step = await prisma.dripStep.findFirst({
        where: {
          sequenceId: progress.sequenceId,
          order: progress.currentStep,
        },
      })

      if (!step) continue

      // Send email
      const personalizedContent = replaceVariables(step.htmlContent, progress.user)
      const personalizedSubject = replaceVariables(step.subject, progress.user)

      await sendEmail(progress.user.email, EmailType.DRIP, {
        subject: personalizedSubject,
        html: personalizedContent,
      })

      // Log
      await prisma.emailLog.create({
        data: {
          userId: progress.user.id,
          type: 'drip',
          subject: personalizedSubject,
          recipient: progress.user.email,
          status: 'sent',
          sentAt: new Date(),
        },
      })

      // Check if there's a next step
      const nextStep = await prisma.dripStep.findFirst({
        where: {
          sequenceId: progress.sequenceId,
          order: progress.currentStep + 1,
        },
      })

      if (nextStep) {
        // Schedule next step
        const nextStepAt = new Date()
        nextStepAt.setDate(nextStepAt.getDate() + nextStep.delayDays)
        nextStepAt.setHours(nextStepAt.getHours() + nextStep.delayHours)

        await prisma.userDripProgress.update({
          where: { id: progress.id },
          data: {
            currentStep: progress.currentStep + 1,
            nextStepAt,
          },
        })
      } else {
        // Sequence completed
        await prisma.userDripProgress.update({
          where: { id: progress.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        })
      }
    } catch (error) {
      console.error('Error processing drip step:', error)
    }
  }

  return {
    processed: readyUsers.length,
  }
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string) {
  const [campaign, logs] = await Promise.all([
    prisma.emailCampaign.findUnique({
      where: { id: campaignId },
    }),
    prisma.emailLog.groupBy({
      by: ['status'],
      where: { campaignId },
      _count: true,
    }),
  ])

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  const stats: any = {
    total: campaign.recipientCount,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    failed: 0,
  }

  logs.forEach((log) => {
    stats[log.status] = log._count
  })

  return {
    campaign,
    stats,
    openRate: stats.total > 0 ? (stats.opened / stats.total) * 100 : 0,
    clickRate: stats.total > 0 ? (stats.clicked / stats.total) * 100 : 0,
    bounceRate: stats.total > 0 ? (stats.bounced / stats.total) * 100 : 0,
  }
}

/**
 * Create email template
 */
export async function createTemplate(data: {
  name: string
  subject: string
  htmlContent: string
  textContent?: string
  variables: string[]
  category?: string
}) {
  return await prisma.emailTemplate.create({
    data,
  })
}

/**
 * Get all templates
 */
export async function getTemplates(category?: string) {
  return await prisma.emailTemplate.findMany({
    where: {
      isActive: true,
      ...(category && { category }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default {
  createCampaign,
  sendCampaign,
  createDripSequence,
  startDripSequence,
  processDripSequences,
  getCampaignAnalytics,
  createTemplate,
  getTemplates,
}
