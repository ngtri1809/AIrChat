# 🔄 Merge Complete: Unified AIrChat Application

**Date:** October 12, 2025  
**Merged by:** Anh Nguyen

---

## 📋 Summary

Successfully merged two separate features into a unified AIrChat application:
1. **AI Chat Interface** (from Tri) - SSE streaming chat with conversation management
2. **Air Quality Monitoring** (from Anh) - EPA-compliant AQI display with NowCast calculations

---

## 🏗️ Architecture Changes

### **Before Merge:**
```
AIrChat/
├── backend/          # Chat backend (port 3005)
├── frontend/         # Chat UI
├── api/              # Geocoding proxy (port 3000)
├── web/              # Air quality UI
└── svc/              # Air quality backend (port 8000)
```

### **After Merge:**
```
AIrChat/
├── backend/          # 🔄 UNIFIED Backend (port 3005)
│   ├── Chat SSE endpoints
│   └── Geocoding proxy (merged from api/)
├── frontend/         # 🔄 UNIFIED Frontend (port 5173)
│   ├── ChatPage (AI chat interface)
│   └── AirQualityPage (AQI monitoring)
└── svc/              # Air quality processing (port 8000)
```

**Deprecated directories:**
- ❌ `api/` - Merged into `backend/`
- ❌ `web/` - Merged into `frontend/`

---

## 🔧 Backend Changes (`backend/server.js`)

### **New Dependencies:**
```json
"node-fetch": "^3.3.2"  // For Nominatim API calls
```

### **New Features Added:**
1. ✅ **Geocoding Endpoint** - `/api/geocode?q={location}`
   - Nominatim proxy with 1 req/sec throttling
   - In-memory caching for repeated queries
   - Proper User-Agent headers

2. ✅ **Throttling & Caching**
   ```javascript
   let lastNominatimRequest = 0;
   const NOMINATIM_THROTTLE_MS = 1000;
   const geocodeCache = new Map();
   ```

### **Endpoints Available:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Non-streaming chat |
| `GET` | `/api/chat/stream` | SSE streaming chat |
| `GET` | `/api/geocode?q={location}` | ✨ NEW: Geocode location to lat/lon |

### **Server Start Message:**
```
🚀 AIrChat Unified Backend running on port 3005
   Health: http://localhost:3005/api/health
   Chat: http://localhost:3005/api/chat
   Chat Stream: http://localhost:3005/api/chat/stream
   Geocoding: http://localhost:3005/api/geocode?q=San%20Jose
```

---

## 🎨 Frontend Changes (`frontend/`)

### **New Structure:**
```
frontend/src/
├── App.jsx                    # 🔄 Main app with tab navigation
├── pages/
│   ├── ChatPage.jsx          # ✨ NEW: Chat interface (moved from App.jsx)
│   └── AirQualityPage.jsx    # ✨ NEW: Air quality monitoring
├── components/
│   ├── Sidebar.jsx
│   ├── ChatPane.jsx
│   ├── MessageList.jsx
│   ├── MessageBubble.jsx
│   ├── MessageComposer.jsx
│   ├── ChatHeader.jsx
│   ├── ErrorBanner.jsx
│   └── AqiCard.jsx           # ✨ NEW: AQI display component (from web/)
└── contexts/
    ├── ChatContext.jsx
    └── ThemeContext.jsx
```

### **New Dependencies:**
```json
"prop-types": "^15.8.1"  // For AqiCard PropTypes validation
```

### **New Features:**

#### 1. **Tabbed Navigation** (`App.jsx`)
- 💬 **AI Chat Tab** - Conversation interface with SSE streaming
- 🌍 **Air Quality Tab** - AQI monitoring with location search
- Dark mode support across both tabs

#### 2. **ChatPage** (`pages/ChatPage.jsx`)
- Extracted from original `App.jsx`
- Maintains all existing chat functionality
- Sidebar, chat pane, conversation management

#### 3. **AirQualityPage** (`pages/AirQualityPage.jsx`)
- Location search form
- Integrated geocoding + air quality API calls
- AQI card display with EPA color coding
- Loading states and error handling
- Info section about AQI scale

