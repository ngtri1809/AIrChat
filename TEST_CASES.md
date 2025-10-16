# AIrChat Test Cases - Global Cities

## 🧪 Test Suite: Air Quality Queries Across the World

### Test Environment:
- **Backend**: http://localhost:3005
- **Python AI**: http://localhost:8000
- **Frontend**: http://localhost:5174

---

## 📍 Test Case 1: US West Coast Cities

### Test 1.1: San Francisco Bay Area
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in San Francisco?"}' | python3 -m json.tool
```

**Expected:** AQI data with PM2.5 from nearby sensors (likely Good-Moderate range)

### Test 1.2: Los Angeles
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air quality in Los Angeles today?"}' | python3 -m json.tool
```

**Expected:** AQI data (historically Moderate-Unhealthy range)

### Test 1.3: Seattle
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about the air quality in Seattle, Washington"}' | python3 -m json.tool
```

**Expected:** Real PM2.5 data or "no data available" message

---

## 📍 Test Case 2: US East Coast Cities

### Test 2.1: New York City
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the current air quality in New York City?"}' | python3 -m json.tool
```

**Expected:** AQI with PM2.5 data from NYC sensors

### Test 2.2: Boston
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Check air quality in Boston"}' | python3 -m json.tool
```

**Expected:** Real data or "no data available"

### Test 2.3: Miami
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air in Miami, Florida?"}' | python3 -m json.tool
```

**Expected:** AQI data from South Florida sensors

---

## 📍 Test Case 3: European Cities

### Test 3.1: London
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in London, UK?"}' | python3 -m json.tool
```

**Expected:** PM2.5 data from UK monitoring network

### Test 3.2: Paris
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about air quality in Paris, France"}' | python3 -m json.tool
```

**Expected:** Data from French air quality network

### Test 3.3: Berlin
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air in Berlin, Germany?"}' | python3 -m json.tool
```

**Expected:** German sensor data

### Test 3.4: Amsterdam
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Check the air quality in Amsterdam"}' | python3 -m json.tool
```

**Expected:** Netherlands sensor data (previously tested - AQI 28)

---

## 📍 Test Case 4: Asian Cities (High Data Coverage)

### Test 4.1: Bangkok
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Bangkok, Thailand?"}' | python3 -m json.tool
```

**Expected:** Real PM2.5 data (historically Moderate-Unhealthy range)

### Test 4.2: Delhi
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air quality in Delhi, India?"}' | python3 -m json.tool
```

**Expected:** High PM2.5 values (historically Unhealthy-Hazardous range)

### Test 4.3: Singapore
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Singapore?"}' | python3 -m json.tool
```

**Expected:** Good-Moderate AQI (well-monitored)

### Test 4.4: Tokyo
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about air quality in Tokyo, Japan"}' | python3 -m json.tool
```

**Expected:** Japanese monitoring network data

---

## 📍 Test Case 5: Asian Cities (May Have Limited Data)

### Test 5.1: Hanoi
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Hanoi, Vietnam?"}' | python3 -m json.tool
```

**Expected:** Real data OR "Sorry, I don't have current information..."

### Test 5.2: Ho Chi Minh City
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air in Ho Chi Minh City?"}' | python3 -m json.tool
```

**Expected:** Real data OR "no data available" message

### Test 5.3: Manila
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Check air quality in Manila, Philippines"}' | python3 -m json.tool
```

**Expected:** Real data OR no data message

---

## 📍 Test Case 6: Australian Cities

### Test 6.1: Sydney
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Sydney, Australia?"}' | python3 -m json.tool
```

**Expected:** Australian monitoring network data

### Test 6.2: Melbourne
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air in Melbourne?"}' | python3 -m json.tool
```

**Expected:** Real data or no data message

---

## 📍 Test Case 7: South American Cities

### Test 7.1: São Paulo
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in São Paulo, Brazil?"}' | python3 -m json.tool
```

**Expected:** Brazilian sensor data or no data

