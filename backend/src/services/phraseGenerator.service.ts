/**
 * PHRASE GENERATOR SERVICE
 * Uses OpenAI to generate English phrases for learning
 */

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface GeneratePhraseParams {
  category: string
  level: string // beginner, intermediate, advanced, etc.
  difficulty: number // 1-5
  count: number // number of phrases to generate
  context?: string // additional context/theme
}

export interface GeneratedPhrase {
  en: string
  pt: string
  tip?: string
  difficulty: number
  context?: string
}

/**
 * Generate phrases using OpenAI GPT-4
 */
export async function generatePhrases(
  params: GeneratePhraseParams
): Promise<GeneratedPhrase[]> {
  const { category, level, difficulty, count, context } = params

  const prompt = `You are an expert English teacher creating learning materials for Brazilian Portuguese speakers.

Generate ${count} English phrases for the following criteria:
- Category: ${category}
- Level: ${level}
- Difficulty: ${difficulty}/5
${context ? `- Context/Theme: ${context}` : ''}

Requirements:
1. Phrases should be practical and commonly used in real-life situations
2. Appropriate for ${level} level students
3. Include variety (questions, statements, common expressions)
4. Provide accurate Portuguese translations
5. Add helpful learning tips when relevant (pronunciation, grammar notes, cultural context)

Return a JSON array with this exact structure:
[
  {
    "en": "English phrase here",
    "pt": "Tradução em português aqui",
    "tip": "Optional learning tip in Portuguese",
    "difficulty": ${difficulty}
  }
]

Make sure the JSON is valid and properly formatted. Only return the JSON array, nothing else.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert English teacher for Brazilian Portuguese speakers. You create high-quality learning materials.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Some creativity, but not too random
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    const parsed = JSON.parse(content)

    // Handle different response structures
    let phrases: GeneratedPhrase[] = []

    if (Array.isArray(parsed)) {
      phrases = parsed
    } else if (parsed.phrases && Array.isArray(parsed.phrases)) {
      phrases = parsed.phrases
    } else if (parsed.data && Array.isArray(parsed.data)) {
      phrases = parsed.data
    } else {
      throw new Error('Unexpected response format from OpenAI')
    }

    return phrases.map((phrase) => ({
      en: phrase.en,
      pt: phrase.pt,
      tip: phrase.tip || undefined,
      difficulty: phrase.difficulty || difficulty,
      context: context,
    }))
  } catch (error: any) {
    console.error('Error generating phrases:', error)
    throw new Error(`Failed to generate phrases: ${error.message}`)
  }
}

/**
 * Generate phrases for a specific scenario/conversation
 */
export async function generateScenarioPhrases(
  scenario: string,
  level: string,
  count: number = 20
): Promise<GeneratedPhrase[]> {
  const prompt = `You are an expert English teacher creating learning materials for Brazilian Portuguese speakers.

Create ${count} phrases for this scenario: "${scenario}"

The phrases should:
1. Be appropriate for ${level} level students
2. Cover different aspects of the scenario
3. Include questions, answers, and statements
4. Be practical and useful in real conversations
5. Have accurate Portuguese translations
6. Include pronunciation or cultural tips where helpful

Return a JSON array with this exact structure:
[
  {
    "en": "English phrase here",
    "pt": "Tradução em português aqui",
    "tip": "Optional learning tip in Portuguese",
    "difficulty": 1-5
  }
]

Only return the JSON array, nothing else.`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert English teacher for Brazilian Portuguese speakers.',
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

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)

    let phrases: GeneratedPhrase[] = []

    if (Array.isArray(parsed)) {
      phrases = parsed
    } else if (parsed.phrases && Array.isArray(parsed.phrases)) {
      phrases = parsed.phrases
    } else if (parsed.data && Array.isArray(parsed.data)) {
      phrases = parsed.data
    }

    return phrases
  } catch (error: any) {
    console.error('Error generating scenario phrases:', error)
    throw new Error(`Failed to generate phrases: ${error.message}`)
  }
}

/**
 * Validate and enhance a user-provided phrase
 */
export async function enhancePhrase(
  en: string,
  pt?: string
): Promise<GeneratedPhrase> {
  const prompt = pt
    ? `Check and enhance this English-Portuguese phrase pair:

English: "${en}"
Portuguese: "${pt}"

1. Verify the translation is accurate and natural
2. Suggest improvements if needed
3. Add a helpful learning tip (pronunciation, grammar, or cultural note)
4. Rate the difficulty (1-5)

Return a JSON object with this structure:
{
  "en": "corrected English phrase",
  "pt": "corrected Portuguese phrase",
  "tip": "learning tip in Portuguese",
  "difficulty": 1-5,
  "corrections": "explanation of any corrections made"
}`
    : `Translate this English phrase to Portuguese and add learning information:

English: "${en}"

Provide:
1. Accurate Portuguese translation
2. A helpful learning tip
3. Difficulty rating (1-5)

Return a JSON object with this structure:
{
  "en": "${en}",
  "pt": "Portuguese translation",
  "tip": "learning tip in Portuguese",
  "difficulty": 1-5
}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert English teacher for Brazilian Portuguese speakers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more accurate translations
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(content)

    return {
      en: parsed.en,
      pt: parsed.pt,
      tip: parsed.tip,
      difficulty: parsed.difficulty,
    }
  } catch (error: any) {
    console.error('Error enhancing phrase:', error)
    throw new Error(`Failed to enhance phrase: ${error.message}`)
  }
}

export default {
  generatePhrases,
  generateScenarioPhrases,
  enhancePhrase,
}
