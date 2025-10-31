# Quick Start Guide ??

Get the ITIL 4 MOP Analyzer running in under 10 minutes!

## Prerequisites

You need:
- **Python 3.11+** and **Node.js 18+**
- **OpenAI API Key** ? [Get it here](https://platform.openai.com/api-keys)
- **Tavily API Key** ? [Get it here](https://tavily.com)

## 5-Step Setup

### 1?? Backend Setup (3 minutes)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

**Edit `.env` file:**
```env
OPENAI_API_KEY=your_openai_key_here
TAVILY_API_KEY=your_tavily_key_here
SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
```

### 2?? Frontend Setup (2 minutes)

Open a new terminal:
```bash
cd frontend
npm install
```

### 3?? Start Backend (30 seconds)

In the backend terminal:
```bash
python run.py
```

### 4?? Start Frontend (30 seconds)

In the frontend terminal:
```bash
npm run dev
```

### 5?? Use the App! ??

Open **http://localhost:3000**

1. Select a category (e.g., "IT")
2. Upload a MOP document (PDF or Word)
3. Click "Analyze MOP"
4. Wait 30-90 seconds
5. Review results and download report!

## Alternative: Using Scripts

We provide convenience scripts:

```bash
# Start everything
./start.sh

# Stop everything
./stop.sh
```

## Alternative: Using Docker

```bash
# Setup .env first (see step 1)
docker-compose up
```

Then open http://localhost:3000

## Testing with Sample MOP

We provide a sample MOP template in `SAMPLE_MOP.md`. You can:

1. Convert it to PDF/Word
2. Upload it to test the analyzer
3. See how the scoring works

## Troubleshooting

**Can't install Python packages?**
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

**Can't install Node packages?**
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

**API Key errors?**
- Check keys have no spaces/quotes in .env
- Verify OpenAI account has credits
- Confirm Tavily key is active

**Can't access http://localhost:3000?**
- Make sure both backend and frontend are running
- Check ports 3000 and 8000 aren't in use
- Check console for errors (F12 in browser)

## Next Steps

- ?? Read the full [README.md](README.md) for detailed docs
- ?? See [SETUP.md](SETUP.md) for troubleshooting
- ?? Review [SAMPLE_MOP.md](SAMPLE_MOP.md) for MOP examples

## Need Help?

1. Check the logs in your terminals
2. Verify your .env configuration
3. Review the troubleshooting sections
4. Open an issue on GitHub

---

**Happy Analyzing!** ??
