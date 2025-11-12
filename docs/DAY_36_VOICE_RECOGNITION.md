# Day 36 - Voice Recognition & Pronunciation Practice

Complete voice recognition system with pronunciation analysis, speech-to-text, and practice tracking across web and mobile platforms.

## Features

### 1. Speech-to-Text

**Web (Frontend)**
- Web Speech API integration
- Real-time transcription
- Confidence scores
- Multiple language support
- Error handling and fallbacks

**Mobile (React Native)**
- Expo Audio recording
- High-quality audio capture (44.1kHz)
- iOS and Android support
- Permission management

### 2. Pronunciation Analysis

**Multi-Metric Scoring**
- Overall pronunciation score (0-100)
- Word-level accuracy
- Fluency score
- Completeness score
- Phoneme analysis (basic)

**Algorithms**
- Levenshtein distance for similarity
- Word-by-word comparison
- Common mistake detection
- Performance level classification

### 3. Progress Tracking

**Per-Phrase Progress**
- First attempt score
- Best score achieved
- Average score
- Improvement rate
- Mastery status (90%+ score)

**User Analytics**
- Total attempts
- Average score across all phrases
- Best score ever
- Total practice time
- Mastered phrases count

### 4. Voice Settings

**Recognition Settings**
- Language/dialect selection
- Strict mode (higher accuracy required)
- Minimum acceptable score

**Audio Settings**
- Noise reduction
- Auto gain control
- Echo cancellation

**Practice Settings**
- Enable hints
- Show phonetics
- Playback speed (0.5x - 2.0x)

### 5. Feedback System

**Real-time Feedback**
- Performance level (excellent/good/fair/poor)
- Specific issues identified
- Actionable improvement tips
- Visual pronunciation scores

**Detailed Analysis**
- Word-by-word scores
- Common mistakes highlighted
- Phoneme issues (simplified)
- Improvement suggestions

## Database Schema

### PronunciationAttempt
- Audio storage (S3 URL)
- Transcription and expected text
- Multiple scoring metrics
- Detailed feedback and analysis
- Attempt number tracking

### VoiceSettings
- User preferences per device
- Audio configuration
- Practice settings
- Aggregate statistics

### PronunciationProgress
- Per-phrase progress tracking
- Improvement metrics
- Mastery achievement
- Difficult words/phonemes

### VoiceChallenge (Bonus)
- Pronunciation challenges
- Time limits and requirements
- Rewards (XP, badges)
- Leaderboards

### SpeechAnalytics
- Daily statistics
- Practice time tracking
- Performance trends
- Streak tracking

### PhonemeLibrary (Bonus)
- IPA phoneme symbols
- Example words and sounds
- Difficulty classification
- Common mistakes

## API Endpoints

### POST /api/voice/analyze
Analyze pronunciation from audio or transcript

**Request:**
```javascript
POST /api/voice/analyze
Content-Type: multipart/form-data

{
  audio: File (optional),
  phraseId: "uuid",
  transcribedText: "hello world",
  expectedText: "hello world",
  audioDuration: 2.5,
  studySessionId: "uuid" (optional)
}
```

**Response:**
```javascript
{
  "success": true,
  "result": {
    "attempt": {
      "id": "uuid",
      "pronunciationScore": 95,
      "level": "excellent",
      "feedback": "🌟 Excellent pronunciation!..."
    },
    "analysis": {
      "pronunciationScore": 95,
      "accuracyScore": 0.95,
      "fluencyScore": 0.98,
      "completenessScore": 1.0,
      "wordScores": [
        { "word": "hello", "expected": "hello", "score": 100, "issues": [] },
        { "word": "world", "expected": "world", "score": 90, "issues": ["Minor pronunciation issue"] }
      ],
      "commonMistakes": [],
      "level": "excellent",
      "feedback": "..."
    },
    "improvement": {
      "improvement": 15,
      "improvementRate": 18.75,
      "attemptCount": 3,
      "bestScore": 95,
      "masteryAchieved": true
    }
  }
}
```

### GET /api/voice/history
Get pronunciation attempt history

**Request:**
```javascript
GET /api/voice/history?phraseId=uuid&limit=20
```

**Response:**
```javascript
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "phraseId": "uuid",
      "pronunciationScore": 95,
      "level": "excellent",
      "feedback": "...",
      "attemptNumber": 3,
      "createdAt": "2025-01-15T10:30:00Z",
      "phrase": {
        "english": "Hello, how are you?",
        "portuguese": "Olá, como você está?"
      }
    }
  ]
}
```

### GET /api/voice/statistics
Get voice practice statistics

**Response:**
```javascript
{
  "success": true,
  "statistics": {
    "settings": {
      "totalAttempts": 150,
      "averageScore": 82.5,
      "bestScore": 100
    },
    "totalPracticeTime": 3600,
    "masteredPhrases": 25,
    "recentProgress": [
      {
        "phraseId": "uuid",
        "firstAttemptScore": 65,
        "lastAttemptScore": 95,
        "bestScore": 95,
        "averageScore": 80,
        "attemptCount": 5,
        "masteryAchieved": true,
        "improvementRate": 46.15
      }
    ],
    "dailyAnalytics": [
      {
        "date": "2025-01-15",
        "attemptsToday": 10,
        "averageScore": 85.0,
        "practiceTime": 600,
        "phrasesCompleted": 8
      }
    ]
  }
}
```

### PUT /api/voice/settings
Update voice settings

**Request:**
```javascript
PUT /api/voice/settings
{
  "language": "en-US",
  "strictMode": false,
  "minScore": 70,
  "noiseReduction": true,
  "showPhonetics": true,
  "playbackSpeed": 1.0
}
```

## Pronunciation Scoring Algorithm

