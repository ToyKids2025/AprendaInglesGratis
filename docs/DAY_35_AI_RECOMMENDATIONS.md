# Day 35 - AI Content Recommendations

Complete AI-powered recommendation system with multiple algorithms, personalized learning paths, and adaptive content delivery.

## Features

### 1. Multiple Recommendation Algorithms

**Hybrid Algorithm (Default)**
- Combines 4 algorithms with weighted scoring:
  - Spaced Repetition (35%) - Review phrases due for practice
  - Content-Based (30%) - Similar to what user likes
  - Collaborative Filtering (20%) - What similar users study
  - Exploration (15%) - New topics to discover

**Spaced Repetition**
- Based on forgetting curve
- Prioritizes overdue reviews
- Optimizes long-term retention

**Content-Based Filtering**
- Analyzes user's category preferences
- Recommends similar content
- Tracks accuracy per category

**Collaborative Filtering**
- Finds users with similar levels
- Recommends popular phrases
- Social learning insights

### 2. Personalization Engine

**Automatic Preference Learning**
- Tracks liked/disliked categories
- Adapts difficulty based on performance
- Learns from user behavior patterns
- Updates preferences in real-time

**User Context**
- Study history analysis
- Performance metrics
- Mastery levels
- Weak areas identification

### 3. Learning Paths

**Custom Paths**
- Curated phrase sequences
- Milestone tracking
- Progress visualization
- Estimated completion time

**Path Management**
- Create custom paths
- Enroll in existing paths
- Track progress per path
- Completion analytics

### 4. Recommendation Analytics

**User Analytics**
- Acceptance rate
- Average accuracy
- Algorithm performance
- Preference evolution

**System Analytics**
- Recommendation effectiveness
- Algorithm comparison
- User engagement metrics

### 5. Feedback System

**Explicit Feedback**
- Rate recommendations (1-5 stars)
- Relevance indicators
- Difficulty feedback
- Interest tracking

**Implicit Feedback**
- Study completion
- Time spent
- Accuracy achieved
- Skip patterns

## Database Schema

### RecommendationEngine
- User preferences (difficulty, topics, goals)
- Performance tracking (accuracy, strong/weak categories)
- Recommendation settings (AI enabled, diversity, challenge level)

### RecommendationLog
- Tracks every recommendation shown
- Logs acceptance and performance
- Stores algorithm used and confidence
- Enables analytics and A/B testing

### UserPreference
- Learned from behavior
- Category likes/dislikes
- Learning style preferences
- Content discovery settings

### RecommendationFeedback
- User ratings and comments
- Relevance and difficulty feedback
- Links to recommendation logs

### SimilarPhrase
- Pre-computed phrase similarities
- Multiple similarity methods
- Semantic, context, and difficulty scores

### LearningPath & UserPathProgress
- Structured learning sequences
- User enrollment and progress
- Milestone tracking
- Completion analytics

## API Endpoints

### User Endpoints

**GET /api/recommendations**
Get personalized recommendations
```javascript
GET /api/recommendations?limit=20&algorithm=hybrid

Response:
{
  "success": true,
  "recommendations": [
    {
      "phrase": { /* phrase object */ },
      "confidence": 0.85,
      "reason": "Due for review, Similar to your interests",
      "position": 0
    }
  ],
  "count": 20
}
```

**POST /api/recommendations/feedback**
Submit feedback on recommendation
```javascript
POST /api/recommendations/feedback
{
  "phraseId": "uuid",
  "rating": 5,
  "isRelevant": true,
  "isInteresting": true
}
```

**GET /api/recommendations/analytics**
Get recommendation analytics
```javascript
GET /api/recommendations/analytics

Response:
{
  "success": true,
  "analytics": {
    "acceptanceRate": 0.78,
    "avgAccuracy": 0.85,
    "totalRecommendations": 150,
    "algorithmStats": {
      "hybrid": { "total": 100, "accepted": 78 },
      "spaced_repetition": { "total": 50, "accepted": 45 }
    }
  }
}
```

**POST /api/recommendations/preferences/update**
Update preferences based on behavior
```javascript
POST /api/recommendations/preferences/update

Response:
{
  "success": true,
  "preferences": {
    "likedCategories": ["uuid1", "uuid2"],
    "dislikedCategories": [],
    "averageAccuracy": 0.85
  }
}
```

### Learning Paths

**POST /api/recommendations/learning-paths**
Create learning path
```javascript
POST /api/recommendations/learning-paths
{
  "name": "Business English Fundamentals",
  "description": "Essential phrases for business communication",
  "difficulty": "intermediate",
  "duration": 30,
  "phraseIds": ["uuid1", "uuid2", "uuid3"],
  "milestones": [
    { "name": "Week 1", "phraseCount": 20 },
    { "name": "Week 2", "phraseCount": 20 }
  ]
}
```

**POST /api/recommendations/learning-paths/:pathId/enroll**
Enroll in learning path
```javascript
POST /api/recommendations/learning-paths/uuid/enroll

Response:
{
  "success": true,
  "enrollment": {
    "id": "uuid",
    "userId": "uuid",
    "pathId": "uuid",
    "currentPosition": 0,
    "status": "active"
  }
}
```

**GET /api/recommendations/learning-paths**
Get user's learning paths
```javascript
GET /api/recommendations/learning-paths

Response:
{
  "success": true,
  "paths": [
    {
      "id": "uuid",
      "userId": "uuid",
      "pathId": "uuid",
      "currentPosition": 5,
      "completedPhrases": ["uuid1", "uuid2"],
      "status": "active",
      "accuracy": 0.85,
      "path": { /* path details */ }
    }
  ]
}
```

