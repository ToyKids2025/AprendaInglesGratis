/**
 * AI SERVICE - OpenAI Integration
 *
 * Centraliza todas as chamadas para OpenAI API
 * Usado para: geração de frases, conversação, correção de pronúncia
 */

import OpenAI from 'openai'

class AIService {
  private openai: OpenAI
  private isConfigured: boolean = false

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey || apiKey === 'sk-test' || apiKey === 'sk-your-openai-api-key-here') {
      console.warn('⚠️  OpenAI API key not configured. AI features will be disabled.')
      this.isConfigured = false
      // Create dummy client to prevent crashes
      this.openai = new OpenAI({ apiKey: 'sk-test' })
    } else {
      this.openai = new OpenAI({ apiKey })
      this.isConfigured = true
      console.log('✅ OpenAI API configured successfully')
    }
  }

  /**
   * Verifica se a API está configurada
   */
  isReady(): boolean {
    return this.isConfigured
  }

  /**
   * Gera frases em inglês para uma categoria específica
   */
  async generatePhrases(
    category: string,
    level: number,
    difficulty: string,
    count: number = 50
  ): Promise<Array<{
    en: string
    pt: string
    tip: string
    difficulty: number
  }>> {
    if (!this.isConfigured) {
      throw new Error('OpenAI API not configured. Please add OPENAI_API_KEY to .env')
    }

    const prompt = `
You are an expert English teacher. Generate exactly ${count} practical English phrases for the category "${category}" at ${difficulty} level.

Requirements:
1. Each phrase should be PRACTICAL and USEFUL in real-life situations
2. Include British and American English variations when relevant
3. Focus on conversational English, not formal/academic
4. Provide context-appropriate usage tips in Portuguese

Return a JSON array with this exact structure:
{
  "phrases": [
    {
      "en": "English phrase here",
      "pt": "Tradução em português aqui",
      "tip": "Dica de uso em português - quando/onde usar",
      "difficulty": ${level}
    }
  ]
}

Category: ${category}
Level: ${level} (1=beginner, 8=expert)
Difficulty: ${difficulty}

IMPORTANT: Return ONLY valid JSON, no additional text.
`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a professional English teacher specializing in practical, conversational English for Brazilian Portuguese speakers. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0].message.content
      if (!content) throw new Error('Empty response from OpenAI')

      const data = JSON.parse(content)
      const phrases = data.phrases || []

      console.log(`✅ Generated ${phrases.length} phrases for ${category}`)
      return phrases
    } catch (error) {
      console.error(`❌ Error generating phrases:`, error)
      throw error
    }
  }

  /**
   * Cria uma conversa de IA para prática
   */
  async createConversation(
    scenario: string,
    difficulty: number,
    userMessage: string
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('OpenAI API not configured')
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an English conversation partner helping a Brazilian student practice English.
Scenario: ${scenario}
Difficulty level: ${difficulty}/8
Be encouraging, correct mistakes gently, and keep the conversation flowing naturally.`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.9,
        max_tokens: 200,
      })

      return response.choices[0].message.content || 'Sorry, I could not generate a response.'
    } catch (error) {
      console.error('Error in conversation:', error)
      throw error
    }
  }

  /**
   * Avalia a pronúncia e gramática de uma frase
   */
  async evaluateUserInput(
    originalPhrase: string,
    userInput: string,
    difficulty: number
  ): Promise<{
    score: number
    feedback: string
    corrections: string[]
  }> {
    if (!this.isConfigured) {
      throw new Error('OpenAI API not configured')
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an English teacher evaluating a student's attempt.
Difficulty level: ${difficulty}/8
Return JSON with: score (0-100), feedback (in Portuguese), corrections (array of strings)`,
          },
          {
            role: 'user',
            content: `Original phrase: "${originalPhrase}"
Student's attempt: "${userInput}"

Evaluate the student's attempt and provide constructive feedback.`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0].message.content
      if (!content) throw new Error('Empty response')

      const data = JSON.parse(content)
      return {
        score: data.score || 0,
        feedback: data.feedback || 'Good attempt!',
        corrections: data.corrections || [],
      }
    } catch (error) {
      console.error('Error evaluating input:', error)
      throw error
    }
  }
}

// Export singleton instance
export const aiService = new AIService()
