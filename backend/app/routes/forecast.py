import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query
from app.services.forecast_pipeline import generate_live_forecast
from app.services.aqi_calculator import calculate_aqi

# Ensure access to the ML repository and reload AI guidance service
ml_base = Path(__file__).resolve().parent.parent.parent.parent / "ml"
ML_ROOT = (ml_base / "ml") if (ml_base / "ml").exists() else ml_base
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))
import bedrock_service
from bedrock_service import generate_ai_explanation

router = APIRouter(
    prefix="/forecast",
    tags=["Forecast"],
)

@router.get("")
@router.get("/live")
async def get_live_ai_forecast(
    location: str = Query(default="bengaluru"), 
    profile: str = Query(default="general"),
    lat: float = Query(None),
    lon: float = Query(None),
    name: str = Query("User"),
    age: int = Query(25),
    activity: str = Query("Walking"),
    health: str = Query("None"),
    commute: str = Query("Public transit"),
    gear: str = Query("None")
):
    """Fetch live data, run LightGBM inference, and generate Bedrock/Gemini AI advice."""
    if (lat is not None and lon is None) or (lat is None and lon is not None):
        raise HTTPException(
            status_code=400,
            detail="Both 'lat' (-90 to 90) and 'lon' (-180 to 180) must be provided together.",
        )

    if lat is not None and not (-90.0 <= lat <= 90.0):
        raise HTTPException(status_code=422, detail="Latitude must be between -90.0 and 90.0 degrees.")

    if lon is not None and not (-180.0 <= lon <= 180.0):
        raise HTTPException(status_code=422, detail="Longitude must be between -180.0 and 180.0 degrees.")

    # Ensure plain values if invoked directly as a Python coroutine
    name_val = name if isinstance(name, str) else getattr(name, "default", "User")
    age_val = age if isinstance(age, int) else getattr(age, "default", 25)
    activity_val = activity if isinstance(activity, str) else getattr(activity, "default", "Walking")
    health_val = health if isinstance(health, str) else getattr(health, "default", "None")
    commute_val = commute if isinstance(commute, str) else getattr(commute, "default", "Public transit")
    gear_val = gear if isinstance(gear, str) else getattr(gear, "default", "None")

    try:
        # 1. Run LightGBM Inference Pipeline
        target_loc = location or "bengaluru"
        ml_data = await generate_live_forecast(target_loc, lat, lon)
        
        # 2. Run AI Guidance (Gemini 2.5 Flash)
        bedrock_input = {
            "name": name_val,
            "age": age_val,
            "activities": activity_val,
            "sensitivities": health_val,
            "commute": commute_val,
            "mitigation": gear_val,
            "risk": ml_data["risk"],
            "forecast_window": ml_data.get("forecast_window", "Next 3 Hours"),
            "predicted_pm25": ml_data["predicted_pm25"],
            "current_pm25": ml_data["features_used"]["pm25_current"],
            "wind_speed": ml_data["features_used"]["wind_speed"]
        }
        ai_data = generate_ai_explanation(bedrock_input)
        
        current_pm = ml_data["features_used"]["pm25_current"]
        predicted_pm = ml_data["predicted_pm25"]
        now_aqi = calculate_aqi(current_pm)
        pred_aqi = calculate_aqi(predicted_pm)
        
        is_custom = lat is not None and lon is not None

        return {
            "risk": ml_data["risk"],
            "risk_level": ml_data["risk"],
            "summary": ai_data["summary"],
            "predicted_pm25": predicted_pm,
            "location": ml_data.get("location") or target_loc,
            "profile": profile,
            "is_custom_coordinates": is_custom,
            "coordinates": {"lat": round(lat, 5), "lon": round(lon, 5)} if is_custom else None,
            "telemetry_source": ml_data.get("telemetry_source", "Open-Meteo"),
            "features_used": ml_data["features_used"],
            "current_observations": {
                "pm25": current_pm,
                "pm10": ml_data["features_used"].get("pm10"),
                "temperature": ml_data["features_used"].get("temperature"),
                "humidity": ml_data["features_used"].get("humidity"),
                "wind_speed": ml_data["features_used"].get("wind_speed"),
                "wind_direction": ml_data["features_used"].get("wind_direction"),
            },
            "points": [
                {"label": "Now", "pm25": current_pm, "aqi": now_aqi["aqi"], "level": now_aqi["category"]},
                {"label": "+3h", "pm25": predicted_pm, "aqi": pred_aqi["aqi"], "level": pred_aqi["category"]}
            ],
            "explanation": ai_data,
            "factors": [
                {"title": "Wind Speed", "description": f"{ml_data['features_used']['wind_speed']} m/s", "icon": "wind"},
                {"title": "Humidity", "description": f"{ml_data['features_used']['humidity']}%", "icon": "humidity"},
                {"title": "Traffic Trends", "description": "High commute volume detected" if ml_data["features_used"].get("is_rush_hour") else "Normal traffic conditions", "icon": "traffic"}
            ],
            "recommended_action": ai_data["action"]
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/live-coords")
async def get_live_forecast_by_coords_endpoint(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude between -90.0 and 90.0"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude between -180.0 and 180.0"),
    profile: str = Query(default="general", description="Demographic profile identifier"),
    name: str = Query("User"),
    age: int = Query(25),
    activity: str = Query("Walking"),
    health: str = Query("None"),
    commute: str = Query("Public transit"),
    gear: str = Query("None")
):
    """Generate a live ML forecast for explicit geographic coordinates."""
    return await get_live_ai_forecast(
        location=None, profile=profile, lat=lat, lon=lon,
        name=name, age=age, activity=activity, health=health, commute=commute, gear=gear
    )
