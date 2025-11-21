# 🚀 DEPLOYMENT GUIDE - AprendaInglesGratis

**Version**: 1.0.0
**Last Updated**: 2025-11-21
**Target Environment**: Production

---

## 📋 TABLE OF CONTENTS

1. [Pre-requisites](#pre-requisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Observability](#monitoring--observability)
8. [Scaling Strategy](#scaling-strategy)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 PRE-REQUISITES

### Required Services

| Service | Purpose | Recommended Provider |
|---------|---------|---------------------|
| **PostgreSQL** | Primary database | Supabase / Railway / Neon |
| **Redis** | Cache layer | Upstash / Redis Cloud |
| **Object Storage** | Audio files & images | AWS S3 / Cloudflare R2 |
| **CDN** | Static assets | Cloudflare / AWS CloudFront |
| **Email Service** | Transactional emails | Resend / SendGrid |
| **SMS Service** | OTP & notifications | Twilio |

### API Keys Required

- **OpenAI**: For AI-powered features (grammar, feedback)
- **Stripe**: Payment processing
- **Daily.co or Zoom**: Video conferencing (teacher lessons)
- **Sentry**: Error tracking (optional but recommended)

### Development Tools

```bash
# Required versions
Node.js: >= 18.x
npm: >= 9.x
PostgreSQL: >= 14.x
Redis: >= 7.x
```

---

## ⚙️ ENVIRONMENT SETUP

### Backend Environment Variables

Create `.env` file in `/backend` directory:

```env
# ==================== APP CONFIG ====================
NODE_ENV=production
PORT=3000
APP_URL=https://api.aprendaingles.com
FRONTEND_URL=https://aprendaingles.com

# ==================== DATABASE ====================
DATABASE_URL="postgresql://user:password@host:5432/aprendaingles?schema=public&sslmode=require"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# ==================== REDIS ====================
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_TLS=true

# ==================== JWT ====================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ==================== OPENAI ====================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_WHISPER_MODEL=whisper-1

# ==================== STRIPE ====================
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# ==================== AWS S3 ====================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx
AWS_S3_BUCKET=aprendaingles-audio
AWS_CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# ==================== EMAIL ====================
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@aprendaingles.com

# ==================== SMS ====================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567

# ==================== VIDEO CONFERENCING ====================
DAILY_API_KEY=xxxxxxxxxxxxx
# OR
ZOOM_ACCOUNT_ID=xxxxxxxxxxxxx
ZOOM_CLIENT_ID=xxxxxxxxxxxxx
ZOOM_CLIENT_SECRET=xxxxxxxxxxxxx

# ==================== MONITORING ====================
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOG_LEVEL=info

# ==================== RATE LIMITING ====================
RATE_LIMIT_AUTH=5
RATE_LIMIT_API=100
RATE_LIMIT_UPLOADS=10

# ==================== CORS ====================
CORS_ORIGIN=https://aprendaingles.com,https://www.aprendaingles.com
```

### Frontend Environment Variables

Create `.env.production` in `/frontend` directory:

```env
# API
VITE_API_URL=https://api.aprendaingles.com/v1

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
VITE_HOTJAR_ID=1234567

# Feature Flags
VITE_ENABLE_TEACHERS=true
VITE_ENABLE_AI_FEEDBACK=true
VITE_ENABLE_GAMIFICATION=true

# Sentry
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

---

## 🗄️ DATABASE SETUP

### Step 1: Install Prisma CLI

```bash
cd backend
npm install -g prisma
```

### Step 2: Initialize Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### Step 3: Create Database Seed

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed levels (CEFR)
  await prisma.level.createMany({
    data: [
      { name: 'A1', description: 'Beginner', order: 1 },
      { name: 'A2', description: 'Elementary', order: 2 },
      { name: 'B1', description: 'Intermediate', order: 3 },
      { name: 'B2', description: 'Upper Intermediate', order: 4 },
      { name: 'C1', description: 'Advanced', order: 5 },
      { name: 'C2', description: 'Proficient', order: 6 },
    ],
  });

  // Seed categories
  await prisma.category.createMany({
    data: [
      { name: 'Greetings', slug: 'greetings', icon: '👋' },
      { name: 'Travel', slug: 'travel', icon: '✈️' },
      { name: 'Business', slug: 'business', icon: '💼' },
      { name: 'Conversation', slug: 'conversation', icon: '💬' },
      { name: 'Grammar', slug: 'grammar', icon: '📝' },
    ],
  });

  // Seed achievements
  await prisma.achievement.createMany({
    data: [
      {
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        xpReward: 100,
        requirement: 1,
      },
      {
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        xpReward: 500,
        requirement: 7,
      },
      {
        title: 'Pronunciation Master',
        description: 'Score 90+ on 10 speaking exercises',
        icon: '🎤',
        xpReward: 1000,
        requirement: 10,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Step 4: Database Indexes (Performance)

Add to your Prisma schema:

```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  xp    Int    @default(0)

  @@index([xp(sort: Desc)]) // For leaderboards
  @@index([email]) // For auth lookups
}

model UserProgress {
  userId     String
  phraseId   String
  nextReview DateTime

  @@index([userId, nextReview]) // For spaced repetition
  @@index([userId, mastery]) // For progress tracking
}

model Phrase {
  levelId    String
  categoryId String

  @@index([levelId, categoryId]) // For filtered queries
}
```

---

## 🚀 BACKEND DEPLOYMENT

### Option 1: Railway (Recommended)

**Railway** offers easy PostgreSQL + Redis + Node.js hosting.

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Create Project

```bash
cd backend
railway init
```

#### Step 3: Add Services

```bash
# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis

# Deploy
railway up
```

#### Step 4: Configure Environment

In Railway dashboard:
1. Go to **Variables** tab
2. Paste all environment variables from `.env`
3. Railway auto-populates `DATABASE_URL` and `REDIS_URL`

#### Step 5: Run Migrations

```bash
railway run npx prisma migrate deploy
```

### Option 2: Heroku

```bash
# Login
heroku login

# Create app
heroku create aprendaingles-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
# ... (set all variables)

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### Option 3: AWS (EC2 + RDS + ElastiCache)

For high-scale production:

```bash
# 1. Launch EC2 instance (t3.medium or larger)
# 2. Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 3. Clone repository
git clone https://github.com/ToyKids2025/AprendaInglesGratis.git
cd AprendaInglesGratis/backend
npm ci --production

# 4. Setup PM2 ecosystem
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'aprendaingles-api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
    },
  ],
};
```

### Health Check Endpoint

Ensure your API has a health check endpoint:

```typescript
// backend/src/routes/health.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { getCacheService } from '../services/cache.service';

const router = Router();
const prisma = new PrismaClient();
const cache = getCacheService();

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'ok';
  } catch {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  try {
    await cache.set('health:check', 'ok', { ttl: 10 });
    health.checks.redis = 'ok';
  } catch {
    health.checks.redis = 'error';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

---

## 🎨 FRONTEND DEPLOYMENT

### Option 1: Vercel (Recommended for React)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
cd frontend
vercel --prod
```

#### Step 3: Configure in Vercel Dashboard

1. Go to **Project Settings** → **Environment Variables**
2. Add all variables from `.env.production`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`

#### Step 4: Configure Custom Domain

1. Go to **Domains** tab
2. Add your domain: `aprendaingles.com`
3. Configure DNS:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: A
Name: @
Value: 76.76.21.21
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://aprendaingles-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1234567890 --paths "/*"
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run tests
        run: |
          cd backend
          npm run test:ci

      - name: Lint
        run: |
          cd backend
          npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service backend

      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd backend
          npx prisma migrate deploy

      - name: Notify Sentry of deployment
        run: |
          curl -sL https://sentry.io/get-cli/ | bash
          sentry-cli releases new ${{ github.sha }}
          sentry-cli releases finalize ${{ github.sha }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Build
        run: |
          cd frontend
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_STRIPE_PUBLISHABLE_KEY: ${{ secrets.VITE_STRIPE_PUBLISHABLE_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Required GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions**:

```
RAILWAY_TOKEN
DATABASE_URL
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_API_URL
VITE_STRIPE_PUBLISHABLE_KEY
SENTRY_AUTH_TOKEN
```

---

## 📊 MONITORING & OBSERVABILITY

### 1. Sentry (Error Tracking)

#### Backend Setup

```typescript
// backend/src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
});

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

