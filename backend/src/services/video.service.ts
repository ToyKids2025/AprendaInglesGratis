/**
 * VIDEO LESSONS SERVICE
 * Comprehensive video course management system
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * COURSE MANAGEMENT
 */

/**
 * Create new course
 */
export async function createCourse(data: {
  title: string
  description: string
  slug: string
  instructor: string
  level: string
  category: string
  language?: string
  thumbnailUrl?: string
  trailerUrl?: string
  price?: number
  isPremium?: boolean
  prerequisites?: string[]
  learningObjectives?: string[]
}) {
  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      slug: data.slug,
      instructor: data.instructor,
      level: data.level,
      category: data.category,
      language: data.language || 'en-US',
      thumbnailUrl: data.thumbnailUrl,
      trailerUrl: data.trailerUrl,
      price: data.price || 0,
      isPremium: data.isPremium || false,
      prerequisites: data.prerequisites || [],
      learningObjectives: data.learningObjectives || [],
    },
  })

  return course
}

/**
 * Get course by ID or slug
 */
export async function getCourse(identifier: string, includeUnpublished: boolean = false) {
  const where = identifier.includes('-')
    ? { slug: identifier }
    : { id: identifier }

  if (!includeUnpublished) {
    where.isPublished = true
  }

  const course = await prisma.course.findFirst({
    where,
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              order: true,
              videoDuration: true,
              thumbnailUrl: true,
              isFree: true,
              isPreview: true,
            },
          },
        },
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  return course
}

/**
 * Get all courses
 */
export async function getCourses(filters?: {
  category?: string
  level?: string
  isPremium?: boolean
  search?: string
}) {
  const where: any = {
    isPublished: true,
  }

  if (filters?.category) {
    where.category = filters.category
  }

  if (filters?.level) {
    where.level = filters.level
  }

  if (filters?.isPremium !== undefined) {
    where.isPremium = filters.isPremium
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { instructor: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      modules: {
        select: { id: true, title: true },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: [
      { studentsCount: 'desc' },
      { rating: 'desc' },
    ],
  })

  return courses
}

/**
 * Update course
 */
export async function updateCourse(courseId: string, updates: any) {
  return await prisma.course.update({
    where: { id: courseId },
    data: updates,
  })
}

/**
 * Publish course
 */
export async function publishCourse(courseId: string) {
  return await prisma.course.update({
    where: { id: courseId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
    },
  })
}

/**
 * Delete course
 */
export async function deleteCourse(courseId: string) {
  await prisma.course.delete({
    where: { id: courseId },
  })
  return { success: true }
}

/**
 * MODULE MANAGEMENT
 */

/**
 * Create module
 */
export async function createModule(courseId: string, data: {
  title: string
  description?: string
  order: number
  isLocked?: boolean
}) {
  const module = await prisma.courseModule.create({
    data: {
      courseId,
      title: data.title,
      description: data.description,
      order: data.order,
      isLocked: data.isLocked || false,
      duration: 0,
    },
  })

  return module
}

/**
 * Update module
 */
export async function updateModule(moduleId: string, updates: any) {
  return await prisma.courseModule.update({
    where: { id: moduleId },
    data: updates,
  })
}

/**
 * Delete module
 */
export async function deleteModule(moduleId: string) {
  await prisma.courseModule.delete({
    where: { id: moduleId },
  })
  return { success: true }
}

/**
 * LESSON MANAGEMENT
 */

/**
 * Create lesson
 */
export async function createLesson(moduleId: string, data: {
  title: string
  description?: string
  order: number
  videoUrl: string
  videoProvider?: string
  videoDuration: number
  thumbnailUrl?: string
  transcript?: string
  subtitles?: any
  attachments?: any[]
  isFree?: boolean
  isPreview?: boolean
  allowDownload?: boolean
}) {
  const module = await prisma.courseModule.findUnique({
    where: { id: moduleId },
  })

  if (!module) {
    throw new Error('Module not found')
  }

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      courseId: module.courseId,
      title: data.title,
      description: data.description,
      order: data.order,
      videoUrl: data.videoUrl,
      videoProvider: data.videoProvider || 'vimeo',
      videoDuration: data.videoDuration,
      thumbnailUrl: data.thumbnailUrl,
      transcript: data.transcript,
      subtitles: data.subtitles,
      attachments: data.attachments || [],
      isFree: data.isFree || false,
      isPreview: data.isPreview || false,
      allowDownload: data.allowDownload || false,
    },
  })

  // Update module duration
  await updateModuleDuration(moduleId)

  // Update course lessons count
  await updateCourseLessonsCount(module.courseId)

  return lesson
}

