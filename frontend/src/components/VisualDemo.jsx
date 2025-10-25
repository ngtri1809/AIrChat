import React from 'react';
import SmartContentParser from './SmartContentParser';

/**
 * Demo component to showcase the new visual features
 * This can be used to test different types of content rendering
 */
function VisualDemo() {
  const demoContents = [
    {
      title: "Air Quality Data",
      content: `# Air Quality Report

**Current AQI: 85**

Location: San Jose, CA
Timestamp: 2024-01-15T10:30:00Z

## Pollutant Levels
- PM2.5: 25.3 μg/m³
- PM10: 45.2 μg/m³
- Ozone: 0.08 ppm
- NO2: 0.02 ppm

## Health Recommendations
- Air quality is acceptable for most people
- Sensitive individuals may experience minor symptoms
- Consider reducing outdoor activities if you have respiratory issues`
    },
    {
      title: "Code Example",
      content: `# Python Air Quality Analysis

Here's how to analyze air quality data:

\`\`\`python
import pandas as pd
import numpy as np

def calculate_aqi(pm25, pm10):
    """Calculate Air Quality Index"""
    # PM2.5 AQI calculation
    if pm25 <= 12.0:
        aqi_pm25 = ((50-0)/(12.0-0)) * (pm25-0) + 0
    elif pm25 <= 35.4:
        aqi_pm25 = ((100-51)/(35.4-12.1)) * (pm25-12.1) + 51
    else:
        aqi_pm25 = 100
    
    return max(aqi_pm25, 0)

# Example usage
pm25_level = 25.3
aqi = calculate_aqi(pm25_level, 45.2)
print(f"AQI: {aqi}")
\`\`\`

**Key Points:**
- Use EPA standards for AQI calculation
- Consider multiple pollutants
- Update measurements regularly`
    },
    {
      title: "Structured Data",
      content: `{
  "location": "San Francisco Bay Area",
  "aqi": 75,
  "category": "Moderate",
  "pollutants": {
    "PM2.5": 22.1,
    "PM10": 38.5,
    "Ozone": 0.065,
    "NO2": 0.018
  },
  "weather": {
    "temperature": 18.5,
    "humidity": 65,
    "windSpeed": 12.3
  },
  "recommendations": [
    "Air quality is acceptable",
    "Sensitive groups should limit outdoor activities",
    "Use air purifiers indoors"
  ]
}`
    },
    {
      title: "List Format",
      content: `# Air Quality Improvement Tips

## Indoor Air Quality
- Use HEPA air purifiers
- Keep windows closed during high pollution days
- Avoid smoking indoors
- Use natural cleaning products

## Outdoor Activities
- Check AQI before exercising outdoors
- Avoid outdoor activities during peak pollution hours
- Use N95 masks when necessary
- Plan activities for early morning or evening

## Health Monitoring
- Monitor symptoms if you have respiratory conditions
- Keep medications readily available
- Stay hydrated
- Consider indoor exercise alternatives`
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        🎨 Enhanced Visual Chat Experience
      </h1>
      
      <div className="space-y-8">
        {demoContents.map((demo, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                {index + 1}
              </span>
              {demo.title}
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <SmartContentParser content={demo.content} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          ✨ New Features
        </h3>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>🎯 <strong>Smart Content Detection:</strong> Automatically detects and renders different content types</li>
          <li>📊 <strong>Air Quality Cards:</strong> Beautiful visual cards for air quality data with health recommendations</li>
          <li>💻 <strong>Code Highlighting:</strong> Syntax-highlighted code blocks with copy functionality</li>
          <li>📋 <strong>Structured Data:</strong> Tables, lists, and key-value pairs with enhanced styling</li>
          <li>🎨 <strong>Rich Text:</strong> Headers, bold, italic, quotes, and more formatting options</li>
          <li>⚡ <strong>Smooth Animations:</strong> Entrance animations and hover effects for better UX</li>
          <li>📱 <strong>Responsive Design:</strong> Optimized for all screen sizes</li>
        </ul>
      </div>
    </div>
  );
}

export default VisualDemo;
