from typing import Optional, Dict
from langchain.tools import BaseTool
import httpx


class LocationTool(BaseTool):
    """Resolve a location string to coordinates using OpenStreetMap Nominatim."""

    name: str = "get_location"
    description: str = (
        "Get coordinates for a location string like 'San Jose, CA'. "
        "Returns a string 'lat,lon' with 4 decimal precision."
    )

    def _run(self, location: str) -> str:
        try:
            result = self._geocode(location)
            if not result:
                return f"Could not find coordinates for: {location}"
            return f"{result['lat']:.4f},{result['lon']:.4f}"
        except Exception as exc:
            return f"Error resolving location: {exc}"

    def _geocode(self, query: str) -> Optional[Dict[str, float]]:
        try:
            import asyncio
            
            # Check if we're already in an event loop
            try:
                loop = asyncio.get_running_loop()
                # We're in an event loop, need to use a different approach
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(self._sync_geocode, query)
                    return future.result(timeout=10)
            except RuntimeError:
                # No event loop running, safe to use asyncio.run
                return asyncio.run(self._async_geocode(query))
                
        except Exception as e:
            print(f"Geocoding error: {e}")
            return None

    def _sync_geocode(self, query: str) -> Optional[Dict[str, float]]:
        """Synchronous geocoding using requests"""
        try:
            import requests
            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": query, "format": "json", "limit": 1},
                headers={"User-Agent": "AIrChat/1.0 (hackathon-project)"},
                timeout=10
            )
            if response.status_code == 200:
                js = response.json()
                if js:
                    return {"lat": float(js[0]["lat"]), "lon": float(js[0]["lon"])}
            return None
        except Exception:
            return None

    async def _async_geocode(self, query: str) -> Optional[Dict[str, float]]:
        """Asynchronous geocoding using httpx"""
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

