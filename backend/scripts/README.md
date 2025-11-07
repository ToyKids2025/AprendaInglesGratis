# 🤖 Scripts de Automação - English Flow

## 📝 generate-phrases.ts

**Gerador automatizado de frases usando IA**

### O que faz:
- Gera frases em inglês em escala usando OpenAI GPT-4
- Cria 50 frases por categoria automaticamente
- Traduz para português
- Adiciona dicas de uso contextual
- Salva direto no banco de dados

### Meta:
**10.000 frases em 90 dias** = 111 frases/dia

### Como usar:

#### 1. Configurar OpenAI API Key

Adicione no `.env`:
```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Como obter:**
1. Acesse https://platform.openai.com/api-keys
2. Crie uma API key
3. Cole no `.env`

**Custo estimado:**
- ~R$ 0,10 por 50 frases
- 10.000 frases = ~R$ 20 total

#### 2. Executar o script

```bash
cd backend
npm install openai
tsx scripts/generate-phrases.ts
```

#### 3. Acompanhar progresso

O script mostra:
- ✅ Frases geradas por categoria
- 📊 Total de frases no banco
- 📈 Progresso em relação à meta (10.000)

### Exemplo de output:

```
🚀 INICIANDO GERADOR DE FRASES EM MASSA
Meta: 10.000 frases em 90 dias

📊 Criando 8 níveis...
✅ Nível 1 criado: Survival English
...

📝 Gerando frases para Nível 1...

📍 Categoria: Greetings
   Existentes: 10 | Gerando: 40
🤖 Gerando 40 frases para: Greetings (Nível 1)
✅ Geradas 40 frases
   ✅ Salvas: 40/40

...

🎉 Total de frases geradas nesta execução: 400

📊 ESTATÍSTICAS:
   Frases totais: 500
   Categorias: 10
   Meta: 10.000 frases
   Progresso: 5.0%

✅ SCRIPT CONCLUÍDO!
```

### Personalizar categorias:

Edite `CATEGORIES_BY_LEVEL` no script:

```typescript
const CATEGORIES_BY_LEVEL = {
  1: [
    { name: 'Sua Categoria', icon: '🎯', slug: 'sua-categoria' },
    // ...
  ],
}
```

### Controlar quantidade:

```typescript
// Gerar apenas 20 frases por categoria
const targetPerCategory = 20
```

### Modo batch (gerar em lote):

Para gerar rapidamente muitas frases, execute o script várias vezes:

```bash
# Gerar 500 frases (10 categorias x 50)
tsx scripts/generate-phrases.ts

# Aguardar 1 minuto e repetir
sleep 60 && tsx scripts/generate-phrases.ts
```

### Troubleshooting:

**Erro: OpenAI API key não encontrada**
- Adicione `OPENAI_API_KEY` no `.env`

**Erro: Rate limit exceeded**
- Aguarde 1 minuto entre execuções
- Reduza `targetPerCategory`

**Erro: Frases duplicadas**
- O script pula frases existentes automaticamente

### Custo OpenAI:

| Modelo | Custo/1k tokens | Frases/execução | Custo/execução |
|--------|-----------------|-----------------|----------------|
| GPT-4 Turbo | $0.01 input | ~500 frases | ~$0.15 (R$ 0,75) |
| GPT-3.5 Turbo | $0.001 input | ~500 frases | ~$0.02 (R$ 0,10) |

**Total para 10.000 frases com GPT-4:** ~R$ 15

---

## 🎯 Estratégia de Conteúdo

### Semana 1 (Nov):
- Dia 1-2: Criar script ✅
- Dia 3-7: Gerar 1.000 frases (200/dia)

### Semana 2-4:
- 500 frases/semana = 71/dia
- Total mês: 2.000 frases

### Dezembro:
- 500 frases/semana = 71/dia
- Total mês: 2.000 frases

### Janeiro:
- 500 frases/semana = 71/dia
- Total mês: 2.000 frases

### TOTAL: 6.000 frases em 90 dias (60% da meta)

**Restantes 4.000:** Criar manualmente ou com ajuda de freelancer

---

## 📊 Distribuição por Nível

| Nível | Nome | Frases | Categorias |
|-------|------|--------|------------|
| 1 | Survival | 500 | 10 |
| 2 | Tourist | 800 | 10 |
| 3 | Daily | 1.000 | 10 |
| 4 | Professional | 1.500 | 15 |
| 5 | Advanced | 2.000 | 15 |
| 6 | Mastery | 2.000 | 15 |
| 7 | Native-Like | 1.500 | 15 |
| 8 | Specialist | 1.700 | 20 |

**TOTAL: 11.000 frases** (superamos a meta!)

---

## 🔧 Próximos Scripts

- [ ] `generate-audio.ts` - Gerar áudios em massa (TTS)
- [ ] `validate-phrases.ts` - Validar qualidade das frases
- [ ] `export-phrases.ts` - Exportar para JSON/CSV
- [ ] `import-phrases.ts` - Importar de arquivo externo

---

**Criado em:** 07/11/2024
**Última atualização:** 07/11/2024
