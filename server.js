// ============================================================================
// TELCO MOP ANALYSIS AGENT - SERVER
// ============================================================================
// 
// This is a minimal Node/Express server that proxies requests to the Tavily API.
// It keeps API keys server-side and provides two endpoints for the frontend.
//
// PRODUCTION NOTES:
// 1. Add authentication middleware before deploying
// 2. Configure CORS to allow only your production domain
// 3. Add comprehensive error handling and logging
// 4. Implement request validation and sanitization
// 5. Add monitoring and alerting
// 6. Consider using a process manager (PM2) for production
// 7. Set up HTTPS with valid SSL certificates
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// CONFIGURATION
// ============================================================================

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_BASE = process.env.TAVILY_API_BASE || 'https://api.tavily.com';

if (!TAVILY_API_KEY) {
    console.warn('⚠️  WARNING: TAVILY_API_KEY not set. API calls will fail.');
    console.warn('   Set TAVILY_API_KEY in .env file or environment variables.');
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS - Configure for production
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
        : '*', // In production, specify exact domains
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' })); // Adjust limit as needed
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Static files - Serve the frontend
app.use(express.static(path.join(__dirname)));

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/browse
 * Proxy endpoint for Tavily browse/search API
 * 
 * Request body:
 * {
 *   "query": "Search query for best practices",
 *   "max_results": 6
 * }
 * 
 * Response:
 * {
 *   "results": [
 *     {
 *       "url": "https://example.com/resource",
 *       "title": "Resource Title",
 *       "snippet": "Brief description...",
 *       "source_type": "vendor|operator|standard"
 *     }
 *   ]
 * }
 */
app.post('/api/browse', async (req, res) => {
    try {
        const { query, max_results = 6 } = req.body;

        // Validation
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid request', 
                message: 'Query parameter is required and must be a string' 
            });
        }

        if (!TAVILY_API_KEY) {
            return res.status(500).json({ 
                error: 'Configuration error', 
                message: 'Tavily API key not configured on server' 
            });
        }

        // Call Tavily Search API
        // NOTE: Adjust endpoint and request format based on actual Tavily API documentation
        const tavilyResponse = await fetch(`${TAVILY_API_BASE}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TAVILY_API_KEY}`
            },
            body: JSON.stringify({
                query: query,
                max_results: Math.min(max_results, 10), // Cap at 10
                search_depth: 'advanced',
                include_answer: false,
                include_domains: [
                    'ietf.org',
                    'etsi.org',
                    '3gpp.org',
                    'tmforum.org',
                    'itil.org',
                    'iso.org'
                ]
            })
        });

        if (!tavilyResponse.ok) {
            const errorText = await tavilyResponse.text();
            console.error('Tavily browse error:', tavilyResponse.status, errorText);
            return res.status(tavilyResponse.status).json({ 
                error: 'Tavily API error', 
                message: `Failed to fetch browse results: ${tavilyResponse.statusText}`,
                details: errorText
            });
        }

        const data = await tavilyResponse.json();
        
        // Transform response to expected format
        const results = (data.results || []).map(item => ({
            url: item.url,
            title: item.title || 'Untitled',
            snippet: item.content || item.snippet || '',
            source_type: determineSourceType(item.url)
        }));

        res.json({ results });

    } catch (error) {
        console.error('Browse endpoint error:', error);
        res.status(500).json({ 
            error: 'Server error', 
            message: error.message 
        });
    }
});

/**
 * POST /api/evaluate
 * Proxy endpoint for Tavily LLM evaluation
 * 
 * Request body:
 * {
 *   "domain": "IPCORE",
 *   "sections": {
 *     "prechecks": "...",
 *     "operation": "...",
 *     "rollback": "..."
 *   },
 *   "references": ["url1", "url2"],
 *   "instructions": "Scoring rubric..."
 * }
 * 
 * Response:
 * {
 *   "scores": {
 *     "prechecks": 8,
 *     "operation": 6,
 *     "rollback": 5
 *   },
 *   "recommendations": "...",
 *   "explanation": "...",
 *   "references": ["url1", "url2"],
 *   "confidence": "high|medium|low"
 * }
 */
