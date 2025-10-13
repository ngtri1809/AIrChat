import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState component - Display when no air quality stations found
 * Provides helpful suggestions for users
 */
function EmptyState({ location }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          No Air Quality Stations Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {location ? (
            <>
              We couldn't find any air quality monitoring stations near{' '}
              <strong className="text-gray-800 dark:text-white">{location}</strong>.
            </>
          ) : (
            'No air quality data is available for this location.'
          )}
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <span>💡</span>
            Suggestions:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Try searching for a nearby major city or urban area</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Check if the location name is spelled correctly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Include the state or country name for better results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Some rural areas may not have monitoring stations yet</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Air quality monitoring stations are typically located in urban areas and may not cover all regions. 
            Data coverage is continuously expanding through the OpenAQ network.
          </p>
        </div>
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  location: PropTypes.string,
};

export default EmptyState;
