/**
 * VIDEO LESSONS CONTROLLER
 * Request handlers for video course endpoints
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as videoService from '../services/video.service'

/**
 * VALIDATION SCHEMAS
 */

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  instructor: z.string().min(1),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.string().min(1),
  language: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  price: z.number().min(0).optional(),
  isPremium: z.boolean().optional(),
  prerequisites: z.array(z.string()).optional(),
  learningObjectives: z.array(z.string()).optional(),
})

const createModuleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  order: z.number().min(0),
  isLocked: z.boolean().optional(),
})

const createLessonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  order: z.number().min(0),
  videoUrl: z.string().url(),
  videoProvider: z.enum(['vimeo', 'youtube', 'cloudflare']).optional(),
  videoDuration: z.number().min(1), // Seconds
  thumbnailUrl: z.string().url().optional(),
  transcript: z.string().optional(),
  subtitles: z.any().optional(),
  attachments: z.array(z.any()).optional(),
  isFree: z.boolean().optional(),
  isPreview: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
})

const updateProgressSchema = z.object({
  watchedDuration: z.number().min(0).optional(),
  lastPosition: z.number().min(0).optional(),
  isCompleted: z.boolean().optional(),
})

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  timestamp: z.number().min(0).optional(),
  isPrivate: z.boolean().optional(),
})

const createBookmarkSchema = z.object({
  title: z.string().min(1).max(200),
  timestamp: z.number().min(0),
  note: z.string().max(500).optional(),
})

const createQuizSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  questions: z.array(z.any()).min(1),
  passingScore: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().min(1).optional(),
  timeLimit: z.number().min(1).optional(),
  isRequired: z.boolean().optional(),
})

const submitQuizSchema = z.object({
  quizId: z.string().uuid(),
  answers: z.array(z.any()).min(1),
  timeTaken: z.number().min(0).optional(),
})

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
})

/**
 * COURSE ENDPOINTS
 */

