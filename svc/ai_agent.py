"""
AIrChat AI Agent with LangChain Integration
Provides intelligent chat responses with air quality tool integration
"""
import os
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import BaseTool
from tools import WeatherTool, HealthAdviceTool, LocationTool
from langchain_core.messages import HumanMessage, AIMessage
import httpx
import json

# Load environment variables
load_dotenv()

class AirQualityTool(BaseTool):
    """LangChain tool for fetching air quality data"""
    
    name: str = "get_air_quality"
    description: str = (
        "Get current air quality data for a location. "
        "Input should be a location string like 'San Jose, CA' or coordinates like '37.3382,-121.8863'. "
        "Returns AQI, PM2.5 levels, health recommendations, and station information."
    )
    
    def _run(self, location: str) -> str:
        """Execute the air quality tool"""
        try:
            # Parse location input
            if ',' in location and location.replace(',', '').replace('.', '').replace('-', '').replace(' ', '').isdigit():
                # Assume coordinates
                parts = location.split(',')
                if len(parts) == 2:
                    lat, lon = float(parts[0].strip()), float(parts[1].strip())
                else:
                    return f"Invalid coordinates format. Expected 'lat,lon' but got: {location}"
            else:
                # Assume city name - use geocoding
                geocode_result = self._geocode_location(location)
                if not geocode_result:
                    return f"Could not find coordinates for location: {location}"
                lat, lon = geocode_result['lat'], geocode_result['lon']
            
            # Fetch air quality data
            aq_data = self._fetch_air_quality(lat, lon)
            return self._format_air_quality_response(aq_data, location)
            
        except Exception as e:
            return f"Error fetching air quality data: {str(e)}"
    
    def _geocode_location(self, location: str) -> Optional[Dict[str, float]]:
        """Geocode a location string to lat/lon coordinates"""
        try:
            import asyncio
            
            # Check if we're already in an event loop
            try:
                loop = asyncio.get_running_loop()
                # We're in an event loop, need to use a different approach
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(self._sync_geocode_location, location)
                    return future.result(timeout=10)
            except RuntimeError:
                # No event loop running, safe to use asyncio.run
                return asyncio.run(self._async_geocode_location(location))
                
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None

    def _sync_geocode_location(self, location: str) -> Optional[Dict[str, float]]:
        """Synchronous geocoding using requests"""
        try:
            import requests
            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": location,
                    "format": "json",
                    "limit": 1
                },
                headers={
                    "User-Agent": "AIrChat/1.0 (hackathon-project)"
                },
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    return {
                        "lat": float(data[0]["lat"]),
                        "lon": float(data[0]["lon"])
                    }
            return None
        except Exception:
            return None

    async def _async_geocode_location(self, location: str) -> Optional[Dict[str, float]]:
        """Asynchronous geocoding using httpx"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": location,
                    "format": "json",
                    "limit": 1
                },
                headers={
                    "User-Agent": "AIrChat/1.0 (hackathon-project)"
                }
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    return {
                        "lat": float(data[0]["lat"]),
                        "lon": float(data[0]["lon"])
                    }
            return None
    
    def _fetch_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch air quality data from the local service"""
        try:
            import asyncio
            
            # Check if we're already in an event loop
            try:
                loop = asyncio.get_running_loop()
                # We're in an event loop, need to use a different approach
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(self._sync_fetch_air_quality, lat, lon)
                    return future.result(timeout=10)
            except RuntimeError:
                # No event loop running, safe to use asyncio.run
                return asyncio.run(self._async_fetch_air_quality(lat, lon))
                
        except Exception as e:
            return {"error": str(e)}

    def _sync_fetch_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """Synchronous air quality fetching using requests"""
        try:
            import requests
            response = requests.get(
                "http://localhost:8000/v1/aq/latest",
                params={
                    "lat": lat,
                    "lon": lon,
                    "radius": 20000
                },
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API returned status {response.status_code}"}
        except Exception as e:
            return {"error": str(e)}

    async def _async_fetch_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """Asynchronous air quality fetching using httpx"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "http://localhost:8000/v1/aq/latest",
                params={
                    "lat": lat,
                    "lon": lon,
                    "radius": 20000
                }
            )
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API returned status {response.status_code}"}
    
    def _format_air_quality_response(self, data: Dict[str, Any], location: str) -> str:
        """Format air quality data for LLM consumption"""
        # Handle new error response format
        if "error" in data:
            error_type = data.get("error")
            message = data.get("message", "Air quality data unavailable")
            suggestions = data.get("suggestions", [])
            
            error_response = f"{message}"
            if suggestions:
                error_response += "\n\n💡 Suggestions:\n"
                for suggestion in suggestions:
                    error_response += f"• {suggestion}\n"
            
            return error_response
        
        try:
            aqi = data.get("aqi", {})
            pollutants = data.get("pollutants", {})
            station = data.get("station", {})
            
            response = f"""🌍 Air Quality Report for {location}:

📊 AQI: {aqi.get('value', 'N/A')} ({aqi.get('category', 'Unknown')})
🎨 Color: {aqi.get('color', 'Unknown')}
🏭 Dominant Pollutant: {aqi.get('dominant_pollutant', 'Unknown')}

📈 PM2.5 Details:
• Concentration: {pollutants.get('pm25', {}).get('concentration', {}).get('value', 'N/A')} µg/m³
• NowCast: {pollutants.get('pm25', {}).get('nowcast', {}).get('value', 'N/A')} µg/m³
• Calculation Method: {pollutants.get('pm25', {}).get('calculation_method', 'Unknown')}

🏢 Station: {station.get('name', 'Unknown')}
📍 Provider: {station.get('provider', 'Unknown')}

💡 Health Recommendations:
"""
            
            # Add health recommendations based on AQI
            aqi_value = aqi.get('value', 0)
            if aqi_value <= 50:
                response += "• Air quality is good. Enjoy outdoor activities!"
            elif aqi_value <= 100:
                response += "• Air quality is moderate. Sensitive individuals should limit outdoor activities."
            elif aqi_value <= 150:
                response += "• Air quality is unhealthy for sensitive groups. Limit outdoor activities."
            elif aqi_value <= 200:
                response += "• Air quality is unhealthy. Avoid outdoor activities, especially for sensitive groups."
            elif aqi_value <= 300:
                response += "• Air quality is very unhealthy. Stay indoors and avoid outdoor activities."
            else:
                response += "• Air quality is hazardous. Stay indoors and avoid all outdoor activities."
            
            return response
            
        except Exception as e:
            return f"Error formatting air quality data: {str(e)}"

class AIrChatAgent:
    """Main AI agent for AIrChat with LangChain integration"""
    
    def __init__(self, llm_provider: str = "google"):
        self.llm_provider = llm_provider
        self.llm = self._initialize_llm()
        # Store separate memory for each session
        self.memories = {}  # session_id -> ConversationBufferMemory
        self.tools = [
            AirQualityTool(),
            LocationTool(),
            WeatherTool(),
            HealthAdviceTool(),
        ]
        self.agent_executor = self._create_agent()
    
    def _initialize_llm(self):
        """Initialize the LLM based on provider preference"""
        if self.llm_provider == "google":
            return ChatGoogleGenerativeAI(
                model=os.getenv("GOOGLE_MODEL", "gemini-1.5-flash"),
                google_api_key=os.getenv("GOOGLE_API_KEY"),
                temperature=0.2
            )
        elif self.llm_provider == "openai":
            return ChatOpenAI(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                api_key=os.getenv("OPENAI_API_KEY"),
                temperature=0.2
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.llm_provider}")
    
    def _get_or_create_memory(self, session_id: str) -> ConversationBufferMemory:
        """Get or create memory for a specific session"""
        if session_id not in self.memories:
            self.memories[session_id] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        return self.memories[session_id]
    
    def _create_agent(self) -> AgentExecutor:
        """Create the LangChain agent with tools (memory added per session)"""
        
        # System prompt for AIrChat
        system_prompt = """You are AIrChat, a friendly AI assistant specializing in air quality and environmental health. 

Your capabilities:
- Answer questions about air quality in any location using the get_air_quality tool
- Get coordinates from a place name using the get_location tool
- Fetch current weather using the get_weather tool
- Provide health recommendations using the get_health_advice tool (given AQI and optional weather)
- Explain air pollutants (PM2.5, PM10, O3, NO2, SO2, CO)
- Give tips for staying safe during poor air quality conditions
- Answer general questions about environmental health

Response Formatting Guidelines:
1. Use clear section headers with emojis (🌍 📊 💡 ⚠️ 🏥 🎯)
2. Format information with bullet points for readability
3. Use line breaks between sections for better structure
4. Add relevant emojis to emphasize key points
5. For explanations, use this structure:
   - What it is: Brief definition
   - Why it matters: Key importance
   - Health impacts: Specific effects
   - Sources: Where it comes from
   - What you can do: Actionable advice

Example response structure for air quality queries:
---
📍 LOCATION: Ho Chi Minh City, Vietnam
📊 AQI: 85 - Moderate (🟡 Yellow)
🌬️ PM2.5: 28.5 μg/m³
⏰ Last Updated: 2024-01-15 14:30 UTC

🏥 HEALTH IMPACTS:
• Sensitive groups may experience minor breathing discomfort
• People with heart or lung disease should limit outdoor activities
• Children and elderly should avoid prolonged outdoor exposure

💡 RECOMMENDATIONS:
• Consider wearing a mask if spending extended time outdoors
• Keep windows closed and use air purifiers indoors
• Limit outdoor exercise, especially for sensitive groups

📈 TREND: Stable (no significant change in past 24 hours)
---

Example response structure for educational questions:
---
🌬️ Topic Name

What is it?
Clear, concise definition

Why it matters: 
Key importance with specific examples

Key Points:
• Point 1 with context
• Point 2 with context
• Point 3 with context

Health Impacts: 🏥
• Impact 1
• Impact 2

What you can do: 💡
• Actionable tip 1
• Actionable tip 2
---

For air quality queries, always:
- Present AQI data first with clear visual indicators
- Include specific health impacts based on AQI level
- Provide actionable recommendations
- Show trend information when available
- Use appropriate emojis for visual appeal

Always be conversational, helpful, and health-focused!"""
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history", optional=True),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_tools_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        # Return executor WITHOUT memory (we'll add it per-session)
        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])
        
        agent = create_openai_tools_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        return AgentExecutor(
            agent=agent,
            tools=self.tools,
            memory=self.memory,
            verbose=True,
            handle_parsing_errors=True
        )
    
    async def chat(self, message: str, session_id: str = "default") -> str:
        """Process a chat message and return AI response"""
        try:
            # Get session-specific memory
            memory = self._get_or_create_memory(session_id)
            
            # Execute agent with session memory
            response = await self.agent_executor.ainvoke({
                "input": message,
                "chat_history": memory.chat_memory.messages
            })
            
            # Save to memory
            memory.chat_memory.add_user_message(message)
            # memory.chat_memory.add_ai_message(response["output"])
            
            return response["output"]
            
        except Exception as e:
            print(f"Error in AIrChatAgent.chat: {e}")
            return f"I apologize, but I encountered an error processing your message. Please try again. Error: {str(e)}"
    
    def get_memory_summary(self, session_id: str = "default") -> str:
        """Get a summary of the conversation memory for a session"""
        memory = self._get_or_create_memory(session_id)
        messages = memory.chat_memory.messages
        if not messages:
            return "No conversation history"
        
        summary = f"Conversation has {len(messages)} messages:\n"
        for i, msg in enumerate(messages[-5:], 1):  # Show last 5 messages
            role = "Human" if isinstance(msg, HumanMessage) else "AI"
            content = msg.content[:100] + "..." if len(msg.content) > 100 else msg.content
            summary += f"{i}. {role}: {content}\n"
        
        return summary

# Global agent instance
_agent_instance = None

def get_agent(llm_provider: str = None) -> AIrChatAgent:
    """Get or create the global agent instance"""
    global _agent_instance
    
    if _agent_instance is None or (llm_provider and _agent_instance.llm_provider != llm_provider):
        provider = llm_provider or os.getenv("LLM_PROVIDER", "google")
        _agent_instance = AIrChatAgent(llm_provider=provider)
    
    return _agent_instance

async def chat_with_agent(message: str, session_id: str = "default", llm_provider: str = None) -> str:
    """Convenience function to chat with the agent"""
    agent = get_agent(llm_provider)
    return await agent.chat(message, session_id)
