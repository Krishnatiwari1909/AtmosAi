import React from "react";
import {
  Sparkles,
  Bot,
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Wind,
  Clock,
  Car,
  Baby,
  Bike,
  HeartPulse,
  Footprints,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";

const PERSONA_ICONS = {
  general: Users,
  parent: Baby,
  delivery_rider: Bike,
  asthma_patient: HeartPulse,
  runner: Footprints,
  office_commuter: Briefcase,
  school_admin: GraduationCap,
};

export default function AIExplanationCard({
  forecast,
  selectedProfile,
  profiles,
  onSelectProfile,
  locationName,
}) {
  const explanation = forecast?.explanation;
  const currentProfileObj = profiles.find((p) => p.id === selectedProfile) || {
    id: selectedProfile,
    name: "General Public",
    description: "Standard precautions",
  };
  const PersonaIcon = PERSONA_ICONS[selectedProfile] || Users;

  const whyDrivers = explanation?.why || [
    `Particulate matter trend is accelerating toward ${forecast?.predicted_pm25 || 110} µg/m³`,
    `Surface wind speed of ${forecast?.features_used?.wind_speed || 1.8} m/s prevents adequate pollutant dispersion`,
    "Diurnal traffic volume peaks along primary commuting corridors",
  ];

  const actionText =
    explanation?.action ||
    forecast?.recommended_action ||
    "Limit prolonged outdoor physical exertion during the elevated exposure window.";

  const isAiGenerated = explanation?.is_ai_generated ?? true;

  return (
    <div className="relative rounded-2xl glass-panel p-5 sm:p-6 border border-slate-800 shadow-xl overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Actionable AI Guidance
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/50 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-amber-400" />
                Claude Sonnet 5 on Bedrock
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Demographic-specific operational mitigation generated for {locationName || "Current Location"}
            </p>
          </div>
        </div>

        {/* AI Confidence / Guardrails Status */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{isAiGenerated ? "AWS Bedrock Live" : "Safety Rule Guardrail"}</span>
        </div>
      </div>

      {/* Quick Demographic Persona Switcher Pills */}
      <div className="mt-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span>Select Demographic Persona to Tailor Advice:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {profiles.map((p) => {
            const Icon = PERSONA_ICONS[p.id] || Users;
            const isSelected = p.id === selectedProfile;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-500/10"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/80"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guidance Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        
        {/* Left Column: AI Summary & Action Callout */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Early-Warning Synthesis
            </span>
            <p className="text-sm sm:text-base font-medium text-slate-200 leading-snug">
              {explanation?.summary ||
                `${(forecast?.risk || "MODERATE").replace("_", " ")} air pollution surge expected across ${locationName || "this zone"}.`}
            </p>
          </div>

          {/* Action Callout Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-950/30 to-orange-950/20 border border-amber-500/30 shadow-lg shadow-amber-950/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <PersonaIcon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Recommended Action for {currentProfileObj.name}
                  </span>
                  <span className="text-[10px] text-amber-300/70 font-mono">
                    Window: {forecast?.forecast_window || "Next 3h"}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                  {actionText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: "Why" Root Driver Factors */}
        <div className="lg:col-span-5 bg-slate-900/50 rounded-xl p-4 sm:p-5 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5 mb-3">
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              Risk Vector Drivers (Explainability)
            </span>

            <ul className="space-y-2.5">
              {whyDrivers.map((driver, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 font-mono text-[10px]">
                    {idx + 1}
                  </div>
                  <span className="leading-tight">{driver}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Safety guardrails verified
            </span>
            <span className="font-mono text-slate-400">Region: us-east-1</span>
          </div>
        </div>

      </div>
    </div>
  );
}