/**
 * Get lesson
 */
export async function getLesson(lessonId: string, userId?: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          courseId: true,
        },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
          passingScore: true,
          isRequired: true,
        },
      },
    },
  })

  if (!lesson) {
    throw new Error('Lesson not found')
  }

  // Track view
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { viewsCount: { increment: 1 } },
  })

  // Get user progress if userId provided
  let progress = null
  if (userId) {
    progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    })
  }

  return { ...lesson, userProgress: progress }
}

/**
 * Update lesson
 */
export async function updateLesson(lessonId: string, updates: any) {
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: updates,
  })

  // Update module duration if video duration changed
  if (updates.videoDuration !== undefined) {
    await updateModuleDuration(lesson.moduleId)
  }

  return lesson
}

/**
 * Delete lesson
 */
export async function deleteLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  })

  if (!lesson) {
    throw new Error('Lesson not found')
  }

  await prisma.lesson.delete({
    where: { id: lessonId },
  })

  await updateModuleDuration(lesson.moduleId)
  await updateCourseLessonsCount(lesson.courseId)

  return { success: true }
}

/**
 * ENROLLMENT MANAGEMENT
 */

/**
 * Enroll in course
 */
export async function enrollInCourse(userId: string, courseId: string) {
  // Check if already enrolled
  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  })

  if (existing) {
    return existing
  }

  // Check if course requires payment
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw new Error('Course not found')
  }

  if (course.price > 0) {
    // In production, verify payment here
    // For now, we'll allow enrollment
  }

  const enrollment = await prisma.courseEnrollment.create({
    data: {
      userId,
      courseId,
    },
  })

  // Increment students count
  await prisma.course.update({
    where: { id: courseId },
    data: { studentsCount: { increment: 1 } },
  })

  return enrollment
}

/**
 * Get user enrollments
 */
export async function getUserEnrollments(userId: string) {
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            select: { id: true, title: true },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: { lastAccessedAt: 'desc' },
  })

  return enrollments
}

/**
 * Check if user is enrolled
 */
export async function isEnrolled(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  })

  return !!enrollment
}

/**
 * PROGRESS TRACKING
 */

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  data: {
    watchedDuration?: number
    lastPosition?: number
    isCompleted?: boolean
  }
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  })

  if (!lesson) {
    throw new Error('Lesson not found')
  }

  // Calculate progress percentage
  const watchedDuration = data.watchedDuration || 0
  const progress = Math.min(100, (watchedDuration / lesson.videoDuration) * 100)

  // Determine status
  let status = 'not_started'
  if (data.isCompleted) {
    status = 'completed'
  } else if (progress > 0) {
    status = 'in_progress'
  }

  const lessonProgress = await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    update: {
      watchedDuration: data.watchedDuration,
      progress,
      status,
      lastPosition: data.lastPosition,
      isCompleted: data.isCompleted || false,
      completedAt: data.isCompleted ? new Date() : undefined,
      watchCount: { increment: 1 },
      updatedAt: new Date(),
    },
    create: {
      userId,
      lessonId,
      courseId: lesson.courseId,
      watchedDuration: data.watchedDuration || 0,
      totalDuration: lesson.videoDuration,
      progress,
      status,
      lastPosition: data.lastPosition || 0,
      isCompleted: data.isCompleted || false,
      completedAt: data.isCompleted ? new Date() : undefined,
      watchCount: 1,
    },
  })

  // If completed, increment lesson completions count
  if (data.isCompleted) {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { completionsCount: { increment: 1 } },
    })
  }

  // Update course enrollment progress
  await updateCourseProgress(userId, lesson.courseId)

  return lessonProgress
}

/**
 * Get lesson progress
 */
export async function getLessonProgress(userId: string, lessonId: string) {
  return await prisma.lessonProgress.findUnique({
    where: {
      userId_lessonId: { userId, lessonId },
    },
  })
}

