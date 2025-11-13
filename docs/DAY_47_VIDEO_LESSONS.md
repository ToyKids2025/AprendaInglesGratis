# DAY 47 - VIDEO LESSONS SYSTEM

## 📚 Overview

The Video Lessons System is a complete Learning Management System (LMS) for delivering structured video courses with comprehensive progress tracking, quizzes, notes, bookmarks, and certificates. It enables instructors to create multi-module courses while providing students with an engaging learning experience.

### Key Features

- ✅ **Course Management** - Create structured courses with modules and lessons
- ✅ **Video Hosting** - Support for Vimeo, YouTube, and Cloudflare
- ✅ **Progress Tracking** - Detailed completion tracking for lessons and courses
- ✅ **Enrollment System** - Free and premium course enrollments
- ✅ **Interactive Quizzes** - Lesson quizzes with passing scores
- ✅ **Notes & Bookmarks** - Timestamp-based notes and video bookmarks
- ✅ **Certificates** - Auto-generated certificates upon course completion
- ✅ **Course Reviews** - Student ratings and reviews
- ✅ **Transcripts & Subtitles** - Multi-language support
- ✅ **Video Analytics** - Track playback, buffer, engagement metrics

---

## 🎯 Use Cases

### For Instructors
- Create comprehensive video courses with multiple modules
- Upload lessons with transcripts, subtitles, and attachments
- Add quizzes to verify student understanding
- Track student progress and completion rates
- Receive student reviews and ratings

### For Students
- Enroll in free or premium courses
- Watch video lessons with resume capability
- Take notes with timestamps while watching
- Bookmark important moments
- Complete quizzes to test knowledge
- Earn certificates upon course completion
- Track personal learning progress

### For Platform Admins
- Approve/moderate course content
- View analytics on most popular courses
- Manage instructor accounts
- Monitor course quality through ratings

---

## 🏗️ Architecture

### Database Models (13 Core Tables)

#### 1. Course
Main course entity with metadata.

```prisma
model Course {
  id            String   @id @default(uuid())
  title         String
  description   String
  slug          String   @unique
  instructor    String
  level         String   // "beginner", "intermediate", "advanced"
  category      String   // "grammar", "conversation", "business"

  // Media
  thumbnailUrl  String?
  trailerUrl    String?

  // Metadata
  duration      Int      // Total minutes
  lessonsCount  Int
  studentsCount Int
  rating        Float
  reviewsCount  Int

  // Pricing
  price         Float    // 0 = free
  isPremium     Boolean
  isPublished   Boolean

  // Learning
  prerequisites String[]
  learningObjectives String[]
}
```

#### 2. CourseModule
Organize lessons into modules/chapters.

```prisma
model CourseModule {
  id          String   @id
  courseId    String
  title       String
  description String?
  order       Int
  duration    Int      // Minutes
  isLocked    Boolean  // Require previous module completion

  lessons     Lesson[]
}
```

#### 3. Lesson
Individual video lessons.

```prisma
model Lesson {
  id            String   @id
  moduleId      String
  courseId      String   // Denormalized for performance
  title         String
  description   String?
  order         Int

  // Video Data
  videoUrl      String
  videoProvider String   // "vimeo", "youtube", "cloudflare"
  videoDuration Int      // Seconds
  thumbnailUrl  String?

  // Content
  transcript    String?
  subtitles     Json?    // { "en": "url", "pt": "url" }
  attachments   Json[]   // [{ name, url, size, type }]

  // Configuration
  isFree        Boolean
  isPreview     Boolean
  allowDownload Boolean

  // Analytics
  viewsCount    Int
  completionsCount Int
}
```

#### 4. CourseEnrollment
Track user course enrollments.

```prisma
model CourseEnrollment {
  id              String   @id
  userId          String
  courseId        String

  status          String   // "active", "completed", "paused"
  progress        Float    // 0-100
  currentLessonId String?

  completedAt     DateTime?
  certificateUrl  String?
  finalScore      Float?

  enrolledAt      DateTime
  lastAccessedAt  DateTime

  @@unique([userId, courseId])
}
```

#### 5. LessonProgress
Detailed progress for each lesson.

```prisma
model LessonProgress {
  id              String   @id
  userId          String
  lessonId        String
  courseId        String

  status          String   // "not_started", "in_progress", "completed"
  watchedDuration Int      // Seconds watched
  totalDuration   Int
  progress        Float    // 0-100

  isCompleted     Boolean
  completedAt     DateTime?
  quizScore       Float?

  watchCount      Int
  lastPosition    Int      // Resume from this position

  @@unique([userId, lessonId])
}
```

#### 6. LessonNote
Student notes with timestamps.

