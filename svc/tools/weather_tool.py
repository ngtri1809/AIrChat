import os
from typing import Any, Dict, Optional
from langchain.tools import BaseTool
import httpx


class WeatherTool(BaseTool):
    """LangChain tool for fetching current weather using OpenWeatherMap."""

    name: str = "get_weather"
    description: str = (
        "Get current weather for a location. Input can be 'City, State/Country' or 'lat,lon'. "
        "Returns temperature (F), conditions, and basic details."
    )

    openweather_api_key: Optional[str] = None

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")

    def _run(self, location: str) -> str:
        try:
            lat, lon = self._parse_location(location)
            if lat is None or lon is None:
                geo = self._geocode(location)
                if not geo:
                    return f"Could not geocode location: {location}"
                lat, lon = geo["lat"], geo["lon"]

            data = self._fetch_weather(lat, lon)
            if "error" in data:
                return data["error"]

            return self._format_weather(data)
        except Exception as exc:
            return f"Error fetching weather: {exc}"

    def _parse_location(self, location: str) -> tuple[Optional[float], Optional[float]]:
        try:
            if "," in location:
                parts = [p.strip() for p in location.split(",")]
                if len(parts) == 2 and all(self._is_number(x) for x in parts):
                    return float(parts[0]), float(parts[1])
            return None, None
        except Exception:
            return None, None

    def _is_number(self, s: str) -> bool:
        try:
            float(s)
            return True
        except Exception:
            return False

    def _geocode(self, query: str) -> Optional[Dict[str, float]]:
        try:
            async def _req():
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        "https://nominatim.openstreetmap.org/search",
                        params={"q": query, "format": "json", "limit": 1},
                        headers={"User-Agent": "AIrChat/1.0 (hackathon-project)"},
                    )
                    if resp.status_code == 200:
                        js = resp.json()
                        if js:
                            return {"lat": float(js[0]["lat"]), "lon": float(js[0]["lon"])}
                return None

            import asyncio
            return asyncio.run(_req())
        except Exception:
            return None

    def _fetch_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        try:
            if not self.openweather_api_key:
                return {"error": "OPENWEATHER_API_KEY is not set"}

            async def _req():
                async with httpx.AsyncClient(timeout=10.0) as client:
                    resp = await client.get(
                        "https://api.openweathermap.org/data/2.5/weather",
                        params={
                            "lat": lat,
                            "lon": lon,
                            "appid": self.openweather_api_key,
                            "units": "imperial",
                        },
                    )
                    if resp.status_code == 200:
                        return resp.json()
                    return {"error": f"OpenWeatherMap returned {resp.status_code}"}

            import asyncio
            return asyncio.run(_req())
        except Exception as exc:
            return {"error": str(exc)}

    def _format_weather(self, data: Dict[str, Any]) -> str:
        main = data.get("main", {})
        weather_list = data.get("weather", [])
        weather = weather_list[0] if weather_list else {}
        wind = data.get("wind", {})

        temp_f = main.get("temp")
        feels_f = main.get("feels_like")
        desc = weather.get("description", "unknown conditions").title()
        wind_mph = wind.get("speed")

        parts = []
        if temp_f is not None:
            parts.append(f"Temp: {round(temp_f)}°F")
        if feels_f is not None:
            parts.append(f"Feels: {round(feels_f)}°F")
        parts.append(desc)
        if wind_mph is not None:
            parts.append(f"Wind: {round(wind_mph)} mph")

        return ", ".join(parts)

