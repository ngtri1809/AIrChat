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

