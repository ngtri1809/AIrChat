# AI Orchestration Implementation Plan - AIrChat with LangChain

**Date**: October 12, 2025  
**Project**: AIrChat  
**Branch**: anhnguyen-api  
**Focus**: AI Chat Integration with LangChain + Air Quality Tools

## 🎯 Overview

Transform AIrChat from mock chat responses to intelligent AI-powered conversations with:
- **LangChain orchestration** for LLM management
- **Multiple LLM Options**: OpenAI GPT-4o-mini, Google Gemini, Claude
- **Air Quality Tool** integration (query real AQI data)
- **Conversation memory** for context awareness
- **Vector DB (ChromaDB/FAISS)** for RAG knowledge base
- **Smart routing** between general chat and air quality queries

---

## 📋 Implementation Tasks

### Phase 1: AI Backend Setup (Day 5)

#### Task 1.1: Setup LangChain Environment
- [ ] Install LangChain dependencies
  ```bash
  cd svc
  source venv/bin/activate
  pip install langchain langchain-openai langchain-google-genai langchain-community
  pip install python-dotenv openai google-generativeai
  pip install chromadb  # Vector DB for RAG
  # pip install faiss-cpu  # Alternative: FAISS for RAG
  ```
- [ ] Add API keys to `.env`
  ```env
  # LLM Options (choose one or multiple)
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4o-mini
  
  GOOGLE_API_KEY=AIza...
  GOOGLE_MODEL=gemini-1.5-flash  # or gemini-1.5-pro
  
  # LLM Provider (openai, google, or both)
  LLM_PROVIDER=google  # Default to Google Gemini (free tier!)
  
  # Vector DB
  VECTOR_DB=chromadb  # or faiss
  ```
- [ ] Test LLM connections (OpenAI + Google)

**Files**: `svc/requirements.txt` (update)  
**Time**: 20 mins

---

#### Task 1.2: Create Air Quality Tool for LangChain
- [ ] Create `svc/tools/air_quality_tool.py`
- [ ] Implement LangChain Tool wrapper around existing AQI service
- [ ] Tool should accept: `location` (city name) or `lat, lon`
- [ ] Tool should return: AQI, category, PM2.5, health recommendations
- [ ] Add tool description for LLM to understand when to use

**Functionality**:
```python
class AirQualityTool(BaseTool):
    name = "get_air_quality"
    description = """
    Get current air quality data for a location.
    Input: city name (e.g., 'San Jose, CA') or coordinates.
    Returns: AQI, pollutant levels, health recommendations.
    """
    
    def _run(self, location: str) -> str:
        # 1. Geocode location (use backend endpoint)
        # 2. Query air quality (use svc endpoint)
        # 3. Format response for LLM
        return formatted_result
```

**Files**: 
- `svc/tools/air_quality_tool.py` (NEW)
- `svc/tools/__init__.py` (NEW)

**Time**: 45 mins

---

#### Task 1.3: Create LangChain Agent Service
- [ ] Create `svc/ai_agent.py` - main LangChain orchestrator
- [ ] Initialize OpenAI LLM
- [ ] Setup conversation memory (ConversationBufferMemory)
- [ ] Register Air Quality Tool
- [ ] Create agent with tool execution capability
- [ ] Add system prompt for air quality assistant personality

**Architecture**:
```python
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate
import os

class AIrChatAgent:
    def __init__(self, llm_provider="google"):
        # Multi-LLM support
        if llm_provider == "google":
            self.llm = ChatGoogleGenerativeAI(
                model=os.getenv("GOOGLE_MODEL", "gemini-1.5-flash"),
                google_api_key=os.getenv("GOOGLE_API_KEY"),
                temperature=0.7
            )
        elif llm_provider == "openai":
            self.llm = ChatOpenAI(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                api_key=os.getenv("OPENAI_API_KEY"),
                temperature=0.7
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {llm_provider}")
        
        self.memory = ConversationBufferMemory()
        self.tools = [AirQualityTool()]
        self.agent = create_openai_tools_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=self.system_prompt
        )
    
    async def chat(self, message: str, session_id: str) -> str:
        # Execute agent with memory
        response = await self.agent.ainvoke({
            "input": message,
            "chat_history": self.memory.load(session_id)
        })
        return response["output"]
```

