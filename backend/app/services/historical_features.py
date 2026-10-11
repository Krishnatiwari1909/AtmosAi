from datetime import datetime, timedelta
from statistics import mean
from typing import Optional
from zoneinfo import ZoneInfo

IST = ZoneInfo("Asia/Kolkata")


def build_hourly_features(
    hourly_observations: list[dict],
    tz: Optional[ZoneInfo] = None,
) -> dict:
    """
    Build PM2.5 history features from timestamped hourly observations.
    Only observations at or before the current hour are used.
    """
    if not hourly_observations:
        raise ValueError("No hourly PM2.5 observations were provided.")

    active_tz = tz or IST
    hourly_pm25 = {}

    for item in hourly_observations:
        timestamp_text = item.get("timestamp")
        value = item.get("pm25")

        if timestamp_text is None or value is None:
            continue

        timestamp = datetime.fromisoformat(timestamp_text)

        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=active_tz)
        else:
            timestamp = timestamp.astimezone(active_tz)

        hour_start = timestamp.replace(
            minute=0, second=0, microsecond=0
        )

        hourly_pm25[hour_start] = float(value)

    if not hourly_pm25:
        raise ValueError("No valid hourly PM2.5 observations were found.")

    now = datetime.now(active_tz)
    current_hour = now.replace(minute=0, second=0, microsecond=0)

    # Filter to observations up to current_hour
    past_or_current = {
        timestamp: value
        for timestamp, value in hourly_pm25.items()
        if timestamp <= current_hour
    }

    if not past_or_current:
        anchor_hour = max(hourly_pm25.keys())
    else:
        anchor_hour = max(past_or_current.keys())

    required_hours = [
        anchor_hour - timedelta(hours=offset)
        for offset in range(7)
    ]

    missing_hours = [
        timestamp.isoformat()
        for timestamp in required_hours
        if timestamp not in hourly_pm25
    ]

    if len(missing_hours) > 2:
        raise ValueError(
            "Insufficient hourly PM2.5 history. Missing hours: "
            + ", ".join(missing_hours)
        )
    elif missing_hours:
        # Interpolate minor 1-2 hour gaps from closest available observation
        sorted_times = sorted(hourly_pm25.keys())
        for req in required_hours:
            if req not in hourly_pm25:
                closest = min(sorted_times, key=lambda t: abs((t - req).total_seconds()))
                hourly_pm25[req] = hourly_pm25[closest]

    current = hourly_pm25[required_hours[0]]
    lag_1h = hourly_pm25[required_hours[1]]
    lag_3h = hourly_pm25[required_hours[3]]
    lag_6h = hourly_pm25[required_hours[6]]

    rolling_values = [
        hourly_pm25[required_hours[offset]]
        for offset in range(6)
    ]

    return {
        "pm25_current": current,
        "pm25_lag_1h": lag_1h,
        "pm25_lag_3h": lag_3h,
        "pm25_lag_6h": lag_6h,
        "pm25_trend_3h": current - lag_3h,
        "pm25_rolling_mean_6h": mean(rolling_values),
    }
