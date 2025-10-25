import React from 'react';

/**
 * Air Quality Data Card Component
 * Displays air quality information in a visually appealing card format
 */
function AirQualityCard({ data }) {
  if (!data) return null;

  /**
   * Get AQI color and category based on value
   */
  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { color: 'green', category: 'Good', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-800' };
    if (aqi <= 100) return { color: 'yellow', category: 'Moderate', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800' };
    if (aqi <= 150) return { color: 'orange', category: 'Unhealthy for Sensitive Groups', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-800' };
    if (aqi <= 200) return { color: 'red', category: 'Unhealthy', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800' };
    if (aqi <= 300) return { color: 'purple', category: 'Very Unhealthy', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', textColor: 'text-purple-800' };
    return { color: 'maroon', category: 'Hazardous', bgColor: 'bg-red-100', borderColor: 'border-red-300', textColor: 'text-red-900' };
  };

  /**
   * Get health recommendations based on AQI
   */
  const getHealthRecommendations = (aqi) => {
    if (aqi <= 50) return [
      "✅ Air quality is satisfactory",
      "✅ No health impacts expected",
      "✅ Enjoy outdoor activities"
    ];
    if (aqi <= 100) return [
      "⚠️ Air quality is acceptable for most people",
      "⚠️ Sensitive individuals may experience minor symptoms",
      "⚠️ Consider reducing outdoor activities if you have respiratory issues"
    ];
    if (aqi <= 150) return [
      "🔶 Sensitive groups should avoid outdoor activities",
      "🔶 People with heart or lung disease should stay indoors",
      "🔶 Children and elderly should limit outdoor exposure"
    ];
    if (aqi <= 200) return [
      "🔴 Everyone should avoid outdoor activities",
      "🔴 Stay indoors with windows closed",
      "🔴 Use air purifiers if available"
    ];
    if (aqi <= 300) return [
      "🟣 Avoid all outdoor activities",
      "🟣 Stay indoors with windows and doors closed",
      "🟣 Use air purifiers and masks if going outside"
    ];
    return [
      "🚨 Emergency conditions - stay indoors",
      "🚨 Use air purifiers and N95 masks",
      "🚨 Avoid all outdoor activities"
    ];
  };

  const aqiInfo = getAQICategory(data.aqi || 0);
  const recommendations = getHealthRecommendations(data.aqi || 0);

  return (
    <div className={`air-quality-card card-hover my-4 p-6 rounded-xl border-2 ${aqiInfo.bgColor} ${aqiInfo.borderColor} shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${aqiInfo.color === 'green' ? 'bg-green-500' : 
            aqiInfo.color === 'yellow' ? 'bg-yellow-500' : 
            aqiInfo.color === 'orange' ? 'bg-orange-500' : 
            aqiInfo.color === 'red' ? 'bg-red-500' : 
            aqiInfo.color === 'purple' ? 'bg-purple-500' : 'bg-red-600'}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div>
            <h3 className={`text-xl font-bold ${aqiInfo.textColor}`}>
              Air Quality Index: {data.aqi || 'N/A'}
            </h3>
            <p className={`text-sm ${aqiInfo.textColor} opacity-80`}>
              {aqiInfo.category}
            </p>
          </div>
        </div>
        
        {/* Location */}
        {data.location && (
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">📍 {data.location}</p>
            {data.timestamp && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Updated: {new Date(data.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pollutants */}
      {data.pollutants && Object.keys(data.pollutants).length > 0 && (
        <div className="mb-4">
          <h4 className={`font-semibold mb-2 ${aqiInfo.textColor}`}>Pollutant Levels</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.pollutants).map(([pollutant, value]) => (
              <div key={pollutant} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {pollutant.toUpperCase()}
                  </span>
                  <span className={`text-sm font-bold ${aqiInfo.textColor}`}>
                    {value} μg/m³
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      aqiInfo.color === 'green' ? 'bg-green-500' : 
                      aqiInfo.color === 'yellow' ? 'bg-yellow-500' : 
                      aqiInfo.color === 'orange' ? 'bg-orange-500' : 
                      aqiInfo.color === 'red' ? 'bg-red-500' : 
                      aqiInfo.color === 'purple' ? 'bg-purple-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Recommendations */}
      <div className="mb-4">
        <h4 className={`font-semibold mb-2 ${aqiInfo.textColor}`}>Health Recommendations</h4>
        <div className="space-y-1">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      {data.weather && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>🌡️ Temperature: {data.weather.temperature}°C</span>
            <span>💨 Wind: {data.weather.windSpeed} km/h</span>
            <span>💧 Humidity: {data.weather.humidity}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AirQualityCard;
