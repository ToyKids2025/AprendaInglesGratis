/**
 * VIDEO LESSONS ROUTES
 * API endpoints for video course system
 */

import { Router } from 'express'
import {
  createCourse,
  getCourse,
  getCourses,
  updateCourse,
  publishCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  enrollInCourse,
  getUserEnrollments,
  updateLessonProgress,
  getLessonProgress,
  getCourseProgress,
  createNote,
  getLessonNotes,
  getCourseNotes,
  updateNote,
  deleteNote,
  createBookmark,
  getLessonBookmarks,
  deleteBookmark,
  createQuiz,
  getQuiz,
  submitQuiz,
  getQuizAttempts,
  createReview,
  generateCertificate,
  verifyCertificate,
} from '../controllers/video.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * PUBLIC ROUTES (no authentication required)
 */

// Get all published courses
router.get('/courses', getCourses)

// Get course details
router.get('/courses/:identifier', getCourse)

// Verify certificate
router.get('/certificates/verify/:code', verifyCertificate)

/**
 * AUTHENTICATED ROUTES
 */
router.use(authenticateToken)

/**
 * COURSE MANAGEMENT
 */

// Create course
router.post('/courses', createCourse)

// Update course
router.patch('/courses/:courseId', updateCourse)

// Publish course
router.post('/courses/:courseId/publish', publishCourse)

// Delete course
router.delete('/courses/:courseId', deleteCourse)

/**
 * MODULE MANAGEMENT
 */

// Create module in course
router.post('/courses/:courseId/modules', createModule)

// Update module
router.patch('/modules/:moduleId', updateModule)

// Delete module
router.delete('/modules/:moduleId', deleteModule)

/**
 * LESSON MANAGEMENT
 */

// Create lesson in module
router.post('/modules/:moduleId/lessons', createLesson)

// Get lesson details
router.get('/lessons/:lessonId', getLesson)

// Update lesson
router.patch('/lessons/:lessonId', updateLesson)

// Delete lesson
router.delete('/lessons/:lessonId', deleteLesson)

/**
 * ENROLLMENT
 */

// Enroll in course
router.post('/courses/:courseId/enroll', enrollInCourse)

// Get user's enrollments
router.get('/enrollments', getUserEnrollments)

/**
 * PROGRESS TRACKING
 */

// Update lesson progress
router.post('/lessons/:lessonId/progress', updateLessonProgress)

// Get lesson progress
router.get('/lessons/:lessonId/progress', getLessonProgress)

// Get course progress
router.get('/courses/:courseId/progress', getCourseProgress)

/**
 * NOTES
 */

// Create note for lesson
router.post('/lessons/:lessonId/notes', createNote)

// Get lesson notes
router.get('/lessons/:lessonId/notes', getLessonNotes)

// Get all course notes
router.get('/courses/:courseId/notes', getCourseNotes)

// Update note
router.patch('/notes/:noteId', updateNote)

// Delete note
router.delete('/notes/:noteId', deleteNote)

/**
 * BOOKMARKS
 */

// Create bookmark
router.post('/lessons/:lessonId/bookmarks', createBookmark)

// Get lesson bookmarks
router.get('/lessons/:lessonId/bookmarks', getLessonBookmarks)

// Delete bookmark
router.delete('/bookmarks/:bookmarkId', deleteBookmark)

/**
 * QUIZZES
 */

// Create quiz for lesson
router.post('/lessons/:lessonId/quizzes', createQuiz)

// Get quiz
router.get('/quizzes/:quizId', getQuiz)

// Submit quiz attempt
router.post('/quizzes/submit', submitQuiz)

// Get quiz attempts
router.get('/quizzes/:quizId/attempts', getQuizAttempts)

/**
 * REVIEWS
 */

// Create course review
router.post('/courses/:courseId/reviews', createReview)

/**
 * CERTIFICATES
 */

// Generate certificate for completed course
router.post('/courses/:courseId/certificate', generateCertificate)

export default router
