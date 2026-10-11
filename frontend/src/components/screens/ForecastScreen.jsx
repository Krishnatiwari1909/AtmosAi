import React, { useState } from "react";
import {
  ChevronLeft,
  Share2,
  ArrowUpRight,
  Footprints,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Navigation,
} from "lucide-react";

export default function ForecastScreen({
  location = "Bengaluru",
  profile = "runner",
  onBack,
  onOpenWhy,
  forecastData,
  isUsingCurrentLocation = false,
  currentCoords = null,
}) {
  const [activeMetric, setActiveMetric] = useState("pm25");

  const isGps = isUsingCurrentLocation || forecastData?.isCurrentLocation;
  const telemetrySource =
    forecastData?.telemetrySource ||
    (isGps ? "Open-Meteo Air Quality (Live CAMS model/observations)" : "Open-Meteo");

  const timeline = forecastData?.projectionTimeline || [
    { time: "Now", pm25: 82, aqi: 142, level: "Poor", color: "#F97316", dotColor: "bg-amber-500" },
    { time: "+1h", pm25: 96, aqi: 160, level: "Poor", color: "#F97316", dotColor: "bg-amber-500" },
    { time: "+2h", pm25: 118, aqi: 185, level: "Unhealthy", color: "#EF4444", dotColor: "bg-red-500" },
    { time: "+3h", pm25: 137, aqi: 210, level: "Unhealthy", color: "#EF4444", dotColor: "bg-red-500" },
  ];

  const profileDisplay = {
    runner: "Runner",
    parent: "Parent",
    delivery_rider: "Delivery Rider",
    general: "General Public",
    asthma_patient: "Respiratory Sensitive",
  }[profile] || "Runner";

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "AtmosAi Forecast",
        text: `Air quality alert for ${location}: High risk predicted between 6:00 PM – 9:00 PM.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
        <button
          onClick={handleShare}
          className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 stroke-[2]" />
        </button>
      </header>

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Air Quality Forecast
        </h1>
        <div className="flex items-center gap-1.5 flex-wrap mt-1">
          <div className="flex items-center gap-1 text-xs text-slate-700 font-semibold">
            {isGps ? (
              <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            ) : (
              <span className="text-blue-600">📍</span>
            )}
            <span>{location}</span>
          </div>
          {isGps && (
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
              GPS Location {currentCoords?.accuracy ? `(±${currentCoords.accuracy}m)` : ""}
            </span>
          )}
          <span className="text-xs text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">{profileDisplay}</span>
        </div>

        {/* Observation & Source Meta */}
        <p className="text-[10px] text-slate-400 mt-1">
          Source: {telemetrySource} • Model: LightGBM v1.0
        </p>
      </div>

      {/* High Risk Callout Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-100 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-rose-500/20">
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-rose-700">
            High Risk
          </h2>
          <p className="text-[11px] text-rose-600/90 mt-0.5 leading-snug">
            Air quality is likely to worsen from 6:00 PM to 9:00 PM.
          </p>
        </div>
      </div>

      {/* Segmented Metric Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveMetric("pm25")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeMetric === "pm25"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          PM2.5
        </button>
        <button
          onClick={() => setActiveMetric("aqi")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeMetric === "aqi"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          AQI
        </button>
        <button
          onClick={() => setActiveMetric("pollutants")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeMetric === "pollutants"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Other Pollutants
        </button>
      </div>

      {/* Forecast Line Chart Card */}
      <div className="app-card p-4 space-y-2 border border-slate-200/80 shadow-sm">
        <div className="relative w-full h-44 pt-2">
          {/* Custom Responsive SVG Chart with smooth curve & gradient */}
          <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((val, i) => {
              const y = 130 - (val / 200) * 110;
              return (
                <g key={val}>
                  <line
                    x1="25"
                    y1={y}
                    x2="310"
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x="2"
                    y={y + 3}
                    fontSize="9"
                    fill="#94A3B8"
                    fontFamily="inherit"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {(() => {
              const maxVal = activeMetric === "aqi" ? 300 : 200;
              const pts = timeline.map((item, idx) => {
                const x = [45, 130, 215, 295][idx] || 45;
                const val = activeMetric === "aqi" ? (item.aqi || 100) : (item.pm25 || 50);
                const y = Math.max(30, Math.min(125, 130 - (val / maxVal) * 105));
                return { x, y, val, label: item.time };
              });

              const pathArea = `M ${pts[0].x} ${pts[0].y} ` +
                pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ") +
                ` L ${pts[pts.length - 1].x} 130 L ${pts[0].x} 130 Z`;

              const pathLine = `M ${pts[0].x} ${pts[0].y} ` +
                pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");

              return (
                <>
                  <path d={pathArea} fill="url(#forecastFill)" />
                  <path
                    d={pathLine}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {pts.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#FFFFFF"
                        stroke="#EF4444"
                        strokeWidth="2.5"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        fontSize="10"
                        fontWeight="bold"
                        fill="#0F172A"
                        textAnchor="middle"
                        fontFamily="inherit"
                      >
                        {pt.val}
                      </text>
                      <text
                        x={pt.x}
                        y="144"
                        fontSize="10"
                        fill="#64748B"
                        textAnchor="middle"
                        fontFamily="inherit"
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Hourly Breakdown Table Card */}
      <div className="app-card overflow-hidden border border-slate-200/80 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold">
              <th className="py-2.5 px-4 font-medium">Time</th>
              <th className="py-2.5 px-3 font-medium">PM2.5 (µg/m³)</th>
              <th className="py-2.5 px-3 font-medium">AQI</th>
              <th className="py-2.5 px-4 font-medium">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {timeline.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-2.5 px-4 font-semibold text-slate-900">{row.time}</td>
                <td className="py-2.5 px-3 font-bold text-slate-800">{row.pm25}</td>
                <td className="py-2.5 px-3 text-slate-600">{row.aqi}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${row.dotColor}`} />
                    <span className="text-[11px] font-semibold text-slate-700">
                      {row.level}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommended Action Card */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-start gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Footprints className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-emerald-900">
            Recommended Action
          </h3>
          <p className="text-xs text-emerald-800/90 leading-relaxed font-medium">
            Avoid outdoor running between 6 PM – 9 PM. Consider an indoor workout instead.
          </p>
        </div>
      </div>

      {/* Button to "Why This Forecast?" */}
      <button
        onClick={onOpenWhy}
        className="w-full app-card p-3.5 flex items-center justify-between text-left border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/20 transition-all group focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Why This Forecast?
            </h3>
            <p className="text-[11px] text-slate-400">
              Powered by AWS Bedrock & Environmental Factors
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </button>
    </div>
  );
}
