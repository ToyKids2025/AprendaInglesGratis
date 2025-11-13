/**
 * PUSH NOTIFICATION CONTROLLER
 * Manage push notifications, device tokens, and preferences
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as pushService from '../services/pushNotification.service'

// Validation schemas
const registerDeviceSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['web', 'ios', 'android']),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  appVersion: z.string().optional(),
  endpoint: z.string().optional(),
  p256dh: z.string().optional(),
  auth: z.string().optional(),
})

const sendNotificationSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(500),
  imageUrl: z.string().url().optional(),
  iconUrl: z.string().url().optional(),
  actionUrl: z.string().optional(),
  actionType: z.string().optional(),
  actionData: z.any().optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  campaign: z.string().optional(),
})

const sendToSegmentSchema = sendNotificationSchema.extend({
  segment: z.string(),
})

const scheduleNotificationSchema = sendNotificationSchema.extend({
  userId: z.string().optional(),
  segment: z.string().optional(),
  scheduledFor: z.string().datetime(),
})

const updatePreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  doNotDisturb: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  lessonReminders: z.boolean().optional(),
  streakReminders: z.boolean().optional(),
  achievementAlerts: z.boolean().optional(),
  socialNotifications: z.boolean().optional(),
  marketingMessages: z.boolean().optional(),
  productUpdates: z.boolean().optional(),
  maxPerDay: z.number().min(0).max(50).optional(),
  minInterval: z.number().min(300).max(86400).optional(),
  enableWeb: z.boolean().optional(),
  enableMobile: z.boolean().optional(),
  enableEmail: z.boolean().optional(),
})

/**
 * Register device token
 */
export async function registerDevice(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = registerDeviceSchema.parse(req.body)

    const device = await pushService.registerDeviceToken(userId, data)

    res.json({
      success: true,
      message: 'Device registered successfully',
      data: device,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Unregister device token
 */
export async function unregisterDevice(req: Request, res: Response) {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      })
    }

    await pushService.unregisterDeviceToken(token)

    res.json({
      success: true,
      message: 'Device unregistered successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Send notification to current user (for testing)
 */
export async function sendToMe(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = sendNotificationSchema.parse(req.body)

    const result = await pushService.sendToUser(userId, data)

    res.json({
      success: true,
      message: 'Notification sent successfully',
      data: result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Send notification to segment (admin only)
 */
export async function sendToSegment(req: Request, res: Response) {
  try {
    const data = sendToSegmentSchema.parse(req.body)

    const result = await pushService.sendToSegment(data.segment, {
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      iconUrl: data.iconUrl,
      actionUrl: data.actionUrl,
      actionType: data.actionType,
      actionData: data.actionData,
      priority: data.priority,
      campaign: data.campaign,
    })

    res.json({
      success: true,
      message: `Notification sent to segment: ${data.segment}`,
      data: result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Schedule notification (admin only)
 */
export async function scheduleNotification(req: Request, res: Response) {
  try {
    const data = scheduleNotificationSchema.parse(req.body)

    const notification = await pushService.scheduleNotification({
      userId: data.userId,
      segment: data.segment,
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      iconUrl: data.iconUrl,
      actionUrl: data.actionUrl,
      actionType: data.actionType,
      actionData: data.actionData,
      scheduledFor: new Date(data.scheduledFor),
      priority: data.priority,
      campaign: data.campaign,
    })

    res.json({
      success: true,
      message: 'Notification scheduled successfully',
      data: notification,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Track notification opened
 */
export async function trackOpened(req: Request, res: Response) {
  try {
    const { deliveryId } = req.body

    if (!deliveryId) {
      return res.status(400).json({
        success: false,
        error: 'deliveryId is required',
      })
    }

    await pushService.trackOpened(deliveryId)

    res.json({
      success: true,
      message: 'Notification opened tracked',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Track notification clicked
 */
export async function trackClicked(req: Request, res: Response) {
  try {
    const { deliveryId } = req.body

    if (!deliveryId) {
      return res.status(400).json({
        success: false,
        error: 'deliveryId is required',
      })
    }

    await pushService.trackClicked(deliveryId)

    res.json({
      success: true,
      message: 'Notification click tracked',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get notification preferences
 */
export async function getPreferences(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const preferences = await pushService.getPreferences(userId)

    res.json({
      success: true,
      data: preferences,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Update notification preferences
 */
export async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = updatePreferencesSchema.parse(req.body)

    const preferences = await pushService.updatePreferences(userId, data)

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: preferences,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get notification analytics (admin only)
 */
export async function getAnalytics(req: Request, res: Response) {
  try {
    const { notificationId } = req.params

    const analytics = await pushService.getAnalytics(notificationId)

    res.json({
      success: true,
      data: analytics,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Get user's notification history
 */
export async function getHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    const skip = (page - 1) * limit

    const [deliveries, total] = await Promise.all([
      prisma.notificationDelivery.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          notification: {
            select: {
              title: true,
              body: true,
              imageUrl: true,
              actionUrl: true,
              actionType: true,
            },
          },
        },
      }),
      prisma.notificationDelivery.count({
        where: { userId },
      }),
    ])

    res.json({
      success: true,
      data: {
        notifications: deliveries,
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
 * Test notification (send to self)
 */
export async function testNotification(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const result = await pushService.sendToUser(userId, {
      title: '🎉 Test Notification',
      body: 'This is a test push notification from English Flow!',
      actionUrl: '/dashboard',
      priority: 'high',
    })

    res.json({
      success: true,
      message: 'Test notification sent!',
      data: result,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}