/**
 * Get course progress
 */
export async function getCourseProgress(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  })

  if (!enrollment) {
    return null
  }

  const lessonProgress = await prisma.lessonProgress.findMany({
    where: { userId, courseId },
  })

  const totalLessons = await prisma.lesson.count({
    where: { courseId },
  })

  const completedLessons = lessonProgress.filter((p) => p.isCompleted).length

  return {
    ...enrollment,
    totalLessons,
    completedLessons,
    lessonProgress,
  }
}

/**
 * Update course enrollment progress
 */
async function updateCourseProgress(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  })

  if (!enrollment) return

  const totalLessons = await prisma.lesson.count({
    where: { courseId },
  })

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      courseId,
      isCompleted: true,
    },
  })

  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const isCompleted = progress === 100

  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: {
      progress,
      status: isCompleted ? 'completed' : 'active',
      completedAt: isCompleted ? new Date() : undefined,
      lastAccessedAt: new Date(),
    },
  })

  // Generate certificate if completed
  if (isCompleted && !enrollment.certificateUrl) {
    await generateCertificate(userId, courseId)
  }
}

/**
 * NOTES & BOOKMARKS
 */

/**
 * Create lesson note
 */
export async function createNote(
  userId: string,
  lessonId: string,
  data: {
    content: string
    timestamp?: number
    isPrivate?: boolean
  }
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  })

  if (!lesson) {
    throw new Error('Lesson not found')
  }

  return await prisma.lessonNote.create({
    data: {
      userId,
      lessonId,
      courseId: lesson.courseId,
      content: data.content,
      timestamp: data.timestamp,
      isPrivate: data.isPrivate !== false,
    },
  })
}

/**
 * Get lesson notes
 */
export async function getLessonNotes(userId: string, lessonId: string) {
  return await prisma.lessonNote.findMany({
    where: { userId, lessonId },
    orderBy: { timestamp: 'asc' },
  })
}

/**
 * Get course notes
 */
export async function getCourseNotes(userId: string, courseId: string) {
  return await prisma.lessonNote.findMany({
    where: { userId, courseId },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          moduleId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Update note
 */
export async function updateNote(noteId: string, userId: string, content: string) {
  return await prisma.lessonNote.update({
    where: { id: noteId, userId },
    data: { content },
  })
}

/**
 * Delete note
 */
export async function deleteNote(noteId: string, userId: string) {
  await prisma.lessonNote.delete({
    where: { id: noteId, userId },
  })
  return { success: true }
}

/**
 * Create bookmark
 */
export async function createBookmark(
  userId: string,
  lessonId: string,
  data: {
    title: string
    timestamp: number
    note?: string
  }
) {
  return await prisma.lessonBookmark.create({
    data: {
      userId,
      lessonId,
      title: data.title,
      timestamp: data.timestamp,
      note: data.note,
    },
  })
}

/**
 * Get lesson bookmarks
 */
export async function getLessonBookmarks(userId: string, lessonId: string) {
  return await prisma.lessonBookmark.findMany({
    where: { userId, lessonId },
    orderBy: { timestamp: 'asc' },
  })
}

/**
 * Delete bookmark
 */
export async function deleteBookmark(bookmarkId: string, userId: string) {
  await prisma.lessonBookmark.delete({
    where: { id: bookmarkId, userId },
  })
  return { success: true }
}

/**
 * QUIZ SYSTEM
 */

/**
 * Create quiz
 */
export async function createQuiz(lessonId: string, data: {
  title: string
  description?: string
  questions: any[]
  passingScore?: number
  maxAttempts?: number
  timeLimit?: number
  isRequired?: boolean
}) {
  return await prisma.lessonQuiz.create({
    data: {
      lessonId,
      title: data.title,
      description: data.description,
      questions: data.questions,
      passingScore: data.passingScore || 70,
      maxAttempts: data.maxAttempts,
      timeLimit: data.timeLimit,
      isRequired: data.isRequired || false,
    },
  })
}

/**
 * Get quiz
 */
export async function getQuiz(quizId: string) {
  return await prisma.lessonQuiz.findUnique({
    where: { id: quizId },
  })
}

/**
 * Submit quiz attempt
 */
export async function submitQuiz(
  userId: string,
  quizId: string,
  answers: any[],
  timeTaken?: number
) {
  const quiz = await prisma.lessonQuiz.findUnique({
    where: { id: quizId },
  })

  if (!quiz) {
    throw new Error('Quiz not found')
  }

  // Check attempts limit
  const previousAttempts = await prisma.quizAttempt.count({
    where: { userId, quizId },
  })

  if (quiz.maxAttempts && previousAttempts >= quiz.maxAttempts) {
    throw new Error('Maximum attempts reached')
  }

  // Calculate score
  const questions = quiz.questions as any[]
  let correctCount = 0

  const gradedAnswers = answers.map((answer, index) => {
    const question = questions[index]
    const isCorrect = answer.answer === question.correctAnswer

    if (isCorrect) correctCount++

    return {
      questionId: question.id || index,
      answer: answer.answer,
      isCorrect,
    }
  })

  const score = (correctCount / questions.length) * 100
  const passed = score >= quiz.passingScore

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      lessonId: quiz.lessonId,
      answers: gradedAnswers,
      score,
      passed,
      timeTaken,
      attemptNumber: previousAttempts + 1,
    },
  })

  // Update lesson progress with quiz score
  if (passed) {
    await prisma.lessonProgress.updateMany({
      where: {
        userId,
        lessonId: quiz.lessonId,
      },
      data: {
        quizScore: score,
      },
    })
  }

  return attempt
}

