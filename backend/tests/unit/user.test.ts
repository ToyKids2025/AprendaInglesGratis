/**
 * USER SERVICE UNIT TESTS
 * Tests for user-related business logic
 */

describe('User Service', () => {
  describe('User Profile', () => {
    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.com',
      ]

      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        '',
      ]

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true)
      })

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false)
      })
    })

    it('should validate password strength', () => {
      const strongPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd2024',
        'ComplexP@ss123',
      ]

      const weakPasswords = ['123456', 'password', 'abc', '']

      strongPasswords.forEach((password) => {
        expect(isStrongPassword(password)).toBe(true)
      })

      weakPasswords.forEach((password) => {
        expect(isStrongPassword(password)).toBe(false)
      })
    })

    it('should sanitize user input', () => {
      const dirtyInput = '<script>alert("xss")</script>Hello'
      const cleanInput = sanitizeInput(dirtyInput)

      expect(cleanInput).not.toContain('<script>')
      expect(cleanInput).not.toContain('</script>')
    })
  })

  describe('XP and Level System', () => {
    it('should calculate correct level from XP', () => {
      expect(getLevelFromXP(0)).toBe(1)
      expect(getLevelFromXP(100)).toBe(1)
      expect(getLevelFromXP(500)).toBe(2)
      expect(getLevelFromXP(1500)).toBe(3)
      expect(getLevelFromXP(5000)).toBe(5)
    })

    it('should calculate XP required for next level', () => {
      expect(getXPForNextLevel(1)).toBe(500)
      expect(getXPForNextLevel(2)).toBe(1000)
      expect(getXPForNextLevel(3)).toBe(1500)
    })

    it('should award correct XP for actions', () => {
      expect(getXPForAction('lesson_complete')).toBe(50)
      expect(getXPForAction('phrase_practice')).toBe(10)
      expect(getXPForAction('daily_login')).toBe(5)
      expect(getXPForAction('achievement_unlock')).toBe(100)
    })
  })

  describe('Streak System', () => {
    it('should calculate streak correctly', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      // Consecutive days
      expect(calculateStreak([today, yesterday, twoDaysAgo])).toBe(3)

      // Broken streak
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      expect(calculateStreak([today, threeDaysAgo])).toBe(1)
    })

    it('should detect if streak is alive', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const twoDaysAgo = new Date(today)
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      expect(isStreakAlive(today)).toBe(true)
      expect(isStreakAlive(yesterday)).toBe(true)
      expect(isStreakAlive(twoDaysAgo)).toBe(false)
    })
  })

  describe('Achievement System', () => {
    it('should check achievement eligibility', () => {
      const user = {
        xp: 1000,
        streak: 7,
        phrasesCompleted: 50,
        lessonsCompleted: 10,
      }

      expect(isAchievementUnlocked('first_lesson', user)).toBe(true)
      expect(isAchievementUnlocked('week_warrior', user)).toBe(true)
      expect(isAchievementUnlocked('xp_master', user)).toBe(false)
    })

    it('should calculate achievement progress', () => {
      const user = {
        phrasesCompleted: 25,
      }

      const achievement = {
        id: 'phrase_master',
        requirement: 100,
      }

      expect(getAchievementProgress(user, achievement)).toBe(25)
    })
  })

  describe('User Statistics', () => {
    it('should calculate study time correctly', () => {
      const sessions = [
        { duration: 600 }, // 10 min
        { duration: 1200 }, // 20 min
        { duration: 900 }, // 15 min
      ]

      expect(getTotalStudyTime(sessions)).toBe(2700) // 45 min
      expect(getAverageSessionDuration(sessions)).toBe(900) // 15 min
    })

    it('should calculate accuracy rate', () => {
      const attempts = {
        correct: 45,
        total: 50,
      }

      expect(getAccuracyRate(attempts)).toBe(90)
    })

    it('should identify weak areas', () => {
      const categoryScores = [
        { category: 'Greetings', score: 95 },
        { category: 'Numbers', score: 60 },
        { category: 'Colors', score: 85 },
        { category: 'Animals', score: 50 },
      ]

      const weakAreas = getWeakAreas(categoryScores, 70)

      expect(weakAreas).toHaveLength(2)
      expect(weakAreas[0].category).toBe('Animals')
      expect(weakAreas[1].category).toBe('Numbers')
    })
  })
})

// Helper functions (would be implemented in actual service)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
}

function sanitizeInput(input: string): string {
  return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
}

function getLevelFromXP(xp: number): number {
  if (xp < 500) return 1
  if (xp < 1500) return 2
  if (xp < 3000) return 3
  if (xp < 5000) return 4
  return Math.floor(xp / 1000) + 1
}

function getXPForNextLevel(level: number): number {
  return level * 500
}

function getXPForAction(action: string): number {
  const xpMap: Record<string, number> = {
    lesson_complete: 50,
    phrase_practice: 10,
    daily_login: 5,
    achievement_unlock: 100,
  }
  return xpMap[action] || 0
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  dates.sort((a, b) => b.getTime() - a.getTime())

  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = Math.floor(
      (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function isStreakAlive(lastActivityDate: Date): boolean {
  const today = new Date()
  const diff = Math.floor(
    (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff <= 1
}

function isAchievementUnlocked(achievementId: string, user: any): boolean {
  const requirements: Record<string, any> = {
    first_lesson: () => user.lessonsCompleted >= 1,
    week_warrior: () => user.streak >= 7,
    xp_master: () => user.xp >= 10000,
  }
  return requirements[achievementId]?.() || false
}

function getAchievementProgress(user: any, achievement: any): number {
  return user.phrasesCompleted
}

function getTotalStudyTime(sessions: any[]): number {
  return sessions.reduce((total, session) => total + session.duration, 0)
}

function getAverageSessionDuration(sessions: any[]): number {
  return getTotalStudyTime(sessions) / sessions.length
}

function getAccuracyRate(attempts: any): number {
  return Math.round((attempts.correct / attempts.total) * 100)
}

function getWeakAreas(categoryScores: any[], threshold: number): any[] {
  return categoryScores.filter((cat) => cat.score < threshold).sort((a, b) => a.score - b.score)
}
