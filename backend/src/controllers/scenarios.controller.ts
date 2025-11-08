/**
 * CONVERSATION SCENARIOS CONTROLLER
 * Manage conversation scenarios for AI practice
 */

import { Request, Response } from 'express'
import prisma from '../lib/prisma'

/**
 * GET /api/scenarios
 * Get all active conversation scenarios
 */
export async function getScenarios(req: Request, res: Response) {
  try {
    const { difficulty } = req.query

    const scenarios = await prisma.conversationScenario.findMany({
      where: {
        isActive: true,
        ...(difficulty && { difficulty: parseInt(difficulty as string) }),
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        difficulty: true,
        order: true,
      },
    })

    return res.json({
      success: true,
      data: scenarios,
    })
  } catch (error) {
    console.error('Get scenarios error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to load scenarios',
    })
  }
}

/**
 * GET /api/scenarios/:slug
 * Get a specific scenario with full details
 */
export async function getScenarioBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params

    const scenario = await prisma.conversationScenario.findUnique({
      where: { slug },
    })

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: 'Scenario not found',
      })
    }

    if (!scenario.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Scenario is not available',
      })
    }

    return res.json({
      success: true,
      data: scenario,
    })
  } catch (error) {
    console.error('Get scenario error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to load scenario',
    })
  }
}

/**
 * POST /api/admin/scenarios
 * Create a new conversation scenario (admin only)
 */
export async function createScenario(req: Request, res: Response) {
  try {
    const { name, slug, description, icon, difficulty, systemPrompt, initialMessage, order } =
      req.body

    // Validate required fields
    if (!name || !slug || !description || !icon || !systemPrompt || !initialMessage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      })
    }

    // Check if slug already exists
    const existing = await prisma.conversationScenario.findUnique({
      where: { slug },
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Scenario with this slug already exists',
      })
    }

    const scenario = await prisma.conversationScenario.create({
      data: {
        name,
        slug,
        description,
        icon,
        difficulty: difficulty || 1,
        systemPrompt,
        initialMessage,
        order: order || 0,
        isActive: true,
      },
    })

    return res.status(201).json({
      success: true,
      data: scenario,
    })
  } catch (error) {
    console.error('Create scenario error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create scenario',
    })
  }
}

/**
 * PATCH /api/admin/scenarios/:id
 * Update a conversation scenario (admin only)
 */
export async function updateScenario(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { name, description, icon, difficulty, systemPrompt, initialMessage, order, isActive } =
      req.body

    const scenario = await prisma.conversationScenario.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon && { icon }),
        ...(difficulty && { difficulty }),
        ...(systemPrompt && { systemPrompt }),
        ...(initialMessage && { initialMessage }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return res.json({
      success: true,
      data: scenario,
    })
  } catch (error) {
    console.error('Update scenario error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update scenario',
    })
  }
}

/**
 * DELETE /api/admin/scenarios/:id
 * Delete a conversation scenario (admin only)
 */
export async function deleteScenario(req: Request, res: Response) {
  try {
    const { id } = req.params

    await prisma.conversationScenario.delete({
      where: { id: parseInt(id) },
    })

    return res.json({
      success: true,
      message: 'Scenario deleted successfully',
    })
  } catch (error) {
    console.error('Delete scenario error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete scenario',
    })
  }
}

/**
 * GET /api/admin/scenarios
 * Get all scenarios including inactive ones (admin only)
 */
export async function getAllScenariosAdmin(req: Request, res: Response) {
  try {
    const scenarios = await prisma.conversationScenario.findMany({
      orderBy: {
        order: 'asc',
      },
    })

    return res.json({
      success: true,
      data: scenarios,
    })
  } catch (error) {
    console.error('Get all scenarios error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to load scenarios',
    })
  }
}

/**
 * Default conversation scenarios data for seeding
 */
