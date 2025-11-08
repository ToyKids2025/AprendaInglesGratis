/**
 * SEED CATEGORIES, TOPICS, AND SITUATIONS
 * Populate default content organization
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default categories
const categories = [
  {
    name: 'Business English',
    slug: 'business',
    description: 'Professional and workplace communication',
    icon: '💼',
    color: '#3B82F6',
  },
  {
    name: 'Travel & Tourism',
    slug: 'travel',
    description: 'Essential phrases for travelers',
    icon: '✈️',
    color: '#10B981',
  },
  {
    name: 'Daily Conversation',
    slug: 'daily',
    description: 'Everyday communication',
    icon: '💬',
    color: '#F59E0B',
  },
  {
    name: 'Academic English',
    slug: 'academic',
    description: 'Academic and educational contexts',
    icon: '🎓',
    color: '#8B5CF6',
  },
  {
    name: 'Social & Entertainment',
    slug: 'social',
    description: 'Social situations and entertainment',
    icon: '🎉',
    color: '#EC4899',
  },
]

// Default topics
const topics = [
  // Business
  { name: 'Meetings', slug: 'meetings', level: 'intermediate', icon: '👥' },
  { name: 'Presentations', slug: 'presentations', level: 'intermediate', icon: '📊' },
  { name: 'Negotiations', slug: 'negotiations', level: 'advanced', icon: '🤝' },
  { name: 'Email Writing', slug: 'email', level: 'beginner', icon: '📧' },
  { name: 'Phone Calls', slug: 'phone', level: 'intermediate', icon: '📞' },

  // Travel
  { name: 'Airport', slug: 'airport', level: 'beginner', icon: '🛫' },
  { name: 'Hotel', slug: 'hotel', level: 'beginner', icon: '🏨' },
  { name: 'Restaurant', slug: 'restaurant', level: 'beginner', icon: '🍽️' },
  { name: 'Directions', slug: 'directions', level: 'beginner', icon: '🗺️' },
  { name: 'Shopping', slug: 'shopping', level: 'beginner', icon: '🛍️' },

  // Daily
  { name: 'Greetings', slug: 'greetings', level: 'beginner', icon: '👋' },
  { name: 'Small Talk', slug: 'small-talk', level: 'beginner', icon: '☕' },
  { name: 'Weather', slug: 'weather', level: 'beginner', icon: '🌤️' },
  { name: 'Family', slug: 'family', level: 'beginner', icon: '👨‍👩‍👧‍👦' },
  { name: 'Hobbies', slug: 'hobbies', level: 'intermediate', icon: '🎨' },

  // Academic
  { name: 'Classroom', slug: 'classroom', level: 'beginner', icon: '📚' },
  { name: 'Research', slug: 'research', level: 'advanced', icon: '🔬' },
  { name: 'Exams', slug: 'exams', level: 'intermediate', icon: '📝' },
  { name: 'Study Groups', slug: 'study-groups', level: 'intermediate', icon: '👨‍🎓' },

  // Social
  { name: 'Dating', slug: 'dating', level: 'intermediate', icon: '❤️' },
  { name: 'Parties', slug: 'parties', level: 'beginner', icon: '🎊' },
  { name: 'Movies & TV', slug: 'entertainment', level: 'beginner', icon: '🎬' },
  { name: 'Sports', slug: 'sports', level: 'beginner', icon: '⚽' },
]

// Default situations
const situations = [
  // Formality levels
  { name: 'Formal Meeting', slug: 'formal-meeting', formality: 'formal', setting: 'business' },
  { name: 'Job Interview', slug: 'job-interview', formality: 'formal', setting: 'business' },
  { name: 'Customer Service', slug: 'customer-service', formality: 'neutral', setting: 'business' },
  { name: 'Casual Conversation', slug: 'casual-chat', formality: 'informal', setting: 'casual' },
  { name: 'Conference', slug: 'conference', formality: 'formal', setting: 'academic' },

  // Travel situations
  { name: 'Checking In', slug: 'check-in', formality: 'neutral', setting: 'travel' },
  { name: 'Asking for Help', slug: 'asking-help', formality: 'neutral', setting: 'casual' },
  { name: 'Making Reservations', slug: 'reservations', formality: 'neutral', setting: 'travel' },
  { name: 'Emergency', slug: 'emergency', formality: 'neutral', setting: 'casual' },

  // Social situations
  { name: 'First Meeting', slug: 'first-meeting', formality: 'neutral', setting: 'casual' },
  { name: 'Party Small Talk', slug: 'party-talk', formality: 'informal', setting: 'casual' },
  { name: 'Phone Call', slug: 'phone-call', formality: 'neutral', setting: 'business' },
]

// Default tags
const tags = [
  'common',
  'essential',
  'polite',
  'slang',
  'idiom',
  'phrasal-verb',
  'question',
  'answer',
  'greeting',
  'goodbye',
  'thank-you',
  'apology',
  'request',
  'offer',
  'suggestion',
  'opinion',
  'agreement',
  'disagreement',
  'clarification',
  'confirmation',
]

async function seedCategories() {
  console.log('🌱 Seeding categories, topics, situations, and tags...')

  try {
    // Create categories
    console.log('Creating categories...')
    for (const category of categories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: category,
        create: category,
      })
    }
    console.log(`✅ Created ${categories.length} categories`)

    // Create topics
    console.log('Creating topics...')
    for (const topic of topics) {
      await prisma.topic.upsert({
        where: { slug: topic.slug },
        update: topic,
        create: topic,
      })
    }
    console.log(`✅ Created ${topics.length} topics`)

    // Create situations
    console.log('Creating situations...')
    for (const situation of situations) {
      await prisma.situation.upsert({
        where: { slug: situation.slug },
        update: situation,
        create: situation,
      })
    }
    console.log(`✅ Created ${situations.length} situations`)

    // Create tags
    console.log('Creating tags...')
    for (const tag of tags) {
      await prisma.tag.upsert({
        where: { slug: tag },
        update: {},
        create: {
          name: tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' '),
          slug: tag,
        },
      })
    }
    console.log(`✅ Created ${tags.length} tags`)

    console.log('🎉 Seeding complete!')
  } catch (error) {
    console.error('❌ Error seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedCategories()
}

export default seedCategories
