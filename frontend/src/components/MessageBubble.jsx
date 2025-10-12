import React, { useState } from 'react';

/**
 * Message bubble component
 * @param {Object} props - Component props
 * @param {Object} props.message - Message object
 * @param {Function} props.onCopy - Copy callback
 * @param {boolean} props.isCopied - Whether message is copied
 * @param {boolean} props.showTimestamp - Whether to show timestamp
 * @returns {JSX.Element} Message bubble component
 */
function MessageBubble({ message, onCopy, isCopied, showTimestamp }) {
  const [showActions, setShowActions] = useState(false);

  /**
   * Format timestamp for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Handle copy action
   * @param {Event} event - Click event
   */
  const handleCopy = (event) => {
    event.stopPropagation();
    onCopy(message.id, message.content);
  };

  return (
    <div
      className={`group relative ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl`}>
        {/* Message bubble */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm
            ${message.type === 'user'
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-700'
            }
          `}
        >
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Actions */}
          {message.type === 'assistant' && (
            <div className={`
              absolute -top-8 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity
              ${showActions ? 'opacity-100' : ''}
            `}>
              <button
                onClick={handleCopy}
                className="p-1.5 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 transition-colors"
                aria-label={isCopied ? 'Copied!' : 'Copy message'}
                title={isCopied ? 'Copied!' : 'Copy message'}
              >
                {isCopied ? (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {showTimestamp && (
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
