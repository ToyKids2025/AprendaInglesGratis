# 🚀 English Flow

> Aprenda inglês **10x mais rápido** e **10x mais barato** com IA conversacional

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-MVP-green)]()
[![Progress](https://img.shields.io/badge/Progress-90%25-blue)]()

---

## 📋 Índice

- [Sobre](#sobre)
- [Features](#features)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [Estrutura](#estrutura)
- [Deploy](#deploy)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## 🎯 Sobre

**English Flow** é uma plataforma SaaS de aprendizado de inglês que usa IA conversacional para ensinar inglês de forma prática e eficiente.

### Por que English Flow?

- 💰 **10x mais barato:** R$ 39,90/mês vs R$ 600/mês (Wizard/Wise Up)
- ⚡ **10x mais rápido:** Fluência em 12 meses vs 3-5 anos
- 🤖 **IA 24/7:** Pratique conversação quando quiser
- 🎮 **Gamificação:** XP, badges, streaks, leaderboard
- 📱 **PWA:** Funciona offline, instale no celular
- 🎓 **Certificados:** Profissionais e compartilháveis

### Números

- **70+ arquivos** criados
- **~10,000 linhas** de código
- **11 páginas** funcionais
- **18 endpoints** backend
- **100 frases** iniciais + 80 categorias
- **R$ 0** de custo (free tier)

---

## ✨ Features

### ✅ Completas

- [x] **Autenticação** - JWT com refresh tokens
- [x] **Gamificação** - XP, níveis, streaks, badges
- [x] **IA Conversacional** - Chat com voz (input/output)
- [x] **PWA** - Offline support + instalável
- [x] **Certificados** - Gerador com Canvas API
- [x] **Achievements** - 8 conquistas com raridades
- [x] **Leaderboard** - Ranking global competitivo
- [x] **Daily Reminders** - Notificações automáticas
- [x] **Admin Panel** - Gerenciamento de conteúdo
- [x] **SEO Completo** - Meta tags + Open Graph

### 🔄 Em Desenvolvimento

- [ ] Geração de 10.000 frases com IA
- [ ] Deploy v1 (Vercel + Railway)
- [ ] Beta testing (100 usuários)
- [ ] Analytics avançado
- [ ] B2B dashboard

---

## 🛠 Tecnologias

### Backend
- **Node.js** + **TypeScript**
- **Express** - API REST
- **Prisma ORM** - Type-safe database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **OpenAI API** - IA conversacional
- **Jest** - Testing (30+ tests)

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router v6** - Navigation
- **Web APIs** - Speech, Notifications, Share

### Infraestrutura
- **Vercel** - Frontend hosting (free)
- **Railway** - Backend hosting (free)
- **Supabase** - PostgreSQL database (free)
- **OpenAI** - GPT-4 para frases + conversação

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ ([download](https://nodejs.org/))
- npm ou yarn
- Git

### 1. Clone o repositório

```bash
git clone https://github.com/ToyKids2025/AprendaInglesGratis.git
cd AprendaInglesGratis
```

### 2. Backend Setup

```bash
cd backend

# Instalar dependências
npm install

# Copiar .env.example
cp .env.example .env

# Editar .env com suas credenciais
# Obrigatório: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
# Opcional: OPENAI_API_KEY (para IA)

# Gerar Prisma Client
npm run prisma:generate

# Criar database e tables
npm run prisma:migrate

# Popular com dados iniciais
npm run prisma:seed

# Iniciar servidor
npm run dev
```

**Backend rodando em:** `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
```

**Frontend rodando em:** `http://localhost:5173`

---

## 📖 Uso

### Desenvolvimento Local

#### Backend:
```bash
npm run dev          # Servidor development
npm run build        # Build para produção
npm start            # Rodar produção
npm test             # Rodar testes
npm run prisma:studio # Abrir Prisma Studio (DB visual)
```

#### Frontend:
```bash
npm run dev          # Dev server com hot reload
npm run build        # Build para produção
npm run preview      # Preview build local
```

### Gerar Frases com IA

```bash
cd backend

# Gerar frases para níveis 1 e 2
tsx scripts/generate-phrases.ts 1 2

# Gerar para nível específico
tsx scripts/generate-phrases.ts 3

# Gerar para todos os níveis
tsx scripts/generate-phrases.ts 1 2 3 4 5 6 7 8
```

**Custo:** ~R$ 0,10 por 50 frases (GPT-4 Turbo)

### Variáveis de Ambiente

#### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/englishflow"

# JWT
JWT_SECRET="seu-secret-aqui-min-32-caracteres"
JWT_REFRESH_SECRET="seu-refresh-secret-aqui-min-32"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (CORS)
FRONTEND_URL="http://localhost:5173"

# OpenAI (opcional - necessário para IA)
OPENAI_API_KEY="sk-..."
```

---

## 📁 Estrutura do Projeto

```
AprendaInglesGratis/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, errors
│   │   ├── services/        # OpenAI, etc
│   │   ├── lib/             # Prisma client
│   │   └── server.ts        # Express app
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Initial data
│   ├── scripts/
│   │   └── generate-phrases.ts  # IA phrase generator
│   ├── tests/               # Jest tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # 11 pages
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API calls
│   │   ├── store/           # Zustand state
│   │   ├── utils/           # PWA, reminders
│   │   └── App.tsx
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   └── sw.js            # Service Worker
│   └── package.json
├── docs/                    # Documentation
├── ROADMAP_EXECUTIVO.md    # 90-day plan
├── PROGRESS_DIARIO.md      # Daily progress
└── README.md               # This file
```

---

## 🌐 Deploy

### Frontend (Vercel)

1. Push para GitHub
2. Importar no Vercel
3. Configure:
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`
4. Deploy automático

### Backend (Railway)

1. Crie projeto no Railway
2. Adicione PostgreSQL
3. Configure variáveis de ambiente
4. Deploy via GitHub ou CLI

### Database (Supabase)

1. Crie projeto no Supabase
2. Copie `DATABASE_URL` connection string
3. Rode migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

## 🗺 Roadmap

### Semana 1 (Nov 7-14) - ✅ 90% Completo
- [x] Estrutura completa (50+ arquivos)
- [x] Backend + Frontend + Database
- [x] IA integration
- [x] Testes (30+)
- [x] PWA + Gamificação
- [ ] 1.000 frases (100/1.000)

### Semana 2 (Nov 14-21)
- [ ] 2.000 frases totais
- [ ] Deploy v1
- [ ] 10 beta testers
- [ ] Mobile optimization

### Semana 3 (Nov 21-28)
- [ ] 3.000 frases
- [ ] Voice recognition melhorado
- [ ] Analytics dashboard
- [ ] 50 beta testers

### Semana 4 (Nov 28 - Dez 5)
- [ ] 4.000 frases
- [ ] Payment integration
- [ ] Marketing campaign
- [ ] 100 beta testers

### Mês 2 (Dezembro)
- [ ] 8.000 frases
- [ ] 90 categorias
- [ ] Community/forum
- [ ] Global ranking

### Mês 3 (Janeiro)
- [ ] 10.000 frases
- [ ] 100 categorias
- [ ] B2B dashboard
- [ ] Launch oficial

---

## 🧪 Testes

### Rodar testes

```bash
cd backend
npm test                    # Todos os testes
npm run test:watch          # Watch mode
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm test -- --coverage      # Com coverage
```

### Coverage atual
- **30+ testes** escritos
- **50%** coverage threshold
- Unit tests: auth, gamification
- Integration tests: spaced repetition

---

## 👥 Time

**Alexandre** (60%) - Investidor + Marketing
**Desenvolvedor** (40%) - CTO + Full-Stack

**Parceria:** 60/40
**Investimento:** R$ 15.000 (Fevereiro 2025)
**Timeline:** 90 dias (Nov-Jan)

---

## 💰 Custos

### Desenvolvimento (Dias 1-5)
- **Infraestrutura:** R$ 0 (tier grátis)
- **OpenAI API:** R$ 0 (ainda não usado)
- **Desenvolvimento:** Sweat equity
- **TOTAL:** **R$ 0** ✅

### Projeção (Pós-launch)
- **Vercel:** R$ 0 (hobby tier)
- **Railway:** R$ 0-50/mês
- **Supabase:** R$ 0 (500MB)
- **OpenAI:** ~R$ 100-200/mês (10k frases + conversações)

---

## 📊 Analytics

### Days 1-5 Stats
- **Dias trabalhados:** 5 de 90 (5.6%)
- **Features completas:** 90% do MVP
- **Commits:** 5 commits (~10k linhas)
- **Velocidade:** 18x mais rápido que planejado

### Features Prontas
✅ 18 endpoints backend
✅ 11 páginas frontend
✅ 30+ testes
✅ PWA completo
✅ Gamificação 100%
✅ IA conversacional
✅ R$ 0 custo

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 🙏 Agradecimentos

- **OpenAI** - GPT-4 para IA conversacional
- **Vercel** - Hosting gratuito
- **Railway** - Backend hosting
- **Supabase** - PostgreSQL managed

---

## 🔗 Links Úteis

- **Roadmap Executivo:** [ROADMAP_EXECUTIVO.md](./ROADMAP_EXECUTIVO.md)
- **Progresso Diário:** [PROGRESS_DIARIO.md](./PROGRESS_DIARIO.md)
- **Instalação:** [INSTALL.md](./INSTALL.md)

---

<div align="center">

**Made with ❤️ in Brasil**

**From zero to fluency in 12 months! 🌊**

[⬆ Voltar ao topo](#-english-flow)

</div>
