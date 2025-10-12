"""
AQI (Air Quality Index) Calculation Module
EPA 40 CFR Part 58 Appendix G
https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-58/appendix-Appendix%20G%20to%20Part%2058
"""
from typing import Dict, Optional, Tuple


# EPA AQI Breakpoints for PM2.5 (µg/m³)
# Format: (concentration_low, concentration_high, aqi_low, aqi_high, category, color)
PM25_BREAKPOINTS = [
    (0.0, 12.0, 0, 50, "Good", "#00E400"),
    (12.1, 35.4, 51, 100, "Moderate", "#FFFF00"),
    (35.5, 55.4, 101, 150, "Unhealthy for Sensitive Groups", "#FF7E00"),
    (55.5, 150.4, 151, 200, "Unhealthy", "#FF0000"),
    (150.5, 250.4, 201, 300, "Very Unhealthy", "#8F3F97"),
    (250.5, 350.4, 301, 400, "Hazardous", "#7E0023"),
    (350.5, 500.4, 401, 500, "Hazardous", "#7E0023"),
]

# EPA AQI Breakpoints for PM10 (µg/m³)
PM10_BREAKPOINTS = [
    (0, 54, 0, 50, "Good", "#00E400"),
    (55, 154, 51, 100, "Moderate", "#FFFF00"),
    (155, 254, 101, 150, "Unhealthy for Sensitive Groups", "#FF7E00"),
    (255, 354, 151, 200, "Unhealthy", "#FF0000"),
    (355, 424, 201, 300, "Very Unhealthy", "#8F3F97"),
    (425, 504, 301, 400, "Hazardous", "#7E0023"),
    (505, 604, 401, 500, "Hazardous", "#7E0023"),
]

# EPA AQI Breakpoints for O3 (ozone) 8-hour average (ppm)
O3_8HR_BREAKPOINTS = [
    (0.000, 0.054, 0, 50, "Good", "#00E400"),
    (0.055, 0.070, 51, 100, "Moderate", "#FFFF00"),
    (0.071, 0.085, 101, 150, "Unhealthy for Sensitive Groups", "#FF7E00"),
    (0.086, 0.105, 151, 200, "Unhealthy", "#FF0000"),
    (0.106, 0.200, 201, 300, "Very Unhealthy", "#8F3F97"),
]

# EPA AQI Breakpoints for NO2 (nitrogen dioxide) 1-hour average (ppb)
NO2_BREAKPOINTS = [
    (0, 53, 0, 50, "Good", "#00E400"),
    (54, 100, 51, 100, "Moderate", "#FFFF00"),
    (101, 360, 101, 150, "Unhealthy for Sensitive Groups", "#FF7E00"),
    (361, 649, 151, 200, "Unhealthy", "#FF0000"),
    (650, 1249, 201, 300, "Very Unhealthy", "#8F3F97"),
    (1250, 1649, 301, 400, "Hazardous", "#7E0023"),
    (1650, 2049, 401, 500, "Hazardous", "#7E0023"),
]


def calculate_aqi(concentration: float, pollutant: str) -> Dict[str, any]:
    """
    Calculate AQI using EPA formula.
    
    EPA Formula:
    I = ((I_high - I_low) / (BP_high - BP_low)) * (C - BP_low) + I_low
    
    Where:
    - I = AQI
    - C = pollutant concentration
    - BP = breakpoint (concentration)
    - I_low, I_high = AQI breakpoints
    - BP_low, BP_high = concentration breakpoints
    
    Args:
        concentration: Pollutant concentration
        pollutant: One of 'pm25', 'pm10', 'o3', 'no2'
    
    Returns:
        Dictionary with aqi, category, color, and concentration
    
    Examples:
        >>> calculate_aqi(28.4, 'pm25')
        {'aqi': 87, 'category': 'Moderate', 'color': '#FFFF00', 'concentration': 28.4}
    """
    # Select appropriate breakpoints
    if pollutant.lower() == 'pm25':
        breakpoints = PM25_BREAKPOINTS
    elif pollutant.lower() == 'pm10':
        breakpoints = PM10_BREAKPOINTS
    elif pollutant.lower() == 'o3':
        breakpoints = O3_8HR_BREAKPOINTS
    elif pollutant.lower() == 'no2':
        breakpoints = NO2_BREAKPOINTS
    else:
        raise ValueError(f"Unknown pollutant: {pollutant}")
    
    # Handle concentration beyond range
    if concentration < 0:
        concentration = 0
    
    # Find appropriate breakpoint
    for bp_low, bp_high, i_low, i_high, category, color in breakpoints:
        if bp_low <= concentration <= bp_high:
            # Apply EPA AQI formula
            aqi = ((i_high - i_low) / (bp_high - bp_low)) * (concentration - bp_low) + i_low
            
            return {
                "aqi": round(aqi),
                "category": category,
                "color": color,
                "concentration": round(concentration, 1),
                "pollutant": pollutant.upper()
            }
    
    # If concentration exceeds all breakpoints, return hazardous at 500+
    return {
        "aqi": 500,
        "category": "Hazardous",
        "color": "#7E0023",
        "concentration": round(concentration, 1),
        "pollutant": pollutant.upper()
    }


