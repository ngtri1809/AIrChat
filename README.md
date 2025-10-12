# AIrChat 🌍💨

Real-time air quality monitoring web application using EPA standards and OpenAQ data.

**Demo Date:** October 18, 2025

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **API Gateway:** Node.js + Express (Geocoding proxy)
- **Backend Service:** Python + FastAPI (Air quality processing)
- **Data Sources:** 
  - OpenAQ API v3 (Air quality data)
  - Nominatim/OpenStreetMap (Geocoding)

## Key Features

### Minimum Marketable Features (MMF)
1. ✅ Real-time AQI display with EPA color coding
2. ✅ Location search with geocoding
3. ✅ NowCast PM2.5 calculations (EPA formula)
4. ✅ Multiple pollutant support (PM2.5, PM10, O3, NO2)
5. ✅ Station selection within radius

### Optional Features
6. ⏳ Adjustable search radius (5-25km)
7. ⏳ WHO guideline compliance badges
8. ⏳ 12-hour trend chart with NowCast
9. ⏳ Personalized recommendations (sensitive groups)
10. ⏳ Web Share API integration

## Project Structure

```
AIrChat/
├── web/          # React frontend (Vite + Tailwind)
├── api/          # Express API Gateway (Geocoding proxy)
├── svc/          # FastAPI backend (Air quality processing)
└── README.md
```

## Quick Start

### 1. Frontend (React)
```bash
cd web
npm install
npm run dev
# Runs on http://localhost:5173
```

### 2. API Gateway (Express)
```bash
cd api
npm install
npm run dev
# Runs on http://localhost:3000
```

### 3. Backend Service (FastAPI)
```bash
cd svc
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

## Day 1 (Oct 11) - Status ✅

### Completed Tasks
- [x] Initialize React + Vite + Tailwind frontend
- [x] Create Express API Gateway with geocoding proxy
- [x] Implement Nominatim throttling (1 req/s)
- [x] Create FastAPI backend service
- [x] Integrate OpenAQ API v3
- [x] GET /api/geocode endpoint
- [x] GET /v1/aq/latest endpoint (stub data)

### Test Day 1 Acceptance Criteria

**Test Geocoding:**
```bash
curl "http://localhost:3000/api/geocode?q=San%20Jose" | jq
```

**Expected Output:**
```json
{
  "lat": 37.3382,
  "lon": -121.8863,
  "display_name": "San Jose, California, United States"
}
```

**Test Air Quality Data:**
```bash
curl "http://localhost:8000/v1/aq/latest?lat=37.3382&lon=-121.8863&radius=20000" | jq
```

**Expected Output:**
```json
{
  "lat": 37.3382,
  "lon": -121.8863,
  "radius_km": 20.0,
  "stations_found": 5,
  "stations": [...],
  "timestamp": "2025-10-11T...",
  "note": "Day 1: Stub data - AQI calculations coming in Day 2"
}
```

## Standards & References

### AQI Calculation
- **EPA Appendix G:** 40 CFR Part 58
- **NowCast Formula:** EPA Technical Assistance Document
- **Reference:** https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-58/appendix-Appendix%20G%20to%20Part%2058

### WHO Guidelines
- PM2.5 24-hour: ≤ 15 µg/m³
- PM2.5 Annual: ≤ 5 µg/m³
- **Reference:** https://www.who.int/publications/i/item/9789240034228

### API Usage Policies
- **OpenAQ:** 100 requests/day (free tier)
- **Nominatim:** 1 request/second max, User-Agent required
- **Compliance:** Both APIs have strict usage policies - violations result in IP bans

## Development Timeline

- **Day 1 (Oct 11):** ✅ Skeleton & Data Pipeline
- **Day 2 (Oct 12):** NowCast & AQI Calculation
- **Day 3 (Oct 13):** Complete MMF
- **Day 4 (Oct 14):** Optional Features #1 & #2
- **Day 5 (Oct 15):** Optional Feature #3 (Trend Chart)
- **Day 6 (Oct 16):** Optional Features #4 & #5
- **Day 7 (Oct 17):** Polish & Resilience
- **Day 8 (Oct 18):** Demo Day 🎉

## License

MIT

## Disclaimer

This application is for educational purposes. Air quality data is provided by OpenAQ and should not be used for emergency decision-making. Always consult official sources for health and safety decisions.
# AIrChat

A production-ready, responsive chat interface with Server-Sent Events (SSE) streaming support, built with React 18 and Node.js/Express.

![AIrChat Interface](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=AIrChat+Interface)

## Features

### 🚀 Core Features
- **Real-time Streaming**: Server-Sent Events for live AI responses
- **Responsive Design**: Mobile-first design with collapsible sidebar
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Conversation Management**: Create, rename, delete, and search conversations
- **Message Persistence**: Conversations saved to localStorage
- **Keyboard Shortcuts**: Ctrl+K to toggle sidebar, Escape to stop streaming

### 🎨 UI/UX Features
- **ChatGPT-style Interface**: Clean, modern design with message bubbles
- **Typing Indicators**: Live streaming indicators during AI responses
- **Copy Messages**: One-click copy for assistant messages
- **Error Handling**: Comprehensive error states with retry functionality
- **Accessibility**: Full keyboard navigation, ARIA labels, focus management

### 🔧 Technical Features
- **SSE Streaming**: Real-time token streaming with abort controls
- **Input Sanitization**: XSS protection and input validation
- **Rate Limiting**: API protection with configurable limits
- **CORS Support**: Cross-origin resource sharing enabled
- **Security Headers**: Helmet.js for security best practices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Fast unit testing framework
- **Testing Library** - React component testing

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WiBD-Hackathon
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Alternative: Manual Setup

If you prefer to set up each part separately:

```bash
# Install root dependencies
npm install

