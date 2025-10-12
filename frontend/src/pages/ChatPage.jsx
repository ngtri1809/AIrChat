import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import ChatPane from '../components/ChatPane';
import ErrorBanner from '../components/ErrorBanner';
import { ChatProvider } from '../contexts/ChatContext';

/**
 * Chat Page - AI Chat Interface with SSE streaming
 */
function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState(null);

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ChatProvider>
      <div className="flex h-full bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onError={handleError}
        />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatPane 
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onError={handleError}
          />
        </div>
        
        {/* Error Banner */}
        {error && (
          <ErrorBanner 
            message={error} 
            onClose={clearError}
            onRetry={clearError}
          />
        )}
      </div>
    </ChatProvider>
  );
}

export default ChatPage;
