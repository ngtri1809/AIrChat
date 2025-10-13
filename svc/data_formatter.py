"""
Data Formatter Utility for AIrChat
Standardizes all data formats according to specifications:
- ISO 8601 timestamps
- µg/m³ units for pollutants
- Consistent JSON structure
"""
from typing import Dict, Any, List, Optional
from datetime import datetime


def format_timestamp(dt: Any) -> str:
    """
    Format timestamp to ISO 8601 standard.
    
    Args:
        dt: datetime object, ISO string, or timestamp
        
    Returns:
        ISO 8601 formatted string (UTC)
    """
    if dt is None:
        return datetime.utcnow().isoformat() + "Z"
    
    if isinstance(dt, str):
        # Already a string, ensure it ends with Z
        if not dt.endswith("Z") and not dt.endswith("+00:00"):
            return dt + "Z"
        return dt.replace("+00:00", "Z")
    
    if isinstance(dt, datetime):
        return dt.isoformat() + "Z"
    
    return datetime.utcnow().isoformat() + "Z"


def format_concentration(value: float, unit: str = "µg/m³") -> Dict[str, Any]:
    """
    Format pollutant concentration with unit.
    
    Args:
        value: Concentration value
        unit: Unit of measurement (default µg/m³)
        
    Returns:
        Formatted concentration object
    """
    return {
        "value": round(value, 2) if value is not None else None,
        "unit": unit
    }


def format_pollutant_data(
    pollutant: str,
    concentration: float,
    aqi: int,
    nowcast: Optional[float] = None,
    raw_values: Optional[List[float]] = None,
    calculation_method: str = "EPA Standard"
) -> Dict[str, Any]:
    """
    Format pollutant data in standardized structure.
    
    Args:
        pollutant: Pollutant name (pm25, pm10, o3, no2, etc.)
        concentration: Current concentration
        aqi: Calculated AQI value
        nowcast: NowCast value if available
        raw_values: List of raw hourly values
        calculation_method: Method used for calculation
        
    Returns:
        Standardized pollutant data object
    """
    data = {
        "pollutant": pollutant.upper(),
        "concentration": format_concentration(concentration),
        "aqi": {
            "value": aqi,
            "category": get_aqi_category(aqi)["category"],
            "color": get_aqi_category(aqi)["color"],
            "health_guidance": get_aqi_category(aqi)["guidance"]
        },
        "calculation_method": calculation_method
    }
    
    if nowcast is not None:
        data["nowcast"] = format_concentration(nowcast)
    
    if raw_values:
        data["hourly_values"] = [round(v, 2) for v in raw_values[-12:]]
    
    return data


def get_aqi_category(aqi: int) -> Dict[str, str]:
    """
    Get AQI category information based on EPA standards.
    
    Args:
        aqi: AQI value
        
    Returns:
        Dictionary with category, color, and guidance
    """
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#00e400",
            "guidance": "Air quality is satisfactory, and air pollution poses little or no risk."
        }
    elif aqi <= 100:
        return {
            "category": "Moderate",
            "color": "#ffff00",
            "guidance": "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."
        }
    elif aqi <= 150:
        return {
            "category": "Unhealthy for Sensitive Groups",
            "color": "#ff7e00",
            "guidance": "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
        }
    elif aqi <= 200:
        return {
            "category": "Unhealthy",
            "color": "#ff0000",
            "guidance": "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects."
        }
    elif aqi <= 300:
        return {
            "category": "Very Unhealthy",
            "color": "#8f3f97",
            "guidance": "Health alert: The risk of health effects is increased for everyone."
        }
    else:
        return {
            "category": "Hazardous",
            "color": "#7e0023",
            "guidance": "Health warning of emergency conditions: everyone is more likely to be affected."
        }


def format_station_response(
    station_info: Dict[str, Any],
    pollutants_data: List[Dict[str, Any]],
    dominant_pollutant: str,
    overall_aqi: int,
    timestamp: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Format complete station response in standardized structure.
    
    Args:
        station_info: Station metadata
        pollutants_data: List of pollutant data objects
        dominant_pollutant: Pollutant with highest AQI
        overall_aqi: Overall AQI value
        timestamp: Response timestamp
        
    Returns:
        Complete standardized response
    """
    aqi_info = get_aqi_category(overall_aqi)
    
    return {
        "aqi": {
            "value": overall_aqi,
            "category": aqi_info["category"],
            "color": aqi_info["color"],
            "dominant_pollutant": dominant_pollutant.upper()
        },
        "pollutants": pollutants_data,
        "station": station_info,
        "metadata": {
            "timestamp": format_timestamp(timestamp),
            "data_source": "OpenAQ",
            "calculation_standard": "EPA",
            "timezone": "UTC"
        }
    }


def format_error_response(
    error_code: str,
    message: str,
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Format error response in standardized structure.
    
    Args:
        error_code: Error code identifier
        message: Human-readable error message
        details: Additional error details
        
    Returns:
        Standardized error response
    """
    response = {
        "error": {
            "code": error_code,
            "message": message,
            "timestamp": format_timestamp(None)
        }
    }
    
    if details:
        response["error"]["details"] = details
    
    return response


def format_no_stations_response(lat: float, lon: float, radius_m: int) -> Dict[str, Any]:
    """
    Format response when no stations are found.
    
    Args:
        lat: Search latitude
        lon: Search longitude
        radius_m: Search radius in meters
        
    Returns:
        Standardized no-stations response
    """
    return {
        "message": "No air quality monitoring stations found",
        "search_parameters": {
            "location": {
                "lat": round(lat, 6),
                "lon": round(lon, 6)
            },
            "radius_km": round(radius_m / 1000, 1)
        },
        "suggestions": [
            "Try searching for a nearby major city",
            "Increase the search radius",
            "Check if the location is correct"
        ],
        "metadata": {
            "timestamp": format_timestamp(None),
            "stations_found": 0
        }
    }
