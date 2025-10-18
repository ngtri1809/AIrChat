"""
Test script for AIrChat tools and agent functionality
Tests individual tools and agent tool chaining
"""
import os
import asyncio
from dotenv import load_dotenv
from tools.location_tool import LocationTool
from tools.weather_tool import WeatherTool
from tools.health_tool import HealthAdviceTool
from ai_agent import AirQualityTool, chat_with_agent

# Load environment variables
load_dotenv()

def test_individual_tools():
    """Test each tool individually"""
    print("=" * 60)
    print("TESTING INDIVIDUAL TOOLS")
    print("=" * 60)
    
    # Test LocationTool
    print("\n1. Testing LocationTool:")
    print("-" * 30)
    loc = LocationTool()
    coords = loc.run("San Jose, CA")
    print(f"Location: San Jose, CA → {coords}")
    
    # Test WeatherTool
    print("\n2. Testing WeatherTool:")
    print("-" * 30)
    weather_key = os.getenv("OPENWEATHER_API_KEY")
    if not weather_key:
        print("❌ OPENWEATHER_API_KEY not set - skipping weather test")
        weather_result = "Weather tool requires API key"
    else:
        w = WeatherTool()
        weather_result = w.run(coords)
        print(f"Weather for {coords}: {weather_result}")
    
    # Test HealthAdviceTool
    print("\n3. Testing HealthAdviceTool:")
    print("-" * 30)
    h = HealthAdviceTool()
    advice = h.run(f"85: {weather_result}")
    print(f"Health advice for AQI 85: {advice}")
    
    # Test AirQualityTool
    print("\n4. Testing AirQualityTool:")
    print("-" * 30)
    aq = AirQualityTool()
    aq_result = aq.run("San Jose, CA")
    print(f"Air Quality for San Jose: {aq_result[:200]}...")

async def test_agent_chaining():
    """Test agent tool chaining via chat endpoint"""
    print("\n" + "=" * 60)
    print("TESTING AGENT TOOL CHAINING")
    print("=" * 60)
    
    test_queries = [
        "What's the air quality in San Jose?",
        "Is it safe to run outside in San Jose?",
        "What's the weather and air quality in New York City?",
        "Given AQI 110 and sunny weather, should I exercise outside?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{i}. Testing query: '{query}'")
        print("-" * 50)
        try:
            response = await chat_with_agent(query, f"test-session-{i}")
            print(f"Response: {response[:300]}...")
        except Exception as e:
            print(f"❌ Error: {e}")

def test_api_endpoints():
    """Test API endpoints directly"""
    print("\n" + "=" * 60)
    print("TESTING API ENDPOINTS")
    print("=" * 60)
    
    import httpx
    
    async def test_aq_endpoint():
        print("\n1. Testing /v1/aq/latest endpoint:")
        print("-" * 40)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "http://localhost:8000/v1/aq/latest",
                    params={
                        "lat": 37.3382,
                        "lon": -121.8863,
                        "radius": 20000
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ AQI: {data.get('aqi', {}).get('value', 'N/A')}")
                    print(f"✅ Station: {data.get('station', {}).get('name', 'N/A')}")
                else:
                    print(f"❌ Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    async def test_chat_endpoint():
        print("\n2. Testing /v1/chat endpoint:")
        print("-" * 40)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "http://localhost:8000/v1/chat",
                    json={
                        "message": "What's the air quality in San Jose?",
                        "conversationId": "api-test"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Response: {data.get('message', 'No message')[:200]}...")
                else:
                    print(f"❌ Error {response.status_code}: {response.text}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
    
    return asyncio.run(test_aq_endpoint()), asyncio.run(test_chat_endpoint())

def check_environment():
    """Check environment configuration"""
    print("=" * 60)
    print("ENVIRONMENT CHECK")
    print("=" * 60)
    
    env_vars = {
        "OPENWEATHER_API_KEY": os.getenv("OPENWEATHER_API_KEY"),
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY"),
        "LLM_PROVIDER": os.getenv("LLM_PROVIDER", "google")
    }
    
    for var, value in env_vars.items():
        if value:
            print(f"✅ {var}: {'*' * 10} (set)")
        else:
            print(f"❌ {var}: NOT SET")
    
    print(f"\nCurrent LLM Provider: {env_vars['LLM_PROVIDER']}")

async def main():
    """Main test function"""
    print("AIrChat Tools Test Suite")
    print("=" * 60)
    
    # Check environment
    check_environment()
    
    # Test individual tools
    test_individual_tools()
    
    # Test agent chaining
    await test_agent_chaining()
    
    # Test API endpoints (requires server running)
    print("\n" + "=" * 60)
    print("API ENDPOINT TESTS (requires server running)")
    print("=" * 60)
    print("Note: Start server with 'uvicorn main:app --reload --port 8000' first")
    
    try:
        test_api_endpoints()
    except Exception as e:
        print(f"❌ API tests failed (server not running?): {e}")
    
    print("\n" + "=" * 60)
    print("TEST SUITE COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())