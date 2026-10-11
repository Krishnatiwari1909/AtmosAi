from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.schemas.forecast import ForecastResponse
from app.services.prediction import get_mock_forecast
from app.services.ml_predictor import predict_forecast
from app.services.forecast_pipeline import (
    generate_live_forecast,
    generate_live_forecast_by_coords,
)


# --------------------------------------------------
# Router configuration
# --------------------------------------------------

router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"],
)


# --------------------------------------------------
# Mock forecast endpoint
# GET /api/forecast
# --------------------------------------------------

@router.get("", response_model=ForecastResponse)
def get_forecast(
    location: str = "bengaluru",
    profile: str = "general",
):
    """Return the mock forecast for offline/demo reliability."""
    return get_mock_forecast(
        location=location,
        profile=profile,
    )


# --------------------------------------------------
# ML prediction endpoint
# GET /api/forecast/predict
# --------------------------------------------------

@router.get("/predict")
def get_ml_forecast(
    pm25_current: float = Query(..., ge=0),
    pm25_lag_1h: float = Query(..., ge=0),
    pm25_lag_3h: float = Query(..., ge=0),
    pm25_lag_6h: float = Query(..., ge=0),
    pm25_rolling_mean_6h: float = Query(..., ge=0),
    temperature: float = Query(...),
    humidity: float = Query(..., ge=0, le=100),
    wind_speed: float = Query(..., ge=0),
    wind_direction: float = Query(..., ge=0, le=360),
    hour: int = Query(..., ge=0, le=23),
    day_of_week: int = Query(..., ge=0, le=6),
    fire_count: int = Query(default=0, ge=0),
):
    """Generate a prediction using the team's LightGBM model from raw features."""
    features = {
        "pm25_current": pm25_current,
        "pm25_lag_1h": pm25_lag_1h,
        "pm25_lag_3h": pm25_lag_3h,
        "pm25_lag_6h": pm25_lag_6h,
        "pm25_trend_3h": pm25_current - pm25_lag_3h,
        "pm25_rolling_mean_6h": pm25_rolling_mean_6h,
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "wind_direction": wind_direction,
        "hour": hour,
        "is_rush_hour": int(
            (8 <= hour <= 11) or (17 <= hour <= 21)
        ),
        "day_of_week": day_of_week,
        "is_weekend": int(day_of_week >= 5),
        "fire_count": fire_count,
    }

    try:
        result = predict_forecast(features)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="The ML forecast could not be generated.",
        ) from exc

    return {
        **result,
        "location": "bengaluru",
        "profile": "general",
        "prediction_source": "Person 3 LightGBM model",
        "features_used": features,
    }


# --------------------------------------------------
# Live telemetry endpoint (supports named location or GPS coordinates)
# GET /api/forecast/live
# --------------------------------------------------

@router.get("/live")
async def get_live_forecast(
    location: Optional[str] = Query(default=None, description="Predefined location ID (e.g. yelahanka, silk_board, delhi)"),
    lat: Optional[float] = Query(default=None, ge=-90.0, le=90.0, description="Latitude between -90.0 and 90.0"),
    lon: Optional[float] = Query(default=None, ge=-180.0, le=180.0, description="Longitude between -180.0 and 180.0"),
    profile: str = Query(default="general", description="Demographic profile identifier"),
):
    """
    Generate a live ML forecast based on real-time Open-Meteo telemetry.
    Accepts either predefined location string or exact geographic coordinates.
    """
    if (lat is not None and lon is None) or (lat is None and lon is not None):
        raise HTTPException(
            status_code=400,
            detail="Both 'lat' (-90 to 90) and 'lon' (-180 to 180) must be provided together.",
        )

    try:
        if lat is not None and lon is not None:
            result = await generate_live_forecast_by_coords(lat=lat, lon=lon)
        else:
            target_location = (location or "bengaluru").lower().strip()
            result = await generate_live_forecast(target_location)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"The live forecast could not be generated: {exc}",
        ) from exc

    # Enrich with AWS Bedrock / deterministic demographic AI guidance
    try:
        from bedrock_service import generate_ai_explanation
        features_used = result.get("features_used", {})
        display_name = result.get("location") or (location.replace("_", " ").title() if location else "Bengaluru")
        explanation = generate_ai_explanation({
            "location": display_name,
            "profile": profile,
            "risk": result.get("risk", "MODERATE"),
            "forecast_window": result.get("forecast_window", "18:00-21:00"),
            "predicted_pm25": result.get("predicted_pm25", 80),
            "wind_speed": features_used.get("wind_speed", 2.0),
        })
        result["explanation"] = explanation
    except Exception:
        result["explanation"] = None

    result["profile"] = profile
    return result


# --------------------------------------------------
# Dedicated coordinate-based forecast endpoint
# GET /api/forecast/live-coords
# --------------------------------------------------

@router.get("/live-coords")
async def get_live_forecast_by_coords_endpoint(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude between -90.0 and 90.0"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude between -180.0 and 180.0"),
    profile: str = Query(default="general", description="Demographic profile identifier"),
):
    """
    Generate a live ML forecast for explicit geographic coordinates.
    """
    return await get_live_forecast(location=None, lat=lat, lon=lon, profile=profile)
