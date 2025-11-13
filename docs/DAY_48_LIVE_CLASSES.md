# DAY 48 - LIVE CLASSES & WEBINARS SYSTEM

## 📚 Overview

The Live Classes & Webinars System enables real-time interactive learning sessions with comprehensive features including live chat, Q&A, polls, breakout rooms, whiteboard, and recordings. Instructors can host engaging classes while students participate in real-time with full interaction capabilities.

### Key Features

- ✅ **Live Video Sessions** - Host classes with up to 1000 participants
- ✅ **Real-time Chat** - Interactive messaging with reactions and replies
- ✅ **Q&A System** - Raise hands, ask questions, upvote, get answers
- ✅ **Live Polls** - Instant polls with real-time results
- ✅ **Breakout Rooms** - Split participants into small groups
- ✅ **Interactive Whiteboard** - Collaborative drawing and annotations
- ✅ **Screen Sharing** - Share presentations and materials
- ✅ **Recordings** - Auto-record and playback later
- ✅ **Waiting Room** - Moderate entry with admission control
- ✅ **Attendance Tracking** - Detailed participation analytics
- ✅ **Multi-platform Support** - Internal, Zoom, or Google Meet integration

---

## 🎯 Use Cases

### For Instructors
- Host live English classes with up to 1000 students
- Share slides and screen during lessons
- Use whiteboard to explain grammar concepts
- Create polls to gauge understanding
- Split students into breakout rooms for practice
- Answer questions in organized Q&A
- Record sessions for students who missed
- Track attendance and participation

### For Students
- Join live classes from any device
- Ask questions via Q&A
- Participate in polls and quizzes
- Chat with classmates
- Practice in breakout rooms
- Take notes during session
- Review recordings later
- Provide feedback via reviews

### For Platform Admins
- Monitor live class quality
- View attendance statistics
- Manage recordings storage
- Moderate content if needed

---

## 🏗️ Architecture

### Database Models (15 Core Tables)

#### 1. LiveClass
Main live class/webinar entity.

```prisma
model LiveClass {
  id            String   @id
  title         String
  description   String
  type          String   // "class", "webinar", "workshop", "group_session"

  instructorId  String
  coInstructorIds String[] // Additional instructors

  // Schedule
  scheduledAt   DateTime
  duration      Int      // Minutes
  timezone      String
  status        String   // "scheduled", "live", "ended", "cancelled"

  // Meeting
  meetingUrl    String?
  meetingId     String   @unique
  meetingPassword String?
  platform      String   // "internal", "zoom", "google_meet"

  // Capacity
  maxParticipants Int
  isPublic      Boolean
  requiresEnrollment Boolean
  price         Float
  isPremium     Boolean

  // Features
  allowChat     Boolean
  allowQuestions Boolean
  enableRecording Boolean
  enableWhiteboard Boolean
  enableBreakoutRooms Boolean

  // Recording
  recordingUrl  String?
  recordingDuration Int?

  // Analytics
  totalAttendees Int
  peakAttendance Int
  avgAttendance  Int
  totalMessages  Int
  totalQuestions Int
}
```

#### 2. LiveClassRegistration
User registrations for classes.

```prisma
model LiveClassRegistration {
  id           String   @id
  userId       String
  classId      String

  status       String   // "registered", "attended", "cancelled", "no_show"
  attended     Boolean
  attendedAt   DateTime?

  paymentId    String?
  paidAmount   Float?
  reminderSent Boolean

  @@unique([userId, classId])
}
```

#### 3. LiveClassAttendance
Detailed session tracking per participant.

```prisma
model LiveClassAttendance {
  id          String   @id
  userId      String
  classId     String

  sessionId   String   @unique
  joinedAt    DateTime
  leftAt      DateTime?
  duration    Int      // Seconds

  // Participation metrics
  messagesCount   Int
  reactionsCount  Int
  handRaisedCount Int

  // Quality metrics
  avgLatency      Int?
  disconnections  Int

  device    String?
  browser   String?
  os        String?
}
```

#### 4. LiveClassMessage
Real-time chat messages.

```prisma
model LiveClassMessage {
  id        String   @id
  classId   String
  userId    String
  userName  String

  content   String
  type      String   // "text", "emoji", "file", "system"

  isDeleted Boolean
  isPinned  Boolean
  isHighlighted Boolean

  reactions Json     // { "👍": 5, "❤️": 3 }
  replyToId String?

  timestamp DateTime
}
```

#### 5. LiveClassQuestion
Q&A system for structured questions.

```prisma
model LiveClassQuestion {
  id          String   @id
  classId     String
  userId      String
  userName    String

  question    String
  status      String   // "pending", "answered", "dismissed"

  answer      String?
  answeredBy  String?  // Instructor ID
  answeredAt  DateTime?

  upvotes     Int
  isHighlighted Boolean
}
```

