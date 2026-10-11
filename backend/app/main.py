from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import (
    forecast,
    locations,
    profiles,
    accuracy,
    alerts,
    telemetry,
    user_profile,
)

app = FastAPI(
    title="AtmosAI Backend",
    description="AI-powered air pollution early warning system",
    version="1.0.0",
)

# Enable CORS so the React frontend on localhost:5173 can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AtmosAI Backend",
        "environment": settings.environment,
        "dynamodb": settings.use_dynamodb
    }

app.include_router(forecast.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(profiles.router, prefix="/api")
app.include_router(accuracy.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(telemetry.router, prefix="/api")
app.include_router(user_profile.router, prefix="/api")
app.include_router(user_profile.profile_alias_router, prefix="/api")

