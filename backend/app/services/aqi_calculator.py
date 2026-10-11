"""
Standard Indian National Air Quality Index (AQI) Piecewise Calculation for PM2.5.
CPCB Formula:
  AQI = ((I_high - I_low) / (C_high - C_low)) * (Concentration - C_low) + I_low
"""

def calculate_aqi(pm25: float) -> dict:
    c = max(0.0, float(pm25))
    if c <= 30.0:
        c_low, c_high, i_low, i_high, category = 0.0, 30.0, 0, 50, "Good"
    elif c <= 60.0:
        c_low, c_high, i_low, i_high, category = 31.0, 60.0, 51, 100, "Satisfactory"
    elif c <= 90.0:
        c_low, c_high, i_low, i_high, category = 61.0, 90.0, 101, 200, "Moderate"
    elif c <= 120.0:
        c_low, c_high, i_low, i_high, category = 91.0, 120.0, 201, 300, "Poor"
    elif c <= 250.0:
        c_low, c_high, i_low, i_high, category = 121.0, 250.0, 301, 400, "Very Poor"
    else:
        c_low, c_high, i_low, i_high, category = 250.0, 500.0, 401, 500, "Severe"

    clamped_c = max(c_low, min(c, c_high))
    raw_aqi = ((i_high - i_low) / (c_high - c_low)) * (clamped_c - c_low) + i_low
    aqi = round(raw_aqi)

    return {
        "aqi": min(500, max(0, aqi)),
        "category": category,
    }