**System Prompt**:
```
You are AIrChat, a friendly AI assistant specializing in air quality 
and environmental health. You can:
- Answer questions about air quality in any location
- Provide health recommendations based on AQI levels
- Explain pollutants (PM2.5, PM10, O3, NO2, etc.)
- Give tips for staying safe during poor air quality

When users ask about air quality, use the get_air_quality tool.
Be conversational, helpful, and health-focused.
```

**Files**: `svc/ai_agent.py` (NEW)  
**Time**: 1 hour

---

#### Task 1.4: Create FastAPI Endpoints for AI Chat
- [ ] Add `/v1/chat` endpoint to `svc/main.py`
- [ ] Add `/v1/chat/stream` endpoint for SSE streaming
- [ ] Handle session management (store conversations by ID)
- [ ] Return structured responses

**Endpoints**:
```python
@app.post("/v1/chat")
async def chat(request: ChatRequest):
    """
    Non-streaming chat endpoint
    Body: {"message": str, "session_id": str}
    Returns: {"response": str, "session_id": str}
    """
    agent = get_agent_instance()
    response = await agent.chat(request.message, request.session_id)
    return {"response": response, "session_id": request.session_id}

@app.get("/v1/chat/stream")
async def chat_stream(message: str, session_id: str):
    """
    SSE streaming chat endpoint
    Returns: Server-Sent Events with token-by-token response
    """
    # Implement streaming with LangChain callbacks
```

**Files**: `svc/main.py` (UPDATE)  
**Time**: 45 mins

---

### Phase 2: Backend Integration (Day 5-6)

#### Task 2.1: Update Node.js Backend Proxy
- [ ] Update `backend/server.js` to proxy AI chat to Python service
- [ ] Route `/api/chat` → `http://localhost:8000/v1/chat`
- [ ] Route `/api/chat/stream` → `http://localhost:8000/v1/chat/stream`
- [ ] Remove mock chat responses
- [ ] Add error handling for Python service downtime

**Changes**:
```javascript
// Replace mock chat with proxy to Python AI service
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});
```

**Files**: `backend/server.js` (UPDATE)  
**Time**: 30 mins

---

#### Task 2.2: Session Management
- [ ] Implement session ID generation (UUID)
- [ ] Store session metadata in memory/Redis
- [ ] Add session cleanup (expire after 24h)
- [ ] Associate sessions with conversation history

**Files**: 
- `backend/session_manager.js` (NEW) or
- `svc/session_manager.py` (NEW)

**Time**: 30 mins

---

### Phase 3: Frontend Integration (Day 6)

#### Task 3.1: Update ChatContext for Real AI
- [ ] Remove mock message generation
- [ ] Update `sendMessage()` to call backend `/api/chat`
- [ ] Handle session ID in localStorage
- [ ] Add loading states during AI response
- [ ] Handle streaming responses (optional)

**Files**: `frontend/src/contexts/ChatContext.jsx` (UPDATE)  
**Time**: 30 mins

---

#### Task 3.2: Enhanced Chat UI for AI Features
- [ ] Add "typing..." indicator when AI is thinking
- [ ] Show when AI is using tools (e.g., "Checking air quality...")
- [ ] Display air quality cards inline in chat
- [ ] Add "Ask about air quality" quick prompts
- [ ] Error messages for AI service downtime

**Quick Prompts**:
- "What's the air quality in San Jose?"
- "Is it safe to exercise outside today?"
- "What's PM2.5 and why does it matter?"
- "Show me air quality near me"

**Files**: 
- `frontend/src/components/MessageBubble.jsx` (UPDATE)
- `frontend/src/components/QuickPrompts.jsx` (NEW)

**Time**: 45 mins

---

### Phase 4: Advanced Features (Day 7)