app.post('/api/evaluate', async (req, res) => {
    try {
        const { domain, sections, references = [], instructions } = req.body;

        // Validation
        if (!domain || !sections || !instructions) {
            return res.status(400).json({ 
                error: 'Invalid request', 
                message: 'domain, sections, and instructions are required' 
            });
        }

        if (!TAVILY_API_KEY) {
            return res.status(500).json({ 
                error: 'Configuration error', 
                message: 'Tavily API key not configured on server' 
            });
        }

        // Construct evaluation prompt
        const prompt = `
${instructions}

**Domain:** ${domain}

**MOP Sections to Evaluate:**

Pre-Checks:
${sections.prechecks || 'N/A'}

Operation Steps:
${sections.operation || 'N/A'}

Rollback Steps:
${sections.rollback || 'N/A'}

**Authoritative References:**
${references.map(url => `- ${url}`).join('\n')}

Provide your evaluation as valid JSON only, following the format specified in the instructions.
        `.trim();

        // Call Tavily LLM/Chat API
        // NOTE: Adjust endpoint and request format based on actual Tavily API documentation
        const tavilyResponse = await fetch(`${TAVILY_API_BASE}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TAVILY_API_KEY}`
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert telco change management analyst. Always respond with valid JSON.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: process.env.TAVILY_MODEL || 'gpt-4-turbo-preview',
                response_format: { type: 'json_object' },
                temperature: 0.3 // Lower temperature for more consistent scoring
            })
        });

        if (!tavilyResponse.ok) {
            const errorText = await tavilyResponse.text();
            console.error('Tavily evaluate error:', tavilyResponse.status, errorText);
            return res.status(tavilyResponse.status).json({ 
                error: 'Tavily API error', 
                message: `Failed to get evaluation: ${tavilyResponse.statusText}`,
                details: errorText
            });
        }

        const data = await tavilyResponse.json();
        
        // Parse JSON response from LLM
        let evaluation;
        try {
            const content = data.choices?.[0]?.message?.content || data.content || '{}';
            evaluation = typeof content === 'string' ? JSON.parse(content) : content;
        } catch (parseError) {
            console.error('Failed to parse LLM response:', parseError);
            return res.status(500).json({ 
                error: 'Parse error', 
                message: 'Failed to parse LLM evaluation response',
                raw_response: data
            });
        }

        // Validate response structure
        if (!evaluation.scores || !evaluation.recommendations || !evaluation.explanation) {
            console.warn('Incomplete evaluation response:', evaluation);
            return res.status(500).json({ 
                error: 'Invalid response', 
                message: 'LLM returned incomplete evaluation',
                partial_data: evaluation
            });
        }

        res.json(evaluation);

    } catch (error) {
        console.error('Evaluate endpoint error:', error);
        res.status(500).json({ 
            error: 'Server error', 
            message: error.message 
        });
    }
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        tavily_configured: !!TAVILY_API_KEY
    });
});

// ============================================================================
// DEFAULT ROUTE - Serve frontend
// ============================================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not found', 
        message: `Route ${req.method} ${req.url} not found` 
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred' 
            : err.message 
    });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine source type based on URL
 */
function determineSourceType(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('ietf.org') || 
        urlLower.includes('etsi.org') || 
        urlLower.includes('3gpp.org') || 
        urlLower.includes('iso.org')) {
        return 'standard';
    }
    
    if (urlLower.includes('tmforum.org') || 
        urlLower.includes('itil.org') || 
        urlLower.includes('axelos.com')) {
        return 'framework';
    }
    
    if (urlLower.includes('ericsson') || 
        urlLower.includes('nokia') || 
        urlLower.includes('huawei') ||
        urlLower.includes('cisco')) {
        return 'vendor';
    }
    
    return 'general';
}

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log('');
    console.log('🔧 Telco MOP Analysis Agent Server');
    console.log('=====================================');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔑 Tavily API configured: ${TAVILY_API_KEY ? '✅ Yes' : '❌ No'}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET  /                - Frontend UI`);
    console.log(`  POST /api/browse      - Search for best practices`);
    console.log(`  POST /api/evaluate    - Evaluate MOP sections`);
    console.log(`  GET  /api/health      - Health check`);
    console.log('');
    
    if (!TAVILY_API_KEY) {
        console.log('⚠️  WARNING: TAVILY_API_KEY not set!');
        console.log('   Create a .env file with: TAVILY_API_KEY=your_key_here');
        console.log('');
    }
});

module.exports = app; // Export for testing
