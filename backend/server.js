import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
 * Mock chat endpoint for non-streaming responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post('/api/chat', (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }
    
    if (message.length > 10000) {
      return res.status(400).json({ error: 'Message too long (max 10,000 characters)' });
    }
    
    // Sanitize input (basic XSS prevention)
    const sanitizedMessage = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Mock response
    const mockResponse = `I received your message: "${sanitizedMessage}". This is a mock response from AIrChat. In a real implementation, this would be processed by an AI model.`;
    
    res.json({
      id: Date.now().toString(),
      message: mockResponse,
      conversationId: conversationId || null,
      timestamp: new Date().toISOString(),
      type: 'assistant'
    });
    
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * SSE streaming endpoint for real-time chat responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get('/api/chat/stream', (req, res) => {
  const { message, conversationId } = req.query;
  
  // Input validation
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message parameter is required' });
  }
  
  if (message.length > 10000) {
    return res.status(400).json({ error: 'Message too long (max 10,000 characters)' });
  }
  
  // Sanitize input
  const sanitizedMessage = message.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
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
  
  // Mock streaming response
  const mockResponse = `I received your message: "${sanitizedMessage}". This is a streaming response from AIrChat. Each word appears as it's generated, simulating real AI model behavior. In production, this would connect to an actual language model API.`;
  const words = mockResponse.split(' ');
  let wordIndex = 0;
  
  const streamInterval = setInterval(() => {
    if (wordIndex < words.length) {
      const chunk = {
        type: 'chunk',
        content: words[wordIndex] + (wordIndex < words.length - 1 ? ' ' : ''),
        timestamp: new Date().toISOString(),
        conversationId: conversationId || null
      };
      
      res.write('data: ' + JSON.stringify(chunk) + '\n\n');
      wordIndex++;
    } else {
      // Send completion event
      const completionEvent = {
        type: 'done',
        timestamp: new Date().toISOString(),
        conversationId: conversationId || null
      };
      
      res.write('data: ' + JSON.stringify(completionEvent) + '\n\n');
      res.end();
      clearInterval(streamInterval);
    }
  }, 100); // Send a word every 100ms
  
  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected from SSE stream');
    clearInterval(streamInterval);
    res.end();
  });
  
  req.on('error', (error) => {
    console.error('SSE stream error:', error);
    clearInterval(streamInterval);
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
