# 🚀 START HERE - Telco MOP Analysis Agent

Welcome! This is your complete, production-ready Telco MOP Analysis Agent.

## What You Have

A **full-stack application** that analyzes Method of Procedure (MOP) documents for ITIL4 compliance and Telco best practices.

## Quick Start (5 minutes)

### 1. Setup Environment
```bash
cp .env.example .env
nano .env  # Set X_API_KEY=your-secret-key
```

### 2. Start Application
```bash
docker-compose up -d
```

### 3. Access
- **Web UI**: http://localhost:8080
- **API**: http://localhost:3000
- **Docs**: http://localhost:3000/api/docs

### 4. Test
```bash
# Upload a sample via web UI at http://localhost:8080
# OR test via command line:
curl -X POST http://localhost:3000/api/analyze \
  -H "X-API-KEY: your-secret-key" \
  -F "mop=@samples/full_mop.docx" \
  -F "category=IPCORE" | jq
```

## 📚 Documentation Guide

Read these in order:

1. **RUN_INSTRUCTIONS.txt** ← START HERE for commands
2. **QUICKSTART.md** ← 5-minute setup guide  
3. **README.md** ← Complete documentation with ITIL4 mapping
4. **docs/API.md** ← Full API reference
5. **PROJECT_SUMMARY.md** ← Architecture & technical details
6. **DEPLOYMENT_CHECKLIST.md** ← Production deployment
7. **CONTRIBUTING.md** ← Development guidelines

## 🎯 What It Does

1. **Upload DOCX MOP** → Select Telco category
2. **Automated Analysis** → Scores against ITIL4 best practices
3. **Get Results**:
   - Overall quality score (0-10)
   - Section scores (Pre-Checks, Operation Steps, Rollback)
   - Detailed recommendations
   - Industry best practice evidence
4. **Export Reports** → JSON or PDF

## 🏗️ What's Included

✅ **Backend** - Node.js + TypeScript API with ITIL4 scoring  
✅ **Frontend** - React + Vite web application  
✅ **3 Sample DOCX Files** - Full, partial, and poor quality MOPs  
✅ **Docker Setup** - One-command deployment  
✅ **Tests** - Unit and integration tests  
✅ **CI/CD** - GitHub Actions pipeline  
✅ **Documentation** - 8+ comprehensive guides  
✅ **Demo Scripts** - CLI testing tools  

## 🔐 Security Note

**IMPORTANT**: Change the default API key before deployment!

```bash
# Generate a secure key:
openssl rand -base64 32

# Update .env:
X_API_KEY=your-generated-key
```

## 🧪 Sample Files

Located in `samples/`:
- `full_mop.docx` - Complete MOP (score: 8-9/10)
- `partial_mop.docx` - MOP with gaps (score: 5-6/10)  
- `poor_mop.docx` - Minimal MOP (score: 2-3/10)

## 🛠️ Development

### Run Locally (without Docker)

**Backend**:
```bash
cd backend
npm install
cp .env.development .env
npm run dev  # Port 3000
```

**Frontend**:
```bash
cd frontend
npm install
cp .env.development .env
npm run dev  # Port 5173
```

## 📊 How It Scores

Each section scored 0-10 based on:
- **Presence** (30%) - Has meaningful content
- **Clarity** (25%) - Steps are specific
- **Verifiability** (20%) - Includes validation
- **Safety** (15%) - Risk assessment included
- **Compliance** (10%) - Matches ITIL4 + category standards

**Total** = PreChecks(35%) + OpSteps(40%) + Rollback(25%)

## 🌐 Supported Categories

1. IPCORE
2. Packet Core
3. Billing and Revenue → Charging/Revenue Management
4. Radio Network
5. Transmission Network
6. DevOps and Systems (OSS and BSS)
7. IT
8. Cyber Security
9. Data Engineering

## ✅ Verify Installation

```bash
# Check services are running
docker-compose ps

# Test backend health
curl http://localhost:3000/api/health

# Should return: {"status":"healthy",...}
```

## 🆘 Troubleshooting

**Services won't start?**
- Check `.env` file exists with `X_API_KEY` set
- Run `docker-compose logs backend` to see errors

**Frontend shows 401 errors?**
- Ensure `VITE_API_KEY` in frontend `.env` matches backend `X_API_KEY`

**Need help?**
- Check `RUN_INSTRUCTIONS.txt` for detailed commands
- See `QUICKSTART.md` for common issues
- Review logs: `docker-compose logs -f`

## 📦 Project Structure

```
/workspace/
├── backend/         - API server (Node.js + TypeScript)
├── frontend/        - Web UI (React + Vite)
├── samples/         - 3 sample DOCX files
├── scripts/         - Demo and setup scripts
├── docs/            - API documentation
├── .github/         - CI/CD pipeline
└── docker-compose.yml - Multi-container setup
```

## 🚀 Next Steps

1. ✅ Read `RUN_INSTRUCTIONS.txt`
2. ✅ Run `docker-compose up -d`
3. ✅ Open http://localhost:8080
4. ✅ Upload `samples/full_mop.docx`
5. ✅ Review results
6. ✅ Explore API docs at http://localhost:3000/api/docs

## 📞 Resources

- **Full Documentation**: See `README.md`
- **API Reference**: See `docs/API.md`
- **GitHub Issues**: Report bugs
- **Contributing**: See `CONTRIBUTING.md`

---

**Ready to analyze MOPs! 🎉**

Built with ❤️ for Telco Change Management Excellence
