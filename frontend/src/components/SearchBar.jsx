import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced SearchBar component with autocomplete suggestions
 * Features:
 * - Loading states with visual feedback
 * - Popular cities suggestions
 * - Enter key support
 * - Clear button
 */
function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular cities for quick access
  const popularCities = [
    'San Jose, California',
    'Los Angeles, California',
    'San Francisco, California',
    'New York, New York',
    'Seattle, Washington',
    'Portland, Oregon',
    'Denver, Colorado',
    'Austin, Texas',
  ];

  // Filter suggestions based on query
  const filteredSuggestions = popularCities.filter(city =>
    city.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    setQuery(city);
    onSearch(city);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSuggestions]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter city name (e.g., San Jose, California)"
            className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all"
            disabled={loading}
          />
          
          {/* Clear button */}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Autocomplete suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && !loading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredSuggestions.map((city, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSuggestionClick(city);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-800 dark:text-white">{city}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Searching...
            </span>
          ) : (
            '🔍 Search'
          )}
        </button>
      </div>
    </form>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

SearchBar.defaultProps = {
  loading: false,
};

export default SearchBar;
