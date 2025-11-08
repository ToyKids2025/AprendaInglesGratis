# Deployment Guide - English Flow

Complete guide for deploying English Flow to production.

**Stack:**
- **Frontend:** Vercel (free tier)
- **Backend:** Railway (free tier)
- **Database:** Supabase PostgreSQL (free tier)
- **Payments:** Stripe
- **Email:** SendGrid / AWS SES
- **AI:** OpenAI API

**Total Cost:** R$ 0-200/month (starts at R$ 0)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Environment Variables](#environment-variables)
6. [Third-Party Services](#third-party-services)
7. [Domain Setup](#domain-setup)
8. [Post-Deployment](#post-deployment)
9. [Monitoring](#monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] GitHub account
- [x] Vercel account (free)
- [x] Railway account (free)
- [x] Supabase account (free)
- [x] Stripe account
- [x] OpenAI API key
- [x] SendGrid account (or AWS SES)
- [x] Domain name (optional but recommended)

**Accounts to create:**
1. **Vercel:** https://vercel.com/signup
2. **Railway:** https://railway.app/
3. **Supabase:** https://supabase.com/
4. **Stripe:** https://stripe.com/ (enable test mode initially)
5. **OpenAI:** https://platform.openai.com/
6. **SendGrid:** https://sendgrid.com/

---

## Database Setup (Supabase)

### Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - https://app.supabase.com/

2. **Create New Project**
   - Name: `englishflow-production`
   - Database Password: Generate strong password
   - Region: Choose closest to your users (e.g., `South America (São Paulo)`)
   - Click "Create new project"

3. **Wait for provisioning** (2-3 minutes)

### Step 2: Get Database Connection String

1. **Go to Project Settings → Database**
2. **Copy Connection String** (URI format)
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
3. **Replace `[YOUR-PASSWORD]`** with your actual password
4. **Add `?pgbouncer=true`** for connection pooling:
   ```
   postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?pgbouncer=true
   ```

**Save this connection string** - you'll need it for Railway.

### Step 3: Configure Database

Supabase is now ready! We'll run migrations from Railway after backend deployment.

**Free Tier Limits:**
- 500 MB database storage
- 2 GB bandwidth
- 50,000 monthly active users
- Automatic backups

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. **Go to Railway Dashboard**
   - https://railway.app/dashboard

2. **New Project → Deploy from GitHub repo**
   - Authorize Railway to access your GitHub
   - Select repository: `ToyKids2025/AprendaInglesGratis`
   - Select branch: `main`

3. **Configure Service**
   - Root directory: `backend`
   - Build command: `npm run build`
   - Start command: `npm start`

### Step 2: Add Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?pgbouncer=true

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secure-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Server
NODE_ENV=production
PORT=3001

# Frontend URL (will be updated after Vercel deployment)
FRONTEND_URL=https://englishflow.vercel.app

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# Email (SendGrid example)
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@englishflow.com
SENDGRID_API_KEY=SG.xxx

# Admin Email (for notifications)
ADMIN_EMAIL=admin@englishflow.com
```

**Generate Secrets:**
```bash
# On your local machine
openssl rand -base64 32
# Copy output for JWT_SECRET

openssl rand -base64 32
# Copy output for JWT_REFRESH_SECRET
```

### Step 3: Deploy

Railway will automatically deploy when you push to main branch.

**First deployment:**
1. Railway detects changes and starts build
2. Installs dependencies (`npm install`)
3. Runs build (`npm run build`)
4. Starts server (`npm start`)

**Get your backend URL:**
- Go to Railway dashboard → Settings → Domains
- Click "Generate Domain"
- You'll get: `https://your-app.railway.app`
- **Save this URL** - you'll need it for frontend

### Step 4: Run Database Migrations

After first deployment:

1. **Open Railway Shell**
   - In Railway dashboard, click on your service
   - Click "..." menu → "Shell"

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed database:**
   ```bash
   npx prisma db seed
   ```

4. **Verify:**
   ```bash
   npx prisma studio
   ```
   - Opens Prisma Studio to view data

### Step 5: Test Backend

```bash
# Health check
curl https://your-app.railway.app/health

# Should return:
# {"status":"ok","timestamp":"2024-11-08T..."}
```

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Add New Project → Import Git Repository**
   - Select repository: `ToyKids2025/AprendaInglesGratis`
   - Select branch: `main`

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 2: Add Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables**:

```bash
# Backend API URL (from Railway)
VITE_API_URL=https://your-app.railway.app

# Public keys (optional)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### Step 3: Deploy

Vercel automatically deploys on push to main.

**Deployment URL:**
- Production: `https://englishflow.vercel.app`
- Or custom domain: `https://www.englishflow.com`

### Step 4: Update Backend CORS

Go back to Railway and update `FRONTEND_URL`:

```bash
FRONTEND_URL=https://englishflow.vercel.app
```

Or if using custom domain:
```bash
FRONTEND_URL=https://www.englishflow.com
```

**Redeploy backend** for changes to take effect.

---

## Environment Variables

### Complete Environment Variable List

#### Backend (.env)

```bash
# ====================================
# DATABASE
# ====================================
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres?pgbouncer=true"

# ====================================
# JWT
# ====================================
JWT_SECRET="your-super-secure-secret-min-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters"

# ====================================
# SERVER
# ====================================
NODE_ENV="production"
PORT="3001"
FRONTEND_URL="https://englishflow.vercel.app"

# ====================================
# OPENAI
# ====================================
OPENAI_API_KEY="sk-..."

# ====================================
# STRIPE
# ====================================
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."

# ====================================
# EMAIL
# ====================================
EMAIL_PROVIDER="sendgrid"
EMAIL_FROM="noreply@englishflow.com"
EMAIL_FROM_NAME="English Flow"

# SendGrid
SENDGRID_API_KEY="SG.xxx"

# OR AWS SES
# AWS_REGION="us-east-1"
# AWS_ACCESS_KEY_ID="xxx"
# AWS_SECRET_ACCESS_KEY="xxx"

# OR Gmail (dev only)
# GMAIL_USER="your-email@gmail.com"
# GMAIL_PASS="your-app-password"

# ====================================
# ADMIN
# ====================================
ADMIN_EMAIL="admin@englishflow.com"
```

#### Frontend (.env)

```bash
# Backend API URL
VITE_API_URL="https://your-app.railway.app"

# Stripe Public Key (optional, for client-side)
VITE_STRIPE_PUBLIC_KEY="pk_live_..."
```

---

## Third-Party Services

### OpenAI Setup

1. **Create API Key**
   - Go to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name: `English Flow Production`
   - Copy key (starts with `sk-`)

2. **Add Credits**
   - Go to Billing → Add payment method
   - Add at least $10 for testing

3. **Set Usage Limits**
   - Go to Billing → Usage limits
   - Set monthly limit: $50 (adjust as needed)

**Costs:**
- GPT-4 Turbo: ~$0.01 per conversation
- Phrase generation: ~$0.10 per 50 phrases

---

### Stripe Setup

#### 1. Create Product and Prices

**In Stripe Dashboard:**

1. **Products → Add Product**
   - Name: `English Flow Premium`
   - Description: `Premium subscription for English Flow`

2. **Add Monthly Price**
   - Price: R$ 39.90 (or $9.99 USD)
   - Billing period: Monthly
   - Copy Price ID: `price_xxx` → use for `STRIPE_PRICE_MONTHLY`

3. **Add Yearly Price**
   - Price: R$ 399.00 (or $99.99 USD)
   - Billing period: Yearly
   - Copy Price ID: `price_yyy` → use for `STRIPE_PRICE_YEARLY`

#### 2. Setup Webhook

1. **Developers → Webhooks → Add endpoint**
   - Endpoint URL: `https://your-app.railway.app/api/payments/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`

2. **Get Webhook Secret**
   - Click on webhook endpoint
   - Copy "Signing secret": `whsec_xxx`
   - Add to Railway: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

#### 3. Enable Payment Methods

**Settings → Payment methods:**
- [x] Cards (Visa, Mastercard, Amex)
- [x] Boleto (for Brazil)
- [x] Pix (for Brazil)

#### 4. Test Mode vs Live Mode

**Start in Test Mode:**
- Use test keys: `pk_test_...` and `sk_test_...`
- Use test cards: https://stripe.com/docs/testing

**Switch to Live Mode:**
- Complete Stripe activation
- Update keys to live keys
- Test with real payment (then refund)

---

### Email Setup (SendGrid)

1. **Create Account**
   - https://sendgrid.com/
   - Free tier: 100 emails/day

2. **Verify Sender Identity**
   - Settings → Sender Authentication
   - Verify email: `noreply@englishflow.com`
   - Or verify domain: `englishflow.com`

3. **Create API Key**
   - Settings → API Keys → Create API Key
   - Name: `English Flow Production`
   - Permissions: Full Access
   - Copy key: `SG.xxx`

4. **Add to Railway**
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxx
   EMAIL_FROM=noreply@englishflow.com
   ```

**Alternative: AWS SES**
- Cheaper for high volume
- 62,000 free emails/month (if hosted on AWS)
- Requires domain verification

---

## Domain Setup

### Step 1: Purchase Domain

Recommended registrars:
- Registro.br (Brazil): ~R$ 40/year for `.com.br`
- Namecheap: ~$10/year for `.com`
- Google Domains: ~$12/year for `.com`

### Step 2: Configure DNS

**A) Using Vercel (recommended for frontend)**

1. **Add domain in Vercel:**
   - Project → Settings → Domains
   - Add domain: `www.englishflow.com`
   - Add domain: `englishflow.com`

2. **Update DNS records** (at your registrar):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **Wait for DNS propagation** (up to 48h, usually <1h)

**B) Custom domain for backend** (optional)

1. **In Railway:**
   - Settings → Domains → Custom Domain
   - Add: `api.englishflow.com`

2. **Update DNS:**
   ```
   Type: CNAME
   Name: api
   Value: your-app.railway.app
   ```

3. **Update VITE_API_URL** in Vercel:
   ```bash
   VITE_API_URL=https://api.englishflow.com
   ```

### Step 3: SSL Certificates

Both Vercel and Railway automatically provide SSL certificates.

**Verify HTTPS:**
- Frontend: https://www.englishflow.com
- Backend: https://api.englishflow.com

---

## Post-Deployment

### 1. Create Admin User

**Option A: Using Prisma Studio**

1. Open Railway Shell
2. Run: `npx prisma studio`
3. Open Users table
4. Find your user
5. Set `isAdmin: true`

**Option B: Using SQL**

```bash
# In Railway Shell
npx prisma db execute --stdin <<EOF
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
EOF
```

### 2. Test All Features

**Frontend:**
- [x] Registration works
- [x] Login works
- [x] Lessons load
- [x] AI conversation works
- [x] Payment flow works
- [x] Email notifications received

**Backend:**
- [x] Health check: `/health`
- [x] Auth endpoints work
- [x] Database queries work
- [x] Email sending works
- [x] Stripe webhooks work

**Use this checklist:**

```bash
# Health check
curl https://api.englishflow.com/health

# Register user
curl -X POST https://api.englishflow.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test12345","name":"Test User"}'

# Login
curl -X POST https://api.englishflow.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test12345"}'
```

### 3. Configure Monitoring

**Vercel Analytics (free):**
- Vercel Dashboard → Analytics → Enable
- Tracks page views, performance, Web Vitals

**Railway Monitoring:**
- Railway Dashboard → Metrics
- Shows CPU, memory, network usage

**Sentry (optional, for error tracking):**
1. Create account: https://sentry.io/
2. Add Sentry SDK to backend and frontend
3. Track errors in production

### 4. Setup Backups

**Supabase automatic backups:**
- Free tier: Daily backups, 7-day retention
- Paid tier: Point-in-time recovery

**Manual backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20241108.sql
```

---

## Monitoring

### Key Metrics to Monitor

**Performance:**
- Response times (target: <500ms)
- Error rates (target: <1%)
- Uptime (target: 99.9%)

**Business:**
- New signups per day
- Conversion rate (free → premium)
- Active users (DAU/MAU)
- Churn rate

**Infrastructure:**
- Database size (Supabase: 500 MB limit)
- Bandwidth usage
- API costs (OpenAI)
- Email sending volume

### Tools

**Free monitoring:**
1. **UptimeRobot** - https://uptimerobot.com/
   - Monitor uptime
   - 50 monitors free
   - Email/SMS alerts

2. **Vercel Analytics**
   - Built-in, free
   - Web Vitals, traffic

3. **Railway Metrics**
   - Built-in
   - CPU, RAM, network

**Paid monitoring (optional):**
1. **DataDog** - Full observability
2. **New Relic** - APM
3. **Sentry** - Error tracking

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `Can't reach database server`

**Solutions:**
- Check DATABASE_URL is correct
- Ensure `?pgbouncer=true` is appended
- Verify Supabase project is running
- Check Railway has internet access

**Test connection:**
```bash
# In Railway Shell
npx prisma db execute --stdin <<EOF
SELECT NOW();
EOF
```

---

#### 2. CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solutions:**
- Check FRONTEND_URL in Railway matches Vercel URL
- Ensure no trailing slash: `https://app.com` not `https://app.com/`
- Redeploy backend after changing FRONTEND_URL

**Check CORS config in server.ts:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))
```

---

#### 3. Stripe Webhook Fails

**Error:** `Invalid signature`

**Solutions:**
- Check STRIPE_WEBHOOK_SECRET matches Stripe dashboard
- Ensure webhook URL is correct: `https://api.../api/payments/webhook`
- Check webhook events include all required events
- Use Stripe CLI to test locally:
  ```bash
  stripe listen --forward-to localhost:3001/api/payments/webhook
  ```

**Test webhook:**
```bash
stripe trigger checkout.session.completed
```

---

#### 4. Email Not Sending

**Error:** `Failed to send email`

**Solutions:**
- Check EMAIL_PROVIDER is set correctly
- Verify API keys (SENDGRID_API_KEY)
- Ensure sender email is verified
- Check spam folder
- View SendGrid activity log

**Test email:**
```bash
# In Railway Shell
curl -X POST https://api.englishflow.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"your-email@example.com","subject":"Test","message":"Testing email"}'
```

---

#### 5. Build Failures

**Frontend build fails:**
```bash
# Check build logs in Vercel
# Common issues:
- TypeScript errors
- Missing environment variables
- Import errors

# Fix:
- Run `npm run build` locally
- Check for TypeScript errors: `npm run type-check`
- Ensure VITE_API_URL is set in Vercel
```

**Backend build fails:**
```bash
# Check build logs in Railway
# Common issues:
- Prisma client not generated
- TypeScript compilation errors
- Missing dependencies

# Fix:
- Ensure postinstall script runs: "prisma generate"
- Check package.json has all dependencies
- Run `npm run build` locally
```

---

#### 6. Migration Failures

**Error:** `Migration failed`

**Solutions:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create new migration
npx prisma migrate dev --name fix_schema

# Deploy migration
npx prisma migrate deploy

# If migrations are out of sync:
npx prisma migrate resolve --applied "20241108_migration_name"
```

---

## Rollback Procedure

If deployment breaks production:

### 1. Quick Rollback (Vercel)

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### 2. Quick Rollback (Railway)

1. Railway Dashboard → Deployments
2. Click on previous deployment
3. Click "Redeploy"

### 3. Fix and Redeploy

```bash
# On local machine
git revert HEAD
git push origin main

# Or reset to previous commit
git reset --hard <previous-commit-hash>
git push --force origin main
```

---

## Production Checklist

Before going live:

### Security
- [ ] All secrets are secure (not in git)
- [ ] JWT secrets are strong (32+ chars)
- [ ] Database password is strong
- [ ] Stripe live keys (not test keys)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers enabled

### Performance
- [ ] Database indexes created
- [ ] Caching enabled
- [ ] Images optimized
- [ ] Code minified/compressed
- [ ] CDN configured (Vercel automatic)

### Functionality
- [ ] Registration works
- [ ] Login works
- [ ] Password reset works
- [ ] Lessons load correctly
- [ ] AI conversation works
- [ ] Payment flow works
- [ ] Email notifications work
- [ ] Admin panel works

### Monitoring
- [ ] Uptime monitoring configured
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Backup strategy defined

### Legal
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] LGPD compliance checked (Brazil)
- [ ] Cookie consent implemented

### Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Deployment guide updated
- [ ] Support email configured

---

## Cost Estimates

### Free Tier (0-100 users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | R$ 0 |
| Railway | Starter | R$ 0 ($5 credit) |
| Supabase | Free | R$ 0 |
| OpenAI | Pay-as-you-go | ~R$ 50/mo |
| SendGrid | Free | R$ 0 |
| **Total** | | **~R$ 50/mo** |

### Growing (100-1,000 users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | R$ 100/mo |
| Railway | Developer | R$ 50/mo |
| Supabase | Pro | R$ 125/mo |
| OpenAI | Pay-as-you-go | ~R$ 200/mo |
| SendGrid | Essentials | R$ 75/mo |
| **Total** | | **~R$ 550/mo** |

### Scale (1,000+ users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | R$ 100/mo |
| Railway | Team | R$ 100/mo |
| Supabase | Pro | R$ 125/mo |
| OpenAI | Pay-as-you-go | ~R$ 500/mo |
| SendGrid | Pro | R$ 450/mo |
| **Total** | | **~R$ 1,275/mo** |

---

## Support

**Need help with deployment?**
- Email: dev@englishflow.com
- GitHub Issues: https://github.com/ToyKids2025/AprendaInglesGratis/issues
- Documentation: https://docs.englishflow.com

---

**Last Updated:** November 2024
**Maintainer:** English Flow Team

**Happy deploying! 🚀**
