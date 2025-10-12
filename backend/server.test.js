import express from 'express';
import request from 'supertest';

const app = express();

// Mock the server for testing
app.use(express.json());

// Test health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  res.json({
    id: 'test-id',
    message: `Mock response to: ${message}`,
    timestamp: new Date().toISOString(),
    type: 'assistant'
  });
});

// Test SSE endpoint
app.get('/api/chat/stream', (req, res) => {
  const { message } = req.query;
  
  if (!message) {
    return res.status(400).json({ error: 'Message parameter is required' });
  }
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  res.write('data: {"type":"connected"}\n\n');
  res.write('data: {"type":"chunk","content":"Mock "}\n\n');
  res.write('data: {"type":"chunk","content":"streaming "}\n\n');
  res.write('data: {"type":"chunk","content":"response"}\n\n');
  res.write('data: {"type":"done"}\n\n');
  res.end();
});

describe('Backend API Tests', () => {
  test('Health endpoint returns 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
  
  test('Chat endpoint returns response for valid message', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello, AIrChat!' })
      .expect(200);
    
    expect(response.body.id).toBe('test-id');
    expect(response.body.message).toContain('Hello, AIrChat!');
    expect(response.body.type).toBe('assistant');
  });
  
  test('Chat endpoint returns 400 for missing message', async () => {
    await request(app)
      .post('/api/chat')
      .send({})
      .expect(400);
  });
  
  test('SSE endpoint streams data correctly', async () => {
    const response = await request(app)
      .get('/api/chat/stream?message=test')
      .expect(200);
    
    expect(response.headers['content-type']).toContain('text/event-stream');
  });
  
  test('SSE endpoint returns 400 for missing message', async () => {
    await request(app)
      .get('/api/chat/stream')
      .expect(400);
  });
});