#### Frontend Setup

```typescript
// frontend/src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 2. Logging (Winston)

```typescript
// backend/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### 3. Performance Monitoring (New Relic / DataDog)

```bash
# Install New Relic
npm install newrelic

# Create newrelic.js in backend root
```

```javascript
// newrelic.js
exports.config = {
  app_name: ['AprendaIngles API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
  },
  distributed_tracing: {
    enabled: true,
  },
};
```

Add to `index.ts`:

```typescript
// MUST be first import
require('newrelic');
```

### 4. Uptime Monitoring (UptimeRobot / Pingdom)

Monitor these endpoints:

- `https://api.aprendaingles.com/health` (every 5 min)
- `https://aprendaingles.com` (every 5 min)

Alert channels:
- Email
- Slack webhook
- SMS (critical only)

---

## 📈 SCALING STRATEGY

### Horizontal Scaling

#### Backend (Node.js)

**Railway / Heroku**: Auto-scaling based on CPU/memory

```yaml
# railway.toml
[deploy]
  numReplicas = 3
  minReplicas = 2
  maxReplicas = 10

[scaling]
  minInstances = 2
  maxInstances = 10
  targetCPU = 70
  targetMemory = 80
```

**AWS**: Use Auto Scaling Groups

```bash
# Create Launch Template
aws ec2 create-launch-template \
  --launch-template-name aprendaingles-api \
  --version-description "v1.0.0"

# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name aprendaingles-asg \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:...
```