#### 4. **AqiCard Component** (`components/AqiCard.jsx`)
- Copied from `web/src/components/AqiCard.jsx`
- Displays AQI with EPA color-coded backgrounds
- Shows pollutant details (PM2.5, PM10, O3, NO2)
- NowCast calculation display
- Station information and timestamps

---

## 🔌 API Integration Flow

### **Chat Feature:**
```
User → Frontend (ChatPage) → Backend /api/chat/stream → SSE Response
```

### **Air Quality Feature:**
```
User enters "San Jose"
  ↓
Frontend (AirQualityPage) calls Backend /api/geocode
  ↓
Backend → Nominatim API → returns {lat: 37.3382, lon: -121.8863}
  ↓
Frontend calls svc/ /v1/aq/latest?lat=37.3382&lon=-121.8863
  ↓
Python Backend (svc/) → OpenAQ API → calculates NowCast & AQI
  ↓
Frontend displays AqiCard with colored result
```

---

## 🚀 How to Run

### **1. Install Dependencies**
```bash
# Backend
cd backend
npm install  # Will install node-fetch

# Frontend
cd frontend
npm install  # Will install prop-types

# Air Quality Service (unchanged)
cd svc
pip install -r requirements.txt
```

### **2. Start All Services**

**Terminal 1 - Backend (port 3005):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Air Quality Service (port 8000):**
```bash
cd svc
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000
```

### **3. Access the App**
```
http://localhost:5173
```

---

## ✅ Testing

### **Chat Feature:**
1. Click "💬 AI Chat" tab
2. Type a message and press Enter
3. Watch SSE streaming response
4. Create new conversations via sidebar

### **Air Quality Feature:**
1. Click "🌍 Air Quality" tab
2. Enter a city name (e.g., "San Jose, California")
3. Click "Search"
4. View AQI card with real-time data

### **Backend Endpoints:**

**Test Geocoding:**
```bash
curl "http://localhost:3005/api/geocode?q=San%20Jose" | jq
```

**Test Chat:**
```bash
curl "http://localhost:3005/api/chat/stream?message=Hello"
```

**Test Air Quality (via svc/):**
```bash
curl "http://localhost:8000/v1/aq/latest?lat=37.3382&lon=-121.8863&radius=20000" | jq
```

---

## 📝 Configuration

### **Environment Variables**

**Backend (`.env`):**
```env
PORT=3005
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Frontend (Vite):**
```javascript
// In .env file
VITE_API_URL=http://localhost:3005
VITE_SVC_URL=http://localhost:8000
```

---

## 🎯 Next Steps

### **Immediate Tasks:**
- [ ] Update root `package.json` with unified scripts
- [ ] Create `.env.example` files for both frontend and backend
- [ ] Update main `README.md` to reflect merged architecture
- [ ] Remove deprecated `api/` and `web/` directories (after testing)

### **Future Enhancements:**
- [ ] Add React Router for proper URL routing
- [ ] Persistent storage for air quality searches
- [ ] Share air quality results in chat
- [ ] Add air quality alerts via chat notifications
- [ ] Combine both features: "Ask AI about air quality"

---

## 🔐 Security & Best Practices

✅ **Maintained from original code:**
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 req/15min)
- Input sanitization (XSS prevention)
- Request size limits (10MB)

✅ **Added for geocoding:**
- Nominatim throttling (1 req/sec)
- Response caching
- Proper User-Agent headers

---

## 📚 Standards Compliance

- **Chat:** SSE (Server-Sent Events) specification
- **Air Quality:** EPA Appendix G, NowCast formula
- **APIs:** OpenAQ v3, Nominatim usage policies

---

## 🎉 Merge Benefits

1. **Single Port Backend** - Backend now runs on port 3005 only (was 3000 + 3005)
2. **Unified Frontend** - One app with tabbed interface (was 2 separate apps)
3. **Shared Infrastructure** - CORS, security, rate limiting shared
4. **Better UX** - No need to switch between apps
5. **Future Integration** - Can combine features (e.g., "Ask AI about air quality")

---

**Status:** ✅ Merge Complete  
**Build Status:** ⏳ Pending testing  
**Deployment:** Ready for testing

---

## 🐛 Known Issues

- None identified yet. Test thoroughly before pushing to production.

---

**Merged by:** Anh Nguyen  
**Date:** October 12, 2025  
**Branch:** `anhnguyen-api`
