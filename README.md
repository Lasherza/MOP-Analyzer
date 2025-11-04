# Telco MOP Analysis Agent

A production-ready full-stack application that analyzes DOCX Method of Procedure (MOP) documents for **ITIL4 Change Enablement** best practices and **Telco-category-specific** compliance.

[![CI/CD](https://github.com/yourusername/telco-mop-agent/workflows/CI/badge.svg)](https://github.com/yourusername/telco-mop-agent/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

- **Automated MOP Analysis**: Upload DOCX files and receive instant quality scores
- **ITIL4 Compliance Checking**: Validates against Change Enablement best practices
- **Category-Specific Scoring**: Tailored evaluation for 9 Telco categories
- **Industry Best Practices**: Integrates with Tavily API to fetch real-time best practices
- **Detailed Breakdown**: Scores across 5 dimensions (Presence, Clarity, Verifiability, Safety, Compliance)
- **Actionable Recommendations**: Get specific improvement suggestions
- **Multiple Export Formats**: Download results as JSON or PDF
- **Production-Ready**: Docker, CI/CD, comprehensive tests, security hardening

## 📊 Scoring & ITIL4 Mapping

### Scoring Formula

Each section (Pre-Checks, Operation Steps, Rollback Steps) is scored 0-10 based on:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Presence** | 30% | Does the section exist with meaningful content? |
| **Clarity** | 25% | Are steps clear, specific, and actionable? |
| **Verifiability** | 20% | Are there verification/validation steps? |
| **Safety** | 15% | Are there safety checks, impact assessment, rollback triggers? |
| **Compliance** | 10% | Does it match Telco/category best practices? |

**Total Score** = (Pre-Checks × 35%) + (Operation Steps × 40%) + (Rollback Steps × 25%)

### ITIL4 Change Enablement Practice Mapping

The scoring engine implements checks based on ITIL4 Change Enablement practices:

#### 1. Pre-Checks Section → ITIL4 Change Authorization & Assessment

| ITIL4 Practice | Implementation | Check Weight |
|----------------|----------------|--------------|
| **Change Authorization** | Verifies CAB approval, change request documentation | 0.5 |
| **Risk Assessment** | Checks for risk/impact analysis keywords | 0.75 |
| **Resource Verification** | Validates resource availability checks | 1.0 |
| **Dependency Identification** | Ensures prerequisites and dependencies listed | 0.75 |
| **Success Criteria** | Confirms expected outcomes defined | 1.25 |
| **Owner Assignment** | Validates responsible party identification | 1.25 |

**Scoring Logic**:
```typescript
// Example: Change Authorization check
{
  name: 'ITIL4 change authorization check',
  weight: 0.5,
  test: () => containsKeywords(content, [
    'authorization', 'approval', 'change request', 'CAB', 'approved'
  ]),
  message: 'ITIL4: Change authorization should be verified'
}
```

#### 2. Operation Steps → ITIL4 Change Execution & Monitoring

| ITIL4 Practice | Implementation | Check Weight |
|----------------|----------------|--------------|
| **Clear Execution Plan** | Validates step-by-step procedures with action verbs | 1.25 |
| **Monitoring During Change** | Checks for monitoring/logging keywords | 0.5 |
| **Communication** | Verifies stakeholder notification steps | 0.75 |
| **Verification Steps** | Ensures post-execution validation | 1.0 |
| **Expected Outcomes** | Confirms outcome specifications | 1.0 |
| **Safety Warnings** | Checks for caution/warning statements | 0.75 |

**Actionability Check**:
- At least 60% of steps must start with action verbs (run, execute, verify, check, etc.)
- Steps must be numbered or clearly sequenced

#### 3. Rollback Steps → ITIL4 Remediation & Recovery

| ITIL4 Practice | Implementation | Check Weight |
|----------------|----------------|--------------|
| **Rollback Triggers** | Validates defined failure criteria | 1.25 |
| **Recovery Procedures** | Ensures detailed rollback steps | 1.5 |
| **Data Protection** | Checks for backup/snapshot mentions | 0.75 |
| **State Validation** | Verifies system restoration checks | 1.0 |
| **Decision Authority** | Confirms escalation/approval paths | 0.5 |
| **Impact Assessment** | Validates rollback risk consideration | 0.75 |

### Category-Specific Compliance (Tavily Integration)

The **Compliance (10%)** dimension uses Tavily API to fetch industry best practices:

1. **Query Construction**: System builds targeted queries like:
   - `"{category} MOP best practices telecom"`
   - `"{category} change management procedure ITIL"`
   - `"{category} rollback strategy best practices"`

2. **Evidence Collection**: Prioritizes authoritative sources:
   - ITU, GSMA, 3GPP (Telecom standards)
   - TM Forum, ETSI (Industry frameworks)
   - IEEE (Technical standards)

3. **Keyword Matching**: Extracts significant terms (5+ characters) from evidence snippets and checks if MOP content contains at least 2 matching keywords.

4. **Scoring Impact**: 
   - Match found: +0.5 to Compliance score
   - No match: 0 (baseline ITIL4 checks still apply)

**Example**:
```
Category: IPCORE
Evidence Snippet: "BGP routing changes require peer notification, 
                   configuration backup, and gradual rollout"
MOP Content: "Notify BGP peers, backup router config, deploy incrementally"
Result: ✓ Match (keywords: backup, configuration, notification) → +0.5 score
```

## 🏗️ Architecture

```
┌─────────────────┐
│   React SPA     │  ← User uploads DOCX + selects category
│   (Vite)        │
└────────┬────────┘
         │ HTTP POST /api/analyze
         ↓
┌─────────────────┐
│  Express API    │  ← API Key Auth, Rate Limiting
│  (TypeScript)   │
└────────┬────────┘
         │
    ┌────┴──────────┬──────────────┐
    ↓               ↓              ↓
┌────────┐    ┌──────────┐   ┌──────────┐
│ DOCX   │    │ Scoring  │   │ Tavily   │
│ Parser │    │ Engine   │   │ Client   │
│(Mammoth│    │(ITIL4)   │   │(Cache)   │
└────────┘    └──────────┘   └──────────┘
    │               │              │
    └───────────────┴──────────────┘
                    ↓
            ┌──────────────┐
            │ Analysis     │
            │ Result       │
            │ (JSON/PDF)   │
            └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** (recommended)
- OR: Node.js 18+, Python 3.8+ (for local development)

### Option 1: Docker Compose (Recommended)

1. **Clone and configure**:
```bash
git clone https://github.com/yourusername/telco-mop-agent.git
cd telco-mop-agent

# Create .env file
cp .env.example .env
# Edit .env and set X_API_KEY and TAVILY_API_KEY
```

2. **Generate sample MOP files**:
```bash
cd samples
pip install -r requirements.txt
python generate_samples.py
cd ..
```

3. **Start services**:
```bash
docker-compose up -d
```

4. **Access the application**:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api/docs

### Option 2: Local Development

**Backend**:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📚 Usage

### Web UI

1. Open http://localhost:8080
2. Select a **Telco Category** from dropdown
3. Upload a **DOCX MOP file**
4. Click **Analyze MOP**
5. View detailed scores, recommendations, and evidence
6. Download JSON or PDF report

### API (cURL)

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "X-API-KEY: your-api-key" \
  -F "mop=@samples/full_mop.docx" \
  -F "category=IPCORE" \
  | jq
```

### Demo Script

```bash
cd scripts
npm install
node demo.js ../samples/full_mop.docx ipcore
```

**Available Categories**:
- `ipcore` → IPCORE
- `packet` → Packet Core
- `billing` → Billing and Revenue → Charging/Revenue Management
- `radio` → Radio Network
- `transmission` → Transmission Network
- `devops` → DevOps and Systems (OSS and BSS)
- `it` → IT
- `security` → Cyber Security
- `data` → Data Engineering

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
npm run test:watch  # Watch mode
```

### Run Integration Tests
```bash
# Generate samples first
cd samples && python generate_samples.py && cd ..

# Run with docker-compose
docker-compose up -d
# Wait for services to be healthy
curl http://localhost:3000/api/health
```

### Sample Files

Three sample MOP documents are provided:

1. **full_mop.docx**: Complete, well-structured MOP (expected score: 8-9)
2. **partial_mop.docx**: MOP with missing verification steps (expected score: 5-6)
3. **poor_mop.docx**: Minimal, poorly structured MOP (expected score: 2-3)

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Backend server port |
| `NODE_ENV` | No | development | Environment (development/production) |
| `X_API_KEY` | **Yes** | - | API authentication key |
| `TAVILY_API_KEY` | No | - | Tavily API key (category-specific scoring disabled without it) |
| `CACHE_TTL_SECONDS` | No | 3600 | Tavily response cache TTL |
| `USE_CACHE` | No | true | Enable/disable caching |
| `MAX_FILE_SIZE_BYTES` | No | 10485760 | Max upload size (10MB) |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Max requests per window |

## 🔒 Security

- **API Key Authentication**: All endpoints require `X-API-KEY` header
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Validation**: Only .docx files accepted, max 10MB
- **Input Sanitization**: All user inputs validated and sanitized
- **Helmet.js**: Security headers enabled
- **CORS**: Configurable allowed origins
- **No Data Retention**: Uploaded files deleted immediately after processing
- **Secrets Management**: Never commit `.env` files

## 📖 API Documentation

Full OpenAPI/Swagger documentation available at: http://localhost:3000/api/docs

### Key Endpoints

#### `POST /api/analyze`
Analyze a MOP document.

**Request**:
- Headers: `X-API-KEY: <key>`
- Body (multipart/form-data):
  - `mop`: DOCX file
  - `category`: Telco category string

**Response** (200 OK):
```json
{
  "scores": {
    "preChecks": { "score": 8.5, "breakdown": {...}, "checks": [...] },
    "operationSteps": { "score": 7.8, "breakdown": {...}, "checks": [...] },
    "rollbackSteps": { "score": 8.2, "breakdown": {...}, "checks": [...] }
  },
  "totalScore": 8.1,
  "recommendations": ["..."],
  "evidence": [{"title": "...", "link": "...", "snippet": "..."}],
  "confidence": 0.95,
  "metadata": { "category": "IPCORE", "tavilyUsed": true, ... }
}
```

#### `POST /api/analyze/pdf`
Generate PDF report (same parameters as `/analyze`).

#### `GET /api/health`
Health check endpoint.

## 🛠️ Development

### Project Structure

```
telco-mop-agent/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── docxParser.ts       # DOCX parsing with mammoth
│   │   │   ├── scoringEngine.ts    # ITIL4 scoring logic
│   │   │   └── tavilyClient.ts     # Tavily API integration
│   │   ├── routes/
│   │   │   └── analyze.ts          # API endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts             # API key authentication
│   │   │   └── errorHandler.ts     # Global error handling
│   │   ├── utils/
│   │   │   ├── logger.ts           # Winston logging
│   │   │   └── pdfGenerator.ts     # PDF report generation
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript definitions
│   │   └── server.ts               # Express app
│   ├── __tests__/                  # Unit & integration tests
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Results.tsx         # Results display
│   │   ├── App.tsx                 # Main component
│   │   ├── types.ts                # TypeScript types
│   │   └── index.css               # Styles
│   ├── Dockerfile
│   └── package.json
├── samples/
│   ├── generate_samples.py         # Creates sample DOCX files
│   └── *.docx                      # Sample MOP documents
├── scripts/
│   └── demo.js                     # CLI demo script
├── .github/workflows/
│   └── ci.yml                      # GitHub Actions CI/CD
├── docker-compose.yml
└── README.md
```

### Adding New Checks

To add a new ITIL4 check to the scoring engine:

1. Edit `backend/src/services/scoringEngine.ts`
2. Add check to appropriate section's `checks` array:
```typescript
{
  name: 'My new check',
  weight: 0.5,  // Adjust based on importance
  test: () => this.containsKeywords(section.content, ['keyword1', 'keyword2']),
  message: 'Description of what should be included'
}
```
3. Ensure total weights per section = 10.0
4. Update tests in `backend/src/__tests__/scoringEngine.test.ts`

## 🚢 Deployment

### Docker Hub
```bash
# Build and tag
docker build -t yourorg/telco-mop-backend:latest ./backend
docker build -t yourorg/telco-mop-frontend:latest ./frontend

# Push
docker push yourorg/telco-mop-backend:latest
docker push yourorg/telco-mop-frontend:latest
```

### Kubernetes
See `docs/kubernetes-deployment.md` for Helm charts and manifests.

### Cloud Platforms
- **AWS**: ECS with Fargate or EKS
- **Azure**: Container Instances or AKS
- **GCP**: Cloud Run or GKE

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ITIL4 Framework**: Axelos ITIL4 Change Enablement practice
- **Tavily API**: Industry best-practice knowledge source
- **Mammoth.js**: DOCX parsing library
- **Telco Standards**: ITU, GSMA, 3GPP, TM Forum, ETSI

## 📧 Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/telco-mop-agent/issues
- Email: support@example.com

---

Built with ❤️ for Telco Change Management Excellence
