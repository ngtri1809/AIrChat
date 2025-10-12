# 🎯 Day 3 Roadmap: Complete MMF (Minimum Marketable Features)

**Date:** October 13, 2025  
**Goal:** Complete all 5 Minimum Marketable Features  
**Duration:** ~8 hours  
**Current Status:** Day 2 Complete ✅

---

## ✅ Day 2 Completion Status

### **Ready for Day 3 Checklist:**

#### ✅ **Have complete calculation engine**
- [x] NowCast PM2.5 algorithm (`svc/nowcast.py`)
- [x] AQI EPA calculations (`svc/aqi_epa.py`)
- [x] Support for PM2.5, PM10, O3, NO2
- [x] Mock data fallback when API fails
- [x] FastAPI endpoint `/v1/aq/latest`

#### ✅ **Have working UI components**
- [x] AqiCard component with EPA color coding
- [x] ChatPage with SSE streaming
- [x] AirQualityPage with search form
- [x] Tabbed navigation (AI Chat | Air Quality)
- [x] Dark/Light theme support
- [x] Mobile responsive design

#### ✅ **Can connect frontend to backend**
- [x] Vite proxy configured (port 3005)
- [x] Geocoding integration working
- [x] API calls tested and verified
- [x] CORS properly configured
- [x] Error handling in place

#### ⚠️ **Can add search functionality** (Partially Complete)
- [x] Basic location search input
- [x] Geocoding API integration
- [x] Submit handler implemented
- [ ] 🔴 **Search history** (Day 3)
- [ ] 🔴 **Recent searches** (Day 3)
- [ ] 🔴 **Autocomplete suggestions** (Day 3)
- [ ] 🔴 **Favorite locations** (Day 3)

---

## 🎯 Day 3 Tasks Breakdown

### **MMF Status:**
1. ✅ Real-time AQI display with EPA color coding
2. ✅ Location search with geocoding
3. ✅ NowCast PM2.5 calculations (EPA formula)
4. ✅ Multiple pollutant support (PM2.5, PM10, O3, NO2)
5. ⚠️ Station selection within radius (Needs UI)

---

## 📋 Day 3 Implementation Plan

### **Phase 1: Enhanced Search (2 hours)**
**Goal:** Make search user-friendly and persistent

#### **Task 1.1: Search History Component**
**File:** `frontend/src/components/SearchHistory.jsx`
**Duration:** 45 mins

**Features:**
- Display last 5 searches
- Click to reload location
- Clear history button
- Stored in localStorage

**Code Structure:**
```jsx
// SearchHistory.jsx
const SearchHistory = ({ onSelectLocation }) => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);
  
  const handleSelect = (location) => {
    onSelectLocation(location);
  };
  
  return (
    <div className="search-history">
      <h3>Recent Searches</h3>
      {history.map(item => (
        <button onClick={() => handleSelect(item)}>
          {item.display_name}
        </button>
      ))}
    </div>
  );
};
```

**Integration:**
- Update `AirQualityPage.jsx` to save searches
- Add SearchHistory component below search form

---

#### **Task 1.2: Favorite Locations**
**File:** `frontend/src/components/FavoriteLocations.jsx`
**Duration:** 30 mins

**Features:**
- Star icon to favorite current location
- Quick access list (max 3 favorites)
- Stored in localStorage

**UI Design:**
```
⭐ Favorites:
[🌆 San Jose, CA] [🌃 San Francisco] [🏙️ Los Angeles]
```

---

#### **Task 1.3: Search Input Enhancements**
**File:** `frontend/src/pages/AirQualityPage.jsx`
**Duration:** 45 mins

**Improvements:**
- Add loading spinner in search button
- Show "Searching..." state
- Add clear button (X) in input
- Keyboard shortcuts (Enter to search, Esc to clear)
- Input validation (min 2 characters)

**Before:**
```jsx
<input type="text" placeholder="Enter city name" />
<button>Search</button>
```

