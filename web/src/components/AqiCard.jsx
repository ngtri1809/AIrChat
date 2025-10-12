import React from 'react';
import PropTypes from 'prop-types';

/**
 * AqiCard Component
 * Displays air quality index with EPA color coding
 */
const AqiCard = ({ aqiData, loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-red-50 border-2 border-red-200 rounded-lg shadow-lg">
        <div className="text-red-800 font-semibold text-lg mb-2">Error</div>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!aqiData) {
    return null;
  }

  const { aqi, category, color, dominant, updated_at, pm25, source } = aqiData;

  // Calculate minutes ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMins = Math.floor(diffMs / 1000 / 60);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  // Get pollutant label
  const getPollutantLabel = (pollutant) => {
    const labels = {
      pm25: 'PM2.5',
      pm10: 'PM10',
      o3: 'Ozone (O₃)',
      no2: 'NO₂'
    };
    return labels[pollutant] || pollutant.toUpperCase();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div 
        className="p-8 rounded-lg shadow-2xl transition-all duration-300 hover:shadow-3xl"
        style={{ 
          backgroundColor: color,
          border: `4px solid ${color}`,
        }}
      >
        {/* AQI Number - Large and prominent */}
        <div className="text-center mb-4">
          <div className="text-8xl font-bold text-white drop-shadow-lg">
            {aqi}
          </div>
          <div className="text-2xl font-semibold text-white mt-2 drop-shadow-md">
            {category}
          </div>
        </div>

        {/* Pollutant Information */}
        <div className="bg-white bg-opacity-90 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Dominant Pollutant:</span>
            <span className="text-gray-900 font-bold">{getPollutantLabel(dominant)}</span>
          </div>
          
          {pm25 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Concentration:</span>
              <span className="text-gray-900 font-bold">
                {pm25.nowcast} {pm25.unit}
              </span>
            </div>
          )}
        </div>

        {/* Location and Time */}
        <div className="bg-white bg-opacity-90 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">
            📍 {source?.location_name || 'Unknown Location'}
          </div>
          <div className="text-xs text-gray-500">
            Updated {getTimeAgo(updated_at)}
          </div>
          {pm25?.calculation_method && (
            <div className="text-xs text-gray-400 mt-1">
              Method: {pm25.calculation_method}
            </div>
          )}
        </div>
      </div>

      {/* Health Implications */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-2">Health Implications</h3>
        <p className="text-sm text-gray-700">
          {getHealthImplication(category)}
        </p>
      </div>
    </div>
  );
};

// Health implications for each category
const getHealthImplication = (category) => {
  const implications = {
    'Good': 'Air quality is satisfactory, and air pollution poses little or no risk.',
    'Moderate': 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
    'Unhealthy for Sensitive Groups': 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    'Unhealthy': 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
    'Very Unhealthy': 'Health alert: The risk of health effects is increased for everyone.',
    'Hazardous': 'Health warning of emergency conditions: everyone is more likely to be affected.'
  };
  return implications[category] || 'Air quality information not available.';
};

AqiCard.propTypes = {
  aqiData: PropTypes.shape({
    aqi: PropTypes.number,
    category: PropTypes.string,
    color: PropTypes.string,
    dominant: PropTypes.string,
    updated_at: PropTypes.string,
    pm25: PropTypes.shape({
      nowcast: PropTypes.number,
      aqi: PropTypes.number,
      unit: PropTypes.string,
      raw_values: PropTypes.arrayOf(PropTypes.number),
      calculation_method: PropTypes.string
    }),
    source: PropTypes.shape({
      provider: PropTypes.string,
      location_id: PropTypes.number,
      location_name: PropTypes.string,
      coordinates: PropTypes.shape({
        lat: PropTypes.number,
        lon: PropTypes.number
      })
    })
  }),
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default AqiCard;
