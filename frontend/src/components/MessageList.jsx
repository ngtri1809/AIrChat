import React, { useState } from 'react';
import MessageBubble from './MessageBubble';

/**
 * Message list component
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of messages
 * @param {boolean} props.isLoading - Whether currently loading
 * @param {boolean} props.isStreaming - Whether currently streaming
 * @returns {JSX.Element} Message list component
 */
function MessageList({ messages, isLoading, isStreaming }) {
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  /**
   * Handle message copy
   * @param {string} messageId - ID of message to copy
   * @param {string} content - Content to copy
   */
  const handleCopy = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Send a message below to begin chatting with AIrChat. Your conversation will be saved automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          onCopy={handleCopy}
          isCopied={copiedMessageId === message.id}
          showTimestamp={index === messages.length - 1 || 
            (messages[index + 1] && 
             new Date(message.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 5 * 60 * 1000)}
        />
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="spinner"></div>
            <span>Thinking...</span>
          </div>
        </div>
      )}
      
      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center space-x-2 py-2">
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              AI is thinking...
            </span>
          </div>
        </div>
      )}
      
      {/* Loading indicator with tool usage hint */}
      {isLoading && messages.length > 0 && messages[messages.length - 1].type === 'user' && (
        <div className="flex items-start space-x-3 py-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Checking air quality data...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;
