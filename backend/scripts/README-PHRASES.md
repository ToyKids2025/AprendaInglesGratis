# Phrase Generation Scripts

Scripts for generating and managing English learning phrases.

## Scripts

### 1. `generate-bulk-phrases.ts`

Generates 500+ phrases using OpenAI GPT-4 for multiple categories.

**Features:**
- Creates 10 new Level 2 (Intermediate) categories
- Generates 25-30 phrases per category
- Expands 5 Level 1 categories with additional phrases
- Total: ~500+ phrases

**Categories Created:**
1. Public Transportation (🚌) - 25 phrases
2. At the Bank (🏦) - 25 phrases
3. Making Phone Calls (📞) - 25 phrases
4. At the Doctor (👨‍⚕️) - 30 phrases
5. Renting an Apartment (🏠) - 25 phrases
6. Job Interview (💼) - 30 phrases
7. Small Talk & Socializing (☕) - 30 phrases
8. At the Gym (🏋️) - 20 phrases
9. Technology & Internet (💻) - 25 phrases
10. Weather & Nature (🌤️) - 20 phrases

**Level 1 Expansions:**
- Greetings: +15 phrases
- Restaurant: +20 phrases
- Airport: +20 phrases
- Hotel: +15 phrases
- Shopping: +20 phrases

**Usage:**

```bash
cd backend

# Make sure you have OpenAI API key in .env
# OPENAI_API_KEY=sk-...

# Run the script
tsx scripts/generate-bulk-phrases.ts
```

**Requirements:**
- OpenAI API key in `.env`
- ~$3-5 in OpenAI credits for full generation
- ~10-15 minutes runtime (with rate limiting)

**Output:**
```
🚀 English Flow - Bulk Phrase Generator

📁 Creating new Level 2 categories...
  ✅ Created category: Public Transportation
  ✅ Created category: At the Bank
  ...

📝 Generating phrases for new categories...
  🤖 Generating 25 phrases for "Public Transportation"...
  ✅ Generated 25 phrases
  💾 Saved 25 phrases for "Public Transportation"
  ...

✨ Phrase generation complete!
📊 Total generated: 520
💾 Total saved: 520

🎉 All done!
```

**Cost Estimate:**
- ~15-20 API calls to OpenAI
- ~500-700 tokens per request
- Total: ~$3-5 USD

---

### 2. `generate-static-phrases.ts` (Fallback)

Generates phrases without OpenAI API (static, pre-written phrases).

**Features:**
- No API key required
- Instant generation
- 200+ pre-written phrases
- Good for testing/development

**Usage:**

```bash
cd backend
tsx scripts/generate-static-phrases.ts
```

**Output:**
- Creates same categories as bulk script
- Uses pre-written phrase templates
- ~200 phrases total

---

## Tips

### Cost Optimization

1. **Start Small:**
   ```bash
   # Test with one category first
   # Edit the script to only generate 1-2 categories
   ```

2. **Use Free Tier:**
   - New OpenAI accounts get $5 credit
   - Enough for ~1,000 phrases

3. **Rate Limiting:**
   - Script includes 2-second delays between categories
   - Prevents rate limit errors

### Quality Control

After generation, review phrases:

```bash
# Open Prisma Studio to review
npx prisma studio

# Query phrases
npx prisma db execute --stdin <<EOF
SELECT * FROM "Phrase" WHERE difficulty > 3 LIMIT 10;
EOF
```

### Regeneration

To regenerate for a specific category:

```bash
# Delete existing phrases
npx prisma db execute --stdin <<EOF
DELETE FROM "Phrase" WHERE "categoryId" = X;
EOF

# Run script again
```

---

## Best Practices

1. **Backup First:**
   ```bash
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Test in Development:**
   - Run on local database first
   - Review quality before production

3. **Monitor Costs:**
   - Check OpenAI usage dashboard
   - Set billing limits

4. **Version Control:**
   - Commit phrases to git for reproducibility
   - Tag releases: `git tag v1.0-phrases-500`

---

## Troubleshooting

### "OpenAI API key not found"

```bash
# Check .env file
cat backend/.env | grep OPENAI

# Set if missing
echo 'OPENAI_API_KEY=sk-...' >> backend/.env
```

### "Rate limit exceeded"

- Wait 1 minute and try again
- Increase delay in script: `setTimeout(resolve, 5000)` (5 seconds)

### "Database connection error"

```bash
# Check DATABASE_URL
cat backend/.env | grep DATABASE_URL

# Test connection
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
```

### "Phrases not appearing in app"

```bash
# Restart backend server
npm run dev

# Clear cache
# Check browser console for errors
```

---

## Future Improvements

- [ ] Add voice recording URLs
- [ ] Generate example sentences
- [ ] Add pronunciation guides (IPA)
- [ ] Create phrase variations
- [ ] Multi-language support (Spanish, French)
- [ ] Difficulty auto-detection
- [ ] Phrase categorization with tags
- [ ] Context-aware phrase suggestions

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/ToyKids2025/AprendaInglesGratis/issues
- Email: dev@englishflow.com

---

**Last Updated:** November 2024
**Version:** 1.0.0
