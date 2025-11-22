/**
 * MAIN APPLICATION ENTRY POINT - AprendaInglesGratis
 *
 * Express server with all middleware, routes, and error handling
 *
 * @module App
 * @version 1.0.0
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './config';

// Initialize Express app
const app: Express = express();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.api,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

// ==================== HEALTH CHECK ====================

app.get('/health', async (_req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: '1.0.0',
  };

  res.status(200).json(health);
});

// ==================== API ROUTES ====================

import apiRoutes from './routes';

// API v1 routes - connect to real implementations
app.use('/api/v1', apiRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message,
    ...(config.env === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// ==================== SERVER START ====================

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀  AprendaInglesGratis API - Version 1.0.0           ║
║                                                            ║
║     Environment: ${config.env.padEnd(42)} ║
║     Port:        ${PORT.toString().padEnd(42)} ║
║     URL:         ${config.appUrl.padEnd(42)} ║
║                                                            ║
║     Status:      ✅ Server is running                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📚 API Documentation: ${config.appUrl}/api/docs
🏥 Health Check: ${config.appUrl}/health
  `);

  // Validate critical services
  console.log('\n🔍 Checking services...\n');

  if (!config.openai.apiKey) {
    console.warn('⚠️  OpenAI API key not configured - AI features will be disabled');
  } else {
    console.log('✅ OpenAI configured');
  }

  if (!config.redis.host || config.redis.host === 'localhost') {
    console.warn('⚠️  Redis not configured - Caching will use in-memory fallback');
  } else {
    console.log('✅ Redis configured');
  }

  if (!config.stripe.secretKey) {
    console.warn('⚠️  Stripe not configured - Payments will be disabled');
  } else {
    console.log('✅ Stripe configured');
  }

  console.log('\n✨ Ready to accept connections!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
