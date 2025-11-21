/**
 * CONFIGURATION - AprendaInglesGratis
 *
 * Centralized configuration for all environment variables and integrations
 *
 * @module Config
 * @version 1.0.0
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Application
  env: string;
  port: number;
  appUrl: string;
  frontendUrl: string;

  // Database
  databaseUrl: string;

  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    tls: boolean;
  };

  // JWT
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // OpenAI
  openai: {
    apiKey: string;
    model: string;
    whisperModel: string;
  };

  // Stripe
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };

  // AWS S3
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
    cloudfrontDomain?: string;
  };

  // Email (SMTP)
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };

  // SMS (Twilio)
  sms?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };

  // Video Conferencing (Daily.co)
  video?: {
    apiKey: string;
  };

  // Monitoring (Sentry)
  sentry?: {
    dsn: string;
  };

  // Rate Limiting
  rateLimit: {
    auth: number;
    api: number;
    uploads: number;
  };

  // CORS
  cors: {
    origins: string[];
  };

  // Logging
  logLevel: string;
}

const config: Config = {
  // Application
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/aprendaingles',

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    tls: process.env.REDIS_TLS === 'true',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    whisperModel: process.env.OPENAI_WHISPER_MODEL || 'whisper-1',
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // AWS S3
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
    cloudfrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@aprendaingles.com',
  },

  // SMS (Optional)
  sms: process.env.TWILIO_ACCOUNT_SID
    ? {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
      }
    : undefined,

  // Video (Optional)
  video: process.env.DAILY_API_KEY
    ? {
        apiKey: process.env.DAILY_API_KEY,
      }
    : undefined,

  // Sentry (Optional)
  sentry: process.env.SENTRY_DSN
    ? {
        dsn: process.env.SENTRY_DSN,
      }
    : undefined,

  // Rate Limiting
  rateLimit: {
    auth: parseInt(process.env.RATE_LIMIT_AUTH || '5', 10),
    api: parseInt(process.env.RATE_LIMIT_API || '100', 10),
    uploads: parseInt(process.env.RATE_LIMIT_UPLOADS || '10', 10),
  },

  // CORS
  cors: {
    origins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:5173', 'http://localhost:3000'],
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate critical config
function validateConfig(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please create a .env file with all required variables.'
    );
  }

  // Warn about optional but recommended configs
  const recommended = ['OPENAI_API_KEY', 'REDIS_HOST'];
  const missingRecommended = recommended.filter((key) => !process.env[key]);

  if (missingRecommended.length > 0 && config.env === 'production') {
    console.warn(
      `⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}`
    );
  }
}

// Run validation in production
if (config.env === 'production') {
  validateConfig();
}

export default config;
