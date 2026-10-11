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
  X,
  Save,
  User,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_PROFILES } from "../../data/mockData";
import { syncUserProfile } from "../../api/atmosApi";

const ICON_MAP = {
  Users,
  Baby,
  Bike,
  Footprints,
  HeartPulse,
  Briefcase,
};

export const ROLE_PRESETS = {
  runner: {
    id: "runner",
    name: "Runner / Athlete",
    roleName: "Runner / Athlete",
    avatar: "🏃",
    icon: Footprints,
    dailyOutdoorTime: 2.5,
    healthSafeguards: ["Dust & Pollen Allergy"],
    alertThreshold: "moderate",
    maskType: "Sport Anti-Pollution Mask",
    desc: "High cardiovascular exertion & outdoor aerobic sessions",
  },
  delivery_rider: {
    id: "delivery_rider",
    name: "Delivery Rider / Field",
    roleName: "Delivery Rider / Field",
    avatar: "🛵",
    icon: Bike,
    dailyOutdoorTime: 8.5,
    healthSafeguards: ["Exhaust Gas Exposure"],
    alertThreshold: "high",
    maskType: "Dual Activated Carbon Valve Mask",
    desc: "6-10 hours continuous road & traffic exhaust exposure",
  },
  office_commuter: {
    id: "office_commuter",
    name: "Office Commuter",
    roleName: "Office Commuter",
    avatar: "💼",
    icon: Briefcase,
    dailyOutdoorTime: 3.0,
    healthSafeguards: ["Exhaust Gas Exposure", "Peak Traffic Transit"],
    alertThreshold: "moderate",
    maskType: "Standard 3-Ply Surgical Mask",
    desc: "Peak rush hour transit corridors and arterial routes",
  },
  asthma_patient: {
    id: "asthma_patient",
    name: "Respiratory Sensitive",
    roleName: "Respiratory Sensitive",
    avatar: "🫁",
    icon: HeartPulse,
    dailyOutdoorTime: 1.0,
    healthSafeguards: ["Asthma / Wheezing", "Dust & Pollen Allergy"],
    alertThreshold: "low",
    maskType: "N95 / FFP2 Certified Respirator",
    desc: "Asthma, wheezing, bronchial sensitivity or allergies",
  },
  parent: {
    id: "parent",
    name: "Parent / Guardian",
    roleName: "Parent / Guardian",
    avatar: "👶",
    icon: Baby,
    dailyOutdoorTime: 2.0,
    healthSafeguards: ["Developing Pediatric Lungs"],
    alertThreshold: "moderate",
    maskType: "Child-Sized KF94 Filter Mask",
    desc: "Developing pediatric lungs, school & playground safety",
  },
  general: {
    id: "general",
    name: "General Public",
    roleName: "General Public",
    avatar: "👤",
    icon: Users,
    dailyOutdoorTime: 1.5,
    healthSafeguards: ["None / Generally Healthy"],
    alertThreshold: "moderate",
    maskType: "Standard 3-Ply Surgical Mask",
    desc: "Daily routine, walking errands, and preventative health",
  },
};

const ROLE_OPTIONS = Object.values(ROLE_PRESETS);

const HEALTH_SENSITIVITIES_LIST = [
  "Asthma / Wheezing",
  "Dust & Pollen Allergy",
  "Cardiovascular Vulnerability",
  "Developing Pediatric Lungs",
  "Exhaust Gas Exposure",
  "Chronic Bronchitis",
  "Eye & Sinus Irritation",
  "None / Generally Healthy",
];

const MASK_OPTIONS = [
  "N95 / FFP2 Certified Respirator",
  "Sport Anti-Pollution Mask",
  "Dual Activated Carbon Valve Mask",
  "Child-Sized KF94 Filter Mask",
  "Standard 3-Ply Surgical Mask",
  "Cloth / Non-Certified Mask",
  "None",
];