#### Task 4.1: Multi-Tool Support
- [ ] Create Weather Tool (OpenWeatherMap API)
- [ ] Create Health Recommendations Tool
- [ ] Create Location Tool (get user's location)
- [ ] Agent can chain multiple tools

**Example Flow**:
```
User: "Is it safe to run outside in San Jose?"
→ AI uses AirQuality Tool → Gets AQI: 85 (Moderate)
→ AI uses Weather Tool → Gets temp: 72°F, sunny
→ AI responds: "Air quality is moderate (AQI 85). 
   Generally safe for most people, but sensitive 
   individuals should consider a shorter workout."
```

**Files**: 
- `svc/tools/weather_tool.py` (NEW)
- `svc/tools/health_tool.py` (NEW)

**Time**: 1.5 hours

---

#### Task 4.2: RAG for Air Quality Knowledge
- [ ] Create vector store with air quality documents
- [ ] Index EPA guidelines, WHO standards, pollutant info
- [ ] Add retrieval tool for answering knowledge questions
- [ ] Choose vector DB: **ChromaDB** (recommended) or FAISS

**Vector DB Options**:

**Option 1: ChromaDB** (Recommended ✅)
- Persistent storage (SQLite backend)
- Built-in embedding support
- Easy to use, no separate server needed
- Better for development and small datasets
```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

vectorstore = Chroma(
    persist_directory="./vectorstore",
    embedding_function=OpenAIEmbeddings()
)
```

**Option 2: FAISS**
- Faster similarity search
- In-memory by default (can save to disk)
- Better for large datasets (10k+ docs)
- Facebook AI Research library
```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vectorstore = FAISS.from_documents(
    documents,
    OpenAIEmbeddings()
)
vectorstore.save_local("./vectorstore")
```

**Implementation**:
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader

# Load documents
loader = DirectoryLoader('./knowledge/aq_docs/', glob="**/*.md")
documents = loader.load()

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
texts = text_splitter.split_documents(documents)

# Create vector store (ChromaDB)
vectorstore = Chroma.from_documents(
    documents=texts,
    embedding=OpenAIEmbeddings(),
    persist_directory="./vectorstore/chroma"
) 

# Create retrieval tool
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
```

**Knowledge Base Topics**:
- EPA AQI standards and breakpoints
- Pollutant health effects (PM2.5, PM10, O3, NO2, SO2, CO)
- Outdoor activity guidelines by AQI level
- Indoor air quality tips
- Air purifier recommendations
- Wildfire smoke guidance
- Sensitive groups information

**Files**: 
- `svc/knowledge/aq_docs/` (NEW - markdown files)
- `svc/tools/knowledge_tool.py` (NEW)
- `svc/vectorstore/chroma/` or `svc/vectorstore/faiss/` (NEW)
- `svc/embeddings.py` (NEW - embedding utilities)

**Time**: 2 hours

---

#### Task 4.3: Streaming Responses
- [ ] Implement token-by-token streaming with LangChain
- [ ] Use LangChain streaming callbacks
- [ ] Update frontend to handle SSE streaming
- [ ] Show real-time typing effect

**Files**: 
- `svc/ai_agent.py` (UPDATE)
- `frontend/src/contexts/ChatContext.jsx` (UPDATE)

**Time**: 1 hour

---

### Phase 5: Polish & Testing (Day 8)

#### Task 5.1: Error Handling & Fallbacks
- [ ] Handle OpenAI API errors gracefully
- [ ] Fallback to simpler responses if tool fails
- [ ] Rate limiting for AI requests
- [ ] Cost monitoring (OpenAI token usage)

**Time**: 30 mins

---

#### Task 5.2: Testing
- [ ] Unit tests for Air Quality Tool
- [ ] Integration tests for agent flow
- [ ] Test conversation memory persistence
- [ ] Test multi-turn conversations
- [ ] Load testing for concurrent users

**Files**: 
- `svc/tests/test_air_quality_tool.py` (NEW)
- `svc/tests/test_agent.py` (NEW)

**Time**: 1 hour

---

#### Task 5.3: Documentation
- [ ] Create `AI_ARCHITECTURE.md`
- [ ] Document tool usage
- [ ] Add example conversations
- [ ] Update README with AI features

**Time**: 30 mins

---

## 🗂️ File Structure After Implementation

```
AIrChat/
├── backend/
│   ├── server.js (UPDATE - proxy to AI service)
│   └── session_manager.js (NEW)
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── QuickPrompts.jsx (NEW)
│       │   └── MessageBubble.jsx (UPDATE)
│       └── contexts/
│           └── ChatContext.jsx (UPDATE)
└── svc/
    ├── main.py (UPDATE - add chat endpoints)
    ├── ai_agent.py (NEW - LangChain orchestrator)
    ├── session_manager.py (NEW)
    ├── requirements.txt (UPDATE)
    ├── tools/
    │   ├── __init__.py (NEW)
    │   ├── air_quality_tool.py (NEW)
    │   ├── weather_tool.py (NEW)
    │   └── health_tool.py (NEW)
    ├── knowledge/
    │   └── aq_docs/ (NEW - markdown files)
    ├── vectorstore/ (NEW - FAISS index)
    └── tests/
        ├── test_air_quality_tool.py (NEW)
        └── test_agent.py (NEW)
```

---

## 📊 Dependencies to Install

### Python (svc/)
```bash
# Core LangChain
pip install langchain langchain-openai langchain-google-genai langchain-community

# LLM APIs
pip install openai google-generativeai

# Vector Databases (choose one or both)
pip install chromadb  # Recommended for ease of use
pip install faiss-cpu  # Alternative for performance

# Embeddings & Utilities
pip install tiktoken  # Token counting
pip install python-dotenv

# Document loaders
pip install pypdf  # for PDF support
pip install beautifulsoup4  # for HTML parsing
```

### Node.js (backend/)
```bash
npm install uuid  # Session IDs
```

---

## 🔑 Environment Variables Needed

```env
# LLM Provider Selection
LLM_PROVIDER=google  # Options: openai, google

# OpenAI (Optional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # or gpt-3.5-turbo

# Google Gemini (Recommended for free tier)
GOOGLE_API_KEY=AIza...
GOOGLE_MODEL=gemini-1.5-flash  # or gemini-1.5-pro

# Vector Database
VECTOR_DB=chromadb  # Options: chromadb, faiss
EMBEDDING_MODEL=text-embedding-3-small  # OpenAI embeddings

# OpenWeatherMap (optional)
OPENWEATHER_API_KEY=...

# Session
SESSION_EXPIRE_HOURS=24

# RAG Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
RETRIEVAL_K=3  # Number of documents to retrieve
```

---

## 💰 Cost Estimation & Comparison

### LLM Costs Comparison

#### Option 1: Google Gemini (Recommended 🌟)
**Gemini 1.5 Flash** (FREE TIER!)
- **Free quota**: 15 requests/minute, 1M requests/day
- Input: FREE up to 1M tokens/day
- Output: FREE up to 1M tokens/day
- **Perfect for hackathons and demos!**

**Gemini 1.5 Pro**
- Input: $0.125 / 1M tokens (cheaper than OpenAI!)
- Output: $0.375 / 1M tokens
- Free tier: 2 requests/minute

**Typical conversation (Gemini Flash)**:
- User message: ~50 tokens
- AI response: ~200 tokens
- Tool calls: ~100 tokens
- **Total per turn**: ~350 tokens = **$0.00 (FREE!)** 🎉

**For demo/hackathon**:
- 100 conversations = **FREE**
- 1000 conversations = **FREE**
- 10,000 conversations = **FREE** (within daily limits)

---

#### Option 2: OpenAI GPT-4o-mini
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens

**Typical conversation**:
- User message: ~50 tokens
- AI response: ~200 tokens
- Tool calls: ~100 tokens
- **Total per turn**: ~350 tokens = $0.0002

**For demo/hackathon**:
- 100 conversations = $0.02
- 1000 conversations = $0.20
- 10,000 conversations = $2.00

---

### Embeddings Costs

#### OpenAI Embeddings (text-embedding-3-small)
- Cost: $0.020 / 1M tokens
- Dimensions: 1536

**RAG Knowledge Base**:
- 50 documents (~100k words) = ~130k tokens
- One-time indexing cost: $0.0026
- Query embeddings: ~$0.00002 per query
- **Total for 1000 queries**: ~$0.025

#### Google Embeddings (embedding-001)
- Cost: **FREE** with Gemini API
- Dimensions: 768
- Perfect for small knowledge bases

---

### Vector Database Costs

#### ChromaDB (Recommended ✅)
- **Cost**: $0 (self-hosted, local storage)
- Storage: ~1MB per 1000 documents
- RAM usage: ~50MB for 10k documents
- Disk space: ~10MB for knowledge base

**Pros**:
- Free and open source
- Easy to use
- Persistent storage (SQLite)
- No separate server needed
- Good for < 100k documents

**Cons**:
- Slower than FAISS for large datasets
- Limited scalability

---

#### FAISS (Alternative)
- **Cost**: $0 (self-hosted, in-memory)
- RAM usage: ~100MB for 10k documents
- Disk space: ~20MB for saved index

**Pros**:
- Very fast similarity search
- Scalable to millions of vectors
- Facebook AI Research (battle-tested)
- Low memory footprint

**Cons**:
- In-memory by default (need to save/load)
- More complex setup
- No built-in persistence

---

### Total Cost Breakdown

#### Scenario 1: Google Gemini + ChromaDB (FREE! 🎉)
| Component | Cost |
|-----------|------|
| LLM (Gemini 1.5 Flash) | $0.00 (Free tier) |
| Embeddings (Google) | $0.00 (Free) |
| Vector DB (ChromaDB) | $0.00 (Self-hosted) |
| Storage (10MB) | $0.00 |
| **Total for 1000 conversations** | **$0.00** |

**Perfect for hackathons and MVPs!**

---

#### Scenario 2: OpenAI GPT-4o-mini + ChromaDB
| Component | Cost |
|-----------|------|
| LLM (gpt-4o-mini) | $0.20 |
| Embeddings (OpenAI) | $0.025 |
| Vector DB (ChromaDB) | $0.00 |
| Storage | $0.00 |
| **Total for 1000 conversations** | **$0.225** |

**Still very affordable!**

---

#### Scenario 3: OpenAI + FAISS
| Component | Cost |
|-----------|------|
| LLM (gpt-4o-mini) | $0.20 |
| Embeddings (OpenAI) | $0.025 |
| Vector DB (FAISS) | $0.00 |
| RAM (100MB) | $0.00 |
| **Total for 1000 conversations** | **$0.225** |

---

### Recommended Setup for Hackathon 🏆

**Best Choice**: **Google Gemini 1.5 Flash + ChromaDB**
- ✅ Completely FREE
- ✅ 15 requests/minute (plenty for demo)
- ✅ 1M tokens/day free quota
- ✅ Easy to set up
- ✅ No credit card required
- ✅ Good performance for chat

**Code Example**:
```python
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Free LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# Free embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001"
)

