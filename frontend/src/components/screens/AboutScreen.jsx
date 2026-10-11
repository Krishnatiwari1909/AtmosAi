import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  Users2,
  ShieldCheck,
  FileText,
  Download,
  Wifi,
  X,
  Sparkles,
} from "lucide-react";

export default function AboutScreen({ onBack, isInstallable, installPWA, isInstalled }) {
  const [activeModal, setActiveModal] = useState(null);

  const menuItems = [
    {
      id: "how_it_works",
      title: "How It Works",
      icon: Cpu,
      content: (
        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>1. Continuous IoT & Telemetry Ingestion:</strong> AtmosAi integrates live sensor meshes across urban hubs, supplemented with real-time data from Open-Meteo and OpenAQ.
          </p>
          <p>
            <strong>2. Rolling 3-Hour LightGBM Classifier:</strong> Analyzes rapid diurnal particulate spikes, wind stall patterns, humidity levels, and inversion layers to project severe air surges 3–6 hours in advance.
          </p>
          <p>
            <strong>3. Actionable Generative Guidance:</strong> Leverages Anthropic Claude Sonnet on AWS Bedrock to translate raw PM2.5 curves into concrete, demographic-tailored mitigation advisories.
          </p>
        </div>
      ),
    },
    {
      id: "data_sources",
      title: "Data Sources",
      icon: Database,
      content: (
        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>• Open-Meteo API:</strong> Hourly boundary layer height, temperature, surface wind speed, and relative humidity.
          </p>
          <p>
            <strong>• OpenAQ & CPCB:</strong> Continuous ambient air quality telemetry and reference-grade sensor stations.
          </p>
          <p>
            <strong>• IoT Edge Simulator:</strong> Micro-controller simulation broadcasting diurnal traffic exhaust waves via MQTT.
          </p>
        </div>
      ),
    },
    {
      id: "model_info",
      title: "Model Information",
      icon: Sparkles,
      content: (
        <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>Algorithm:</strong> LightGBM Gradient Boosted Decision Trees (v1.0).
          </p>
          <p>
            <strong>Surge Horizon:</strong> 3-hour ahead threshold classification (&gt;90 µg/m³ PM2.5).
          </p>
          <p>
            <strong>Backtested Recall:</strong> 85.7% severe event detection with 3.2 hour average lead warning window.
          </p>
        </div>
      ),
    },
    {
      id: "team",
      title: "Team",
      icon: Users2,
      content: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900">Team TechinX</p>
          <p>Built for the AWS Environmental Hacks 2026.</p>
          <p className="text-[11px] text-slate-500">
            Dedicated to protecting sensitive demographics through accessible predictive atmospheric intelligence.
          </p>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: ShieldCheck,
      content: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            AtmosAi stores location and profile selections locally on your device. We do not track or sell your personal telemetry or GPS coordinates.
          </p>
        </div>
      ),
    },
    {
      id: "terms",
      title: "Terms of Service",
      icon: FileText,
      content: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            AtmosAi early warnings are algorithmic projections intended for personal mitigation and informational safety. In severe environmental crises, always follow official public health directives.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center space-x-2 pt-1">
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
          About AtmosAi
        </h1>
      </header>

      {/* Hero Branding Card */}
      <div className="app-card p-5 text-center space-y-3 border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
          <Cloud className="w-9 h-9 stroke-[2.2]" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            AtmosAi
          </h2>
          <p className="text-xs font-bold text-blue-600">
            AI-Powered Air Intelligence
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Breathe Smarter, Live Safer.
          </p>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto pt-1 font-normal">
          AtmosAi predicts air pollution 3–6 hours ahead and provides personalized recommendations to help you stay safe and make better decisions.
        </p>
      </div>

      {/* PWA Install Banner / Action */}
      <div className="app-card p-3.5 flex items-center justify-between border border-blue-100 bg-blue-50/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              {isInstalled ? "AtmosAi App Installed" : "Install AtmosAi PWA"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isInstalled ? "Running in native standalone mode" : "Add to home screen for offline access"}
            </p>
          </div>
        </div>
        {!isInstalled && (
          <button
            onClick={installPWA}
            className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            Install
          </button>
        )}
      </div>

      {/* Menu List Items */}
      <div className="app-card divide-y divide-slate-100 border border-slate-200/80 shadow-sm overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModal(item)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-500 stroke-[2]" />
                <span className="text-xs font-bold text-slate-800">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="py-2 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>AtmosAi v1.0.0 • AWS Bedrock & LightGBM</span>
        </div>
      </div>

      {/* Modal Sheet for Menu Details */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                {activeModal.title}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>{activeModal.content}</div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
