# ⚡ Quick Start - 60 Seconds to Running

## Fastest Path to Testing

### Option 1: Frontend Only (No Installation)
```bash
# Just open the HTML file in your browser
open index.html
```
- ⚠️ Enter Tavily API key in the UI (client-side - testing only!)
- Upload a .docx MOP file
- Analyze

### Option 2: Full Stack (Secure, Recommended)
```bash
# 1. Install (one time)
npm install

# 2. Configure (one time)
echo "TAVILY_API_KEY=your_key_here" > .env

# 3. Run
npm start

# 4. Open http://localhost:3000
```

## Creating Test MOP Document

**Need a .docx file to test?**

1. Open Microsoft Word / Google Docs / LibreOffice
2. Copy contents from `example-mop.txt`
3. Paste and save as `.docx`

## First Test

1. **Upload**: Choose your `.docx` MOP file
2. **Domain**: Select "IPCORE" (or relevant domain)
3. **Review**: Check the auto-extracted sections
4. **Server**: ✅ Check "Use server-side proxy"
5. **Analyze**: Click the button
6. **Results**: View scores, recommendations, and references

## Expected Results

**Good MOP** (example-mop.txt):
- Pre-Checks: 8-9/10
- Operation: 7-8/10
- Rollback: 8-9/10

**Typical MOP**:
- Pre-Checks: 5-7/10
- Operation: 6-7/10
- Rollback: 4-6/10

## Troubleshooting in 10 Seconds

| Problem | Solution |
|---------|----------|
| Server won't start | `npm install` first |
| API key error | Add to `.env` file |
| Document won't upload | Must be `.docx` format |
| Port 3000 in use | Set `PORT=3001` in `.env` |
| Parse errors | Use fallback mode (uncheck server) |

## Testing Without Tavily API

The app includes **fallback scoring** that works without any API:
- Uses keyword matching
- Analyzes section length
- Provides basic recommendations
- Perfect for testing the upload/parse flow

## Files You Need

**Minimum (Frontend Only)**:
- `index.html`

**Recommended (Full Stack)**:
- Everything in the folder
- Create `.env` with your API key

## Next Steps

1. ✅ Test with example-mop.txt (convert to .docx)
2. 📚 Read README.md for full details
3. 🔒 Review security notes before production
4. 🎨 Customize scoring rubric if needed
5. 🚀 Deploy to your server

---

**Questions?** Check:
1. `SETUP_GUIDE.md` - Detailed setup
2. `README.md` - Full documentation
3. `PROJECT_SUMMARY.md` - What's included

**Time to first analysis**: < 2 minutes 🎯
