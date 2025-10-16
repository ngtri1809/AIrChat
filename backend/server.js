import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { sessionManager } from './session_manager.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for SSE
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Throttling mechanism for Nominatim: max 1 request per second
let lastNominatimRequest = 0;
const NOMINATIM_THROTTLE_MS = 1000;

// Cache for geocoding results
const geocodeCache = new Map();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    sessions: sessionManager.getStats()
  });
});

// Session stats endpoint
app.get('/api/sessions/stats', (req, res) => {
  res.json(sessionManager.getStats());
});

/**
 * Geocoding endpoint - proxy to Nominatim with throttling and caching
 * GET /api/geocode?q={location}
 */
app.get('/api/geocode', async (req, res) => {
  const { q: query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    console.log(`📍 Cache hit for: ${query}`);
    return res.json(geocodeCache.get(cacheKey));
  }

  // Throttle requests to Nominatim (1 req/sec max)
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequest;
  if (timeSinceLastRequest < NOMINATIM_THROTTLE_MS) {
    const waitTime = NOMINATIM_THROTTLE_MS - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  try {
    lastNominatimRequest = Date.now();

    // Make request to Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'AIrChat/1.0 (hackathon-project)',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
      }
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Location not found. Try a different search.' });
    }

    // Extract first result
    const location = data[0];
    const result = {
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      display_name: location.display_name
    };

    // Cache the result
    geocodeCache.set(cacheKey, result);

    console.log(`📍 Geocoded: ${query} -> ${result.display_name}`);
    res.json(result);

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Unable to geocode location. Please try again.' });
  }
});

/**
 * AI Chat endpoint - Proxy to Python AI service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId, llm_provider } = req.body;
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }
    
    if (message.length > 10000) {
      return res.status(400).json({ error: 'Message too long (max 10,000 characters)' });
    }
    
    // Sanitize input (basic XSS prevention)
    const sanitizedMessage = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Get or create session
    const session = sessionManager.getOrCreateSession(conversationId);
    const activeSessionId = session.id;
    
    // Proxy to Python AI service
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${pythonServiceUrl}/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: sanitizedMessage,
          conversationId: activeSessionId,
          llm_provider: llm_provider || null
        }),
        timeout: 60000 // 60 second timeout for AI responses
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Python AI service error:', errorData);
        
        if (response.status === 503) {
          return res.status(503).json({ 
            error: 'AI service is currently unavailable. Please try again later.',
            code: 'AI_SERVICE_UNAVAILABLE'
          });
        }
        
        throw new Error(`AI service returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`🤖 AI response for conversation ${activeSessionId}`);
      
      // Update session
      sessionManager.updateSession(activeSessionId, {
        lastMessage: sanitizedMessage,
        lastResponse: data.message
      });
      
      res.json(data);
      
    } catch (fetchError) {
      console.error('Failed to connect to Python AI service:', fetchError);
      
      // Check if service is running
      if (fetchError.code === 'ECONNREFUSED' || fetchError.code === 'ETIMEDOUT') {
        return res.status(503).json({ 
          error: 'AI service is not running. Please start the Python service on port 8000.',
          code: 'AI_SERVICE_DOWN',
          hint: 'Run: cd svc && python main.py'
        });
      }
      
      throw fetchError;
    }
    
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ 
      error: 'Internal server error while processing chat request',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * AI Chat streaming endpoint - Proxy to Python AI service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/api/chat/stream', async (req, res) => {
  const { message, conversationId, llm_provider } = req.query;
  
  // Input validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message parameter is required' });
  }
  
  if (message.length > 10000) {
    return res.status(400).json({ error: 'Message too long (max 10,000 characters)' });
  }
  
  // Sanitize input
  const sanitizedMessage = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Get or create session
  const session = sessionManager.getOrCreateSession(conversationId);
  const activeSessionId = session.id;
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || 'http://localhost:5173',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  // Send initial connection event
  res.write('data: {"type":"connected","timestamp":"' + new Date().toISOString() + '"}\n\n');
  
  try {
    // Proxy to Python AI service
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';
    const url = new URL(`${pythonServiceUrl}/v1/chat/stream`);
    url.searchParams.set('message', sanitizedMessage);
    url.searchParams.set('conversationId', activeSessionId);
    if (llm_provider) {
      url.searchParams.set('llm_provider', llm_provider);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 60000
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Python AI service error:', errorData);
      
      const errorEvent = {
        type: 'error',
        error: 'AI service error',
        code: response.status === 503 ? 'AI_SERVICE_UNAVAILABLE' : 'AI_SERVICE_ERROR',
        timestamp: new Date().toISOString()
      };
      
      res.write('data: ' + JSON.stringify(errorEvent) + '\n\n');
      res.end();
      return;
    }
    
    // Get response data (Python service returns single chunk for now)
    const data = await response.json();
    console.log(`🤖 AI stream response for conversation ${activeSessionId}`);
    
    // Update session
    sessionManager.updateSession(activeSessionId, {
      lastMessage: sanitizedMessage,
      lastResponse: data.content
    });
    
    // Forward the response as SSE
    res.write('data: ' + JSON.stringify(data) + '\n\n');
    
    // Send completion event
    const completionEvent = {
      type: 'done',
      timestamp: new Date().toISOString(),
      conversationId: activeSessionId
    };
    res.write('data: ' + JSON.stringify(completionEvent) + '\n\n');
    res.end();
    
  } catch (error) {
    console.error('Failed to connect to Python AI service:', error);
    
    const errorEvent = {
      type: 'error',
      error: 'AI service is not available',
      code: error.code === 'ECONNREFUSED' ? 'AI_SERVICE_DOWN' : 'CONNECTION_ERROR',
      hint: error.code === 'ECONNREFUSED' ? 'Run: cd svc && python main.py' : undefined,
      timestamp: new Date().toISOString()
    };
    
    res.write('data: ' + JSON.stringify(errorEvent) + '\n\n');
    res.end();
  }
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected from SSE stream');
    res.end();
  });
  
  req.on('error', (error) => {
    console.error('SSE stream error:', error);
    res.end();
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AIrChat Unified Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Chat: http://localhost:${PORT}/api/chat`);
  console.log(`   Chat Stream: http://localhost:${PORT}/api/chat/stream`);
  console.log(`   Geocoding: http://localhost:${PORT}/api/geocode?q=San%20Jose`);
});

export default app;
