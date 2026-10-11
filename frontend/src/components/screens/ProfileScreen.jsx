import React, { useState } from "react";
import {
  ChevronLeft,
  Users,
  Baby,
  Bike,
  Footprints,
  HeartPulse,
  Briefcase,
  Check,
  ShieldCheck,
  Edit3,
  Phone,
  AlertTriangle,
  Sparkles,
  MapPin,
  Clock,
  LogOut,
  Shield,
  Activity,
  Heart,
  Settings,
  Bell,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { useAuth, PRESET_PERSONAS } from "../../context/AuthContext";
import { MOCK_PROFILES } from "../../data/mockData";

const ICON_MAP = {
  Users,
  Baby,
  Bike,
  Footprints,
  HeartPulse,
  Briefcase,
};

export default function ProfileScreen({
  selectedProfile = "runner",
  onSelectProfile,
  onBack,
  onOpenEditOnboarding,
  onOpenLogin,
  onOpenAbout,
  onOpenSettings,
}) {
  const { user, isAuthenticated, logout, quickLoginAs } = useAuth();
  const [toastMessage, setToastMessage] = useState("");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2200);
  };

  const handleQuickSwitchRole = (roleId) => {
    if (onSelectProfile) {
      onSelectProfile(roleId);
    }
    // Also update auth context if matching preset
    if (PRESET_PERSONAS[roleId]) {
      quickLoginAs(roleId, true);
    }
    showToast(`Switched persona to ${roleId.replace("_", " ").toUpperCase()}`);
  };

  const handleLogout = () => {
    logout();
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  // Get details
  const userName = user?.name || "Demo User";
  const userEmail = user?.email || "user@atmosai.org";
  const userAvatar = user?.avatar || "🏃";
  const activeRoleKey = user?.role || selectedProfile || "runner";
  const userDetails = user?.details || {};
  const baseLocation = userDetails.baseLocation || "Bengaluru";
  const sensitivities = userDetails.sensitivities?.length
    ? userDetails.sensitivities
    : ["General Sensitivity"];
  const outdoorHours = userDetails.dailyOutdoorHours || 2.5;
  const emergency = userDetails.emergencyContact || {
    name: "Emergency Services / Doctor",
    phone: "+91 98450 00000",
  };

  // Calculate exposure multiplier
  const isHighRisk =
    activeRoleKey === "asthma_patient" ||
    sensitivities.some((s) => s.toLowerCase().includes("asthma"));
  const multiplier = isHighRisk ? "2.1x" : activeRoleKey === "runner" ? "1.6x" : "1.2x";

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-4 overflow-y-auto no-scrollbar">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-slate-700 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Profile & Health Center
          </span>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="p-2 -mr-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 px-2 py-1"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Logout Confirmation Dialog */}
      {showConfirmLogout && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 text-red-800 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Sign out of AtmosAi?</span>
          </div>
          <p className="text-[11px] text-red-700">
            Your customized demographic safeguards and session details will remain saved on this device.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleLogout}
              className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
            >
              Confirm Sign Out
            </button>
            <button
              onClick={() => setShowConfirmLogout(false)}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Profile Identity Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg ring-4 ring-white/10">
              {userAvatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {userName}
                </h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {userEmail}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                  📍 {baseLocation}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                  Active Shield
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Edit Profile Button */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Demographic: <span className="text-slate-200 font-semibold">{activeRoleKey.replace("_", " ")}</span>
          </div>
          <button
            onClick={onOpenEditOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-[11px] font-bold backdrop-blur-md transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Details & Role</span>
          </button>
        </div>
      </div>

      {/* Exposure Risk & Outdoor Budget Matrix */}
      <div className="app-card p-3.5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Personalized Exposure Matrix
            </h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isHighRisk ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            {multiplier} Vulnerability Index
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500">Daily Outdoor Time</div>
            <div className="text-sm font-extrabold text-slate-800 mt-0.5">
              {outdoorHours} Hours
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Monitored routine</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-[10px] text-slate-500">Alert Trigger Threshold</div>
            <div className="text-sm font-extrabold text-indigo-600 mt-0.5">
              {isHighRisk ? "PM2.5 > 60" : "AQI > 100"}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">3-hr predictive siren</div>
          </div>
        </div>

        {/* Outdoor Budget Progress Bar */}
        <div>
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span>Estimated Daily Air Load Budget</span>
            <span className="text-slate-800">65% Safe Margin</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                isHighRisk ? "bg-amber-500" : "bg-blue-600"
              }`}
              style={{ width: "65%" }}
            />
          </div>
        </div>
      </div>

      {/* Health Sensitivities & Emergency Contact Card */}
      <div className="app-card p-3.5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          <h3 className="text-xs font-bold text-slate-900">
            Health Safeguards & Medical Kit
          </h3>
        </div>

        {/* Sensitivities Badges */}
        <div className="flex flex-wrap gap-1.5">
          {sensitivities.map((s, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-red-50/80 border border-red-200/70 text-red-700 text-[11px] font-semibold flex items-center gap-1"
            >
              <span>•</span>
              <span>{s}</span>
            </span>
          ))}
        </div>

        {/* Emergency SOS Contact Card */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-800">
                {emergency.name || "Emergency Medical Contact"}
              </div>
              <div className="text-[10px] text-slate-500">
                {emergency.phone || "+91 98450 00000"}
              </div>
            </div>
          </div>
          <a
            href={`tel:${emergency.phone || "+919845000000"}`}
            onClick={(e) => {
              e.preventDefault();
              showToast(`Simulated SOS call to ${emergency.name || "Contact"}`);
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-bold hover:bg-slate-100 transition-colors"
          >
            Test SOS
          </a>
        </div>
      </div>

      {/* Role Switcher Matrix (Instant Persona Switch) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-bold text-slate-900">
            Switch Persona / Simulation Mode
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            Test AI Demographics
          </span>
        </div>

        <div className="space-y-2">
          {MOCK_PROFILES.map((prof) => {
            const Icon = ICON_MAP[prof.icon] || Users;
            const isSelected = activeRoleKey === prof.id;

            return (
              <button
                key={prof.id}
                onClick={() => handleQuickSwitchRole(prof.id)}
                className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-600 shadow-xs ring-1 ring-blue-600"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-blue-600 text-white" : prof.bgColor
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {prof.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {prof.tagline}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 hover:text-blue-600">
                    Switch
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Navigation: Settings & Architecture / About */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold text-slate-900 px-0.5">
          System & Settings
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-800">Alerts Setup</div>
                <div className="text-[10px] text-slate-500">Thresholds & push</div>
              </div>
            </button>
          )}

          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all text-left flex items-center gap-2.5 cursor-pointer shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-800">About AtmosAi</div>
                <div className="text-[10px] text-slate-500">ML & AWS Bedrock</div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Production System Info Footer */}
      <div className="pt-2 text-center space-y-1 text-slate-400 text-[10px]">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AtmosAi Production Build v1.0.0 • AWS Bedrock & DynamoDB</span>
        </div>
        <div>All demographic health data encrypted locally.</div>
      </div>
    </div>
  );
}
