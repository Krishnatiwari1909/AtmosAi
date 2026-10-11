import React from "react";
import { Smartphone, Monitor, Sparkles, RefreshCw } from "lucide-react";

export default function ScreenSwitcherBar({
  currentScreen,
  onNavigate,
  isDeviceFrame,
  onToggleDeviceFrame,
  dataSourceMode = "live",
  onToggleDataSourceMode,
  onRefresh,
  isRefreshing,
}) {
  const screens = [
    { id: "home", label: "1. Home" },
    { id: "profile", label: "2. Profile" },
    { id: "forecast", label: "3. Forecast" },
    { id: "why", label: "4. Why?" },
    { id: "map", label: "5. Map" },
    { id: "stats", label: "6. Stats" },
    { id: "alerts", label: "7. Alerts" },
    { id: "settings", label: "8. Settings" },
    { id: "location", label: "9. Location" },
    { id: "about", label: "10. About" },
    { id: "login", label: "🔐 Auth / Login" },
    { id: "onboarding", label: "✨ Role Wizard" },
  ];

  return (
    <aside aria-label="Desktop Preview Controls" className="w-full bg-slate-900/95 backdrop-blur-md text-white py-2.5 px-4 border-b border-slate-800 z-40 select-none shadow-md hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Label */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
            A
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-100 hidden lg:inline">
            AtmosAi 10-Screen PWA Navigator
          </span>
        </div>

        {/* 10 Screen Selector Pills */}
        <nav aria-label="Screen Navigation" className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {screens.map((s) => {
            const isActive = currentScreen === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all focus:outline-none ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* View Toggle, Data Source & Refresh */}
        <div className="flex items-center gap-2">
          {/* Live vs Demo Toggle */}
          <button
            onClick={onToggleDataSourceMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all focus:outline-none ${
              dataSourceMode === "live"
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60"
                : "bg-amber-950/60 border-amber-500/50 text-amber-300 hover:bg-amber-900/60"
            }`}
            title="Toggle between Live Telemetry and 142 AQI Surge Scenario"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dataSourceMode === "live" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="hidden sm:inline">
              {dataSourceMode === "live" ? "Live Telemetry" : "Surge Demo"}
            </span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors focus:outline-none"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onToggleDeviceFrame}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors focus:outline-none"
            title="Toggle between Mobile Frame and Full Width view"
          >
            {isDeviceFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Wide View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
