/**
 * USER ROUTES INTEGRATION TESTS
 * Tests for user-related API endpoints
 */

import request from 'supertest'
import { app } from '../../src/server'

describe('User API Integration Tests', () => {
  let authToken: string
  let userId: string

  beforeAll(async () => {
    // Register and login a test user
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
    })

    authToken = registerRes.body.token
    userId = registerRes.body.user.id
  })

  describe('GET /api/users/profile', () => {
    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('name', 'Test User')
      expect(res.body).toHaveProperty('email', 'test@example.com')
      expect(res.body).not.toHaveProperty('password')
    })

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/users/profile')

      expect(res.status).toBe(401)
    })

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
    })
  })

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('name', 'Updated Name')
    })

    it('should not update email to existing email', async () => {
      // Create another user
      await request(app).post('/api/auth/register').send({
        name: 'Other User',
        email: 'other@example.com',
        password: 'SecurePass123!',
      })

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'other@example.com',
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    it('should validate profile data', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
        })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/users/stats', () => {
    it('should return user statistics', async () => {
      const res = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('xp')
      expect(res.body).toHaveProperty('level')
      expect(res.body).toHaveProperty('streak')
      expect(res.body).toHaveProperty('phrasesCompleted')
      expect(res.body).toHaveProperty('lessonsCompleted')
    })

    it('should return detailed statistics with query param', async () => {
      const res = await request(app)
        .get('/api/users/stats?detailed=true')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('studyTime')
      expect(res.body).toHaveProperty('accuracy')
      expect(res.body).toHaveProperty('weakAreas')
    })
  })

  describe('POST /api/users/xp', () => {
    it('should award XP for completing action', async () => {
      const res = await request(app)
        .post('/api/users/xp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'lesson_complete',
          xpAmount: 50,
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('newXP')
      expect(res.body.newXP).toBeGreaterThanOrEqual(50)
    })

    it('should handle level up', async () => {
      // Award enough XP to level up
      const res = await request(app)
        .post('/api/users/xp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'bonus',
          xpAmount: 1000,
        })

      expect(res.status).toBe(200)
      if (res.body.leveledUp) {
        expect(res.body).toHaveProperty('newLevel')
        expect(res.body.newLevel).toBeGreaterThan(1)
      }
    })

    it('should validate XP amount', async () => {
      const res = await request(app)
        .post('/api/users/xp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'invalid',
          xpAmount: -10,
        })

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/users/leaderboard', () => {
    it('should return leaderboard', async () => {
      const res = await request(app).get('/api/users/leaderboard')

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeLessThanOrEqual(10)

      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('name')
        expect(res.body[0]).toHaveProperty('xp')
        expect(res.body[0]).toHaveProperty('level')
        expect(res.body[0]).not.toHaveProperty('email')
      }
    })

    it('should support leaderboard filters', async () => {
      const res = await request(app).get('/api/users/leaderboard?period=week')

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('should include current user rank', async () => {
      const res = await request(app)
        .get('/api/users/leaderboard?includeMe=true')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('leaderboard')
      expect(res.body).toHaveProperty('currentUser')
    })
  })

  describe('DELETE /api/users/account', () => {
    it('should delete user account with confirmation', async () => {
      // Create a user to delete
      const newUser = await request(app).post('/api/auth/register').send({
        name: 'Delete Me',
        email: 'delete@example.com',
        password: 'SecurePass123!',
      })

      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${newUser.body.token}`)
        .send({
          confirmation: 'DELETE MY ACCOUNT',
        })

      expect(res.status).toBe(200)

      // Verify user is deleted
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'delete@example.com',
        password: 'SecurePass123!',
      })

      expect(loginRes.status).toBe(401)
    })

    it('should not delete without confirmation', async () => {
      const res = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(res.status).toBe(400)
    })
  })

  describe('Rate Limiting', () => {
    it('should rate limit profile updates', async () => {
      // Make multiple requests quickly
      const requests = Array(20)
        .fill(null)
        .map(() =>
          request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Rate Limited' })
        )

      const responses = await Promise.all(requests)
      const rateLimited = responses.some((res) => res.status === 429)

      expect(rateLimited).toBe(true)
    })
  })

  describe('Data Validation', () => {
    it('should sanitize XSS attempts', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: '<script>alert("xss")</script>Hacker',
        })

      expect(res.status).toBe(200)
      expect(res.body.name).not.toContain('<script>')
    })

    it('should validate data types', async () => {
      const res = await request(app)
        .post('/api/users/xp')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 123, // Should be string
          xpAmount: 'invalid', // Should be number
        })

      expect(res.status).toBe(400)
    })
  })
})
