# Setup Guide - ITIL 4 MOP Analyzer

This guide will walk you through setting up the ITIL 4 MOP Analyzer on your local machine.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Python 3.11 or higher** installed
  ```bash
  python --version
  ```

- [ ] **Node.js 18 or higher** installed
  ```bash
  node --version
  ```

- [ ] **OpenAI API Key**
  - Sign up at https://platform.openai.com
  - Navigate to API Keys section
  - Create a new API key
  - Note: You'll need credits in your OpenAI account

- [ ] **Tavily API Key**
  - Sign up at https://tavily.com
  - Get your API key from the dashboard
  
- [ ] **Git** installed (for cloning the repository)

## Step-by-Step Installation

### 1. Clone or Download the Project

```bash
cd /path/to/your/projects
# If using git:
git clone <repository-url>
cd itil4-mop-analyzer

# Or extract the downloaded zip file and navigate to it
```

### 2. Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Python Virtual Environment
```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

#### 2.3 Install Python Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install all required packages including:
- FastAPI (web framework)
- OpenAI (AI analysis)
- Tavily (web search)
- Document processors (PDF, DOCX)
- Database tools (SQLAlchemy)
- And more...

#### 2.4 Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env
```

Now edit the `.env` file with your preferred text editor:
```bash
# On macOS/Linux:
nano .env

# Or use any text editor like VSCode, Sublime, etc.
```

**Required Changes in `.env`:**
```env
# Replace these with your actual API keys:
OPENAI_API_KEY=sk-your-actual-openai-key-here
TAVILY_API_KEY=tvly-your-actual-tavily-key-here

# Generate a secure secret key (you can use the command below):
SECRET_KEY=your-secure-random-string-here
```

**To generate a secure SECRET_KEY, run:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2.5 Test Backend Installation
```bash
# Make sure you're still in the backend directory with venv activated
python run.py
```

You should see output like:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Open your browser to http://localhost:8000 - you should see a welcome message.

Visit http://localhost:8000/docs to see the API documentation.

**Press Ctrl+C to stop the server for now.**

### 3. Frontend Setup

Open a **NEW terminal window** (keep the backend terminal for later).

#### 3.1 Navigate to Frontend Directory
```bash
cd /path/to/itil4-mop-analyzer/frontend
```

#### 3.2 Install Node Dependencies
```bash
npm install
```

This will install:
- React (UI framework)
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- And more...

This may take a few minutes.

#### 3.3 Test Frontend Installation
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

?  Local:   http://localhost:3000/
```

Open http://localhost:3000 in your browser.

**Note:** The frontend needs the backend to be running for full functionality.

### 4. Running Both Services

You need both backend and frontend running simultaneously.

#### Option A: Two Terminal Windows

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option B: Docker Compose (If you have Docker)

From the root directory:
```bash
docker-compose up
```

This starts both services automatically.

### 5. First Test

1. **Open your browser to http://localhost:3000**

2. **Select a category** (e.g., "IT")

3. **Upload a test document**
   - You can use any PDF or Word document
   - For best results, use a document that contains sections like:
     - Pre-checks or Prerequisites
     - Operation/Implementation Steps
     - Rollback/Recovery Steps

4. **Click "Analyze MOP"**
   - The analysis will take 30-90 seconds
   - You'll see a loading indicator

5. **Review Results**
   - Check the scores for each section
   - Review recommendations
   - Download the PDF report

## Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError`**
```
Solution: Make sure virtual environment is activated and requirements are installed:
source venv/bin/activate
pip install -r requirements.txt
```

**Problem: `OpenAI API Error` or `Tavily API Error`**
```
Solution: Check your API keys in .env file:
- Keys must be valid and active
- OpenAI account must have credits
- No extra spaces or quotes around keys
```

**Problem: `Port 8000 already in use`**
```
Solution: Either:
1. Stop other service using port 8000
2. Or change port in backend/app/main.py (line with uvicorn.run)
```

### Frontend Issues

**Problem: `npm install` fails**
```
Solution: 
1. Clear npm cache: npm cache clean --force
2. Delete node_modules: rm -rf node_modules
3. Try again: npm install
```

**Problem: `Cannot connect to backend`**
```
Solution: 
1. Make sure backend is running on port 8000
2. Check browser console for CORS errors
3. Verify ALLOWED_ORIGINS in backend/.env includes http://localhost:3000
```

**Problem: Page shows but upload doesn't work**
```
Solution:
1. Check backend is running
2. Check browser console (F12) for errors
3. Verify file is PDF or DOCX and under 10MB
```

### Common Issues

**API Rate Limits:**
- OpenAI has rate limits based on your plan
- If you get rate limit errors, wait a few minutes
- Consider upgrading your OpenAI plan for higher limits

**Document Processing:**
- Some PDFs with images/scans may not extract text properly
- Use text-based PDFs or Word documents for best results
- Ensure document is not password protected

**Memory Issues:**
- Large documents (>5MB) may take longer to process
- If system runs out of memory, try smaller documents

## Next Steps

1. **Read the full README.md** for detailed usage instructions

2. **Explore the API documentation** at http://localhost:8000/docs

3. **Try different categories** to see how analysis varies

4. **Customize scoring** (advanced): Edit `backend/app/services/mop_analyzer.py`

5. **Deploy to production**: See README.md deployment section

## Getting Help

If you encounter issues:

1. **Check the logs**: Look at terminal output for error messages
2. **Verify configuration**: Double-check .env files
3. **Test API keys**: Make sure they work independently
4. **Check documentation**: See README.md for more details
5. **Report bugs**: Open an issue with error details

## Useful Commands

```bash
# Backend
cd backend
source venv/bin/activate  # Activate virtual environment
python run.py            # Start backend server
pip list                 # See installed packages

# Frontend
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Docker
docker-compose up        # Start all services
docker-compose down      # Stop all services
docker-compose logs      # View logs
```

## Security Reminders

- ? Never commit .env files to version control
- ? Keep API keys secret
- ? Use strong SECRET_KEY in production
- ? Enable HTTPS in production
- ? Regularly update dependencies

---

**Congratulations!** ?? You've successfully set up the ITIL 4 MOP Analyzer!
