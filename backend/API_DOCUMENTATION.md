# English Flow API Documentation

Complete API documentation for the English Flow language learning platform.

## Base URLs

- **Development**: `http://localhost:3001`
- **Production**: `https://api.englishflow.com`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Core Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Phrases
- `GET /api/phrases` - Get phrases for study
- `GET /api/phrases/:id` - Get phrase details
- `POST /api/phrases/:id/review` - Review phrase
- `GET /api/phrases/daily` - Get daily phrases

### Progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/stats` - Get detailed stats
- `POST /api/progress/update` - Update progress

### Achievements
- `GET /api/achievements` - Get user achievements
- `GET /api/achievements/available` - Get available achievements

### Social
- `GET /api/social/friends` - Get friends list
- `POST /api/social/friends/request/:id` - Send friend request
- `GET /api/social/leaderboard` - Get leaderboard
- `GET /api/social/groups` - Get study groups

### Gamification
- `GET /api/gamification/challenges` - Get active challenges
- `POST /api/gamification/challenges/:id/join` - Join challenge
- `GET /api/gamification/daily-goal` - Get daily goal
- `GET /api/gamification/quests` - Get available quests

### Content
- `GET /api/content/categories` - Get categories
- `GET /api/content/topics` - Get topics
- `POST /api/content/search` - Advanced search

### Monitoring (Admin)
- `GET /api/monitoring/health` - System health
- `GET /api/monitoring/errors` - Error logs
- `GET /api/monitoring/performance` - Performance metrics

### Feedback
- `POST /api/feedback` - Submit feedback
- `POST /api/feedback/survey` - Submit survey
- `GET /api/feedback/admin/all` - Get all feedback (admin)

## Response Format

All endpoints return JSON with the following structure:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Rate Limiting

- **Anonymous**: 100 requests per 15 minutes
- **Authenticated**: 1000 requests per 15 minutes
- **Premium**: 5000 requests per 15 minutes

## Pagination

List endpoints support pagination:

```
GET /api/phrases?limit=20&offset=0
```

## Filtering

Many endpoints support filtering:

```
GET /api/phrases?level=beginner&difficulty=easy
```

## Swagger Documentation

Full interactive API documentation available at:
- Development: `http://localhost:3001/api-docs`
- Production: `https://api.englishflow.com/api-docs`

## Testing

Run API tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- api.test.ts
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Webhooks

Available webhook events:
- `user.created`
- `achievement.unlocked`
- `challenge.completed`
- `subscription.updated`

## SDK Support

Official SDKs:
- JavaScript/TypeScript
- Python
- Ruby
- PHP

## Support

- Email: api@englishflow.com
- Documentation: https://docs.englishflow.com
- Status: https://status.englishflow.com
