/**
 * BULK PHRASE GENERATION SCRIPT
 * Generate hundreds of phrases using OpenAI GPT-4
 *
 * Usage: tsx scripts/generate-bulk-phrases.ts
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()

// OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// Categories to generate phrases for (Level 2 - Intermediate)
const newCategories = [
  {
    name: 'Public Transportation',
    slug: 'transportation',
    icon: '🚌',
    description: 'Ônibus, metrô e transporte público',
    order: 1,
    levelNumber: 2,
    phraseCount: 25,
    difficulty: 2,
    context: 'Taking buses, trains, and subways in English-speaking countries',
  },
  {
    name: 'At the Bank',
    slug: 'bank',
    icon: '🏦',
    description: 'Serviços bancários',
    order: 2,
    levelNumber: 2,
    phraseCount: 25,
    difficulty: 2,
    context: 'Opening accounts, exchanging money, using ATMs',
  },
  {
    name: 'Making Phone Calls',
    slug: 'phone',
    icon: '📞',
    description: 'Ligações telefônicas',
    order: 3,
    levelNumber: 2,
    phraseCount: 25,
    difficulty: 2,
    context: 'Making and receiving phone calls, voicemail',
  },
  {
    name: 'At the Doctor',
    slug: 'doctor',
    icon: '👨‍⚕️',
    description: 'Consultas médicas',
    order: 4,
    levelNumber: 2,
    phraseCount: 30,
    difficulty: 3,
    context: 'Describing symptoms, medical appointments, prescriptions',
  },
  {
    name: 'Renting an Apartment',
    slug: 'apartment',
    icon: '🏠',
    description: 'Aluguel de apartamento',
    order: 5,
    levelNumber: 2,
    phraseCount: 25,
    difficulty: 3,
    context: 'Looking for apartments, signing leases, talking to landlords',
  },
  {
    name: 'Job Interview',
    slug: 'job-interview',
    icon: '💼',
    description: 'Entrevista de emprego',
    order: 6,
    levelNumber: 2,
    phraseCount: 30,
    difficulty: 4,
    context: 'Common interview questions and answers, professional introductions',
  },
  {
    name: 'Small Talk & Socializing',
    slug: 'smalltalk',
    icon: '☕',
    description: 'Conversas casuais',
    order: 7,
    levelNumber: 2,
    phraseCount: 30,
    difficulty: 2,
    context: 'Weather, hobbies, weekend plans, casual conversations with colleagues',
  },
  {
    name: 'At the Gym',
    slug: 'gym',
    icon: '🏋️',
    description: 'Academia e exercícios',
    order: 8,
    levelNumber: 2,
    phraseCount: 20,
    difficulty: 2,
    context: 'Gym membership, equipment, workout routines',
  },
  {
    name: 'Technology & Internet',
    slug: 'technology',
    icon: '💻',
    description: 'Tecnologia e internet',
    order: 9,
    levelNumber: 2,
    phraseCount: 25,
    difficulty: 2,
    context: 'WiFi issues, computer problems, tech support',
  },
  {
    name: 'Weather & Nature',
    slug: 'weather',
    icon: '🌤️',
    description: 'Clima e natureza',
    order: 10,
    levelNumber: 2,
    phraseCount: 20,
    difficulty: 1,
    context: 'Describing weather, seasons, outdoor activities',
  },
]

// Additional phrases for existing Level 1 categories
const expandLevel1 = [
  {
    slug: 'greetings',
    additionalPhrases: 15,
    difficulty: 1,
    context: 'More greetings for different situations and times of day',
  },
  {
    slug: 'restaurant',
    additionalPhrases: 20,
    difficulty: 2,
    context: 'Advanced restaurant vocabulary including dietary restrictions and complaints',
  },
  {
    slug: 'airport',
    additionalPhrases: 20,
    difficulty: 2,
    context: 'More airport situations including delays, connections, and lost items',
  },
  {
    slug: 'hotel',
    additionalPhrases: 15,
    difficulty: 2,
    context: 'Hotel complaints, room service, amenities',
  },
  {
    slug: 'shopping',
    additionalPhrases: 20,
    difficulty: 2,
    context: 'Returns, exchanges, different types of stores',
  },
]

async function generatePhrasesForCategory(
  categoryName: string,
  categoryContext: string,
  difficulty: number,
  count: number
): Promise<{ en: string; pt: string; tip?: string; difficulty: number }[]> {
  if (!openai) {
    console.warn('⚠️  OpenAI API key not found. Skipping AI generation.')
    return []
  }

  const prompt = `You are an expert English teacher creating learning materials for Brazilian Portuguese speakers.

Generate ${count} English phrases for the following category:
- Category: ${categoryName}
- Context: ${categoryContext}
- Difficulty: ${difficulty}/5

Requirements:
1. Phrases should be practical and commonly used in real-life situations
2. Appropriate for ${difficulty === 1 ? 'beginner' : difficulty <= 3 ? 'intermediate' : 'advanced'} level students
3. Include variety (questions, statements, common expressions)
4. Provide accurate Portuguese translations
5. Add helpful learning tips when relevant (not required for every phrase)
6. Make phrases progressively more complex within the set

Return a JSON object with a "phrases" array containing objects with this structure:
{
  "phrases": [
    {
      "en": "English phrase here",
      "pt": "Tradução em português aqui",
      "tip": "Optional learning tip in Portuguese",
      "difficulty": ${difficulty}
    }
  ]
}`

  try {
    console.log(`  🤖 Generating ${count} phrases for "${categoryName}"...`)

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert English teacher for Brazilian Portuguese speakers. Generate practical, useful phrases.',
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
      throw new Error('No content received from OpenAI')
    }

    const parsed = JSON.parse(content)
    const phrases = parsed.phrases || []

    console.log(`  ✅ Generated ${phrases.length} phrases`)

    return phrases.map((phrase: any) => ({
      en: phrase.en,
      pt: phrase.pt,
      tip: phrase.tip || undefined,
      difficulty: phrase.difficulty || difficulty,
    }))
  } catch (error) {
    console.error(`  ❌ Error generating phrases for "${categoryName}":`, error)
    return []
  }
}

async function createNewCategories() {
  console.log('\n📁 Creating new Level 2 categories...')

  const level2 = await prisma.level.findFirst({
    where: { number: 2 },
  })

  if (!level2) {
    console.error('Level 2 not found. Run seed first.')
    return []
  }

  const createdCategories = []

  for (const catData of newCategories) {
    // Check if exists
    const existing = await prisma.category.findUnique({
      where: { slug: catData.slug },
    })

    if (existing) {
      console.log(`  ⏭️  Category "${catData.name}" already exists`)
      createdCategories.push(existing)
      continue
    }

    const category = await prisma.category.create({
      data: {
        name: catData.name,
        slug: catData.slug,
        icon: catData.icon,
        description: catData.description,
        order: catData.order,
        levelId: level2.id,
      },
    })

    console.log(`  ✅ Created category: ${category.name}`)
    createdCategories.push(category)
  }

  return createdCategories
}

async function generateAndSavePhrases() {
  console.log('\n🎯 Starting bulk phrase generation...\n')

  let totalGenerated = 0
  let totalSaved = 0

  // Create new categories
  const categories = await createNewCategories()

  // Generate phrases for new categories
  console.log('\n📝 Generating phrases for new categories...')

  for (const catData of newCategories) {
    const category = categories.find((c) => c.slug === catData.slug)
    if (!category) continue

    const phrases = await generatePhrasesForCategory(
      catData.name,
      catData.context,
      catData.difficulty,
      catData.phraseCount
    )

    totalGenerated += phrases.length

    // Save phrases
    if (phrases.length > 0) {
      for (let i = 0; i < phrases.length; i++) {
        await prisma.phrase.create({
          data: {
            categoryId: category.id,
            en: phrases[i].en,
            pt: phrases[i].pt,
            tip: phrases[i].tip,
            difficulty: phrases[i].difficulty,
            order: i + 1,
          },
        })
        totalSaved++
      }

      console.log(`  💾 Saved ${phrases.length} phrases for "${category.name}"`)
    }

    // Rate limiting: wait 2 seconds between categories to avoid OpenAI rate limits
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  // Expand Level 1 categories
  console.log('\n📝 Expanding Level 1 categories...')

  for (const expansion of expandLevel1) {
    const category = await prisma.category.findUnique({
      where: { slug: expansion.slug },
    })

    if (!category) {
      console.log(`  ⏭️  Category "${expansion.slug}" not found`)
      continue
    }

    // Get current phrase count
    const currentCount = await prisma.phrase.count({
      where: { categoryId: category.id },
    })

    const phrases = await generatePhrasesForCategory(
      category.name,
      expansion.context,
      expansion.difficulty,
      expansion.additionalPhrases
    )

    totalGenerated += phrases.length

    // Save phrases
    if (phrases.length > 0) {
      for (let i = 0; i < phrases.length; i++) {
        await prisma.phrase.create({
          data: {
            categoryId: category.id,
            en: phrases[i].en,
            pt: phrases[i].pt,
            tip: phrases[i].tip,
            difficulty: phrases[i].difficulty,
            order: currentCount + i + 1,
          },
        })
        totalSaved++
      }

      console.log(`  💾 Added ${phrases.length} phrases to "${category.name}"`)
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log('\n✨ Phrase generation complete!')
  console.log(`📊 Total generated: ${totalGenerated}`)
  console.log(`💾 Total saved: ${totalSaved}`)

  return {
    totalGenerated,
    totalSaved,
  }
}

async function main() {
  try {
    console.log('🚀 English Flow - Bulk Phrase Generator\n')

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not found in environment variables')
      console.log('Set it in your .env file to use AI phrase generation')
      process.exit(1)
    }

    await generateAndSavePhrases()

    console.log('\n🎉 All done!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
