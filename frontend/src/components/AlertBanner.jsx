import React from "react";
import { AlertTriangle, Clock, ShieldAlert, ArrowRight, BellRing } from "lucide-react";

export default function AlertBanner({ alerts, currentForecast, onSelectAlertNode }) {
  // If there are specific server alerts or current forecast risk is elevated
  const isHighRisk = currentForecast?.risk === "HIGH" || currentForecast?.risk === "VERY_HIGH";
  const primaryAlert = alerts && alerts.length > 0 ? alerts[0] : null;

  if (!isHighRisk && !primaryAlert) {
    return (
      <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-200">
              Atmospheric Conditions Nominal — Low Surge Risk
            </h4>
            <p className="text-xs text-emerald-300/70">
              No severe particulate accumulation or thermal inversions projected in the 3-hour forecast window.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-800/40">
          <Clock className="w-3.5 h-3.5" />
          <span>Monitoring Active</span>
        </div>
      </div>
    );
  }

  const riskBadgeClass =
    currentForecast?.risk === "VERY_HIGH" || primaryAlert?.severity === "VERY_HIGH"
      ? "bg-rose-950/60 text-rose-300 border-rose-700/60 shadow-rose-900/30"
      : "bg-amber-950/60 text-amber-300 border-amber-700/60 shadow-amber-900/30";

  const alertTitle =
    primaryAlert?.title ||
    (currentForecast?.risk === "VERY_HIGH"
      ? "Critical PM2.5 Surge Warning Detected"
      : "Elevated Pollution Surge Approaching");

  const alertSummary =
    primaryAlert?.summary ||
    `LightGBM predictive engine anticipates particulate accumulation reaching ${
      currentForecast?.predicted_pm25 || 120
    } µg/m³ during ${currentForecast?.forecast_window || "the upcoming window"}.`;

  const windowTime = primaryAlert?.forecast_window || currentForecast?.forecast_window || "18:00 - 21:00 IST";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xl transition ${
        currentForecast?.risk === "VERY_HIGH"
          ? "bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900/80 border-rose-500/40 glow-rose"
          : "bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900/80 border-amber-500/40 glow-amber"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left: Icon & Alert Summary */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-lg ${
              currentForecast?.risk === "VERY_HIGH"
                ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
          >
            <ShieldAlert className="w-6 h-6 animate-bounce" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase rounded-full border shadow-sm ${riskBadgeClass}`}>
                {currentForecast?.risk || primaryAlert?.severity || "HIGH"} SURGE ADVISORY
              </span>

              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-900/70 px-2.5 py-0.5 rounded-full border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Peak Horizon: {windowTime}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {alertTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-0.5 max-w-3xl leading-relaxed">
              {alertSummary}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Preview */}
        {primaryAlert && (
          <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => onSelectAlertNode && onSelectAlertNode(primaryAlert.node_id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition cursor-pointer"
            >
              <span>Inspect Node ({primaryAlert.location})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
