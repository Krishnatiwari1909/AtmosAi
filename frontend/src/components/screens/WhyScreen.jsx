import React from "react";
import {
  ChevronLeft,
  Bot,
  Wind,
  Droplets,
  Car,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function WhyScreen({ onBack }) {
  const factors = [
    {
      title: "Low Wind Speed",
      icon: Wind,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      description:
        "Lower wind speed can cause pollutants to disperse slowly, leading to higher concentrations.",
    },
    {
      title: "High Humidity",
      icon: Droplets,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      description:
        "Higher humidity can increase the concentration of fine particulate matter (PM2.5).",
    },
    {
      title: "Evening Traffic",
      icon: Car,
      iconColor: "text-rose-500",
      bgColor: "bg-rose-50",
      description:
        "Increased vehicle emissions expected during evening rush hours.",
    },
    {
      title: "Rising Trend",
      icon: TrendingUp,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50",
      description:
        "PM2.5 levels have been increasing over the past few hours.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center space-x-2 pt-1">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>
      </header>

      {/* Screen Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Why This Forecast?
        </h1>
      </div>

      {/* Top Hero Card: AtmosAi Explanation Powered by AWS Bedrock */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/20">
            <Bot className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-tight">
              AtmosAi Explanation
            </h2>
            <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> Powered by AWS Bedrock
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Pollution is expected to rise due to a combination of weather conditions, higher emissions, and local factors.
        </p>
      </div>

      {/* 4 Factor Breakdown Cards */}
      <div className="space-y-3">
        {factors.map((factor, idx) => {
          const Icon = factor.icon;
          return (
            <div
              key={idx}
              className="app-card p-4 flex items-start gap-3.5 border border-slate-200/80 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-xl ${factor.bgColor} ${factor.iconColor} flex items-center justify-center flex-shrink-0 mt-0.5`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">
                  {factor.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {factor.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200/60 text-center">
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This explanation is generated using AWS Bedrock based on forecast data and environmental factors.
        </p>
      </div>
    </div>
  );
}
