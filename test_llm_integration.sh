#!/bin/bash
# AIrChat LLM Integration Test Script
# This script helps you test the complete LLM integration

echo "╔════════════════════════════════════════════════════════╗"
echo "║     AIrChat LLM Integration Test Suite                 ║"
echo "║     Testing OpenAI + Google Gemini Integration        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "svc/test_llm_connections.py" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "🔧 Step 1: Testing LLM API Connections"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd svc
source venv/bin/activate
python test_llm_connections.py

echo ""
echo "🔧 Step 2: Testing Complete Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Make sure both services are running:"
echo "   - Python AI service: python main.py (port 8000)"
echo "   - Node.js backend: npm start (port 3005)"
echo ""
echo "Press Enter to continue with integration tests..."
read

python test_llm_integration.py

echo ""
echo "🔧 Step 3: Manual Testing Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "You can also test manually with these commands:"
echo ""
echo "# Test AI service status"
echo "curl http://localhost:8000/v1/ai/status"
echo ""
echo "# Test direct AI chat"
echo 'curl -X POST http://localhost:8000/v1/chat \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"message": "Hello AIrChat!", "llm_provider": "google"}'"'"
echo ""
echo "# Test air quality integration"
echo 'curl -X POST http://localhost:8000/v1/chat \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"message": "What is the air quality in San Jose?", "llm_provider": "google"}'"'"
echo ""
echo "# Test backend proxy"
echo 'curl -X POST http://localhost:3005/api/chat \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"message": "Hello from frontend!", "llm_provider": "google"}'"'"
echo ""

echo "🎉 LLM Integration Test Complete!"
echo "Check the results above to see which tests passed."

