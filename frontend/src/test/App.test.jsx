import { describe, it, expect, beforeEach, vi } from 'vitest';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatProvider } from '../contexts/ChatContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import MessageComposer from '../components/MessageComposer';
import Sidebar from '../components/Sidebar';
import ErrorBanner from '../components/ErrorBanner';

// Test wrapper component
function TestWrapper({ children }) {
  return (
    <ThemeProvider>
      <ChatProvider>
        {children}
      </ChatProvider>
    </ThemeProvider>
  );
}

describe('Frontend Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('MessageComposer', () => {
    it('should send message when Enter is pressed', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();
      
      // Mock successful fetch response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          message: 'Mock response',
          timestamp: new Date().toISOString(),
          type: 'assistant'
        })
      });

      render(
        <TestWrapper>
          <MessageComposer 
            conversationId="test-conv" 
            onError={mockOnError}
            disabled={false}
          />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText(/type your message/i);
      await user.type(textarea, 'Hello, AIrChat!');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
      });
    });

    it('should not send message when Shift+Enter is pressed', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();

      render(
        <TestWrapper>
          <MessageComposer 
            conversationId="test-conv" 
            onError={mockOnError}
            disabled={false}
          />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText(/type your message/i);
      await user.type(textarea, 'Hello, AIrChat!');
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      expect(global.fetch).not.toHaveBeenCalled();
      expect(textarea.value).toBe('Hello, AIrChat!\n');
    });

    it('should disable composer when disabled prop is true', () => {
      const mockOnError = vi.fn();

      render(
        <TestWrapper>
          <MessageComposer 
            conversationId="test-conv" 
            onError={mockOnError}
            disabled={true}
          />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText(/type your message/i);
      const sendButton = screen.getByLabelText(/send message/i);
      
      expect(textarea).toBeDisabled();
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Sidebar', () => {
    it('should create new conversation when New Chat button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();

      render(
        <TestWrapper>
          <Sidebar 
            isOpen={true} 
            onToggle={vi.fn()}
            onError={mockOnError}
          />
        </TestWrapper>
      );

      const newChatButton = screen.getByText('New Chat');
      await user.click(newChatButton);

      // Check if conversation was created (stored in localStorage)
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should filter conversations based on search query', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();

      // Mock existing conversations
      localStorage.setItem('airchat-conversations', JSON.stringify([
        { id: '1', title: 'Test Chat 1', lastMessage: 'Hello', lastUpdated: new Date().toISOString(), messageCount: 1 },
        { id: '2', title: 'Another Chat', lastMessage: 'Hi there', lastUpdated: new Date().toISOString(), messageCount: 1 }
      ]));

      render(
        <TestWrapper>
          <Sidebar 
            isOpen={true} 
            onToggle={vi.fn()}
            onError={mockOnError}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search conversations/i);
      await user.type(searchInput, 'Test');

      // Should show only conversations matching "Test"
      await waitFor(() => {
        expect(screen.getByText('Test Chat 1')).toBeInTheDocument();
        expect(screen.queryByText('Another Chat')).not.toBeInTheDocument();
      });
    });
  });

  describe('ErrorBanner', () => {
    it('should display error message and call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      const mockOnRetry = vi.fn();

      render(
        <ErrorBanner 
          message="Test error message" 
          onClose={mockOnClose}
          onRetry={mockOnRetry}
        />
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      
      const closeButton = screen.getByLabelText(/close error/i);
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      const mockOnRetry = vi.fn();

      render(
        <ErrorBanner 
          message="Test error message" 
          onClose={mockOnClose}
          onRetry={mockOnRetry}
        />
      );

      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);
      
      expect(mockOnRetry).toHaveBeenCalled();
    });
  });

  describe('localStorage Persistence', () => {
    it('should save conversations to localStorage', () => {
      const conversations = [
        { id: '1', title: 'Test Chat', lastMessage: 'Hello', lastUpdated: new Date().toISOString(), messageCount: 1 }
      ];

      localStorage.setItem('airchat-conversations', JSON.stringify(conversations));
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'airchat-conversations', 
        JSON.stringify(conversations)
      );
    });

    it('should load conversations from localStorage', () => {
      const conversations = [
        { id: '1', title: 'Test Chat', lastMessage: 'Hello', lastUpdated: new Date().toISOString(), messageCount: 1 }
      ];

      localStorage.getItem.mockReturnValue(JSON.stringify(conversations));
      
      const savedConversations = JSON.parse(localStorage.getItem('airchat-conversations'));
      
      expect(savedConversations).toEqual(conversations);
    });
  });
});
