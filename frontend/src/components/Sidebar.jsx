import React, { useState, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Sidebar component for conversation management
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open
 * @param {Function} props.onToggle - Toggle sidebar callback
 * @param {Function} props.onError - Error callback
 * @returns {JSX.Element} Sidebar component
 */
function Sidebar({ isOpen, onToggle, onError }) {
  const { 
    conversations, 
    selectedConversationId, 
    createConversation, 
    selectConversation, 
    deleteConversation,
    updateConversation 
  } = useChat();
  
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const searchInputRef = useRef(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handle new chat creation
   */
  const handleNewChat = () => {
    try {
      createConversation();
      setSearchQuery('');
      if (window.innerWidth < 768) {
        onToggle(); // Close sidebar on mobile
      }
    } catch (error) {
      onError('Failed to create new chat');
    }
  };

  /**
   * Handle conversation selection
   * @param {string} conversationId - ID of conversation to select
   */
  const handleSelectConversation = (conversationId) => {
    try {
      selectConversation(conversationId);
      if (window.innerWidth < 768) {
        onToggle(); // Close sidebar on mobile
      }
    } catch (error) {
      onError('Failed to select conversation');
    }
  };

  /**
   * Handle conversation deletion
   * @param {string} conversationId - ID of conversation to delete
   * @param {Event} event - Click event
   */
  const handleDeleteConversation = (conversationId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        deleteConversation(conversationId);
      } catch (error) {
        onError('Failed to delete conversation');
      }
    }
  };

  /**
   * Start editing conversation title
   * @param {string} conversationId - ID of conversation to edit
   * @param {string} currentTitle - Current title
   * @param {Event} event - Click event
   */
  const handleStartEdit = (conversationId, currentTitle, event) => {
    event.stopPropagation();
    setEditingId(conversationId);
    setEditingTitle(currentTitle);
  };

  /**
   * Save edited title
   * @param {string} conversationId - ID of conversation
   */
  const handleSaveEdit = (conversationId) => {
    if (editingTitle.trim()) {
      try {
        updateConversation(conversationId, { title: editingTitle.trim() });
      } catch (error) {
        onError('Failed to update conversation title');
      }
    }
    setEditingId(null);
    setEditingTitle('');
  };

  /**
   * Cancel editing
   */
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  /**
   * Handle keyboard events in edit mode
   * @param {KeyboardEvent} event - Keyboard event
   * @param {string} conversationId - ID of conversation
   */
  const handleEditKeyDown = (event, conversationId) => {
    if (event.key === 'Enter') {
      handleSaveEdit(conversationId);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  /**
   * Format timestamp for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 
        border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              AIrChat
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <button
                onClick={onToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                    group relative p-3 rounded-lg cursor-pointer transition-colors mb-2
                    ${selectedConversationId === conversation.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }
                  `}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectConversation(conversation.id);
                    }
                  }}
                >
                  {editingId === conversation.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(conversation.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, conversation.id)}
                      className="w-full bg-transparent border-none outline-none text-sm font-medium"
                      autoFocus
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium truncate flex-1 mr-2">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleStartEdit(conversation.id, conversation.title, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            aria-label="Rename conversation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDeleteConversation(conversation.id, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            aria-label="Delete conversation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {conversation.lastMessage}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimestamp(conversation.lastUpdated)}
                        </span>
                        {conversation.messageCount > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {conversation.messageCount} messages
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