```prisma
model LessonNote {
  id        String   @id
  userId    String
  lessonId  String
  courseId  String

  content   String
  timestamp Int?     // Video timestamp (null = general note)
  isPrivate Boolean
}
```

#### 7. LessonBookmark
Video bookmarks for quick navigation.

```prisma
model LessonBookmark {
  id        String   @id
  userId    String
  lessonId  String

  title     String
  timestamp Int      // Video timestamp in seconds
  note      String?

  @@unique([userId, lessonId, timestamp])
}
```

#### 8. LessonQuiz
Quizzes to test comprehension.

```prisma
model LessonQuiz {
  id           String   @id
  lessonId     String

  title        String
  description  String?
  questions    Json[]   // Array of question objects

  passingScore Float    // Percentage
  maxAttempts  Int?     // null = unlimited
  timeLimit    Int?     // Minutes
  isRequired   Boolean
}
```

**Question Format:**
```typescript
{
  id: string,
  question: string,
  type: "multiple_choice" | "true_false" | "short_answer",
  options: string[],
  correctAnswer: string,
  explanation?: string
}
```

#### 9. QuizAttempt
Track quiz submissions.

```prisma
model QuizAttempt {
  id            String   @id
  userId        String
  quizId        String
  lessonId      String

  answers       Json[]   // [{ questionId, answer, isCorrect }]
  score         Float    // 0-100
  passed        Boolean

  timeTaken     Int?     // Seconds
  attemptNumber Int
}
```

#### 10. CourseReview
Student ratings and reviews.

```prisma
model CourseReview {
  id          String   @id
  userId      String
  courseId    String

  rating      Int      // 1-5 stars
  title       String?
  comment     String?

  isApproved  Boolean
  isReported  Boolean
  helpfulCount Int

  @@unique([userId, courseId])
}
```

#### 11. Certificate
Auto-generated completion certificates.

```prisma
model Certificate {
  id                String   @id
  userId            String
  courseId          String

  certificateNumber String   @unique
  title             String
  studentName       String
  courseName        String
  completionDate    DateTime

  instructorName    String
  duration          Int      // Course hours
  finalScore        Float?

  pdfUrl            String?
  imageUrl          String?

  verificationCode  String   @unique
  isVerified        Boolean
}
```

#### 12. VideoAnalytics
Detailed video playback analytics.

```prisma
model VideoAnalytics {
  id          String   @id
  lessonId    String
  userId      String

  sessionId   String
  startedAt   DateTime
  endedAt     DateTime?

  totalWatched Int     // Seconds
  playCount    Int
  pauseCount   Int
  seekCount    Int

  avgBitrate   Int?
  bufferCount  Int

  device       String? // "desktop", "mobile", "tablet"
  browser      String?
  os           String?
}
```

---

## 📐 System Architecture

### Course Hierarchy

```
Course
├── Module 1
│   ├── Lesson 1.1
│   │   ├── Video
│   │   ├── Transcript
│   │   ├── Quiz (optional)
│   │   └── Attachments
│   ├── Lesson 1.2
│   └── Lesson 1.3
├── Module 2
│   ├── Lesson 2.1
│   └── Lesson 2.2
└── Module 3
    └── ...
```

### Progress Calculation

**Lesson Progress:**
```typescript
progress = (watchedDuration / totalDuration) * 100
status = progress >= 90 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
```

**Course Progress:**
```typescript
completedLessons = count(lessonProgress where isCompleted = true)
totalLessons = count(lessons in course)
courseProgress = (completedLessons / totalLessons) * 100
```

### Certificate Generation

Automatically triggered when:
1. `courseProgress === 100%`
2. All required quizzes passed
3. Enrollment status = "completed"

---

## 🔌 API Endpoints

### Courses

#### Get All Courses
```http
GET /api/video/courses?category=grammar&level=beginner&search=business

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Business English Fundamentals",
      "slug": "business-english-fundamentals",
      "instructor": "John Doe",
      "level": "beginner",
      "category": "business",
      "thumbnailUrl": "https://...",
      "duration": 120,
      "lessonsCount": 15,
      "studentsCount": 1234,
      "rating": 4.8,
      "price": 49.99,
      "isPremium": true
    }
  ],
  "count": 25
}
```

#### Get Course Details
```http
GET /api/video/courses/{slug-or-id}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Business English Fundamentals",
    "description": "Master professional English...",
    "modules": [
      {
        "id": "uuid",
        "title": "Introduction to Business Vocabulary",
        "order": 1,
        "duration": 45,
        "lessons": [
          {
            "id": "uuid",
            "title": "Common Business Terms",
            "order": 1,
            "videoDuration": 600,
            "thumbnailUrl": "...",
            "isFree": true
          }
        ]
      }
    ],
    "reviews": [...]
  }
}
```

