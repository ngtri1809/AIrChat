from typing import Any, Optional
from langchain.tools import BaseTool


class HealthAdviceTool(BaseTool):
    """Provide health recommendations based on AQI level and optional weather info."""

    name: str = "get_health_advice"
    description: str = (
        "Given an AQI value (0-500) and optional brief weather text, return concise "
        "activity guidance. Input format: 'AQI[: optional weather text]'."
    )

    def _run(self, input_text: str) -> str:
        try:
            aqi, weather = self._parse(input_text)
            return self._advice(aqi, weather)
        except Exception as exc:
            return f"Error generating health advice: {exc}"

    def _parse(self, text: str) -> tuple[int, Optional[str]]:
        if ":" in text:
            left, right = text.split(":", 1)
            aqi = int(left.strip())
            weather = right.strip() or None
            return aqi, weather
        return int(text.strip()), None

    def _advice(self, aqi: int, weather: Optional[str]) -> str:
        band = self._aqi_band(aqi)
        base = {
            "good": "Air quality is good. Enjoy normal outdoor activity.",
            "moderate": "Air quality is moderate. Sensitive individuals should consider shorter outdoor activity.",
            "usg": "Unhealthy for sensitive groups. Limit prolonged or heavy exertion outdoors.",
            "unhealthy": "Unhealthy. Reduce or avoid outdoor exertion; consider indoor alternatives.",
            "very_unhealthy": "Very unhealthy. Avoid outdoor activity; stay indoors with clean air.",
            "hazardous": "Hazardous. Stay indoors; use high-quality air filtration if available.",
        }[band]

        if weather:
            return f"{base} Weather: {weather}"
        return base

    def _aqi_band(self, aqi: int) -> str:
        if aqi <= 50:
            return "good"
        if aqi <= 100:
            return "moderate"
        if aqi <= 150:
            return "usg"
        if aqi <= 200:
            return "unhealthy"
        if aqi <= 300:
            return "very_unhealthy"
        return "hazardous"

