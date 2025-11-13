/**
 * PUSH NOTIFICATION SERVICE
 * Send push notifications via FCM (Firebase Cloud Messaging) and Web Push
 */

import { PrismaClient } from '@prisma/client'
import * as admin from 'firebase-admin'
import webpush from 'web-push'

const prisma = new PrismaClient()

// Initialize Firebase Admin (if credentials are provided)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

// Configure Web Push (for browser notifications)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@englishflow.com.br',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

/**
 * Register device token
 */
export async function registerDeviceToken(
  userId: string,
  data: {
    token: string
    platform: 'web' | 'ios' | 'android'
    deviceId?: string
    deviceName?: string
    browser?: string
    browserVersion?: string
    os?: string
    osVersion?: string
    appVersion?: string
    endpoint?: string
    p256dh?: string
    auth?: string
  }
) {
  // Check if token already exists
  const existing = await prisma.deviceToken.findUnique({
    where: { token: data.token },
  })

  if (existing) {
    // Update last used
    return await prisma.deviceToken.update({
      where: { id: existing.id },
      data: {
        lastUsedAt: new Date(),
        isActive: true,
      },
    })
  }

  // Create new token
  return await prisma.deviceToken.create({
    data: {
      userId,
      ...data,
    },
  })
}

/**
 * Remove device token
 */
export async function unregisterDeviceToken(token: string) {
  return await prisma.deviceToken.updateMany({
    where: { token },
    data: { isActive: false },
  })
}

/**
 * Send push notification to specific user
 */
export async function sendToUser(
  userId: string,
  data: {
    title: string
    body: string
    imageUrl?: string
    iconUrl?: string
    actionUrl?: string
    actionType?: string
    actionData?: any
    priority?: 'low' | 'normal' | 'high'
    campaign?: string
  }
) {
  // Create notification record
  const notification = await prisma.pushNotification.create({
    data: {
      userId,
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      iconUrl: data.iconUrl,
      actionUrl: data.actionUrl,
      actionType: data.actionType,
      actionData: data.actionData,
      priority: data.priority || 'normal',
      campaign: data.campaign,
      status: 'sending',
    },
  })

  // Get user's devices
  const devices = await prisma.deviceToken.findMany({
    where: {
      userId,
      isActive: true,
    },
  })

  if (devices.length === 0) {
    await prisma.pushNotification.update({
      where: { id: notification.id },
      data: { status: 'failed', failed: 1 },
    })
    throw new Error('No active devices found for user')
  }

  // Send to each device
  const results = await Promise.allSettled(
    devices.map((device) =>
      sendToDevice(notification.id, device.token, device.platform, {
        title: data.title,
        body: data.body,
        imageUrl: data.imageUrl,
        iconUrl: data.iconUrl,
        actionUrl: data.actionUrl,
        data: data.actionData,
      })
    )
  )

  // Count successes and failures
  const delivered = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  // Update notification stats
  await prisma.pushNotification.update({
    where: { id: notification.id },
    data: {
      status: 'sent',
      sentAt: new Date(),
      delivered,
      failed,
    },
  })

  return {
    notificationId: notification.id,
    devicesTargeted: devices.length,
    delivered,
    failed,
  }
}

/**
 * Send push notification to segment
 */
export async function sendToSegment(
  segment: string,
  data: {
    title: string
    body: string
    imageUrl?: string
    iconUrl?: string
    actionUrl?: string
    actionType?: string
    actionData?: any
    priority?: 'low' | 'normal' | 'high'
    campaign?: string
  }
) {
  // Create notification record
  const notification = await prisma.pushNotification.create({
    data: {
      segment,
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      iconUrl: data.iconUrl,
      actionUrl: data.actionUrl,
      actionType: data.actionType,
      actionData: data.actionData,
      priority: data.priority || 'normal',
      campaign: data.campaign,
      status: 'sending',
    },
  })

  // Get users in segment
  const userIds = await getUsersBySegment(segment)

  // Get all active devices for these users
  const devices = await prisma.deviceToken.findMany({
    where: {
      userId: { in: userIds },
      isActive: true,
    },
  })

  if (devices.length === 0) {
    await prisma.pushNotification.update({
      where: { id: notification.id },
      data: { status: 'failed' },
    })
    throw new Error(`No active devices found for segment: ${segment}`)
  }

  // Send to each device (in batches to avoid rate limits)
  const batchSize = 500
  let delivered = 0
  let failed = 0

  for (let i = 0; i < devices.length; i += batchSize) {
    const batch = devices.slice(i, i + batchSize)

    const results = await Promise.allSettled(
      batch.map((device) =>
        sendToDevice(notification.id, device.token, device.platform, {
          title: data.title,
          body: data.body,
          imageUrl: data.imageUrl,
          iconUrl: data.iconUrl,
          actionUrl: data.actionUrl,
          data: data.actionData,
        })
      )
    )

    delivered += results.filter((r) => r.status === 'fulfilled').length
    failed += results.filter((r) => r.status === 'rejected').length

    // Update stats after each batch
    await prisma.pushNotification.update({
      where: { id: notification.id },
      data: { delivered, failed },
    })
  }

  // Mark as sent
  await prisma.pushNotification.update({
    where: { id: notification.id },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  })

  return {
    notificationId: notification.id,
    devicesTargeted: devices.length,
    delivered,
    failed,
  }
}

