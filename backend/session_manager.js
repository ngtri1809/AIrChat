/**
 * Session Manager for AIrChat
 * Manages conversation sessions with in-memory storage
 * Sessions expire after 24 hours of inactivity
 */

import { randomUUID } from 'crypto';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.SESSION_EXPIRE_MS = 24 * 60 * 60 * 1000; // 24 hours
    
    // Start cleanup interval (every hour)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
    
    console.log('✅ Session Manager initialized');
  }
  
  /**
   * Generate a new session ID
   * @returns {string} UUID session ID
   */
  generateSessionId() {
    return `session-${randomUUID()}`;
  }
  
  /**
   * Create a new session
   * @param {string} [sessionId] - Optional session ID, generates new if not provided
   * @returns {object} Session object
   */
  createSession(sessionId = null) {
    const id = sessionId || this.generateSessionId();
    
    const session = {
      id,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      metadata: {}
    };
    
    this.sessions.set(id, session);
    console.log(`📝 Created session: ${id}`);
    
    return session;
  }
  
  /**
   * Get an existing session or create a new one
   * @param {string} [sessionId] - Session ID to retrieve
   * @returns {object} Session object
   */
  getOrCreateSession(sessionId = null) {
    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      
      // Check if session is expired
      const lastActivity = new Date(session.lastActivity);
      const now = new Date();
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity > this.SESSION_EXPIRE_MS) {
        console.log(`⏰ Session expired: ${sessionId}`);
        this.sessions.delete(sessionId);
        return this.createSession();
      }
      
      // Update last activity
      session.lastActivity = now.toISOString();
      this.sessions.set(sessionId, session);
      
      return session;
    }
    
    // Create new session
    return this.createSession(sessionId);
  }
  
  /**
   * Update session with message count
   * @param {string} sessionId - Session ID
   * @param {object} metadata - Additional metadata to store
   */
  updateSession(sessionId, metadata = {}) {
    if (!this.sessions.has(sessionId)) {
      console.warn(`⚠️ Attempted to update non-existent session: ${sessionId}`);
      return;
    }
    
    const session = this.sessions.get(sessionId);
    session.lastActivity = new Date().toISOString();
    session.messageCount++;
    session.metadata = { ...session.metadata, ...metadata };
    
    this.sessions.set(sessionId, session);
  }
  
  /**
   * Get session info
   * @param {string} sessionId - Session ID
   * @returns {object|null} Session object or null if not found
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }
  
  /**
   * Delete a session
   * @param {string} sessionId - Session ID to delete
   * @returns {boolean} True if deleted, false if not found
   */
  deleteSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      console.log(`🗑️ Deleted session: ${sessionId}`);
      return true;
    }
    return false;
  }
  
  /**
   * Cleanup expired sessions
   * @returns {number} Number of sessions cleaned up
   */
  cleanup() {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivity = new Date(session.lastActivity);
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity > this.SESSION_EXPIRE_MS) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
    
    return cleanedCount;
  }
  
  /**
   * Get statistics about active sessions
   * @returns {object} Session statistics
   */
  getStats() {
    const now = new Date();
    let totalMessages = 0;
    let activeLastHour = 0;
    let activeLastDay = 0;
    
    for (const session of this.sessions.values()) {
      totalMessages += session.messageCount;
      
      const lastActivity = new Date(session.lastActivity);
      const timeSinceActivity = now - lastActivity;
      
      if (timeSinceActivity < 60 * 60 * 1000) {
        activeLastHour++;
      }
      if (timeSinceActivity < 24 * 60 * 60 * 1000) {
        activeLastDay++;
      }
    }
    
    return {
      totalSessions: this.sessions.size,
      activeLastHour,
      activeLastDay,
      totalMessages,
      timestamp: now.toISOString()
    };
  }
  
  /**
   * Shutdown session manager
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    console.log('🛑 Session Manager shutdown');
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Graceful shutdown
process.on('SIGTERM', () => {
  sessionManager.shutdown();
});

process.on('SIGINT', () => {
  sessionManager.shutdown();
});

export default sessionManager;
