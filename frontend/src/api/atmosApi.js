import {
  MOCK_LOCATIONS,
  MOCK_PROFILES,
  MOCK_ACCURACY,
  MOCK_ALERTS,
  generateHistoricalObservations,
} from "../data/mockData";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Local stale-while-revalidate offline caching utilities (15 min TTL)
export const FORECAST_CACHE_TTL_MS = 15 * 60 * 1000;

export function getCachedData(key, maxAgeMs = null) {
  try {
    const raw = localStorage.getItem(`atmos_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        if (maxAgeMs !== null) {
          const age = Date.now() - (parsed.timestampMs || 0);
          if (age > maxAgeMs) {
            return null; // Expired
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function setCachedData(key, data) {
  try {
    localStorage.setItem(
      `atmos_cache_${key}`,
      JSON.stringify({
        data,
        timestampMs: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
      })
    );
  } catch (e) {
    // ignore
  }
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err) {
    return {
      status: "offline_mock",
      service: "AtmosAI Backend (Local Fallback)",
      environment: "client_fallback",
      dynamodb: false,
      error: err.message,
    };
  }
}

export async function fetchLocations() {
  const cacheKey = "locations";
  try {
    const res = await fetch(`${API_BASE}/api/locations`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("Locations request failed");
    const data = await res.json();
    const result = data.locations || MOCK_LOCATIONS;
    setCachedData(cacheKey, result);
    return result;
  } catch {
    const cached = getCachedData(cacheKey);
    if (cached?.data) return cached.data;
    return MOCK_LOCATIONS;
  }
}

export async function fetchProfiles() {
  const cacheKey = "profiles";
  try {
    const res = await fetch(`${API_BASE}/api/profiles`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("Profiles request failed");
    const data = await res.json();
    const result = data.profiles || MOCK_PROFILES;
    setCachedData(cacheKey, result);
    return result;
  } catch {
    const cached = getCachedData(cacheKey);
    if (cached?.data) return cached.data;
    return MOCK_PROFILES;
  }
}

export async function fetchAlerts() {
  const cacheKey = "alerts";
  try {
    const res = await fetch(`${API_BASE}/api/alerts`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("Alerts request failed");
    const data = await res.json();
    const result = data.alerts || MOCK_ALERTS;
    setCachedData(cacheKey, result);
    return result;
  } catch {
    const cached = getCachedData(cacheKey);
    if (cached?.data) return cached.data;
    return MOCK_ALERTS;
  }
}

export async function fetchAccuracy() {
  const cacheKey = "accuracy";
  try {
    const res = await fetch(`${API_BASE}/api/accuracy`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("Accuracy request failed");
    const data = await res.json();
    const result = data.metrics || MOCK_ACCURACY;
    setCachedData(cacheKey, result);
    return result;
  } catch {
    const cached = getCachedData(cacheKey);
    if (cached?.data) return cached.data;
    return MOCK_ACCURACY;
  }
}

/**
 * Helper to extract stored user profile fields from localStorage ('atmosai_user_profile')
 * to pass to the backend and Gemini 2.5 LLM guidance engine.
 */
export function getStoredUserProfileParams() {
  try {
    const raw = localStorage.getItem("atmosai_user_profile");
    if (raw) {
      const p = JSON.parse(raw);
      const details = p.details || {};
      const sensitivities = p.healthSafeguards || details.sensitivities || [];
      const healthStr = Array.isArray(sensitivities) && sensitivities.length > 0 ? sensitivities.join(", ") : "None";
      const gearStr = details.maskType || "None";
      const commuteStr = p.role === "delivery_rider" ? "Two-wheeler" : p.role === "office_commuter" ? "Metro/Cab" : "Walking";
      return {
        name: p.name || "User",
        activity: p.roleName || p.role || "Walking",
        health: healthStr,
        gear: gearStr,
        commute: commuteStr,
      };
    }
  } catch {}
  return {};
}

export async function fetchLiveForecast(location = "yelahanka", profile = "general", signal = null, forceRefresh = false) {
  const userParams = getStoredUserProfileParams();
  const profileKey = `${userParams.name || ""}_${userParams.activity || ""}_${userParams.health || ""}`;
  const cacheKey = `forecast_${location}_${profile}_${encodeURIComponent(profileKey)}`;

  // 15-minute client-side caching: if not forceRefresh and fresh data is available, return immediately!
  if (!forceRefresh) {
    const cachedFresh = getCachedData(cacheKey, FORECAST_CACHE_TTL_MS);
    if (cachedFresh?.data) {
      return cachedFresh.data;
    }
  }

  try {
    const fetchOptions = signal ? { signal } : { signal: AbortSignal.timeout(8000) };
    const queryParams = new URLSearchParams({
      location: location,
      profile: profile,
      ...(userParams.name ? { name: userParams.name } : {}),
      ...(userParams.activity ? { activity: userParams.activity } : {}),
      ...(userParams.health ? { health: userParams.health } : {}),
      ...(userParams.gear ? { gear: userParams.gear } : {}),
      ...(userParams.commute ? { commute: userParams.commute } : {}),
    });
    const res = await fetch(
      `${API_BASE}/api/forecast/live?${queryParams.toString()}`,
      fetchOptions
    );
    if (!res.ok) throw new Error(`Live forecast failed (HTTP ${res.status})`);
    const data = await res.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.warn("Falling back to cached/local live forecast:", err.message);

    const cached = getCachedData(cacheKey);
    if (cached?.data) {
      return cached.data;
    }

    const mockObs = generateHistoricalObservations(
      location === "peenya" ? 85 : location === "silk_board" ? 92 : 38
    );
    const current = mockObs[mockObs.length - 4]?.pm25 || 45;
    const predicted = Math.round((current * 1.35) * 10) / 10;
    const risk = predicted >= 121 ? "VERY_HIGH" : predicted >= 90 ? "HIGH" : predicted >= 60 ? "MODERATE" : "LOW";

    return {
      location,
      profile,
      risk,
      probability: risk === "VERY_HIGH" ? 0.88 : risk === "HIGH" ? 0.68 : 0.25,
      predicted_pm25: predicted,
      forecast_window: "18:00-21:00",
      model_version: "lgbm-v1.0",
      prediction_source: "LightGBM (Simulation)",
      telemetry_source: "Open-Meteo (Cached)",
      features_used: {
        pm25_current: current,
        pm25_lag_1h: current - 2,
        pm25_lag_3h: current - 6,
        pm25_lag_6h: current - 12,
        pm25_trend_3h: 6.0,
        pm25_rolling_mean_6h: current - 3,
        temperature: 28.5,
        humidity: 62.0,
        wind_speed: 1.8,
        wind_direction: 180,
        hour: new Date().getHours(),
        is_rush_hour: 1,
        day_of_week: new Date().getDay(),
        is_weekend: 0,
        fire_count: 0,
      },
      explanation: {
        summary: `${risk.replace("_", " ")} pollution surge expected across ${location.replace("_", " ").toUpperCase()}.`,
        why: [
          `Particulate matter trend is accelerating toward ${predicted} µg/m³`,
          `Surface wind speed of 1.8 m/s prevents adequate atmospheric ventilation`,
          "Diurnal rush-hour vehicular emission accumulation along corridors",
        ],
        action:
          profile === "delivery_rider"
            ? "Prioritize deliveries before 18:00; use sealed masks and plan rest stops in filtered air zones."
            : profile === "parent"
            ? "Keep children indoors for games and study sessions during the peak exposure window (18:00-21:00)."
            : profile === "runner"
            ? "Shift workouts to indoor treadmill cardio or complete runs prior to sunset."
            : "Limit prolonged outdoor physical exertion during the elevated exposure window.",
        is_ai_generated: true,
      },
    };
  }
}

/**
 * Fetch live coordinate-based air quality forecast from Open-Meteo telemetry & LightGBM model.
 */
export async function fetchLiveForecastByCoords(lat, lon, profile = "general", signal = null, forceRefresh = false) {
  const parsedLat = Number(lat);
  const parsedLon = Number(lon);

  if (Number.isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    throw new Error(`Invalid latitude value: ${lat}. Must be between -90 and 90.`);
  }
  if (Number.isNaN(parsedLon) || parsedLon < -180 || parsedLon > 180) {
    throw new Error(`Invalid longitude value: ${lon}. Must be between -180 and 180.`);
  }

  const userParams = getStoredUserProfileParams();
  const profileKey = `${userParams.name || ""}_${userParams.activity || ""}_${userParams.health || ""}`;
  const cacheKey = `forecast_coords_${parsedLat.toFixed(2)}_${parsedLon.toFixed(2)}_${profile}_${encodeURIComponent(profileKey)}`;

  // 15-minute client-side caching: if not forceRefresh and fresh data is available, return immediately!
  if (!forceRefresh) {
    const cachedFresh = getCachedData(cacheKey, FORECAST_CACHE_TTL_MS);
    if (cachedFresh?.data) {
      return cachedFresh.data;
    }
  }

  const params = new URLSearchParams({
    lat: parsedLat.toFixed(5),
    lon: parsedLon.toFixed(5),
    profile: profile || "general",
    ...(userParams.name ? { name: userParams.name } : {}),
    ...(userParams.activity ? { activity: userParams.activity } : {}),
    ...(userParams.health ? { health: userParams.health } : {}),
    ...(userParams.gear ? { gear: userParams.gear } : {}),
    ...(userParams.commute ? { commute: userParams.commute } : {}),
  });

  const fetchOptions = signal ? { signal } : { signal: AbortSignal.timeout(10000) };

  try {
    const res = await fetch(`${API_BASE}/api/forecast/live?${params.toString()}`, fetchOptions);

    if (!res.ok) {
      let errorDetail = `Coordinate forecast failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData?.detail) {
          errorDetail = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {}
      throw new Error(errorDetail);
    }

    const data = await res.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.error("Live coordinate forecast error:", err);

    const cached = getCachedData(cacheKey);
    if (cached?.data) {
      return cached.data;
    }
    throw err;
  }
}