**After:**
```jsx
<div className="search-input-group">
  <input 
    type="text" 
    placeholder="Enter city name (e.g., San Jose)" 
    minLength={2}
    onKeyDown={handleKeyDown}
  />
  {value && <button onClick={clearInput}>✕</button>}
  <button disabled={loading}>
    {loading ? <Spinner /> : 'Search'}
  </button>
</div>
```

---

### **Phase 2: Station Selection UI (2.5 hours)**
**Goal:** Let users choose from multiple nearby stations

#### **Task 2.1: Station List Component**
**File:** `frontend/src/components/StationList.jsx`
**Duration:** 1 hour

**Features:**
- Show all stations within radius
- Sort by distance
- Display station name, distance, last update
- Click to select station
- Highlight selected station

**UI Design:**
```
📍 Stations Found (5 within 20km)
┌─────────────────────────────────────────┐
│ ● Los Gatos              0.5 km   AQI 83 │ ← Selected
│ ○ San Jose - Downtown    3.2 km   AQI 91 │
│ ○ Campbell               5.8 km   AQI 78 │
│ ○ Cupertino             8.1 km   AQI 85 │
│ ○ Santa Clara           12.3 km   AQI 88 │
└─────────────────────────────────────────┘
```

**Code Structure:**
```jsx
const StationList = ({ stations, selectedId, onSelect }) => {
  return (
    <div className="station-list">
      <h3>📍 Stations Found ({stations.length})</h3>
      {stations
        .sort((a, b) => a.distance - b.distance)
        .map(station => (
          <div 
            key={station.id}
            className={selectedId === station.id ? 'selected' : ''}
            onClick={() => onSelect(station)}
          >
            <span>{station.name}</span>
            <span>{station.distance}km</span>
            <span>AQI {station.aqi}</span>
          </div>
        ))
      }
    </div>
  );
};
```

---

#### **Task 2.2: Radius Selector**
**File:** `frontend/src/components/RadiusSelector.jsx`
**Duration:** 45 mins

**Features:**
- Slider: 5km - 50km
- Preset buttons: 5km, 10km, 20km, 50km
- Live update on change
- Show station count

**UI Design:**
```
Search Radius: [████████░░░░] 20 km
[5km] [10km] [20km] [50km]
Found: 5 stations
```

**Integration:**
- Add to AirQualityPage
- Re-fetch data when radius changes

---

#### **Task 2.3: Update AirQualityPage Layout**
**File:** `frontend/src/pages/AirQualityPage.jsx`
**Duration:** 45 mins

**New Layout:**
```
┌────────────────────────────────────┐
│  🌍 Air Quality Monitor            │
│  [Search Input] [Search Button]    │
│  Radius: [Slider 20km]             │
├────────────────────────────────────┤
│  📍 Stations (5)    ⭐ Favorites   │
│  [Station List]     [Fav Locations]│
├────────────────────────────────────┤
│        [AQI Card Display]          │
└────────────────────────────────────┘
```

---

### **Phase 3: Real OpenAQ Integration (1.5 hours)**
**Goal:** Replace mock data with real API calls

#### **Task 3.1: Fix OpenAQ API Connection**
**File:** `svc/main.py`
**Duration:** 1 hour

**Issues to Fix:**
- OpenAQ currently returns 502
- Need to handle rate limits (100 req/day)
- Implement caching strategy

**Solutions:**
```python
# Add request retry logic
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def get_openaq_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# Add caching
from functools import lru_cache
from datetime import datetime, timedelta

@lru_cache(maxsize=100)
def fetch_measurements_cached(lat, lon, radius, timestamp_hour):
    # Cache for 1 hour
    return fetch_measurements(lat, lon, radius)
```

---

#### **Task 3.2: Add Fallback Behavior**
**File:** `svc/main.py`
**Duration:** 30 mins

**Strategy:**
1. Try OpenAQ API
2. If fails, check cache
3. If no cache, return mock data with warning

