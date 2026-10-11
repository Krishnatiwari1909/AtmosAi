import React, { useState, useEffect } from "react";
import {
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Wind,
  Gauge,
  Thermometer,
  Droplets,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { runPredictWhatIf } from "../api/atmosApi";

export default function ScenarioSimulator() {
  const [params, setParams] = useState({
    pm25_current: 75,
    pm25_lag_1h: 68,
    pm25_lag_3h: 58,
    pm25_lag_6h: 50,
    pm25_rolling_mean_6h: 62,
    temperature: 28,
    humidity: 65,
    wind_speed: 1.8,
    wind_direction: 180,
    hour: 18,
    day_of_week: 2,
    fire_count: 0,
    is_rush_hour: 1,
  });

  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Run prediction on parameter change
  const executePrediction = async (currentParams) => {
    setIsLoading(true);
    try {
      const res = await runPredictWhatIf(currentParams);
      setPrediction(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executePrediction(params);
  }, []);

  const handleParamChange = (key, value) => {
    const updated = { ...params, [key]: value };
    // Auto-update lags to keep trend realistic
    if (key === "pm25_current") {
      const delta = value - params.pm25_current;
      updated.pm25_lag_1h = Math.max(10, Math.round(updated.pm25_lag_1h + delta * 0.7));
      updated.pm25_lag_3h = Math.max(10, Math.round(updated.pm25_lag_3h + delta * 0.5));
    }
    setParams(updated);
    executePrediction(updated);
  };

  const handleReset = () => {
    const defaults = {
      pm25_current: 75,
      pm25_lag_1h: 68,
      pm25_lag_3h: 58,
      pm25_lag_6h: 50,
      pm25_rolling_mean_6h: 62,
      temperature: 28,
      humidity: 65,
      wind_speed: 1.8,
      wind_direction: 180,
      hour: 18,
      day_of_week: 2,
      fire_count: 0,
      is_rush_hour: 1,
    };
    setParams(defaults);
    executePrediction(defaults);
  };

  const setPreset = (preset) => {
    let p = { ...params };
    if (preset === "rush_hour_inversion") {
      p = {
        ...params,
        pm25_current: 88,
        pm25_lag_3h: 60,
        wind_speed: 1.1,
        temperature: 24,
        humidity: 78,
        hour: 19,
        is_rush_hour: 1,
      };
    } else if (preset === "clean_monsoon_gust") {
      p = {
        ...params,
        pm25_current: 28,
        pm25_lag_3h: 42,
        wind_speed: 6.5,
        temperature: 25,
        humidity: 90,
        hour: 14,
        is_rush_hour: 0,
      };
    } else if (preset === "industrial_stagnation") {
      p = {
        ...params,
        pm25_current: 125,
        pm25_lag_3h: 90,
        wind_speed: 0.8,
        temperature: 31,
        humidity: 45,
        hour: 20,
        is_rush_hour: 1,
        fire_count: 5,
      };
    }
    setParams(p);
    executePrediction(p);
  };

  const risk = prediction?.risk || "MODERATE";
  const probPct = Math.round((prediction?.probability || 0.4) * 100);
  const projectedPm25 = prediction?.predicted_pm25 || 85;

  const riskColors = {
    LOW: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" },
    MODERATE: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500" },
    HIGH: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", bar: "bg-orange-500" },
    VERY_HIGH: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", bar: "bg-rose-500" },
  };
  const activeRisk = riskColors[risk] || riskColors.MODERATE;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Machine Learning "What-If" Scenario Simulator
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate hypothetical microclimates, rush-hour exhaust density, and wind dispersion bottlenecks to observe
              how the trained LightGBM model classifies imminent surge probabilities in real time.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPreset("rush_hour_inversion")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-800/40 transition cursor-pointer"
            >
              Preset: Evening Inversion
            </button>
            <button
              onClick={() => setPreset("industrial_stagnation")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-800/40 transition cursor-pointer"
            >
              Preset: Stagnant Industrial
            </button>
            <button
              onClick={() => setPreset("clean_monsoon_gust")}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-800/40 transition cursor-pointer"
            >
              Preset: High Wind Gust
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
              title="Reset sliders"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sliders on Left, Live Inference Engine on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Control Sliders */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-slate-800 space-y-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Environmental Feature Controls
          </h4>

          {/* Slider 1: PM2.5 Current */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-300">Current PM2.5 Reading</span>
              <span className="font-mono text-cyan-400 font-bold">{params.pm25_current} µg/m³</span>
            </div>
            <input
              type="range"
              min="15"
              max="220"
              step="1"
              value={params.pm25_current}
              onChange={(e) => handleParamChange("pm25_current", Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>15 (Clean)</span>
              <span>90 (CPCB High)</span>
              <span>220 (Hazardous)</span>
            </div>
          </div>

          {/* Slider 2: Surface Wind Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                Surface Wind Speed (Dispersion Index)
              </span>
              <span className="font-mono text-teal-400 font-bold">{params.wind_speed} m/s</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="8.0"
              step="0.1"
              value={params.wind_speed}
              onChange={(e) => handleParamChange("wind_speed", Number(e.target.value))}
              className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.4 m/s (Severe Stagnation)</span>
              <span>2.0 m/s (Threshold)</span>
              <span>8.0 m/s (High Ventilation)</span>
            </div>
          </div>

          {/* Row: Temperature & Humidity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                  Temperature
                </span>
                <span className="font-mono text-orange-400 font-bold">{params.temperature}°C</span>
              </div>
              <input
                type="range"
                min="14"
                max="44"
                step="1"
                value={params.temperature}
                onChange={(e) => handleParamChange("temperature", Number(e.target.value))}
                className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Relative Humidity
                </span>
                <span className="font-mono text-blue-400 font-bold">{params.humidity}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="1"
                value={params.humidity}
                onChange={(e) => handleParamChange("humidity", Number(e.target.value))}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Row: Hour of Day & Fire Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Hour of Day (IST)
                </span>
                <span className="font-mono text-indigo-400 font-bold">{params.hour}:00</span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                step="1"
                value={params.hour}
                onChange={(e) => handleParamChange("hour", Number(e.target.value))}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  Upwind Fire Hotspots
                </span>
                <span className="font-mono text-rose-400 font-bold">{params.fire_count}</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={params.fire_count}
                onChange={(e) => handleParamChange("fire_count", Number(e.target.value))}
                className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Live LightGBM Inference Output */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-slate-800 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-amber-400" />
                Live Model Inference
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                LightGBM v1.0
              </span>
            </div>

            {/* Risk Category Badge */}
            <div className={`p-4 rounded-xl border mb-5 ${activeRisk.bg} ${activeRisk.border}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Classified Surge Risk
                </span>
                <span className={`text-xs font-extrabold uppercase font-mono px-2 py-0.5 rounded ${activeRisk.text} bg-slate-950/60`}>
                  {risk.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {risk === "VERY_HIGH"
                  ? "Critical particulate surge imminent within 3-4 hours. Severe health advisory triggered."
                  : risk === "HIGH"
                  ? "High surge probability. Early intervention window active."
                  : risk === "MODERATE"
                  ? "Elevated baseline without severe spike trajectory."
                  : "Normal ambient conditions. Low surge vector."}
              </p>
            </div>

            {/* Key Numbers */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Projected PM2.5 (+3h)</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
                    {projectedPm25}
                  </span>
                  <span className="text-xs text-slate-400">µg/m³</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Surge Probability</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl sm:text-3xl font-extrabold font-mono ${activeRisk.text}`}>
                    {probPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Probability Gauge Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Model Confidence</span>
                <span className="text-white font-bold">{probPct}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${activeRisk.bar}`}
                  style={{ width: `${Math.min(100, Math.max(5, probPct))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Model Vector Diagnostics */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>3h Trend Momentum:</span>
              <span className="text-slate-200">
                {(params.pm25_current - params.pm25_lag_3h > 0 ? "+" : "")}
                {(params.pm25_current - params.pm25_lag_3h).toFixed(1)} µg/m³
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ventilation State:</span>
              <span className={params.wind_speed < 2.0 ? "text-rose-400" : "text-emerald-400"}>
                {params.wind_speed < 2.0 ? "Boundary Layer Inversion Trap" : "Adequate Dispersion"}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
