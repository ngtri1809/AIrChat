import { useState } from 'react'
import AqiCard from './components/AqiCard'
import './App.css'

function App() {
  // Mock data for Day 2 testing - matches our API response
  const mockAqiData = {
    aqi: 83,
    category: "Moderate",
    color: "#FFFF00",
    dominant: "pm25",
    pm25: {
      nowcast: 27.5,
      aqi: 83,
      unit: "µg/m³",
      raw_values: [25, 27, 30, 28, 26, 29, 31, 27, 26, 28, 30, 29],
      calculation_method: "NowCast"
    },
    updated_at: new Date().toISOString(),
    source: {
      provider: "OpenAQ",
      location_id: 1577,
      location_name: "San Jose - Los Gatos",
      coordinates: {
        lat: 37.2267,
        lon: -121.9786
      }
    }
  };

  // Test different AQI levels
  const [testLevel, setTestLevel] = useState('moderate');
  
  const testData = {
    good: {
      ...mockAqiData,
      aqi: 42,
      category: "Good",
      color: "#00E400",
      pm25: { ...mockAqiData.pm25, nowcast: 10.0, aqi: 42 }
    },
    moderate: mockAqiData,
    unhealthy_sensitive: {
      ...mockAqiData,
      aqi: 112,
      category: "Unhealthy for Sensitive Groups",
      color: "#FF7E00",
      pm25: { ...mockAqiData.pm25, nowcast: 40.0, aqi: 112 }
    },
    unhealthy: {
      ...mockAqiData,
      aqi: 156,
      category: "Unhealthy",
      color: "#FF0000",
      pm25: { ...mockAqiData.pm25, nowcast: 65.0, aqi: 156 }
    },
    very_unhealthy: {
      ...mockAqiData,
      aqi: 225,
      category: "Very Unhealthy",
      color: "#8F3F97",
      pm25: { ...mockAqiData.pm25, nowcast: 175.0, aqi: 225 }
    },
    hazardous: {
      ...mockAqiData,
      aqi: 325,
      category: "Hazardous",
      color: "#7E0023",
      pm25: { ...mockAqiData.pm25, nowcast: 275.0, aqi: 325 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            🌍 AIrChat
          </h1>
          <p className="text-gray-600 text-lg">
            Real-Time Air Quality Monitoring
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Powered by OpenAQ • EPA Standards • NowCast Algorithm
          </p>
        </div>

        {/* Test Level Selector */}
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
            {Object.keys(testData).map((level) => (
              <button
                key={level}
                onClick={() => setTestLevel(level)}
                className={`px-4 py-2 rounded-md font-medium transition-all ${
                  testLevel === level
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Testing EPA color bands - Day 2 Demo
          </p>
        </div>

        {/* AQI Card */}
        <AqiCard aqiData={testData[testLevel]} />

        {/* Attribution */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Data from OpenAQ API • AQI calculated using EPA standards
          </p>
          <p className="mt-1">
            NowCast formula per EPA Technical Assistance Document
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