**Implementation:**
```python
async def get_air_quality(lat, lon, radius):
    try:
        # Try real API
        data = await fetch_from_openaq(lat, lon, radius)
        cache_data(lat, lon, data)
        return data
    except Exception as e:
        # Try cache
        cached = get_cached_data(lat, lon)
        if cached:
            return {**cached, "source": "cache", "warning": "Using cached data"}
        # Fallback to mock
        return get_mock_data(lat, lon, warning="API unavailable")
```

---

### **Phase 4: Polish & Testing (2 hours)**
**Goal:** Bug fixes, UX improvements, comprehensive testing

#### **Task 4.1: Loading States & Animations**
**Duration:** 45 mins

**Add to components:**
- Skeleton loaders for AqiCard
- Spinner for search button
- Fade-in animations for station list
- Pulse effect for loading stations

**CSS:**
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

#### **Task 4.2: Error Handling UI**
**Duration:** 30 mins

**Scenarios:**
- Location not found
- No stations in radius
- API errors
- Network timeout

**Error Messages:**
```jsx
const ErrorMessage = ({ type, onRetry }) => {
  const messages = {
    'no-location': '📍 Location not found. Try "San Jose, CA"',
    'no-stations': '🔍 No stations found. Try increasing radius.',
    'api-error': '⚠️ Service unavailable. Showing cached data.',
    'network': '🌐 Network error. Check your connection.'
  };
  
  return (
    <div className="error-banner">
      <p>{messages[type]}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
};
```

---

#### **Task 4.3: Comprehensive Testing**
**Duration:** 45 mins

**Test Cases:**

1. **Search Functionality:**
   - [ ] Valid city name returns results
   - [ ] Invalid input shows error
   - [ ] Search history saves correctly
   - [ ] Favorites persist on reload

2. **Station Selection:**
   - [ ] All stations display correctly
   - [ ] Clicking station updates AQI card
   - [ ] Distance sorting works
   - [ ] Radius change triggers re-fetch

3. **Data Display:**
   - [ ] AQI colors match EPA standards
   - [ ] NowCast values are accurate
   - [ ] Timestamps show correctly
   - [ ] All pollutants display

4. **Edge Cases:**
   - [ ] No internet connection
   - [ ] API rate limit reached
   - [ ] Invalid coordinates
   - [ ] Empty search results

**Test Script:**
```bash
# Test backend endpoints
curl "http://localhost:3005/api/geocode?q=InvalidCity123"
curl "http://localhost:8000/v1/aq/latest?lat=0&lon=0&radius=5000"

# Test frontend
npm run test
npm run test:e2e  # If available
```

---

## 📊 Day 3 Timeline

| Time | Task | Duration | Status |
|------|------|----------|--------|
| 9:00 - 9:45 | Task 1.1: Search History | 45m | ⏳ |
| 9:45 - 10:15 | Task 1.2: Favorites | 30m | ⏳ |
| 10:15 - 11:00 | Task 1.3: Search Enhancements | 45m | ⏳ |
| 11:00 - 11:15 | ☕ Break | 15m | - |
| 11:15 - 12:15 | Task 2.1: Station List | 1h | ⏳ |
| 12:15 - 13:00 | Task 2.2: Radius Selector | 45m | ⏳ |
| 13:00 - 14:00 | 🍕 Lunch Break | 1h | - |
| 14:00 - 14:45 | Task 2.3: Update Layout | 45m | ⏳ |
| 14:45 - 15:45 | Task 3.1: Fix OpenAQ | 1h | ⏳ |
| 15:45 - 16:15 | Task 3.2: Fallback Logic | 30m | ⏳ |
| 16:15 - 16:30 | ☕ Break | 15m | - |
| 16:30 - 17:15 | Task 4.1: Loading States | 45m | ⏳ |
| 17:15 - 17:45 | Task 4.2: Error Handling | 30m | ⏳ |
| 17:45 - 18:30 | Task 4.3: Testing | 45m | ⏳ |
| 18:30 - 19:00 | Documentation & Git | 30m | ⏳ |

