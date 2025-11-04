# API Documentation

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication

All API endpoints require authentication via API key.

**Header**: `X-API-KEY: <your-api-key>`

### Error Response (401 Unauthorized)
```json
{
  "error": "Unauthorized",
  "message": "API key is required. Please provide X-API-KEY header."
}
```

## Rate Limiting

- **Window**: 15 minutes (900,000 ms)
- **Max Requests**: 100 per IP address

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check API health status. No authentication required.

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "tavilyEnabled": true
}
```

---

### 2. Analyze MOP Document

**POST** `/api/analyze`

Analyze a DOCX MOP document for ITIL4 compliance and best practices.

**Headers**:
- `X-API-KEY`: Required
- `Content-Type`: `multipart/form-data`

**Body** (form-data):
- `mop` (file): DOCX file (required, max 10MB)
- `category` (string): Telco category (required)

**Categories**:
- `IPCORE`
- `Packet Core`
- `Billing and Revenue → Charging/Revenue Management`
- `Radio Network`
- `Transmission Network`
- `DevOps and Systems (OSS and BSS)`
- `IT`
- `Cyber Security`
- `Data Engineering`

**Example Request** (cURL):
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "X-API-KEY: your-api-key" \
  -F "mop=@path/to/mop.docx" \
  -F "category=IPCORE"
```

**Response** (200 OK):
```json
{
  "scores": {
    "preChecks": {
      "score": 8.5,
      "breakdown": {
        "presence": 3.0,
        "clarity": 2.3,
        "verifiability": 1.8,
        "safety": 1.2,
        "compliance": 0.8
      },
      "checks": [
        {
          "name": "Section exists with content",
          "passed": true,
          "weight": 1.5,
          "message": "Pre-checks section must contain substantial content"
        }
        // ... more checks
      ],
      "missingItems": [
        "Risk or impact assessment should be included"
      ]
    },
    "operationSteps": {
      "score": 7.8,
      "breakdown": { /* ... */ },
      "checks": [ /* ... */ ],
      "missingItems": [ /* ... */ ]
    },
    "rollbackSteps": {
      "score": 8.2,
      "breakdown": { /* ... */ },
      "checks": [ /* ... */ ],
      "missingItems": [ /* ... */ ]
    }
  },
  "totalScore": 8.1,
  "recommendations": [
    "Consider peer review by experienced change manager",
    "Risk or impact assessment should be included"
  ],
  "evidence": [
    {
      "title": "ITIL4 Change Enablement Best Practices",
      "link": "https://example.com/itil4",
      "snippet": "Change approval and risk assessment are critical...",
      "relevance": 0.95,
      "usedInScoring": true
    }
  ],
  "rawExtraction": {
    "preChecks": {
      "heading": "Pre-Checks",
      "content": "...",
      "steps": ["Step 1", "Step 2"],
      "lineNumber": 5
    },
    "operationSteps": { /* ... */ },
    "rollbackSteps": { /* ... */ },
    "rawText": "Full document text...",
    "metadata": {
      "fileName": "mop.docx",
      "fileSize": 45632,
      "parsedAt": "2024-01-15T10:30:00.000Z",
      "totalSections": 3
    }
  },
  "confidence": 0.95,
  "metadata": {
    "category": "IPCORE",
    "analyzedAt": "2024-01-15T10:30:00.000Z",
    "processingTimeMs": 2345,
    "tavilyUsed": true
  }
}
```

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "error": "BadRequest",
  "message": "No file uploaded. Please provide a DOCX file.",
  "statusCode": 400
}
```

**400 Bad Request** - Invalid category:
```json
{
  "error": "BadRequest",
  "message": "Invalid category. Please select a valid Telco category.",
  "statusCode": 400
}
```

**413 Payload Too Large**:
```json
{
  "error": "PayloadTooLarge",
  "message": "File size exceeds maximum limit of 10MB",
  "statusCode": 413
}
```

**500 Internal Server Error**:
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
```

