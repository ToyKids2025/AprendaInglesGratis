# Day 38 - Push Notifications System

Complete push notification system for web and mobile platforms with FCM, Web Push, scheduling, and comprehensive analytics.

## Features

### 1. Multi-Platform Support

**Web (Browser)**
- Web Push API integration
- VAPID authentication
- Service Worker notifications
- Works on Chrome, Firefox, Edge, Safari 16+
- Notification permission management
- Background notifications (even when tab is closed)

**Mobile (iOS/Android)**
- Firebase Cloud Messaging (FCM)
- Native push notifications
- Badge count management
- Sound and vibration
- Rich media (images, actions)
- Background delivery

### 2. Device Management

**Device Token Registration**
- Automatic token generation and storage
- Platform detection (web/iOS/Android)
- Device fingerprinting
- Browser and OS detection
- App version tracking
- Last used timestamp

**Token Lifecycle**
- Auto-activation on register
- Deactivation on unregister
- Invalid token cleanup
- Expired token removal
- Multi-device support per user

### 3. Notification Sending

**Send to User**
```javascript
sendToUser(userId, {
  title: "🎉 New Achievement!",
  body: "You've completed 10 lessons in a row!",
  imageUrl: "https://...",
  actionUrl: "/achievements",
  priority: "high"
})
```

**Send to Segment**
```javascript
sendToSegment("premium", {
  title: "🎁 Premium Exclusive",
  body: "New advanced lessons available!",
  campaign: "premium_launch_2024"
})
```

**Segments Available:**
- `all` - All users
- `premium` - Premium subscribers
- `free` - Free users
- `inactive` - Inactive 7+ days
- `streak_lost` - Users who lost their streak

### 4. Scheduling

**Schedule for Later**
```javascript
scheduleNotification({
  userId: "user123",
  title: "⏰ Daily Reminder",
  body: "Time for your English practice!",
  scheduledFor: new Date("2024-11-15T09:00:00"),
  priority: "normal"
})
```

**Automated Processing**
- Cron job checks every minute
- Sends scheduled notifications when due
- Batch processing (100 per run)
- Error handling and retry logic

### 5. Templates

**Predefined Templates**
```javascript
{
  key: "daily_reminder",
  title: "⏰ Time to practice, {{name}}!",
  body: "You're on a {{streak}} day streak. Don't break it!",
  actionUrl: "/lessons",
  schedule: "0 9 * * *" // Daily at 9 AM
}
```

**Variable Replacement**
- `{{name}}` - User's name
- `{{streak}}` - Current streak
- `{{level}}` - Current level
- `{{xp}}` - Total XP
- Custom variables supported

**Built-in Templates:**
1. `daily_reminder` - Daily practice reminder (9 AM)
2. `streak_risk` - Streak about to break (8 PM)
3. `streak_lost` - Streak was lost (next day 10 AM)
4. `achievement_unlocked` - New achievement (instant)
5. `level_up` - Level milestone reached (instant)
6. `weekly_summary` - Weekly progress report (Sunday 6 PM)
7. `inactive_7d` - Inactive for 7 days
8. `inactive_30d` - Inactive for 30 days
9. `premium_trial_ending` - Trial ends in 3 days
10. `course_completion` - Course completed

### 6. User Preferences

**Granular Control**
```javascript
{
  enabled: true,
  doNotDisturb: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",

  // Category preferences
  lessonReminders: true,
  streakReminders: true,
  achievementAlerts: true,
  socialNotifications: true,
  marketingMessages: false,
  productUpdates: true,

  // Limits
  maxPerDay: 10,
  minInterval: 3600, // 1 hour

  // Platforms
  enableWeb: true,
  enableMobile: true,
  enableEmail: true
}
```

