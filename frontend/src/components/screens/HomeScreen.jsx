import React from "react";
import {
  Bell,
  ChevronDown,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Cloud,
  Navigation,
  AlertCircle,
  ShieldCheck,
  Bot,
  Footprints,
} from "lucide-react";
import AQIGauge from "../ui/AQIGauge";
import SkylineSvg from "../ui/SkylineSvg";
import { calculateAQI } from "../../utils/calculateAQI";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen({
  location = "Bengaluru",
  profile = "runner",
  onOpenLocation,
  onOpenProfile,
  onOpenForecast,
  onOpenWhy,
  onOpenAlerts,
  onOpenLogin,
  forecastData,
  isAuthenticated = false,
  isGuest = false,
  isUsingCurrentLocation = false,
  currentCoords = null,
  forecastError = null,
  onRetryForecast = null,
}) {
  const { user } = useAuth() || {};

  // Read stored user profile from localStorage ('atmosai_user_profile')
  const userProfile = (() => {
    try {
      const raw = localStorage.getItem("atmosai_user_profile");
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  })();

  const activeUserName = userProfile?.name || user?.name || "You";
  const activeSensitivities = userProfile?.healthSafeguards || userProfile?.details?.sensitivities || [];
  const primarySafeguard = activeSensitivities[0] || (userProfile?.roleName || "Health Shield Active");

  const currentPm25 = forecastData?.currentPm25 || 82;
  const cpcbAqiData = calculateAQI(currentPm25);
  const currentAqi = cpcbAqiData.aqi;
  const currentLevel = cpcbAqiData.category;
  const updatedTime = forecastData?.updatedTime || "Updated 12 min ago";

  const timeline = forecastData?.projectionTimeline || [
    { time: "Now", pm25: 82, dotColor: "bg-blue-500" },
    { time: "+1h", pm25: 96, dotColor: "bg-amber-500" },
    { time: "+2h", pm25: 118, dotColor: "bg-orange-500" },
    { time: "+3h", pm25: 137, dotColor: "bg-red-500" },
  ];

  const profileDisplayNames = {
    general: "General Public",
    parent: "Parent",
    delivery_rider: "Delivery Rider",
    runner: "Runner",
    asthma_patient: "Respiratory Sensitive",
    office_commuter: "Office Commuter",
    school_admin: "School Admin",
  };

  const profileIcons = {
    general: "👤",
    parent: "👶",
    delivery_rider: "🛵",
    runner: "🏃",
    asthma_patient: "🫁",
    office_commuter: "💼",
    school_admin: "🏫",
  };

  // Context-aware fallback personalized guidance
  const defaultPersonalizedAction = (() => {
    const norm = (profile || "").toLowerCase();
    const isCleanAir = currentPm25 <= 30; // CPCB Good / Low Risk
    const isModerateAir = currentPm25 > 30 && currentPm25 <= 60;

    if (isCleanAir) {
      if (norm.includes("runner") || norm.includes("athlete")) {
        return `Great air quality! Ideal conditions for your outdoor run or training session today.`;
      }
      if (norm.includes("delivery") || norm.includes("rider")) {
        return `Clear road conditions with low ambient dust. Enjoy smooth riding conditions.`;
      }
      if (norm.includes("parent")) {
        return `Air quality is clean and healthy. Safe for children to play outdoors and engage in sports.`;
      }
      if (norm.includes("asthma") || norm.includes("respiratory")) {
        return `Air quality is in the safe zone. Safe for outdoor errands with minimal trigger risk.`;
      }
      return `Air quality is clean and safe. Excellent conditions for all regular outdoor activities.`;
    }

    if (isModerateAir) {
      if (norm.includes("asthma") || norm.includes("respiratory")) {
        return `Moderate air quality. Keep prescribed rescue inhaler accessible during extended outings.`;
      }
      if (norm.includes("runner") || norm.includes("athlete")) {
        return `Air quality is acceptable for outdoor workouts. Sensitive runners may prefer early sessions.`;
      }
      if (norm.includes("delivery") || norm.includes("rider")) {
        return `Moderate traffic exposure. A light mask is recommended during dense evening traffic hours.`;
      }
      return `Air quality is moderate. Generally safe for regular outdoor activities without heavy precautions.`;
    }

    // High / Very High Pollution
    if (norm.includes("asthma") || norm.includes("respiratory")) {
      return `Keep prescribed rescue inhaler on hand and minimize outdoor exposure during peak pollution hours.`;
    }
    if (norm.includes("runner") || norm.includes("athlete")) {
      return `Elevated particulate surge expected. Complete runs before peak hours or transition to indoor cardio.`;
    }
    if (norm.includes("delivery") || norm.includes("rider")) {
      return `Equip sealed N95 particulate respirator along traffic arterial corridors and schedule indoor hub pauses.`;
    }
    if (norm.includes("parent")) {
      return `Keep children indoors for games and study sessions during the peak evening exposure window.`;
    }
    if (norm.includes("commuter")) {
      return `Close vehicle windows with cabin air recirculation enabled prior to peak congestion corridors.`;
    }
    return `Air quality is expected to decline this evening. Consider finishing outdoor errands before peak hours.`;
  })();

  const recommendedText = forecastData?.recommendedAction || defaultPersonalizedAction;

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cloud className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
              AtmosAi
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Breathe Smarter, Live Safer.
            </p>
          </div>
        </div>

        {/* Right Action Icons: Alerts Bell & Profile/Login Avatar */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
            aria-label="Alerts"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <button
            onClick={onOpenProfile}
            className="p-1 rounded-full hover:ring-2 hover:ring-blue-400 text-slate-700 transition-all focus:outline-none"
            aria-label="User Profile"
            title="Open Profile & Health Center"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-xs">
              {profileIcons[profile] || "👤"}
            </div>
          </button>
        </div>
      </header>

      {/* Pill Selection Bar: Location & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Location Pill */}
        <button
          onClick={onOpenLocation}
          className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white border shadow-sm text-slate-800 text-xs font-semibold hover:border-blue-400 hover:bg-blue-50/20 transition-all focus:outline-none ${
            isUsingCurrentLocation
              ? "border-blue-400 ring-1 ring-blue-500/20 bg-blue-50/10"
              : "border-slate-200/90"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isUsingCurrentLocation ? (
              <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600 flex-shrink-0 animate-pulse" />
            ) : (
              <span className="text-blue-600">📍</span>
            )}
            <span className="truncate">{location}</span>
            {isUsingCurrentLocation && (
              <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[9px] font-bold flex-shrink-0">
                GPS Live
              </span>
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
        </button>

        {/* Profile Pill */}
        <button
          onClick={onOpenProfile}
          className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-sm text-slate-800 text-xs font-semibold hover:border-blue-400 hover:bg-blue-50/20 transition-all focus:outline-none"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span>{profileIcons[profile] || "🏃"}</span>
            <span className="truncate">{profileDisplayNames[profile] || profile}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-1" />
        </button>
      </div>

      {/* GPS Error Alert */}
      {forecastError && (
        <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <div className="truncate">
              <span className="font-bold text-[11px] block text-rose-900">Telemetry Notice</span>
              <span className="text-[10px] text-rose-700 block truncate max-w-[200px]">
                {forecastError}
              </span>
            </div>
          </div>
          {onRetryForecast && (
            <button
              onClick={onRetryForecast}
              className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Hyper-Local GPS Indicator Badge */}
      {isUsingCurrentLocation && !forecastError && (
        <div className="p-2 px-3 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/70 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[10px] font-semibold text-slate-700">
              Hyper-Local GPS Active {currentCoords?.accuracy ? `(±${currentCoords.accuracy}m)` : ""} • Open-Meteo
            </span>
          </div>
          <button
            onClick={onOpenLocation}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            Change →
          </button>
        </div>
      )}

      {/* Dynamic Status / Guest Banner */}
      {!isAuthenticated || isGuest ? (
        <div className="p-2.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <span className="text-base">👤</span>
            <div>
              <span className="text-[11px] font-bold text-slate-900 block">
                Browsing as Guest Preview
              </span>
              <span className="text-[10px] text-slate-500 block">
                Sign in to customize role, health safeguards & alerts
              </span>
            </div>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
          >
            Sign In →
          </button>
        </div>
      ) : (
        <div className="p-2 px-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Shield: {profileDisplayNames[profile] || profile} ({location})</span>
          </div>
          <button
            onClick={onOpenProfile}
            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Manage Profile →
          </button>
        </div>
      )}

      {/* Card 1: Current Air Quality */}
      <div className="app-card relative p-4 overflow-hidden border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-800">
            Current Air Quality
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">
            {updatedTime}
          </span>
        </div>

        {/* Gauge Center */}
        <div className="py-2">
          <AQIGauge aqi={currentAqi} pm25={currentPm25} level={currentLevel} />
        </div>

        {/* Skyline Silhouette in Card Background */}
        <div className="mt-1 -mx-4 -mb-4">
          <SkylineSvg />
        </div>
      </div>

      {/* Card 2: Air Quality Forecast (Next 3 Hours) */}
      <div className="app-card p-4 space-y-3.5 border border-slate-200/80 shadow-sm">
        <div
          onClick={onOpenForecast}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div>
            <h2 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Air Quality Forecast
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Next 3 Hours
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Risk Callout Banner */}
        <div
          className={`flex items-start gap-3 p-3 rounded-xl border ${
            forecastData?.riskLevel?.toLowerCase().includes("high")
              ? "bg-rose-50/80 border-rose-100"
              : forecastData?.riskLevel?.toLowerCase().includes("moderate")
              ? "bg-amber-50/80 border-amber-100"
              : "bg-emerald-50/80 border-emerald-100"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
              forecastData?.riskLevel?.toLowerCase().includes("high")
                ? "bg-rose-500 shadow-rose-500/20"
                : forecastData?.riskLevel?.toLowerCase().includes("moderate")
                ? "bg-amber-500 shadow-amber-500/20"
                : "bg-emerald-500 shadow-emerald-500/20"
            }`}
          >
            {forecastData?.riskLevel?.toLowerCase().includes("low") ? (
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div className="space-y-0.5">
            <h3
              className={`text-xs font-bold ${
                forecastData?.riskLevel?.toLowerCase().includes("high")
                  ? "text-rose-700"
                  : forecastData?.riskLevel?.toLowerCase().includes("moderate")
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}
            >
              {forecastData?.riskLevel || "High Risk"}
            </h3>
            <p
              className={`text-[11px] leading-snug ${
                forecastData?.riskLevel?.toLowerCase().includes("high")
                  ? "text-rose-600/90"
                  : forecastData?.riskLevel?.toLowerCase().includes("moderate")
                  ? "text-amber-600/90"
                  : "text-emerald-600/90"
              }`}
            >
              {forecastData?.riskDescription ||
                "Air quality is likely to worsen over the next 3 hours."}
            </p>
          </div>
        </div>

        {/* 4-Column Timeline */}
        <div className="grid grid-cols-4 gap-2 py-1 text-center divide-x divide-slate-100">
          {timeline.map((item, idx) => {
            const itemAqi = calculateAQI(item.pm25);
            return (
              <div key={idx} className="flex flex-col items-center space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.time}
                </span>
                <span className="text-sm font-extrabold text-slate-800">
                  {item.pm25} µg
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  AQI {itemAqi.aqi}
                </span>
                <span className={`w-2 h-2 rounded-full ${item.dotColor} mt-0.5`} />
              </div>
            );
          })}
        </div>

        {/* "View Details ->" Button */}
        <button
          onClick={onOpenForecast}
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Copilot Recommended Action Card (Prominent Main Dashboard Early-Warning Safeguard) */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/95 via-teal-50/60 to-emerald-50/90 border border-emerald-200/90 shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

        {/* Card Header: Robot/Shield Icon, Title & Personalized User Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/30">
              <Bot className="w-4.5 h-4.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-950">
                Recommended Action
              </h3>
              <p className="text-[10px] text-emerald-700 font-medium">
                AI Copilot early-warning safeguard
              </p>
            </div>
          </div>

          {/* User personalization badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/90 border border-emerald-300/60 text-emerald-900 text-[10px] font-bold shadow-2xs">
            <span>{userProfile?.avatar || profileIcons[profile] || "👤"}</span>
            <span className="truncate max-w-[110px]">{activeUserName}</span>
          </div>
        </div>

        {/* Dynamic Gemini 2.5 LLM Recommendation Text */}
        <div className="p-3 rounded-xl bg-white/85 border border-emerald-200/80 shadow-2xs">
          <p className="text-xs sm:text-sm text-emerald-950 font-semibold leading-relaxed">
            {recommendedText}
          </p>
        </div>

        {/* Context metadata pills + link to Why */}
        <div className="flex items-center justify-between pt-0.5 text-[10px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 font-semibold border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
              <span>{primarySafeguard}</span>
            </span>
            <span className="text-emerald-700 font-medium">
              Window: {forecastData?.riskWindow || "Next 3h"}
            </span>
          </div>

          <button
            onClick={onOpenWhy}
            className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-0.5 cursor-pointer ml-auto transition-colors"
          >
            <span>Why this advice?</span>
            <ChevronRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Card 3: "Why This Forecast?" Quick Teaser */}
      <button
        onClick={onOpenWhy}
        className="w-full app-card p-3.5 flex items-center justify-between text-left border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/20 transition-all group focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
              Why This Forecast?
            </h3>
            <p className="text-[11px] text-slate-400">
              Explainable AI insights powered by AWS Bedrock
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </button>
    </div>
  );
}
