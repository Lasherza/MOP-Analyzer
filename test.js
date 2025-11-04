// ============================================================================
// SIMPLE TEST SCRIPT FOR MOP ANALYSIS SERVER
// ============================================================================
//
// Run with: node test.js
// Requires server to be running on http://localhost:3000
//
// For production, consider using Jest, Mocha, or similar testing frameworks
// ============================================================================

const http = require('http');

const SERVER_URL = 'http://localhost:3000';

// ============================================================================
// TEST UTILITIES
// ============================================================================

function testRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, SERVER_URL);
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : null;
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: parsed
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

function logTest(name, passed, message = '') {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}${message ? ': ' + message : ''}`);
}

// ============================================================================
// TEST CASES
// ============================================================================

async function testHealthEndpoint() {
    console.log('\n📋 Testing Health Endpoint...');
    
    try {
        const response = await testRequest('GET', '/api/health');
        
        logTest(
            'Health check returns 200', 
            response.status === 200
        );
        
        logTest(
            'Health check returns valid JSON', 
            response.body && typeof response.body === 'object'
        );
        
        logTest(
            'Health check includes status field', 
            response.body && response.body.status === 'ok'
        );
        
        console.log('   Response:', JSON.stringify(response.body, null, 2));
        
    } catch (error) {
        logTest('Health endpoint', false, error.message);
    }
}

async function testBrowseEndpoint() {
    console.log('\n📋 Testing Browse Endpoint...');
    
    const testQuery = {
        query: 'Find best practices for IPCORE network change management',
        max_results: 3
    };
    
    try {
        const response = await testRequest('POST', '/api/browse', testQuery);
        
        logTest(
            'Browse endpoint accepts POST requests', 
            response.status === 200 || response.status === 500 // 500 if API key not configured
        );
        
        if (response.status === 200) {
            logTest(
                'Browse returns results array', 
                response.body && Array.isArray(response.body.results)
            );
            
            if (response.body.results && response.body.results.length > 0) {
                const firstResult = response.body.results[0];
                logTest(
                    'Browse results have required fields', 
                    firstResult.url && firstResult.title
                );
                
                console.log(`   Returned ${response.body.results.length} results`);
                console.log('   Sample result:', JSON.stringify(firstResult, null, 2));
            }
        } else {
            console.log('   Note: API returned error (likely API key not configured)');
            console.log('   Response:', JSON.stringify(response.body, null, 2));
        }
        
    } catch (error) {
        logTest('Browse endpoint', false, error.message);
    }
}

async function testBrowseValidation() {
    console.log('\n📋 Testing Browse Input Validation...');
    
    try {
        // Test missing query
        const response1 = await testRequest('POST', '/api/browse', {});
        logTest(
            'Browse rejects empty query', 
            response1.status === 400
        );
        
        // Test invalid query type
        const response2 = await testRequest('POST', '/api/browse', { query: 123 });
        logTest(
            'Browse rejects non-string query', 
            response2.status === 400
        );
        
    } catch (error) {
        logTest('Browse validation', false, error.message);
    }
}

async function testEvaluateEndpoint() {
    console.log('\n📋 Testing Evaluate Endpoint...');
    
    const testEvaluation = {
        domain: 'IPCORE',
        sections: {
            prechecks: 'Check system health\nVerify backups\nGet approval',
            operation: 'Step 1: Login to system\nStep 2: Execute change\nStep 3: Verify',
            rollback: 'Restore from backup\nVerify system state'
        },
        references: [
            'https://www.itil.org/best-practices',
            'https://www.tmforum.org/standards'
        ],
        instructions: 'Evaluate these sections on a 0-10 scale. Return JSON with scores, recommendations, explanation, and references.'
    };
    
    try {
        const response = await testRequest('POST', '/api/evaluate', testEvaluation);
        
        logTest(
            'Evaluate endpoint accepts POST requests', 
            response.status === 200 || response.status === 500 // 500 if API key not configured
        );
        
        if (response.status === 200) {
            logTest(
                'Evaluate returns scores object', 
                response.body && response.body.scores
            );
            
            logTest(
                'Evaluate returns recommendations', 
                response.body && response.body.recommendations
            );
            
            logTest(
                'Evaluate returns explanation', 
                response.body && response.body.explanation
            );
            
            console.log('   Response:', JSON.stringify(response.body, null, 2));
        } else {
            console.log('   Note: API returned error (likely API key not configured)');
            console.log('   Response:', JSON.stringify(response.body, null, 2));
        }
        
    } catch (error) {
        logTest('Evaluate endpoint', false, error.message);
    }
}

async function testEvaluateValidation() {
    console.log('\n📋 Testing Evaluate Input Validation...');
    
    try {
        // Test missing required fields
        const response1 = await testRequest('POST', '/api/evaluate', {});
        logTest(
            'Evaluate rejects empty body', 
            response1.status === 400
        );
        
        // Test missing sections
        const response2 = await testRequest('POST', '/api/evaluate', {
            domain: 'IPCORE',
            instructions: 'Test'
        });
        logTest(
            'Evaluate rejects missing sections', 
            response2.status === 400
        );
        
    } catch (error) {
        logTest('Evaluate validation', false, error.message);
    }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
    console.log('');
    console.log('🧪 MOP Analysis Server - Test Suite');
    console.log('=====================================');
    console.log(`Testing server at: ${SERVER_URL}`);
    console.log('');
    console.log('⚠️  Note: Some tests may fail if TAVILY_API_KEY is not configured.');
    console.log('   This is expected and these tests validate error handling.');
    
    try {
        await testHealthEndpoint();
        await testBrowseEndpoint();
        await testBrowseValidation();
        await testEvaluateEndpoint();
        await testEvaluateValidation();
        
        console.log('');
        console.log('=====================================');
        console.log('✅ Test suite completed');
        console.log('');
        
    } catch (error) {
        console.error('');
        console.error('❌ Test suite failed with error:', error.message);
        console.error('');
        process.exit(1);
    }
}

// Check if server is running
http.get(`${SERVER_URL}/api/health`, (res) => {
    runAllTests();
}).on('error', (e) => {
    console.error('');
    console.error('❌ Cannot connect to server at', SERVER_URL);
    console.error('   Please start the server first: npm start');
    console.error('');
    process.exit(1);
});
