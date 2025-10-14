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
            async def _geocode():
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
            
            import asyncio
            return asyncio.run(_geocode())
            
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None
    
    def _fetch_air_quality(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetch air quality data from the local service"""
        try:
            async def _fetch():
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
            
            import asyncio
            return asyncio.run(_fetch())
            
        except Exception as e:
            return {"error": str(e)}
    
    def _format_air_quality_response(self, data: Dict[str, Any], location: str) -> str:
        """Format air quality data for LLM consumption"""
        if "error" in data:
            return f"Air quality data unavailable for {location}: {data['error']}"
        
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
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        self.tools = [AirQualityTool()]
        self.agent_executor = self._create_agent()
    
    def _initialize_llm(self):
        """Initialize the LLM based on provider preference"""
        if self.llm_provider == "google":
            return ChatGoogleGenerativeAI(
                model=os.getenv("GOOGLE_MODEL", "gemini-1.5-flash"),
                google_api_key=os.getenv("GOOGLE_API_KEY"),
                temperature=0.7
            )
        elif self.llm_provider == "openai":
            return ChatOpenAI(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                api_key=os.getenv("OPENAI_API_KEY"),
                temperature=0.7
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.llm_provider}")
    
    def _create_agent(self) -> AgentExecutor:
        """Create the LangChain agent with tools"""
        
        # System prompt for AIrChat
        system_prompt = """You are AIrChat, a friendly AI assistant specializing in air quality and environmental health. 

Your capabilities:
- Answer questions about air quality in any location using the get_air_quality tool
- Provide health recommendations based on AQI levels
- Explain air pollutants (PM2.5, PM10, O3, NO2, SO2, CO)
- Give tips for staying safe during poor air quality conditions
- Answer general questions about environmental health

Guidelines:
- Always be conversational, helpful, and health-focused
- When users ask about air quality in a specific location, use the get_air_quality tool
- Provide clear, actionable health advice based on AQI levels
- Use emojis and formatting to make responses engaging
- If you don't know something about air quality, say so rather than guessing

Remember: Your primary goal is to help people understand air quality and stay healthy!"""

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
            # Add session context to memory key
            memory_key = f"{session_id}_chat_history"
            
            # Execute agent
            response = await self.agent_executor.ainvoke({
                "input": message,
                "chat_history": self.memory.chat_memory.messages
            })
            
            return response["output"]
            
        except Exception as e:
            print(f"Error in AIrChatAgent.chat: {e}")
            return f"I apologize, but I encountered an error processing your message. Please try again. Error: {str(e)}"
    
    def get_memory_summary(self) -> str:
        """Get a summary of the conversation memory"""
        messages = self.memory.chat_memory.messages
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