# Free vector DB (self-hosted)
vectorstore = Chroma(
    persist_directory="./vectorstore",
    embedding_function=embeddings
)
```

**Total cost for entire hackathon**: **$0.00** 🎉

---

## 🎯 Success Metrics

- [ ] AI can answer general air quality questions
- [ ] AI correctly uses air quality tool when needed
- [ ] Conversation memory works (remembers context)
- [ ] Streaming responses feel natural
- [ ] Response time < 3 seconds
- [ ] Tool execution < 1 second
- [ ] Zero errors in 100 test conversations

---

## 🚀 Quick Start (After Implementation)

```bash
# 1. Start Python AI service
cd svc
source venv/bin/activate
python main.py  # Port 8000

# 2. Start Node.js backend
cd backend
node server.js  # Port 3005

# 3. Start frontend
cd frontend
npm run dev  # Port 5173

# 4. Test AI chat
curl -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in San Jose?", "session_id": "test123"}'
```

---

## 📝 Example Conversations

### Conversation 1: Air Quality Query
```
User: What's the air quality like in San Jose today?

AI: Let me check the current air quality in San Jose for you.
[Uses air_quality_tool]

AI: The current air quality in San Jose is Moderate with an AQI of 83.
PM2.5 levels are at 27.5 µg/m³. This means:
- Air quality is acceptable for most people
- Unusually sensitive individuals should consider limiting prolonged outdoor exertion
- Generally safe for outdoor activities

