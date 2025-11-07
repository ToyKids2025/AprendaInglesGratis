# 🏗️ Arquitetura - English Flow

## 📋 Visão Geral

English Flow segue arquitetura **monorepo** com frontend e backend separados.

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIO                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────▼─────────┐
                │   FRONTEND       │
                │   React + Vite   │
                │   Vercel         │
                └────────┬─────────┘
                         │
                    HTTP/REST
                         │
                ┌────────▼─────────┐
                │   BACKEND        │
                │   Express API    │
                │   Railway        │
                └────────┬─────────┘
                         │
                ┌────────▼─────────┐
                │   DATABASE       │
                │   PostgreSQL     │
                │   Supabase       │
                └──────────────────┘
```

---

## 🎨 Frontend (React)

### Stack
- **Framework:** React 18
- **Language:** TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand (global) + React Query (server state)
- **Router:** React Router v6
- **HTTP:** Axios

### Estrutura de Pastas

```
frontend/src/
├── pages/           # Páginas da aplicação
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Lessons.tsx
│   └── Profile.tsx
│
├── components/      # Componentes reutilizáveis
│   └── auth/
│       ├── ProtectedRoute.tsx
│       └── PublicRoute.tsx
│
├── services/        # Comunicação com API
│   ├── api.ts
│   └── auth.service.ts
│
├── store/           # Estado global (Zustand)
│   └── authStore.ts
│
├── App.tsx          # Configuração de rotas
├── main.tsx         # Entry point
└── index.css        # Estilos globais
```

### Fluxo de Dados

```
User Action → Component → Service → API → Backend
                ↓
            Store Update
                ↓
            Re-render
```

### Rotas

| Rota | Componente | Proteção | Descrição |
|------|-----------|----------|-----------|
| `/` | Home | Pública | Landing page |
| `/login` | Login | Pública | Autenticação |
| `/register` | Register | Pública | Cadastro |
| `/dashboard` | Dashboard | Privada | Painel principal |
| `/lessons` | Lessons | Privada | Lições |
| `/profile` | Profile | Privada | Perfil |

---

## ⚙️ Backend (Node.js + Express)

### Stack
- **Runtime:** Node.js 18+
- **Framework:** Express
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod

### Estrutura de Pastas

```
backend/src/
├── controllers/       # Lógica de negócio
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   └── lesson.controller.ts
│
├── routes/           # Definição de rotas
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── lesson.routes.ts
│
├── middleware/       # Middlewares
│   ├── auth.ts       # Validação JWT
│   └── errorHandler.ts
│
├── lib/              # Utilidades
│   └── prisma.ts     # Prisma client
│
└── server.ts         # Entry point
```

### Endpoints da API

#### 🔐 Autenticação (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/register` | Criar conta |
| POST | `/login` | Login |
| POST | `/refresh` | Renovar token |
| POST | `/logout` | Logout |
| GET | `/me` | Usuário atual |

#### 👤 Usuário (`/api/users`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/profile` | Ver perfil |
| PUT | `/profile` | Atualizar perfil |
| GET | `/stats` | Estatísticas |
| GET | `/achievements` | Conquistas |

#### 📚 Lições (`/api/lessons`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/levels` | Listar níveis |
| GET | `/categories` | Listar categorias |
| GET | `/categories/:slug` | Categoria específica |
| POST | `/progress` | Salvar progresso |

---

## 🗄️ Database (PostgreSQL)

### Schema Prisma

12 tabelas principais:

1. **users** - Usuários
2. **refresh_tokens** - Tokens JWT
3. **levels** - Níveis (1-5)
4. **categories** - Categorias de lições
5. **phrases** - Frases (5.000+)
6. **user_progress** - Progresso individual
7. **achievements** - Conquistas disponíveis
8. **user_achievements** - Conquistas desbloqueadas
9. **ai_conversations** - Conversas com IA
10. **payments** - Pagamentos

### Relacionamentos

```
users
├── 1:N → user_progress
├── 1:N → user_achievements
├── 1:N → ai_conversations
└── 1:N → payments

levels
└── 1:N → categories
    └── 1:N → phrases
        └── 1:N → user_progress

achievements
└── 1:N → user_achievements
```

---

## 🔒 Segurança

### Autenticação JWT

1. **Login:** Retorna `accessToken` (15min) + `refreshToken` (7 dias)
2. **Requests:** Enviar `Bearer {accessToken}` no header
3. **Refresh:** Quando token expira, use `/refresh` com `refreshToken`
4. **Logout:** Invalida `refreshToken` no banco

### Proteção de Rotas

**Frontend:**
```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

**Backend:**
```typescript
router.get('/profile', authMiddleware, getProfile)
```

### Hash de Senhas

```typescript
// Registro
const hashedPassword = await bcrypt.hash(password, 10)

// Login
const isValid = await bcrypt.compare(password, user.password)
```

---

## 🚀 Deploy

### Frontend (Vercel)

1. Push para GitHub
2. Conectar repositório no Vercel
3. Configurar:
   - **Framework:** Vite
   - **Root:** `frontend/`
   - **Build:** `npm run build`
   - **Output:** `dist/`

**Variáveis de ambiente:**
```
VITE_API_URL=https://seu-backend.railway.app/api
```

### Backend (Railway)

1. Conectar GitHub
2. Configurar:
   - **Root:** `backend/`
   - **Build:** `npm install && npx prisma generate`
   - **Start:** `npm start`

**Variáveis de ambiente:**
```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=https://seu-frontend.vercel.app
PORT=3001
```

### Database (Supabase)

1. Criar projeto no Supabase
2. Copiar Connection String
3. Adicionar ao Railway como `DATABASE_URL`
4. Rodar migrations: `npx prisma migrate deploy`

---

## 📊 Performance

### Frontend
- **Code Splitting:** Vite automatic
- **Lazy Loading:** React.lazy() para rotas
- **Caching:** React Query (5min stale time)
- **Otimização de imagens:** WebP

### Backend
- **Prisma Connection Pool:** 10 conexões
- **Rate Limiting:** 100 req/min por IP
- **Compression:** gzip para responses
- **Caching:** Redis (futuro)

---

## 🔄 CI/CD

**Fluxo:**
```
Push → GitHub Actions → Testes → Build → Deploy
```

**Branches:**
- `main` → Produção (Vercel + Railway)
- `develop` → Staging
- `feature/*` → Features

---

## 📚 Tecnologias Futuras

### Semana 2+
- **OpenAI GPT-4** - IA conversacional
- **Text-to-Speech** - Pronúncia
- **Speech-to-Text** - Reconhecimento de voz

### Semana 4+
- **Stripe** - Pagamentos
- **SendGrid** - Emails transacionais
- **Redis** - Cache
- **WebSockets** - Real-time

---

## 📖 Referências

- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com)
- [JWT Best Practices](https://jwt.io)

---

**Última atualização:** 07/11/2024
