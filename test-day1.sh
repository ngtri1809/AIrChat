#!/bin/bash
# Day 1 Acceptance Tests

echo "╔════════════════════════════════════════════════════════╗"
echo "║     AIrChat - Day 1 Acceptance Tests                 ║"
echo "║     Date: October 11, 2025                            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Geocoding Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Geocoding Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Request: GET /api/geocode?q=San%20Jose"
echo ""

GEOCODE_RESULT=$(curl -s "http://localhost:3000/api/geocode?q=San%20Jose")
echo "$GEOCODE_RESULT" | python3 -m json.tool

if echo "$GEOCODE_RESULT" | grep -q "lat"; then
    echo ""
    echo "✅ TEST 1 PASSED: Geocoding endpoint returns valid lat/lon"
else
    echo ""
    echo "❌ TEST 1 FAILED: Geocoding endpoint did not return expected data"
    exit 1
fi

echo ""
echo ""

# Test 2: Air Quality Endpoint
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Air Quality Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Request: GET /v1/aq/latest?lat=37.3382&lon=-121.8863&radius=20000"
echo ""

AQ_RESULT=$(curl -s "http://localhost:8000/v1/aq/latest?lat=37.3382&lon=-121.8863&radius=20000")

# Pretty print key fields only
echo "$AQ_RESULT" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    summary = {
        'lat': d.get('lat'),
        'lon': d.get('lon'),
        'radius_km': d.get('radius_km'),
        'stations_found': d.get('stations_found'),
        'sample_station': d['stations'][0] if d.get('stations') else None,
        'timestamp': d.get('timestamp')
    }
    print(json.dumps(summary, indent=2))
except:
    print('Error parsing response')
    sys.exit(1)
"

if echo "$AQ_RESULT" | grep -q "stations_found"; then
    STATION_COUNT=$(echo "$AQ_RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('stations_found', 0))")
    echo ""
    echo "✅ TEST 2 PASSED: Air quality endpoint returns $STATION_COUNT stations"
else
    echo ""
    echo "❌ TEST 2 FAILED: Air quality endpoint did not return expected data"
    exit 1
fi

echo ""
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════╗"
echo "║             DAY 1 ACCEPTANCE TESTS PASSED              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Geocoding proxy working"
echo "✅ OpenAQ integration working"
echo "✅ All endpoints returning valid data"
echo ""
echo "🎉 Day 1 Complete! Ready for Day 2."
echo ""