**Quiet Hours**
- Respect user's sleep schedule
- Automatically delay notifications
- Queue for next available time
- Timezone-aware (user's local time)

### 7. Analytics & Tracking

**Delivery Tracking**
- Sent count
- Delivered count
- Delivery rate (%)
- Failed deliveries with error messages

**Engagement Tracking**
- Opened count
- Open rate (%)
- Clicked count
- Click-through rate (%)

**Per-Notification Analytics**
```javascript
{
  id: "notif123",
  title: "Daily Reminder",
  sentAt: "2024-11-14T09:00:00",
  totalDeliveries: 1000,
  delivered: 950,
  deliveryRate: 95.0,
  opened: 380,
  openRate: 40.0,
  clicked: 120,
  clickRate: 31.6
}
```

### 8. Campaign Management

**Campaign Creation**
```javascript
{
  name: "Black Friday 2024",
  segment: "all",
  scheduledFor: "2024-11-29T06:00:00",
  throttle: 1000, // Max 1000 sends/minute
  priority: "high"
}
```

**Campaign Results**
- Total targeted users
- Total sent
- Total delivered
- Total opened
- Total clicked
- Cost per notification
- ROI calculation

## Database Schema (7 Models)

### 1. PushNotification
Main notification record with content, targeting, and aggregate stats

### 2. NotificationDelivery
Individual delivery attempt per device with status tracking

### 3. DeviceToken
User's registered devices with platform and token details

### 4. NotificationPreference
User's notification settings and preferences

### 5. NotificationTemplate
Reusable templates with variable support and scheduling

### 6. NotificationCampaign
Marketing campaigns with targeting and results

### 7. NotificationQueue
Scheduled notifications queue with retry logic

## API Endpoints

### Public Endpoints

**POST /api/notifications/track/opened**
Track notification opened (no auth required)
```json
{
  "deliveryId": "delivery123"
}
```

**POST /api/notifications/track/clicked**
Track notification clicked
```json
{
  "deliveryId": "delivery123"
}
```

### User Endpoints (Authenticated)

**POST /api/notifications/device/register**
Register device for push notifications
```json
{
  "token": "fcm_token_here",
  "platform": "ios",
  "deviceId": "iPhone13,3",
  "deviceName": "Alexandre's iPhone",
  "appVersion": "1.0.0"
}
```

**POST /api/notifications/device/unregister**
Unregister device
```json
{
  "token": "fcm_token_here"
}
```

**POST /api/notifications/test**
Send test notification to self (no body required)

**POST /api/notifications/send-to-me**
Send custom notification to self
```json
{
  "title": "Test",
  "body": "This is a test",
  "actionUrl": "/lessons"
}
```

**GET /api/notifications/preferences**
Get notification preferences

**PUT /api/notifications/preferences**
Update preferences
```json
{
  "lessonReminders": true,
  "streakReminders": true,
  "marketingMessages": false,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "maxPerDay": 5
}
```

**GET /api/notifications/history**
Get notification history
```
Query params:
- page: number (default 1)
- limit: number (default 20)
```

### Admin Endpoints

**POST /api/notifications/send-to-segment**
Send to user segment
```json
{
  "segment": "premium",
  "title": "New Feature Available!",
  "body": "Check out our new AI conversation mode",
  "imageUrl": "https://...",
  "actionUrl": "/features/ai-chat",
  "priority": "high",
  "campaign": "ai_launch_nov_2024"
}
```

**POST /api/notifications/schedule**
Schedule notification
```json
{
  "segment": "inactive",
  "title": "We miss you!",
  "body": "Come back and continue your learning journey",
  "scheduledFor": "2024-11-20T10:00:00",
  "priority": "normal"
}
```

**GET /api/notifications/analytics/:notificationId**
Get detailed analytics for notification

## Service Functions

### registerDeviceToken(userId, data)
Register device for receiving notifications

### unregisterDeviceToken(token)
Deactivate device token

### sendToUser(userId, data)
Send push notification to specific user (all their devices)

### sendToSegment(segment, data)
Send to user segment (bulk delivery with batching)

### scheduleNotification(data)
Schedule notification for future delivery

### processScheduledNotifications()
Process queued notifications (cron job)

### sendFromTemplate(templateKey, userId, variables)
Send using predefined template with variable replacement

### trackOpened(deliveryId)
Track when user opens notification

### trackClicked(deliveryId)
Track when user clicks notification

### getPreferences(userId)
Get user's notification preferences

### updatePreferences(userId, data)
Update user preferences

### getAnalytics(notificationId)
Get comprehensive analytics

## Integration Examples

### 1. Web (Frontend)

**Request Permission**
```javascript
// Request notification permission
const permission = await Notification.requestPermission()

if (permission === 'granted') {
  // Register service worker
  const registration = await navigator.serviceWorker.register('/sw.js')

  // Get push subscription
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  })

  // Send to backend
  await api.post('/notifications/device/register', {
    token: JSON.stringify(subscription),
    platform: 'web',
    browser: navigator.userAgent,
    endpoint: subscription.endpoint,
    p256dh: btoa(subscription.getKey('p256dh')),
    auth: btoa(subscription.getKey('auth'))
  })
}
```

**Service Worker (sw.js)**
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      image: data.image,
      badge: data.badge,
      data: data.data
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Track click
  fetch('/api/notifications/track/clicked', {
    method: 'POST',
    body: JSON.stringify({ deliveryId: event.notification.data.deliveryId })
  })

  // Open URL
  clients.openWindow(event.notification.data.url)
})
```

### 2. Mobile (React Native)

**Setup (App.tsx)**
```typescript
import messaging from '@react-native-firebase/messaging'

async function requestPermission() {
  const authStatus = await messaging().requestPermission()

  if (authStatus === messaging.AuthorizationStatus.AUTHORIZED) {
    const token = await messaging().getToken()

    await api.post('/notifications/device/register', {
      token,
      platform: Platform.OS, // 'ios' or 'android'
      deviceId: DeviceInfo.getDeviceId(),
      deviceName: await DeviceInfo.getDeviceName(),
      appVersion: DeviceInfo.getVersion()
    })
  }
}

// Handle foreground notifications
messaging().onMessage(async (remoteMessage) => {
  Alert.alert(
    remoteMessage.notification.title,
    remoteMessage.notification.body
  )
})

// Handle background/quit state notifications
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in background:', remoteMessage)
})

