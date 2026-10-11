import React from "react";

export default function AQIGauge({
  aqi = 142,
  pm25 = 82,
  level = "Poor",
  maxAqi = 300,
}) {
  // Arc calculation: Semi-circle from 180° (left) to 0° (right)
  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 100;

  // Perimeter of semi-circle: PI * radius
  const arcLength = Math.PI * radius;

  // Fraction of AQI filled (clamped between 0 and 1)
  const fraction = Math.min(Math.max(aqi / maxAqi, 0.05), 1);
  const strokeDashoffset = arcLength * (1 - fraction);

  // Badge colors based on level
  const getBadgeStyle = (lvl) => {
    switch (lvl?.toLowerCase()) {
      case "good":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "moderate":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "poor":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "unhealthy":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "very poor":
      case "very unhealthy":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative w-[220px] h-[115px] flex items-center justify-center overflow-visible">
        <svg
          viewBox="0 0 220 120"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="aqiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="25%" stopColor="#EAB308" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="75%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Background track arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active progress arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#aqiGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute top-10 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-800 tracking-tight leading-none">
            {aqi}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            AQI
          </span>
          <div
            className={`mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
              level
            )}`}
          >
            {level}
          </div>
        </div>
      </div>

      {/* Sub PM2.5 metric */}
      <div className="mt-2 text-center">
        <span className="text-sm font-bold text-slate-700">
          PM2.5 {pm25} µg/m³
        </span>
      </div>
    </div>
  );
}
