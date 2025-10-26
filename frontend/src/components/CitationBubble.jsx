import React, { useState } from 'react';

/**
 * Citation bubble component for displaying RAG knowledge base sources
 * @param {Object} props - Component props
 * @param {Array} props.citations - Array of citation objects
 * @param {string} props.messageId - ID of the message these citations belong to
 * @returns {JSX.Element} Citation bubble component
 */
function CitationBubble({ citations, messageId }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-start mt-2">
      <div className="max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
        <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          {/* Citation header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>📚 Sources ({citations.length})</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>

          {/* Citation list */}
          {isExpanded && (
            <div className="mt-3 space-y-2 border-t border-blue-200 dark:border-blue-800 pt-3">
              {citations.map((citation, index) => (
                <div
                  key={`${messageId}-citation-${index}`}
                  className="flex items-start gap-2 text-xs text-blue-600 dark:text-blue-300"
                >
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full font-semibold text-blue-700 dark:text-blue-200">
                    {citation.id}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-blue-700 dark:text-blue-200">
                      {citation.source}
                    </div>
                    <div className="text-blue-600 dark:text-blue-300 text-xs">
                      Page {citation.page} • {citation.domain.toUpperCase()}
                    </div>
                    <div className="text-blue-500 dark:text-blue-400 text-xs mt-1">
                      ✓ Relevance: {Math.round(citation.similarity * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Collapsed preview */}
          {!isExpanded && citations.length > 0 && (
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">
              <div>
                {citations
                  .slice(0, 2)
                  .map((c) => c.source)
                  .join(', ')}
                {citations.length > 2 ? ` +${citations.length - 2} more` : ''}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CitationBubble;
