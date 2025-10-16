import React from 'react';
import ChatPage from './pages/ChatPage';
import { ThemeProvider } from './contexts/ThemeContext';

/**
 * Main App component - AI Chat with integrated Air Quality
 * @returns {JSX.Element} The main application component
 */
function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center px-6 py-3">
            <span className="text-2xl mr-3">💬</span>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">AIrChat</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant with Real-time Air Quality Data</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <ChatPage />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
