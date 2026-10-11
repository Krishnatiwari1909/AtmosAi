import React from "react";
import {
  Radio,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowUpRight,
  Wifi,
} from "lucide-react";

export default function NodeNetwork({
  locations,
  selectedLocation,
  onSelectLocation,
  currentForecast,
}) {
  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                IoT Sensor Mesh & Spatial Monitoring Network
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Simulated and live edge sensor hardware broadcasting localized Bengaluru diurnal particulate telemetry
              over MQTT and Open-Meteo ingestion pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{locations.length} Nodes Online</span>
          </div>
        </div>
      </div>

      {/* Grid of Sensor Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocation;
          const isPeenya = loc.id === "peenya";
          const isSilkBoard = loc.id === "silk_board";
          const isYelahanka = loc.id === "yelahanka";

          // Calculate estimated node values
          let baseline = loc.baselinePm25 || 45;
          let nodeRisk = baseline >= 90 ? "HIGH" : baseline >= 60 ? "MODERATE" : "LOW";
          let nodeTag = loc.type || "Urban Monitor";

          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? "bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-slate-900/50 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Active Selection Indicator */}
              {isSelected && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg font-mono">
                  Active Focus
                </div>
              )}

              {/* Node Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                      {loc.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {loc.region || "Bengaluru Metro"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Context Tag & Node Type */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {nodeTag}
                </span>

                {isSilkBoard && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    Rush-Hour Surge Sensitive
                  </span>
                )}
                {isPeenya && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/40">
                    Industrial Exhaust Zone
                  </span>
                )}
                {isYelahanka && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                    Clean Baseline Reference
                  </span>
                )}
              </div>

              {/* Coordinates & Telemetry Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 block">Baseline PM2.5</span>
                  <span className="text-sm font-bold text-white">~{baseline} µg/m³</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Coordinates</span>
                  <span className="text-slate-300 text-[11px]">
                    {loc.lat?.toFixed(2)}°N, {loc.lon?.toFixed(2)}°E
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400 group-hover:text-cyan-300">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Telemetry Broadcast: 10s</span>
                </div>

                <div className="flex items-center gap-1 font-medium">
                  <span>{isSelected ? "Currently Selected" : "Switch to Node"}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
