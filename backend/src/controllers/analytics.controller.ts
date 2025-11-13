/**
 * ANALYTICS CONTROLLER
 */
import { Request, Response } from 'express'
import * as analyticsService from '../services/analytics.service'

export async function getUserAnalytics(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const analytics = await analyticsService.getUserAnalytics(userId)
    res.json({ success: true, data: analytics })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function getDashboard(req: Request, res: Response) {
  try {
    const stats = await analyticsService.getDashboardStats()
    res.json({ success: true, data: stats })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}
