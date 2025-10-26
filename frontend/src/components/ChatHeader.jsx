import React from 'react';
import { useChat } from '../contexts/ChatContext';
import RAGStatus from './RAGStatus';

/**
 * Chat header component
 * @param {Object} props - Component props
 * @param {boolean} props.sidebarOpen - Whether sidebar is open
 * @param {Function} props.onToggleSidebar - Toggle sidebar callback
 * @param {string} props.conversationId - Current conversation ID
 * @param {number} props.messageCount - Number of messages in current conversation
 * @param {boolean} props.isStreaming - Whether currently streaming
 * @param {Function} props.onStopStreaming - Stop streaming callback
 * @returns {JSX.Element} Chat header component
 */
function ChatHeader({ 
  sidebarOpen, 
  onToggleSidebar, 
  conversationId, 
  messageCount, 
  isStreaming, 
  onStopStreaming 
}) {
  const { conversations } = useChat();
  
  const currentConversation = conversations.find(conv => conv.id === conversationId);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Conversation title */}
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentConversation ? currentConversation.title : 'AIrChat'}
          </h1>
          
          {/* Status indicators */}
          <div className="flex items-center space-x-2">
            {isStreaming && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Typing
                </span>
              </div>
            )}
            
            {messageCount > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {messageCount} messages
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3">
        {/* RAG Status */}
        <RAGStatus />

        {/* Model info */}
        <div className="hidden sm:flex items-center space-x-1 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>AIrChat Model</span>
        </div>

        {/* Settings button */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Settings"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