/**
 * Send to specific device
 */
async function sendToDevice(
  notificationId: string,
  token: string,
  platform: string,
  data: {
    title: string
    body: string
    imageUrl?: string
    iconUrl?: string
    actionUrl?: string
    data?: any
  }
) {
  const device = await prisma.deviceToken.findUnique({
    where: { token },
  })

  if (!device) {
    throw new Error('Device not found')
  }

  // Create delivery record
  const delivery = await prisma.notificationDelivery.create({
    data: {
      notificationId,
      userId: device.userId,
      deviceToken: token,
      platform,
      deviceId: device.deviceId || undefined,
      status: 'pending',
    },
  })

  try {
    if (platform === 'web') {
      // Send via Web Push
      await sendWebPush(device, data)
    } else {
      // Send via FCM (iOS/Android)
      await sendFCM(token, data)
    }

    // Mark as sent
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    })

    return { success: true, deliveryId: delivery.id }
  } catch (error: any) {
    // Mark as failed
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage: error.message,
      },
    })

    // Deactivate invalid tokens
    if (error.code === 'messaging/invalid-registration-token' || error.statusCode === 410) {
      await prisma.deviceToken.update({
        where: { token },
        data: { isActive: false },
      })
    }

    throw error
  }
}

/**
 * Send via Firebase Cloud Messaging (Mobile)
 */
async function sendFCM(
  token: string,
  data: {
    title: string
    body: string
    imageUrl?: string
    iconUrl?: string
    actionUrl?: string
    data?: any
  }
) {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin not initialized')
  }

  const message: admin.messaging.Message = {
    token,
    notification: {
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
    },
    data: {
      actionUrl: data.actionUrl || '',
      ...(data.data || {}),
    },
    apns: {
      payload: {
        aps: {
          badge: 1,
          sound: 'default',
        },
      },
    },
    android: {
      priority: 'high',
      notification: {
        icon: data.iconUrl,
        color: '#8B5CF6', // Purple theme
        sound: 'default',
      },
    },
  }

  const response = await admin.messaging().send(message)
  return response
}

/**
 * Send via Web Push (Browser)
 */
async function sendWebPush(
  device: any,
  data: {
    title: string
    body: string
    imageUrl?: string
    iconUrl?: string
    actionUrl?: string
    data?: any
  }
) {
  if (!device.endpoint || !device.p256dh || !device.auth) {
    throw new Error('Invalid web push subscription')
  }

  const subscription = {
    endpoint: device.endpoint,
    keys: {
      p256dh: device.p256dh,
      auth: device.auth,
    },
  }

  const payload = JSON.stringify({
    title: data.title,
    body: data.body,
    icon: data.iconUrl || '/icon-192x192.png',
    image: data.imageUrl,
    badge: '/badge-72x72.png',
    data: {
      url: data.actionUrl || '/',
      ...data.data,
    },
  })

  const response = await webpush.sendNotification(subscription, payload, {
    TTL: 86400, // 24 hours
  })

  return response
}

/**
 * Schedule notification
 */
export async function scheduleNotification(
  data: {
    userId?: string
    segment?: string
    title: string
    body: string
    imageUrl?: string
    iconUrl?: string
    actionUrl?: string
    actionType?: string
    actionData?: any
    scheduledFor: Date
    priority?: 'low' | 'normal' | 'high'
    campaign?: string
  }
) {
  return await prisma.pushNotification.create({
    data: {
      userId: data.userId,
      segment: data.segment,
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      iconUrl: data.iconUrl,
      actionUrl: data.actionUrl,
      actionType: data.actionType,
      actionData: data.actionData,
      scheduledFor: data.scheduledFor,
      priority: data.priority || 'normal',
      campaign: data.campaign,
      status: 'scheduled',
    },
  })
}

