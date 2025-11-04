# 🔧 Telco MOP Analysis Agent - ITIL 4

An AI-powered web application for analyzing telecommunications Maintenance and Operations Procedures (MOPs) based on ITIL 4 best practices. This tool helps telco operators evaluate change management procedures for completeness, clarity, and compliance with industry standards.

## 🎯 Features

- **📄 Document Upload**: Upload `.docx` MOP documents with automatic text extraction
- **🏢 Domain-Specific Analysis**: Support for 9 telco domains (IPCORE, Packet Core, Billing, Radio, etc.)
- **🤖 AI-Powered Evaluation**: Uses Tavily AI to score MOPs on a 0-10 scale
- **📊 Comprehensive Scoring**: Evaluates Pre-Checks, Operation Steps, and Rollback procedures
- **🔍 Best Practice References**: Automatically finds authoritative guidelines and standards
- **💡 Actionable Recommendations**: Provides specific improvement suggestions
- **🛡️ Fallback Mode**: Local heuristic scoring when API is unavailable
- **🎨 Modern UI**: Clean, accessible, mobile-first interface

## 📋 Scoring Rubric

### Pre-Checks (0-10)
- Prerequisites and dependencies completeness
- Pre-change validations and verification steps
- Risk assessment and mitigation planning
- Contact/escalation lists and approvals
- Backout triggers and decision criteria

### Operation Steps (0-10)
- Clarity and unambiguous step descriptions
- Sequential ordering with dependencies
- Verification/validation after critical steps
- Idempotency and safety checks
- Timing windows and automation hooks
- Impact mitigation during execution

### Rollback Steps (0-10)
- Clear, reproducible rollback procedures
- Automated rollback or detailed runbooks
- Post-rollback verification steps
- Estimated RTO and dependency considerations
- Communication plans for rollback scenarios
- Trigger conditions for rollback

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get running in 60 seconds
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Production deployment guide

## 🚀 Quick Start

### Option 1: Frontend Only (Testing)

1. **Open the HTML file directly:**
   ```bash
   # Simply open index.html in your browser
   open index.html  # macOS
   xdg-open index.html  # Linux
   start index.html  # Windows
   ```

2. **Provide a Tavily API key** in the UI (client-side mode)
   - ⚠️ **WARNING**: This mode exposes your API key in the browser. Use only for testing!

### Option 2: With Server (Recommended)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your TAVILY_API_KEY
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

5. **Enable "Use server-side proxy"** checkbox in the UI

## 📁 Project Structure

```
.
├── index.html          # Single-file frontend (HTML + CSS + JS)
├── server.js           # Optional Node/Express server with proxy endpoints
├── package.json        # Node dependencies and scripts
├── test.js             # Simple test suite for API endpoints
├── .env.example        # Environment variable template
├── example-mop.txt     # Sample MOP document for testing
└── README.md           # This file
```

## 🔌 API Endpoints (Server Mode)

### POST `/api/browse`

Search for best-practice references.

**Request:**
```json
{
  "query": "Find best practices for IPCORE change management",
  "max_results": 6
}
```

**Response:**
```json
{
  "results": [
    {
      "url": "https://example.com/mop-guidelines",
      "title": "Operator MOP Guidelines",
      "snippet": "Best practices for...",
      "source_type": "standard"
    }
  ]
}
```

### POST `/api/evaluate`

Evaluate MOP sections using AI.

**Request:**
```json
{
  "domain": "IPCORE",
  "sections": {
    "prechecks": "Check prerequisites...",
    "operation": "Step 1: ...",
    "rollback": "Restore backup..."
  },
  "references": ["https://url1", "https://url2"],
  "instructions": "Scoring rubric..."
}
```

**Response:**
```json
{
  "scores": {
    "prechecks": 8,
    "operation": 6,
    "rollback": 5
  },
  "recommendations": "Add verification steps...",
  "explanation": "The MOP shows strong pre-checks but...",
  "references": ["https://url1"],
  "confidence": "high"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "tavily_configured": true
}
```

## 🧪 Testing

### Run Test Suite

```bash
# Start server in one terminal
npm start

# Run tests in another terminal
npm test
```

### Manual Testing with cURL

**Test browse endpoint:**
```bash
curl -X POST http://localhost:3000/api/browse \
  -H "Content-Type: application/json" \
  -d '{
    "query": "IPCORE network change best practices",
    "max_results": 3
  }'
```

**Test evaluate endpoint:**
```bash
curl -X POST http://localhost:3000/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "IPCORE",
    "sections": {
      "prechecks": "Verify system health",
      "operation": "Execute change",
      "rollback": "Restore backup"
    },
    "references": [],
    "instructions": "Score on 0-10 scale"
  }'
```

## 🔒 Security Considerations

### For Production Deployment

1. **API Key Management**
   - ✅ Store API keys in environment variables
   - ✅ Never commit `.env` files to version control
   - ✅ Use server-side proxy endpoints (never client-side)
   - ✅ Rotate keys regularly

