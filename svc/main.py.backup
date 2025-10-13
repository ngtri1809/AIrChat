"""
AIrChat FastAPIapp = FastAPI(
    title="AIrChat Air Quality Service",
    description="Real-time air quality monitoring using OpenAQ data",
    version="1.0.0"
)ice
Integrates OpenAQ API v3 for real-time air quality monitoring
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

# Import our calculation modules
from nowcast import calculate_nowcast_pm25, calculate_nowcast_pm10
from aqi_epa import calculate_aqi_pm25, calculate_aqi_pm10, get_dominant_pollutant, get_aqi_description

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AIrChat Air Quality Service",
    description="Real-time air quality data using OpenAQ API v3",
    version="1.0.0"
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
    """
    Fetch air quality data from OpenAQ API v3
    
    Args:
        lat: Latitude
        lon: Longitude
        radius: Radius in meters (max 25000)
        
    Returns:
        OpenAQ API response data
    """
    try:
        async with httpx.AsyncClient(timeout=OPENAQ_TIMEOUT) as client:
            # First, get locations within radius
            response = await client.get(
                f"{OPENAQ_BASE_URL}/locations",
                params={
                    "coordinates": f"{lat},{lon}",
                    "radius": min(radius, 25000),  # Max 25km
                    "limit": 100
                },
                headers={
                    "X-API-Key": OPENAQ_API_KEY,
                    "User-Agent": "AIrChat/1.0",
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
    """
    Fetch hourly measurements for a specific location.
    
    Args:
        location_id: OpenAQ location ID
        hours: Number of hours to fetch (default 12 for NowCast)
    
    Returns:
        Measurements data from OpenAQ
    """
    try:
        async with httpx.AsyncClient(timeout=OPENAQ_TIMEOUT) as client:
            # Calculate date range
            date_to = datetime.utcnow()
            date_from = date_to - timedelta(hours=hours)
            
            response = await client.get(
                f"{OPENAQ_BASE_URL}/locations/{location_id}/measurements",
                params={
                    "date_from": date_from.isoformat() + "Z",
                    "date_to": date_to.isoformat() + "Z",
                    "parameter": "pm25",  # Focus on PM2.5 for now
                    "limit": 1000
                },
                headers={
                    "X-API-Key": OPENAQ_API_KEY,
                    "User-Agent": "AIrChat/1.0",
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
        raise HTTPException(status_code=502, detail="OpenAQ measurements API error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching measurements: {str(e)}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AIrChat Air Quality Service",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/v1/aq/latest")
async def get_latest_air_quality(
    lat: float = Query(..., description="Latitude", ge=-90, le=90),
    lon: float = Query(..., description="Longitude", ge=-180, le=180),
    radius: int = Query(20000, description="Radius in meters", ge=1000, le=25000)
):
    """
    Get latest air quality data for a location with NowCast and AQI calculations.
    
    Args:
        lat: Latitude
        lon: Longitude
        radius: Search radius in meters (default 20000, max 25000)
        
    Returns:
        Air quality data with AQI, NowCast, and pollutant information
    """
    try:
        # Fetch locations from OpenAQ
        openaq_data = await fetch_openaq_data(lat, lon, radius)
        locations = openaq_data.get("results", [])
        
        if not locations:
            return {
                "message": f"No air quality monitors found within {radius/1000:.1f}km",
                "lat": lat,
                "lon": lon,
                "radius_km": radius / 1000,
                "stations": []
            }
        
        # Find best station with PM2.5 data
        best_station = None
        for loc in locations:
            parameters = [p.get("name", "").lower() for p in loc.get("parameters", [])]
            if "pm25" in parameters:
                best_station = loc
                break
        
        if not best_station:
            # Fallback: use first station even without PM2.5
            best_station = locations[0]
        
        location_id = best_station.get("id")
        location_name = best_station.get("name", "Unknown")
        
        # Try to fetch hourly measurements for NowCast
        try:
            measurements_data = await fetch_location_measurements(location_id, hours=12)
            measurements = measurements_data.get("results", [])
            
            # Extract PM2.5 values (hourly)
            pm25_values = []
            for measurement in measurements:
                value = measurement.get("value")
                if value is not None:
                    pm25_values.append(float(value))
            
            # Calculate NowCast if we have enough data
            nowcast_value = None
            if len(pm25_values) >= 2:
                nowcast_value = calculate_nowcast_pm25(pm25_values)
            
            # Use NowCast or fall back to latest reading
            if nowcast_value:
                pm25_concentration = nowcast_value
                calculation_method = "NowCast"
            elif pm25_values:
                pm25_concentration = pm25_values[-1]  # Most recent
                calculation_method = "Latest Reading"
            else:
                # No data available - use mock data for demo
                pm25_concentration = 28.4
                pm25_values = [25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29]
                nowcast_value = calculate_nowcast_pm25(pm25_values)
                pm25_concentration = nowcast_value
                calculation_method = "Mock Data (No readings available)"
            
        except Exception as e:
            # If measurements fetch fails, use mock data
            print(f"Measurements fetch failed: {e}")
            pm25_concentration = 28.4
            pm25_values = [25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29]
            nowcast_value = calculate_nowcast_pm25(pm25_values)
            pm25_concentration = nowcast_value
            calculation_method = "Mock Data (API Error)"
        
        # Calculate AQI
        pm25_aqi = calculate_aqi_pm25(pm25_concentration)
        
        # Build response
        response = {
            "aqi": pm25_aqi["aqi"],
            "category": pm25_aqi["category"],
            "color": pm25_aqi["color"],
            "dominant": "pm25",
            "pm25": {
                "nowcast": nowcast_value,
                "aqi": pm25_aqi["aqi"],
                "unit": "µg/m³",
                "raw_values": pm25_values[-12:],  # Last 12 hours
                "calculation_method": calculation_method
            },
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "source": {
                "provider": "OpenAQ",
                "location_id": location_id,
                "location_name": location_name,
                "coordinates": {
                    "lat": best_station.get("coordinates", {}).get("latitude"),
                    "lon": best_station.get("coordinates", {}).get("longitude")
                }
            },
            "stations_found": len(locations)
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_latest_air_quality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
