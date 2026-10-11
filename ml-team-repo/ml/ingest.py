import httpx
from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo

LOCATIONS = {
    "yelahanka": {"lat": 13.1007, "lon": 77.5963, "name": "Yelahanka"},
    "peenya": {"lat": 13.0285, "lon": 77.5197, "name": "Peenya"},
    "silk_board": {"lat": 12.9172, "lon": 77.6228, "name": "Silk Board"},
    "bengaluru": {"lat": 12.9716, "lon": 77.5946, "name": "Bengaluru Central"},
    "koramangala": {"lat": 12.9352, "lon": 77.6245, "name": "Koramangala"},
    "hebbal": {"lat": 13.0358, "lon": 77.5970, "name": "Hebbal"},
    "electronic_city": {"lat": 12.8399, "lon": 77.6770, "name": "Electronic City"},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "name": "Delhi"},
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "name": "Hyderabad"},
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "name": "Mumbai"},
    "chennai": {"lat": 13.0827, "lon": 80.2707, "name": "Chennai"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "name": "Pune"},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "name": "Kolkata"},
}


async def reverse_geocode_coords(lat: float, lon: float) -> Optional[str]:
    """Resolve a privacy-conscious locality name for given coordinates."""
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

    # Privacy-conscious coordinate string fallback
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"
    return f"{abs(lat):.2f}°{lat_dir}, {abs(lon):.2f}°{lon_dir}"


async def fetch_telemetry_by_coords(
    lat: float,
    lon: float,
    location_name: Optional[str] = None,
    is_custom_coordinates: bool = True,
) -> dict:
    """
    Fetch current air-quality and weather measurements plus hourly PM2.5 history
    for arbitrary geographic coordinates worldwide.
    """
    if not (-90.0 <= lat <= 90.0):
        raise ValueError(f"Latitude must be between -90.0 and 90.0 degrees. Received: {lat}")
    if not (-180.0 <= lon <= 180.0):
        raise ValueError(f"Longitude must be between -180.0 and 180.0 degrees. Received: {lon}")

    # Use auto timezone matching user's geographic coordinates
    air_quality_url = (
        "https://air-quality-api.open-meteo.com/v1/air-quality"
        f"?latitude={lat}&longitude={lon}"
        "&current=pm2_5,pm10"
        "&hourly=pm2_5"
        "&timezone=auto"
        "&past_days=2"
        "&forecast_days=1"
    )

    weather_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,"
        "wind_speed_10m,wind_direction_10m"
        "&timezone=auto"
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
                raise ValueError("Current PM2.5 measurement is unavailable for these coordinates.")

            if not aq_hourly.get("time") or not aq_hourly.get("pm2_5"):
                raise ValueError("Hourly PM2.5 history is unavailable for these coordinates.")

            if len(aq_hourly["time"]) != len(aq_hourly["pm2_5"]):
                raise ValueError("Hourly timestamps and PM2.5 values count mismatch.")

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

            # Resolve local timezone
            tz_str = aq_json.get("timezone", "Asia/Kolkata")
            try:
                tz = ZoneInfo(tz_str)
            except Exception:
                tz = ZoneInfo("Asia/Kolkata")

            # Resolve human-readable locality label
            resolved_location = location_name
            if not resolved_location:
                resolved_location = await reverse_geocode_coords(lat, lon)
            if not resolved_location:
                resolved_location = f"{abs(lat):.2f}°, {abs(lon):.2f}°"

            return {
                "location": resolved_location,
                "coordinates": {
                    "lat": round(lat, 5),
                    "lon": round(lon, 5),
                },
                "is_custom_coordinates": is_custom_coordinates,
                "timezone": tz_str,
                "tz": tz,
                "timestamp": datetime.now(tz).isoformat(),
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
                "source": "Open-Meteo Air Quality (CAMS Model & Ground Assimilation)",
                "hourly_source": "Open-Meteo Modelled Hourly Data",
                "weather_source": "Open-Meteo Global Surface Weather",
                "hourly_timestamps": [
                    item["timestamp"] for item in hourly_observations
                ],
                "hourly_pm25": [
                    item["pm25"] for item in hourly_observations
                ],
                "hourly_observations": hourly_observations,
            }

        except httpx.TimeoutException as exc:
            raise RuntimeError(
                f"Air-quality provider request timed out for coordinates ({lat}, {lon})."
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Air-quality provider error (HTTP {exc.response.status_code}) for coordinates ({lat}, {lon})."
            ) from exc
        except (ValueError, KeyError, TypeError) as exc:
            raise RuntimeError(
                f"Unable to retrieve valid telemetry for coordinates ({lat}, {lon}): {exc}"
            ) from exc


async def fetch_current_telemetry(location_id: str) -> dict:
    """Fetch current air-quality and weather data for a named location ID."""
    norm_id = location_id.lower().strip().replace("-", "_").replace(" ", "_")

    if norm_id not in LOCATIONS:
        # Check if partial match exists
        matches = [k for k in LOCATIONS if norm_id in k or k in norm_id]
        if matches:
            norm_id = matches[0]
        else:
            raise ValueError(
                f"Unsupported location: '{location_id}'. Supported stations: {', '.join(LOCATIONS.keys())}"
            )

    coords = LOCATIONS[norm_id]
    return await fetch_telemetry_by_coords(
        lat=coords["lat"],
        lon=coords["lon"],
        location_name=coords.get("name", location_id.title()),
        is_custom_coordinates=False,
    )
