"""
Station Selection Utility for AIrChat
Implements best station selection logic based on pollutant priority and data quality
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta


# Pollutant priority order (higher = better)
POLLUTANT_PRIORITY = {
    "pm25": 10,
    "pm10": 9,
    "o3": 8,
    "no2": 7,
    "so2": 6,
    "co": 5
}


def calculate_station_score(station: Dict[str, Any]) -> tuple:
    """
    Calculate a score for a station based on available pollutants and data quality.
    
    Args:
        station: OpenAQ station/location data
        
    Returns:
        Tuple of (primary_score, secondary_score, tertiary_score) for sorting
        - primary_score: Highest priority pollutant available
        - secondary_score: Total number of pollutants
        - tertiary_score: Data recency (inverse of hours since last update)
    """
    parameters = station.get("parameters", [])
    
    # Get available pollutants
    available_pollutants = []
    for param in parameters:
        param_name = param.get("name", "").lower()
        if param_name in POLLUTANT_PRIORITY:
            available_pollutants.append(param_name)
    
    if not available_pollutants:
        return (0, 0, 0)
    
    # Primary score: highest priority pollutant
    primary_score = max(POLLUTANT_PRIORITY.get(p, 0) for p in available_pollutants)
    
    # Secondary score: number of pollutants
    secondary_score = len(available_pollutants)
    
    # Tertiary score: data recency
    tertiary_score = 0
    last_updated = station.get("lastUpdated") or station.get("last_updated")
    if last_updated:
        try:
            last_update_time = datetime.fromisoformat(last_updated.replace("Z", "+00:00"))
            hours_ago = (datetime.now(last_update_time.tzinfo) - last_update_time).total_seconds() / 3600
            # Inverse score: more recent = higher score
            tertiary_score = max(0, 24 - hours_ago)
        except Exception:
            tertiary_score = 0
    
    return (primary_score, secondary_score, tertiary_score)


def select_best_station(stations: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Select the best station from a list based on pollutant priority.
    Priority: PM2.5 > PM10 > O3 > NO2 > SO2 > CO
    
    Args:
        stations: List of OpenAQ station/location objects
        
    Returns:
        Best station or None if no stations
    """
    if not stations:
        return None
    
    # Score all stations
    scored_stations = []
    for station in stations:
        score = calculate_station_score(station)
        scored_stations.append((score, station))
    
    # Sort by score (descending)
    scored_stations.sort(key=lambda x: x[0], reverse=True)
    
    # Return best station
    return scored_stations[0][1] if scored_stations else None


def get_station_pollutants(station: Dict[str, Any]) -> List[str]:
    """
    Get list of available pollutants for a station.
    
    Args:
        station: OpenAQ station/location data
        
    Returns:
        List of pollutant names (lowercase)
    """
    parameters = station.get("parameters", [])
    pollutants = []
    
    for param in parameters:
        param_name = param.get("name", "").lower()
        if param_name in POLLUTANT_PRIORITY:
            pollutants.append(param_name)
    
    return pollutants


def format_station_info(station: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format station information in standardized format.
    
    Args:
        station: OpenAQ station/location data
        
    Returns:
        Formatted station info
    """
    coords = station.get("coordinates", {})
    
    return {
        "id": station.get("id"),
        "name": station.get("name", "Unknown Station"),
        "location": {
            "lat": coords.get("latitude"),
            "lon": coords.get("longitude")
        },
        "distance_km": round(station.get("distance", 0) / 1000, 2) if station.get("distance") else None,
        "available_pollutants": get_station_pollutants(station),
        "last_updated": station.get("lastUpdated") or station.get("last_updated"),
        "provider": station.get("provider", {}).get("name", "OpenAQ")
    }
