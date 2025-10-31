#!/bin/bash

# ITIL 4 MOP Analyzer - Stop Script
# This script stops both backend and frontend servers

echo "?? Stopping ITIL 4 MOP Analyzer..."
echo ""

# Stop backend
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        echo "? Backend stopped"
    else
        echo "??  Backend process not found"
    fi
    rm .backend.pid
else
    echo "??  No backend PID file found"
fi

# Stop frontend
if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        echo "? Frontend stopped"
    else
        echo "??  Frontend process not found"
    fi
    rm .frontend.pid
else
    echo "??  No frontend PID file found"
fi

# Also kill any remaining processes on ports 8000 and 3000
echo ""
echo "Cleaning up ports..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "? Port 8000 cleared"
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "? Port 3000 cleared"

echo ""
echo "? All services stopped successfully!"
