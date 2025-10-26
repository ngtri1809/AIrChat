#!/bin/bash
# AIrChat - Start all services

echo "🌍 Starting AIrChat Services..."
echo ""

# Start API Gateway (Express)
echo "📍 Starting API Gateway (port 3000)..."
cd api && node server.js &
API_PID=$!
sleep 2

# Start Backend Service (FastAPI)
echo "🔬 Starting Backend Service (port 8000)..."
cd ../svc
source .venv/bin/activate
uvicorn main:app --reload --port 8000 &
SVC_PID=$!
sleep 2

# Start Frontend (Vite)
echo "⚛️  Starting Frontend (port 5173)..."
cd ../web
npm run dev &
WEB_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📍 API Gateway:       http://localhost:3000"
echo "🔬 Backend Service:   http://localhost:8000"
echo "⚛️  Frontend:          http://localhost:5173"
echo ""
echo "API Docs:            http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "kill $API_PID $SVC_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
