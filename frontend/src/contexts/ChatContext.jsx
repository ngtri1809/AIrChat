import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Action types
const ACTIONS = {
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  LOAD_CONVERSATIONS: 'LOAD_CONVERSATIONS',
  LOAD_MESSAGES: 'LOAD_MESSAGES',
  UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
  DELETE_CONVERSATION: 'DELETE_CONVERSATION',
  SELECT_CONVERSATION: 'SELECT_CONVERSATION',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_STREAMING: 'SET_STREAMING',
  ABORT_STREAM: 'ABORT_STREAM'
};

// Initial state
const initialState = {
  conversations: [],
  selectedConversationId: null,
  messages: {}, // conversationId -> messages array
  loading: false,
  error: null,
  streaming: false,
  abortController: null
};

/**
 * Chat reducer for managing chat state
 * @param {Object} state - Current state
 * @param {Object} action - Action object
 * @returns {Object} New state
 */
function chatReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOAD_CONVERSATIONS:
      const conversationsMap = {};
      action.payload.forEach(conv => {
        conversationsMap[conv.id] = [];
      });
      return {
        ...state,
        conversations: action.payload,
        messages: conversationsMap,
        // Select the most recent conversation if none is selected
        selectedConversationId: state.selectedConversationId || (action.payload.length > 0 ? action.payload[0].id : null)
      };

    case ACTIONS.LOAD_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          ...action.payload
        }
      };

    case ACTIONS.ADD_CONVERSATION:
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        selectedConversationId: action.payload.id,
        messages: {
          ...state.messages,
          [action.payload.id]: []
        }
      };

    case ACTIONS.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? { ...conv, ...action.payload.updates } : conv
        )
      };

    case ACTIONS.DELETE_CONVERSATION:
      const { [action.payload]: deleted, ...remainingMessages } = state.messages;
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        selectedConversationId: state.selectedConversationId === action.payload ? null : state.selectedConversationId,
        messages: remainingMessages
      };

    case ACTIONS.SELECT_CONVERSATION:
      return {
        ...state,
        selectedConversationId: action.payload
      };

    case ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: [
            ...(state.messages[action.payload.conversationId] || []),
            action.payload.message
          ]
        }
      };

    case ACTIONS.UPDATE_MESSAGE:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: state.messages[action.payload.conversationId]?.map(msg =>
            msg.id === action.payload.messageId ? { ...msg, ...action.payload.updates } : msg
          ) || []
        }
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        streaming: false
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ACTIONS.SET_STREAMING:
      return {
        ...state,
        streaming: action.payload.streaming,
        abortController: action.payload.controller
      };

    case ACTIONS.ABORT_STREAM:
      return {
        ...state,
        streaming: false,
        abortController: null
      };

    default:
      return state;
  }
}

// Create context
const ChatContext = createContext();

/**
 * Chat provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Chat context provider
 */