#### 6. LiveClassPoll
Interactive live polls.

```prisma
model LiveClassPoll {
  id          String   @id
  classId     String

  question    String
  options     Json[]   // [{ id, text, votes: 0 }]
  type        String   // "single", "multiple"

  isActive    Boolean
  isAnonymous Boolean

  totalVotes  Int
  results     Json     // { optionId: count }

  closedAt    DateTime?
}
```

#### 7. BreakoutRoom
Small group sessions within main class.

```prisma
model BreakoutRoom {
  id          String   @id
  classId     String

  name        String
  roomNumber  Int
  topic       String?

  participantIds String[]
  maxParticipants Int

  isActive    Boolean
  duration    Int?     // Minutes
  startedAt   DateTime?
  endedAt     DateTime?
}
```

#### 8. WhiteboardData
Collaborative whiteboard state.

```prisma
model WhiteboardData {
  id          String   @id
  classId     String

  pageNumber  Int
  elements    Json[]   // Drawing elements
  snapshot    Json?

  updatedBy   String
  updatedAt   DateTime

  @@unique([classId, pageNumber])
}
```

#### 9. WaitingRoom
Admission control before joining.

```prisma
model WaitingRoom {
  id        String   @id
  classId   String

  userId    String
  userName  String
  userEmail String?

  status    String   // "waiting", "admitted", "denied"
  admittedAt DateTime?
  admittedBy String?

  joinedAt  DateTime

  @@unique([classId, userId])
}
```

#### 10. ClassRecording
Recorded sessions for replay.

```prisma
model ClassRecording {
  id          String   @id
  classId     String

  title       String
  recordingUrl String
  duration    Int
  fileSize    Int?

  status      String   // "processing", "ready", "failed"
  processedAt DateTime?

  isPublic    Boolean
  viewsCount  Int
}
```

---

## 🔄 Live Class Lifecycle

### 1. Scheduled → Live → Ended

```
┌─────────────┐      ┌──────────┐      ┌────────┐
│  SCHEDULED  │─────>│   LIVE   │─────>│ ENDED  │
└─────────────┘      └──────────┘      └────────┘
       │                                      │
       │                                      v
       └─────────────>[ CANCELLED ]     [Recording]
```

### 2. Session Flow

**Before Class:**
1. Instructor creates class
2. Students register
3. Reminders sent 24h, 1h, 5min before

**During Class:**
1. Instructor starts session → status = "live"
2. Students join → waiting room (if enabled)
3. Instructor admits students
4. Live interaction: chat, Q&A, polls, whiteboard
5. Breakout rooms (optional)
6. Recording happens automatically

**After Class:**
1. Instructor ends session → status = "ended"
2. Recording processed
3. Attendance calculated
4. Students can review

---

## 🔌 API Endpoints

### Class Management

#### Create Live Class
```http
POST /api/live/classes
Authorization: Bearer {token}

{
  "title": "Business English: Email Writing",
  "description": "Learn professional email communication...",
  "type": "class",
  "scheduledAt": "2025-01-20T15:00:00Z",
  "duration": 60,
  "timezone": "America/New_York",
  "maxParticipants": 50,
  "isPublic": true,
  "requiresEnrollment": true,
  "price": 0,
  "level": "intermediate",
  "category": "business",
  "allowChat": true,
  "allowQuestions": true,
  "enableRecording": true,
  "enableWhiteboard": true,
  "enableBreakoutRooms": true,
  "platform": "internal"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Business English: Email Writing",
    "meetingId": "A3K9P2M7XY",
    "meetingPassword": "abc123",
    "meetingUrl": "https://englishflow.com/live/A3K9P2M7XY",
    "scheduledAt": "2025-01-20T15:00:00Z",
    "status": "scheduled"
  }
}
```

#### Get Upcoming Classes
```http
GET /api/live/classes/upcoming?category=business&level=intermediate

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Business English: Email Writing",
      "scheduledAt": "2025-01-20T15:00:00Z",
      "duration": 60,
      "instructorId": "...",
      "maxParticipants": 50,
      "currentRegistrations": 32,
      "price": 0,
      "level": "intermediate"
    }
  ],
  "count": 15
}
```

#### Cancel Class
```http
POST /api/live/classes/{classId}/cancel
Authorization: Bearer {token}

{
  "reason": "Instructor is unavailable"
}
```

### Registration

#### Register for Class
```http
POST /api/live/classes/{classId}/register
Authorization: Bearer {token}

{
  "paymentId": "pi_abc123"  // If paid class
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "...",
    "classId": "...",
    "status": "registered",
    "registeredAt": "2025-01-13T..."
  },
  "message": "Successfully registered for class"
}
```