### 1. Overall Score (Levenshtein-based)

```typescript
function calculateSimilarityScore(transcribed: string, expected: string): number {
  const distance = levenshteinDistance(transcribed, expected)
  const maxLength = Math.max(transcribed.length, expected.length)

  const similarity = ((maxLength - distance) / maxLength) * 100
  return Math.round(similarity)
}
```

### 2. Word-Level Analysis

- Compare each word individually
- Calculate per-word scores
- Identify specific issues:
  - Missing words
  - Extra words
  - Mispronounced words

### 3. Fluency Score

- Checks word order preservation
- Measures smooth flow
- Detects hesitations (simplified)

### 4. Completeness Score

- Measures what percentage of expected words were spoken
- Penalizes missing words
- Rewards full phrase completion

### 5. Performance Levels

- **Excellent** (95-100): Perfect or near-perfect pronunciation
- **Excellent** (85-94): Excellent pronunciation with minor issues
- **Good** (70-84): Good pronunciation, some improvement needed
- **Fair** (50-69): Fair pronunciation, needs practice
- **Poor** (0-49): Significant pronunciation issues

## Usage Examples

### Web (React)

```typescript
import { useSpeechRecognition, calculatePronunciationScore } from './hooks/useSpeechRecognition'

function PronunciationPractice({ phrase }) {
  const { transcript, isListening, start, stop } = useSpeechRecognition({
    lang: 'en-US',
    onResult: (result) => {
      if (result.isFinal) {
        const score = calculatePronunciationScore(result.transcript, phrase.english)
        console.log(`Score: ${score}%`)
      }
    }
  })

  return (
    <div>
      <p>Say: "{phrase.english}"</p>
      <button onClick={isListening ? stop : start}>
        {isListening ? 'Stop' : 'Start'} Recording
      </button>
      {transcript && <p>You said: "{transcript}"</p>}
    </div>
  )
}
```

### Mobile (React Native)

```typescript
import * as VoiceRecognition from './services/voice-recognition'

async function practicePronunciation(phrase) {
  // Start recording
  const recording = await VoiceRecognition.startRecording({
    maxDuration: 10000 // 10 seconds
  })

  if (!recording) {
    console.error('Failed to start recording')
    return
  }

  // Stop recording after user speaks
  setTimeout(async () => {
    const result = await VoiceRecognition.stopRecording(recording)

    if (result) {
      // Analyze pronunciation
      const analysis = await VoiceRecognition.analyzePronunciation(
        result.uri,
        phrase.id,
        transcribedText, // From speech-to-text API
        phrase.english,
        result.duration / 1000,
        authToken
      )

      console.log(`Score: ${analysis.score}%`)
      console.log(`Feedback: ${analysis.feedback}`)
    }
  }, 5000)
}
```

### Backend Integration

```typescript
import * as voiceRecognitionService from './services/voiceRecognition.service'

// Analyze pronunciation
const result = await voiceRecognitionService.analyzePronunciation({
  userId: 'user-uuid',
  phraseId: 'phrase-uuid',
  transcribedText: 'hello world',
  expectedText: 'hello world',
  audioBuffer: audioFileBuffer, // Optional
  audioFormat: 'webm',
  audioDuration: 2.5
})

console.log(result.analysis.pronunciationScore) // 95
console.log(result.analysis.feedback) // "🌟 Excellent pronunciation!..."
console.log(result.improvement) // { improvement: 15, improvementRate: 18.75, ... }
```

## Audio Storage

### S3 Integration (Optional)

Configure AWS S3 for audio storage:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=english-flow-audio
```

Audio files are stored with pattern:
```
pronunciation/{userId}/{phraseId}/{timestamp}.{format}
```

### Alternative Storage

If S3 is not configured:
- Audio storage is optional
- Analysis works with transcript only
- Can implement alternative storage (Google Cloud Storage, Azure Blob, etc.)

## Performance Optimization

### Frontend

**Web Speech API Optimization:**
- Use interim results for real-time feedback
- Implement proper error handling
- Cache recognition instances
- Debounce result processing

**Audio Processing:**
- Compress audio before upload
- Use appropriate formats (webm for web, m4a for mobile)
- Implement retry logic for network failures

### Backend

**Computation Optimization:**
- Cache common pronunciation patterns
- Batch process multiple analyses
- Use database indexes for queries
- Implement rate limiting

**Storage Optimization:**
- Compress audio files
- Set S3 lifecycle policies
- Delete old recordings after X days
- Use CDN for audio playback

## Analytics & Insights

### User Insights

**Progress Tracking:**
- Daily practice time
- Improvement trends
- Weak areas identification
- Mastery milestones

**Engagement Metrics:**
- Active practice days
- Phrases attempted
- Retry patterns
- Difficulty preferences

### System Metrics

**Accuracy Metrics:**
- Average pronunciation scores
- Improvement rates
- Mastery achievement rate
- Common problem areas

**Usage Patterns:**
- Peak practice times
- Popular phrases
- Average session duration
- Device distribution (web vs mobile)

## Future Enhancements

### Phase 2

**Advanced Speech Recognition:**
- Google Cloud Speech-to-Text integration
- Real phoneme detection and analysis
- Accent detection and adaptation
- Prosody analysis (intonation, rhythm)

**AI-Powered Feedback:**
- GPT-4 generated personalized tips
- Context-aware suggestions
- Video tutorials for difficult sounds
- Native speaker comparisons

### Phase 3

**Social Features:**
- Voice challenges with friends
- Community pronunciation contests
- Expert feedback from tutors
- Peer review system

**Advanced Analytics:**
- Speech pattern visualization
- Formant analysis
- Pitch contour display
- Spectogram views

Day 36 complete - Production-ready voice recognition and pronunciation system! 🎤
