#!/usr/bin/env python3
"""
Test script to verify OpenAI and Google Gemini API connections
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai_connection():
    """Test OpenAI API connection"""
    try:
        import openai
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": "Hello! Please respond with 'OpenAI connection successful'"}],
            max_tokens=50
        )
        
        print("✅ OpenAI Connection Successful!")
        print(f"Response: {response.choices[0].message.content}")
        return True
        
    except Exception as e:
        print(f"❌ OpenAI Connection Failed: {e}")
        return False

def test_google_connection():
    """Test Google Gemini API connection"""
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        model = genai.GenerativeModel(os.getenv("GOOGLE_MODEL", "gemini-1.5-flash"))
        
        response = model.generate_content("Hello! Please respond with 'Google Gemini connection successful'")
        
        print("✅ Google Gemini Connection Successful!")
        print(f"Response: {response.text}")
        return True
        
    except Exception as e:
        print(f"❌ Google Gemini Connection Failed: {e}")
        return False

def test_langchain_openai():
    """Test LangChain OpenAI integration"""
    try:
        from langchain_openai import ChatOpenAI
        
        llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            api_key=os.getenv("OPENAI_API_KEY"),
            temperature=0.7
        )
        
        response = llm.invoke("Hello! Please respond with 'LangChain OpenAI integration successful'")
        
        print("✅ LangChain OpenAI Integration Successful!")
        print(f"Response: {response.content}")
        return True
        
    except Exception as e:
        print(f"❌ LangChain OpenAI Integration Failed: {e}")
        return False

def test_langchain_google():
    """Test LangChain Google Gemini integration"""
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        llm = ChatGoogleGenerativeAI(
            model=os.getenv("GOOGLE_MODEL", "gemini-1.5-flash"),
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.7
        )
        
        response = llm.invoke("Hello! Please respond with 'LangChain Google Gemini integration successful'")
        
        print("✅ LangChain Google Gemini Integration Successful!")
        print(f"Response: {response.content}")
        return True
        
    except Exception as e:
        print(f"❌ LangChain Google Gemini Integration Failed: {e}")
        return False

def main():
    print("🧪 Testing LLM API Connections...")
    print("=" * 60)
    
    # Check if API keys are set
    openai_key = os.getenv("OPENAI_API_KEY")
    google_key = os.getenv("GOOGLE_API_KEY")
    
    if not openai_key or openai_key == "your_openai_key_here":
        print("⚠️  OPENAI_API_KEY not set or using placeholder")
        openai_key = None
    if not google_key or google_key == "your_google_key_here":
        print("⚠️  GOOGLE_API_KEY not set or using placeholder")
        google_key = None
    
    print()
    
    # Test direct API connections
    print("🔗 Testing Direct API Connections:")
    print("-" * 40)
    openai_success = test_openai_connection() if openai_key else False
    print()
    google_success = test_google_connection() if google_key else False
    
    print()
    print("🔗 Testing LangChain Integrations:")
    print("-" * 40)
    langchain_openai_success = test_langchain_openai() if openai_key else False
    print()
    langchain_google_success = test_langchain_google() if google_key else False
    
    print()
    print("=" * 60)
    print("📊 Test Results Summary:")
    print(f"OpenAI Direct API:     {'✅ PASS' if openai_success else '❌ FAIL'}")
    print(f"Google Direct API:     {'✅ PASS' if google_success else '❌ FAIL'}")
    print(f"LangChain OpenAI:      {'✅ PASS' if langchain_openai_success else '❌ FAIL'}")
    print(f"LangChain Google:      {'✅ PASS' if langchain_google_success else '❌ FAIL'}")
    
    print()
    if openai_success or google_success:
        print("🎉 At least one LLM connection is working!")
        print("💡 You can now proceed with AI agent implementation.")
    else:
        print("💥 No LLM connections are working.")
        print("🔧 Please check your API keys in the .env file.")
        print("📝 Make sure to replace 'your_openai_key_here' and 'your_google_key_here' with actual keys.")

if __name__ == "__main__":
    main()

