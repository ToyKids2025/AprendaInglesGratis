import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import lessonRoutes from './routes/lesson.routes'
import aiRoutes from './routes/ai.routes'
import contactRoutes from './routes/contact.routes'
import newsletterRoutes from './routes/newsletter.routes'
import paymentRoutes from './routes/payment.routes'
import adminRoutes from './routes/admin.routes'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger, errorLogger } from './middleware/requestLogger'
import { rateLimiters } from './middleware/rateLimiter'
import { validateEnv } from './utils/envValidator'

// Load environment variables
dotenv.config()

// Validate environment variables before starting server
validateEnv()

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
}))

// Compression middleware
app.use(compression())

// Request logging
app.use(requestLogger)

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Stripe webhook needs raw body - register BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// JSON parser for all other routes
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes with rate limiting
app.use('/api/auth', rateLimiters.auth, authRoutes)
app.use('/api/users', rateLimiters.general, userRoutes)
app.use('/api/lessons', rateLimiters.general, lessonRoutes)
app.use('/api/ai', rateLimiters.ai, aiRoutes)
app.use('/api/contact', rateLimiters.contact, contactRoutes)
app.use('/api/newsletter', rateLimiters.newsletter, newsletterRoutes)
app.use('/api/payments', rateLimiters.strict, paymentRoutes)
app.use('/api/admin', rateLimiters.general, adminRoutes)

// Error logger (before error handler)
app.use(errorLogger)

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API docs: http://localhost:${PORT}/api`)
})
