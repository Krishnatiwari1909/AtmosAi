import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, Info, ShieldAlert, Sparkles } from "lucide-react";

export default function ForecastChart({ observations, forecast, locationName }) {
  const [activeMetric, setActiveMetric] = useState("pm25"); // "pm25" or "all"

  // Process observations into a chart dataset
  const chartData = (observations || []).map((obs) => {
    return {
      time: obs.timestamp,
      pm25: obs.pm25,
      pm10: obs.pm10,
      isForecast: obs.type === "forecast",
      rollingMean: obs.rollingMean || null,
    };
  });

  const predictedPm25 = forecast?.predicted_pm25;
  const currentPm25 = forecast?.features_used?.pm25_current || 45;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
          <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-slate-800 pb-1">
            <span className="font-semibold text-slate-200">{label}</span>
            {data.isForecast && (
              <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold text-amber-300 bg-amber-950/60 rounded border border-amber-800/40">
                LightGBM Horizon
              </span>
            )}
          </div>
          <div className="space-y-1 font-mono">
            <div className="flex items-center justify-between gap-4 text-cyan-300">
              <span>PM2.5:</span>
              <span className="font-bold">{data.pm25} µg/m³</span>
            </div>
            {data.pm10 && (
              <div className="flex items-center justify-between gap-4 text-teal-300">
                <span>PM10:</span>
                <span className="font-bold">{data.pm10} µg/m³</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl glass-panel p-5 sm:p-6 border border-slate-800/80 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Predictive Pollution Trajectory & Surge Horizon
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/50 rounded border border-cyan-800/40">
              3h Horizon
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rolling telemetry vs LightGBM early-warning surge projection for {locationName || "Selected Node"}
          </p>
        </div>

        {/* Legend / Info Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Telemetry (Past 24h)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 border-dashed" />
            <span>ML Horizon (+3h)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300">
            <span className="w-2 h-0.5 bg-rose-400" />
            <span>High Risk (&ge;90 µg/m³)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              domain={[0, (dataMax) => Math.max(120, Math.ceil(dataMax * 1.15))]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* CPCB High Risk Threshold line at 90 */}
            <ReferenceLine
              y={90}
              stroke="#f43f5e"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "CPCB High Risk (90 µg/m³)",
                fill: "#f43f5e",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />

            <Area
              type="monotone"
              dataKey="pm25"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#pm25Gradient)"
              activeDot={{ r: 5, fill: "#22d3ee", stroke: "#083344", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Diagnostic Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Evaluation Horizon: LightGBM evaluates rolling 6h mean + 3h rate-of-change momentum.</span>
        </div>
        <span className="font-mono text-slate-300">
          Source: Open-Meteo Hourly API + Localized Bengaluru Nodes
        </span>
      </div>
    </div>
  );
}