# Backend setup
cd backend
npm install
npm run dev

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

## Project Structure

```
WiBD-Hackathon/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ChatPane.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageComposer.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   └── ErrorBanner.jsx
│   │   ├── contexts/        # React context providers
│   │   │   ├── ChatContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── test/            # Test files
│   │   │   ├── setup.js
│   │   │   └── App.test.jsx
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # App entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vitest.config.js
├── backend/                 # Node.js backend application
│   ├── server.js           # Main server file
│   ├── server.test.js      # Backend tests
│   ├── package.json
│   └── jest.config.js
├── package.json            # Root package.json
└── README.md
```

## API Endpoints

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check endpoint |
| `POST` | `/api/chat` | Send message (non-streaming) |
| `GET` | `/api/chat/stream` | Send message (SSE streaming) |

### Example Usage

**Non-streaming chat:**
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello, AIrChat!',
    conversationId: 'optional-conversation-id'
  })
});
const data = await response.json();
```

**SSE streaming chat:**
```javascript
const response = await fetch('/api/chat/stream?message=Hello&conversationId=123');
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log(data);
    }
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Optional: Add your LLM API configuration
# OPENAI_API_KEY=your_api_key_here
# OPENAI_API_URL=https://api.openai.com/v1/chat/completions
```

### Frontend Configuration

The frontend is configured via Vite and Tailwind CSS. Key configuration files:

- `vite.config.js` - Vite configuration with proxy setup
- `tailwind.config.js` - Tailwind CSS customization
- `src/index.css` - Global styles and CSS variables

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run tests in watch mode
cd frontend && npm run test:watch
```

### Test Coverage

The project includes comprehensive tests covering:

1. **SSE Controller (Backend)**: Streams chunked data, sets correct headers, handles client abort
2. **Message Reducer (Frontend)**: Append chunks, finalize message on done
3. **localStorage Persistence**: Conversation list save/load
4. **Composer Behavior**: Enter vs Shift+Enter, disables during send, "Stop generating"
5. **Error Banner**: Shows on network failure, retry restores flow

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

### Backend Production

```bash
cd backend
npm start
```

## Integration with Real LLM APIs

### OpenAI Integration

To integrate with OpenAI's API, modify the backend streaming endpoint:

```javascript
// In server.js, replace the mock streaming logic with:
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stream = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: sanitizedMessage }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || "";
  if (content) {
    res.write(`data: ${JSON.stringify({
      type: 'chunk',
      content: content,
      timestamp: new Date().toISOString()
    })}\n\n`);
  }
}
```

### Anthropic Integration

For Claude API integration:

```javascript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const stream = await anthropic.messages.create({
  model: "claude-3-sonnet-20240229",
  max_tokens: 1024,
  messages: [{ role: "user", content: sanitizedMessage }],
  stream: true,
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    res.write(`data: ${JSON.stringify({
      type: 'chunk',
      content: chunk.delta.text,
      timestamp: new Date().toISOString()
    })}\n\n`);
  }
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Enter**: Send message (in composer)
- **Shift+Enter**: New line (in composer)
- **Escape**: Stop streaming or close modals
- **Ctrl+K**: Toggle sidebar

### Screen Reader Support
- Semantic HTML elements (`<main>`, `<nav>`, `<button>`)
- ARIA labels and descriptions
- Focus management and visible focus indicators
- Reduced motion support

### Visual Accessibility
- High contrast color schemes
- Scalable text and UI elements
- Focus indicators on all interactive elements
- Respects `prefers-reduced-motion` setting

## Security Considerations

### Input Sanitization
- XSS protection through input sanitization
- Request size limits (10MB max)
- Rate limiting (100 requests per 15 minutes per IP)

### CORS Configuration
- Configured for development and production domains
- Credentials support for authenticated requests
- Proper headers for SSE connections

### Environment Security
- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Helmet.js for security headers

## Performance Optimizations

### Frontend
- React 18 with automatic batching
- Vite for fast development and optimized builds
- Tailwind CSS purging for minimal bundle size
- Lazy loading and code splitting ready

### Backend
- Express with compression middleware
- Efficient SSE streaming with proper cleanup
- Memory-efficient message handling
- Connection pooling ready

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation above
- Review the test files for usage examples

---

**Built with ❤️ for the WiBD Hackathon**