#### Create Course
```http
POST /api/video/courses
Authorization: Bearer {token}

{
  "title": "Business English Fundamentals",
  "description": "Master professional English communication...",
  "slug": "business-english-fundamentals",
  "instructor": "John Doe",
  "level": "beginner",
  "category": "business",
  "thumbnailUrl": "https://...",
  "trailerUrl": "https://...",
  "price": 49.99,
  "isPremium": true,
  "prerequisites": ["Basic English knowledge"],
  "learningObjectives": [
    "Master 500+ business vocabulary words",
    "Write professional emails",
    "Conduct business meetings"
  ]
}
```

#### Publish Course
```http
POST /api/video/courses/{courseId}/publish
Authorization: Bearer {token}
```

### Modules

#### Create Module
```http
POST /api/video/courses/{courseId}/modules
Authorization: Bearer {token}

{
  "title": "Introduction to Business Vocabulary",
  "description": "Learn essential business terms",
  "order": 1,
  "isLocked": false
}
```

### Lessons

#### Create Lesson
```http
POST /api/video/modules/{moduleId}/lessons
Authorization: Bearer {token}

{
  "title": "Common Business Terms",
  "description": "Learn 50 essential business vocabulary words",
  "order": 1,
  "videoUrl": "https://vimeo.com/123456789",
  "videoProvider": "vimeo",
  "videoDuration": 600,
  "thumbnailUrl": "https://...",
  "transcript": "Welcome to this lesson...",
  "subtitles": {
    "en": "https://.../en.vtt",
    "pt": "https://.../pt.vtt"
  },
  "attachments": [
    {
      "name": "Vocabulary List.pdf",
      "url": "https://...",
      "size": 245678,
      "type": "application/pdf"
    }
  ],
  "isFree": true,
  "isPreview": true,
  "allowDownload": false
}
```

#### Get Lesson
```http
GET /api/video/lessons/{lessonId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Common Business Terms",
    "videoUrl": "https://...",
    "videoDuration": 600,
    "transcript": "...",
    "subtitles": {...},
    "attachments": [...],
    "quizzes": [...],
    "userProgress": {
      "status": "in_progress",
      "progress": 45.5,
      "lastPosition": 273
    }
  }
}
```

### Enrollment

#### Enroll in Course
```http
POST /api/video/courses/{courseId}/enroll
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "...",
    "courseId": "...",
    "status": "active",
    "progress": 0,
    "enrolledAt": "2025-01-13T..."
  },
  "message": "Successfully enrolled in course"
}
```

#### Get My Enrollments
```http
GET /api/video/enrollments
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "active",
      "progress": 67.5,
      "lastAccessedAt": "2025-01-13T...",
      "course": {
        "id": "...",
        "title": "Business English Fundamentals",
        "thumbnailUrl": "...",
        "modules": [...]
      }
    }
  ]
}
```

### Progress

#### Update Lesson Progress
```http
POST /api/video/lessons/{lessonId}/progress
Authorization: Bearer {token}

{
  "watchedDuration": 450,
  "lastPosition": 450,
  "isCompleted": false
}

Response:
{
  "success": true,
  "data": {
    "status": "in_progress",
    "progress": 75.0,
    "watchedDuration": 450,
    "lastPosition": 450
  }
}
```

#### Get Course Progress
```http
GET /api/video/courses/{courseId}/progress
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "progress": 67.5,
    "totalLessons": 15,
    "completedLessons": 10,
    "status": "active",
    "lessonProgress": [...]
  }
}
```

### Notes

#### Create Note
```http
POST /api/video/lessons/{lessonId}/notes
Authorization: Bearer {token}

{
  "content": "Important: Remember to use 'leverage' in business context",
  "timestamp": 245,
  "isPrivate": true
}
```

#### Get Course Notes
```http
GET /api/video/courses/{courseId}/notes
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Important: Remember...",
      "timestamp": 245,
      "lesson": {
        "id": "...",
        "title": "Common Business Terms"
      },
      "createdAt": "2025-01-13T..."
    }
  ]
}
```

### Bookmarks

#### Create Bookmark
```http
POST /api/video/lessons/{lessonId}/bookmarks
Authorization: Bearer {token}

{
  "title": "Definition of 'synergy'",
  "timestamp": 325,
  "note": "Great explanation here"
}
```

### Quizzes

#### Create Quiz
```http
POST /api/video/lessons/{lessonId}/quizzes
Authorization: Bearer {token}

{
  "title": "Business Vocabulary Quiz",
  "description": "Test your knowledge of 20 business terms",
  "questions": [
    {
      "id": "q1",
      "question": "What does 'leverage' mean in business?",
      "type": "multiple_choice",
      "options": [
        "To use something to maximum advantage",
        "To lift heavy objects",
        "To negotiate contracts",
        "To manage employees"
      ],
      "correctAnswer": "To use something to maximum advantage",
      "explanation": "Leverage means using resources efficiently..."
    }
  ],
  "passingScore": 70,
  "maxAttempts": 3,
  "timeLimit": 10,
  "isRequired": true
}
```

