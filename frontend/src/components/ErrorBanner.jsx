import React from 'react';

/**
 * Error banner component
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {Array} props.suggestions - Optional suggestions to show
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onRetry - Retry callback
 * @returns {JSX.Element} Error banner component
 */
function ErrorBanner({ message, suggestions = [], onClose, onRetry }) {
  // Check if this is an AI service error
  const isAIServiceError = message.includes('AI service') || message.includes('service unavailable');
  
  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-in">
      <div className={`border rounded-lg shadow-lg p-4 ${
        isAIServiceError 
          ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700' 
          : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className={`w-5 h-5 ${isAIServiceError ? 'text-yellow-400' : 'text-red-400'}`} 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              isAIServiceError 
                ? 'text-yellow-800 dark:text-yellow-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {isAIServiceError ? 'Service Unavailable' : 'Error'}
            </h3>
            <p className={`mt-1 text-sm ${
              isAIServiceError 
                ? 'text-yellow-700 dark:text-yellow-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {message}
            </p>
            
            {/* Show suggestions if available */}
            {suggestions && suggestions.length > 0 && (
              <div className="mt-3">
                <p className={`text-xs font-medium mb-2 ${
                  isAIServiceError 
                    ? 'text-yellow-800 dark:text-yellow-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  💡 Suggestions:
                </p>
                <ul className={`text-xs space-y-1 list-disc list-inside ${
                  isAIServiceError 
                    ? 'text-yellow-700 dark:text-yellow-300' 
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex items-center space-x-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm font-medium text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 transition-colors"
              >
                Retry
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              aria-label="Close error"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBanner;
