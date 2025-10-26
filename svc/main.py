"""
AIrChat Air Quality Service - Enhanced Version
Integrates OpenAQ API v3 with improved station selection and data formatting
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

# Import RAG
try:
    from rag import RAGChain
    RAG_MODE = True
    print("RAG mode enabled - Knowledge base retrieval available")
except ImportError:
    RAG_MODE = False
    print("RAG mode disabled - RAG modules not found")

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


async def fetch_pm25_by_coordinates(lat: float, lon: float, max_distance_km: float = 50) -> Dict[str, Any]:
    """
    Fetch latest PM2.5 measurements using /parameters/2/latest endpoint.
    Filter by proximity to given coordinates since location IDs don't always match.
    Parameter ID 2 = PM2.5
    """
    try:
        from math import radians, cos, sin, asin, sqrt
        
        def haversine(lon1, lat1, lon2, lat2):
            """Calculate distance between two points in km"""
            lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            km = 6371 * c
            return km
        
        async with httpx.AsyncClient(timeout=OPENAQ_TIMEOUT * 2) as client:
            # Fetch latest PM2.5 data globally
            response = await client.get(
                f"{OPENAQ_BASE_URL}/parameters/2/latest",
                params={
                    "limit": 1000  # Get enough data to find nearby sensors
                },
                headers={
                    "X-API-Key": OPENAQ_API_KEY,
                    "User-Agent": "AIrChat/2.0",
                    "Accept": "application/json"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Filter results by proximity and find closest sensor with valid data
            results = data.get("results", [])
            nearby_measurements = []
            
            for m in results:
                coords = m.get("coordinates", {})
                mlat = coords.get("latitude")
                mlon = coords.get("longitude")
                value = m.get("value")
                
                if mlat and mlon and value is not None and value >= 0:  # Filter out invalid values
                    distance = haversine(lon, lat, mlon, mlat)
                    if distance <= max_distance_km:
                        nearby_measurements.append({
                            "parameter": {"name": "pm25"},
                            "value": value,
                            "datetime": m.get("datetime"),
                            "locationsId": m.get("locationsId"),
                            "distance_km": round(distance, 2)
                        })
            
            # Sort by distance and return closest
            nearby_measurements.sort(key=lambda x: x["distance_km"])
            
            return {"results": nearby_measurements[:5]}  # Return top 5 closest
    except Exception as e:
        print(f"Error fetching PM2.5 by coordinates: {e}")
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
        coords = best_station.get("coordinates", {})
        station_lat = coords.get("latitude")
        station_lon = coords.get("longitude")
        
        # Fetch latest measurements using coordinates-based search
        try:
            latest_data = await fetch_pm25_by_coordinates(station_lat, station_lon, max_distance_km=20)
            latest_measurements = latest_data.get("results", [])
            
            pm25_concentration = None
            pm25_values = []
            
            # Find PM2.5 measurement from latest data
            for measurement in latest_measurements:
                param = measurement.get("parameter", {})
                if param.get("name", "").lower() == "pm25":
                    value = measurement.get("value")
                    if value is not None:
                        pm25_concentration = float(value)
                        # For NowCast, we'd need historical data, but latest is sufficient for now
                        pm25_values = [pm25_concentration]
                        break
            
            # If we found PM2.5 data
            if pm25_concentration is not None:
                nowcast_value = pm25_concentration  # Use latest as nowcast equivalent
                calculation_method = "Latest Reading (Real-time)"
            else:
                # No real PM2.5 data available - return error response
                return {
                    "error": "NO_DATA_AVAILABLE",
                    "message": f"Sorry, I don't have the current information about the air quality in {location_name}. The monitoring station near this location is not reporting PM2.5 data at this time.",
                    "station": {
                        "id": location_id,
                        "name": location_name,
                        "location": {
                            "lat": station_lat,
                            "lon": station_lon
                        }
                    },
                    "suggestions": [
                        "Try a different location nearby",
                        "Check back later when the sensor might be reporting",
                        "Visit openaq.org for alternative data sources"
                    ]
                }
            
        except Exception as e:
            print(f"Latest measurements fetch failed: {e}")
            # API error - return error response
            return {
                "error": "API_ERROR",
                "message": f"Sorry, I don't have the current information about the air quality in {location_name}. There was an error fetching data from the monitoring network.",
                "details": str(e),
                "station": {
                    "id": location_id,
                    "name": location_name,
                    "location": {
                        "lat": station_lat,
                        "lon": station_lon
                    }
                },
                "suggestions": [
                    "Please try again in a few moments",
                    "Try a different location",
                    "Visit openaq.org for alternative data sources"
                ]
            }
        
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
                    "hourly_values": [round(v, 2) for v in pm25_values[-12:]] if pm25_values else [],
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


@app.get("/v1/rag/status")
async def rag_status():
    """
    Get RAG (Retrieval-Augmented Generation) status
    """
    if not RAG_MODE:
        return {
            "status": "unavailable",
            "rag_available": False,
            "documents_loaded": 0,
            "message": "RAG modules not installed"
        }
    
    try:
        # Initialize RAG and get stats
        rag_chain = RAGChain()
        stats = rag_chain.retriever.get_stats()
        
        return {
            "status": stats.get("status", "unknown"),
            "rag_available": True,
            "documents_loaded": stats.get("documents_loaded", 0),
            "score_threshold": stats.get("score_threshold", 0.12),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        return {
            "status": "error",
            "rag_available": False,
            "documents_loaded": 0,
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