**Total:** 8 hours (including breaks)

---

## 🎯 Success Criteria for Day 3

### **Must Have (Blockers):**
- ✅ All 5 MMF completed
- ✅ Station selection working
- ✅ Search history functional
- ✅ Real API or reliable fallback
- ✅ All tests passing

### **Should Have:**
- ✅ Favorites working
- ✅ Radius selector
- ✅ Loading states
- ✅ Error handling

### **Nice to Have:**
- ⭐ Animations
- ⭐ Autocomplete
- ⭐ Geolocation button

---

## 📁 Files to Create/Modify

### **New Files:**
```
frontend/src/components/
├── SearchHistory.jsx          (NEW)
├── FavoriteLocations.jsx      (NEW)
├── StationList.jsx            (NEW)
├── RadiusSelector.jsx         (NEW)
└── ErrorMessage.jsx           (NEW)
```

### **Modified Files:**
```
frontend/src/pages/
└── AirQualityPage.jsx         (MAJOR UPDATE)

frontend/src/components/
└── AqiCard.jsx                (MINOR UPDATE)

svc/
├── main.py                    (FIX API)
└── requirements.txt           (ADD: requests-cache)

backend/
└── server.js                  (NO CHANGES)
```

---

## 🚀 Quick Start Commands for Day 3

### **Morning Setup:**
```bash
# Pull latest changes
git pull origin main

# Create Day 3 branch
git checkout -b day3-complete-mmf

# Start all services
cd backend && npm run dev &
cd frontend && npm run dev &
cd svc && source venv/bin/activate && uvicorn main:app --reload &
```

### **After Each Phase:**
```bash
# Commit progress
git add .
git commit -m "Day 3 Phase X: [task description]"
```

### **End of Day:**
```bash
# Final commit
git add .
git commit -m "Day 3 Complete: All MMF implemented"

# Push to remote
git push origin day3-complete-mmf

# Create PR
gh pr create --title "Day 3: Complete MMF" --body "See DAY3_COMPLETE.md"
```

---

## 📝 Acceptance Criteria

### **At end of Day 3, user should be able to:**

1. ✅ Search for any city in the world
2. ✅ See all nearby air quality stations
3. ✅ Select different stations to compare
4. ✅ Adjust search radius (5-50km)
5. ✅ View accurate AQI with EPA colors
6. ✅ See NowCast PM2.5 calculations
7. ✅ Save favorite locations
8. ✅ Access search history
9. ✅ Get helpful error messages
10. ✅ Experience fast, responsive UI

---

## 🎉 Day 3 Deliverables

### **Code:**
- 5 new components
- Updated air quality page
- Fixed API integration
- Comprehensive tests

### **Documentation:**
- `DAY3_COMPLETE.md` - What was built
- Updated `README.md` - New features
- API documentation updates
- Component documentation

### **Testing:**
- Unit tests for new components
- Integration tests for search flow
- E2E test for complete user journey
- Performance testing

---

## 🔄 Fallback Plan

**If running behind schedule:**

### **Priority 1 (Must Complete):**
- Station selection UI
- Search history
- API retry logic

### **Priority 2 (Can defer to Day 4):**
- Favorites
- Radius selector
- Animations

### **Priority 3 (Optional):**
- Autocomplete
- Geolocation
- Advanced error recovery

---

## 📞 Support & Resources

### **Documentation:**
- OpenAQ API v3: https://docs.openaq.org/
- EPA AQI Guide: https://www.airnow.gov/aqi/
- React hooks: https://react.dev/reference/react

### **If Stuck:**
1. Check `MERGE_SUMMARY.md` for architecture
2. Review `TESTING_SUMMARY.md` for debugging
3. Test individual components in isolation
4. Ask for help early!

---

**Ready to crush Day 3?** 🚀

**Status:** 📋 Plan Complete | ⏳ Ready to Execute  
**Next:** Start with Task 1.1 (Search History)
