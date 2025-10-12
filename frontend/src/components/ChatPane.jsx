import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import ChatHeader from './ChatHeader';

/**
 * Main chat pane component
 * @param {Object} props - Component props
 * @param {boolean} props.sidebarOpen - Whether sidebar is open
 * @param {Function} props.onToggleSidebar - Toggle sidebar callback
 * @param {Function} props.onError - Error callback
 * @returns {JSX.Element} Chat pane component
 */
function ChatPane({ sidebarOpen, onToggleSidebar, onError }) {
  const { 
    selectedConversationId, 
    messages, 
    loading, 
    streaming,
    abortStream 
  } = useChat();
  
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const messagesEndRef = useRef(null);
  const chatPaneRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversationId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + K to toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onToggleSidebar();
      }
      
      // Escape to stop streaming
      if (event.key === 'Escape' && streaming) {
        abortStream();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggleSidebar, streaming, abortStream]);

  const currentMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  return (
    <div 
      ref={chatPaneRef}
      className="flex flex-col h-full bg-white dark:bg-gray-900"
    >
      {/* Header */}
      <ChatHeader 
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
        conversationId={selectedConversationId}
        messageCount={currentMessages.length}
        isStreaming={streaming}
        onStopStreaming={abortStream}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {selectedConversationId ? (
          <MessageList 
            messages={currentMessages}
            isLoading={loading}
            isStreaming={streaming}
          />
        ) : (
          <EmptyState />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <MessageComposer
          conversationId={selectedConversationId}
          onError={onError}
          onFocus={() => setIsComposerFocused(true)}
          onBlur={() => setIsComposerFocused(false)}
          disabled={loading || streaming}
        />
      </div>

      {/* Mobile FAB for new chat */}
      {!selectedConversationId && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              // This will be handled by the sidebar's new chat button
              onToggleSidebar();
            }}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="New chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Empty state component when no conversation is selected
 * @returns {JSX.Element} Empty state component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to AIrChat
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Start a new conversation to begin chatting with AI. Your conversations will be saved and you can access them anytime.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Fast Responses</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get instant responses with our optimized AI model
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Private</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your conversations are encrypted and stored securely
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Smart Memory</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI remembers context from previous messages
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white">Mobile Ready</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optimized for all devices and screen sizes
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
        <p>Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+K</kbd> to toggle sidebar</p>
      </div>
    </div>
  );
}

export default ChatPane;
