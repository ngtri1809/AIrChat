#!/usr/bin/env python3
"""
Comprehensive LLM Integration Test Script for AIrChat
Tests the complete pipeline from API keys to air quality integration
"""
import os
import asyncio
import httpx
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMIntegrationTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.backend_url = "http://localhost:3005"
        self.test_results = {}
    
    async def test_ai_service_status(self):
        """Test AI service status endpoint"""
        print("🔍 Testing AI Service Status...")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/v1/ai/status")
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ AI Service Status: {data}")
                    self.test_results['ai_status'] = True
                    return data
                else:
                    print(f"❌ AI Service Status failed: {response.status_code}")
                    self.test_results['ai_status'] = False
                    return None
        except Exception as e:
            print(f"❌ AI Service Status error: {e}")
            self.test_results['ai_status'] = False
            return None
    
    async def test_direct_ai_chat(self):
        """Test direct AI chat endpoint"""
        print("\n🤖 Testing Direct AI Chat...")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat",
                    json={
                        "message": "Hello! Can you tell me about air quality?",
                        "conversationId": "test-session",
                        "llm_provider": "google"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Direct AI Chat Response: {data['message'][:100]}...")
                    self.test_results['direct_ai_chat'] = True
                    return data
                else:
                    print(f"❌ Direct AI Chat failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    self.test_results['direct_ai_chat'] = False
                    return None
        except Exception as e:
            print(f"❌ Direct AI Chat error: {e}")
            self.test_results['direct_ai_chat'] = False
            return None
    
    async def test_air_quality_integration(self):
        """Test AI chat with air quality tool integration"""
        print("\n🌍 Testing Air Quality Integration...")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat",
                    json={
                        "message": "What is the air quality like in San Jose, California?",
                        "conversationId": "test-aq-session",
                        "llm_provider": "google"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Air Quality Integration Response: {data['message'][:200]}...")
                    self.test_results['air_quality_integration'] = True
                    return data
                else:
                    print(f"❌ Air Quality Integration failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    self.test_results['air_quality_integration'] = False
                    return None
        except Exception as e:
            print(f"❌ Air Quality Integration error: {e}")
            self.test_results['air_quality_integration'] = False
            return None
    
    async def test_backend_proxy(self):
        """Test backend proxy to AI service"""
        print("\n🔄 Testing Backend Proxy...")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.backend_url}/api/chat",
                    json={
                        "message": "Hello from backend proxy!",
                        "conversationId": "test-backend-session",
                        "llm_provider": "google"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Backend Proxy Response: {data['message'][:100]}...")
                    print(f"AI Mode: {data.get('ai_mode', False)}")
                    self.test_results['backend_proxy'] = True
                    return data
                else:
                    print(f"❌ Backend Proxy failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    self.test_results['backend_proxy'] = False
                    return None
        except Exception as e:
            print(f"❌ Backend Proxy error: {e}")
            self.test_results['backend_proxy'] = False
            return None
    
    async def test_streaming_chat(self):
        """Test streaming chat endpoint"""
        print("\n📡 Testing Streaming Chat...")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.base_url}/v1/chat/stream",
                    params={
                        "message": "Tell me about PM2.5 pollution",
                        "conversationId": "test-stream-session",
                        "llm_provider": "google"
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Streaming Chat Response: {data['content'][:100]}...")
                    self.test_results['streaming_chat'] = True
                    return data
                else:
                    print(f"❌ Streaming Chat failed: {response.status_code}")
                    print(f"Response: {response.text}")
                    self.test_results['streaming_chat'] = False
                    return None
        except Exception as e:
            print(f"❌ Streaming Chat error: {e}")
            self.test_results['streaming_chat'] = False
            return None
    
    async def test_air_quality_service(self):
        """Test the underlying air quality service"""
        print("\n🌡️ Testing Air Quality Service...")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/v1/aq/latest",
                    params={
                        "lat": 37.3382,
                        "lon": -121.8863,
                        "radius": 20000
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Air Quality Service Response: AQI {data.get('aqi', {}).get('value', 'N/A')}")
                    self.test_results['air_quality_service'] = True
                    return data
                else:
                    print(f"❌ Air Quality Service failed: {response.status_code}")
                    self.test_results['air_quality_service'] = False
                    return None
        except Exception as e:
            print(f"❌ Air Quality Service error: {e}")
            self.test_results['air_quality_service'] = False
            return None
    
    def check_environment(self):
        """Check if required environment variables are set"""
        print("🔧 Checking Environment Configuration...")
        
        openai_key = os.getenv("OPENAI_API_KEY")
        google_key = os.getenv("GOOGLE_API_KEY")
        
        print(f"OpenAI API Key: {'✅ Set' if openai_key and openai_key != 'your_openai_key_here' else '❌ Not set or placeholder'}")
        print(f"Google API Key: {'✅ Set' if google_key and google_key != 'your_google_key_here' else '❌ Not set or placeholder'}")
        
        if not openai_key or openai_key == 'your_openai_key_here':
            print("⚠️  OpenAI API key not configured - OpenAI features will not work")
        if not google_key or google_key == 'your_google_key_here':
            print("⚠️  Google API key not configured - Google Gemini features will not work")
        
        return {
            'openai_configured': bool(openai_key and openai_key != 'your_openai_key_here'),
            'google_configured': bool(google_key and google_key != 'your_google_key_here')
        }
    
    async def run_all_tests(self):
        """Run all integration tests"""
        print("🧪 AIrChat LLM Integration Test Suite")
        print("=" * 60)
        
        # Check environment
        env_status = self.check_environment()
        
        # Test services
        await self.test_ai_service_status()
        await self.test_air_quality_service()
        await self.test_direct_ai_chat()
        await self.test_air_quality_integration()
        await self.test_backend_proxy()
        await self.test_streaming_chat()
        
        # Print results
        print("\n" + "=" * 60)
        print("📊 Test Results Summary:")
        print("=" * 60)
        
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name.replace('_', ' ').title()}: {status}")
        
        print(f"\nEnvironment Status:")
        print(f"OpenAI Configured: {'✅ YES' if env_status['openai_configured'] else '❌ NO'}")
        print(f"Google Configured: {'✅ YES' if env_status['google_configured'] else '❌ NO'}")
        
        # Overall assessment
        passed_tests = sum(self.test_results.values())
        total_tests = len(self.test_results)
        
        print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 All tests passed! LLM integration is working correctly.")
        elif passed_tests > total_tests // 2:
            print("⚠️  Most tests passed, but some issues detected.")
        else:
            print("💥 Multiple test failures detected. Check configuration and services.")
        
        return self.test_results

async def main():
    """Main test function"""
    tester = LLMIntegrationTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
