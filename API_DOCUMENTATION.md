# 📚 API DOCUMENTATION - AprendaInglesGratis

**Versão**: 1.0.0
**Base URL**: `https://api.aprendaingles.com/v1`
**Autenticação**: JWT Bearer Token

---

## 🔐 AUTHENTICATION

### POST /api/auth/register
Criar nova conta de usuário.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "João Silva",
  "acceptTerms": true
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "João Silva"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### POST /api/auth/login
Login do usuário.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { "id": "usr_123", "email": "user@example.com", "name": "João Silva" },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### POST /api/auth/refresh
Renovar access token.

**Headers**:
```
Authorization: Bearer {refreshToken}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi..."
  }
}
```

---

## 🗣️ SPEAKING

### POST /api/speaking/analyze
Analisar pronúncia do usuário.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "phraseId": "phr_123",
  "audioData": "base64_encoded_audio",
  "duration": 5.2
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "accuracy": 88,
    "fluency": 82,
    "prosody": 80,
    "transcription": "Hello how are you",
    "feedback": {
      "overall": "Great pronunciation! Keep practicing.",
      "strengths": ["Clear articulation", "Good rhythm"],
      "improvements": ["Work on TH sounds"],
      "specificTips": ["Practice tongue placement for TH"]
    },
    "mistakes": [
      {
        "type": "substitution",
        "word": "the",
        "expected": "the",
        "actual": "de",
        "severity": "medium",
        "suggestion": "Practice 'th' sound"
      }
    ]
  }
}
```

---

## 👂 LISTENING

### POST /api/listening/session/create
Criar sessão de listening.

**Request**:
```json
{
  "level": "B1",
  "accent": "US",
  "speed": 1.0,
  "exerciseCount": 10
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "ses_123",
    "exercises": [
      {
        "id": "ex_123",
        "type": "dictation",
        "audioUrl": "https://cdn.aprendaingles.com/audio/123.mp3",
        "duration": 5
      }
    ]
  }
}
```

### POST /api/listening/check-answer
Verificar resposta de listening.

**Request**:
```json
{
  "exerciseId": "ex_123",
  "userAnswer": "Hello how are you",
  "playbackSpeed": 1.0
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "accuracy": 95,
    "feedback": "Excellent! You got it right.",
    "mistakes": []
  }
}
```

---

## 📝 PLACEMENT TEST

### POST /api/placement/start
Iniciar teste de nivelamento.

**Request**:
```json
{
  "previousLevel": "A2"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "testId": "test_123",
    "currentQuestion": {
      "id": "q_123",
      "type": "multiple_choice",
      "question": "Choose the correct option",
      "options": ["Option A", "Option B", "Option C", "Option D"]
    }
  }
}
```

### POST /api/placement/submit-answer
Enviar resposta do teste.

**Request**:
```json
{
  "testId": "test_123",
  "questionId": "q_123",
  "answer": 2,
  "timeSpent": 15
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "correct": true,
    "nextQuestion": { /* ... */ },
    "completed": false,
    "estimatedLevel": "B1",
    "confidence": 75
  }
}
```

---

## 👨‍🏫 TEACHERS

### GET /api/teachers/search
Buscar professores.

**Query Parameters**:
- `specialization` (opcional): business_english, conversation, etc.
- `minRating` (opcional): 4.0
- `maxRate` (opcional): 5000 (em centavos)
- `page` (opcional): 1
- `limit` (opcional): 20

**Response** (200):
```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": "tch_123",
        "name": "John Smith",
        "avatar": "https://cdn.aprendaingles.com/avatars/123.jpg",
        "rating": 4.8,
        "hourlyRate": 3990,
        "specializations": ["conversation", "business_english"],
        "totalLessons": 150
      }
    ],
    "total": 50,
    "page": 1
  }
}
```

### POST /api/teachers/book-lesson
Agendar aula com professor.

**Request**:
```json
{
  "teacherId": "tch_123",
  "scheduledAt": "2025-12-01T10:00:00Z",
  "duration": 60,
  "topic": "Business conversation practice"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "lessonId": "les_123",
    "status": "pending",
    "meetingUrl": "https://meet.aprendaingles.com/les_123",
    "price": 3990
  }
}
```

---

## 🎮 GAMIFICATION

### POST /api/gamification/xp
Adicionar XP ao usuário.

**Request**:
```json
{
  "amount": 50,
  "source": "complete_lesson"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "newXP": 1250,
    "leveledUp": true,
    "newLevel": 5,
    "rewards": [
      { "type": "coins", "amount": 500 },
      { "type": "gems", "amount": 50 }
    ]
  }
}
```

### GET /api/gamification/leaderboard
Obter leaderboard.

**Query Parameters**:
- `type`: xp, streak, weekly
- `period`: daily, weekly, monthly, all_time

**Response** (200):
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "rank": 1,
        "username": "João Silva",
        "level": 25,
        "xp": 50000,
        "isCurrentUser": false
      }
    ],
    "userRank": 42,
    "totalParticipants": 10000
  }
}
```

---

## ✍️ GRAMMAR

### POST /api/grammar/correct
Corrigir texto gramático.

**Request**:
```json
{
  "text": "I goes to school everyday."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "originalText": "I goes to school everyday.",
    "correctedText": "I go to school every day.",
    "errors": [
      {
        "type": "agreement",
        "incorrect": "goes",
        "correct": "go",
        "explanation": "Use 'go' with I/you/we/they",
        "severity": "high"
      }
    ],
    "overallScore": 75
  }
}
```

---

## 📊 ERROR CODES

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

**Error Response Format**:
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_email"
    }
  ]
}
```

---

## 🔒 RATE LIMITS

| Endpoint Type | Rate Limit |
|---------------|------------|
| Auth | 5 requests / 15 min |
| API | 100 requests / 15 min |
| Uploads | 10 requests / 1 min |

---

## 📝 CHANGELOG

### v1.0.0 (2025-11-21)
- Initial API release
- Speaking analysis
- Listening exercises
- Placement test
- Teachers marketplace
- Gamification system
- Grammar correction
