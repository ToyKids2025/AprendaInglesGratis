# Day 34 - Email Marketing Automation

Complete email marketing system with campaigns, drip sequences, and analytics.

## Features

### 1. Email Campaigns
- Create and schedule campaigns
- Target specific segments (all, premium, free, inactive, custom)
- Track delivery, opens, clicks, bounces
- Campaign analytics dashboard
- Variable replacement ({{name}}, {{xp}}, {{level}}, etc.)

### 2. Drip Sequences
- Automated email sequences
- Trigger-based (signup, premium purchase, inactivity, level up)
- Multi-step sequences with delays
- Conditional sending
- Progress tracking per user

### 3. Email Templates
- Reusable templates
- Variable support
- Categories (welcome, notification, marketing, transactional)
- Active/inactive management

### 4. Analytics
- Open rates
- Click-through rates
- Bounce rates
- Delivery statistics
- Per-campaign tracking

## Database Schema

### EmailCampaign
- Campaign details (name, subject, content)
- Segment targeting
- Scheduling
- Statistics (opens, clicks, unsubscribes)

### EmailLog
- Individual email tracking
- Status tracking (sent, delivered, opened, clicked, bounced)
- Error logging

### DripSequence & DripStep
- Automated sequences
- Step-by-step configuration
- Delay settings

### UserDripProgress
- User progress in sequences
- Next step scheduling
- Completion tracking

### EmailTemplate
- Reusable templates
- Variable definitions
- Category organization

## API Endpoints

### Admin Only
- `POST /api/email-marketing/campaigns` - Create campaign
- `POST /api/email-marketing/campaigns/:id/send` - Send campaign
- `GET /api/email-marketing/campaigns/:id/analytics` - Get analytics
- `POST /api/email-marketing/drip-sequences` - Create sequence
- `GET /api/email-marketing/templates` - List templates

## Usage Examples

### Create Campaign
```javascript
POST /api/email-marketing/campaigns
{
  "name": "Welcome Campaign",
  "subject": "Welcome to English Flow, {{name}}!",
  "htmlContent": "<h1>Hello {{name}}!</h1><p>You have {{xp}} XP</p>",
  "segment": "all"
}
```

### Create Drip Sequence
```javascript
POST /api/email-marketing/drip-sequences
{
  "name": "Onboarding Sequence",
  "trigger": "signup",
  "steps": [
    {
      "name": "Welcome Email",
      "subject": "Welcome!",
      "htmlContent": "...",
      "delayDays": 0
    },
    {
      "name": "Day 3 Follow-up",
      "subject": "How's it going?",
      "htmlContent": "...",
      "delayDays": 3
    }
  ]
}
```

## Automation

### Cron Job
Run `processDripSequences()` every hour to send scheduled drip emails:

```javascript
// Schedule with cron
import { processDripSequences } from './services/emailMarketing.service'

cron.schedule('0 * * * *', async () => {
  await processDripSequences()
})
```

## Segments

- **all** - All users
- **premium** - Premium subscribers only
- **free** - Free users only
- **inactive** - Users who haven't studied in 7+ days
- **custom** - Custom query criteria

## Variables

Available in all emails:
- `{{name}}` - User's name
- `{{email}}` - User's email
- `{{xp}}` - User's XP
- `{{level}}` - User's level
- `{{streak}}` - User's streak

## Email Types

1. **Campaign** - Bulk campaigns
2. **Drip** - Automated sequences
3. **Transactional** - System emails

## Triggers

- **signup** - New user registration
- **premium_purchase** - User upgrades to premium
- **inactivity** - User inactive for X days
- **level_up** - User levels up

Day 34 complete - Production-ready email marketing system! 📧