## Recommendation Algorithms

### 1. Hybrid Algorithm

**Workflow:**
1. Fetch recommendations from all 4 algorithms
2. Apply weighted scoring
3. Combine and deduplicate
4. Sort by total score
5. Return top N

**Weights:**
- Spaced Repetition: 35%
- Content-Based: 30%
- Collaborative: 20%
- Exploration: 15%

**Adjustable:** Weights can be tuned per user based on preferences

### 2. Spaced Repetition

**Workflow:**
1. Find phrases where `nextReviewAt <= now`
2. Sort by `nextReviewAt` (most overdue first)
3. Calculate confidence based on position
4. Include mastery level and days since review

**Use Case:** Optimal for retention and review scheduling

### 3. Content-Based Filtering

**Workflow:**
1. Analyze user's category performance
2. Identify top-performing categories (>70% accuracy)
3. Find unstudied phrases in those categories
4. Score based on category performance
5. Return highest-scoring phrases

**Use Case:** Recommends similar content to what user enjoys

### 4. Collaborative Filtering

**Workflow:**
1. Find users with similar level (±1 level)
2. Find phrases they study with high mastery (≥3)
3. Filter phrases current user hasn't studied
4. Rank by popularity among similar users
5. Return top phrases

**Use Case:** Social learning and trending content

### 5. Exploration

**Workflow:**
1. Identify categories user hasn't studied
2. Find phrases in unexplored categories
3. Medium confidence (0.5) for all
4. Helps discover new topics

**Use Case:** Content discovery and diversification

## Personalization

### Preference Learning

**Automatic Updates:**
- After every 10 study sessions
- When feedback is submitted
- On demand via API

**Analysis:**
- Category performance (accuracy, frequency)
- Phrase mastery levels
- Study patterns
- Time preferences

### Adaptive Difficulty

**Factors:**
- User level
- Recent accuracy
- Performance trends
- Explicit preferences

**Adjustments:**
- Increase difficulty if accuracy >85%
- Decrease if accuracy <60%
- Respect user's manual settings

## Usage Examples

### Get Hybrid Recommendations

```javascript
// Default hybrid algorithm
const response = await fetch('/api/recommendations?limit=20', {
  headers: { Authorization: `Bearer ${token}` }
})

const { recommendations } = await response.json()

// recommendations[0] = {
//   phrase: { english: "How are you?", ... },
//   confidence: 0.85,
//   reason: "Due for review, Similar to your interests",
//   position: 0
// }
```

### Get Spaced Repetition Only

```javascript
const response = await fetch(
  '/api/recommendations?algorithm=spaced_repetition&limit=10',
  { headers: { Authorization: `Bearer ${token}` } }
)
```

### Submit Feedback

```javascript
await fetch('/api/recommendations/feedback', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phraseId: 'phrase-uuid',
    rating: 5,
    isRelevant: true,
    isInteresting: true
  })
})
```

### Create Learning Path

```javascript
const path = await fetch('/api/recommendations/learning-paths', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Travel English",
    difficulty: "beginner",
    duration: 14,
    phraseIds: ["uuid1", "uuid2", "uuid3"]
  })
})
```

## Performance Considerations

### Caching

**Recommendation Cache:**
- Cache recommendations for 1 hour
- Invalidate on new study session
- Per-user caching

**Similarity Computation:**
- Pre-compute phrase similarities
- Update daily via cron job
- Store in SimilarPhrase table

### Optimization

**Database Queries:**
- Use indexes on frequently queried fields
- Batch queries with Promise.all()
- Limit result sets appropriately

**Algorithm Execution:**
- Run algorithms in parallel
- Set reasonable limits (max 100 recommendations)
- Use pagination for large result sets

## Analytics & Monitoring

### Key Metrics

**Recommendation Quality:**
- Acceptance rate (target: >70%)
- Average accuracy on recommended phrases (target: >80%)
- User satisfaction ratings

**Algorithm Performance:**
- Per-algorithm acceptance rates
- Execution time per algorithm
- User preference for algorithms

**User Engagement:**
- Recommendations viewed
- Recommendations studied
- Feedback submission rate

### A/B Testing

**Enable Testing:**
- Assign users to algorithm variants
- Track performance per variant
- Compare acceptance and accuracy

**Test Variables:**
- Algorithm weights
- Recommendation count
- Diversity settings

## Integration Points

### Study Session Integration

```javascript
// After completing a phrase
await fetch('/api/recommendations/feedback', {
  method: 'POST',
  body: JSON.stringify({
    phraseId,
    rating: userRating,
    isRelevant: true
  })
})

// Update preferences
await fetch('/api/recommendations/preferences/update', {
  method: 'POST'
})
```

### Dashboard Integration

```javascript
// Show recommendations on dashboard
const { recommendations } = await fetch('/api/recommendations?limit=5')

// Show analytics card
const { analytics } = await fetch('/api/recommendations/analytics')
```

## Future Enhancements

### Phase 2
- Deep learning models for semantic similarity
- Time-of-day preference learning
- Cross-device behavior tracking
- Real-time recommendation updates

### Phase 3
- Multi-modal recommendations (text, audio, video)
- Social recommendations (friend activity)
- Context-aware recommendations (location, time)
- Advanced NLP for content understanding

Day 35 complete - Production-ready AI recommendation system! 🤖
