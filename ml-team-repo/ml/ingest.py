
import httpx
from datetime import datetime
from zoneinfo import ZoneInfo


from typing import Optional

LOCATIONS = {
    "bengaluru": {"lat": 12.9716, "lon": 77.5946},
    "peenya": {"lat": 13.0285, "lon": 77.5197},
    "silk_board": {"lat": 12.9172, "lon": 77.6228},
    "yelahanka": {"lat": 13.1007, "lon": 77.5963},
}


async def reverse_geocode_coords(lat: float, lon: float) -> Optional[str]:
    """Resolve a locality name for given coordinates."""
    url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=14"
    try:
        async with httpx.AsyncClient(headers={"User-Agent": "AtmosAI-EarlyWarning/1.0"}, timeout=3.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                addr = data.get("address", {})
                locality = (
                    addr.get("suburb")
                    or addr.get("city")
                    or addr.get("town")
                    or addr.get("neighbourhood")
                    or addr.get("county")
                    or data.get("name")
                )
                if locality:
                    state_district = addr.get("state")
                    return f"{locality}, {state_district}" if state_district and locality != state_district else locality
    except Exception:
        pass

    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.2f}°{lat_dir}, {abs(lon):.2f}°{lon_dir}"


async def fetch_current_telemetry(location_id: str, lat: float = None, lon: float = None) -> dict:
    """Fetch current air-quality and weather data plus hourly PM2.5."""

    resolved_name = location_id
    if lat is not None and lon is not None:
        coords = {"lat": lat, "lon": lon}
        resolved_name = (await reverse_geocode_coords(lat, lon)) or f"{lat:.2f}°, {lon:.2f}°"
    else:
        if location_id not in LOCATIONS:
            raise ValueError(f"Unsupported location: {location_id}")
        coords = LOCATIONS[location_id]


    air_quality_url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={coords['lat']}&longitude={coords['lon']}"
        "&current=pm2_5,pm10"
        "&hourly=pm2_5"
        "&timezone=Asia%2FKolkata"
        "&past_days=2"
        "&forecast_days=1"
    )

    weather_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={coords['lat']}&longitude={coords['lon']}"
        "&current=temperature_2m,relative_humidity_2m,"
        "wind_speed_10m,wind_direction_10m"
        "&timezone=Asia%2FKolkata"
    )

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            aq_res = await client.get(air_quality_url)
            aq_res.raise_for_status()

            weather_res = await client.get(weather_url)
            weather_res.raise_for_status()

            aq_json = aq_res.json()
            weather_json = weather_res.json()

            aq_current = aq_json.get("current", {})
            aq_hourly = aq_json.get("hourly", {})
            weather_current = weather_json.get("current", {})

            if aq_current.get("pm2_5") is None:
                raise ValueError("Current PM2.5 is unavailable.")

            if not aq_hourly.get("time") or not aq_hourly.get("pm2_5"):
                raise ValueError("Hourly PM2.5 history is unavailable.")

            if len(aq_hourly["time"]) != len(aq_hourly["pm2_5"]):
                raise ValueError("Hourly timestamps and PM2.5 values do not match.")

            hourly_observations = [
                {
                    "timestamp": timestamp,
                    "pm25": float(value),
                }
                for timestamp, value in zip(
                    aq_hourly["time"],
                    aq_hourly["pm2_5"],
                )
                if value is not None
            ]

            return {
                "location": resolved_name,
                "timestamp": datetime.now(
                    ZoneInfo("Asia/Kolkata")
                ).isoformat(),
                "pm25": float(aq_current["pm2_5"]),
                "pm10": (
                    float(aq_current["pm10"])
                    if aq_current.get("pm10") is not None
                    else None
                ),
                "temperature": weather_current.get("temperature_2m"),
                "humidity": weather_current.get("relative_humidity_2m"),
                "wind_speed": weather_current.get("wind_speed_10m"),
                "wind_direction": weather_current.get("wind_direction_10m"),
                "source": "Open-Meteo",
                "hourly_source": "Open-Meteo modelled hourly data",
                "hourly_timestamps": [
                    item["timestamp"] for item in hourly_observations
                ],
                "hourly_pm25": [
                    item["pm25"] for item in hourly_observations
                ],
                "hourly_observations": hourly_observations,
            }

        except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
            raise RuntimeError(
                f"Unable to retrieve valid telemetry for {location_id}: {exc}"
            ) from exc
