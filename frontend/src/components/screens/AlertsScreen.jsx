import React, { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Bell,
  X,
  ShieldCheck,
} from "lucide-react";
import { MOCK_ALERTS } from "../../data/mockData";

export default function AlertsScreen({ onOpenSettings }) {
  const [activeTab, setActiveTab] = useState("recent"); // 'recent' or 'all'
  const [selectedAlert, setSelectedAlert] = useState(null);

  const displayedAlerts =
    activeTab === "recent"
      ? MOCK_ALERTS.filter((a) => a.isRecent)
      : MOCK_ALERTS;

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Alerts
        </h1>
        <button
          onClick={onOpenSettings}
          className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
          aria-label="Alert Settings"
        >
          <Sliders className="w-5 h-5 stroke-[2]" />
        </button>
      </header>

      {/* Segmented Filter: Recent vs All */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab("recent")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "recent"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 flex-1">
        {displayedAlerts.map((alert) => {
          const isHigh = alert.severity === "HIGH";
          const isModerate = alert.severity === "MODERATE";
          const isImproving = alert.severity === "IMPROVING";

          return (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                isHigh
                  ? "bg-rose-50/70 border-rose-100 hover:bg-rose-50"
                  : isModerate
                  ? "bg-amber-50/70 border-amber-100 hover:bg-amber-50"
                  : "bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 pr-2">
                {/* Colored Circular Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                    isHigh
                      ? "bg-rose-500 text-white"
                      : isModerate
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {isImproving ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>

                {/* Text Content */}
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    {alert.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {alert.location} • {alert.dateText}
                  </p>
                  <p
                    className={`text-[11px] font-medium leading-snug pt-0.5 ${
                      isHigh
                        ? "text-rose-700"
                        : isModerate
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {alert.action}
                  </p>
                </div>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Alert Advisory
                </span>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">
                {selectedAlert.title}
              </h2>
              <p className="text-xs text-slate-500">
                {selectedAlert.location} • {selectedAlert.dateText}
              </p>
              <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
                {selectedAlert.description}
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-xs text-blue-800 font-semibold border border-blue-100">
                Recommended Action: {selectedAlert.action}
              </div>
            </div>

            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
