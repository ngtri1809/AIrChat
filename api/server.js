import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';// Health chec// Start server
app.listen(PORT, () => {
  console.log(`🌍 AIrChat API Gateway running on http://localhost:${PORT}`);
  console.log(`   Geocoding: http://localhost:${PORT}/api/geocode?q=San%20Jose`);
});point
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AIrChat API Gateway',
    timestamp: new Date().toISOString()
  });
});app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Throttling mechanism: max 1 request per second to Nominatim
let lastNominatimRequest = 0;
const NOMINATIM_THROTTLE_MS = 1000;

// Cache for geocoding results
const geocodeCache = new Map();

/**
 * GET /api/geocode?q={location}
 * Proxy endpoint for Nominatim geocoding with throttling
 */
app.get('/api/geocode', async (req, res) => {
  const { q: query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Check cache first
  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    console.log(`Cache hit for: ${query}`);
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
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'AIrChat/1.0 (contact@airchat.com)',
          'Accept-Language': 'en'
        }
      });    if (!response.ok) {
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

    console.log(`Geocoded: ${query} -> ${result.display_name}`);
    res.json(result);

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Unable to geocode location. Please try again.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AIrChat API Gateway',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌍 AIrChat API Gateway running on http://localhost:${PORT}`);
  console.log(`📍 Geocoding endpoint: http://localhost:${PORT}/api/geocode?q=San%20Jose`);
});
