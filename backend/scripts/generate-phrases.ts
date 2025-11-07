/**
 * GERADOR AUTOMATIZADO DE FRASES
 *
 * Este script usa IA para gerar frases em inglês em escala
 * Meta: Criar 10.000 frases em 90 dias
 * Média: 111 frases/dia
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test',
})

// ============================================
// DEFINIÇÃO DOS 8 NÍVEIS
// ============================================
const LEVELS = [
  {
    number: 1,
    name: 'Survival English',
    description: 'Sobrevivência básica - Frases essenciais',
    minXP: 0,
    phrasesTarget: 500,
    difficulty: 'beginner',
  },
  {
    number: 2,
    name: 'Tourist',
    description: 'Viagens e turismo',
    minXP: 1000,
    phrasesTarget: 800,
    difficulty: 'elementary',
  },
  {
    number: 3,
    name: 'Daily English',
    description: 'Inglês do dia a dia',
    minXP: 3000,
    phrasesTarget: 1000,
    difficulty: 'pre-intermediate',
  },
  {
    number: 4,
    name: 'Professional',
    description: 'Inglês profissional e de negócios',
    minXP: 6000,
    phrasesTarget: 1500,
    difficulty: 'intermediate',
  },
  {
    number: 5,
    name: 'Advanced Situations',
    description: 'Situações avançadas',
    minXP: 10000,
    phrasesTarget: 2000,
    difficulty: 'upper-intermediate',
  },
  {
    number: 6,
    name: 'Mastery',
    description: 'Maestria e fluência',
    minXP: 15000,
    phrasesTarget: 2000,
    difficulty: 'advanced',
  },
  {
    number: 7,
    name: 'Native-Like',
    description: 'Expressões nativas e cultura',
    minXP: 20000,
    phrasesTarget: 1500,
    difficulty: 'proficiency',
  },
  {
    number: 8,
    name: 'Specialist',
    description: 'Áreas especializadas',
    minXP: 25000,
    phrasesTarget: 1700,
    difficulty: 'expert',
  },
]

// ============================================
// CATEGORIAS POR NÍVEL
// ============================================
const CATEGORIES_BY_LEVEL = {
  1: [
    { name: 'Greetings', icon: '👋', slug: 'greetings' },
    { name: 'Restaurant', icon: '🍽️', slug: 'restaurant' },
    { name: 'Airport', icon: '✈️', slug: 'airport' },
    { name: 'Hotel', icon: '🏨', slug: 'hotel' },
    { name: 'Shopping', icon: '🛍️', slug: 'shopping' },
    { name: 'Directions', icon: '🗺️', slug: 'directions' },
    { name: 'Emergency', icon: '🚨', slug: 'emergency' },
    { name: 'Help', icon: '🙋', slug: 'help' },
    { name: 'Numbers & Time', icon: '🕐', slug: 'numbers-time' },
    { name: 'Survival Phrases', icon: '🆘', slug: 'survival' },
  ],
  2: [
    { name: 'Transportation', icon: '🚇', slug: 'transportation' },
    { name: 'Weather', icon: '🌤️', slug: 'weather' },
    { name: 'Making Friends', icon: '🤝', slug: 'friends' },
    { name: 'Sightseeing', icon: '🏛️', slug: 'sightseeing' },
    { name: 'Entertainment', icon: '🎭', slug: 'entertainment' },
    { name: 'Phone Calls', icon: '📞', slug: 'phone' },
    { name: 'Post Office', icon: '📮', slug: 'post-office' },
    { name: 'Bank', icon: '🏦', slug: 'bank' },
    { name: 'Health', icon: '🏥', slug: 'health' },
    { name: 'Family', icon: '👨‍👩‍👧‍👦', slug: 'family' },
  ],
  3: [
    { name: 'Small Talk', icon: '💬', slug: 'small-talk' },
    { name: 'Hobbies', icon: '🎨', slug: 'hobbies' },
    { name: 'Sports', icon: '⚽', slug: 'sports' },
    { name: 'Technology', icon: '💻', slug: 'technology' },
    { name: 'Music', icon: '🎵', slug: 'music' },
    { name: 'Movies', icon: '🎬', slug: 'movies' },
    { name: 'Books', icon: '📚', slug: 'books' },
    { name: 'Food & Cooking', icon: '👨‍🍳', slug: 'cooking' },
    { name: 'Home', icon: '🏠', slug: 'home' },
    { name: 'Daily Routine', icon: '⏰', slug: 'routine' },
  ],
  // ... mais níveis
}

// ============================================
// FUNÇÃO PRINCIPAL: GERAR FRASES COM IA
// ============================================
async function generatePhrasesForCategory(
  category: string,
  level: number,
  difficulty: string,
  count: number = 50
): Promise<any[]> {
  console.log(`🤖 Gerando ${count} frases para: ${category} (Nível ${level})`)

  const prompt = `
You are an expert English teacher. Generate exactly ${count} practical English phrases for the category "${category}" at ${difficulty} level.

Requirements:
1. Each phrase should be PRACTICAL and USEFUL in real-life situations
2. Include British and American English variations when relevant
3. Focus on conversational English, not formal/academic
4. Provide context-appropriate usage tips in Portuguese

Return a JSON array with this exact structure:
[
  {
    "en": "English phrase here",
    "pt": "Tradução em português aqui",
    "tip": "Dica de uso em português - quando/onde usar",
    "difficulty": ${level}
  }
]

Category: ${category}
Level: ${level} (1=beginner, 5=advanced)
Difficulty: ${difficulty}

IMPORTANT: Return ONLY the JSON array, no additional text.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional English teacher specializing in practical, conversational English for Brazilian Portuguese speakers.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: 'json_object' }, // Força JSON
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Empty response from OpenAI')

    // Parse JSON
    const data = JSON.parse(content)
    const phrases = Array.isArray(data) ? data : data.phrases || []

    console.log(`✅ Geradas ${phrases.length} frases`)
    return phrases
  } catch (error) {
    console.error(`❌ Erro ao gerar frases:`, error)
    return []
  }
}

// ============================================
// SALVAR FRASES NO BANCO
// ============================================
async function savePhrases(
  phrases: any[],
  categoryId: number
): Promise<number> {
  let saved = 0

  for (const [index, phrase] of phrases.entries()) {
    try {
      await prisma.phrase.create({
        data: {
          categoryId,
          en: phrase.en,
          pt: phrase.pt,
          tip: phrase.tip || null,
          difficulty: phrase.difficulty || 1,
          order: index + 1,
        },
      })
      saved++
    } catch (error) {
      console.error(`Erro ao salvar frase: ${phrase.en}`)
    }
  }

  return saved
}

// ============================================
// SCRIPT PRINCIPAL
// ============================================
async function main() {
  console.log('🚀 INICIANDO GERADOR DE FRASES EM MASSA')
  console.log('Meta: 10.000 frases em 90 dias\n')

  // 1. Criar os 8 níveis
  console.log('📊 Criando 8 níveis...')
  for (const levelData of LEVELS) {
    const existing = await prisma.level.findUnique({
      where: { number: levelData.number },
    })

    if (!existing) {
      await prisma.level.create({
        data: {
          number: levelData.number,
          name: levelData.name,
          description: levelData.description,
          minXP: levelData.minXP,
          color: '#8b5cf6', // roxo padrão
          icon: '🎯',
        },
      })
      console.log(`✅ Nível ${levelData.number} criado: ${levelData.name}`)
    }
  }

  // 2. Gerar frases para Nível 1 (exemplo)
  console.log('\n📝 Gerando frases para Nível 1...')

  const level1 = await prisma.level.findUnique({ where: { number: 1 } })
  if (!level1) {
    console.error('Nível 1 não encontrado')
    return
  }

  const categoriesLevel1 = CATEGORIES_BY_LEVEL[1]
  let totalGenerated = 0

  for (const [index, catData] of categoriesLevel1.entries()) {
    // Criar categoria
    let category = await prisma.category.findUnique({
      where: { slug: catData.slug },
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          levelId: level1.id,
          name: catData.name,
          slug: catData.slug,
          description: `${catData.name} - Frases essenciais`,
          icon: catData.icon,
          order: index + 1,
        },
      })
    }

    // Verificar quantas frases já existem
    const existingCount = await prisma.phrase.count({
      where: { categoryId: category.id },
    })

    const targetPerCategory = 50 // 50 frases por categoria
    const needed = Math.max(0, targetPerCategory - existingCount)

    if (needed > 0) {
      console.log(`\n📍 Categoria: ${catData.name}`)
      console.log(`   Existentes: ${existingCount} | Gerando: ${needed}`)

      // Gerar frases com IA
      const phrases = await generatePhrasesForCategory(
        catData.name,
        1,
        'beginner',
        needed
      )

      // Salvar no banco
      const saved = await savePhrases(phrases, category.id)
      totalGenerated += saved

      console.log(`   ✅ Salvas: ${saved}/${needed}`)

      // Aguardar 2s para não sobrecarregar API
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } else {
      console.log(`✓ ${catData.name}: já tem ${existingCount} frases`)
    }
  }

  console.log(`\n🎉 Total de frases geradas nesta execução: ${totalGenerated}`)
  console.log('\n✅ SCRIPT CONCLUÍDO!')

  // Estatísticas
  const totalPhrases = await prisma.phrase.count()
  const totalCategories = await prisma.category.count()

  console.log(`\n📊 ESTATÍSTICAS:`)
  console.log(`   Frases totais: ${totalPhrases}`)
  console.log(`   Categorias: ${totalCategories}`)
  console.log(`   Meta: 10.000 frases`)
  console.log(`   Progresso: ${((totalPhrases / 10000) * 100).toFixed(1)}%`)
}

// ============================================
// EXECUTAR
// ============================================
main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
