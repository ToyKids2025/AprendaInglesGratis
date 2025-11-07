# 📦 Guia de Instalação - English Flow

Tempo estimado: **15 minutos**

## 📋 Pré-requisitos

- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- Conta GitHub
- Editor de código (VS Code recomendado)

## 🚀 Instalação Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/ToyKids2025/AprendaInglesGratis.git
cd AprendaInglesGratis
```

### 2. Configure o Banco de Dados (Supabase)

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta grátis
3. Clique em "New Project"
4. Escolha um nome e senha
5. Aguarde 2 minutos (criação do projeto)
6. Vá em **Settings > Database**
7. Copie a **Connection String** (URI format)

### 3. Configure o Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
DATABASE_URL="sua-connection-string-do-supabase"
JWT_SECRET="seu-segredo-aqui-min-32-caracteres"
JWT_REFRESH_SECRET="outro-segredo-diferente-min-32"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

**Gere segredos seguros:**
```bash
# No terminal, execute 2 vezes:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Rode as migrations e seed:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Inicie o backend:

```bash
npm run dev
```

✅ Backend rodando em `http://localhost:3001`

### 4. Configure o Frontend

**Em outro terminal:**

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend rodando em `http://localhost:5173`

## 🎉 Teste a Aplicação

1. Abra http://localhost:5173
2. Clique em "Criar Conta"
3. Registre-se com email e senha
4. Faça login
5. Explore o Dashboard!

## 🐛 Problemas Comuns

### Erro de conexão com banco
- Verifique se a `DATABASE_URL` está correta
- Certifique-se que o projeto Supabase está ativo

### Porta 3001 em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <numero_do_pid> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Erro no Prisma
```bash
cd backend
npx prisma generate
npx prisma migrate reset --force
npm run prisma:seed
```

## 📚 Próximos Passos

- Leia `docs/ARCHITECTURE.md` para entender a estrutura
- Veja `docs/ROADMAP_12_WEEKS.md` para o plano completo
- Contribua com o projeto!

## 🆘 Suporte

Abra uma issue no GitHub ou contate a equipe.

---

Feito com ❤️ por English Flow Team
