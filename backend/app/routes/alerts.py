from fastapi import APIRouter
from datetime import datetime, timezone


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("")
def get_alerts():
    now = datetime.now(timezone.utc)
    hour = now.hour
    is_rush = (8 <= hour <= 11) or (17 <= hour <= 21)

    alerts = [
        {
            "id": "alt-blr-01",
            "location": "Silk Board Junction",
            "node_id": "silk_board",
            "severity": "HIGH",
            "title": "Diurnal Traffic Exhaust Surge Projected",
            "summary": "Boundary layer inversion combining with peak vehicular density along Hosur Road corridor.",
            "forecast_window": "18:00 - 21:00 IST",
            "predicted_pm25": 118.5,
            "recommended_action": "Commuters advised to stagger travel or use metro link before 17:30.",
            "created_at": now.isoformat(),
        },
        {
            "id": "alt-blr-02",
            "location": "Peenya Industrial Area",
            "node_id": "peenya",
            "severity": "VERY_HIGH" if is_rush else "MODERATE",
            "title": "Low Wind Dispersion Advisory",
            "summary": "Stagnant surface air mass (wind speed < 1.5 m/s) trapping manufacturing particulate.",
            "forecast_window": "Next 3 Hours",
            "predicted_pm25": 134.2,
            "recommended_action": "Outdoor workers and riders should equip N95 masks immediately.",
            "created_at": now.isoformat(),
        }
    ]

    return {
        "count": len(alerts),
        "alerts": alerts
    }