#### Submit Quiz
```http
POST /api/video/quizzes/submit
Authorization: Bearer {token}

{
  "quizId": "uuid",
  "answers": [
    { "questionId": "q1", "answer": "To use something to maximum advantage" },
    { "questionId": "q2", "answer": "True" }
  ],
  "timeTaken": 285
}

Response:
{
  "success": true,
  "data": {
    "score": 85.0,
    "passed": true,
    "attemptNumber": 1,
    "answers": [
      { "questionId": "q1", "answer": "...", "isCorrect": true },
      { "questionId": "q2", "answer": "...", "isCorrect": false }
    ]
  },
  "message": "Congratulations! You passed!"
}
```

### Reviews

#### Create Review
```http
POST /api/video/courses/{courseId}/reviews
Authorization: Bearer {token}

{
  "rating": 5,
  "title": "Excellent course!",
  "comment": "The instructor explains everything clearly..."
}
```

### Certificates

#### Generate Certificate
```http
POST /api/video/courses/{courseId}/certificate
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "certificateNumber": "CERT-1705172400000-XYZ123",
    "verificationCode": "A3K9P2M7",
    "pdfUrl": "https://englishflow.com/certificates/CERT-...",
    "completionDate": "2025-01-13T..."
  },
  "message": "Certificate generated successfully!"
}
```

#### Verify Certificate
```http
GET /api/video/certificates/verify/{verificationCode}

Response:
{
  "success": true,
  "data": {
    "certificateNumber": "CERT-...",
    "studentName": "John Smith",
    "courseName": "Business English Fundamentals",
    "instructorName": "Jane Doe",
    "completionDate": "2025-01-13",
    "duration": 2,
    "finalScore": 92.5,
    "isVerified": true
  }
}
```

---

## 💻 Frontend Integration

### Video Player Component

```tsx
import { useState, useEffect, useRef } from 'react'
import api from '@/lib/api'

export function VideoPlayer({ lessonId, onProgress }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [lesson, setLesson] = useState(null)
  const [notes, setNotes] = useState([])
  const [bookmarks, setBookmarks] = useState([])

  useEffect(() => {
    loadLesson()
  }, [lessonId])

  async function loadLesson() {
    const res = await api.get(`/video/lessons/${lessonId}`)
    setLesson(res.data.data)

    // Resume from last position
    if (res.data.data.userProgress?.lastPosition) {
      videoRef.current.currentTime = res.data.data.userProgress.lastPosition
    }
  }

  async function handleTimeUpdate() {
    const currentTime = videoRef.current.currentTime
    const duration = videoRef.current.duration

    // Save progress every 10 seconds
    if (Math.floor(currentTime) % 10 === 0) {
      await api.post(`/video/lessons/${lessonId}/progress`, {
        watchedDuration: currentTime,
        lastPosition: currentTime,
      })

      onProgress?.((currentTime / duration) * 100)
    }
  }

  async function handleEnded() {
    await api.post(`/video/lessons/${lessonId}/progress`, {
      watchedDuration: lesson.videoDuration,
      isCompleted: true,
    })
  }

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={lesson?.videoUrl}
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="video-controls">
        <NotesPanel lessonId={lessonId} notes={notes} />
        <BookmarksPanel lessonId={lessonId} bookmarks={bookmarks} />
      </div>
    </div>
  )
}
```

---

## 🚀 Performance Optimizations

### Caching
- Cache course catalog (1 hour TTL)
- Cache lesson metadata
- Prefetch next lesson video

### Database Indexes
```prisma
@@index([slug])
@@index([category, level])
@@index([userId, courseId])
@@index([lessonId])
```

### Video Optimization
- Use adaptive bitrate streaming (HLS/DASH)
- CDN delivery for global reach
- Thumbnail sprites for seek preview

---

## 📊 Analytics Dashboard

Track:
- Most popular courses
- Average completion rates
- Student engagement (watch time, quiz scores)
- Revenue per course
- Instructor performance

---

## 🔐 Security

- ✅ Course ownership validation
- ✅ Enrollment verification before lesson access
- ✅ Premium content access control
- ✅ Quiz attempt limits
- ✅ Certificate authenticity verification

---

## 📝 Summary

**Day 47** delivers a **complete video lessons system** with:

- ✅ **873 lines** of service code
- ✅ **736 lines** of controller code
- ✅ **165 lines** of route definitions
- ✅ **13 database models**
- ✅ **40+ API endpoints**
- ✅ **Full LMS functionality**

**Total Implementation**: ~1,774+ lines of production-ready code. 🚀