def calculate_aqi_pm25(concentration: float) -> Dict[str, any]:
    """
    Calculate AQI specifically for PM2.5.
    
    Args:
        concentration: PM2.5 concentration in µg/m³
    
    Returns:
        Dictionary with AQI information
    """
    return calculate_aqi(concentration, 'pm25')


def calculate_aqi_pm10(concentration: float) -> Dict[str, any]:
    """
    Calculate AQI specifically for PM10.
    
    Args:
        concentration: PM10 concentration in µg/m³
    
    Returns:
        Dictionary with AQI information
    """
    return calculate_aqi(concentration, 'pm10')


def get_dominant_pollutant(pollutants: Dict[str, Dict]) -> Tuple[str, Dict]:
    """
    Determine which pollutant has the highest AQI (dominant pollutant).
    
    Args:
        pollutants: Dictionary of pollutant data with AQI values
                   e.g., {'pm25': {..., 'aqi': 87}, 'pm10': {..., 'aqi': 45}}
    
    Returns:
        Tuple of (pollutant_name, pollutant_data)
    """
    if not pollutants:
        return None, None
    
    max_aqi = -1
    dominant = None
    dominant_data = None
    
    for pollutant, data in pollutants.items():
        if data and 'aqi' in data and data['aqi'] > max_aqi:
            max_aqi = data['aqi']
            dominant = pollutant
            dominant_data = data
    
    return dominant, dominant_data


def get_aqi_description(aqi: int) -> Dict[str, str]:
    """
    Get descriptive information for an AQI value.
    
    Args:
        aqi: AQI value (0-500+)
    
    Returns:
        Dictionary with category, color, and health implications
    """
    if aqi <= 50:
        return {
            "category": "Good",
            "color": "#00E400",
            "description": "Air quality is satisfactory, and air pollution poses little or no risk.",
            "health_implications": "None"
        }
    elif aqi <= 100:
        return {
            "category": "Moderate",
            "color": "#FFFF00",
            "description": "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.",
            "health_implications": "Unusually sensitive people should consider limiting prolonged outdoor exertion."
        }
    elif aqi <= 150:
        return {
            "category": "Unhealthy for Sensitive Groups",
            "color": "#FF7E00",
            "description": "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
            "health_implications": "Sensitive groups should limit prolonged outdoor exertion."
        }
    elif aqi <= 200:
        return {
            "category": "Unhealthy",
            "color": "#FF0000",
            "description": "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.",
            "health_implications": "Everyone should limit prolonged outdoor exertion."
        }
    elif aqi <= 300:
        return {
            "category": "Very Unhealthy",
            "color": "#8F3F97",
            "description": "Health alert: The risk of health effects is increased for everyone.",
            "health_implications": "Everyone should avoid prolonged outdoor exertion; sensitive groups should remain indoors."
        }
    else:
        return {
            "category": "Hazardous",
            "color": "#7E0023",
            "description": "Health warning of emergency conditions: everyone is more likely to be affected.",
            "health_implications": "Everyone should avoid all outdoor exertion."
        }


# Test the function if run directly
if __name__ == "__main__":
    # Test various PM2.5 concentrations
    test_concentrations = [10, 28.4, 40, 65, 175, 275, 400]
    
    print("PM2.5 AQI Calculations:")
    print("-" * 60)
    for conc in test_concentrations:
        result = calculate_aqi_pm25(conc)
        print(f"PM2.5: {conc:6.1f} µg/m³ → AQI: {result['aqi']:3d} ({result['category']})")
    
    print("\nDominant Pollutant Test:")
    print("-" * 60)
    test_pollutants = {
        'pm25': calculate_aqi(28.4, 'pm25'),
        'pm10': calculate_aqi(60, 'pm10'),
        'no2': calculate_aqi(45, 'no2')
    }
    dominant, data = get_dominant_pollutant(test_pollutants)
    print(f"Dominant: {dominant} with AQI {data['aqi']}")
