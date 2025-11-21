# 🏗️ ARQUITETURA TÉCNICA - AprendaInglesGratis

**Data**: 21/11/2025
**Versão**: 1.0
**Status**: Production-Ready Architecture

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Decisões Arquiteturais](#decisões-arquiteturais)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Camadas da Aplicação](#camadas-da-aplicação)
6. [Banco de Dados](#banco-de-dados)
7. [APIs e Integrações](#apis-e-integrações)
8. [Segurança](#segurança)
9. [Performance](#performance)
10. [Observabilidade](#observabilidade)
11. [Deploy e DevOps](#deploy-e-devops)

---

## 🎯 VISÃO GERAL

### Arquitetura Escolhida
**Monolito Modular com preparação para Microservices**

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (PWA)                    │
│          React + TypeScript + TailwindCSS            │
│              Vercel Edge Network (CDN)               │
└───────────────────┬─────────────────────────────────┘
                    │ HTTPS/WSS
                    │ REST + GraphQL (futuro)
┌───────────────────▼─────────────────────────────────┐
│                  API GATEWAY / LOAD BALANCER         │
│                  Nginx + Cloudflare                  │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┬──────────────┐
        │                       │              │
┌───────▼───────┐    ┌─────────▼──────┐  ┌───▼────┐
│   BACKEND     │    │   CACHE LAYER  │  │  CDN   │
│   (Node.js)   │◄───┤     (Redis)    │  │        │
│   Express +   │    │   Multi-tier   │  │ Static │
│   TypeScript  │    └────────────────┘  │ Assets │
└───────┬───────┘                        └────────┘
        │
┌───────▼───────────────────────────────────┐
│          DATABASE (PostgreSQL)             │
│       Primary + Read Replicas (futuro)     │
│           Supabase / Railway               │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│          EXTERNAL SERVICES                 │
│  • OpenAI (GPT-4)                          │
│  • ElevenLabs (TTS)                        │
│  • Stripe (Payments)                       │
│  • SendGrid (Email)                        │
│  • Zoom/Daily.co (Video)                   │
└────────────────────────────────────────────┘
```

### Por que Monolito Modular?

✅ **MVP rápido**: Time pequeno, deploy simples
✅ **Baixo custo**: Um único servidor inicialmente
✅ **Debugar fácil**: Tudo em um lugar
✅ **Refatorável**: Módulos podem virar microservices depois
❌ **Escalabilidade**: Bom até 100k usuários (depois split)

---

## 🤔 DECISÕES ARQUITETURAIS

### 1. Por que TypeScript (não JavaScript)?

**Decisão**: TypeScript em TODA a codebase (frontend + backend)

**Razões**:
- ✅ Type safety = menos bugs em produção
- ✅ IntelliSense = produtividade 3x
- ✅ Refatoração segura
- ✅ Documentação automática (tipos servem como docs)
- ✅ Comunidade + empresas grandes usam

**Trade-off**: Curva de aprendizado maior, build step extra
**Conclusão**: VALE A PENA para projeto sério

### 2. Por que Node.js (não Python/Go/Java)?

**Decisão**: Node.js + Express

**Razões**:
- ✅ JavaScript full-stack (time pequeno = mesma linguagem)
- ✅ Async I/O = perfeito para APIs intensivas
- ✅ NPM ecosystem gigante
- ✅ Deploy fácil (Vercel, Railway, Render)
- ✅ Comunidade massiva

**Alternativas consideradas**:
- ❌ Python (Django/FastAPI): Mais lento, ecosystem fragmentado
- ❌ Go: Curva maior, menos devs disponíveis
- ❌ Java/Kotlin: Overkill para MVP, deploy complexo

### 3. Por que PostgreSQL (não MongoDB/MySQL)?

**Decisão**: PostgreSQL

**Razões**:
- ✅ ACID compliant (dados críticos: pagamentos, progresso)
- ✅ Relações complexas (users, lessons, progress, achievements)
- ✅ JSON support (híbrido relacional + document)
- ✅ Full-text search nativo
- ✅ Supabase/Railway oferecem grátis

**Alternativas consideradas**:
- ❌ MongoDB: Sem transactions, relações complexas ruins
- ❌ MySQL: PostgreSQL é superior em tudo
- ❌ SQLite: Não escala multi-server

### 4. Por que Redis Cache (não Memcached)?

**Decisão**: Redis

**Razões**:
- ✅ Estruturas de dados ricas (Lists, Sets, Sorted Sets)
- ✅ Pub/Sub para real-time
- ✅ Persistence opcional
- ✅ Session storage
- ✅ Rate limiting
- ✅ Leaderboards nativos (ZADD)

### 5. Por que React (não Vue/Svelte/Angular)?

**Decisão**: React 18

**Razões**:
- ✅ Ecossistema gigante (libs para tudo)
- ✅ Contratação fácil (mais devs React)
- ✅ Server Components (futuro)
- ✅ React Native (app mobile depois)
- ✅ Meta mantém (estável)

**Alternativas consideradas**:
- ❌ Vue: Ecosystem menor
- ❌ Svelte: Novo demais, pouca lib
- ❌ Angular: Pesado demais

### 6. Por que Prisma ORM (não TypeORM/Sequelize)?

**Decisão**: Prisma

**Razões**:
- ✅ Type-safe queries
- ✅ Migrations automáticas
- ✅ Schema visual (Prisma Studio)
- ✅ Auto-completion perfeito
- ✅ Performance boa

### 7. Por que Zod Validation (não Joi/Yup)?

**Decisão**: Zod

**Razões**:
- ✅ TypeScript-first (inferência de tipos)
- ✅ Runtime + compile-time validation
- ✅ Compose schemas facilmente
- ✅ Error messages customizáveis

### 8. Por que PWA (não App Nativo)?

**Decisão**: PWA primeiro, app nativo depois

**Razões**:
- ✅ 1 codebase = iOS + Android + Web
- ✅ Deploy instantâneo (sem app store approval)
- ✅ Offline support
- ✅ Install no home screen
- ✅ Custo 10x menor

**Quando fazer nativo**: Após 10k usuários pagantes

---

## 🛠️ STACK TECNOLÓGICA COMPLETA

### BACKEND

```typescript
{
  "runtime": "Node.js 20 LTS",
  "language": "TypeScript 5.3",
  "framework": "Express 4.18",
  "orm": "Prisma 5.7",
  "validation": "Zod 3.22",
  "auth": "JWT + Passport",
  "testing": "Jest + Supertest",
  "docs": "Swagger/OpenAPI 3.0",
  "linting": "ESLint + Prettier",
  "monitoring": "Sentry + Winston",
  "cron": "node-cron"
}
```

### FRONTEND

```typescript
{
  "framework": "React 18",
  "language": "TypeScript 5.3",
  "build": "Vite 5.0",
  "styling": "TailwindCSS 3.4",
  "state": "Zustand + React Query",
  "routing": "React Router v6",
  "forms": "React Hook Form + Zod",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "testing": "Vitest + Testing Library",
  "pwa": "Workbox + Vite PWA Plugin"
}
```

### DATABASE & CACHE

```typescript
{
  "database": "PostgreSQL 16",
  "cache": "Redis 7.2",
  "search": "PostgreSQL Full-Text",
  "storage": "Cloudflare R2 / AWS S3"
}
```

### EXTERNAL APIS

```typescript
{
  "ai": "OpenAI GPT-4 Turbo",
  "tts": "ElevenLabs + Web Speech API",
  "stt": "Web Speech API + Deepgram",
  "payments": "Stripe",
  "email": "Resend / SendGrid",
  "sms": "Twilio (opcional)",
  "video": "Daily.co / Zoom",
  "analytics": "PostHog + Mixpanel",
  "monitoring": "Sentry + Better Stack"
}
```

### DEVOPS & INFRASTRUCTURE

```typescript
{
  "hosting": {
    "frontend": "Vercel Edge (CDN global)",
    "backend": "Railway / Render",
    "database": "Supabase / Railway",
    "cache": "Upstash Redis (serverless)"
  },
  "cdn": "Cloudflare",
  "ci_cd": "GitHub Actions",
  "monitoring": "Sentry + Better Stack",
  "logging": "Axiom / Papertrail",
  "secrets": "Doppler / Vercel Env"
}
```

---

## 📁 ESTRUTURA DE PASTAS

```
AprendaInglesGratis/
│
├── 📁 backend/                    # Node.js API
│   ├── src/
│   │   ├── controllers/           # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── lesson.controller.ts
│   │   │   ├── speaking.controller.ts
│   │   │   ├── listening.controller.ts
│   │   │   ├── placement.controller.ts
│   │   │   ├── teachers.controller.ts
│   │   │   └── gamification.controller.ts
│   │   │
│   │   ├── services/              # Business logic (CORE)
│   │   │   ├── cache.service.ts           # 356 linhas
│   │   │   ├── speaking.service.ts        # 733 linhas
│   │   │   ├── listening.service.ts       # 825 linhas
│   │   │   ├── placement.service.ts       # 661 linhas
│   │   │   ├── teachers.service.ts        # 705 linhas
│   │   │   ├── gamification.service.ts    # 734 linhas
│   │   │   ├── grammar.service.ts         # 714 linhas
│   │   │   ├── performance-patches.ts     # 548 linhas
│   │   │   ├── ai.service.ts              # OpenAI integration
│   │   │   ├── email.service.ts           # Email sending
│   │   │   └── payment.service.ts         # Stripe
│   │   │
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.middleware.ts         # JWT verification
│   │   │   ├── validation.middleware.ts   # 514 linhas
│   │   │   ├── error.middleware.ts        # Error handling
│   │   │   ├── rate-limit.middleware.ts   # DDoS protection
│   │   │   └── logging.middleware.ts      # Request logging
│   │   │
│   │   ├── utils/                 # Helpers
│   │   │   ├── query-optimizer.ts         # 519 linhas
│   │   │   ├── ux-helpers.ts              # 565 linhas
│   │   │   ├── logger.ts                  # Winston config
│   │   │   ├── validators.ts              # Zod schemas
│   │   │   └── helpers.ts                 # Misc utilities
│   │   │
│   │   ├── routes/                # API endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── lesson.routes.ts
│   │   │   ├── speaking.routes.ts
│   │   │   ├── listening.routes.ts
│   │   │   ├── placement.routes.ts
│   │   │   ├── teachers.routes.ts
│   │   │   ├── gamification.routes.ts
│   │   │   └── index.ts                   # Aggregate routes
│   │   │
│   │   ├── models/                # TypeScript types/interfaces
│   │   │   ├── user.model.ts
│   │   │   ├── lesson.model.ts
│   │   │   ├── progress.model.ts
│   │   │   └── achievement.model.ts
│   │   │
│   │   ├── config/                # Configuration
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── openai.config.ts
│   │   │   └── stripe.config.ts
│   │   │
│   │   ├── types/                 # Global TypeScript types
│   │   │   ├── express.d.ts
│   │   │   └── index.d.ts
│   │   │
│   │   ├── server.ts              # Express app entry
│   │   └── index.ts               # Server start
│   │
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── migrations/            # DB migrations
│   │   └── seed.ts                # Seed data
│   │
│   ├── tests/
│   │   ├── unit/                  # Unit tests
│   │   │   ├── services/
│   │   │   ├── controllers/
│   │   │   └── utils/
│   │   │
│   │   └── integration/           # Integration tests
│   │       ├── auth.test.ts
│   │       ├── lessons.test.ts
│   │       └── speaking.test.ts
│   │
│   ├── .env.example               # Environment variables template
│   ├── .eslintrc.json             # ESLint config
│   ├── .prettierrc                # Prettier config
│   ├── tsconfig.json              # TypeScript config
│   ├── jest.config.js             # Jest config
│   ├── package.json
│   └── README.md
│
├── 📁 frontend/                   # React PWA
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   │
│   │   │   ├── lessons/
│   │   │   │   ├── LessonCard.tsx
│   │   │   │   ├── PhrasePlayer.tsx
│   │   │   │   └── QuizComponent.tsx
│   │   │   │
│   │   │   ├── speaking/
│   │   │   │   ├── VoiceRecorder.tsx
│   │   │   │   ├── PronunciationFeedback.tsx
│   │   │   │   └── WaveformVisualizer.tsx
│   │   │   │
│   │   │   ├── gamification/
│   │   │   │   ├── XPBar.tsx
│   │   │   │   ├── BadgesList.tsx
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   └── StreakCounter.tsx
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Header.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Footer.tsx
│   │   │
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Lessons.tsx
│   │   │   ├── LessonDetail.tsx
│   │   │   ├── Speaking.tsx
│   │   │   ├── Listening.tsx
│   │   │   ├── PlacementTest.tsx
│   │   │   ├── Teachers.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── services/              # API clients
│   │   │   ├── api.ts             # Axios config
│   │   │   ├── auth.service.ts
│   │   │   ├── lesson.service.ts
│   │   │   ├── speaking.service.ts
│   │   │   ├── listening.service.ts
│   │   │   └── gamification.service.ts
│   │   │
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useMediaRecorder.ts
│   │   │   └── useWebSocket.ts
│   │   │
│   │   ├── store/                 # State management
│   │   │   ├── authStore.ts       # Zustand auth store
│   │   │   ├── lessonStore.ts
│   │   │   └── uiStore.ts
│   │   │
│   │   ├── utils/                 # Helper functions
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/                 # TypeScript types
│   │   │   ├── user.types.ts
│   │   │   ├── lesson.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── assets/                # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   ├── App.tsx                # Root component
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Global styles
│   │
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   ├── robots.txt
│   │   ├── favicon.ico
│   │   └── sw.js                  # Service Worker
│   │
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── 📁 docs/                       # Documentation
│   ├── COMPETITIVE_ANALYSIS.md    # ✅ Created
│   ├── ARCHITECTURE.md            # ✅ This file
│   ├── API_DOCUMENTATION.md       # Swagger/OpenAPI
│   ├── DEPLOYMENT_GUIDE.md        # Deploy instructions
│   ├── AUDIT_REPORT.md            # Quality audit
│   └── CONTRIBUTING.md            # Dev guidelines
│
├── 📁 scripts/                    # Automation scripts
│   ├── seed-database.ts           # Populate DB
│   ├── generate-phrases.ts        # AI phrase generation
│   └── backup.sh                  # DB backup
│
├── 📁 .github/
│   └── workflows/
│       ├── ci.yml                 # CI pipeline
│       ├── deploy-frontend.yml    # Auto-deploy Vercel
│       └── deploy-backend.yml     # Auto-deploy Railway
│
├── .gitignore
├── .env.example
├── package.json                   # Root package (workspaces)
├── README.md                      # Project overview
└── LICENSE
```

---

## 🏛️ CAMADAS DA APLICAÇÃO

### Arquitetura em Camadas (Clean Architecture)

```
┌──────────────────────────────────────────────┐
│            PRESENTATION LAYER                 │
│  (Controllers, Routes, Middleware)            │
│  • Recebe requests HTTP                       │
│  • Valida input (Zod)                         │
│  • Formata responses                          │
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│           BUSINESS LOGIC LAYER                │
│  (Services)                                   │
│  • Regras de negócio                          │
│  • Algoritmos complexos                       │
│  • Orquestração                               │
│  • NÃO sabe nada de HTTP                      │
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│          DATA ACCESS LAYER                    │
│  (Prisma, Redis)                              │
│  • Queries SQL                                │
│  • Cache management                           │
│  • Transações                                 │
└─────────────────┬────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────┐
│          DATABASE / EXTERNAL APIS             │
│  (PostgreSQL, OpenAI, Stripe, etc)            │
└───────────────────────────────────────────────┘
```

### Exemplo de Fluxo (Speaking Practice)

```typescript
// 1. PRESENTATION LAYER (Controller)
// backend/src/controllers/speaking.controller.ts
export async function analyzePronunciation(req: Request, res: Response) {
  const { audioBlob, phraseId } = validateSpeakingInput(req.body);

  const result = await speakingService.analyzePronunciation(
    req.user.id,
    phraseId,
    audioBlob
  );

  return res.json({ success: true, data: result });
}

// 2. BUSINESS LOGIC LAYER (Service)
// backend/src/services/speaking.service.ts
export async function analyzePronunciation(
  userId: string,
  phraseId: string,
  audioBlob: Buffer
) {
  // 1. Busca frase original
  const phrase = await getPhrase(phraseId);

  // 2. Converte áudio para texto (STT)
  const transcription = await speechToText(audioBlob);

  // 3. Analisa fonética
  const phoneticScore = analyzePhonetics(
    phrase.text,
    transcription
  );

  // 4. Gera feedback com IA
  const feedback = await generateFeedback(phrase, phoneticScore);

  // 5. Salva progresso
  await updateUserProgress(userId, phraseId, phoneticScore);

  // 6. Atualiza gamificação
  await gamificationService.addXP(userId, phoneticScore * 10);

  return { score: phoneticScore, feedback, transcription };
}

// 3. DATA ACCESS LAYER (Prisma)
async function getPhrase(phraseId: string) {
  return prisma.phrase.findUnique({
    where: { id: phraseId },
    include: { audio: true }
  });
}
```

---

## 🗄️ BANCO DE DADOS

### Schema Prisma (Resumido)

```prisma
// prisma/schema.prisma

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  passwordHash  String
  role          Role     @default(STUDENT)

  // Profile
  level         Int      @default(1)
  xp            Int      @default(0)
  streak        Int      @default(0)
  lastActive    DateTime @default(now())

  // Relations
  progress      UserProgress[]
  achievements  UserAchievement[]
  subscriptions Subscription[]
  sessions      Session[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
  @@map("users")
}

model Phrase {
  id            String   @id @default(cuid())

  // Content
  english       String
  portuguese    String
  tip           String?
  context       String?

  // Metadata
  level         Level    @relation(fields: [levelId], references: [id])
  levelId       String
  category      Category @relation(fields: [categoryId], references: [id])
  categoryId    String

  difficulty    Difficulty @default(EASY)
  tags          String[]

  // Audio
  audioUrl      String?
  audioAccent   Accent   @default(US)

  // Progress tracking
  progress      UserProgress[]

  createdAt     DateTime @default(now())

  @@index([levelId, categoryId])
  @@index([difficulty])
  @@map("phrases")
}

model UserProgress {
  id            String   @id @default(cuid())

  user          User     @relation(fields: [userId], references: [id])
  userId        String
  phrase        Phrase   @relation(fields: [phraseId], references: [id])
  phraseId      String

  // Mastery (0-5)
  mastery       Int      @default(0)

  // Speaking scores
  pronunciationScore Float?
  fluencyScore       Float?

  // Listening scores
  listeningScore     Float?
  comprehensionScore Float?

  // Spaced Repetition
  nextReview    DateTime?
  reviewCount   Int      @default(0)
  easeFactor    Float    @default(2.5)
  interval      Int      @default(1)

  lastPracticed DateTime @default(now())
  createdAt     DateTime @default(now())

  @@unique([userId, phraseId])
  @@index([userId, nextReview])
  @@map("user_progress")
}

model Achievement {
  id            String   @id @default(cuid())

  // Info
  name          String
  description   String
  icon          String
  rarity        Rarity   @default(COMMON)

  // Requirements
  type          AchievementType
  requiredValue Int
  xpReward      Int

  // Relations
  users         UserAchievement[]

  @@map("achievements")
}

model Subscription {
  id            String   @id @default(cuid())

  user          User     @relation(fields: [userId], references: [id])
  userId        String

  plan          Plan     @default(FREE)
  status        SubscriptionStatus @default(ACTIVE)

  // Stripe
  stripeCustomerId      String?
  stripeSubscriptionId  String?

  // Billing
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  cancelAtPeriodEnd     Boolean  @default(false)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@map("subscriptions")
}

// Enums
enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum Plan {
  FREE
  MONTHLY
  ANNUAL
  LIFETIME
}
```

### Índices e Performance

```sql
-- Queries mais comuns:
-- 1. Buscar progresso do usuário
CREATE INDEX idx_user_progress_user_review ON user_progress(userId, nextReview);

-- 2. Buscar frases por nível
CREATE INDEX idx_phrases_level_category ON phrases(levelId, categoryId);

-- 3. Leaderboard global
CREATE INDEX idx_users_xp ON users(xp DESC);

-- 4. Streak ativo
CREATE INDEX idx_users_streak ON users(streak DESC, lastActive);
```

---

## 🔌 APIS E INTEGRAÇÕES

### OpenAI (IA Conversacional)

```typescript
// backend/src/services/ai.service.ts

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateConversation(
  userMessage: string,
  userLevel: string,
  context: string[]
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an English teacher for ${userLevel} students.
                  Respond naturally, correct mistakes gently, and adapt to their level.`
      },
      ...context.map(msg => ({ role: 'user', content: msg })),
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 300
  });

  return completion.choices[0].message.content;
}
```

### Stripe (Pagamentos)

```typescript
// backend/src/services/payment.service.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createSubscription(
  userId: string,
  plan: 'monthly' | 'annual'
) {
  const user = await getUserWithStripeId(userId);

  // Criar customer se não existe
  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId }
    });

    await updateUserStripeId(userId, customer.id);
    user.stripeCustomerId = customer.id;
  }

  // Criar subscription
  const subscription = await stripe.subscriptions.create({
    customer: user.stripeCustomerId,
    items: [{ price: PRICE_IDS[plan] }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });

  return subscription;
}
```

---

## 🔒 SEGURANÇA

### Camadas de Segurança

```typescript
// 1. HTTPS Only (Vercel + Railway fazem isso)

// 2. CORS Restrito
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// 3. Helmet (Headers de segurança)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 4. Rate Limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);

// 5. SQL Injection Protection
// Prisma já protege automaticamente

// 6. XSS Protection
import xss from 'xss-clean';
app.use(xss());

// 7. JWT Seguro
import jwt from 'jsonwebtoken';

const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '15m', algorithm: 'HS256' }
);

// 8. Password Hashing
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 12); // 12 rounds
```

### OWASP Top 10 Compliance

| Vulnerability | Protection | Implementation |
|---------------|------------|----------------|
| **Injection** | ✅ Prisma ORM | Parameterized queries |
| **Auth** | ✅ JWT + Refresh | `auth.middleware.ts` |
| **XSS** | ✅ xss-clean | Middleware |
| **CSRF** | ✅ CORS + SameSite | Cookie config |
| **Security Misconfiguration** | ✅ Helmet | Security headers |
| **Sensitive Data** | ✅ Env vars | Doppler/Vercel |
| **Insufficient Logging** | ✅ Winston + Sentry | `logger.ts` |
| **Insecure Deserialization** | ✅ Zod validation | Input validation |
| **Known Vulnerabilities** | ✅ Dependabot | GitHub Security |
| **Insufficient Monitoring** | ✅ Sentry + Logs | Real-time alerts |

---

## ⚡ PERFORMANCE

### Otimizações Implementadas

#### 1. Cache em Múltiplas Camadas

```typescript
// Layer 1: In-Memory (Node)
const cache = new Map();

// Layer 2: Redis (Shared)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Layer 3: Database Query Cache
// Prisma já faz isso automaticamente

// Exemplo de uso:
async function getPhrase(id: string) {
  // 1. Check memory
  if (cache.has(id)) return cache.get(id);

  // 2. Check Redis
  const cached = await redis.get(`phrase:${id}`);
  if (cached) {
    const phrase = JSON.parse(cached);
    cache.set(id, phrase); // Store in memory too
    return phrase;
  }

  // 3. Query database
  const phrase = await prisma.phrase.findUnique({ where: { id } });

  // Store in cache
  await redis.setex(`phrase:${id}`, 3600, JSON.stringify(phrase));
  cache.set(id, phrase);

  return phrase;
}
```

#### 2. Database Query Optimization

```typescript
// ❌ BAD: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const progress = await prisma.userProgress.findMany({
    where: { userId: user.id }
  });
}

// ✅ GOOD: 1 query com include
const users = await prisma.user.findMany({
  include: {
    progress: {
      where: { mastery: { gte: 3 } }
    }
  }
});
```

#### 3. Pagination & Cursor-based

```typescript
// Cursor-based pagination (escala melhor)
async function getLessons(cursor?: string, limit = 20) {
  return prisma.phrase.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' }
  });
}
```

#### 4. Background Jobs

```typescript
// Tarefas pesadas rodam em background
import Bull from 'bull';

const emailQueue = new Bull('email', process.env.REDIS_URL);

emailQueue.process(async (job) => {
  await sendEmail(job.data.to, job.data.template);
});

// Adicionar na fila (não bloqueia request)
await emailQueue.add({ to: user.email, template: 'welcome' });
```

---

## 📊 OBSERVABILIDADE

### Logging

```typescript
// backend/src/utils/logger.ts

import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Uso:
logger.info('User registered', { userId: user.id, email: user.email });
logger.error('Payment failed', { error, userId, amount });
```

### Monitoring (Sentry)

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1 // 10% das requests
});

// Error tracking automático
app.use(Sentry.Handlers.errorHandler());
```

### Métricas (PostHog)

```typescript
// Tracking de eventos
posthog.capture({
  distinctId: userId,
  event: 'lesson_completed',
  properties: {
    lessonId,
    score,
    timeSpent,
    level: user.level
  }
});
```

---

## 🚀 DEPLOY E DEVOPS

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Check coverage
        run: npm run coverage

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

### Ambientes

| Ambiente | URL | Deploy | DB | Cache |
|----------|-----|--------|----|----- -|
| **Development** | localhost:5173 | Manual | Local PG | Local Redis |
| **Staging** | staging.aprendaingles.com | Auto (develop branch) | Supabase | Upstash |
| **Production** | app.aprendaingles.com | Auto (main branch) | Supabase | Upstash |

---

## 📝 DECISÕES PENDENTES

### A Decidir no Futuro

1. **GraphQL vs REST?**
   - Atual: REST (mais simples)
   - Futuro: GraphQL se mobile app precisar

2. **Microservices?**
   - Atual: Monolito modular
   - Quando: 100k+ usuários ativos

3. **Real-time (WebSockets)?**
   - Atual: Polling
   - Futuro: Socket.io para chat ao vivo

4. **Mobile App Nativo?**
   - Atual: PWA
   - Quando: 10k+ usuários pagantes

---

**Última atualização**: 21/11/2025
**Responsável**: Equipe de Engenharia
**Status**: ✅ Production-Ready