export const defaultScenarios = [
  {
    name: 'Restaurant Order',
    slug: 'restaurant',
    description: 'Practice ordering food at a restaurant',
    icon: '🍽️',
    difficulty: 1,
    order: 1,
    systemPrompt: `You are a friendly waiter/waitress at a casual American restaurant. Your goal is to help the customer (an English learner) practice ordering food in English.

Guidelines:
- Speak clearly and naturally, but not too fast
- Be patient and encouraging
- Use common restaurant vocabulary
- Offer menu suggestions when asked
- If the student makes a mistake, gently correct them by restating correctly
- Keep responses concise (1-3 sentences)
- End the conversation naturally after taking the order

Menu highlights: burgers, pizza, pasta, salads, soft drinks, coffee, desserts.`,
    initialMessage:
      "Hello! Welcome to our restaurant. I'm your server today. Have you had a chance to look at our menu?",
  },
  {
    name: 'Airport Check-in',
    slug: 'airport',
    description: 'Practice checking in at the airport',
    icon: '✈️',
    difficulty: 1,
    order: 2,
    systemPrompt: `You are a friendly check-in agent at an international airport. Help the customer (English learner) practice airport check-in procedures.

Guidelines:
- Use clear, simple English
- Ask standard check-in questions (destination, bags, seat preference)
- Explain security procedures if needed
- Be professional but friendly
- Gently correct errors by restating
- Keep responses concise

Common questions: "Do you have any bags to check?", "Window or aisle seat?", "Did you pack your bags yourself?"`,
    initialMessage:
      'Good morning! Welcome to the check-in counter. May I see your passport and booking confirmation, please?',
  },
  {
    name: 'Hotel Reservation',
    slug: 'hotel',
    description: 'Book a hotel room over the phone',
    icon: '🏨',
    difficulty: 2,
    order: 3,
    systemPrompt: `You are a hotel receptionist helping a guest make a reservation over the phone. The guest is learning English.

Guidelines:
- Be polite and professional
- Ask about check-in/check-out dates, room type, number of guests
- Mention room amenities (WiFi, breakfast, parking)
- Confirm booking details
- Provide price information
- Gently correct language errors

Room types available: single, double, suite. Prices: $80-200/night.`,
    initialMessage:
      "Good afternoon! Thank you for calling Grand Hotel. I'm happy to help you make a reservation. What dates are you looking to stay with us?",
  },
  {
    name: 'Shopping',
    slug: 'shopping',
    description: 'Shop for clothes and ask about prices',
    icon: '🛍️',
    difficulty: 2,
    order: 4,
    systemPrompt: `You are a sales assistant in a clothing store. Help the customer (English learner) find clothes and practice shopping vocabulary.

Guidelines:
- Be helpful and friendly
- Offer assistance with sizes, colors, styles
- Answer questions about prices, sales, returns
- Use common shopping phrases
- Gently correct errors
- Keep it natural and conversational

Available: shirts, jeans, dresses, shoes, jackets. Sizes: S, M, L, XL. On sale: 20% off selected items.`,
    initialMessage:
      "Hi there! Welcome to our store. Is there anything specific you're looking for today? We have a great sale on right now!",
  },
  {
    name: 'Job Interview',
    slug: 'job-interview',
    description: 'Practice for a job interview',
    icon: '💼',
    difficulty: 4,
    order: 5,
    systemPrompt: `You are a hiring manager conducting a job interview for a software developer position. The candidate is an English learner.

Guidelines:
- Be professional and encouraging
- Ask standard interview questions (experience, strengths, why this company)
- Listen to their answers and ask follow-up questions
- Provide feedback if they make significant errors
- Keep questions clear and give them time to think
- End with next steps

Position: Mid-level Software Developer. Skills needed: JavaScript, React, Node.js.`,
    initialMessage:
      "Good morning! Thank you for coming in today. I'm Sarah, the hiring manager. Please, have a seat. Let's start with you telling me a bit about yourself and your experience.",
  },
  {
    name: 'Business Meeting',
    slug: 'business-meeting',
    description: 'Participate in a business meeting',
    icon: '🤝',
    difficulty: 5,
    order: 6,
    systemPrompt: `You are a colleague in a business meeting discussing a new project. The other participant is learning English.

Guidelines:
- Use professional business English
- Discuss project timeline, budget, team assignments
- Ask for opinions and ideas
- Practice meeting vocabulary (agenda, action items, deadlines)
- Be encouraging but use advanced vocabulary
- Correct major errors professionally

Project: Launch new mobile app in 3 months. Budget: $50,000. Team: 5 people.`,
    initialMessage:
      "Good morning everyone! Thank you for joining this kickoff meeting for our new mobile app project. I'd like to start by going over the project timeline and getting your input on the implementation strategy. What are your initial thoughts?",
  },
  {
    name: 'Doctor Visit',
    slug: 'doctor',
    description: 'Describe symptoms to a doctor',
    icon: '🏥',
    difficulty: 3,
    order: 7,
    systemPrompt: `You are a friendly doctor in a general practice clinic. Help the patient (English learner) describe their symptoms and understand your advice.

Guidelines:
- Be compassionate and professional
- Ask about symptoms, when they started, severity
- Use simple medical terms but explain them
- Give basic health advice
- Gently correct major errors
- Reassure the patient

Common issues: cold, flu, headache, stomach ache, allergies.`,
    initialMessage:
      'Hello! Please come in and have a seat. What brings you to the clinic today? Can you tell me what symptoms you\'ve been experiencing?',
  },
  {
    name: 'Making Friends',
    slug: 'friends',
    description: 'Have a casual conversation to make friends',
    icon: '😊',
    difficulty: 2,
    order: 8,
    systemPrompt: `You are a friendly person meeting someone new at a social event. Help them practice casual English conversation.

Guidelines:
- Be warm and natural
- Talk about hobbies, interests, where you're from
- Ask open-ended questions
- Use casual language and idioms (but explain if needed)
- Show genuine interest
- Gently correct major errors

Topics: hobbies, movies, music, travel, food, work/school.`,
    initialMessage:
      "Hey! I don't think we've met before. I'm Alex. I haven't seen you around here - are you new to the area?",
  },
]
