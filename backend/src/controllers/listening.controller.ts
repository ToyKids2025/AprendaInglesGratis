import { Request, Response } from 'express'
import * as service from '../services/listening.service'

export async function createExercise(req: Request, res: Response) {
  try {
    const exercise = await service.createExercise(req.body)
    res.json({ success: true, data: exercise })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getExercise(req: Request, res: Response) {
  try {
    const exercise = await service.getExercise(req.params.exerciseId)
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

export async function startExercise(req: Request, res: Response) {
  try {
    const attempt = await service.startExercise(req.user!.id, req.params.exerciseId)
    res.json({ success: true, data: attempt })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function submitAnswer(req: Request, res: Response) {
  try {
    const attempt = await service.submitAnswer(req.params.attemptId, req.body.questionId, req.body.answer)
    res.json({ success: true, data: attempt })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function completeExercise(req: Request, res: Response) {
  try {
    const attempt = await service.completeExercise(req.params.attemptId, req.user!.id)
    res.json({ success: true, data: attempt })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getProgress(req: Request, res: Response) {
  try {
    const progress = await service.getProgress(req.user!.id)
    res.json({ success: true, data: progress })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
