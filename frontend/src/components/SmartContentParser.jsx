import React from 'react';
import RichTextRenderer from './RichTextRenderer';
import AirQualityCard from './AirQualityCard';
import DataVisualization from './DataVisualization';

/**
 * Smart Content Parser
 * Automatically detects content type and renders appropriate components
 */
function SmartContentParser({ content, isStreaming = false }) {
  if (!content) return null;

  /**
   * Detect if content contains air quality data
   */
  const isAirQualityData = (text) => {
    const aqiKeywords = ['aqi', 'air quality', 'pm2.5', 'pm10', 'ozone', 'no2', 'so2', 'co'];
    const lowerText = text.toLowerCase();
    return aqiKeywords.some(keyword => lowerText.includes(keyword)) && 
           (lowerText.includes('μg/m³') || lowerText.includes('ug/m3') || lowerText.includes('index'));
  };

  /**
   * Detect if content contains structured data (JSON-like)
   */
  const isStructuredData = (text) => {
    try {
      const parsed = JSON.parse(text);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  };

  /**
   * Detect if content contains table-like data
   */
  const isTableData = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return false;
    
    // Check if lines have consistent separators (tabs, pipes, commas)
    const separators = ['\t', '|', ','];
    return separators.some(sep => 
      lines.every(line => line.includes(sep)) && 
      lines[0].split(sep).length > 1
    );
  };

  /**
   * Detect if content contains code blocks
   */
  const hasCodeBlocks = (text) => {
    return text.includes('```') || text.includes('`');
  };

  /**
   * Detect if content contains lists
   */
  const hasLists = (text) => {
    const lines = text.split('\n');
    return lines.some(line => 
      /^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)
    );
  };

  /**
   * Parse table data into structured format
   */
  const parseTableData = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return null;

    // Detect separator
    const separators = ['\t', '|', ','];
    let separator = null;
    let maxColumns = 0;

    separators.forEach(sep => {
      const columns = lines[0].split(sep).length;
      if (columns > maxColumns && lines.every(line => line.includes(sep))) {
        separator = sep;
        maxColumns = columns;
      }
    });

    if (!separator) return null;

    const headers = lines[0].split(separator).map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(separator).map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return rows;
  };

  /**
   * Extract air quality data from text
   */
  const extractAirQualityData = (text) => {
    try {
      // Try to parse as JSON first
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.aqi || parsed.pollutants) {
          return parsed;
        }
      }

      // Extract from text patterns
      const aqiMatch = text.match(/aqi[:\s]*(\d+)/i);
      const pm25Match = text.match(/pm2\.?5[:\s]*(\d+(?:\.\d+)?)/i);
      const pm10Match = text.match(/pm10[:\s]*(\d+(?:\.\d+)?)/i);
      const locationMatch = text.match(/location[:\s]*([^\n,]+)/i);

      if (aqiMatch || pm25Match || pm10Match) {
        return {
          aqi: aqiMatch ? parseInt(aqiMatch[1]) : null,
          pollutants: {
            ...(pm25Match && { 'PM2.5': parseFloat(pm25Match[1]) }),
            ...(pm10Match && { 'PM10': parseFloat(pm10Match[1]) })
          },
          location: locationMatch ? locationMatch[1].trim() : null,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error extracting air quality data:', error);
    }
    return null;
  };

  /**
   * Main content detection and rendering logic
   */
  const renderContent = () => {
    // Check for air quality data first
    if (isAirQualityData(content)) {
      const airQualityData = extractAirQualityData(content);
      if (airQualityData) {
        return (
          <div className="space-y-4">
            <AirQualityCard data={airQualityData} />
            {hasCodeBlocks(content) || hasLists(content) ? (
              <RichTextRenderer content={content} isStreaming={isStreaming} />
            ) : null}
          </div>
        );
      }
    }

    // Check for structured data
    if (isStructuredData(content)) {
      try {
        const parsedData = JSON.parse(content);
        return (
          <div className="space-y-4">
            <DataVisualization data={parsedData} />
            <RichTextRenderer content={content} isStreaming={isStreaming} />
          </div>
        );
      } catch (error) {
        // Fall through to rich text renderer
      }
    }

    // Check for table data
    if (isTableData(content)) {
      const tableData = parseTableData(content);
      if (tableData) {
        return (
          <div className="space-y-4">
            <DataVisualization data={tableData} type="table" />
            <RichTextRenderer content={content} isStreaming={isStreaming} />
          </div>
        );
      }
    }

    // Default to rich text renderer
    return <RichTextRenderer content={content} isStreaming={isStreaming} />;
  };

  return (
    <div className="smart-content">
      {renderContent()}
    </div>
  );
}

export default SmartContentParser;
