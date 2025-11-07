# 🚀 Deployment Guide - English Flow

Complete guide for deploying English Flow to production using Vercel (frontend) and Railway (backend).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup (Supabase)](#database-setup-supabase)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] GitHub repository with your code
- [x] Vercel account ([vercel.com](https://vercel.com))
- [x] Railway account ([railway.app](https://railway.app))
- [x] Supabase account ([supabase.com](https://supabase.com))
- [x] OpenAI API key (optional, for AI features)

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name:** `english-flow`
   - **Database Password:** (generate strong password and save it)
   - **Region:** Choose closest to your users
4. Click "Create new project"

### 2. Get Database URL

1. Go to **Settings** → **Database**
2. Find **Connection string** → **URI**
3. Copy the connection string (replace `[YOUR-PASSWORD]` with your actual password)
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### 3. Run Migrations

Option A - Using local machine:
```bash
cd backend
export DATABASE_URL="your-supabase-connection-string"
npm run prisma:migrate
npm run prisma:seed
```

Option B - Using Prisma Data Platform (recommended):
1. Visit [cloud.prisma.io](https://cloud.prisma.io)
2. Create new project
3. Connect to Supabase database
4. Run migrations from the platform

---

## Backend Deployment (Railway)

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your `AprendaInglesGratis` repository
5. Select `backend` directory

### 2. Configure Environment Variables

In Railway project settings, add these environment variables:

```env
# Database (from Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# JWT Secrets (generate new ones!)
JWT_SECRET=your-super-secret-production-key-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-production-key-here-min-32-chars

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (will be updated after Vercel deployment)
FRONTEND_URL=https://english-flow.vercel.app

# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-api-key-here

# CORS (add your frontend domain)
ALLOWED_ORIGINS=https://english-flow.vercel.app
```

**Generate secure secrets:**
```bash
# Run these commands locally to generate secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
```

### 3. Configure Build & Start

Railway should auto-detect the configuration from `railway.json`, but verify:

- **Build Command:** `npm install && npm run prisma:generate && npm run build`
- **Start Command:** `npm run prisma:migrate && npm start`
- **Root Directory:** `/backend`

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Copy your Railway URL: `https://your-app.railway.app`

---

## Frontend Deployment (Vercel)

### 1. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 2. Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```env
# Backend API URL (from Railway)
VITE_API_URL=https://your-app.railway.app

# Environment
NODE_ENV=production
```

### 3. Configure Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `englishflow.com`)
3. Follow DNS configuration instructions

### 4. Deploy

1. Click "Deploy"
2. Wait for build (1-2 minutes)
3. Your app is live at `https://your-app.vercel.app`

---

## Post-Deployment

### 1. Update Backend CORS

Now that you have your Vercel URL, update Railway environment variables:

```env
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,https://www.your-custom-domain.com
```

**Redeploy backend** after updating.

### 2. Test the Application

Visit your Vercel URL and test:

- [x] User registration
- [x] User login
- [x] Dashboard loads
- [x] Lessons work
- [x] PWA installation
- [x] AI conversation (if OpenAI key configured)

### 3. Enable PWA

Users can install the app:
- **Desktop:** Click install icon in browser address bar
- **Mobile:** "Add to Home Screen" in browser menu

### 4. Monitor & Logs

**Railway (Backend):**
- View logs: Railway dashboard → your project → Logs
- Metrics: CPU, Memory, Network usage

**Vercel (Frontend):**
- View deployments: Vercel dashboard → your project
- Analytics: Enable in Settings → Analytics

---

## Troubleshooting

### Backend Issues

**Error: "Cannot connect to database"**
- Verify `DATABASE_URL` is correct
- Check Supabase project is running
- Ensure password doesn't contain special characters (URL encode if needed)

**Error: "Prisma Client not generated"**
- Ensure build command includes `npm run prisma:generate`
- Redeploy with proper build command

**Error: "CORS policy blocked"**
- Update `FRONTEND_URL` in Railway environment variables
- Ensure `ALLOWED_ORIGINS` includes your Vercel domain
- Redeploy backend

### Frontend Issues

**Error: "API request failed"**
- Check `VITE_API_URL` points to correct Railway URL
- Ensure Railway backend is running
- Check browser console for CORS errors

**Error: "Service Worker not registering"**
- Ensure app is served over HTTPS (Vercel does this automatically)
- Check `manifest.json` is accessible at `/manifest.json`
- Clear browser cache

**PWA not installing:**
- Verify `manifest.json` is properly configured
- Ensure all icons exist in `/public` folder
- Check HTTPS is enabled
- Use Chrome DevTools → Application → Manifest to debug

---

## Deployment Checklist

Before going live:

- [ ] Database migrated and seeded
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured correctly
- [ ] CORS configured for frontend domain
- [ ] OpenAI API key added (if using AI features)
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS working (automatic with Vercel)
- [ ] PWA installation working
- [ ] User registration/login tested
- [ ] All pages load correctly
- [ ] Mobile responsive (test on device)
- [ ] Error boundary working (test by breaking something)

---

## Cost Estimates (Free Tier)

**Monthly Costs:**

- **Vercel:** $0 (Hobby plan - 100GB bandwidth)
- **Railway:** $0 - $5 (500 hours free, then $5/month)
- **Supabase:** $0 (500MB database, 2GB bandwidth)
- **OpenAI:** ~$10-50 (usage-based, for AI features)

**Total:** $0-55/month to start

---

## Scaling Considerations

As you grow:

1. **Database:** Upgrade Supabase to Pro ($25/month) for more storage
2. **Backend:** Railway auto-scales, pay only for usage
3. **Frontend:** Upgrade Vercel to Pro ($20/month) for more bandwidth
4. **CDN:** Enable Vercel Edge Network for faster global access
5. **Monitoring:** Add Sentry for error tracking
6. **Analytics:** Enable Vercel Analytics or Google Analytics

---

## Next Steps

After deployment:

1. ✅ Test with beta users
2. ✅ Monitor errors and performance
3. ✅ Set up error tracking (Sentry)
4. ✅ Configure analytics
5. ✅ Set up CI/CD for automatic deployments
6. ✅ Create staging environment

---

## Support

Need help? Contact:
- **Email:** dev@englishflow.com
- **GitHub Issues:** [Create an issue](https://github.com/ToyKids2025/AprendaInglesGratis/issues)

---

**Made with ❤️ by English Flow Team**
