import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * SearchHistory component - Display last 5 searches from localStorage
 * Features:
 * - Persistent storage across sessions
 * - Click to re-search
 * - Clear history option
 * - Timestamps
 */
function SearchHistory({ onSelectLocation }) {
  const [history, setHistory] = useState([]);
  const STORAGE_KEY = 'airchat_search_history';
  const MAX_HISTORY = 5;

  // Load history from localStorage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  // Add a search to history
  const addToHistory = (location) => {
    try {
      const newEntry = {
        location,
        timestamp: new Date().toISOString(),
      };

      // Remove duplicate if exists
      const filtered = history.filter(
        (entry) => entry.location.toLowerCase() !== location.toLowerCase()
      );

      // Add to beginning and limit to MAX_HISTORY
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
      
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Clear all history
  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // Format timestamp to relative time
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const handleLocationClick = (location) => {
    onSelectLocation(location);
  };

  // Expose addToHistory method to parent component
  useEffect(() => {
    window.addToSearchHistory = addToHistory;
    return () => {
      delete window.addToSearchHistory;
    };
  }, [history]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <span>🕐</span>
            Recent Searches
          </h3>
          <button
            onClick={clearHistory}
            className="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="space-y-2">
          {history.map((entry, index) => (
            <button
              key={index}
              onClick={() => handleLocationClick(entry.location)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                    📍
                  </span>
                  <span className="text-sm text-gray-800 dark:text-white truncate">
                    {entry.location}
                  </span>
                </div>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

SearchHistory.propTypes = {
  onSelectLocation: PropTypes.func.isRequired,
};

export default SearchHistory;
