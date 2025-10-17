# AIrChat Backend Service

FastAPI service for air quality data processing:
- OpenAQ API v3 integration
- NowCast PM2.5 calculations (EPA formula)
- AQI calculations (EPA standards)
- WHO guideline checks
- Personalized recommendations

## Installation

### Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

### Install dependencies
```bash
pip install -r requirements.txt
```

### Environment variables
Create a `.env` file with:

```env
# LLM providers (optional)
GOOGLE_API_KEY=...
OPENAI_API_KEY=...

# Weather provider
OPENWEATHER_API_KEY=...
```

## Run

```bash
# Development mode with auto-reload
uvicorn main:app --reload --port 8000

# Or directly
python main.py
```

## Test

```bash
curl "http://localhost:8000/v1/aq/latest?lat=37.3382&lon=-121.8863&radius=20000"
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
