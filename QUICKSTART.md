# Quick Start Guide

Get the Telco MOP Analysis Agent running in under 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Python 3.8+ (for generating sample files)

## Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/telco-mop-agent.git
cd telco-mop-agent
```

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and set your API keys
nano .env  # or use your favorite editor
```

**Minimum required configuration**:
```env
X_API_KEY=my-secure-api-key-12345
TAVILY_API_KEY=tvly-xxxxxxxxxxxxx  # Optional but recommended
```

## Step 3: Generate Sample MOP Files

```bash
cd samples
pip install -r requirements.txt
python generate_samples.py
cd ..
```

You should see:
```
Generating sample MOP documents...
Created: /path/to/samples/full_mop.docx
Created: /path/to/samples/partial_mop.docx
Created: /path/to/samples/poor_mop.docx
Done!
```

## Step 4: Start Services

```bash
docker-compose up -d
```

Wait about 30 seconds for services to start, then verify:

```bash
# Check backend health
curl http://localhost:3000/api/health

# Should return:
# {"status":"healthy","timestamp":"...","tavilyEnabled":true}
```

## Step 5: Test the API

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "X-API-KEY: my-secure-api-key-12345" \
  -F "mop=@samples/full_mop.docx" \
  -F "category=IPCORE" | jq
```

Expected output (truncated):
```json
{
  "scores": {
    "preChecks": { "score": 8.5, ... },
    "operationSteps": { "score": 7.8, ... },
    "rollbackSteps": { "score": 8.2, ... }
  },
  "totalScore": 8.1,
  "recommendations": [...],
  ...
}
```

## Step 6: Use the Web UI

Open your browser to http://localhost:8080

1. Select category: **IPCORE**
2. Upload file: `samples/full_mop.docx`
3. Click **Analyze MOP**
4. View results and download reports!

## Step 7: Try the Demo Script

```bash
cd scripts
npm install
node demo.js ../samples/full_mop.docx ipcore
```

You'll see formatted output:
```
🔍 Telco MOP Analysis Agent - Demo

File: ../samples/full_mop.docx
Category: IPCORE
API: http://localhost:3000

📤 Sending request...

✅ Analysis Complete!

═══════════════════════════════════════════════
📊 TOTAL QUALITY SCORE: 8.1/10
⏱️  Processing Time: 2345ms
🔒 Confidence: 95%
📚 Tavily Used: Yes
═══════════════════════════════════════════════
...
```

## Verify All Services

```bash
# Check Docker containers
docker-compose ps

# Should show:
# NAME                   STATUS
# telco-mop-agent_backend_1    Up (healthy)
# telco-mop-agent_frontend_1   Up (healthy)
# telco-mop-agent_redis_1      Up (healthy)

# View logs
docker-compose logs -f backend
```

## Troubleshooting

### Backend won't start

**Error**: `Configuration errors: X_API_KEY is required`

**Solution**: Make sure `.env` file exists with `X_API_KEY` set.

### Cannot connect to backend

**Check**: 
```bash
docker-compose logs backend
curl http://localhost:3000/api/health
```

**Solution**: Wait for services to fully start (check `docker-compose ps`)

### Upload fails with 401 Unauthorized

**Problem**: API key mismatch

**Solution**: Ensure frontend `.env` has same `VITE_API_KEY` as backend `X_API_KEY`

### Tavily integration not working

**Symptom**: `tavilyUsed: false` in results

**Solution**: 
1. Check if `TAVILY_API_KEY` is set in `.env`
2. Verify API key is valid at https://tavily.com
3. Note: App works without Tavily but with reduced category-specific scoring

## Next Steps

- 📖 Read full [README.md](README.md) for architecture details
- 🔧 Check [API.md](docs/API.md) for complete API reference
- 🧪 Run tests: `cd backend && npm test`
- 🚀 Deploy to production (see README deployment section)

## Clean Up

Stop and remove all containers:
```bash
docker-compose down -v
```

## Need Help?

- GitHub Issues: https://github.com/yourusername/telco-mop-agent/issues
- Documentation: See `docs/` folder
- API Docs: http://localhost:3000/api/docs (when running)
