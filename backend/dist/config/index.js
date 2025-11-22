"use strict";
/**
 * CONFIGURATION - AprendaInglesGratis
 *
 * Centralized configuration for all environment variables and integrations
 *
 * @module Config
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const config = {
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
function validateConfig() {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}\n` +
            'Please create a .env file with all required variables.');
    }
    // Warn about optional but recommended configs
    const recommended = ['OPENAI_API_KEY', 'REDIS_HOST'];
    const missingRecommended = recommended.filter((key) => !process.env[key]);
    if (missingRecommended.length > 0 && config.env === 'production') {
        console.warn(`⚠️  Missing recommended environment variables: ${missingRecommended.join(', ')}`);
    }
}
// Run validation in production
if (config.env === 'production') {
    validateConfig();
}
exports.default = config;
//# sourceMappingURL=index.js.map