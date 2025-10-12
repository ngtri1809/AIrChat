import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';

/**
 * Message composer component
 * @param {Object} props - Component props
 * @param {string} props.conversationId - Current conversation ID
 * @param {Function} props.onError - Error callback
 * @param {Function} props.onFocus - Focus callback
 * @param {Function} props.onBlur - Blur callback
 * @param {boolean} props.disabled - Whether composer is disabled
 * @returns {JSX.Element} Message composer component
 */
function MessageComposer({ conversationId, onError, onFocus, onBlur, disabled }) {
  const { 
    createConversation, 
    addMessage, 
    setLoading, 
    setStreaming, 
    abortStream,
    streaming 
  } = useChat();
  
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Focus textarea when conversation changes
  useEffect(() => {
    if (conversationId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [conversationId]);

  /**
   * Handle input change
   * @param {Event} event - Input event
   */
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  /**
   * Handle key down events
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  /**
   * Handle composition events for better mobile support
   * @param {Event} event - Composition event
   */
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  /**
   * Send message via regular API
   * @param {string} messageText - Message to send
   * @param {string} convId - Conversation ID
   */
  const sendRegularMessage = async (messageText, convId) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationId: convId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response
      addMessage(convId, {
        id: data.id,
        content: data.message,
        type: 'assistant',
        timestamp: data.timestamp
      });
    } catch (error) {
      console.error('Error sending message:', error);
      onError('Failed to send message. Please try again.');
    }
  };

  /**
   * Send message via SSE streaming
   * @param {string} messageText - Message to send
   * @param {string} convId - Conversation ID
   */
  const sendStreamingMessage = async (messageText, convId) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      setStreaming(true, controller);
      
      const response = await fetch(`/api/chat/stream?message=${encodeURIComponent(messageText)}&conversationId=${convId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessageId = Date.now().toString();
      let assistantContent = '';

      // Add initial assistant message
      addMessage(convId, {
        id: assistantMessageId,
        content: '',
        type: 'assistant',
        timestamp: new Date().toISOString(),
        isStreaming: true
      });

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                assistantContent += data.content;
                // Update the message with new content
                addMessage(convId, {
                  id: assistantMessageId,
                  content: assistantContent,
                  type: 'assistant',
                  timestamp: new Date().toISOString(),
                  isStreaming: true
                });
              } else if (data.type === 'done') {
                // Finalize the message
                addMessage(convId, {
                  id: assistantMessageId,
                  content: assistantContent,
                  type: 'assistant',
                  timestamp: new Date().toISOString(),
                  isStreaming: false
                });
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error in streaming:', error);
        onError('Failed to get response. Please try again.');
      }
    } finally {
      setStreaming(false, null);
      abortControllerRef.current = null;
    }
  };

  /**
   * Handle send message
   */
  const handleSend = async () => {
    if (!message.trim() || disabled || isComposing) return;

    const messageText = message.trim();
    setMessage('');
    setLoading(true);

    try {
      let convId = conversationId;
      
      // Create new conversation if none selected
      if (!convId) {
        convId = createConversation();
      }

      // Add user message
      addMessage(convId, {
        id: Date.now().toString(),
        content: messageText,
        type: 'user',
        timestamp: new Date().toISOString()
      });

      // Send to backend (use streaming by default)
      await sendStreamingMessage(messageText, convId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      onError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle stop streaming
   */
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortStream();
  };

  return (
    <div className="p-4">
      <div className="relative">
        {/* Input area */}
        <div className="flex items-end space-x-2">
          {/* Attachment button placeholder */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            disabled={disabled}
            aria-label="Attach file"
            title="File attachment (coming soon)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              disabled={disabled}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            
            {/* Character count */}
            {message.length > 0 && (
              <div className="absolute bottom-1 right-12 text-xs text-gray-400">
                {message.length}/10000
              </div>
            )}
          </div>

          {/* Send/Stop button */}
          <button
            onClick={streaming ? handleStopStreaming : handleSend}
            disabled={!message.trim() || disabled}
            className={`
              p-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${streaming
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed'
              }
            `}
            aria-label={streaming ? 'Stop generating' : 'Send message'}
          >
            {streaming ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h12v12H6z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>

          {/* Mic button placeholder */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            disabled={disabled}
            aria-label="Voice input"
            title="Voice input (coming soon)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>

        {/* Help text */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {streaming && (
            <span className="ml-2 text-red-500">• Press Escape or click Stop to cancel</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageComposer;
