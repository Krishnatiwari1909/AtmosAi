import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronDown,
  Target,
  AlertTriangle,
  Clock,
  Sparkles,
  Cpu,
} from "lucide-react";
import { MOCK_ACCURACY } from "../../data/mockData";

export default function StatsScreen({ onBack }) {
  const [period, setPeriod] = useState("Last 30 days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const periods = ["Last 7 days", "Last 14 days", "Last 30 days", "Last 90 days"];

  // Points for Forecast vs Actual chart matching screenshot:
  // Actual (blue) vs Predicted (red)
  const chartPoints = [
    { label: "Apr 1", actual: 45, pred: 50 },
    { label: "Apr 4", actual: 60, pred: 65 },
    { label: "Apr 8", actual: 88, pred: 82 },
    { label: "Apr 11", actual: 115, pred: 108 },
    { label: "Apr 15", actual: 135, pred: 142 },
    { label: "Apr 18", actual: 98, pred: 105 },
    { label: "Apr 22", actual: 145, pred: 138 },
    { label: "Apr 26", actual: 110, pred: 118 },
    { label: "Apr 30", actual: 80, pred: 88 },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
              aria-label="Back"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Model Performance
          </h1>
        </div>

        {/* Dropdown Selector */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 focus:outline-none"
          >
            <span>{period}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1 z-30">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors ${
                    period === p ? "text-blue-600 font-bold bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 3 Metric Cards */}
      <div className="space-y-3">
        {/* Card 1: Severe events detected */}
        <div className="app-card p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Target className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-500">
                Severe events detected
              </h2>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-extrabold text-slate-900">
                  {MOCK_ACCURACY.severe_events_detected} / {MOCK_ACCURACY.severe_events_total}
                </span>
              </div>
              <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {MOCK_ACCURACY.detection_rate_pct}% detection rate
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: False alarms */}
        <div className="app-card p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-500">
                False alarms
              </h2>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
                {MOCK_ACCURACY.false_alarms}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Lower is better
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Average warning lead time */}
        <div className="app-card p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-slate-500">
                Average warning lead time
              </h2>
              <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
                {MOCK_ACCURACY.avg_lead_time_hours} hours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast vs Actual Chart Card */}
      <div className="app-card p-4 space-y-3 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800">
            Forecast vs Actual
          </h2>
          {/* Chart Legend */}
          <div className="flex items-center gap-3 text-[10px] font-semibold">
            <div className="flex items-center gap-1 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Actual PM2.5</span>
            </div>
            <div className="flex items-center gap-1 text-rose-500">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Predicted PM2.5</span>
            </div>
          </div>
        </div>

        {/* Responsive Line Chart */}
        <div className="relative w-full h-44 pt-2">
          <svg viewBox="0 0 320 150" className="w-full h-full overflow-visible">
            {/* Grid horizontal lines */}
            {[0, 50, 100, 150, 200].map((val) => {
              const y = 130 - (val / 200) * 115;
              return (
                <g key={val}>
                  <line
                    x1="25"
                    y1={y}
                    x2="315"
                    y2={y}
                    stroke="#F1F5F9"
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

            {/* Actual Path (Blue dots connected) */}
            <path
              d={chartPoints
                .map((pt, i) => {
                  const x = 30 + i * 35;
                  const y = 130 - (pt.actual / 200) * 115;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* Predicted Path (Red line) */}
            <path
              d={chartPoints
                .map((pt, i) => {
                  const x = 30 + i * 35;
                  const y = 130 - (pt.pred / 200) * 115;
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Data Points */}
            {chartPoints.map((pt, i) => {
              const x = 30 + i * 35;
              const yAct = 130 - (pt.actual / 200) * 115;
              const yPred = 130 - (pt.pred / 200) * 115;
              return (
                <g key={i}>
                  <circle cx={x} cy={yAct} r="2.5" fill="#2563EB" />
                  <circle cx={x} cy={yPred} r="2.5" fill="#EF4444" />
                </g>
              );
            })}

            {/* X-axis date labels */}
            {["Apr 1", "Apr 8", "Apr 15", "Apr 22", "Apr 30"].map((lbl, idx) => {
              const x = 30 + idx * 70;
              return (
                <text
                  key={lbl}
                  x={x}
                  y="145"
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="middle"
                  fontFamily="inherit"
                >
                  {lbl}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
