"""
NowCast PM2.5 Calculation Module
EPA Technical Assistance Document for the Reporting of Daily Air Quality
https://forum.airnowtech.org/t/the-nowcast-for-pm2-5-and-pm10/172
"""
from typing import List, Optional


def calculate_nowcast_pm25(hourly_values: List[Optional[float]]) -> Optional[float]:
    """
    Calculate NowCast PM2.5 per EPA Technical Assistance Document.
    
    NowCast is a weighted average that gives more weight to recent measurements
    and less weight to older measurements. It provides a more stable estimate
    of current air quality conditions.
    
    Algorithm:
    1. Use the 12 most recent hourly values
    2. Calculate weight: w = min(min_value/max_value, 1)
    3. If w < 0.5, set w = 0.5
    4. Require at least 2 of the 3 most recent hours to be valid
    5. NowCast = sum(c_i * w^(i-1)) / sum(w^(i-1)) for i=1 to N
    
    Args:
        hourly_values: List of PM2.5 hourly values (µg/m³), most recent last.
                      Can contain None for missing values.
    
    Returns:
        NowCast PM2.5 value (µg/m³) or None if insufficient data
    
    Examples:
        >>> calculate_nowcast_pm25([25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29])
        28.4  # Approximate
        
        >>> calculate_nowcast_pm25([10, 12])
        11.0  # Approximate
        
        >>> calculate_nowcast_pm25([None, None, 25])
        None  # Insufficient data (need 2 of 3 most recent)
    """
    if not hourly_values or len(hourly_values) < 2:
        return None
    
    # Use most recent 12 hours (or less if fewer available)
    values = hourly_values[-12:]
    
    # Check: at least 2 of 3 most recent hours must be valid
    recent_three = values[-3:]
    valid_recent = sum(1 for v in recent_three if v is not None)
    if valid_recent < 2:
        return None
    
    # Filter out None values for calculations
    valid_values = [v for v in values if v is not None]
    
    if len(valid_values) < 2:
        return None
    
    # Calculate min and max
    min_val = min(valid_values)
    max_val = max(valid_values)
    
    # Calculate weight
    if max_val > 0:
        w = min_val / max_val
    else:
        w = 1.0
    
    # Ensure weight is at least 0.5
    if w < 0.5:
        w = 0.5
    
    # Calculate weighted average
    # NowCast = sum(c_i * w^(i-1)) / sum(w^(i-1))
    # where i=1 for oldest, increasing to N for most recent
    numerator = 0.0
    denominator = 0.0
    
    for i, value in enumerate(values):
        if value is not None:
            weight_power = w ** i
            numerator += value * weight_power
            denominator += weight_power
    
    if denominator == 0:
        return None
    
    nowcast = numerator / denominator
    return round(nowcast, 1)


def calculate_nowcast_pm10(hourly_values: List[Optional[float]]) -> Optional[float]:
    """
    Calculate NowCast PM10 (same algorithm as PM2.5).
    
    Args:
        hourly_values: List of PM10 hourly values (µg/m³)
    
    Returns:
        NowCast PM10 value (µg/m³) or None if insufficient data
    """
    # Same algorithm as PM2.5
    return calculate_nowcast_pm25(hourly_values)


def get_nowcast_info() -> dict:
    """
    Return information about the NowCast algorithm.
    
    Returns:
        Dictionary with algorithm details
    """
    return {
        "algorithm": "EPA NowCast",
        "description": "Weighted average giving more weight to recent measurements",
        "min_hours_required": 2,
        "recent_hours_check": "At least 2 of 3 most recent hours required",
        "min_weight": 0.5,
        "reference": "https://forum.airnowtech.org/t/the-nowcast-for-pm2-5-and-pm10/172"
    }


# Test the function if run directly
if __name__ == "__main__":
    # Test case 1: Normal case with 12 hours
    test_values_1 = [25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29]
    result_1 = calculate_nowcast_pm25(test_values_1)
    print(f"Test 1 - 12 hours of data: {result_1}")
    
    # Test case 2: Variable air quality
    test_values_2 = [10, 15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35]
    result_2 = calculate_nowcast_pm25(test_values_2)
    print(f"Test 2 - Increasing then decreasing: {result_2}")
    
    # Test case 3: With missing values
    test_values_3 = [25, None, 30, 28, None, 29, 31, 27, 26, 28, 30, 29]
    result_3 = calculate_nowcast_pm25(test_values_3)
    print(f"Test 3 - With missing values: {result_3}")
    
    # Test case 4: Insufficient recent data
    test_values_4 = [25, 27, 30, 28, 26, 29, 31, 27, 26, None, None, None]
    result_4 = calculate_nowcast_pm25(test_values_4)
    print(f"Test 4 - Insufficient recent data: {result_4}")
    
    print(f"\nNowCast Info:")
    print(get_nowcast_info())
