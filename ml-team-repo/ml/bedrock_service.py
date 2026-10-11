import os
import re
import json
from pathlib import Path
from typing import Dict, Any
import google.generativeai as genai
from dotenv import load_dotenv

# Ensure environment variables are loaded
env_paths = [
    Path(__file__).resolve().parent.parent / ".env",
    Path(__file__).resolve().parent.parent.parent / "backend" / ".env",
    Path(".env")
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Primary fast, high-quota Gemini model
PRIMARY_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest"
]

def extract_json_object(raw_text: str) -> Dict[str, Any]:
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # If extra commentary is included, extract bracketed JSON
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        text = match.group(1)

    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Parsed JSON is not a dictionary")
    return data

def build_context_aware_fallback(
    risk: str,
    name: str,
    activities: str,
    sensitivities: str,
    current_pm25: float,
    predicted_pm25: float,
    wind_speed: float
) -> Dict[str, Any]:
    """Generates grammatically correct, realistic advice aligned with actual air quality and risk."""
    norm_act = (activities or "").lower()
    norm_sens = (sensitivities or "").lower()
    norm_risk = (risk or "MODERATE").upper()

    is_runner = any(k in norm_act for k in ["runner", "athlete", "running", "jogging", "marathon"])
    is_rider = any(k in norm_act for k in ["delivery", "rider", "bike", "two-wheeler", "field"])
    is_parent = any(k in norm_act for k in ["parent", "child", "pediatric", "family", "kids"])
    is_sensitive = any(k in norm_sens for k in ["asthma", "allergy", "wheezing", "bronch", "respiratory", "lung"])

    # 1. Clean / Good Air (LOW RISK)
    if norm_risk == "LOW" or (current_pm25 <= 30 and predicted_pm25 <= 35):
        summary = f"Air quality is clean and healthy. Low pollution risk across your area, {name}."
        why = [
            f"Current PM2.5 is {current_pm25} µg/m³, maintaining a clean baseline through the next 3 hours ({predicted_pm25} µg/m³)",
            f"Favorable atmospheric dispersion with surface wind speeds of {wind_speed} m/s",
            "Low ambient particulate density across city corridors"
        ]
        if is_runner:
            action = "Great air quality! Ideal conditions for your outdoor run or training session today."
        elif is_rider:
            action = "Clear road conditions with low ambient dust. Enjoy smooth riding conditions without an anti-pollution mask."
        elif is_sensitive:
            action = "Air quality is in the safe zone. Safe for outdoor errands with very low respiratory trigger risk."
        elif is_parent:
            action = "Air quality is clean and healthy. Safe for children to play outdoors and engage in sports."
        else:
            action = "Air quality is clean and safe for all regular outdoor activities and exercise."

    # 2. Moderate Air (MODERATE RISK)
    elif norm_risk == "MODERATE" or (current_pm25 <= 60 and predicted_pm25 <= 90):
        summary = f"Moderate air quality expected. Acceptable for most daily routines, {name}."
        why = [
            f"PM2.5 is currently {current_pm25} µg/m³, with projections near {predicted_pm25} µg/m³",
            f"Surface winds of {wind_speed} m/s maintain steady atmospheric ventilation",
            "Moderate traffic emissions accumulating along transit corridors"
        ]
        if is_sensitive:
            action = "Moderate particulate levels. Keep prescribed rescue medication accessible during extended outdoor outings."
        elif is_runner:
            action = "Air quality is acceptable for outdoor runs. Sensitive runners may prefer early morning or indoor sessions."
        elif is_rider:
            action = "Moderate exposure along traffic routes. Consider wearing a light filter mask during dense traffic hours."
        elif is_parent:
            action = "Air quality is satisfactory for general play, but monitor children with sensitive airways."
        else:
            action = "Air quality is acceptable for most people. No major precautions required for normal outdoor activities."

    # 3. High Pollution Surge (HIGH RISK)
    elif norm_risk in ["HIGH", "POOR"] or (current_pm25 <= 120 and predicted_pm25 <= 140):
        summary = f"Elevated pollution surge expected. Please take preventative precautions, {name}."
        why = [
            f"PM2.5 concentration climbing from {current_pm25} µg/m³ toward {predicted_pm25} µg/m³",
            f"Low wind speeds ({wind_speed} m/s) slowing down atmospheric dispersion",
            "Rush-hour vehicular exhaust accumulating along transit corridors"
        ]
        if is_runner:
            action = "Elevated particulate surge expected. Complete outdoor runs before evening rush hour or transition to indoor cardio."
        elif is_rider:
            action = "High roadside particulate exposure. Fasten an N95 respirator mask along congested traffic corridors."
        elif is_sensitive:
            action = "Unhealthy levels for sensitive respiratory airways. Limit outdoor exposure and keep prescribed inhalers accessible."
        elif is_parent:
            action = "Air quality is deteriorating. Transition children's playtime and sports indoors during peak evening hours."
        else:
            action = "Elevated pollution expected. Reduce prolonged outdoor physical exertion during peak surge hours."

    # 4. Severe Hazard (VERY HIGH RISK)
    else:
        summary = f"Severe pollution alert. Hazardous particulate levels expected near your location, {name}."
        why = [
            f"Critical PM2.5 levels accelerating toward {predicted_pm25} µg/m³ (Current: {current_pm25} µg/m³)",
            "Stagnant boundary layer air trapping localized particulate emissions",
            "Heavy vehicular and industrial emission concentration"
        ]
        if is_runner:
            action = "Air quality is hazardous. Avoid all outdoor running; conduct all workout sessions strictly indoors with air purification."
        elif is_rider:
            action = "Hazardous road conditions. Wear a sealed N95/FFP2 respirator mask continuously and take breaks in filtered indoor hubs."
        elif is_sensitive:
            action = "Severe respiratory health risk. Remain indoors with air purifiers active, keep windows sealed, and avoid outdoor exposure."
        elif is_parent:
            action = "Hazardous air quality. Keep children strictly indoors with air filtration running; suspend all outdoor activities."
        else:
            action = "Severe pollution hazard. Avoid all strenuous outdoor activities and wear an N95 mask if stepping outside."

    return {
        "summary": summary,
        "why": why,
        "action": action,
        "is_ai_generated": False
    }

