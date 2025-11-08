/**
 * ENVIRONMENT VALIDATOR
 * Validates required environment variables on startup
 */

interface EnvVar {
  name: string
  required: boolean
  description: string
}

const envVars: EnvVar[] = [
  // Database
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string' },

  // JWT
  { name: 'JWT_SECRET', required: true, description: 'JWT signing secret' },
  { name: 'JWT_REFRESH_SECRET', required: true, description: 'JWT refresh token secret' },

  // Server
  { name: 'PORT', required: false, description: 'Server port (default: 3001)' },
  { name: 'NODE_ENV', required: false, description: 'Environment (development/production)' },
  { name: 'FRONTEND_URL', required: true, description: 'Frontend URL for CORS' },

  // OpenAI
  { name: 'OPENAI_API_KEY', required: true, description: 'OpenAI API key for AI features' },

  // Email (at least one provider required)
  { name: 'SENDGRID_API_KEY', required: false, description: 'SendGrid API key (production)' },
  { name: 'AWS_SES_REGION', required: false, description: 'AWS SES region (production)' },
  { name: 'ETHEREAL_USER', required: false, description: 'Ethereal email for development' },

  { name: 'EMAIL_FROM', required: true, description: 'From email address' },
  { name: 'EMAIL_FROM_NAME', required: true, description: 'From email name' },

  // Stripe
  { name: 'STRIPE_SECRET_KEY', required: true, description: 'Stripe secret key' },
  { name: 'STRIPE_PUBLISHABLE_KEY', required: true, description: 'Stripe publishable key' },
  { name: 'STRIPE_WEBHOOK_SECRET', required: true, description: 'Stripe webhook secret' },
  { name: 'STRIPE_PRICE_MONTHLY', required: true, description: 'Monthly price ID' },
  { name: 'STRIPE_PRICE_YEARLY', required: true, description: 'Yearly price ID' },
]

/**
 * Validate environment variables
 */
export function validateEnv(): void {
  const missing: EnvVar[] = []
  const warnings: EnvVar[] = []

  for (const envVar of envVars) {
    const value = process.env[envVar.name]

    if (!value) {
      if (envVar.required) {
        missing.push(envVar)
      } else {
        warnings.push(envVar)
      }
    }
  }

  // Check email provider (at least one required)
  const hasEmailProvider =
    process.env.SENDGRID_API_KEY ||
    process.env.AWS_SES_REGION ||
    process.env.ETHEREAL_USER

  if (!hasEmailProvider) {
    missing.push({
      name: 'EMAIL_PROVIDER',
      required: true,
      description:
        'At least one email provider (SENDGRID_API_KEY, AWS_SES_REGION, or ETHEREAL_USER)',
    })
  }

  // Print results
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:\n')
    missing.forEach((envVar) => {
      console.error(`  • ${envVar.name}: ${envVar.description}`)
    })
    console.error('\nPlease set these variables in your .env file.')
    console.error('See .env.example for reference.\n')
    process.exit(1)
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('\n⚠️  Optional environment variables not set:\n')
    warnings.forEach((envVar) => {
      console.warn(`  • ${envVar.name}: ${envVar.description}`)
    })
    console.warn('')
  }

  // Success message
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Environment variables validated successfully')
  }
}

/**
 * Get environment with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value || defaultValue!
}

/**
 * Check if production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
}

/**
 * Check if test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

export default {
  validateEnv,
  getEnv,
  isProduction,
  isDevelopment,
  isTest,
}
