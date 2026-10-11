from typing import List, Optional
from pydantic import BaseModel


class ForecastPoint(BaseModel):
    label: str
    pm25: float
    aqi: int
    level: str

class Factor(BaseModel):
    title: str
    description: str
    icon: Optional[str] = None

class ForecastResponse(BaseModel):
    risk_level: str
    summary: str
    points: List[ForecastPoint]
    explanation: str
    factors: List[Factor]
    recommended_action: str