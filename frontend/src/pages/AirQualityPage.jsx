import React, { useState } from 'react';
import AqiCard from '../components/AqiCard';
import SearchBar from '../components/SearchBar';
import SearchHistory from '../components/SearchHistory';
import EmptyState from '../components/EmptyState';
import Disclaimer from '../components/Disclaimer';

/**
 * Air Quality Page - Real-time AQI monitoring with EPA standards
 * Features: Enhanced SearchBar, SearchHistory, EmptyState, Disclaimer
 */
function AirQualityPage() {
  const [searchedLocation, setSearchedLocation] = useState('');
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noStations, setNoStations] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
  const SVC_BASE_URL = import.meta.env.VITE_SVC_URL || 'http://localhost:8000';

  // Function to geocode location
  const geocodeLocation = async (query) => {
    const response = await fetch(`${API_BASE_URL}/api/geocode?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to geocode location');
    }
    return response.json();
  };

  // Function to fetch air quality data
  const fetchAirQuality = async (lat, lon, radius = 20000) => {
    const response = await fetch(`${SVC_BASE_URL}/v1/aq/latest?lat=${lat}&lon=${lon}&radius=${radius}`);
    if (!response.ok) {
      throw new Error('Failed to fetch air quality data');
    }
    return response.json();
  };

  // Handle search - called from SearchBar or SearchHistory
  const handleSearch = async (location) => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);
    setAqiData(null);
    setNoStations(false);
    setSearchedLocation(location);

    try {
      // Step 1: Geocode the location
      const geocodeResult = await geocodeLocation(location);
      console.log('Geocoded:', geocodeResult);

      // Step 2: Fetch air quality data
      const aqData = await fetchAirQuality(geocodeResult.lat, geocodeResult.lon);
      console.log('Air quality data:', aqData);

      // Step 3: Format data for AqiCard component
      if (aqData.stations && aqData.stations.length > 0) {
        const station = aqData.stations[0]; // Use first station
        setAqiData(station);
        
        // Add to search history on success
        if (window.addToSearchHistory) {
          window.addToSearchHistory(location);
        }
      } else {
        setNoStations(true);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to fetch air quality data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              🌍 AIrChat Air Quality Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time AQI data with EPA standards and NowCast calculations
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>

          {/* Search History */}
          <SearchHistory onSelectLocation={handleSearch} />

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-red-800 dark:text-red-300 font-semibold">❌ Error</div>
              <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}

          {/* AQI Card */}
          {loading && (
            <div className="flex justify-center">
              <AqiCard loading={true} />
            </div>
          )}

          {!loading && aqiData && (
            <div className="flex justify-center mb-8">
              <AqiCard aqiData={aqiData} />
            </div>
          )}

          {/* No Stations Found - EmptyState */}
          {!loading && noStations && (
            <EmptyState location={searchedLocation} />
          )}

          {/* Info Section - Show when no search has been made */}
          {!loading && !aqiData && !error && !noStations && (
            <div className="max-w-2xl mx-auto mt-12">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  About Air Quality Index (AQI)
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <p>
                    <strong>AQI Scale:</strong>
                  </p>
                  <ul className="space-y-2 ml-4">
                    <li>🟢 <strong>0-50:</strong> Good</li>
                    <li>🟡 <strong>51-100:</strong> Moderate</li>
                    <li>🟠 <strong>101-150:</strong> Unhealthy for Sensitive Groups</li>
                    <li>🔴 <strong>151-200:</strong> Unhealthy</li>
                    <li>🟣 <strong>201-300:</strong> Very Unhealthy</li>
                    <li>🟤 <strong>301+:</strong> Hazardous</li>
                  </ul>
                  <p className="text-sm mt-4">
                    Data source: <strong>OpenAQ</strong> | Calculations: <strong>EPA NowCast Formula</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer - Always show */}
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}

export default AirQualityPage;