/**
 * Get quiz attempts
 */
export async function getQuizAttempts(userId: string, quizId: string) {
  return await prisma.quizAttempt.findMany({
    where: { userId, quizId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * REVIEWS
 */

/**
 * Create course review
 */
export async function createReview(
  userId: string,
  courseId: string,
  data: {
    rating: number
    title?: string
    comment?: string
  }
) {
  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  const review = await prisma.courseReview.create({
    data: {
      userId,
      courseId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
    },
  })

  // Update course rating
  await updateCourseRating(courseId)

  return review
}

/**
 * Update course rating (aggregate)
 */
async function updateCourseRating(courseId: string) {
  const reviews = await prisma.courseReview.findMany({
    where: { courseId, isApproved: true },
    select: { rating: true },
  })

  if (reviews.length === 0) return

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await prisma.course.update({
    where: { id: courseId },
    data: {
      rating: avgRating,
      reviewsCount: reviews.length,
    },
  })
}

/**
 * CERTIFICATES
 */

/**
 * Generate certificate
 */
export async function generateCertificate(userId: string, courseId: string) {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  })

  if (!enrollment || enrollment.status !== 'completed') {
    throw new Error('Course not completed')
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Generate unique certificate number
  const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
  const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase()

  const certificate = await prisma.certificate.create({
    data: {
      userId,
      courseId,
      certificateNumber,
      verificationCode,
      title: course.title,
      studentName: 'Student Name', // TODO: Get from user
      courseName: course.title,
      instructorName: course.instructor,
      duration: Math.round(course.duration / 60), // Convert minutes to hours
      finalScore: enrollment.finalScore,
      completionDate: enrollment.completedAt || new Date(),
    },
  })

  // Update enrollment with certificate URL
  const certificateUrl = `https://englishflow.com/certificates/${certificateNumber}`
  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: { certificateUrl },
  })

  return certificate
}

/**
 * Verify certificate
 */
export async function verifyCertificate(code: string) {
  return await prisma.certificate.findUnique({
    where: { verificationCode: code },
  })
}

/**
 * HELPER FUNCTIONS
 */

async function updateModuleDuration(moduleId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { moduleId },
    select: { videoDuration: true },
  })

  const totalDuration = lessons.reduce((sum, l) => sum + l.videoDuration, 0)

  await prisma.courseModule.update({
    where: { id: moduleId },
    data: { duration: Math.round(totalDuration / 60) }, // Convert to minutes
  })
}

async function updateCourseLessonsCount(courseId: string) {
  const count = await prisma.lesson.count({
    where: { courseId },
  })

  const modules = await prisma.courseModule.findMany({
    where: { courseId },
    select: { duration: true },
  })

  const totalDuration = modules.reduce((sum, m) => sum + m.duration, 0)

  await prisma.course.update({
    where: { id: courseId },
    data: {
      lessonsCount: count,
      duration: totalDuration,
    },
  })
}
