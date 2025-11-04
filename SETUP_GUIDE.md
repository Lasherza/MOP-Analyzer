# 🚀 Quick Setup Guide - Telco MOP Analysis Agent

## Prerequisites

- **Node.js** version 16 or higher
- **npm** (comes with Node.js)
- A **Tavily API key** (sign up at tavily.com)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `express-rate-limit` - API rate limiting

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your favorite editor
nano .env
# or
vim .env
# or
code .env
```

Add your Tavily API key:
```env
TAVILY_API_KEY=tvly-your-actual-api-key-here
```

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
🔧 Telco MOP Analysis Agent Server
=====================================
📡 Server running on http://localhost:3000
🔑 Tavily API configured: ✅ Yes

Available endpoints:
  GET  /                - Frontend UI
  POST /api/browse      - Search for best practices
  POST /api/evaluate    - Evaluate MOP sections
  GET  /api/health      - Health check
```

### Step 4: Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Creating a Test MOP Document

To create a test `.docx` file from the example:

### Option 1: Using Microsoft Word
1. Open Microsoft Word
2. Copy the contents of `example-mop.txt`
3. Paste into Word
4. Save As → Format: `.docx` → Name: `example-mop.docx`

### Option 2: Using Google Docs
1. Open Google Docs
2. Copy the contents of `example-mop.txt`
3. Paste into Google Docs
4. File → Download → Microsoft Word (.docx)
5. Save as `example-mop.docx`

### Option 3: Using LibreOffice (Free)
1. Open LibreOffice Writer
2. Copy the contents of `example-mop.txt`
3. Paste into LibreOffice
4. File → Save As → Format: Microsoft Word 2007-2019 (.docx)

## Using the Application

### 1. Upload MOP Document
- Click "Choose File" and select your `.docx` file
- The tool will automatically extract and parse the content
- Three sections will appear: Pre-Checks, Operation Steps, Rollback Steps

### 2. Select Domain
- Choose the appropriate telco domain from the dropdown
- Options include: IPCORE, Packet Core, Radio Network, etc.

### 3. Enable Server Proxy
- Check the "Use server-side proxy" checkbox
- This uses your server-side API key (secure)

### 4. Analyze
- Click "🔍 Analyze MOP"
- Wait for the analysis to complete (usually 10-30 seconds)
- Review the scores, recommendations, and references

## Testing the API Endpoints

### Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "tavily_configured": true
}
```

### Run Full Test Suite
```bash
# In a separate terminal (keep server running)
npm test
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `.env`:
```env
PORT=3001
```

### API Key Issues
Verify your API key is set correctly:
```bash
# Check if .env file exists
cat .env

# Should show (with your actual key):
# TAVILY_API_KEY=tvly-xxxxx...
```

### Module Not Found
If you see module errors:
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

### Document Upload Fails
- Ensure the file is a valid `.docx` format (not `.doc` or `.docm`)
- Check file size is under 10MB
- Try re-saving the document in Word/Google Docs

## Next Steps

1. **Try the Example MOP**: Upload `example-mop.docx` to test the system
2. **Review Scores**: Understand the scoring rubric in the README
3. **Customize**: Modify the scoring rubric in `index.html` if needed
4. **Production**: Review security considerations before deploying

## Production Deployment

For production deployment, see the main README.md section on:
- HTTPS configuration
- Authentication
- CORS settings
- Rate limiting adjustments
- Environment-specific configurations

## Getting Help

1. Check the main [README.md](README.md) for detailed documentation
2. Review server logs for error messages
3. Test API endpoints individually with curl
4. Verify Tavily API status and quota

---

**Ready to analyze MOPs!** 🎉
