# AprendaInglesGratis - Backend API

Backend RESTful API for AprendaInglesGratis English learning platform.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 14.x
- Redis >= 7.x (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configurations
nano .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database
npm run prisma:seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

Server will be available at `http://localhost:3000`

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test
```

## 📚 API Documentation

### Health Check

```
GET /health
```

Returns server status and uptime.

### API Endpoints

All API endpoints are prefixed with `/api/v1`:

- **Authentication**: `/api/v1/auth`
- **Speaking Practice**: `/api/v1/speaking`
- **Listening Practice**: `/api/v1/listening`
- **Placement Test**: `/api/v1/placement`
- **Teachers**: `/api/v1/teachers`
- **Gamification**: `/api/v1/gamification`
- **Grammar**: `/api/v1/grammar`

Full API documentation available in [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

## 🗄️ Database

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Database Schema

The database includes:

- **Users & Authentication**: User accounts, JWT tokens
- **Learning Content**: Phrases, levels, categories
- **Progress Tracking**: User progress, achievements
- **Speaking & Listening**: Session data, attempts, scores
- **Teachers**: Teacher profiles, lessons, ratings
- **Payments**: Stripe integration, subscriptions
- **Gamification**: XP, levels, streaks, achievements

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache**: Redis (optional)
- **AI**: OpenAI GPT-4 & Whisper
- **Payments**: Stripe
- **Storage**: AWS S3
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Database seeding
├── tests/               # Test files
├── .env.example         # Environment variables template
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🔒 Environment Variables

See `.env.example` for all required and optional environment variables.

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens

**Recommended for Production**:
- `OPENAI_API_KEY` - For AI features
- `REDIS_HOST` - For caching
- `STRIPE_SECRET_KEY` - For payments

## 🧪 Development Scripts

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

## 📊 Monitoring

- **Error Tracking**: Sentry (configure `SENTRY_DSN`)
- **Logging**: Winston (logs to files and console)
- **Health Check**: `GET /health`

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for complete deployment instructions for:

- Railway
- Heroku
- AWS (EC2 + RDS)
- Vercel (serverless functions)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For questions or support:
- Email: dev@aprendaingles.com
- Issues: https://github.com/ToyKids2025/AprendaInglesGratis/issues
