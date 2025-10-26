import React, { useEffect, useState } from 'react';

/**
 * RAG Status indicator component
 * Shows whether RAG knowledge base is available and loaded
 * @returns {JSX.Element} RAG status indicator
 */
function RAGStatus() {
  const [ragStatus, setRagStatus] = useState('loading');
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    // Check RAG status on mount
    const checkRAGStatus = async () => {
      try {
        const response = await fetch('http://localhost:3005/api/rag/status');
        if (response.ok) {
          const data = await response.json();
          // Normalize status to lowercase for matching with statusConfig
          const normalizedStatus = (data.status || 'ready').toLowerCase();
          setRagStatus(normalizedStatus);
          setDocumentCount(data.documents_loaded || 0);
        } else {
          setRagStatus('unavailable');
        }
      } catch (error) {
        setRagStatus('unavailable');
      }
    };

    checkRAGStatus();
  }, []);

  const statusConfig = {
    ready: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: '✓',
      label: 'RAG Ready'
    },
    loading: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: '⏳',
      label: 'RAG Loading'
    },
    unavailable: {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      icon: '○',
      label: 'RAG Offline'
    }
  };

  const config = statusConfig[ragStatus];

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
        ${config.bg} border ${config.border} ${config.text}
        transition-colors
      `}
      title={
        documentCount > 0
          ? `RAG loaded with ${documentCount} documents from EPA & WHO guidelines`
          : 'RAG knowledge base status'
      }
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {documentCount > 0 && (
        <>
          <span>•</span>
          <span>{documentCount} docs</span>
        </>
      )}
    </div>
  );
}

export default RAGStatus;
