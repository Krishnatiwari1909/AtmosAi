import React from "react";
import {
  Wind,
  Activity,
  Database,
  Cpu,
  Sparkles,
  RefreshCw,
  MapPin,
  UserCheck,
  ShieldAlert,
  Radio,
  Sliders,
  BarChart3,
  Layers,
  Download,
} from "lucide-react";

export default function Navbar({
  health,
  locations,
  profiles,
  selectedLocation,
  setSelectedLocation,
  selectedProfile,
  setSelectedProfile,
  activeTab,
  setActiveTab,
  isRefreshing,
  onRefresh,
  autoRefresh,
  setAutoRefresh,
}) {
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showInstallModal, setShowInstallModal] = React.useState(false);

  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const isHealthy = health?.status === "ok";
  const currentLocationObj = locations.find((l) => l.id === selectedLocation) || locations[0];
  const currentProfileObj = profiles.find((p) => p.id === selectedProfile) || profiles[0];

  const navTabs = [
    { id: "monitor", label: "Live Forecast & Early-Warning", icon: Activity },
    { id: "network", label: "IoT Sensor Network", icon: Radio },
    { id: "simulator", label: "ML 'What-If' Sandbox", icon: Sliders },
    { id: "streamer", label: "Hardware Telemetry Feed", icon: Layers },
    { id: "accuracy", label: "Backtest & Metrics", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      {/* Top Banner: Status Bar & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wind className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  AtmosAi
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  AWS Hacks 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Environmental Early-Warning & Actionable AI
              </p>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              isHealthy
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                : "bg-amber-950/40 text-amber-300 border-amber-800/40"
            }`}>
              <div className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              <span className="font-mono text-[11px]">API: {isHealthy ? "Online (8000)" : "Fallback"}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px]">ML: LightGBM v1.0</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">AI: Claude Sonnet 5</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px]">Store: {health?.dynamodb ? "DynamoDB" : "Memory Buffer"}</span>
            </div>
          </div>

          {/* Global Controls: Location & Persona Dropdowns */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Location Selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-slate-900 text-slate-200">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Persona Selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh telemetry & forecast"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            {/* Install App Button */}
            <button
              onClick={handleInstallClick}
              title="Install AtmosAi as native App"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-cyan-900/30 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          </div>
        </div>

        {/* Installation Modal */}
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">Install AtmosAi App</h3>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                AtmosAi can run directly as a standalone app on your <strong>phone, tablet, or PC</strong> without a browser URL bar:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-cyan-400 block mb-1">💻 Windows / macOS / Linux:</span>
                  <span>Look for the <strong>Install Icon (⊕)</strong> in your browser address bar (Chrome/Edge/Brave), or click "Install" to create a desktop app window.</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-emerald-400 block mb-1">📱 Android Phone / Tablet:</span>
                  <span>Tap browser menu (⋮) &rarr; <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>. It launches in full-screen native mode.</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-amber-400 block mb-1">🍏 iPhone / iPad (iOS):</span>
                  <span>Tap the <strong>Share</strong> button in Safari &rarr; select <strong>"Add to Home Screen"</strong>.</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-900">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
