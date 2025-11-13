/**
 * LIVE CLASSES ROUTES
 * API endpoints for live classes and webinars
 */

import { Router } from 'express'
import {
  createLiveClass,
  getLiveClass,
  getUpcomingClasses,
  updateLiveClass,
  cancelLiveClass,
  deleteLiveClass,
  registerForClass,
  cancelRegistration,
  getUserRegistrations,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  leaveLiveClass,
  sendMessage,
  getMessages,
  deleteMessage,
  pinMessage,
  askQuestion,
  answerQuestion,
  getQuestions,
  upvoteQuestion,
  createPoll,
  votePoll,
  closePoll,
  createBreakoutRooms,
  assignToBreakoutRoom,
  closeBreakoutRooms,
  updateWhiteboard,
  getWhiteboard,
  saveRecording,
  createReview,
} from '../controllers/liveClass.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * PUBLIC ROUTES
 */

// Get upcoming classes
router.get('/classes/upcoming', getUpcomingClasses)

// Get class details (public classes)
router.get('/classes/:classId', getLiveClass)

/**
 * AUTHENTICATED ROUTES
 */
router.use(authenticateToken)

/**
 * CLASS MANAGEMENT
 */

// Create live class
router.post('/classes', createLiveClass)

// Update live class
router.patch('/classes/:classId', updateLiveClass)

// Cancel live class
router.post('/classes/:classId/cancel', cancelLiveClass)

// Delete live class
router.delete('/classes/:classId', deleteLiveClass)

/**
 * REGISTRATION
 */

// Register for class
router.post('/classes/:classId/register', registerForClass)

// Cancel registration
router.post('/classes/:classId/cancel-registration', cancelRegistration)

// Get my registrations
router.get('/registrations', getUserRegistrations)

/**
 * CLASS SESSION
 */

// Start class (instructor only)
router.post('/classes/:classId/start', startLiveClass)

// End class (instructor only)
router.post('/classes/:classId/end', endLiveClass)

// Join class
router.post('/classes/:classId/join', joinLiveClass)

// Leave class
router.post('/classes/:classId/leave', leaveLiveClass)

/**
 * CHAT & MESSAGING
 */

// Send message
router.post('/classes/:classId/messages', sendMessage)

// Get messages
router.get('/classes/:classId/messages', getMessages)

// Delete message
router.delete('/messages/:messageId', deleteMessage)

// Pin message (instructor only)
router.post('/messages/:messageId/pin', pinMessage)

/**
 * Q&A
 */

// Ask question
router.post('/classes/:classId/questions', askQuestion)

// Answer question (instructor only)
router.post('/questions/:questionId/answer', answerQuestion)

// Get questions
router.get('/classes/:classId/questions', getQuestions)

// Upvote question
router.post('/questions/:questionId/upvote', upvoteQuestion)

/**
 * POLLS
 */

// Create poll (instructor only)
router.post('/classes/:classId/polls', createPoll)

// Vote on poll
router.post('/polls/:pollId/vote', votePoll)

// Close poll (instructor only)
router.post('/polls/:pollId/close', closePoll)

/**
 * BREAKOUT ROOMS
 */

// Create breakout rooms (instructor only)
router.post('/classes/:classId/breakout-rooms', createBreakoutRooms)

// Assign to breakout room (instructor only)
router.post('/breakout-rooms/:roomId/assign', assignToBreakoutRoom)

// Close all breakout rooms (instructor only)
router.post('/classes/:classId/breakout-rooms/close', closeBreakoutRooms)

/**
 * WHITEBOARD
 */

// Update whiteboard
router.post('/classes/:classId/whiteboard', updateWhiteboard)

// Get whiteboard
router.get('/classes/:classId/whiteboard', getWhiteboard)

/**
 * RECORDINGS
 */

// Save recording (instructor only)
router.post('/classes/:classId/recording', saveRecording)

/**
 * REVIEWS
 */

// Create review
router.post('/classes/:classId/reviews', createReview)

export default router
