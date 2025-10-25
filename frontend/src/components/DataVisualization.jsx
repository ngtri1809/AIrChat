import React from 'react';

/**
 * Data Visualization Component
 * Displays structured data in various visual formats
 */
function DataVisualization({ data, type = 'auto' }) {
  if (!data) return null;

  /**
   * Auto-detect the best visualization type
   */
  const detectType = (data) => {
    if (Array.isArray(data)) {
      if (data.length === 0) return 'empty';
      if (data.every(item => typeof item === 'string')) return 'list';
      if (data.every(item => typeof item === 'object' && item !== null)) return 'table';
      return 'list';
    }
    
    if (typeof data === 'object' && data !== null) {
      if (data.chart || data.graph) return 'chart';
      if (data.map || data.location) return 'map';
      return 'keyvalue';
    }
    
    return 'text';
  };

  const visualizationType = type === 'auto' ? detectType(data) : type;

  /**
   * Render key-value pairs
   */
  const renderKeyValue = (obj) => (
    <div className="data-visualization card-hover bg-gray-50 dark:bg-gray-800 rounded-lg p-4 my-3">
      <div className="grid gap-3">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  /**
   * Render table data
   */
  const renderTable = (tableData) => {
    if (!Array.isArray(tableData) || tableData.length === 0) return null;
    
    const headers = Object.keys(tableData[0]);
    
    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {headers.map(header => (
                <th 
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tableData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {headers.map(header => (
                  <td 
                    key={header}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-white"
                  >
                    {typeof row[header] === 'object' ? 
                      JSON.stringify(row[header]) : 
                      String(row[header])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * Render list data
   */
  const renderList = (listData) => (
    <div className="my-3">
      <ul className="space-y-2">
        {listData.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
              {index + 1}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {typeof item === 'object' ? JSON.stringify(item) : String(item)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  /**
   * Render chart placeholder
   */
  const renderChart = (chartData) => (
    <div className="my-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📊 Chart Visualization
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Interactive chart would be displayed here
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
            {JSON.stringify(chartData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );

  /**
   * Render map placeholder
   */
  const renderMap = (mapData) => (
    <div className="my-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          🗺️ Map Visualization
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Interactive map would be displayed here
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
            {JSON.stringify(mapData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => (
    <div className="my-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-gray-500 dark:text-gray-400">No data available</p>
    </div>
  );

  // Render based on type
  switch (visualizationType) {
    case 'keyvalue':
      return renderKeyValue(data);
    case 'table':
      return renderTable(data);
    case 'list':
      return renderList(data);
    case 'chart':
      return renderChart(data);
    case 'map':
      return renderMap(data);
    case 'empty':
      return renderEmpty();
    case 'text':
    default:
      return (
        <div className="my-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}
          </pre>
        </div>
      );
  }
}

export default DataVisualization;