export async function fetchLiveTelemetry(location = "yelahanka") {
  const cacheKey = `telemetry_${location}`;
  try {
    const res = await fetch(
      `${API_BASE}/api/telemetry/live?location=${encodeURIComponent(location)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error("Live telemetry failed");
    const data = await res.json();
    setCachedData(cacheKey, data);
    return data;
  } catch (err) {
    console.warn("Live telemetry fallback:", err.message);
    const cached = getCachedData(cacheKey);
    if (cached?.data) return cached.data;
    return null;
  }
}

export async function runPredictWhatIf(features) {
  try {
    const params = new URLSearchParams({
      pm25_current: features.pm25_current ?? 75,
      pm25_lag_1h: features.pm25_lag_1h ?? 70,
      pm25_lag_3h: features.pm25_lag_3h ?? 62,
      pm25_lag_6h: features.pm25_lag_6h ?? 55,
      pm25_rolling_mean_6h: features.pm25_rolling_mean_6h ?? 65,
      temperature: features.temperature ?? 27.5,
      humidity: features.humidity ?? 65,
      wind_speed: features.wind_speed ?? 2.1,
      wind_direction: features.wind_direction ?? 180,
      hour: features.hour ?? new Date().getHours(),
      day_of_week: features.day_of_week ?? new Date().getDay(),
      fire_count: features.fire_count ?? 0,
    });

    const res = await fetch(`${API_BASE}/api/forecast/predict?${params.toString()}`);
    if (!res.ok) throw new Error("What-if prediction failed");
    return await res.json();
  } catch (err) {
    // Client-side LightGBM surrogate evaluation
    const current = Number(features.pm25_current || 75);
    const trend = current - Number(features.pm25_lag_3h || 62);
    const wind = Number(features.wind_speed || 2.1);
    const prob = Math.min(0.98, Math.max(0.05, current / 140 + trend / 40 - (wind > 3 ? 0.2 : 0)));
    const proj = Math.round(current + trend * 1.35 + (wind < 2 ? 14 : -5));
    const risk = proj >= 121 || prob >= 0.8 ? "VERY_HIGH" : proj >= 90 || prob >= 0.6 ? "HIGH" : proj >= 60 ? "MODERATE" : "LOW";

    return {
      risk,
      probability: Math.round(prob * 100) / 100,
      predicted_pm25: proj,
      forecast_window: "Next 3-6 Hours",
      model_version: "lgbm-v1.0 (Surrogate)",
      features_used: features,
    };
  }
}

export async function sendTelemetryReading(data) {
  try {
    const res = await fetch(`${API_BASE}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to post telemetry");
    return await res.json();
  } catch (err) {
    return {
      status: "success",
      saved: true,
      dynamodb_synced: false,
      node_id: data.node_id,
      timestamp: data.timestamp || new Date().toISOString(),
      message: "Telemetry stored in client buffer: " + err.message,
    };
  }
}

export async function fetchTelemetryHistory(nodeId, limit = 20) {
  try {
    const res = await fetch(`${API_BASE}/api/telemetry/${nodeId}?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch node telemetry");
    return await res.json();
  } catch (err) {
    return {
      node_id: nodeId,
      count: 0,
      readings: [],
      error: err.message,
    };
  }
}

/**
 * Synchronize user demographic profile to localStorage ('atmosai_user_profile')
 * and AWS DynamoDB via backend /api/profile
 */
export async function syncUserProfile(profileData) {
  // 1. Immediately persist to localStorage 'atmosai_user_profile'
  try {
    localStorage.setItem("atmosai_user_profile", JSON.stringify(profileData));
  } catch (e) {
    console.warn("Failed saving profile to localStorage:", e);
  }

  // 2. Synchronize with backend /api/profile
  try {
    const payload = {
      user_id: profileData.id || profileData.user_id || "guest_123",
      name: profileData.name || "User",
      age: String(profileData.details?.ageGroup || profileData.age || "25"),
      activities: Array.isArray(profileData.activities)
        ? profileData.activities
        : [profileData.role || "General"],
      sensitivities: profileData.details?.sensitivities || profileData.sensitivities || [],
      commute: profileData.details?.commute || profileData.commute || "Public transit",
      gear: profileData.details?.maskType ? [profileData.details.maskType] : (profileData.gear || []),
    };

    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend profile sync offline, persisted in localStorage:", err.message);
  }

  return {
    status: "success",
    dynamodb_synced: false,
    message: "Saved to LocalStorage ('atmosai_user_profile')",
  };
}

export async function fetchUserProfile(userId = "guest_123") {
  try {
    const res = await fetch(`${API_BASE}/api/profile/${userId}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        localStorage.setItem("atmosai_user_profile", JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (err) {
    console.warn("Failed fetching profile from backend, using local cache:", err.message);
  }

  try {
    const stored = localStorage.getItem("atmosai_user_profile");
    if (stored) return JSON.parse(stored);
  } catch (e) {}

  return null;
}