Would you like tips for outdoor activities or more details about the pollutants?
```

### Conversation 2: Health Advice
```
User: Is it safe for my kids to play outside?

AI: Based on the current moderate air quality (AQI 83) in San Jose:
- Yes, it's generally safe for children to play outside
- Sensitive individuals (children with asthma) should watch for symptoms
- Consider shorter outdoor sessions (1-2 hours)
- Avoid high-traffic areas if possible

Would you like me to check the forecast for later today?
```

### Conversation 3: Educational
```
User: What is PM2.5?

AI: PM2.5 refers to fine particulate matter that is 2.5 micrometers or 
smaller in diameter - about 30 times smaller than a human hair!

These tiny particles can:
- Penetrate deep into lungs and bloodstream
- Cause respiratory and cardiovascular issues
- Come from vehicle exhaust, industrial emissions, wildfires

The EPA considers PM2.5 one of the most harmful air pollutants, which is 
why we prioritize it in our air quality monitoring.

Current PM2.5 in San Jose: 27.5 µg/m³ (Moderate level)
```

---

## ✅ Task Summary

**Total Tasks**: 13 major tasks  
**Estimated Time**: 10-12 hours  
**Priority**: High (core feature of AIrChat)  
**Dependencies**: OpenAI API key required

**Recommended Order**:
1. Day 5: Tasks 1.1 → 1.4 (AI Backend Setup)
2. Day 6: Tasks 2.1 → 3.2 (Integration)
3. Day 7: Tasks 4.1 → 4.3 (Advanced Features)
4. Day 8: Tasks 5.1 → 5.3 (Polish & Testing)

---

**Ready to start with Task 1.1? 🚀**
