#!/bin/bash
# Quick API test script

API_URL=${API_URL:-http://localhost:3000}
API_KEY=${X_API_KEY:-demo-api-key}

echo "🧪 Testing Telco MOP Analysis Agent API"
echo "API URL: $API_URL"
echo ""

# Test 1: Health check
echo "1️⃣  Testing health endpoint..."
curl -s "$API_URL/api/health" | jq '.'
if [ $? -eq 0 ]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

echo ""

# Test 2: Analyze sample MOP
if [ -f "samples/full_mop.docx" ]; then
    echo "2️⃣  Testing analyze endpoint with full_mop.docx..."
    RESPONSE=$(curl -s -X POST "$API_URL/api/analyze" \
      -H "X-API-KEY: $API_KEY" \
      -F "mop=@samples/full_mop.docx" \
      -F "category=IPCORE")
    
    TOTAL_SCORE=$(echo "$RESPONSE" | jq -r '.totalScore')
    
    if [ "$TOTAL_SCORE" != "null" ]; then
        echo "✅ Analysis completed"
        echo "📊 Total Score: $TOTAL_SCORE/10"
        echo "$RESPONSE" | jq '{totalScore, confidence, recommendations: .recommendations[:3]}'
    else
        echo "❌ Analysis failed"
        echo "$RESPONSE" | jq '.'
        exit 1
    fi
else
    echo "⚠️  Sample file not found. Run 'cd samples && python generate_samples.py' first"
fi

echo ""
echo "✅ All tests passed!"
