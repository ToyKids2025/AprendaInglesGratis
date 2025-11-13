import { Request, Response } from 'express'
import * as service from '../services/speaking.service'

export async function createExercise(req: Request, res: Response) {
  try {
    const exercise = await service.createExercise(req.body)
    res.json({ success: true, data: exercise })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getExercises(req: Request, res: Response) {
  try {
    const exercises = await service.getExercises(req.query)
    res.json({ success: true, data: exercises })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function saveRecording(req: Request, res: Response) {
  try {
    const recording = await service.saveRecording(req.user!.id, req.body.exerciseId, req.body.audioUrl, req.body.duration)
    res.json({ success: true, data: recording })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function analyzeRecording(req: Request, res: Response) {
  try {
    const recording = await service.analyzeRecording(req.params.recordingId)
    res.json({ success: true, data: recording })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getUserRecordings(req: Request, res: Response) {
  try {
    const recordings = await service.getUserRecordings(req.user!.id)
    res.json({ success: true, data: recordings })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function getPronunciationExercises(req: Request, res: Response) {
  try {
    const exercises = await service.getPronunciationExercises()
    res.json({ success: true, data: exercises })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function submitPronunciation(req: Request, res: Response) {
  try {
    const attempt = await service.submitPronunciation(req.user!.id, req.body.exerciseId, req.body.userAudioUrl)
    res.json({ success: true, data: attempt })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
