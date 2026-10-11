import sys
from pathlib import Path
from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo

from app.services.ml_predictor import predict_forecast
from app.services.historical_features import build_hourly_features


def _resolve_ml_root():
    candidates = [
        Path(__file__).resolve().parents[3] / "ml-team-repo" / "ml",
        Path(__file__).resolve().parents[2] / "ml-team-repo" / "ml",
        Path("/app/ml-team-repo/ml"),
        Path.cwd() / "ml-team-repo" / "ml",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]

ML_ROOT = _resolve_ml_root()

if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from ingest import fetch_current_telemetry, fetch_telemetry_by_coords


IST = ZoneInfo("Asia/Kolkata")


def _build_features_and_predict(telemetry: dict, default_location: str) -> dict:
    """Extract 15 model features from telemetry dict and execute LightGBM inference."""
    tz = telemetry.get("tz") or IST

    historical_features = build_hourly_features(
        telemetry["hourly_observations"],
        tz=tz,
    )

    now = datetime.now(tz)
    hour = now.hour
    day_of_week = now.weekday()

    required_weather = [
        "temperature",
        "humidity",
        "wind_speed",
        "wind_direction",
    ]

    missing_weather = [
        key
        for key in required_weather
        if telemetry.get(key) is None
    ]

    if missing_weather:
        raise ValueError(
            "Missing current weather features: "
            + ", ".join(missing_weather)
        )

    features = {
        **historical_features,
        "temperature": float(telemetry["temperature"]),
        "humidity": float(telemetry["humidity"]),
        "wind_speed": float(telemetry["wind_speed"]),
        "wind_direction": float(telemetry["wind_direction"]),
        "hour": hour,
        "is_rush_hour": int(
            (8 <= hour <= 11) or (17 <= hour <= 21)
        ),
        "day_of_week": day_of_week,
        "is_weekend": int(day_of_week >= 5),
        "fire_count": 0,
    }

    expected_features = [
        "pm25_current",
        "pm25_lag_1h",
        "pm25_lag_3h",
        "pm25_lag_6h",
        "pm25_trend_3h",
        "pm25_rolling_mean_6h",
        "temperature",
        "humidity",
        "wind_speed",
        "wind_direction",
        "hour",
        "is_rush_hour",
        "day_of_week",
        "is_weekend",
        "fire_count",
    ]

    if set(features) != set(expected_features):
        raise ValueError("The generated model features do not match expected schema.")

    result = predict_forecast(features)

    return {
        **result,
        "location": telemetry.get("location") or default_location,
        "coordinates": telemetry.get("coordinates"),
        "is_custom_coordinates": telemetry.get("is_custom_coordinates", False),
        "prediction_source": "LightGBM",
        "telemetry_source": telemetry["source"],
        "historical_data_source": telemetry["hourly_source"],
        "weather_source": telemetry.get("weather_source", "Open-Meteo"),
        "features_used": features,
        "current_observations": {
            "pm25": telemetry.get("pm25"),
            "pm10": telemetry.get("pm10"),
            "temperature": telemetry.get("temperature"),
            "humidity": telemetry.get("humidity"),
            "wind_speed": telemetry.get("wind_speed"),
            "wind_direction": telemetry.get("wind_direction"),
        },
    }


async def generate_live_forecast_by_coords(
    lat: float,
    lon: float,
    location_name: Optional[str] = None,
) -> dict:
    """Generate a live ML forecast based on geographic coordinates."""
    telemetry = await fetch_telemetry_by_coords(lat, lon, location_name, is_custom_coordinates=True)
    return _build_features_and_predict(telemetry, default_location=f"{lat:.2f}°, {lon:.2f}°")


async def generate_live_forecast(location: str) -> dict:
    """Build all 15 model features and generate a live forecast for a named location."""
    telemetry = await fetch_current_telemetry(location)
    return _build_features_and_predict(telemetry, default_location=location)
