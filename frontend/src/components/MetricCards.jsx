import React from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Wind,
  Thermometer,
  Droplets,
  AlertOctagon,
  Clock,
  Compass,
  Flame,
} from "lucide-react";

function getAqiCategory(pm25) {
  if (pm25 <= 30) return { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (pm25 <= 60) return { label: "Satisfactory", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" };
  if (pm25 <= 90) return { label: "Moderate", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  if (pm25 <= 120) return { label: "Poor", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
  if (pm25 <= 250) return { label: "Very Poor", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  return { label: "Severe", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" };
}

export default function MetricCards({ forecast, telemetry }) {
  const features = forecast?.features_used || {};
  const currentPm25 =
    telemetry?.pm25 ?? features?.pm25_current ?? 45.0;
  const currentPm10 = telemetry?.pm10 ?? Math.round(currentPm25 * 1.6);
  const predictedPm25 = forecast?.predicted_pm25 ?? Math.round(currentPm25 * 1.3);
  const probability = Math.round((forecast?.probability ?? 0.35) * 100);
  const risk = forecast?.risk ?? "MODERATE";

  const trend3h = features?.pm25_trend_3h ?? Math.round((predictedPm25 - currentPm25) * 0.4 * 10) / 10;
  const isRising = trend3h >= 0;

  const temp = telemetry?.temperature ?? features?.temperature ?? 27.5;
  const humidity = telemetry?.humidity ?? features?.humidity ?? 64.0;
  const windSpeed = telemetry?.wind_speed ?? features?.wind_speed ?? 2.1;
  const windDir = telemetry?.wind_direction ?? features?.wind_direction ?? 180;
  const isRushHour = features?.is_rush_hour === 1;

  const aqiCategory = getAqiCategory(currentPm25);

  const riskColors = {
    LOW: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" },
    MODERATE: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500" },
    HIGH: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", bar: "bg-orange-500" },
    VERY_HIGH: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", bar: "bg-rose-500" },
  };
  const activeRiskStyle = riskColors[risk] || riskColors.MODERATE;

  const surgeDeltaPct =
    currentPm25 > 0 ? Math.round(((predictedPm25 - currentPm25) / currentPm25) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Current PM2.5 Live Observation */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Current Telemetry
          </span>
          <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-md border ${aqiCategory.bg} ${aqiCategory.color} ${aqiCategory.border}`}>
            {aqiCategory.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
            {currentPm25}
          </span>
          <span className="text-xs font-medium text-slate-400">µg/m³</span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <span>PM10:</span>
            <span className="font-mono text-slate-200">{currentPm10} µg/m³</span>
          </div>

          <div className={`flex items-center gap-1 font-mono font-medium ${isRising ? "text-rose-400" : "text-emerald-400"}`}>
            {isRising ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isRising ? `+${trend3h}` : `${trend3h}`} /3h</span>
          </div>
        </div>
      </div>

      {/* Card 2: LightGBM 3h Forecast Surge */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Predicted Surge (3h)
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono text-amber-300 bg-amber-950/40 rounded border border-amber-800/40">
            {forecast?.forecast_window || "18:00-21:00"}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 tracking-tight font-mono">
            {predictedPm25}
          </span>
          <span className="text-xs font-medium text-slate-400">µg/m³</span>
          <span className={`ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded ${
            surgeDeltaPct > 0 ? "bg-rose-950/60 text-rose-300" : "bg-emerald-950/60 text-emerald-300"
          }`}>
            {surgeDeltaPct > 0 ? `+${surgeDeltaPct}%` : `${surgeDeltaPct}%`}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Engine: LightGBM v1.0</span>
          <span className="font-mono text-slate-300">15-Feature Vector</span>
        </div>
      </div>

      {/* Card 3: Surge Risk & Probability */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-rose-400" />
            Surge Risk Probability
          </span>
          <span className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-md border ${activeRiskStyle.bg} ${activeRiskStyle.text} ${activeRiskStyle.border}`}>
            {risk.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${activeRiskStyle.text}`}>
            {probability}%
          </span>
          <span className="text-xs text-slate-400">confidence</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${activeRiskStyle.bar}`}
            style={{ width: `${Math.min(100, Math.max(5, probability))}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>0% Low</span>
          <span>Threshold &gt;90 µg/m³</span>
          <span>100% Extreme</span>
        </div>
      </div>

      {/* Card 4: Atmospheric Dispersion & Weather */}
      <div className="rounded-2xl glass-panel p-5 border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-teal-400" />
            Atmospheric Dispersion
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
            windSpeed < 2.0 ? "bg-rose-950/50 text-rose-300" : "bg-emerald-950/50 text-emerald-300"
          }`}>
            {windSpeed < 2.0 ? "Stagnant (Trap)" : "Ventilated"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind Speed</span>
            </div>
            <span className="text-sm font-bold font-mono text-white">{windSpeed} m/s</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direction</span>
            </div>
            <span className="text-sm font-bold font-mono text-white">{windDir}°</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span>Temperature</span>
            </div>
            <span className="text-sm font-bold font-mono text-white">{temp}°C</span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 mb-0.5">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Humidity</span>
            </div>
            <span className="text-sm font-bold font-mono text-white">{humidity}%</span>
          </div>
        </div>

      </div>

    </div>
  );
}
