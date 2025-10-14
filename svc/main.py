"""
AIrChat Air Quality Service - Enhanced Version
Integrates OpenAQ API v3 with improved station selection and data formatting

Day 4 Enhancements:
- Best station selection (PM2.5 > PM10 > O3 > NO2 > SO2 > CO)
- Standardized data format (ISO 8601 timestamps, µg/m³ units)
- Multi-pollutant support
- Better error handling
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

# Import calculation modules
from nowcast import calculate_nowcast_pm25, calculate_nowcast_pm10
from aqi_epa import calculate_aqi_pm25, calculate_aqi_pm10

# Import new utility modules
try:
    from station_selector import select_best_station, format_station_info
    from data_formatter import format_timestamp, format_no_stations_response
    ENHANCED_MODE = True
except ImportError:
    ENHANCED_MODE = False
    print("Running in basic mode (enhanced modules not found)")

# Import AI agent
try:
    from ai_agent import chat_with_agent, get_agent
    AI_MODE = True
    print("AI mode enabled - LangChain integration available")
except ImportError:
    AI_MODE = False
    print("AI mode disabled - LangChain modules not found")

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AIrChat Air Quality Service",
    description="Real-time air quality data using OpenAQ API v3 with EPA calculations",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAQ API configuration
OPENAQ_BASE_URL = "https://api.openaq.org/v3"
OPENAQ_API_KEY = os.getenv("OPENAQ_API_KEY")
OPENAQ_TIMEOUT = 10.0


async def fetch_openaq_data(lat: float, lon: float, radius: int) -> Dict[str, Any]:
    """Fetch air quality data from OpenAQ API v3"""
    try:
        async with httpx.AsyncClient(timeout=OPENAQ_TIMEOUT) as client:
            response = await client.get(
                f"{OPENAQ_BASE_URL}/locations",
                params={
                    "coordinates": f"{lat},{lon}",
                    "radius": min(radius, 25000),
                    "limit": 100
                },
                headers={
                    "X-API-Key": OPENAQ_API_KEY,
                    "User-Agent": "AIrChat/2.0",
                    "Accept": "application/json"
                }
            )
            response.raise_for_status()
            return response.json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="OpenAQ API timeout")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 429:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        raise HTTPException(status_code=502, detail="OpenAQ API error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


async def fetch_location_measurements(location_id: int, hours: int = 12) -> Dict[str, Any]:
    """Fetch hourly measurements for a specific location"""
    try:
        async with httpx.AsyncClient(timeout=OPENAQ_TIMEOUT) as client:
            date_to = datetime.utcnow()
            date_from = date_to - timedelta(hours=hours)
            
            response = await client.get(
                f"{OPENAQ_BASE_URL}/locations/{location_id}/measurements",
                params={
                    "date_from": date_from.isoformat() + "Z",
                    "date_to": date_to.isoformat() + "Z",
                    "parameter": "pm25",
                    "limit": 1000
                },
                headers={
                    "X-API-Key": OPENAQ_API_KEY,
                    "User-Agent": "AIrChat/2.0",
                    "Accept": "application/json"
                }
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Error fetching measurements: {e}")
        return {"results": []}


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AIrChat Air Quality Service",
        "version": "2.0.0",
        "status": "operational",
        "enhanced_mode": ENHANCED_MODE
    }


@app.get("/v1/aq/latest")
async def get_latest_air_quality(
    lat: float = Query(..., description="Latitude", ge=-90, le=90),
    lon: float = Query(..., description="Longitude", ge=-180, le=180),
    radius: int = Query(20000, description="Radius in meters", ge=1000, le=25000)
):
    """
    Get latest air quality data for a location with EPA NowCast and AQI calculations.
    
    Day 4 Enhancements:
    - Smart station selection (prioritizes PM2.5 > PM10 > O3 > NO2)
    - Standardized ISO 8601 timestamps
    - Consistent µg/m³ units
    - Improved error handling
    """
    try:
        # Fetch locations from OpenAQ
        openaq_data = await fetch_openaq_data(lat, lon, radius)
        locations = openaq_data.get("results", [])
        
        if not locations:
            if ENHANCED_MODE:
                return format_no_stations_response(lat, lon, radius)
            return {
                "message": f"No air quality monitors found within {radius/1000:.1f}km",
                "search": {"lat": lat, "lon": lon, "radius_km": radius / 1000},
                "stations": []
            }
        
        # Select best station using enhanced logic if available
        if ENHANCED_MODE:
            best_station = select_best_station(locations)
        else:
            # Fallback: Find first station with PM2.5
            best_station = None
            for loc in locations:
                params = [p.get("name", "").lower() for p in loc.get("parameters", [])]
                if "pm25" in params:
                    best_station = loc
                    break
            if not best_station:
                best_station = locations[0]
        
        location_id = best_station.get("id")
        location_name = best_station.get("name", "Unknown")
        
        # Fetch hourly measurements for NowCast
        try:
            measurements_data = await fetch_location_measurements(location_id, hours=12)
            measurements = measurements_data.get("results", [])
            
            pm25_values = []
            for measurement in measurements:
                value = measurement.get("value")
                if value is not None:
                    pm25_values.append(float(value))
            
            # Calculate NowCast
            nowcast_value = None
            if len(pm25_values) >= 2:
                nowcast_value = calculate_nowcast_pm25(pm25_values)
            
            # Use NowCast or latest reading
            if nowcast_value:
                pm25_concentration = nowcast_value
                calculation_method = "EPA NowCast"
            elif pm25_values:
                pm25_concentration = pm25_values[-1]
                calculation_method = "Latest Reading"
            else:
                # Demo data fallback
                pm25_concentration = 28.4
                pm25_values = [25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29]
                nowcast_value = calculate_nowcast_pm25(pm25_values)
                pm25_concentration = nowcast_value
                calculation_method = "Demo Data"
            
        except Exception as e:
            print(f"Measurements fetch failed: {e}")
            # Demo data fallback
            pm25_concentration = 28.4
            pm25_values = [25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29]
            nowcast_value = calculate_nowcast_pm25(pm25_values)
            pm25_concentration = nowcast_value
            calculation_method = "Demo Data (API Error)"
        
        # Calculate AQI
        pm25_aqi = calculate_aqi_pm25(pm25_concentration)
        
        # Build standardized response
        coords = best_station.get("coordinates", {})
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        response = {
            "aqi": {
                "value": pm25_aqi["aqi"],
                "category": pm25_aqi["category"],
                "color": pm25_aqi["color"],
                "dominant_pollutant": "PM2.5"
            },
            "pollutants": {
                "pm25": {
                    "concentration": {
                        "value": round(pm25_concentration, 2),
                        "unit": "µg/m³"
                    },
                    "nowcast": {
                        "value": round(nowcast_value, 2) if nowcast_value else None,
                        "unit": "µg/m³"
                    },
                    "aqi": pm25_aqi["aqi"],
                    "hourly_values": [round(v, 2) for v in pm25_values[-12:]],
                    "calculation_method": calculation_method
                }
            },
            "station": {
                "id": location_id,
                "name": location_name,
                "location": {
                    "lat": coords.get("latitude"),
                    "lon": coords.get("longitude")
                },
                "provider": best_station.get("provider", {}).get("name", "OpenAQ")
            },
            "metadata": {
                "timestamp": timestamp,
                "data_source": "OpenAQ API v3",
                "calculation_standard": "EPA",
                "stations_found": len(locations),
                "timezone": "UTC"
            }
        }
        
        # Add station info if enhanced mode
        if ENHANCED_MODE:
            response["station"]["details"] = format_station_info(best_station)
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_latest_air_quality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@app.post("/v1/chat")
async def chat_endpoint(request: Dict[str, Any]):
    """
    AI Chat endpoint with LangChain integration
    """
    if not AI_MODE:
        raise HTTPException(
            status_code=503, 
            detail="AI mode is disabled. LangChain modules not available."
        )
    
    try:
        message = request.get("message", "")
        session_id = request.get("conversationId", "default")
        llm_provider = request.get("llm_provider", None)
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        if len(message) > 10000:
            raise HTTPException(status_code=400, detail="Message too long (max 10,000 characters)")
        
        # Get AI response
        response = await chat_with_agent(message, session_id, llm_provider)
        
        return {
            "id": str(int(datetime.utcnow().timestamp() * 1000)),
            "message": response,
            "conversationId": session_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": "assistant",
            "ai_mode": True,
            "llm_provider": llm_provider or os.getenv("LLM_PROVIDER", "google")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@app.get("/v1/chat/stream")
async def chat_stream_endpoint(
    message: str = Query(..., description="Chat message"),
    conversationId: str = Query("default", description="Conversation ID"),
    llm_provider: str = Query(None, description="LLM provider (openai/google)")
):
    """
    AI Chat streaming endpoint with LangChain integration
    """
    if not AI_MODE:
        raise HTTPException(
            status_code=503, 
            detail="AI mode is disabled. LangChain modules not available."
        )
    
    try:
        if len(message) > 10000:
            raise HTTPException(status_code=400, detail="Message too long (max 10,000 characters)")
        
        # Get AI response
        response = await chat_with_agent(message, conversationId, llm_provider)
        
        # For now, return the full response as a single chunk
        # In a more advanced implementation, you could stream the response word by word
        return {
            "type": "chunk",
            "content": response,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "conversationId": conversationId,
            "ai_mode": True,
            "llm_provider": llm_provider or os.getenv("LLM_PROVIDER", "google")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in chat stream endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chat stream request: {str(e)}")


@app.get("/v1/ai/status")
async def ai_status():
    """
    Get AI service status and configuration
    """
    return {
        "ai_mode": AI_MODE,
        "llm_provider": os.getenv("LLM_PROVIDER", "google"),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "google_configured": bool(os.getenv("GOOGLE_API_KEY")),
        "enhanced_mode": ENHANCED_MODE,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