export async function createCourse(req: Request, res: Response) {
  try {
    const data = createCourseSchema.parse(req.body)
    const course = await videoService.createCourse(data)

    res.json({
      success: true,
      data: course,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getCourse(req: Request, res: Response) {
  try {
    const { identifier } = req.params
    const includeUnpublished = req.query.includeUnpublished === 'true'

    const course = await videoService.getCourse(identifier, includeUnpublished)

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      })
    }

    res.json({
      success: true,
      data: course,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getCourses(req: Request, res: Response) {
  try {
    const filters = {
      category: req.query.category as string,
      level: req.query.level as string,
      isPremium: req.query.isPremium === 'true' ? true : req.query.isPremium === 'false' ? false : undefined,
      search: req.query.search as string,
    }

    const courses = await videoService.getCourses(filters)

    res.json({
      success: true,
      data: courses,
      count: courses.length,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function updateCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params
    const updates = createCourseSchema.partial().parse(req.body)

    const course = await videoService.updateCourse(courseId, updates)

    res.json({
      success: true,
      data: course,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function publishCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params

    const course = await videoService.publishCourse(courseId)

    res.json({
      success: true,
      data: course,
      message: 'Course published successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const { courseId } = req.params

    await videoService.deleteCourse(courseId)

    res.json({
      success: true,
      message: 'Course deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * MODULE ENDPOINTS
 */

export async function createModule(req: Request, res: Response) {
  try {
    const { courseId } = req.params
    const data = createModuleSchema.parse(req.body)

    const module = await videoService.createModule(courseId, data)

    res.json({
      success: true,
      data: module,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function updateModule(req: Request, res: Response) {
  try {
    const { moduleId } = req.params
    const updates = createModuleSchema.partial().parse(req.body)

    const module = await videoService.updateModule(moduleId, updates)

    res.json({
      success: true,
      data: module,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteModule(req: Request, res: Response) {
  try {
    const { moduleId } = req.params

    await videoService.deleteModule(moduleId)

    res.json({
      success: true,
      message: 'Module deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * LESSON ENDPOINTS
 */

export async function createLesson(req: Request, res: Response) {
  try {
    const { moduleId } = req.params
    const data = createLessonSchema.parse(req.body)

    const lesson = await videoService.createLesson(moduleId, data)

    res.json({
      success: true,
      data: lesson,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getLesson(req: Request, res: Response) {
  try {
    const { lessonId } = req.params
    const userId = req.user?.id

    const lesson = await videoService.getLesson(lessonId, userId)

    res.json({
      success: true,
      data: lesson,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function updateLesson(req: Request, res: Response) {
  try {
    const { lessonId } = req.params
    const updates = createLessonSchema.partial().parse(req.body)

    const lesson = await videoService.updateLesson(lessonId, updates)

    res.json({
      success: true,
      data: lesson,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteLesson(req: Request, res: Response) {
  try {
    const { lessonId } = req.params

    await videoService.deleteLesson(lessonId)

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * ENROLLMENT ENDPOINTS
 */

export async function enrollInCourse(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { courseId } = req.params

    const enrollment = await videoService.enrollInCourse(userId, courseId)

    res.json({
      success: true,
      data: enrollment,
      message: 'Successfully enrolled in course',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getUserEnrollments(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const enrollments = await videoService.getUserEnrollments(userId)

    res.json({
      success: true,
      data: enrollments,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * PROGRESS ENDPOINTS
 */

export async function updateLessonProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { lessonId } = req.params
    const data = updateProgressSchema.parse(req.body)

    const progress = await videoService.updateLessonProgress(userId, lessonId, data)

    res.json({
      success: true,
      data: progress,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getLessonProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { lessonId } = req.params

    const progress = await videoService.getLessonProgress(userId, lessonId)

    res.json({
      success: true,
      data: progress,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getCourseProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { courseId } = req.params

    const progress = await videoService.getCourseProgress(userId, courseId)

    res.json({
      success: true,
      data: progress,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * NOTES ENDPOINTS
 */

export async function createNote(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { lessonId } = req.params
    const data = createNoteSchema.parse(req.body)

    const note = await videoService.createNote(userId, lessonId, data)

    res.json({
      success: true,
      data: note,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getLessonNotes(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { lessonId } = req.params

    const notes = await videoService.getLessonNotes(userId, lessonId)

    res.json({
      success: true,
      data: notes,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getCourseNotes(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { courseId } = req.params

    const notes = await videoService.getCourseNotes(userId, courseId)

    res.json({
      success: true,
      data: notes,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function updateNote(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { noteId } = req.params
    const { content } = createNoteSchema.parse(req.body)

    const note = await videoService.updateNote(noteId, userId, content)

    res.json({
      success: true,
      data: note,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteNote(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { noteId } = req.params

    await videoService.deleteNote(noteId, userId)

    res.json({
      success: true,
      message: 'Note deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * BOOKMARKS ENDPOINTS
 */

export async function createBookmark(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { lessonId } = req.params
    const data = createBookmarkSchema.parse(req.body)

    const bookmark = await videoService.createBookmark(userId, lessonId, data)

    res.json({
      success: true,
      data: bookmark,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getLessonBookmarks(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { lessonId } = req.params

    const bookmarks = await videoService.getLessonBookmarks(userId, lessonId)

    res.json({
      success: true,
      data: bookmarks,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteBookmark(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { bookmarkId } = req.params

    await videoService.deleteBookmark(bookmarkId, userId)

    res.json({
      success: true,
      message: 'Bookmark deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * QUIZ ENDPOINTS
 */

export async function createQuiz(req: Request, res: Response) {
  try {
    const { lessonId } = req.params
    const data = createQuizSchema.parse(req.body)

    const quiz = await videoService.createQuiz(lessonId, data)

    res.json({
      success: true,
      data: quiz,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getQuiz(req: Request, res: Response) {
  try {
    const { quizId } = req.params

    const quiz = await videoService.getQuiz(quizId)

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
      })
    }

    res.json({
      success: true,
      data: quiz,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function submitQuiz(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = submitQuizSchema.parse(req.body)

    const attempt = await videoService.submitQuiz(
      userId,
      data.quizId,
      data.answers,
      data.timeTaken
    )

    res.json({
      success: true,
      data: attempt,
      message: attempt.passed ? 'Congratulations! You passed!' : 'Try again!',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getQuizAttempts(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { quizId } = req.params

    const attempts = await videoService.getQuizAttempts(userId, quizId)

    res.json({
      success: true,
      data: attempts,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * REVIEW ENDPOINTS
 */

export async function createReview(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { courseId } = req.params
    const data = createReviewSchema.parse(req.body)

    const review = await videoService.createReview(userId, courseId, data)

    res.json({
      success: true,
      data: review,
      message: 'Thank you for your review!',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * CERTIFICATE ENDPOINTS
 */

export async function generateCertificate(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { courseId } = req.params

    const certificate = await videoService.generateCertificate(userId, courseId)

    res.json({
      success: true,
      data: certificate,
      message: 'Certificate generated successfully!',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function verifyCertificate(req: Request, res: Response) {
  try {
    const { code } = req.params

    const certificate = await videoService.verifyCertificate(code)

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
      })
    }

    res.json({
      success: true,
      data: certificate,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