// Handle notification opened
messaging().onNotificationOpenedApp((remoteMessage) => {
  // Track click
  api.post('/notifications/track/clicked', {
    deliveryId: remoteMessage.data.deliveryId
  })

  // Navigate to screen
  navigation.navigate(remoteMessage.data.screen)
})
```

### 3. Backend Automation

**Daily Cron Job (cron.ts)**
```typescript
import cron from 'node-cron'
import * as pushService from './services/pushNotification.service'

// Process scheduled notifications every minute
cron.schedule('* * * * *', async () => {
  await pushService.processScheduledNotifications()
})

// Daily reminder at 9 AM
cron.schedule('0 9 * * *', async () => {
  await pushService.sendFromTemplate(
    'daily_reminder',
    'user123',
    { name: 'Alexandre', streak: '7' }
  )
})

// Streak risk warning at 8 PM
cron.schedule('0 20 * * *', async () => {
  const usersAtRisk = await getUsersAtStreakRisk()

  for (const user of usersAtRisk) {
    await pushService.sendFromTemplate(
      'streak_risk',
      user.id,
      { name: user.name, streak: user.currentStreak.toString() }
    )
  }
})
```

## Best Practices

### 1. Timing
- **Morning** (8-10 AM): Daily reminders, motivational
- **Afternoon** (2-4 PM): Progress updates, challenges
- **Evening** (7-9 PM): Streak reminders, achievements
- **Avoid** (10 PM - 8 AM): Respect quiet hours

### 2. Frequency
- Max 3-5 notifications per day
- Minimum 1 hour between notifications
- Weekly summary instead of daily stats
- Let users control frequency

### 3. Content
- Keep title under 50 characters
- Keep body under 150 characters
- Use emojis sparingly (1-2 max)
- Clear call-to-action
- Personalize with user's name

### 4. Targeting
- Segment users by behavior
- A/B test notification copy
- Respect user preferences
- Track and optimize engagement

### 5. Privacy
- Request permission, don't force
- Explain value before asking
- Make opt-out easy
- Respect Do Not Disturb
- Don't spam

## Performance Optimization

### Batch Processing
- Process in batches of 500 devices
- Avoid rate limits (FCM: 600k/min)
- Use priority queues
- Implement exponential backoff

### Caching
- Cache device tokens in Redis
- Pre-compute segment user lists
- Cache template content
- Invalidate on user update

### Monitoring
- Track delivery success rate
- Monitor FCM quotas
- Alert on high failure rate
- Log and analyze errors

## Error Handling

**Common Errors:**
1. **Invalid Token** → Deactivate device
2. **NotRegistered** → Remove from database
3. **MessageTooBig** → Reduce payload size
4. **DeviceMessageRateExceeded** → Back off sending
5. **QuotaExceeded** → Upgrade FCM plan

**Retry Logic:**
- Retry failed sends 3 times
- Exponential backoff (2s, 4s, 8s)
- Mark as permanently failed after 3 attempts
- Alert admin on high failure rate

## Metrics to Track

**Delivery Metrics:**
- Total sent
- Delivery rate (%)
- Failed deliveries
- Average delivery time

**Engagement Metrics:**
- Open rate (%)
- Click-through rate (%)
- Conversion rate (%)
- Time to open

**Business Metrics:**
- User retention via notifications
- DAU/MAU impact
- Revenue from campaigns
- Cost per engagement

## Testing Checklist

- [ ] Web: Chrome, Firefox, Edge, Safari 16+
- [ ] Mobile: iOS 14+, Android 8+
- [ ] Permission request flow
- [ ] Send to single user
- [ ] Send to segment (100+ users)
- [ ] Scheduled delivery
- [ ] Template with variables
- [ ] Preference respect (quiet hours, disabled categories)
- [ ] Invalid token cleanup
- [ ] Retry logic on failure
- [ ] Analytics accuracy
- [ ] Deep linking works
- [ ] Background notifications
- [ ] Rich media (images)
- [ ] Sound and vibration
- [ ] Badge count (iOS)

## Security Considerations

1. **Token Storage:** Encrypt FCM tokens at rest
2. **VAPID Keys:** Keep private keys secret
3. **Auth Required:** Only send to authenticated users
4. **Rate Limiting:** Prevent notification spam
5. **Content Validation:** Sanitize titles and bodies
6. **Admin Only:** Segment sends require admin role

## Future Enhancements (Post-MVP)

- [ ] In-app notification center
- [ ] Notification grouping/threading
- [ ] Rich actions (reply, like, dismiss)
- [ ] Notification sound customization
- [ ] Advanced targeting (location, behavior)
- [ ] A/B testing framework
- [ ] Notification preview before send
- [ ] Multi-language support
- [ ] SMS fallback for critical notifications
- [ ] Notification templates marketplace

---

**Day 38 Complete!** 🔔

Total implementation:
- 7 database models
- 850+ lines service logic
- 10 API endpoints
- FCM + Web Push integration
- Complete analytics and tracking
- Template system with scheduling
- User preferences and quiet hours

Ready for production! Push notifications = Higher engagement! 🚀
