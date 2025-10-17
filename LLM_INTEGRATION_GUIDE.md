# AIrChat LLM Integration Setup Guide

## 🚀 Quick Start

### 1. Set Up API Keys

Edit the `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
# Edit .env with your actual API keys
```

Add your API keys to the `.env` file:

```env
# Backend Environment Variables
PORT=3005
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# LLM API Keys - Replace with your actual keys
OPENAI_API_KEY=sk-your-actual-openai-key-here
GOOGLE_API_KEY=AIza-your-actual-google-key-here

# LLM Model Configurations
OPENAI_MODEL=gpt-4o-mini
GOOGLE_MODEL=gemini-1.5-flash

# LLM Provider Selection
LLM_PROVIDER=google
```

### 2. Install Dependencies

```bash
# Python dependencies (already installed)
cd svc
source venv/bin/activate
pip install -r requirements.txt

# Node.js dependencies (if needed)
cd ../backend
npm install
```

### 3. Start Services

**Terminal 1 - Python AI Service:**
```bash
cd svc
source venv/bin/activate
python main.py
# Should start on http://localhost:8000
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm start
# Should start on http://localhost:3005
```

**Terminal 3 - Frontend (optional):**
```bash
cd frontend
npm run dev
# Should start on http://localhost:5173
```

### 4. Test LLM Integration

```bash
# Run the comprehensive test suite
./test_llm_integration.sh
```

Or test individual components:

```bash
# Test LLM connections only
cd svc
source venv/bin/activate
python test_llm_connections.py

# Test complete integration
python test_llm_integration.py
```

## 🧪 Manual Testing

### Test AI Service Status
```bash
curl http://localhost:8000/v1/ai/status
```

### Test Direct AI Chat
```bash
curl -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello AIrChat!", "llm_provider": "google"}'
```

### Test Air Quality Integration
```bash
curl -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in San Jose?", "llm_provider": "google"}'
```

### Test Backend Proxy
```bash
curl -X POST http://localhost:3005/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from frontend!", "llm_provider": "google"}'
```

## 🔧 Troubleshooting

### Common Issues

1. **API Keys Not Working**
   - Make sure you've replaced the placeholder values in `.env`
   - Verify your API keys are valid and have sufficient credits
   - Check that the keys are properly formatted (no extra spaces)

2. **Services Not Starting**
   - Check that ports 8000 and 3005 are not already in use
   - Make sure all dependencies are installed
   - Check the console output for error messages

3. **AI Service Unavailable**
   - The Node.js backend will fall back to mock responses if the Python service is down
   - Check that the Python service is running on port 8000
   - Verify that LangChain dependencies are installed

4. **Air Quality Data Issues**
   - The air quality service needs to be running for location-based queries
   - Check that OpenAQ API key is configured (if using real data)
   - The service will use demo data if the API is unavailable

### Service Status Endpoints

- **AI Service Status**: `http://localhost:8000/v1/ai/status`
- **Air Quality Service**: `http://localhost:8000/v1/aq/latest?lat=37.3382&lon=-121.8863`
- **Backend Health**: `http://localhost:3005/api/health`

## 📊 Expected Results

When everything is working correctly, you should see:

- ✅ LLM connections successful (OpenAI and/or Google)
- ✅ AI service status showing `ai_mode: true`
- ✅ Chat responses using real LLM instead of mock responses
- ✅ Air quality integration working (AI can fetch and explain air quality data)
- ✅ Backend proxy successfully forwarding to AI service

## 🎯 Next Steps

Once the basic integration is working, you can:

1. **Add more LangChain tools** (weather, health recommendations, etc.)
2. **Implement conversation memory** across sessions
3. **Add vector database** for RAG (Retrieval Augmented Generation)
4. **Enhance streaming** with real-time word-by-word generation
5. **Add more LLM providers** (Claude, local models, etc.)


