import express from 'express'
import cors from 'cors'
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

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))

// Stripe webhook needs raw body - register BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// JSON parser for all other routes
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📚 API docs: http://localhost:${PORT}/api`)
})
