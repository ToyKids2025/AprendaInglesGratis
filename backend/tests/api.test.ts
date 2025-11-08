/**
 * API INTEGRATION TESTS
 * Sample tests for key endpoints
 */

import request from 'supertest'
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

const API_URL = process.env.API_URL || 'http://localhost:3001'

describe('API Integration Tests', () => {
  let authToken: string
  let userId: string

  describe('Authentication', () => {
    test('POST /api/auth/register - should create new user', async () => {
      const response = await request(API_URL)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          name: 'Test User',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()

      authToken = response.body.token
      userId = response.body.user.id
    })

    test('POST /api/auth/login - should authenticate user', async () => {
      const response = await request(API_URL)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.token).toBeDefined()
    })
  })

  describe('Phrases', () => {
    test('GET /api/phrases - should return phrases', async () => {
      const response = await request(API_URL)
        .get('/api/phrases')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.phrases)).toBe(true)
    })
  })

  describe('Progress', () => {
    test('GET /api/progress - should return user progress', async () => {
      const response = await request(API_URL)
        .get('/api/progress')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('Social', () => {
    test('GET /api/social/leaderboard - should return leaderboard', async () => {
      const response = await request(API_URL)
        .get('/api/social/leaderboard')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.leaderboard)).toBe(true)
    })
  })
})
