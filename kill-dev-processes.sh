#!/bin/bash

# Script to kill any lingering development processes
# This prevents port conflicts when restarting npm run dev

echo "🔍 Checking for running development processes..."

# Kill processes on frontend port (5173)
FRONTEND_PIDS=$(lsof -ti :5173)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "🛑 Killing frontend processes on port 5173: $FRONTEND_PIDS"
    kill -9 $FRONTEND_PIDS
else
    echo "✅ Port 5173 is free"
fi

# Kill processes on backend port (3005)
BACKEND_PIDS=$(lsof -ti :3005)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "🛑 Killing backend processes on port 3005: $BACKEND_PIDS"
    kill -9 $BACKEND_PIDS
else
    echo "✅ Port 3005 is free"
fi

# Kill processes on Python service port (8000)
PYTHON_PIDS=$(lsof -ti :8000)
if [ ! -z "$PYTHON_PIDS" ]; then
    echo "🛑 Killing Python service processes on port 8000: $PYTHON_PIDS"
    kill -9 $PYTHON_PIDS
else
    echo "✅ Port 8000 is free"
fi

echo "🎉 All development ports are now free!"
echo "You can now run 'npm run dev' without port conflicts."