2. **CORS Configuration**
   ```javascript
   // In .env
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Rate Limiting**
   - Configured at 100 requests per 15 minutes per IP
   - Adjust in `server.js` as needed

4. **Input Validation**
   - File type validation (only `.docx`)
   - File size limits (10MB default)
   - Request body validation on all endpoints

5. **Authentication** (Not Implemented)
   - Add JWT or session-based auth before production
   - Example middleware:
   ```javascript
   app.use('/api/', requireAuth);
   ```

6. **HTTPS**
   - Always use HTTPS in production
   - Use services like Let's Encrypt for free certificates

7. **Content Security Policy**
   - Add CSP headers to prevent XSS
   - Example:
   ```javascript
   app.use(helmet.contentSecurityPolicy({...}));
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TAVILY_API_KEY` | Yes | - | Your Tavily API key |
| `TAVILY_API_BASE` | No | `https://api.tavily.com` | Tavily API base URL |
| `TAVILY_MODEL` | No | `gpt-4-turbo-preview` | LLM model to use |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `ALLOWED_ORIGINS` | No | `*` | CORS allowed origins (comma-separated) |

### Customizing the Scoring Rubric

Edit the `SCORING_RUBRIC` constant in `index.html` (lines 350-395) or `server.js` to adjust:
- Point allocation for each criterion
- Penalty conditions
- Required JSON response format

## 📝 MOP Parsing

The tool automatically detects these section headings (case-insensitive):

**Pre-Checks:**
- Pre-Checks, Pre Checks, Prerequisites, Pre-Requisites, Pre-Conditions, Validations, Before You Begin

**Operation Steps:**
- Operation Steps, Procedure, Implementation Steps, Execution Steps, Change Steps, Detailed Steps, Steps

**Rollback Steps:**
- Rollback Steps, Rollback Plan, Backout Plan, Backout Steps, Recovery Steps, Revert Procedure

**Fallback:** If no headings detected, the document is split into three equal parts.

## 🎨 Customizing the UI

The frontend uses CSS custom properties for easy theming:

```css
:root {
    --primary: #0066cc;      /* Primary brand color */
    --success: #28a745;      /* Success/high scores */
    --warning: #ffc107;      /* Warnings/medium scores */
    --danger: #dc3545;       /* Errors/low scores */
    --light-bg: #f8f9fa;     /* Background color */
    --border: #dee2e6;       /* Border color */
    --text: #212529;         /* Text color */
    --text-secondary: #6c757d; /* Secondary text */
}
```

## 🔄 Integrating with Real Tavily API

### Current Implementation

The code includes **placeholder** Tavily API calls. To integrate with the real Tavily API:

1. **Update API endpoints** in `server.js`:
   ```javascript
   const TAVILY_API_BASE = 'https://api.tavily.com'; // Update this
   ```

2. **Adjust request format** based on Tavily documentation:
   ```javascript
   // In callTavilyBrowse function
   const tavilyResponse = await fetch(`${TAVILY_API_BASE}/search`, {
       // Adjust headers and body format per Tavily docs
   });
   ```

3. **Update response parsing** to match Tavily's actual response structure

4. **Test thoroughly** with your Tavily API key

### Expected Tavily API Behavior

**Browse/Search API** should return:
- List of URLs with titles and snippets
- Relevance to the search query
- Source type information (if available)

**Chat/LLM API** should:
- Accept a conversational prompt
- Support JSON output mode
- Return structured evaluation results

## 🐛 Troubleshooting

### "TAVILY_API_KEY not configured"
- Create a `.env` file with `TAVILY_API_KEY=your_key`
- Restart the server after adding the key

### "Cannot connect to server"
- Ensure server is running: `npm start`
- Check port 3000 is not in use
- Try `http://localhost:3000` instead of `http://127.0.0.1:3000`

### "Failed to parse document"
- Ensure file is a valid `.docx` format
- Try re-saving the document in Word
- Check file is not password-protected

### "Fallback mode activated"
- Tavily API is unreachable or key is invalid
- Check API key is correct
- Verify network connection
- Review server logs for detailed error

### Low/Inconsistent Scores
- Review the scoring rubric - it's intentionally strict
- Ensure MOP sections are well-structured
- Add missing elements highlighted in recommendations
- Check that section headings are recognized

## 📚 Additional Resources

- [ITIL 4 Foundation](https://www.axelos.com/certifications/itil-service-management/itil-4-foundation)
- [TM Forum Best Practices](https://www.tmforum.org/)
- [ETSI Standards](https://www.etsi.org/)
- [3GPP Specifications](https://www.3gpp.org/)

## 🤝 Contributing

This is a prototype/MVP. Suggested improvements:

1. **Enhanced MOP Parsing**
   - Add machine learning for section detection
   - Support more document formats (PDF, TXT, MD)

2. **Advanced Analytics**
   - Historical trend analysis
   - Comparison across multiple MOPs
   - Compliance dashboards

3. **Collaboration Features**
   - Multi-user support
   - Comments and annotations
   - Approval workflows

4. **Integration**
   - ServiceNow integration
   - Jira integration
   - Slack/Teams notifications

5. **Testing**
   - Comprehensive unit tests
   - Integration tests with mock APIs
   - E2E tests with Playwright/Cypress

## 📄 License

MIT License - Feel free to use and modify for your organization's needs.

## ⚠️ Disclaimer

This tool provides guidance based on ITIL 4 principles and AI analysis. It should supplement, not replace, expert human review of change procedures. Always validate recommendations against your organization's specific requirements and risk tolerance.

## 🆘 Support

For issues or questions:
1. Check this README's troubleshooting section
2. Review server logs for detailed error messages
3. Verify Tavily API configuration and connectivity
4. Ensure all prerequisites are installed (Node.js 16+)

---

**Built with ❤️ for Telco Operations Teams**
