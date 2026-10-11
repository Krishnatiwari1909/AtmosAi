import sys
from pathlib import Path
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.dynamodb import get_telemetry_table


router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"],
)


class TelemetryCreate(BaseModel):
    node_id: str = Field(..., min_length=1, max_length=100)
    timestamp: datetime
    pm25: float = Field(..., ge=0)
    pm10: float = Field(..., ge=0)
    temperature: Optional[float] = None
    humidity: Optional[float] = Field(default=None, ge=0, le=100)


_LOCAL_TELEMETRY_STORE: dict[str, list[dict]] = {}


@router.post("")
def create_telemetry(data: TelemetryCreate):
    """Save an air-quality reading to DynamoDB with in-memory fallback."""
    timestamp = data.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)

    iso_timestamp = timestamp.isoformat()

    item = {
        "node_id": data.node_id,
        "timestamp": iso_timestamp,
        "pm25": float(data.pm25),
        "pm10": float(data.pm10),
    }
    if data.temperature is not None:
        item["temperature"] = float(data.temperature)
    if data.humidity is not None:
        item["humidity"] = float(data.humidity)

    # In-memory buffer append
    if data.node_id not in _LOCAL_TELEMETRY_STORE:
        _LOCAL_TELEMETRY_STORE[data.node_id] = []
    _LOCAL_TELEMETRY_STORE[data.node_id].insert(0, item)
    if len(_LOCAL_TELEMETRY_STORE[data.node_id]) > 200:
        _LOCAL_TELEMETRY_STORE[data.node_id].pop()

    table = get_telemetry_table()
    dynamo_saved = False

    if table is not None:
        try:
            db_item = {
                "node_id": data.node_id,
                "timestamp": iso_timestamp,
                "pm25": Decimal(str(data.pm25)),
                "pm10": Decimal(str(data.pm10)),
            }
            if data.temperature is not None:
                db_item["temperature"] = Decimal(str(data.temperature))
            if data.humidity is not None:
                db_item["humidity"] = Decimal(str(data.humidity))
            table.put_item(Item=db_item)
            dynamo_saved = True
        except Exception:
            dynamo_saved = False

    return {
        "status": "success",
        "saved": True,
        "dynamodb_synced": dynamo_saved,
        "node_id": data.node_id,
        "timestamp": iso_timestamp,
        "message": "Telemetry saved successfully.",
    }


@router.get("/{node_id}")
def get_telemetry(
    node_id: str,
    limit: int = Query(default=10, ge=1, le=100),
):
    """Retrieve telemetry readings for a sensor."""
    table = get_telemetry_table()

    if table is not None:
        try:
            response = table.query(
                KeyConditionExpression="node_id = :node",
                ExpressionAttributeValues={
                    ":node": node_id,
                },
                ScanIndexForward=False,
                Limit=limit,
            )
            readings = response.get("Items", [])
            # Convert Decimals to float for clean JSON serialization
            serialized = []
            for r in readings:
                entry = dict(r)
                for k, v in entry.items():
                    if isinstance(v, Decimal):
                        entry[k] = float(v)
                serialized.append(entry)

            return {
                "node_id": node_id,
                "count": len(serialized),
                "readings": serialized,
                "source": "dynamodb"
            }
        except Exception:
            pass

    # Fallback to local store or generate realistic telemetry readings
    stored = _LOCAL_TELEMETRY_STORE.get(node_id, [])[:limit]
    return {
        "node_id": node_id,
        "count": len(stored),
        "readings": stored,
        "source": "memory_buffer"
    }
# Connect to Person 3's ML repository ingestion module.
REPO_ROOT = Path(__file__).resolve().parents[3]
ML_ROOT = REPO_ROOT / "ml-team-repo" / "ml"

if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from ingest import fetch_current_telemetry


@router.get("/live")
async def get_live_telemetry(
    location: str = Query(default="yelahanka"),
):
    """Fetch current air-quality and weather data."""

    from ingest import LOCATIONS
    allowed_locations = set(LOCATIONS.keys())

    if location not in allowed_locations:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported location. Choose from: {sorted(allowed_locations)}",
        )

    data = await fetch_current_telemetry(location)

    return {
        "location": location,
        **data,
    }