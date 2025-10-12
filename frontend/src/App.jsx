import React, { useState } from 'react';
import ChatPage from './pages/ChatPage';
import AirQualityPage from './pages/AirQualityPage';
import { ThemeProvider } from './contexts/ThemeContext';

/**
 * Main App component with tabbed navigation
 * Combines AI Chat and Air Quality Monitoring features
 * @returns {JSX.Element} The main application component
 */
function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'airquality'

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation Tabs */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center px-4">
            {/* Logo/Title */}
            <div className="flex items-center space-x-2 py-3 mr-8">
              <span className="text-2xl">💬</span>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">AIrChat</h1>
            </div>
            
            {/* Tab Buttons */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 font-semibold transition-colors rounded-t-lg ${
                  activeTab === 'chat'
                    ? 'bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                💬 AI Chat
              </button>
              <button
                onClick={() => setActiveTab('airquality')}
                className={`px-6 py-3 font-semibold transition-colors rounded-t-lg ${
                  activeTab === 'airquality'
                    ? 'bg-gray-50 dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                🌍 Air Quality
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' ? <ChatPage /> : <AirQualityPage />}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
