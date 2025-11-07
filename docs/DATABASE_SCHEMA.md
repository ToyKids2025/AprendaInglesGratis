# 🗄️ Database Schema - English Flow

## 📋 Visão Geral

**Database:** PostgreSQL 15+
**ORM:** Prisma
**Hosting:** Supabase (tier grátis)
**Tabelas:** 12

---

## 📊 Diagrama ER

```
┌─────────────┐
│    users    │──┐
└─────────────┘  │
       │         │
       ├─────────┼─────► user_progress
       │         │
       ├─────────┼─────► user_achievements
       │         │
       ├─────────┼─────► ai_conversations
       │         │
       └─────────┼─────► payments
                 │
┌─────────────┐  │
│   levels    │──┼─────► categories ─────► phrases
└─────────────┘  │
                 │
┌─────────────┐  │
│achievements │──┼─────► user_achievements
└─────────────┘  │
                 │
┌─────────────┐  │
│refresh_tokens│◄┘
└─────────────┘
```

---

## 🔑 Tabela: users

Usuários registrados na plataforma.

```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  name              String?
  avatar            String?

  // Gamificação
  xp                Int      @default(0)
  level             Int      @default(1)
  streak            Int      @default(0)
  lastStudyDate     DateTime?

  // Premium
  isPremium         Boolean  @default(false)
  premiumExpiresAt  DateTime?

  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relações
  refreshTokens     RefreshToken[]
  progress          UserProgress[]
  achievements      UserAchievement[]
  conversations     AIConversation[]
  payments          Payment[]
}
```

**Índices:**
- `email` (unique)
- `xp` (para ranking)
- `isPremium`

---

## 🔄 Tabela: refresh_tokens

Tokens JWT para refresh.

