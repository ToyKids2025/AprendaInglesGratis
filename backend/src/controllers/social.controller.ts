import { Request, Response } from 'express'
import * as socialService from '../services/social.service'

export async function connectAccount(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { provider, token } = req.body
    const account = await socialService.connectAccount(userId, provider, token)
    res.json({ success: true, data: account })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function shareAchievement(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { achievementId, platforms } = req.body
    const share = await socialService.shareAchievement(userId, achievementId, platforms)
    res.json({ success: true, data: share })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getShares(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const shares = await socialService.getUserShares(userId)
    res.json({ success: true, data: shares })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