#### Database (PostgreSQL)

**Option 1: Read Replicas**

```typescript
// Prisma supports read replicas
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Write
    },
  },
});

// For read-heavy queries, use read replica
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL,
    },
  },
});
```

**Option 2: Connection Pooling (PgBouncer)**

```
# pgbouncer.ini
[databases]
aprendaingles = host=localhost port=5432 dbname=aprendaingles

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

### Vertical Scaling Thresholds

| Users | Backend | Database | Redis |
|-------|---------|----------|-------|
| 0-1K | 1x (2GB RAM) | db.t3.small | 256MB |
| 1K-10K | 2x (4GB RAM) | db.t3.medium | 1GB |
| 10K-100K | 5x (8GB RAM) | db.m5.large | 5GB |
| 100K+ | 10x+ (16GB RAM) | db.m5.xlarge+ | 10GB+ |

### Caching Strategy

**Layer 1 (In-Memory)**: 50MB per instance
**Layer 2 (Redis)**: 1-10GB shared
**Layer 3 (CDN)**: Cloudflare for static assets

```typescript
// High-traffic endpoints: aggressive caching
router.get('/api/categories', async (req, res) => {
  const categories = await cache.getOrSet(
    CacheKeys.ALL_CATEGORIES,
    async () => prisma.category.findMany(),
    { ttl: 86400 } // 24 hours
  );

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(categories);
});
```

---

## 🔒 SECURITY CHECKLIST

### Pre-Deployment Security Audit

- [ ] **Environment Variables**: All secrets in env vars (never in code)
- [ ] **HTTPS Only**: Force HTTPS with HSTS header
- [ ] **CORS**: Whitelist only production domains
- [ ] **Rate Limiting**: Enabled on all endpoints
- [ ] **Input Validation**: Zod schemas on all inputs
- [ ] **SQL Injection**: Prisma parameterized queries only
- [ ] **XSS Protection**: DOMPurify on frontend, helmet.js on backend
- [ ] **CSRF Protection**: CSRF tokens on all mutations
- [ ] **JWT Security**: Short expiry (15min), httpOnly cookies
- [ ] **Password Hashing**: bcrypt with salt rounds >= 12
- [ ] **File Uploads**: Validate file type, size, scan for malware
- [ ] **Dependency Audit**: Run `npm audit fix`
- [ ] **Security Headers**: helmet.js configured
- [ ] **Database Backups**: Automated daily backups
- [ ] **Secrets Rotation**: Rotate JWT secret every 90 days
- [ ] **2FA**: Optional 2FA for user accounts
- [ ] **API Key Rotation**: Rotate external API keys quarterly

### Security Headers

```typescript
// backend/src/index.ts
import helmet from 'helmet';

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
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. Database Connection Failed