### Test 7.2: Mexico City
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "How is the air in Mexico City?"}' | python3 -m json.tool
```

**Expected:** Real data (historically Moderate-Unhealthy)

---

## 📍 Test Case 8: Middle Eastern Cities

### Test 8.1: Dubai
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Dubai, UAE?"}' | python3 -m json.tool
```

**Expected:** Real data or no data message

---

## 📍 Test Case 9: Multi-City Comparison

### Test 9.1: Compare Two Cities
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Compare the air quality between San Francisco and Los Angeles. Which one is better?"}' | python3 -m json.tool
```

**Expected:** AI compares both cities and provides recommendation

### Test 9.2: Travel Planning
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "I am planning to visit either Bangkok or Singapore next week. Which city has better air quality for outdoor activities?"}' | python3 -m json.tool
```

**Expected:** AI analyzes both cities and provides travel advice

### Test 9.3: Winter Trip Planning
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Los Angeles and San Diego? Which one should I go for Christmas vacation?"}' | python3 -m json.tool
```

**Expected:** Comparison with travel recommendation

---

## 📍 Test Case 10: Edge Cases

### Test 10.1: Remote Location (No Data)
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in the middle of the Sahara Desert?"}' | python3 -m json.tool
```

**Expected:** "No air quality monitoring stations found" message

### Test 10.2: Misspelled City Name
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the air quality in Bangcock?"}' | python3 -m json.tool
```

**Expected:** AI should handle gracefully (geocoding may correct it)

### Test 10.3: Generic Question
```bash
curl -X POST "http://localhost:3005/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is PM2.5 and why is it important?"}' | python3 -m json.tool
```

**Expected:** AI explains PM2.5 without calling air quality tool

---

## 🎯 Success Criteria

### For Cities with Real Data:
- ✅ Returns valid AQI value (0-500)
- ✅ Shows PM2.5 concentration in µg/m³
- ✅ Provides health recommendations
- ✅ Shows station name and provider
- ✅ Response time < 30 seconds

### For Cities without Data:
- ✅ Returns clear "Sorry, I don't have current information..." message
- ✅ Provides suggestions (try different location, check back later, visit openaq.org)
- ✅ No demo/fallback data shown
- ✅ Response time < 10 seconds

### For Multi-City Comparisons:
- ✅ Queries all cities mentioned
- ✅ Provides comparison of AQI values
- ✅ Gives recommendation based on data
- ✅ Handles mixed scenarios (some cities with data, some without)

---

## 🚀 Quick Test Script

Run all tests at once:

```bash
#!/bin/bash
echo "🧪 AIrChat Global Test Suite"
echo "=============================="

cities=("San Francisco" "New York" "London" "Bangkok" "Delhi" "Tokyo" "Sydney")

for city in "${cities[@]}"; do
  echo ""
  echo "Testing: $city"
  curl -s -X POST "http://localhost:3005/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"What is the air quality in $city?\"}" | \
    python3 -c "import sys, json; data=json.load(sys.stdin); print(f'✅ {data.get(\"message\", \"ERROR\")[:100]}...')"
  sleep 2
done

echo ""
echo "✅ Test suite complete!"
```

Save as `test_global_cities.sh` and run:
```bash
chmod +x test_global_cities.sh
./test_global_cities.sh
```

---

## 📊 Expected Coverage

**High Data Availability (75%+):**
- US major cities (SF, LA, NYC, Seattle)
- European capitals (London, Paris, Berlin)
- Asian mega-cities (Bangkok, Delhi, Singapore, Tokyo)

**Medium Data Availability (50%):**
- Secondary US cities
- Southeast Asian cities (Hanoi, Manila, Jakarta)
- Australian cities

**Low Data Availability (<25%):**
- Remote locations
- Small towns
- Areas without monitoring infrastructure

---

## 🔍 Debugging Tips

If a city returns "no data":
1. Check OpenAQ directly: https://openaq.org
2. Try nearby major city
3. Check if coordinates are correct in geocoding
4. Verify 50km search radius is appropriate

If response is slow:
1. Check Python service logs
2. Verify geocoding service is working
3. Check OpenAQ API rate limits
4. Monitor network latency