def generate_ai_explanation(forecast_data: Dict[str, Any]) -> Dict[str, Any]:
    name = forecast_data.get("name", "User")
    age = forecast_data.get("age", 25)
    activities = forecast_data.get("activities", "Outdoor exercise")
    sensitivities = forecast_data.get("sensitivities", "None")
    commute = forecast_data.get("commute", "Public transit")
    mitigation = forecast_data.get("mitigation", "None")

    current_pm25 = forecast_data.get("current_pm25", 0)
    predicted_pm25 = forecast_data.get("predicted_pm25", 0)
    risk = forecast_data.get("risk", "MODERATE")
    wind_speed = forecast_data.get("wind_speed", 1.8)

    fallback_payload = build_context_aware_fallback(
        risk=risk,
        name=name,
        activities=activities,
        sensitivities=sensitivities,
        current_pm25=current_pm25,
        predicted_pm25=predicted_pm25,
        wind_speed=wind_speed
    )

    if not GEMINI_API_KEY:
        return fallback_payload

    prompt = f"""You are the personal environmental health copilot for AtmosAI.
User Context:
- Name: {name}, Age: {age}
- Routine Activities: {activities}
- Health & Sensitivities: {sensitivities}
- Commute Method: {commute}
- Available Protective Gear: {mitigation}

Forecast Context:
- Current PM2.5: {current_pm25} µg/m³
- Projected 3-Hour PM2.5: {predicted_pm25} µg/m³
- Risk Level: {risk}
- Wind Speed: {wind_speed} m/s

CRITICAL RULES:
1. Pay close attention to Risk Level:
   - If Risk Level is LOW (clean air, PM2.5 <= 30), confirm air quality is great and encourage outdoor activities.
   - If Risk Level is MODERATE (AQI 51-100), note acceptable conditions with mild precautions for sensitive airways.
   - If Risk Level is HIGH or VERY HIGH, recommend concrete mitigations (indoor cardio for runners, N95 masks for riders, indoor games for children).
2. Use natural, grammatically correct phrasing tailored to their specific routine (e.g. "running workouts", "delivery shifts", "outdoor walks"). Never output broken sentences like "Avoid outdoor Runner / Athlete".
3. Return ONLY a valid JSON object matching this schema:
{{
  "summary": "1-sentence executive status addressing {name}",
  "why": ["Specific atmospheric/emission driver 1", "Specific atmospheric/emission driver 2", "Specific atmospheric/emission driver 3"],
  "action": "Concrete, personalized operational guidance based on their activities and gear."
}}"""

    # Try live Gemini generation with candidate models
    for model_name in PRIMARY_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            parsed = extract_json_object(raw_text)
            return {
                "summary": parsed.get("summary", fallback_payload["summary"]),
                "why": parsed.get("why", fallback_payload["why"]),
                "action": parsed.get("action", fallback_payload["action"]),
                "is_ai_generated": True
            }
        except Exception as e:
            # Try next model candidate
            continue

    return fallback_payload