export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Load conversations from localStorage on mount (ONLY ONCE!)
  useEffect(() => {
    if (isInitialized) return; // Prevent duplicate loading
    
    const savedConversations = localStorage.getItem('airchat-conversations');
    const savedMessages = localStorage.getItem('airchat-messages');
    
    if (savedConversations) {
      try {
        const conversations = JSON.parse(savedConversations);
        // Load all conversations at once to prevent duplication
        dispatch({
          type: ACTIONS.LOAD_CONVERSATIONS,
          payload: conversations
        });
      } catch (error) {
        console.error('Failed to load conversations from localStorage:', error);
      }
    }
    
    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        // Load all messages
        dispatch({
          type: ACTIONS.LOAD_MESSAGES,
          payload: messages
        });
      } catch (error) {
        console.error('Failed to load messages from localStorage:', error);
      }
    }
    
    setIsInitialized(true);
  }, [isInitialized]);

  // Save conversations to localStorage whenever conversations change
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initial load
    
    if (state.conversations.length > 0) {
      localStorage.setItem('airchat-conversations', JSON.stringify(state.conversations));
    } else {
      // Clear localStorage if no conversations
      localStorage.removeItem('airchat-conversations');
    }
  }, [state.conversations, isInitialized]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initial load
    
    // Only save if there are messages
    const hasMessages = Object.values(state.messages).some(messages => messages.length > 0);
    
    if (hasMessages) {
      localStorage.setItem('airchat-messages', JSON.stringify(state.messages));
    } else {
      // Clear localStorage if no messages
      localStorage.removeItem('airchat-messages');
    }
  }, [state.messages, isInitialized]);

  /**
   * Create a new conversation
   * @param {string} title - Conversation title
   * @returns {string} Conversation ID
   */
  const createConversation = useCallback((title = 'New Chat') => {
    const id = Date.now().toString();
    const conversation = {
      id,
      title,
      lastMessage: '',
      lastUpdated: new Date().toISOString(),
      messageCount: 0
    };
    
    dispatch({
      type: ACTIONS.ADD_CONVERSATION,
      payload: conversation
    });
    
    return id;
  }, []);

  /**
   * Update conversation metadata
   * @param {string} conversationId - ID of conversation to update
   * @param {Object} updates - Updates to apply
   */
  const updateConversation = useCallback((conversationId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_CONVERSATION,
      payload: { id: conversationId, updates }
    });
  }, []);

  /**
   * Delete a conversation
   * @param {string} conversationId - ID of conversation to delete
   */
  const deleteConversation = useCallback((conversationId) => {
    dispatch({
      type: ACTIONS.DELETE_CONVERSATION,
      payload: conversationId
    });
  }, []);

  /**
   * Select a conversation
   * @param {string} conversationId - ID of conversation to select
   */
  const selectConversation = useCallback((conversationId) => {
    dispatch({
      type: ACTIONS.SELECT_CONVERSATION,
      payload: conversationId
    });
  }, []);

  /**
   * Add a message to a conversation
   * @param {string} conversationId - ID of conversation
   * @param {Object} message - Message object
   */
  const addMessage = useCallback((conversationId, message) => {
    dispatch({
      type: ACTIONS.ADD_MESSAGE,
      payload: { conversationId, message }
    });

    // Update conversation metadata
    const conversation = state.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      const updates = {
        lastMessage: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        lastUpdated: new Date().toISOString(),
        messageCount: (conversation.messageCount || 0) + 1
      };
      
      // Update title if it's the first message
      if (conversation.messageCount === 0 && message.type === 'user') {
        updates.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
      }
      
      updateConversation(conversationId, updates);
    }
  }, [state.conversations, updateConversation]);

  /**
   * Update a message
   * @param {string} conversationId - ID of conversation
   * @param {string} messageId - ID of message to update
   * @param {Object} updates - Updates to apply
   */
  const updateMessage = useCallback((conversationId, messageId, updates) => {
    dispatch({
      type: ACTIONS.UPDATE_MESSAGE,
      payload: { conversationId, messageId, updates }
    });
  }, []);

  /**
   * Set loading state
   * @param {boolean} loading - Loading state
   */
  const setLoading = useCallback((loading) => {
    dispatch({
      type: ACTIONS.SET_LOADING,
      payload: loading
    });
  }, []);

  /**
   * Set error state
   * @param {string} error - Error message
   */
  const setError = useCallback((error) => {
    dispatch({
      type: ACTIONS.SET_ERROR,
      payload: error
    });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({
      type: ACTIONS.CLEAR_ERROR
    });
  }, []);

  /**
   * Set streaming state
   * @param {boolean} streaming - Streaming state
   * @param {AbortController} controller - Abort controller for the stream
   */
  const setStreaming = useCallback((streaming, controller = null) => {
    dispatch({
      type: ACTIONS.SET_STREAMING,
      payload: { streaming, controller }
    });
  }, []);

  /**
   * Abort current stream
   */
  const abortStream = useCallback(() => {
    if (state.abortController) {
      state.abortController.abort();
    }
    dispatch({
      type: ACTIONS.ABORT_STREAM
    });
  }, [state.abortController]);

  const value = {
    // State
    conversations: state.conversations,
    selectedConversationId: state.selectedConversationId,
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    streaming: state.streaming,
    
    // Actions
    createConversation,
    updateConversation,
    deleteConversation,
    selectConversation,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    clearError,
    setStreaming,
    abortStream
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

/**
 * Hook to use chat context
 * @returns {Object} Chat context value
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
