/**
 * SWAGGER/OpenAPI CONFIGURATION
 * API documentation setup
 */

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'English Flow API',
      version: '1.0.0',
      description: 'Complete English learning platform API documentation',
      contact: {
        name: 'API Support',
        email: 'support@englishflow.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.englishflow.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            level: { type: 'integer' },
            xp: { type: 'integer' },
            streak: { type: 'integer' },
            isPremium: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Phrase: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            english: { type: 'string' },
            portuguese: { type: 'string' },
            level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            category: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Phrases', description: 'Phrase management and learning' },
      { name: 'Progress', description: 'User progress tracking' },
      { name: 'Achievements', description: 'Achievements and badges' },
      { name: 'Social', description: 'Friends, groups, and leaderboards' },
      { name: 'Gamification', description: 'Challenges, quests, and rewards' },
      { name: 'Content', description: 'Categories, topics, and search' },
      { name: 'Monitoring', description: 'System health and metrics' },
      { name: 'Feedback', description: 'User feedback and surveys' },
    ],
  },
  apis: ['./src/routes/*.ts'],
}

export const swaggerOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'English Flow API Docs',
}