```bash
# Check connection
psql $DATABASE_URL

# Verify SSL
# Most cloud providers require sslmode=require
DATABASE_URL="postgresql://...?sslmode=require"
```

#### 2. Redis Connection Timeout

```bash
# Test Redis connection
redis-cli -h your-host -p 6379 -a your-password ping

# Check firewall rules
# Ensure port 6379 is open

# Check TLS requirement
REDIS_TLS=true
```

#### 3. Prisma Migration Failed

```bash
# Reset database (⚠️ DESTRUCTIVE)
npx prisma migrate reset

# Force deploy (production)
npx prisma migrate deploy --force
```

#### 4. High Memory Usage

```bash
# Check Node.js heap size
node --max-old-space-size=4096 dist/index.js

# Enable garbage collection logging
node --expose-gc --trace-gc dist/index.js
```

#### 5. Slow API Response

```bash
# Check query performance
# Enable Prisma query logging
DATABASE_URL="...?log=query"

# Check Redis hit rate
redis-cli info stats
```

### Health Check Failures

```bash
# Backend health check
curl https://api.aprendaingles.com/health

# Expected response:
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "redis": "ok"
  }
}

# If degraded, check logs:
# Railway: railway logs
# Heroku: heroku logs --tail
# PM2: pm2 logs
```

---

## 📞 SUPPORT & MAINTENANCE

### Backup Strategy

**Database**: Daily automated backups
**User Files**: Replicated to 3 AWS regions
**Redis**: Not backed up (ephemeral cache)

### Disaster Recovery

**RTO (Recovery Time Objective)**: < 1 hour
**RPO (Recovery Point Objective)**: < 24 hours

```bash
# Restore database from backup
psql $DATABASE_URL < backup_2025_11_21.sql

# Re-deploy application
railway up --service backend
vercel --prod
```

### Maintenance Windows

**Scheduled**: Every Sunday 2-4 AM UTC
**Notification**: Email users 48 hours in advance

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] Run full test suite (`npm test`)
- [ ] Run linter (`npm run lint`)
- [ ] Audit dependencies (`npm audit`)
- [ ] Update version in `package.json`
- [ ] Tag release in git (`git tag v1.0.0`)
- [ ] Review environment variables
- [ ] Backup database
- [ ] Test in staging environment

### Deployment

- [ ] Deploy backend to Railway/Heroku
- [ ] Run database migrations
- [ ] Deploy frontend to Vercel
- [ ] Verify health checks pass
- [ ] Test critical user flows
- [ ] Monitor error rates in Sentry
- [ ] Check performance metrics

### Post-Deployment

- [ ] Announce in status page
- [ ] Monitor logs for 1 hour
- [ ] Verify analytics tracking
- [ ] Test payment processing
- [ ] Verify email delivery
- [ ] Check CDN cache hit rate
- [ ] Update documentation

---

## 📝 CHANGELOG

### v1.0.0 (2025-11-21)
- Initial production deployment
- All 11 core services implemented
- Multi-layer caching system
- Advanced pronunciation analysis
- Adaptive placement testing
- Gamification system
- Teacher marketplace
- Grammar correction AI
- Performance optimizations

---

**Need Help?**
📧 Email: dev@aprendaingles.com
📖 Docs: https://docs.aprendaingles.com
🐛 Issues: https://github.com/ToyKids2025/AprendaInglesGratis/issues
