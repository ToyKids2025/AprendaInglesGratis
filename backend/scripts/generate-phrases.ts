/**
 * GERADOR AUTOMATIZADO DE FRASES
 *
 * Este script usa IA para gerar frases em inglês em escala
 * Meta: Criar 10.000 frases em 90 dias
 * Média: 111 frases/dia
 */

import { PrismaClient } from '@prisma/client'
import { aiService } from '../src/services/ai.service'

const prisma = new PrismaClient()

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
  4: [
    { name: 'Business Meetings', icon: '💼', slug: 'business-meetings' },
    { name: 'Job Interviews', icon: '🤝', slug: 'job-interviews' },
    { name: 'Presentations', icon: '📊', slug: 'presentations' },
    { name: 'Emails & Letters', icon: '✉️', slug: 'emails' },
    { name: 'Negotiations', icon: '🤝', slug: 'negotiations' },
    { name: 'Customer Service', icon: '🎧', slug: 'customer-service' },
    { name: 'Office Talk', icon: '🏢', slug: 'office-talk' },
    { name: 'Networking', icon: '🌐', slug: 'networking' },
    { name: 'Sales & Marketing', icon: '📈', slug: 'sales' },
    { name: 'Finance', icon: '💰', slug: 'finance' },
  ],
  5: [
    { name: 'Academic English', icon: '🎓', slug: 'academic' },
    { name: 'Debates & Discussions', icon: '🗣️', slug: 'debates' },
    { name: 'News & Current Events', icon: '📰', slug: 'news' },
    { name: 'Science & Research', icon: '🔬', slug: 'science' },
    { name: 'Politics', icon: '🏛️', slug: 'politics' },
    { name: 'Environment', icon: '🌍', slug: 'environment' },
    { name: 'Culture & Society', icon: '🎭', slug: 'culture' },
    { name: 'Philosophy', icon: '🤔', slug: 'philosophy' },
    { name: 'Psychology', icon: '🧠', slug: 'psychology' },
    { name: 'History', icon: '📜', slug: 'history' },
  ],
  6: [
    { name: 'Idioms & Expressions', icon: '💬', slug: 'idioms' },
    { name: 'Phrasal Verbs', icon: '🔄', slug: 'phrasal-verbs' },
    { name: 'Advanced Grammar', icon: '📝', slug: 'advanced-grammar' },
    { name: 'Literary English', icon: '📖', slug: 'literary' },
    { name: 'Creative Writing', icon: '✍️', slug: 'creative-writing' },
    { name: 'Public Speaking', icon: '🎤', slug: 'public-speaking' },
    { name: 'Critical Thinking', icon: '🧩', slug: 'critical-thinking' },
    { name: 'Abstract Concepts', icon: '🌌', slug: 'abstract' },
    { name: 'Humor & Sarcasm', icon: '😄', slug: 'humor' },
    { name: 'Argumentation', icon: '⚖️', slug: 'argumentation' },
  ],
  7: [
    { name: 'Slang & Colloquialisms', icon: '💬', slug: 'slang' },
    { name: 'Regional Variations', icon: '🌎', slug: 'regional' },
    { name: 'Pop Culture', icon: '🎬', slug: 'pop-culture' },
    { name: 'Social Issues', icon: '🤝', slug: 'social-issues' },
    { name: 'Subtle Nuances', icon: '🎨', slug: 'nuances' },
    { name: 'Native Expressions', icon: '🗣️', slug: 'native-expressions' },
    { name: 'Wordplay & Puns', icon: '🎭', slug: 'wordplay' },
    { name: 'Complex Emotions', icon: '❤️', slug: 'emotions' },
    { name: 'Cultural References', icon: '🏛️', slug: 'cultural-refs' },
    { name: 'Advanced Conversation', icon: '💭', slug: 'advanced-conversation' },
  ],
  8: [
    { name: 'Medical English', icon: '⚕️', slug: 'medical' },
    { name: 'Legal English', icon: '⚖️', slug: 'legal' },
    { name: 'Technical English', icon: '🔧', slug: 'technical' },
    { name: 'Aviation', icon: '✈️', slug: 'aviation' },
    { name: 'Engineering', icon: '🏗️', slug: 'engineering' },
    { name: 'IT & Programming', icon: '💻', slug: 'programming' },
    { name: 'Architecture', icon: '🏛️', slug: 'architecture' },
    { name: 'Journalism', icon: '📰', slug: 'journalism' },
    { name: 'Marketing & Advertising', icon: '📢', slug: 'marketing' },
    { name: 'Entrepreneurship', icon: '🚀', slug: 'entrepreneurship' },
  ],
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

  try {
    // Usa o serviço centralizado de IA
    const phrases = await aiService.generatePhrases(category, level, difficulty, count)
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

  // 2. Ler argumentos e gerar frases
  const args = process.argv.slice(2)
  const levelsToGenerate = args.length > 0 ? args.map(Number) : [1, 2]
  console.log(`\n📋 Gerando frases para níveis: ${levelsToGenerate.join(', ')}`)

  let totalGenerated = 0

  for (const levelNum of levelsToGenerate) {
    const levelData = LEVELS.find((l) => l.number === levelNum)
    if (!levelData) continue

    console.log(`\n📝 Nível ${levelNum} - ${levelData.name}...`)

    const level = await prisma.level.findUnique({ where: { number: levelNum } })
    if (!level) continue

    const categories = CATEGORIES_BY_LEVEL[levelNum] || []

    for (const [index, catData] of categories.entries()) {
    // Criar categoria
    let category = await prisma.category.findUnique({
      where: { slug: catData.slug },
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          levelId: level.id,
          name: catData.name,
          slug: catData.slug,
          description: `${catData.name} - ${levelData.description}`,
          icon: catData.icon,
          order: index + 1,
        },
      })
    }

      // Verificar quantas frases já existem
      const existingCount = await prisma.phrase.count({
        where: { categoryId: category.id },
      })

      const targetPerCategory = 20 // 20 frases por categoria
      const needed = Math.max(0, targetPerCategory - existingCount)

      if (needed > 0) {
        console.log(`\n📍 ${catData.name}`)
        console.log(`   Existentes: ${existingCount} | Gerando: ${needed}`)

        const phrases = await generatePhrasesForCategory(
          catData.name,
          levelNum,
          levelData.difficulty as string,
          needed
        )

        if (phrases.length > 0) {
          const saved = await savePhrases(phrases, category.id)
          totalGenerated += saved
          console.log(`   ✅ Salvas: ${saved}/${needed}`)
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      } else {
        console.log(`✓ ${catData.name}: ${existingCount} frases`)
      }
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
  console.log(`\n💡 Uso: tsx scripts/generate-phrases.ts [níveis]`)
  console.log(`   Exemplo: tsx scripts/generate-phrases.ts 1 2 3`)
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