---

### 3. Generate PDF Report

**POST** `/api/analyze/pdf`

Analyze MOP and return PDF report instead of JSON.

**Headers**:
- `X-API-KEY`: Required
- `Content-Type`: `multipart/form-data`

**Body**: Same as `/api/analyze`

**Response** (200 OK):
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="mop-analysis-report.pdf"`
- Body: Binary PDF file

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "X-API-KEY: your-api-key" \
  -F "mop=@path/to/mop.docx" \
  -F "category=IPCORE" \
  -o report.pdf
```

---

## Response Schema

### SectionScore

```typescript
interface SectionScore {
  score: number;           // 0-10
  breakdown: {
    presence: number;      // 0-3
    clarity: number;       // 0-2.5
    verifiability: number; // 0-2
    safety: number;        // 0-1.5
    compliance: number;    // 0-1
  };
  checks: Array<{
    name: string;
    passed: boolean;
    weight: number;
    message: string;
  }>;
  missingItems: string[];
}
```

### TavilyEvidence

```typescript
interface TavilyEvidence {
  title: string;
  link: string;
  snippet: string;
  relevance: number;      // 0-1
  usedInScoring: boolean;
}
```

### AnalysisResult

```typescript
interface AnalysisResult {
  scores: {
    preChecks: SectionScore;
    operationSteps: SectionScore;
    rollbackSteps: SectionScore;
  };
  totalScore: number;               // 0-10 weighted average
  recommendations: string[];
  evidence: TavilyEvidence[];
  rawExtraction: ParsedMOP;
  confidence: number;               // 0-1
  metadata: {
    category: string;
    analyzedAt: string;            // ISO 8601 timestamp
    processingTimeMs: number;
    tavilyUsed: boolean;
  };
}
```

## Error Handling

All errors follow this format:

```typescript
interface APIError {
  error: string;        // Error type
  message: string;      // Human-readable message
  statusCode: number;   // HTTP status code
  details?: any;        // Optional additional details
}
```

## Best Practices

1. **Always provide API key**: Requests without `X-API-KEY` header will be rejected
2. **Check file size**: Keep DOCX files under 10MB
3. **Handle errors**: Implement proper error handling for 4xx and 5xx responses
4. **Respect rate limits**: Monitor rate limit headers and implement backoff
5. **Cache results**: Consider caching analysis results to avoid redundant API calls
6. **Validate category**: Ensure category string exactly matches one of the supported values

## Code Examples

### JavaScript (Node.js)

```javascript
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

async function analyzeMOP(filePath, category) {
  const form = new FormData();
  form.append('mop', fs.createReadStream(filePath));
  form.append('category', category);

  const response = await axios.post('http://localhost:3000/api/analyze', form, {
    headers: {
      ...form.getHeaders(),
      'X-API-KEY': process.env.API_KEY,
    },
  });

  return response.data;
}
```

### Python

```python
import requests

def analyze_mop(file_path, category):
    with open(file_path, 'rb') as f:
        files = {'mop': f}
        data = {'category': category}
        headers = {'X-API-KEY': 'your-api-key'}
        
        response = requests.post(
            'http://localhost:3000/api/analyze',
            files=files,
            data=data,
            headers=headers
        )
        
        return response.json()
```

### cURL

```bash
# Analyze and save JSON
curl -X POST http://localhost:3000/api/analyze \
  -H "X-API-KEY: your-api-key" \
  -F "mop=@mop.docx" \
  -F "category=IPCORE" \
  -o result.json

# Get PDF report
curl -X POST http://localhost:3000/api/analyze/pdf \
  -H "X-API-KEY: your-api-key" \
  -F "mop=@mop.docx" \
  -F "category=IT" \
  -o report.pdf
```

## Swagger/OpenAPI

Interactive API documentation is available at:
- Development: http://localhost:3000/api/docs
- Try out endpoints directly in the browser
- Download OpenAPI specification in JSON format