```prisma
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

**Expiração:** 7 dias
**Limpeza:** Cronjob automático remove tokens expirados

---

## 📚 Tabela: levels

5 níveis de aprendizado.

```prisma
model Level {
  id          Int        @id @default(autoincrement())
  number      Int        @unique
  name        String     // "Survival", "Tourist", etc
  description String
  minXP       Int        // XP mínimo para desbloquear
  color       String     // Hex color
  icon        String     // Emoji ou URL

  categories  Category[]

  @@index([number])
}
```

**Dados:**
1. **Survival** (0 XP) - Sobrevivência básica
2. **Tourist** (1000 XP) - Viagens e turismo
3. **Conversational** (5000 XP) - Conversação casual
4. **Professional** (15000 XP) - Negócios
5. **Fluent** (30000 XP) - Fluência avançada

---

## 🗂️ Tabela: categories

Categorias de lições.

```prisma
model Category {
  id          Int      @id @default(autoincrement())
  levelId     Int
  name        String
  slug        String   @unique
  description String
  icon        String   // Emoji
  order       Int      // Ordem de exibição

  level       Level    @relation(fields: [levelId], references: [id])
  phrases     Phrase[]

  @@index([levelId])
  @@index([slug])
}
```

**Exemplo Level 1:**
- greetings (👋 Greetings)
- restaurant (🍽️ Restaurant)
- airport (✈️ Airport)
- hotel (🏨 Hotel)
- shopping (🛍️ Shopping)

---

## 💬 Tabela: phrases

5.000+ frases de inglês.

```prisma
model Phrase {
  id          Int      @id @default(autoincrement())
  categoryId  Int

  // Conteúdo
  en          String   // Frase em inglês
  pt          String   // Tradução português
  tip         String?  // Dica de uso

  // Áudio
  audioUrl    String?  // URL do áudio (TTS)

  // Dificuldade
  difficulty  Int      @default(1) // 1-5

  // Metadata
  order       Int      // Ordem na categoria
  createdAt   DateTime @default(now())

  category    Category       @relation(fields: [categoryId], references: [id])
  progress    UserProgress[]

  @@index([categoryId])
  @@index([difficulty])
}
```

**Exemplo:**
```json
{
  "en": "How much does this cost?",
  "pt": "Quanto custa isso?",
  "tip": "Use em lojas e restaurantes",
  "difficulty": 1
}
```

---

## 📈 Tabela: user_progress

Progresso individual por frase.

```prisma
model UserProgress {
  id              Int      @id @default(autoincrement())
  userId          String
  phraseId        Int

  // Progresso
  mastery         Int      @default(0) // 0-5 (não visto até fluente)
  timesReviewed   Int      @default(0)
  correctAnswers  Int      @default(0)
  wrongAnswers    Int      @default(0)

  // Repetição Espaçada
  nextReviewAt    DateTime?
  lastReviewAt    DateTime?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phrase          Phrase   @relation(fields: [phraseId], references: [id])

  @@unique([userId, phraseId])
  @@index([userId])
  @@index([nextReviewAt])
}
```

**Mastery Levels:**
- 0: Não visto
- 1: Visto 1x (review em 1 dia)
- 2: Acertou 2x (review em 3 dias)
- 3: Acertou 3x (review em 7 dias)
- 4: Acertou 4x (review em 14 dias)
- 5: Fluente (review em 30 dias)

---

## 🏆 Tabela: achievements

Conquistas disponíveis.

```prisma
model Achievement {
  id          Int      @id @default(autoincrement())
  slug        String   @unique
  name        String
  description String
  icon        String   // Emoji ou URL
  xpReward    Int      // XP ao desbloquear

  // Condições
  type        String   // "xp", "streak", "phrases", "level"
  target      Int      // Valor alvo

  users       UserAchievement[]

  @@index([slug])
}
```

**Exemplos:**
```json
[
  {
    "slug": "first-lesson",
    "name": "Primeira Lição",
    "description": "Complete sua primeira lição",
    "icon": "🎯",
    "xpReward": 10,
    "type": "phrases",
    "target": 1
  },
  {
    "slug": "streak-7",
    "name": "Semana Perfeita",
    "description": "Estude 7 dias seguidos",
    "icon": "🔥",
    "xpReward": 100,
    "type": "streak",
    "target": 7
  }
]
```

---

## 🎖️ Tabela: user_achievements

Conquistas desbloqueadas por usuário.

```prisma
model UserAchievement {
  id            Int        @id @default(autoincrement())
  userId        String
  achievementId Int
  unlockedAt    DateTime   @default(now())

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}
```

---

## 🤖 Tabela: ai_conversations

Conversas com IA (Semana 2+).

```prisma
model AIConversation {
  id          String   @id @default(uuid())
  userId      String

  // Contexto
  scenario    String   // "restaurant", "airport", etc
  difficulty  Int      // 1-5

  // Conversa (JSON)
  messages    Json     // Array de mensagens

  // Avaliação
  score       Int?     // 0-100
  feedback    String?  // Feedback da IA

  // Timestamps
  createdAt   DateTime @default(now())
  completedAt DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

**Exemplo messages:**
```json
[
  {
    "role": "assistant",
    "content": "Hello! Welcome to our restaurant. How can I help you?",
    "timestamp": "2024-11-07T10:00:00Z"
  },
  {
    "role": "user",
    "content": "I'd like a table for two, please.",
    "timestamp": "2024-11-07T10:00:15Z"
  }
]
```

---

## 💳 Tabela: payments

Pagamentos e assinaturas (Semana 4+).

```prisma
model Payment {
  id              String   @id @default(uuid())
  userId          String

  // Stripe
  stripePaymentId String   @unique

  // Plano
  plan            String   // "monthly", "yearly", "lifetime"
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("BRL")

  // Status
  status          String   // "pending", "completed", "failed"

  // Timestamps
  createdAt       DateTime @default(now())
  paidAt          DateTime?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
}
```

**Planos:**
- `monthly`: R$ 39,90/mês
- `yearly`: R$ 397/ano
- `lifetime`: R$ 1.997 (único)

---

## 🔧 Migrations

### Criar Migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Aplicar em Produção

```bash
npx prisma migrate deploy
```

### Resetar Database (DEV)

```bash
npx prisma migrate reset
```

---

## 🌱 Seed

Popula database com dados iniciais.

**Conteúdo:**
- 5 levels
- 10 categories (Level 1)
- 100 phrases (Level 1)
- 8 achievements

**Comando:**
```bash
npm run prisma:seed
```

---

## 📊 Queries Comuns

### Ranking de Usuários

```typescript
const topUsers = await prisma.user.findMany({
  orderBy: { xp: 'desc' },
  take: 10,
  select: {
    name: true,
    xp: true,
    level: true,
  },
})
```

### Frases para Review

```typescript
const phrasesToReview = await prisma.userProgress.findMany({
  where: {
    userId: user.id,
    nextReviewAt: { lte: new Date() },
  },
  include: { phrase: true },
  orderBy: { nextReviewAt: 'asc' },
  take: 20,
})
```

### Progresso por Categoria

```typescript
const progress = await prisma.userProgress.groupBy({
  by: ['phraseId'],
  where: { userId: user.id },
  _avg: { mastery: true },
})
```

---

## 🚀 Performance

### Índices Importantes

1. `users.email` (login rápido)
2. `users.xp` (ranking)
3. `refresh_tokens.token` (auth)
4. `user_progress.nextReviewAt` (review)
5. `phrases.categoryId` (listagem)

### Connection Pooling

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

---

## 📈 Estatísticas

### Espaço Estimado

| Tabela | Registros | Tamanho |
|--------|-----------|---------|
| users | 1.000 | 500 KB |
| phrases | 5.000 | 2 MB |
| user_progress | 50.000 | 5 MB |
| Total | - | ~10 MB |

**Tier grátis Supabase:** 500 MB (suficiente!)

---

## 🔒 Segurança

1. **Senhas:** Hashed com bcrypt (salt 10)
2. **Tokens:** UUID v4
3. **Cascade:** Delete em cascata (user → progress)
4. **Validation:** Zod no backend

---

**Última atualização:** 07/11/2024