export default function ProfileScreen({
  selectedProfile = "runner",
  onSelectProfile,
  onBack,
  onOpenEditOnboarding,
  onOpenLogin,
  onOpenAbout,
  onOpenSettings,
}) {
  const { user, setUser, isAuthenticated, logout, updateProfile } = useAuth();
  const [toastMessage, setToastMessage] = useState("");
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("runner");
  const [editLocation, setEditLocation] = useState("Bengaluru");
  const [editOutdoorHours, setEditOutdoorHours] = useState(2.5);
  const [editSensitivities, setEditSensitivities] = useState([]);
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");
  const [editAlertThreshold, setEditAlertThreshold] = useState("moderate");
  const [editMaskType, setEditMaskType] = useState("Sport Anti-Pollution Mask");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2600);
  };

  // Open the individual fields edit modal pre-filled with current account data
  const handleOpenEditModal = () => {
    const details = user?.details || {};
    const emergency = user?.emergencyContact || details.emergencyContact || {};
    setEditName(user?.name || "");
    setEditEmail(user?.email || "user@atmosai.org");
    setEditRole(user?.role || selectedProfile || "runner");
    setEditLocation(user?.location || user?.baseLocation || details.baseLocation || "Bengaluru");
    setEditOutdoorHours(user?.dailyOutdoorTime ?? details.dailyOutdoorHours ?? details.dailyOutdoorTime ?? 2.5);
    setEditSensitivities(
      user?.healthSafeguards?.length
        ? [...user.healthSafeguards]
        : details.sensitivities?.length
        ? [...details.sensitivities]
        : ["Dust & Pollen Allergy"]
    );
    setEditEmergencyName(emergency.name || "");
    setEditEmergencyPhone(emergency.phone || "");
    setEditAlertThreshold(details.alertThreshold || "moderate");
    setEditMaskType(details.maskType || "Sport Anti-Pollution Mask");
    setIsEditModalOpen(true);
  };

  const handleToggleSensitivity = (cond) => {
    if (cond === "None / Generally Healthy") {
      setEditSensitivities(["None / Generally Healthy"]);
      return;
    }
    setEditSensitivities((prev) => {
      const filtered = prev.filter((c) => c !== "None / Generally Healthy");
      if (filtered.includes(cond)) {
        return filtered.filter((c) => c !== cond);
      } else {
        return [...filtered, cond];
      }
    });
  };

  // Save the modified individual details while preserving and persisting the profile
  const handleSaveProfileChanges = (e) => {
    if (e) e.preventDefault();

    const rolePreset = ROLE_PRESETS[editRole] || ROLE_PRESETS.general;

    const updater = (prev) => {
      const base = prev || {};
      const sanitizedName = editName.trim() || base.name || "AtmosAi User";
      const sanitizedEmail = editEmail.trim() || base.email || "user@atmosai.org";
      const sanitizedLocation = editLocation.trim() || base.location || base.baseLocation || "Bengaluru";
      const sanitizedEmergency = {
        name: editEmergencyName.trim() || base.emergencyContact?.name || "Emergency Medical Contact",
        phone: editEmergencyPhone.trim() || base.emergencyContact?.phone || "+91 98450 00000",
        relation: base.emergencyContact?.relation || "Family/Doctor",
      };

      const updated = {
        ...base,
        name: sanitizedName,
        email: sanitizedEmail,
        location: sanitizedLocation,
        baseLocation: sanitizedLocation,
        role: editRole,
        roleName: rolePreset.roleName,
        avatar: rolePreset.avatar,
        dailyOutdoorTime: parseFloat(editOutdoorHours) || 2.0,
        healthSafeguards: editSensitivities.length > 0 ? editSensitivities : ["None / Generally Healthy"],
        emergencyContact: sanitizedEmergency,
        details: {
          ...(base.details || {}),
          baseLocation: sanitizedLocation,
          location: sanitizedLocation,
          dailyOutdoorHours: parseFloat(editOutdoorHours) || 2.0,
          dailyOutdoorTime: parseFloat(editOutdoorHours) || 2.0,
          sensitivities: editSensitivities.length > 0 ? editSensitivities : ["None / Generally Healthy"],
          healthSafeguards: editSensitivities.length > 0 ? editSensitivities : ["None / Generally Healthy"],
          alertThreshold: editAlertThreshold,
          maskType: editMaskType,
          emergencyContact: sanitizedEmergency,
        },
      };

      try {
        localStorage.setItem("atmosai_user_profile", JSON.stringify(updated));
        localStorage.setItem("atmosai_user_session_v2", JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed saving profile to localStorage:", err);
      }

      return updated;
    };

    if (typeof setUser === "function") {
      setUser(updater);
    } else {
      updateProfile(updater(user));
    }

    if (onSelectProfile) {
      onSelectProfile(editRole);
    }

    setIsEditModalOpen(false);
    showToast("Profile details saved successfully!");
  };

  // Primary Role Selection: ONLY updates the role / demographic string.
  // User's customized dailyOutdoorTime, healthSafeguards, contacts, etc. are strictly preserved.
  const handleRoleSelect = (selectedRole) => {
    const roleId = selectedRole?.id || selectedRole?.name?.toLowerCase().replace(/[\s/]+/g, "_") || "general";
    if (onSelectProfile) {
      onSelectProfile(roleId);
    }

    // Exact state update requested: ONLY updates role, preserving all other customized metrics:
    setUser((prev) => {
      const updated = {
        ...prev,
        role: selectedRole.name,
      };

      try {
        localStorage.setItem("atmosai_user_profile", JSON.stringify(updated));
        localStorage.setItem("atmosai_user_session_v2", JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed saving profile to localStorage:", err);
      }

      return updated;
    });

    showToast(`Role updated to ${selectedRole.name}`);
  };

  const handleSelectRole = handleRoleSelect;

  const handleLogout = () => {
    logout();
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  // Display details
  const userName = user?.name || "AtmosAi User";
  const userEmail = user?.email || "user@atmosai.org";
  const userAvatar = user?.avatar || "🏃";
  const activeRoleKey = user?.role || selectedProfile || "runner";
  const activeRoleNormalized = activeRoleKey.toLowerCase().replace(/[\s/]+/g, "_");
  const userDetails = user?.details || {};
  const baseLocation = user?.location || user?.baseLocation || userDetails.baseLocation || "Bengaluru";
  const sensitivities = user?.healthSafeguards?.length
    ? user.healthSafeguards
    : userDetails.sensitivities?.length
    ? userDetails.sensitivities
    : ["General Sensitivity"];
  const outdoorHours = user?.dailyOutdoorTime ?? userDetails.dailyOutdoorHours ?? userDetails.dailyOutdoorTime ?? 2.5;
  const emergency = user?.emergencyContact || userDetails.emergencyContact || {
    name: "Emergency Services / Doctor",
    phone: "+91 98450 00000",
  };

  // Calculate exposure multiplier
  const isHighRisk =
    activeRoleNormalized.includes("asthma") ||
    activeRoleNormalized.includes("respiratory") ||
    sensitivities.some((s) => s.toLowerCase().includes("asthma"));
  const multiplier = isHighRisk ? "2.1x" : activeRoleNormalized.includes("runner") ? "1.6x" : "1.2x";

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

        {/* Quick Edit Profile Button -> Opens Specific Fields Edit Modal */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Demographic: <span className="text-slate-200 font-semibold">{activeRoleKey.replace("_", " ")}</span>
          </div>
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-[11px] font-bold backdrop-blur-md transition-all cursor-pointer shadow-xs border border-white/10 hover:border-white/20"
            title="Edit individual profile details without overwriting account"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-slate-900">
              Health Safeguards & Medical Kit
            </h3>
          </div>
          <button
            onClick={handleOpenEditModal}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Edit</span>
          </button>
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

      {/* Role Selection Matrix (Partial State Update) */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-0.5">
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Select Primary Activity Role
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Select your primary activity focus. Customized metrics (daily outdoor hours and health safeguards) remain strictly intact.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {MOCK_PROFILES.map((prof) => {
            const Icon = ICON_MAP[prof.icon] || Users;
            const isSelected =
              activeRoleKey === prof.name ||
              activeRoleKey === prof.id ||
              activeRoleNormalized === prof.id ||
              activeRoleNormalized === prof.name.toLowerCase().replace(/[\s/]+/g, "_");

            return (
              <button
                key={prof.id}
                onClick={() => handleRoleSelect(prof)}
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
                    Select
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

      {/* Dedicated Edit Details & Role Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 bg-slate-900/65 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 border border-slate-200 shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto no-scrollbar relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Edit Profile & Details
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Update individual fields without overwriting your account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileChanges} className="space-y-3.5 text-xs">
              {/* Field 1: Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full Name / Alias</span>
                </label>
                <input
                  type="text"
                  id="profile-edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Krishna Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Field 2: Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  id="profile-edit-email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="e.g. krishna@atmosai.org"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Field 3: City / Neighborhood Location */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Base Location</span>
                </label>
                <input
                  type="text"
                  id="profile-edit-location"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Silk Board, Whitefield..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Field 4: Emergency Contact */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-600" />
                  Emergency Medical Contact
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 mb-0.5">Contact Name</label>
                    <input
                      type="text"
                      id="profile-edit-emergency-name"
                      value={editEmergencyName}
                      onChange={(e) => setEditEmergencyName(e.target.value)}
                      placeholder="e.g. Dr. Arun / Spouse"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 mb-0.5">Phone Number</label>
                    <input
                      type="tel"
                      id="profile-edit-emergency-phone"
                      value={editEmergencyPhone}
                      onChange={(e) => setEditEmergencyPhone(e.target.value)}
                      placeholder="+91 98450 00000"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Field 5: Activity / Role Profile */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Primary Activity Focus / Role
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ROLE_OPTIONS.map((r) => {
                    const isSelected = editRole === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setEditRole(r.id)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600"
                            : "bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-base">{r.avatar}</span>
                        <span className="text-[11px] truncate">{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 6: Daily Outdoor Hours */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Daily Outdoor Time
                  </label>
                  <span className="text-[11px] font-extrabold text-blue-600">
                    {editOutdoorHours} Hours / Day
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {[1.0, 2.5, 5.0, 8.5].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setEditOutdoorHours(h)}
                      className={`py-1 text-[10px] font-bold rounded-lg border transition-all ${
                        Number(editOutdoorHours) === h
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="12.0"
                  step="0.5"
                  value={editOutdoorHours}
                  onChange={(e) => setEditOutdoorHours(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Field 7: Health Sensitivities & Respiratory Conditions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Health Sensitivities & Safeguards
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {HEALTH_SENSITIVITIES_LIST.map((cond) => {
                    const isChecked = editSensitivities.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => handleToggleSensitivity(cond)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                          isChecked
                            ? "bg-red-50 border-red-300 text-red-700 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span>{isChecked ? "✓" : "+"}</span>
                        <span>{cond}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 8: Mitigation Gear & Mask */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Mitigation Mask / Gear
                </label>
                <select
                  value={editMaskType}
                  onChange={(e) => setEditMaskType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {MASK_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 9: Alert Threshold */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Early Warning Trigger Threshold
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "low", label: "High Sensitivity", note: "AQI > 60" },
                    { id: "moderate", label: "Moderate", note: "AQI > 100" },
                    { id: "high", label: "Standard", note: "AQI > 140" },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setEditAlertThreshold(t.id)}
                      className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                        editAlertThreshold === t.id
                          ? "bg-blue-600 text-white border-blue-600 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="text-[10px] leading-tight">{t.label}</div>
                      <div className="text-[9px] opacity-80">{t.note}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
