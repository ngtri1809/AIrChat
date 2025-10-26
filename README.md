# AIrChat 🌍💨

**AI-Powered Air Quality Chat with RAG Knowledge Base**

A production-ready conversational AI application combining real-time air quality data, LLM reasoning, and Retrieval-Augmented Generation (RAG) with EPA & WHO guidelines.

**Demo Date:** October 25, 2025 ✅ **COMPLETE**

**Demo Video:** [📺 Watch on YouTube](https://www.youtube.com/watch?v=5zbxqMgl2TQ)

## 🎯 Project Status

| Phase | Feature | Status |
|-------|---------|--------|
| 1-3 | Core Chat & Weather & Air Quality | ✅ Complete |
| 4A | RAG Setup (ChromaDB + Embeddings) | ✅ Complete |
| 4B | AI Agent Integration | ✅ Complete |
| 4C | Frontend UI (Citations & Status) | ✅ Complete |
| 5 | Production Ready | ✅ Ready |

## Tech Stack

### Frontend
- **React 18** + Vite + Tailwind CSS
- **Components:** ChatPane, CitationBubble, RAGStatus, MessageBubble
- **Context:** ChatContext (conversations), ThemeContext (dark/light mode)
- **Port:** 5174

### Backend Gateway
- **Node.js + Express** (Session management & API proxy)
- **Port:** 3005
- **Features:** Rate limiting, error handling, session tracking

### Python Service (FastAPI)
- **Port:** 8000
- **AI Agent:** LangChain ReAct with 5 tools
- **RAG Pipeline:** Local ChromaDB + Google Embeddings (FREE)
- **Knowledge Base:** EPA & WHO PDF guidelines (7 documents)

### Data Sources
- **OpenAQ API v3** - Real-time air quality measurements
- **Nominatim/OpenStreetMap** - Geocoding & location search
- **ChromaDB (Local)** - Vector storage for RAG (~10MB local)

## 🚀 Key Features

### Phase 1-3: Core Chat & Air Quality
✅ Real-time AQI display with EPA color coding
✅ Location search with geocoding
✅ NowCast PM2.5 calculations (EPA formula)
✅ Multiple pollutant support (PM2.5, PM10, O3, NO2)
✅ Conversational AI chat interface
✅ Dark/light theme support
✅ Message persistence (localStorage)

### Phase 4: RAG Knowledge Base Integration
✅ **Search Knowledge Base Tool** - AI can search EPA/WHO guidelines
✅ **Citation Display** - Sources shown with relevance scores [1] [2] [3]
✅ **RAG Status Indicator** - Real-time knowledge base status in header
✅ **Expandable Citations** - View document source, page, domain, score
✅ **7 Documents Loaded:**
   - EPA Air Quality Guide (Particle Pollution)
   - EPA AQI Technical Assistance Documents (2)
   - WHO Global Air Quality Guidelines
   - Technical reporting standards

### 🎨 UI Features
- ChatGPT-style interface with streaming responses
- Citation bubbles with expandable metadata
- RAG status indicator (Ready/Loading/Offline)
- Responsive sidebar with conversation management
- Dark mode optimization for accessibility
- Mobile-first responsive design

## Project Structure

```
AIrChat/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatHeader.jsx (+ RAGStatus)
│   │   │   ├── ChatPane.jsx
│   │   │   ├── CitationBubble.jsx (NEW - Phase 4C)
│   │   │   ├── MessageBubble.jsx (+ citations display)
│   │   │   ├── MessageComposer.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── RAGStatus.jsx (NEW - Phase 4C)
│   │   │   └── Sidebar.jsx
│   │   ├── contexts/
│   │   │   ├── ChatContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── server.js (+ GET /v1/rag/status endpoint)
│   ├── session_manager.js
│   └── package.json
├── svc/
│   ├── main.py (FastAPI + endpoints)
│   ├── ai_agent.py (5 tools including search_knowledge_base)
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── embeddings.py (Google/OpenAI models)
│   │   ├── vector_store.py (ChromaDB)
│   │   ├── document_loader.py (PDF chunking)
│   │   ├── retriever.py (MMR strategy)
│   │   └── rag_chain.py (Main RAG chain)
│   ├── data/
│   │   └── kb/
│   │       ├── epa/ (3 PDFs)
│   │       └── who/ (1 PDF)
│   ├── store/
│   │   └── chroma/airchat_vi_v1/ (Vector storage)
│   └── requirements.txt (RAG dependencies)
└── README.md
```

## ⚡ Quick Start (3 Terminals)

### Terminal 1: Frontend (React + Vite)
```bash
cd frontend
npm install  # First time only
npm run dev
# ✅ Runs on http://localhost:5174
```

### Terminal 2: Backend Gateway (Express)
```bash
cd backend
npm install  # First time only
npm run dev
# ✅ Runs on http://localhost:3005
```

### Terminal 3: Python Service (FastAPI + RAG)
```bash
cd svc
python3 -m venv .venv  # First time only
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt  # First time only
.venv/bin/python3 -m uvicorn main:app --reload --port 8000
# ✅ Runs on http://localhost:8000
```

**Then open:** http://localhost:5174 🎉

## 🔧 RAG Pipeline Architecture

### Phase 4A: RAG Setup
**Location:** `/svc/rag/` (5 modules)

1. **embeddings.py** (85 lines)
   - Google Embeddings: `text-embedding-004` (FREE tier) ✅
   - OpenAI Optional: `text-embedding-3-small` (paid)
   - Cost-aware model selection

2. **vector_store.py** (100 lines)
   - ChromaDB 0.5.3 local database
   - Storage: `/svc/store/chroma/airchat_vi_v1`
   - Persistence: Automatic saving

3. **document_loader.py** (115 lines)
   - PDF loading from `/svc/data/kb/`
   - Chunking: 800 tokens, 120 overlap
   - Auto-detection: EPA & WHO documents

4. **retriever.py** (155 lines)
   - MMR (Maximal Marginal Relevance) strategy
   - Similarity threshold: 0.12 (normalized)
   - Metadata filtering by domain

5. **rag_chain.py** (110 lines)
   - Combines retriever + LLM
   - Citation formatting: `[1] [2] [3]`
   - Context window management

### Phase 4B: AI Agent Integration
**Location:** `/svc/ai_agent.py`

**5 Tools Available:**
```python
1. get_air_quality      # OpenAQ real-time data
2. get_location         # Geocoding (Nominatim)
3. get_weather          # Weather API
4. get_health_advice    # Health recommendations
5. search_knowledge_base # RAG (NEW!) 🆕
```

**Features:**
- Per-session memory isolation (security fix)
- LangChain ReAct pattern
- Automatic tool selection based on query
- Citation tracking in responses

### Phase 4C: Frontend UI
**Location:** `/frontend/src/components/`

**New Components:**
- `CitationBubble.jsx` - Expandable citation display with [1] [2] [3] references
- `RAGStatus.jsx` - Status indicator (Ready/Loading/Offline)

**Updated Components:**
- `MessageBubble.jsx` - Now displays citations below assistant messages
- `ChatHeader.jsx` - Integrated RAG status indicator

**Backend Endpoint:**
- `GET /v1/rag/status` - Returns RAG availability and document count

## 📊 Performance & Cost

| Metric | Value |
|--------|-------|
| **Response Time** | ~1.5-3 seconds |
| **Embedding Model** | Google (FREE tier) |
| **Vector DB** | ChromaDB (Local, ~10MB) |
| **Documents** | 7 (EPA + WHO) |
| **Monthly Cost** | $0 🎉 |
| **Scalability** | Ready for cloud deployment |

## 🧪 Testing & Validation

All RAG components tested and working:
```
✅ RAG Chain initialized successfully
✅ Google Embeddings active (FREE tier)
✅ ChromaDB loaded with 7 documents
✅ AI agent has 5 tools available
✅ Frontend citations display working
✅ Backend /v1/rag/status endpoint responding
✅ Per-session memory isolation implemented
✅ All dependencies installed (chromadb, langchain-chroma, pypdf, etc.)
```

## 📡 API Endpoints

### Chat Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/v1/chat` | Send message (streaming) |
| GET | `/v1/rag/status` | Get RAG status |

### Health Check
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Service health status |

### Example: Chat with RAG
```bash
curl -X POST http://localhost:3005/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are EPA guidelines for PM2.5?",
    "sessionId": "user-123"
  }'
```

### Example: Check RAG Status
```bash
curl http://localhost:3005/v1/rag/status
```

**Response:**
```json
{
  "status": "Ready",
  "rag_available": true,
  "documents_loaded": 7,
  "score_threshold": 0.12,
  "embedding_model": "google",
  "timestamp": "2025-10-25T..."
}
```

## 🎓 Development Timeline & Phases

| Date | Phase | Focus | Status |
|------|-------|-------|--------|
| Oct 11-18 | 1-3 | Core Chat & Air Quality | ✅ Complete |
| Oct 19-24 | 4A | RAG Setup (ChromaDB + Embeddings) | ✅ Complete |
| Oct 19-24 | 4B | AI Agent Integration (RAGTool) | ✅ Complete |
| Oct 19-24 | 4C | Frontend UI (Citations + Status) | ✅ Complete |
| Oct 25 | 5 | Demo & Production Ready | ✅ Complete |

### Phase Highlights

**Phase 1-3: Foundation**
- ✅ React chat interface with streaming SSE
- ✅ LangChain ReAct AI agent (4 tools)
- ✅ Real-time air quality data (OpenAQ v3)
- ✅ Location geocoding (Nominatim)
- ✅ Dark mode & conversation persistence

**Phase 4A: RAG Setup**
- ✅ ChromaDB local vector store (7 documents)
- ✅ Google Embeddings (FREE tier)
- ✅ PDF document loading with intelligent chunking
- ✅ MMR retrieval strategy
- ✅ Citation formatting & tracking

**Phase 4B: Agent Integration**
- ✅ RAGTool added to agent (5th tool)
- ✅ Automatic tool selection by LLM
- ✅ System prompt updated with RAG guidance
- ✅ Per-session memory isolation (security)
- ✅ Lazy RAGChain initialization

**Phase 4C: Frontend UI**
- ✅ CitationBubble component (expandable sources)
- ✅ RAGStatus indicator (real-time status)
- ✅ MessageBubble citations integration
- ✅ ChatHeader RAG status display
- ✅ Backend /v1/rag/status endpoint
- ✅ Dark mode & responsive design

## 📚 Documentation

For detailed information, see:
- **[PHASE_C_COMPLETE.md](./PHASE_C_COMPLETE.md)** - Phase 4C frontend UI details
- **[RAG_COMPLETE_SUMMARY.md](./RAG_COMPLETE_SUMMARY.md)** - Complete RAG implementation overview
- **[TECH_STACK.md](./TECH_STACK.md)** - Architecture & deployment information
- **[DAY1_COMPLETE.md](./DAY1_COMPLETE.md)** - Phases 1-3 core features
- **[DAY2_COMPLETE.md](./DAY2_COMPLETE.md)** - Phase 4 RAG implementation
- **[TEST_CASES.md](./TEST_CASES.md)** - 40+ comprehensive test scenarios
- **[svc/rag/README.md](./svc/rag/README.md)** - RAG pipeline technical documentation

## 🔐 Security Considerations

### Data Privacy
- ✅ Per-session memory isolation (no cross-user data leakage)
- ✅ Session-based conversation scoping
- ✅ No persistent user profiles (localStorage only)
- ✅ Client-side message storage

### API Security
- ✅ Rate limiting on backend endpoints
- ✅ Input sanitization & XSS protection
- ✅ CORS properly configured
- ✅ Environment variables for sensitive data

### Knowledge Base Security
- ✅ Local ChromaDB (no external server exposure)
- ✅ Read-only document access
- ✅ No sensitive data in PDFs
- ✅ Version controlled knowledge base

## 🎨 Standards & References

### AQI Calculation
- **EPA Appendix G:** 40 CFR Part 58
- **NowCast Formula:** EPA Technical Assistance Document
- **Reference:** https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-58/appendix-Appendix%20G%20to%20Part%2058

### WHO Guidelines
- PM2.5 24-hour: ≤ 15 µg/m³
- PM2.5 Annual: ≤ 5 µg/m³
- **Reference:** https://www.who.int/publications/i/item/9789240034228

### RAG Knowledge Base
- **EPA Documents:** Air quality guides, AQI technical assistance
- **WHO Documents:** Global air quality guidelines
- **Coverage:** Particulate matter, O₃, NO₂ standards

### API Usage Policies
- **OpenAQ:** 100 requests/day (free tier)
- **Nominatim:** 1 request/second max, User-Agent required
- **Google Embeddings:** FREE tier included, no API key needed for demo

## � License

MIT - See LICENSE file for details

## ⚠️ Disclaimer

This application is for educational purposes. Air quality data is provided by OpenAQ and official sources. For health and safety decisions, always consult official EPA/WHO resources and local authorities. Do not rely solely on this application for emergency decision-making.

---

## 🎊 Summary

**AIrChat** is a complete, production-ready application combining:
- 🌍 Real-time air quality data (EPA standards)
- 💬 Conversational AI with LangChain
- 📚 RAG knowledge base (EPA & WHO guidelines)
- 🔍 Citation tracking & source display
- 🎨 Beautiful, responsive UI with dark mode
- 🚀 Zero-cost deployment (Google FREE embeddings + local storage)

**Status:** ✅ COMPLETE & READY FOR DEMO!

**Get started:** Just run the 3 terminals above and visit http://localhost:5174

---

**Built with ❤️ for the WiBD Hackathon 2025**