#### Get My Registrations
```http
GET /api/live/registrations
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "registered",
      "attended": false,
      "class": {
        "id": "...",
        "title": "Business English: Email Writing",
        "scheduledAt": "2025-01-20T15:00:00Z",
        "meetingUrl": "https://..."
      }
    }
  ]
}
```

### Session Control

#### Start Class (Instructor Only)
```http
POST /api/live/classes/{classId}/start
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "live",
    "startedAt": "2025-01-20T15:00:12Z"
  },
  "message": "Class started successfully"
}
```

#### Join Class
```http
POST /api/live/classes/{classId}/join
Authorization: Bearer {token}

{
  "device": {
    "type": "desktop",
    "browser": "Chrome",
    "os": "Windows 10"
  }
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "session_xyz",
    "joinedAt": "2025-01-20T15:01:00Z"
  },
  "message": "Joined class successfully"
}
```

#### End Class (Instructor Only)
```http
POST /api/live/classes/{classId}/end
Authorization: Bearer {token}
```

### Chat & Messaging

#### Send Message
```http
POST /api/live/classes/{classId}/messages
Authorization: Bearer {token}

{
  "content": "Great explanation!",
  "type": "text"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "...",
    "userName": "John Doe",
    "content": "Great explanation!",
    "timestamp": "2025-01-20T15:05:30Z"
  }
}
```

#### Get Messages
```http
GET /api/live/classes/{classId}/messages?limit=100&before=2025-01-20T15:30:00Z

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "...",
      "userName": "John Doe",
      "content": "Great explanation!",
      "reactions": { "👍": 5, "❤️": 2 },
      "timestamp": "2025-01-20T15:05:30Z"
    }
  ]
}
```

#### Pin Message (Instructor)
```http
POST /api/live/messages/{messageId}/pin
Authorization: Bearer {token}
```

### Q&A

#### Ask Question
```http
POST /api/live/classes/{classId}/questions
Authorization: Bearer {token}

{
  "question": "What's the difference between 'affect' and 'effect'?"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "What's the difference between 'affect' and 'effect'?",
    "status": "pending",
    "upvotes": 0,
    "createdAt": "2025-01-20T15:10:00Z"
  }
}
```

#### Answer Question (Instructor)
```http
POST /api/live/questions/{questionId}/answer
Authorization: Bearer {token}

{
  "answer": "'Affect' is usually a verb (to influence), while 'effect' is usually a noun (the result)."
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "What's the difference...",
    "answer": "'Affect' is usually a verb...",
    "status": "answered",
    "answeredAt": "2025-01-20T15:11:30Z"
  }
}
```

#### Upvote Question
```http
POST /api/live/questions/{questionId}/upvote
Authorization: Bearer {token}
```

#### Get Questions
```http
GET /api/live/classes/{classId}/questions?status=pending

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "question": "What's the difference...",
      "status": "pending",
      "upvotes": 5,
      "createdAt": "2025-01-20T15:10:00Z"
    }
  ]
}
```

### Polls

#### Create Poll (Instructor)
```http
POST /api/live/classes/{classId}/polls
Authorization: Bearer {token}

{
  "question": "Which topic should we cover next?",
  "options": [
    "Business emails",
    "Phone conversations",
    "Presentation skills",
    "Negotiation tactics"
  ],
  "type": "single",
  "isAnonymous": false
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "question": "Which topic should we cover next?",
    "options": [
      { "id": "opt_0", "text": "Business emails", "votes": 0 },
      { "id": "opt_1", "text": "Phone conversations", "votes": 0 },
      { "id": "opt_2", "text": "Presentation skills", "votes": 0 },
      { "id": "opt_3", "text": "Negotiation tactics", "votes": 0 }
    ],
    "isActive": true
  }
}
```

#### Vote on Poll
```http
POST /api/live/polls/{pollId}/vote
Authorization: Bearer {token}

{
  "optionIds": ["opt_2"]
}

Response:
{
  "success": true,
  "data": {
    "totalVotes": 32,
    "results": {
      "opt_0": 5,
      "opt_1": 8,
      "opt_2": 15,
      "opt_3": 4
    }
  },
  "message": "Vote recorded"
}
```

#### Close Poll (Instructor)
```http
POST /api/live/polls/{pollId}/close
Authorization: Bearer {token}
```

### Breakout Rooms

#### Create Breakout Rooms (Instructor)
```http
POST /api/live/classes/{classId}/breakout-rooms
Authorization: Bearer {token}

{
  "count": 5,
  "duration": 10
}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Room 1",
      "roomNumber": 1,
      "maxParticipants": 10
    },
    // ... 4 more rooms
  ],
  "message": "5 breakout rooms created"
}
```

