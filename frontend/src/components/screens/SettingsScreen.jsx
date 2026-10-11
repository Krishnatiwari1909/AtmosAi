import React, { useState } from "react";
import {
  ChevronLeft,
  Mail,
  MapPin,
  ChevronRight,
  Check,
  Bell,
  Sparkles,
} from "lucide-react";
import { MOCK_NOTIFICATION_SETTINGS } from "../../data/mockData";

export default function SettingsScreen({
  location = "Bengaluru",
  onBack,
  onOpenLocation,
}) {
  const [enabled, setEnabled] = useState(MOCK_NOTIFICATION_SETTINGS.enabled);
  const [riskLevels, setRiskLevels] = useState(MOCK_NOTIFICATION_SETTINGS.riskLevels);
  const [email, setEmail] = useState(MOCK_NOTIFICATION_SETTINGS.email);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const toggleRisk = (key) => {
    setRiskLevels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onBack();
    }, 1200);
  };

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

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Notification Settings
        </h1>
      </div>

      {/* Main Switch Card */}
      <div className="app-card p-4 flex items-center justify-between border border-slate-200/80 shadow-sm">
        <div className="space-y-1 pr-3">
          <h2 className="text-xs font-bold text-slate-900">
            Enable pollution alerts
          </h2>
          <p className="text-[11px] text-slate-500 leading-snug">
            Get notified when air quality is expected to be high or very high in your selected location.
          </p>
        </div>

        {/* iOS Style Switch */}
        <button
          onClick={() => setEnabled(!enabled)}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 flex-shrink-0 ${
            enabled ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
              enabled ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Risk Levels Checkboxes Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          Alert for risk levels
        </h3>

        <div className="space-y-2">
          {/* High Risk */}
          <label className="app-card p-3.5 flex items-center gap-3 border border-slate-200/80 cursor-pointer shadow-sm hover:bg-slate-50/50">
            <input
              type="checkbox"
              checked={riskLevels.highRisk}
              onChange={() => toggleRisk("highRisk")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-800">
              High Risk (AQI 101 – 200)
            </span>
          </label>

          {/* Very High Risk */}
          <label className="app-card p-3.5 flex items-center gap-3 border border-slate-200/80 cursor-pointer shadow-sm hover:bg-slate-50/50">
            <input
              type="checkbox"
              checked={riskLevels.veryHighRisk}
              onChange={() => toggleRisk("veryHighRisk")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-800">
              Very High Risk (AQI 201+)
            </span>
          </label>

          {/* Moderate Risk */}
          <label className="app-card p-3.5 flex items-center gap-3 border border-slate-200/80 cursor-pointer shadow-sm hover:bg-slate-50/50">
            <input
              type="checkbox"
              checked={riskLevels.moderateRisk}
              onChange={() => toggleRisk("moderateRisk")}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-800">
              Moderate Risk (optional)
            </span>
          </label>
        </div>
      </div>

      {/* Notification Method Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          Notification method
        </h3>

        <div
          onClick={() => setIsEditingEmail(true)}
          className="app-card p-3.5 flex items-center justify-between border border-slate-200/80 cursor-pointer shadow-sm hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500 stroke-[1.8]" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Email</span>
              <span className="text-[11px] text-slate-500">{email}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Selected Location Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          Selected location
        </h3>

        <div
          onClick={onOpenLocation}
          className="app-card p-3.5 flex items-center justify-between border border-slate-200/80 cursor-pointer shadow-sm hover:border-slate-300"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600 stroke-[1.8]" />
            <span className="text-xs font-bold text-slate-800">{location}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="pt-2 flex-1 flex flex-col justify-end">
        <button
          onClick={handleSave}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all focus:outline-none flex items-center justify-center gap-2"
        >
          {showSavedToast ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Settings Saved!</span>
            </>
          ) : (
            <span>Save Settings</span>
          )}
        </button>
      </div>

      {/* Edit Email Modal */}
      {isEditingEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Update Notification Email
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="name@example.com"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingEmail(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditingEmail(false)}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