/**
 * Process scheduled notifications
 */
export async function processScheduledNotifications() {
  const now = new Date()

  const scheduled = await prisma.pushNotification.findMany({
    where: {
      status: 'scheduled',
      scheduledFor: {
        lte: now,
      },
    },
    take: 100,
  })

  for (const notification of scheduled) {
    try {
      if (notification.userId) {
        await sendToUser(notification.userId, {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
          iconUrl: notification.iconUrl || undefined,
          actionUrl: notification.actionUrl || undefined,
          actionType: notification.actionType || undefined,
          actionData: notification.actionData,
          priority: notification.priority as any,
          campaign: notification.campaign || undefined,
        })
      } else if (notification.segment) {
        await sendToSegment(notification.segment, {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl || undefined,
          iconUrl: notification.iconUrl || undefined,
          actionUrl: notification.actionUrl || undefined,
          actionType: notification.actionType || undefined,
          actionData: notification.actionData,
          priority: notification.priority as any,
          campaign: notification.campaign || undefined,
        })
      }
    } catch (error) {
      console.error(`Failed to send scheduled notification ${notification.id}:`, error)
    }
  }

  return { processed: scheduled.length }
}

/**
 * Get users by segment
 */
async function getUsersBySegment(segment: string): Promise<string[]> {
  let where: any = {}

  switch (segment) {
    case 'all':
      where = {}
      break
    case 'premium':
      where = { isPremium: true }
      break
    case 'free':
      where = { isPremium: false }
      break
    case 'inactive':
      // Users who haven't logged in for 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      where = { lastLoginAt: { lt: sevenDaysAgo } }
      break
    case 'streak_lost':
      // Users whose streak is 0 but had one before
      where = { currentStreak: 0, longestStreak: { gt: 0 } }
      break
    default:
      where = {}
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  })

  return users.map((u) => u.id)
}

/**
 * Track notification opened
 */
export async function trackOpened(deliveryId: string) {
  const delivery = await prisma.notificationDelivery.update({
    where: { id: deliveryId },
    data: {
      status: 'opened',
      openedAt: new Date(),
    },
  })

  // Update notification stats
  await prisma.pushNotification.update({
    where: { id: delivery.notificationId },
    data: {
      opened: { increment: 1 },
    },
  })

  return delivery
}

/**
 * Track notification clicked
 */
export async function trackClicked(deliveryId: string) {
  const delivery = await prisma.notificationDelivery.update({
    where: { id: deliveryId },
    data: {
      status: 'clicked',
      clickedAt: new Date(),
    },
  })

  // Update notification stats
  await prisma.pushNotification.update({
    where: { id: delivery.notificationId },
    data: {
      clicked: { increment: 1 },
    },
  })

  return delivery
}

/**
 * Get notification preferences
 */
export async function getPreferences(userId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  })

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId },
    })
  }

  return prefs
}

/**
 * Update notification preferences
 */
export async function updatePreferences(userId: string, data: any) {
  return await prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  })
}

/**
 * Send from template
 */
export async function sendFromTemplate(
  templateKey: string,
  userId: string,
  variables: Record<string, string>
) {
  const template = await prisma.notificationTemplate.findUnique({
    where: { key: templateKey },
  })

  if (!template || !template.isActive) {
    throw new Error('Template not found or inactive')
  }

  // Replace variables in title and body
  let title = template.title
  let body = template.body

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    title = title.replace(regex, value)
    body = body.replace(regex, value)
  }

  return await sendToUser(userId, {
    title,
    body,
    imageUrl: template.imageUrl || undefined,
    iconUrl: template.iconUrl || undefined,
    actionUrl: template.actionUrl || undefined,
    actionType: template.actionType || undefined,
  })
}

/**
 * Get notification analytics
 */
export async function getAnalytics(notificationId: string) {
  const notification = await prisma.pushNotification.findUnique({
    where: { id: notificationId },
    include: {
      deliveries: true,
    },
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  const totalDeliveries = notification.deliveries.length
  const delivered = notification.deliveries.filter((d) => d.status !== 'failed').length
  const opened = notification.deliveries.filter((d) => d.openedAt).length
  const clicked = notification.deliveries.filter((d) => d.clickedAt).length

  return {
    id: notification.id,
    title: notification.title,
    sentAt: notification.sentAt,
    totalDeliveries,
    delivered,
    deliveryRate: totalDeliveries > 0 ? (delivered / totalDeliveries) * 100 : 0,
    opened,
    openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
    clicked,
    clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
  }
}
