/**
 * VOICE RECOGNITION CONTROLLER
 * Speech-to-text and pronunciation analysis endpoints
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as voiceRecognitionService from '../services/voiceRecognition.service'
import multer from 'multer'

// Configure multer for audio file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/wav',
      'audio/mpeg',
      'audio/mp4',
      'audio/ogg',
    ]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'))
    }
  },
})

export const uploadAudioMiddleware = upload.single('audio')

// Validation schemas
const analyzePronunciationSchema = z.object({
  phraseId: z.string().uuid(),
  transcribedText: z.string().min(1),
  expectedText: z.string().min(1),
  audioDuration: z.number().min(0).optional(),
  studySessionId: z.string().uuid().optional(),
})

const updateSettingsSchema = z.object({
  language: z.string().optional(),
  dialect: z.string().optional(),
  strictMode: z.boolean().optional(),
  minScore: z.number().min(0).max(100).optional(),
  noiseReduction: z.boolean().optional(),
  autoGainControl: z.boolean().optional(),
  echoCancellation: z.boolean().optional(),
  enableHints: z.boolean().optional(),
  showPhonetics: z.boolean().optional(),
  playbackSpeed: z.number().min(0.5).max(2.0).optional(),
})

/**
 * POST /api/voice/analyze
 * Analyze pronunciation from transcript or audio
 */
export async function analyzePronunciation(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = analyzePronunciationSchema.parse(req.body)

    // Get audio buffer if uploaded
    const audioBuffer = (req as any).file?.buffer
    const audioFormat = (req as any).file?.mimetype.split('/')[1]

    const result = await voiceRecognitionService.analyzePronunciation({
      userId,
      ...validatedData,
      audioBuffer,
      audioFormat,
    })

    res.json({
      success: true,
      result,
    })
  } catch (error: any) {
    console.error('Failed to analyze pronunciation:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/voice/history
 * Get pronunciation attempt history
 */
export async function getHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { phraseId, limit } = req.query

    const history = await voiceRecognitionService.getPronunciationHistory(
      userId,
      phraseId as string | undefined,
      limit ? parseInt(limit as string) : 20
    )

    res.json({
      success: true,
      history,
    })
  } catch (error: any) {
    console.error('Failed to get history:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/voice/statistics
 * Get voice practice statistics
 */
export async function getStatistics(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const statistics = await voiceRecognitionService.getVoiceStatistics(userId)

    res.json({
      success: true,
      statistics,
    })
  } catch (error: any) {
    console.error('Failed to get statistics:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * PUT /api/voice/settings
 * Update voice recognition settings
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = updateSettingsSchema.parse(req.body)

    const settings = await voiceRecognitionService.updateVoiceSettings(
      userId,
      validatedData
    )

    res.json({
      success: true,
      settings,
    })
  } catch (error: any) {
    console.error('Failed to update settings:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  analyzePronunciation,
  getHistory,
  getStatistics,
  updateSettings,
  uploadAudioMiddleware,
}
