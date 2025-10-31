#!/bin/bash

# ITIL 4 MOP Analyzer - Quick Start Script
# This script starts both backend and frontend servers

echo "?? Starting ITIL 4 MOP Analyzer..."
echo ""

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "? Error: backend/.env file not found!"
    echo "Please copy backend/.env.example to backend/.env and configure your API keys."
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo "??  Warning: Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check ports
check_port 8000 || echo "Backend may not start if port 8000 is busy"
check_port 3000 || echo "Frontend may not start if port 3000 is busy"
echo ""

# Start backend
echo "?? Starting Backend Server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Start backend in background
echo "Starting FastAPI server on http://localhost:8000"
python run.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend
echo ""
echo "?? Starting Frontend Server..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "Starting React development server on http://localhost:3000"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

cd ..

# Save PIDs for cleanup
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo "? Services started successfully!"
echo ""
echo "?? Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "?? Logs:"
echo "   Backend:   tail -f backend.log"
echo "   Frontend:  tail -f frontend.log"
echo ""
echo "?? To stop all services, run: ./stop.sh"
echo ""
