# English Flow API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:3001` (development) | `https://api.englishflow.com` (production)
**Last Updated:** November 2024

---

## Table of Contents

1. [Authentication](#authentication)
2. [Common Response Codes](#common-response-codes)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Endpoints](#endpoints)
   - [Auth Routes](#auth-routes)
   - [User Routes](#user-routes)
   - [Lesson Routes](#lesson-routes)
   - [AI Routes](#ai-routes)
   - [Contact Routes](#contact-routes)
   - [Newsletter Routes](#newsletter-routes)
   - [Payment Routes](#payment-routes)
   - [Admin Routes](#admin-routes)

---

## Authentication

Most endpoints require JWT authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <your_access_token>
```

**Token Lifecycle:**
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Use `/api/auth/refresh` to get a new access token

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Rate Limiting

Rate limits vary by endpoint type:

| Type | Limit | Window |
|------|-------|--------|
| General | 100 requests | 1 minute |
| Auth | 5 failed attempts | 15 minutes |
| AI | 20 requests | 1 minute |
| Newsletter | 3 requests | 1 hour |
| Payments | 30 requests | 1 minute |
| Contact | Custom limit | 1 hour |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1699564800
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed explanation (optional)",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

---

# Endpoints

## Auth Routes

Base path: `/api/auth`

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`
**Auth Required:** No
**Rate Limit:** 5 attempts / 15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-11-08T10:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` - Email already registered
- `400` - Password must be at least 8 characters
- `400` - Invalid email format

---

### Login

Authenticate and receive access tokens.

**Endpoint:** `POST /api/auth/login`
**Auth Required:** No
**Rate Limit:** 5 failed attempts / 15 minutes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "xp": 1500,
    "level": 3,
    "streak": 7,
    "isPremium": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401` - Invalid email or password
- `429` - Too many failed login attempts

---

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`
**Auth Required:** No (requires refresh token in body)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401` - Invalid or expired refresh token

---

### Logout

Invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`
**Auth Required:** No (requires refresh token in body)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User

Get authenticated user's information.

**Endpoint:** `GET /api/auth/me`
**Auth Required:** Yes

**Response (200):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "xp": 1500,
  "level": 3,
  "streak": 7,
  "isPremium": true,
  "isAdmin": false,
  "createdAt": "2024-11-08T10:00:00Z"
}
```

---

## User Routes

Base path: `/api/users`
**Auth Required:** Yes (all routes)

### Get Profile

Get user profile with detailed statistics.

**Endpoint:** `GET /api/users/profile`

**Response (200):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "xp": 1500,
  "level": 3,
  "streak": 7,
  "bestStreak": 15,
  "totalLessons": 42,
  "isPremium": true,
  "premiumUntil": "2025-11-08T10:00:00Z",
  "createdAt": "2024-11-08T10:00:00Z"
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /api/users/profile`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-here",
    "name": "Jane Doe",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

**Errors:**
- `400` - Invalid avatar URL
- `400` - Name too short/long

---

### Get Stats

Get detailed user statistics.

**Endpoint:** `GET /api/users/stats`

**Response (200):**
```json
{
  "overview": {
    "totalXP": 1500,
    "level": 3,
    "currentStreak": 7,
    "bestStreak": 15,
    "totalLessons": 42,
    "accuracy": 87.5
  },
  "progress": {
    "phrasesLearned": 156,
    "phrasesReviewed": 234,
    "averageMastery": 3.8,
    "categoriesCompleted": 12
  },
  "achievements": {
    "total": 8,
    "recent": [
      {
        "id": "streak-7",
        "name": "Week Warrior",
        "description": "7 day streak",
        "unlockedAt": "2024-11-08T10:00:00Z"
      }
    ]
  }
}
```

---

### Get Achievements

Get all user achievements.

**Endpoint:** `GET /api/users/achievements`

**Response (200):**
```json
{
  "achievements": [
    {
      "id": "first-lesson",
      "name": "First Steps",
      "description": "Complete your first lesson",
      "icon": "🎯",
      "rarity": "common",
      "unlocked": true,
      "unlockedAt": "2024-11-01T10:00:00Z",
      "xpReward": 50
    },
    {
      "id": "streak-30",
      "name": "Monthly Master",
      "description": "30 day streak",
      "icon": "🔥",
      "rarity": "legendary",
      "unlocked": false,
      "progress": {
        "current": 7,
        "target": 30
      }
    }
  ]
}
```

---

## Lesson Routes

Base path: `/api/lessons`
**Auth Required:** Yes (all routes)

### Get Levels

Get all available levels.

**Endpoint:** `GET /api/lessons/levels`

**Response (200):**
```json
{
  "levels": [
    {
      "id": 1,
      "number": 1,
      "name": "Beginner",
      "description": "Start your English journey",
      "requiredXP": 0,
      "categoryCount": 12,
      "phraseCount": 156,
      "userProgress": {
        "completed": 8,
        "total": 12,
        "percentage": 66.67
      }
    }
  ]
}
```

---

### Get Categories

Get all categories (optionally filtered by level).

**Endpoint:** `GET /api/lessons/categories?level=1`

**Query Parameters:**
- `level` (optional) - Filter by level number

**Response (200):**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Basic Greetings",
      "slug": "basic-greetings",
      "description": "Learn essential greetings",
      "icon": "👋",
      "difficulty": 1,
      "levelId": 1,
      "levelName": "Beginner",
      "phraseCount": 20,
      "userProgress": {
        "completed": 15,
        "total": 20,
        "mastery": 4.2
      }
    }
  ]
}
```

---

### Get Category with Phrases

Get a specific category with all phrases.

**Endpoint:** `GET /api/lessons/categories/:slug`

**Response (200):**
```json
{
  "category": {
    "id": 1,
    "name": "Basic Greetings",
    "slug": "basic-greetings",
    "description": "Learn essential greetings",
    "icon": "👋",
    "difficulty": 1,
    "levelId": 1,
    "levelName": "Beginner"
  },
  "phrases": [
    {
      "id": 1,
      "en": "Hello, how are you?",
      "pt": "Olá, como você está?",
      "tip": "Use 'how are you' for informal situations",
      "difficulty": 1,
      "order": 1,
      "userProgress": {
        "mastery": 5,
        "reviewCount": 8,
        "lastReview": "2024-11-08T10:00:00Z",
        "nextReview": "2024-11-15T10:00:00Z"
      }
    }
  ],
  "stats": {
    "totalPhrases": 20,
    "learned": 15,
    "reviewing": 3,
    "new": 2,
    "averageMastery": 4.2
  }
}
```

**Errors:**
- `404` - Category not found

---

### Update Progress

Update user progress for a phrase.

**Endpoint:** `POST /api/lessons/progress`

**Request Body:**
```json
{
  "phraseId": 1,
  "correct": true,
  "timeSpent": 15
}
```

**Response (200):**
```json
{
  "message": "Progress updated",
  "progress": {
    "phraseId": 1,
    "mastery": 3,
    "reviewCount": 5,
    "nextReview": "2024-11-10T10:00:00Z"
  },
  "rewards": {
    "xpGained": 10,
    "newLevel": false,
    "achievements": []
  }
}
```

---

## AI Routes

Base path: `/api/ai`
**Auth Required:** Yes (all routes)
**Rate Limit:** 20 requests / minute

### Start Conversation

Start a new AI conversation session.

**Endpoint:** `POST /api/ai/conversation/start`

**Request Body:**
```json
{
  "scenario": "restaurant", // optional: restaurant, travel, job-interview, casual
  "difficulty": "intermediate" // optional: beginner, intermediate, advanced
}
```

**Response (201):**
```json
{
  "conversation": {
    "id": "uuid-here",
    "scenario": "restaurant",
    "difficulty": "intermediate",
    "createdAt": "2024-11-08T10:00:00Z",
    "messages": [
      {
        "role": "assistant",
        "content": "Hello! Welcome to our restaurant. How can I help you today?",
        "timestamp": "2024-11-08T10:00:00Z"
      }
    ]
  }
}
```

---

### Send Message

Send a message in an ongoing conversation.

**Endpoint:** `POST /api/ai/conversation/message`

**Request Body:**
```json
{
  "conversationId": "uuid-here",
  "message": "I'd like to order a pizza, please."
}
```

**Response (200):**
```json
{
  "message": {
    "role": "assistant",
    "content": "Great choice! What kind of pizza would you like?",
    "timestamp": "2024-11-08T10:01:00Z"
  },
  "feedback": {
    "grammarCorrect": true,
    "vocabularyLevel": "appropriate",
    "suggestions": []
  }
}
```

**Errors:**
- `400` - Message too long (max 1000 characters)
- `404` - Conversation not found
- `429` - Too many AI requests

---

### Get Conversation

Get a specific conversation with all messages.

**Endpoint:** `GET /api/ai/conversation/:id`

**Response (200):**
```json
{
  "conversation": {
    "id": "uuid-here",
    "scenario": "restaurant",
    "difficulty": "intermediate",
    "createdAt": "2024-11-08T10:00:00Z",
    "messages": [
      {
        "role": "assistant",
        "content": "Hello! Welcome to our restaurant.",
        "timestamp": "2024-11-08T10:00:00Z"
      },
      {
        "role": "user",
        "content": "I'd like to order a pizza.",
        "timestamp": "2024-11-08T10:00:30Z"
      }
    ],
    "stats": {
      "messageCount": 12,
      "duration": 450,
      "avgResponseTime": 15
    }
  }
}
```

---

### Get All Conversations

Get user's conversation history.

**Endpoint:** `GET /api/ai/conversations?limit=10&offset=0`

**Query Parameters:**
- `limit` (optional, default: 10) - Number of conversations
- `offset` (optional, default: 0) - Pagination offset

**Response (200):**
```json
{
  "conversations": [
    {
      "id": "uuid-here",
      "scenario": "restaurant",
      "difficulty": "intermediate",
      "messageCount": 12,
      "createdAt": "2024-11-08T10:00:00Z",
      "lastMessage": "Thank you for your order!"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Evaluate Answer

Get AI evaluation of user's answer to a phrase.

**Endpoint:** `POST /api/ai/evaluate`

**Request Body:**
```json
{
  "phraseId": 1,
  "userAnswer": "Hello, how are you?",
  "expectedAnswer": "Hello, how are you?"
}
```

**Response (200):**
```json
{
  "evaluation": {
    "correct": true,
    "score": 95,
    "feedback": {
      "grammar": "Excellent!",
      "pronunciation": "Very clear",
      "vocabulary": "Perfect word choice",
      "improvements": []
    },
    "similarity": 98.5
  }
}
```

---

## Contact Routes

Base path: `/api/contact`

### Submit Contact Form

Send a contact form message.

**Endpoint:** `POST /api/contact`
**Auth Required:** No
**Rate Limit:** Custom (3-5 per hour per IP)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about pricing",
  "message": "I would like to know more about your pricing plans..."
}
```

**Response (200):**
```json
{
  "message": "Mensagem enviada com sucesso! Responderemos em breve.",
  "ticketId": "uuid-here"
}
```

**Errors:**
- `400` - Invalid email format
- `400` - Message too short (min 10 characters)
- `400` - Message too long (max 2000 characters)
- `429` - Too many contact form submissions

---

### Health Check

Check contact service health.

**Endpoint:** `GET /api/contact/health`
**Auth Required:** No

**Response (200):**
```json
{
  "status": "ok",
  "emailService": "operational"
}
```

---

## Newsletter Routes

Base path: `/api/newsletter`

### Subscribe

Subscribe to newsletter.

**Endpoint:** `POST /api/newsletter/subscribe`
**Auth Required:** No
**Rate Limit:** 3 requests / hour per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe" // optional
}
```

**Response (201):**
```json
{
  "message": "Inscrição realizada com sucesso!",
  "subscriber": {
    "id": "uuid-here",
    "email": "user@example.com",
    "subscribedAt": "2024-11-08T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Invalid email format
- `400` - Email already subscribed
- `429` - Too many subscription attempts

---

### Unsubscribe

Unsubscribe from newsletter.

**Endpoint:** `POST /api/newsletter/unsubscribe`
**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Você foi removido da newsletter."
}
```

---

### Get Stats (Admin)

Get newsletter statistics.

**Endpoint:** `GET /api/newsletter/stats`
**Auth Required:** Yes

**Response (200):**
```json
{
  "stats": {
    "totalSubscribers": 1523,
    "activeSubscribers": 1456,
    "unsubscribed": 67,
    "growthRate": 15.2,
    "lastCampaign": {
      "sentAt": "2024-11-01T10:00:00Z",
      "recipients": 1450,
      "successCount": 1448,
      "openRate": 32.5
    }
  }
}
```

---

### Send Campaign (Admin)

Send newsletter campaign to all subscribers.

**Endpoint:** `POST /api/newsletter/send-campaign`
**Auth Required:** Yes (Admin only)

**Request Body:**
```json
{
  "subject": "New Features Available!",
  "content": "<html>...</html>",
  "previewText": "Check out what's new"
}
```

**Response (200):**
```json
{
  "message": "Campanha enviada com sucesso!",
  "campaign": {
    "id": "uuid-here",
    "subject": "New Features Available!",
    "recipientCount": 1456,
    "sentAt": "2024-11-08T10:00:00Z"
  }
}
```

---

### Health Check

Check newsletter service health.

**Endpoint:** `GET /api/newsletter/health`
**Auth Required:** No

**Response (200):**
```json
{
  "status": "ok",
  "emailService": "operational"
}
```

---

## Payment Routes

Base path: `/api/payments`
**Rate Limit:** 30 requests / minute

### Create Checkout Session

Create a Stripe checkout session.

**Endpoint:** `POST /api/payments/create-checkout-session`
**Auth Required:** Yes

**Request Body:**
```json
{
  "plan": "monthly" // or "yearly"
}
```

**Response (200):**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Errors:**
- `400` - Invalid plan type
- `400` - User already has active subscription

---

### Create Portal Session

Create a Stripe customer portal session.

**Endpoint:** `POST /api/payments/create-portal-session`
**Auth Required:** Yes

**Response (200):**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

**Errors:**
- `400` - User has no Stripe customer ID

---

### Get Subscription Status

Get user's subscription status.

**Endpoint:** `GET /api/payments/subscription-status`
**Auth Required:** Yes

**Response (200):**
```json
{
  "subscription": {
    "active": true,
    "plan": "monthly",
    "status": "active",
    "currentPeriodEnd": "2024-12-08T10:00:00Z",
    "cancelAtPeriodEnd": false
  },
  "customer": {
    "stripeCustomerId": "cus_...",
    "email": "user@example.com"
  }
}
```

---

### Webhook Handler

Handle Stripe webhook events (internal use).

**Endpoint:** `POST /api/payments/webhook`
**Auth Required:** No (Stripe signature verification)

**Note:** This endpoint is called by Stripe, not by clients.

**Supported Events:**
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`

---

### Health Check

Check payment service health.

**Endpoint:** `GET /api/payments/health`
**Auth Required:** No

**Response (200):**
```json
{
  "status": "ok",
  "stripe": "operational"
}
```

---

## Admin Routes

Base path: `/api/admin`
**Auth Required:** Yes (all routes require admin privileges)

### Get Users

Get list of all users with filtering and pagination.

**Endpoint:** `GET /api/admin/users?page=1&limit=20&search=john&plan=premium`

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)
- `search` (optional) - Search by email or name
- `plan` (optional) - Filter by plan: `all`, `premium`, `free`
- `sortBy` (optional, default: `createdAt`) - `createdAt`, `xp`, `level`
- `order` (optional, default: `desc`) - `asc`, `desc`

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "xp": 1500,
      "level": 3,
      "streak": 7,
      "isPremium": true,
      "isAdmin": false,
      "createdAt": "2024-11-08T10:00:00Z",
      "lastLogin": "2024-11-08T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

### Get User Details

Get detailed information about a specific user.

**Endpoint:** `GET /api/admin/users/:id`

**Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "xp": 1500,
    "level": 3,
    "streak": 7,
    "bestStreak": 15,
    "isPremium": true,
    "premiumUntil": "2025-11-08T10:00:00Z",
    "stripeCustomerId": "cus_...",
    "createdAt": "2024-11-08T10:00:00Z",
    "lastLogin": "2024-11-08T14:30:00Z"
  },
  "stats": {
    "totalLessons": 42,
    "phrasesLearned": 156,
    "averageMastery": 3.8,
    "achievementsUnlocked": 8,
    "conversationsStarted": 12
  }
}
```

**Errors:**
- `404` - User not found

---

### Update User

Update user information.

**Endpoint:** `PATCH /api/admin/users/:id`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "xp": 2000,
  "isPremium": true,
  "isAdmin": false
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid-here",
    "name": "Jane Doe",
    "xp": 2000,
    "isPremium": true
  }
}
```

**Errors:**
- `404` - User not found
- `400` - Invalid data

---

### Delete User

Delete a user account.

**Endpoint:** `DELETE /api/admin/users/:id`

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Errors:**
- `404` - User not found
- `403` - Cannot delete admin users

---

### Get Analytics

Get platform analytics and statistics.

**Endpoint:** `GET /api/admin/analytics?days=30`

**Query Parameters:**
- `days` (optional, default: 30) - Number of days to analyze

**Response (200):**
```json
{
  "overview": {
    "totalUsers": 1523,
    "premiumUsers": 342,
    "activeUsers": 856,
    "totalRevenue": 13678.50,
    "conversionRate": 22.5
  },
  "growth": {
    "newUsers": 156,
    "newPremium": 34,
    "churnRate": 2.1,
    "revenueGrowth": 15.3
  },
  "engagement": {
    "avgSessionDuration": 18.5,
    "avgLessonsPerUser": 12.3,
    "completionRate": 67.8,
    "returnRate": 45.2
  },
  "content": {
    "totalPhrases": 1245,
    "totalCategories": 48,
    "avgPhrasesPerCategory": 25.9,
    "mostPopularCategory": "Travel Basics"
  }
}
```

---

### Generate AI Phrases

Generate phrases using AI.

**Endpoint:** `POST /api/admin/phrases/generate`

**Request Body:**
```json
{
  "category": "Travel",
  "level": "intermediate",
  "difficulty": 3,
  "count": 20,
  "context": "airport situations"
}
```

**Response (200):**
```json
{
  "phrases": [
    {
      "en": "Where is the check-in counter?",
      "pt": "Onde fica o balcão de check-in?",
      "tip": "Use 'check-in counter' for airport desk",
      "difficulty": 3
    }
  ],
  "count": 20,
  "cost": {
    "tokens": 1250,
    "estimatedCost": 0.025
  }
}
```

**Errors:**
- `400` - Invalid parameters
- `400` - Count exceeds limit (max 50)
- `503` - OpenAI API unavailable

---

### Batch Create Phrases

Save multiple phrases to database.

**Endpoint:** `POST /api/admin/phrases/batch-create`

**Request Body:**
```json
{
  "categoryId": 12,
  "phrases": [
    {
      "en": "Where is the check-in counter?",
      "pt": "Onde fica o balcão de check-in?",
      "tip": "Use 'check-in counter' for airport desk",
      "difficulty": 3
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "20 phrases created successfully",
  "created": 20,
  "categoryId": 12
}
```

**Errors:**
- `404` - Category not found
- `400` - Invalid phrase data

---

### Get Phrases

Get all phrases with filtering.

**Endpoint:** `GET /api/admin/phrases?categoryId=12&difficulty=3&page=1&limit=50`

**Query Parameters:**
- `categoryId` (optional) - Filter by category
- `difficulty` (optional) - Filter by difficulty (1-5)
- `page` (optional, default: 1)
- `limit` (optional, default: 50)
- `search` (optional) - Search in English or Portuguese

**Response (200):**
```json
{
  "phrases": [
    {
      "id": 123,
      "en": "Where is the check-in counter?",
      "pt": "Onde fica o balcão de check-in?",
      "tip": "Use 'check-in counter' for airport desk",
      "difficulty": 3,
      "order": 5,
      "categoryId": 12,
      "categoryName": "Travel Basics",
      "createdAt": "2024-11-08T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 1245,
    "page": 1,
    "limit": 50,
    "totalPages": 25
  }
}
```

---

### Update Phrase

Update an existing phrase.

**Endpoint:** `PATCH /api/admin/phrases/:id`

**Request Body:**
```json
{
  "en": "Where is the check-in desk?",
  "pt": "Onde fica o balcão de check-in?",
  "tip": "Alternative: 'check-in desk'",
  "difficulty": 2,
  "order": 6
}
```

**Response (200):**
```json
{
  "message": "Phrase updated successfully",
  "phrase": {
    "id": 123,
    "en": "Where is the check-in desk?",
    "difficulty": 2
  }
}
```

**Errors:**
- `404` - Phrase not found

---

### Delete Phrase

Delete a phrase.

**Endpoint:** `DELETE /api/admin/phrases/:id`

**Response (200):**
```json
{
  "message": "Phrase deleted successfully"
}
```

**Errors:**
- `404` - Phrase not found

---

### Get Categories

Get all categories with phrase counts.

**Endpoint:** `GET /api/admin/categories?levelId=1`

**Query Parameters:**
- `levelId` (optional) - Filter by level

**Response (200):**
```json
{
  "categories": [
    {
      "id": 12,
      "name": "Travel Basics",
      "slug": "travel-basics",
      "description": "Essential travel phrases",
      "icon": "✈️",
      "difficulty": 3,
      "levelId": 2,
      "levelName": "Intermediate",
      "phraseCount": 48,
      "order": 5,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ]
}
```

---

### Health Check

Check admin service health.

**Endpoint:** `GET /api/admin/health`
**Auth Required:** Yes (Admin)

**Response (200):**
```json
{
  "status": "ok",
  "database": "connected",
  "services": {
    "openai": "operational",
    "stripe": "operational",
    "email": "operational"
  }
}
```

---

## Appendix

### Spaced Repetition Algorithm

The platform uses a modified SuperMemo SM-2 algorithm:

**Mastery Levels:**
- 0: New (not studied yet)
- 1: Learning (first exposure)
- 2: Familiar (recognized but not mastered)
- 3: Known (can recall with effort)
- 4: Proficient (recall easily)
- 5: Mastered (automatic recall)

**Review Intervals:**
- Mastery 1: Review in 1 day
- Mastery 2: Review in 3 days
- Mastery 3: Review in 7 days
- Mastery 4: Review in 14 days
- Mastery 5: Review in 30 days

**XP Rewards:**
- Correct answer: 10 XP × mastery level
- Wrong answer: 5 XP (practice bonus)
- First time correct: +50% bonus
- Streak bonus: +10 XP per day

### Gamification System

**Levels:**
- 100 XP per level (exponential growth)
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 250 XP
- Level 10: 2,000 XP

**Achievements:**
- **Common:** 8 achievements (50-100 XP)
- **Rare:** 6 achievements (150-250 XP)
- **Epic:** 4 achievements (300-500 XP)
- **Legendary:** 2 achievements (750-1000 XP)

**Streaks:**
- Daily login = +1 streak
- Midnight reset (Brazilian time)
- Freeze available (premium only)

---

## Support

For questions or issues:
- **Email:** suporte@englishflow.com
- **GitHub:** https://github.com/ToyKids2025/AprendaInglesGratis
- **Discord:** discord.gg/englishflow

---

**Last Updated:** November 2024
**API Version:** 1.0.0
**Documentation:** https://docs.englishflow.com
