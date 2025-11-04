#!/bin/bash
# Setup script for Telco MOP Analysis Agent

set -e

echo "🚀 Setting up Telco MOP Analysis Agent..."
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env and set your X_API_KEY and TAVILY_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Generate sample DOCX files
if [ ! -f samples/full_mop.docx ]; then
    echo "📄 Generating sample MOP documents..."
    command -v python3 >/dev/null 2>&1 || { echo "⚠️  Python 3 not found. Skipping sample generation." >&2; }
    
    if command -v python3 >/dev/null 2>&1; then
        cd samples
        pip install -r requirements.txt -q
        python3 generate_samples.py
        cd ..
        echo "✅ Sample documents generated"
    fi
else
    echo "✅ Sample documents already exist"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env file and set your API keys"
echo "  2. Run: docker-compose up -d"
echo "  3. Visit: http://localhost:8080"
echo ""
echo "For more information, see QUICKSTART.md"