#### Assign to Breakout Room (Instructor)
```http
POST /api/live/breakout-rooms/{roomId}/assign
Authorization: Bearer {token}

{
  "userIds": ["user1", "user2", "user3"]
}
```

#### Close Breakout Rooms (Instructor)
```http
POST /api/live/classes/{classId}/breakout-rooms/close
Authorization: Bearer {token}
```

### Whiteboard

#### Update Whiteboard
```http
POST /api/live/classes/{classId}/whiteboard
Authorization: Bearer {token}

{
  "pageNumber": 1,
  "elements": [
    {
      "type": "line",
      "x": 100,
      "y": 200,
      "x2": 300,
      "y2": 400,
      "color": "#000000",
      "width": 3
    },
    {
      "type": "text",
      "x": 150,
      "y": 250,
      "text": "Subject + Verb + Object",
      "fontSize": 24,
      "color": "#FF0000"
    }
  ]
}
```

#### Get Whiteboard
```http
GET /api/live/classes/{classId}/whiteboard?pageNumber=1

Response:
{
  "success": true,
  "data": {
    "classId": "...",
    "pageNumber": 1,
    "elements": [...],
    "updatedBy": "instructorId",
    "updatedAt": "2025-01-20T15:20:00Z"
  }
}
```

### Recordings

#### Save Recording (Instructor)
```http
POST /api/live/classes/{classId}/recording
Authorization: Bearer {token}

{
  "title": "Business English: Email Writing - Jan 20, 2025",
  "recordingUrl": "https://storage.englishflow.com/recordings/xyz.mp4",
  "duration": 3600,
  "fileSize": 245678912,
  "isPublic": false
}
```

### Reviews

#### Create Review
```http
POST /api/live/classes/{classId}/reviews
Authorization: Bearer {token}

{
  "rating": 5,
  "comment": "Excellent class! Very interactive and helpful.",
  "contentQuality": 5,
  "instructorRating": 5,
  "technicalQuality": 4
}
```

---

## 💻 Frontend Integration

### WebRTC Integration
```typescript
// components/LiveClassRoom.tsx
import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import api from '@/lib/api'

export function LiveClassRoom({ classId }) {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    // Join class
    const joinClass = async () => {
      await api.post(`/live/classes/${classId}/join`)

      // Connect WebSocket
      const ws = io('wss://englishflow.com', {
        auth: { token: localStorage.getItem('token') }
      })

      ws.emit('join_class', { classId })

      // Listen for events
      ws.on('new_message', (msg) => {
        setMessages((prev) => [...prev, msg])
      })

      ws.on('new_question', (q) => {
        setQuestions((prev) => [...prev, q])
      })

      setSocket(ws)
    }

    joinClass()

    return () => {
      socket?.disconnect()
    }
  }, [classId])

  const sendMessage = async (content) => {
    await api.post(`/live/classes/${classId}/messages`, { content })
  }

  return (
    <div className="live-class-room">
      <VideoPlayer />
      <ChatPanel messages={messages} onSend={sendMessage} />
      <QAPanel questions={questions} />
    </div>
  )
}
```

---

## 📊 Analytics

### Attendance Tracking
- Join/leave timestamps
- Total duration per participant
- Engagement metrics (messages, questions, reactions)
- Technical quality (latency, disconnections)

### Class Metrics
- Total attendees
- Peak concurrent attendance
- Average attendance
- Chat activity (total messages)
- Q&A activity (total questions, answer rate)
- Poll participation rate
- Breakout room usage

---

## 🚀 Performance Optimizations

### Real-time Scaling
- Socket.IO with Redis adapter for horizontal scaling
- WebRTC SFU (Selective Forwarding Unit) for video
- Message rate limiting (10 messages/minute per user)

### Database Optimization
```prisma
@@index([scheduledAt])
@@index([instructorId])
@@index([status])
@@index([classId, timestamp])
```

### CDN & Storage
- Recordings stored in S3/CloudFlare R2
- CDN delivery for playback
- Transcoding to multiple qualities

---

## 🔐 Security

- ✅ Waiting room for moderation
- ✅ Instructor-only controls (start/end, breakout rooms, polls)
- ✅ Message deletion by instructor
- ✅ Rate limiting on chat and Q&A
- ✅ Recording encryption at rest
- ✅ Meeting password protection

---

## 📝 Summary

**Day 48** delivers a **complete live classes system** with:

- ✅ **920 lines** of service code
- ✅ **741 lines** of controller code
- ✅ **173 lines** of route definitions
- ✅ **15 database models**
- ✅ **45+ API endpoints**
- ✅ **Full real-time interaction**

**Total Implementation**: ~1,834+ lines of production-ready code. 🎥
