import React, { useState } from "react";
import {
  Users,
  Footprints,
  HeartPulse,
  Baby,
  Bike,
  Briefcase,
  Check,
  ChevronRight,
  ChevronLeft,
  Shield,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
  Phone,
  User,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MOCK_LOCATIONS } from "../../data/mockData";

const ROLES = [
  {
    id: "runner",
    name: "Runner / Athlete",
    tagline: "Endurance & Outdoor Cardio",
    description: "High ventilation intake during aerobic workouts. Needs 3-hr advance surge warnings.",
    icon: Footprints,
    avatar: "🏃",
    color: "blue",
    badge: "High Respiration",
    bgClass: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "asthma_patient",
    name: "Respiratory Sensitive",
    tagline: "Asthma, COPD & Allergies",
    description: "Airway hyperreactivity. Critical priority for PM2.5 spikes & rapid bronchodilator buffers.",
    icon: HeartPulse,
    avatar: "🫁",
    color: "red",
    badge: "Vulnerable Category",
    bgClass: "bg-red-50 border-red-200 text-red-700",
  },
  {
    id: "parent",
    name: "Parent / Guardian",
    tagline: "Child & Infant Defense",
    description: "Safeguard developing pediatric lungs from toxic PM2.5 during playtime and school transit.",
    icon: Baby,
    avatar: "👶",
    color: "purple",
    badge: "Pediatric Care",
    bgClass: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    id: "delivery_rider",
    name: "Delivery Rider / Field",
    tagline: "High Outdoor Shift Hours",
    description: "6 to 10 hours continuous road exposure in traffic choke points like Silk Board and Peenya.",
    icon: Bike,
    avatar: "🛵",
    color: "amber",
    badge: "Continuous Exposure",
    bgClass: "bg-amber-50 border-amber-200 text-amber-700",
  },
  {
    id: "office_commuter",
    name: "Office Commuter",
    tagline: "Peak Rush-Hour Transit",
    description: "Traffic corridor transit windows and vehicle ventilation cabin air optimization.",
    icon: Briefcase,
    avatar: "💼",
    color: "indigo",
    badge: "Transit Corridor",
    bgClass: "bg-indigo-50 border-indigo-200 text-indigo-700",
  },
  {
    id: "general",
    name: "General Public",
    tagline: "Daily Environmental Safety",
    description: "Balanced precautions, daily errands, and general atmospheric quality tracking.",
    icon: Users,
    avatar: "👤",
    color: "slate",
    badge: "Standard Profile",
    bgClass: "bg-slate-50 border-slate-200 text-slate-700",
  },
];

const HEALTH_CONDITIONS = [
  "Asthma / Wheezing",
  "Dust & Pollen Allergy",
  "Cardiovascular Vulnerability",
  "Chronic Bronchitis",
  "Eye & Sinus Irritation",
  "None / Generally Healthy",
];

const OUTDOOR_OPTIONS = [
  { label: "< 1 hr", desc: "Mostly Indoors", value: 1.0 },
  { label: "1 - 3 hrs", desc: "Moderate Commute", value: 2.5 },
  { label: "4 - 6 hrs", desc: "Active Outdoors", value: 5.0 },
  { label: "6+ hrs", desc: "Field / Shift Worker", value: 8.5 },
];

export default function OnboardingScreen({ onComplete, onCancel }) {
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1); // 1: Choose Role, 2: File Details, 3: Confirmation
  const [selectedRoleId, setSelectedRoleId] = useState(user?.role || "runner");

  // Form Details
  const [name, setName] = useState(user?.name || "");
  const [ageGroup, setAgeGroup] = useState(user?.details?.ageGroup || "25-34");
  const [baseLocation, setBaseLocation] = useState(
    user?.details?.baseLocation || "Bengaluru"
  );
  const [selectedSensitivities, setSelectedSensitivities] = useState(
    user?.details?.sensitivities || ["Dust & Pollen Allergy"]
  );
  const [outdoorHours, setOutdoorHours] = useState(
    user?.details?.dailyOutdoorHours || 2.5
  );
  const [emergencyName, setEmergencyName] = useState(
    user?.details?.emergencyContact?.name || ""
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    user?.details?.emergencyContact?.phone || ""
  );
  const [alertThreshold, setAlertThreshold] = useState(
    user?.details?.alertThreshold || "moderate"
  );

  const activeRole = ROLES.find((r) => r.id === selectedRoleId) || ROLES[0];

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    if (roleId === "asthma_patient") {
      setSelectedSensitivities(["Asthma / Wheezing", "Dust & Pollen Allergy"]);
      setOutdoorHours(1.0);
      setBaseLocation("Silk Board");
      setAlertThreshold("low");
    } else if (roleId === "delivery_rider") {
      setSelectedSensitivities(["Exhaust Gas Exposure"]);
      setOutdoorHours(8.5);
      setBaseLocation("Peenya");
      setAlertThreshold("high");
    } else if (roleId === "parent") {
      setSelectedSensitivities(["Developing Pediatric Lungs"]);
      setOutdoorHours(2.0);
      setBaseLocation("Yelahanka");
      setAlertThreshold("moderate");
    } else if (roleId === "runner") {
      setSelectedSensitivities(["Dust & Pollen Allergy"]);
      setOutdoorHours(2.5);
      setBaseLocation("Bengaluru");
      setAlertThreshold("moderate");
    } else if (roleId === "office_commuter") {
      setSelectedSensitivities(["Exhaust Gas Exposure"]);
      setOutdoorHours(2.0);
      setBaseLocation("Koramangala");
      setAlertThreshold("moderate");
    } else if (roleId === "general") {
      setSelectedSensitivities(["None / Generally Healthy"]);
      setOutdoorHours(1.5);
      setBaseLocation("Bengaluru");
      setAlertThreshold("moderate");
    }
  };

  const toggleSensitivity = (condition) => {
    if (condition === "None / Generally Healthy") {
      setSelectedSensitivities(["None / Generally Healthy"]);
      return;
    }
    setSelectedSensitivities((prev) => {
      const filtered = prev.filter((c) => c !== "None / Generally Healthy");
      if (filtered.includes(condition)) {
        return filtered.filter((c) => c !== condition);
      } else {
        return [...filtered, condition];
      }
    });
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinish = () => {
    const onboardingPayload = {
      role: activeRole.id,
      roleName: activeRole.name,
      avatar: activeRole.avatar,
      name: name || user?.name || "AtmosAi User",
      details: {
        ageGroup,
        baseLocation,
        sensitivities: selectedSensitivities,
        dailyOutdoorHours: outdoorHours,
        emergencyContact: {
          name: emergencyName || "Primary Emergency Contact",
          phone: emergencyPhone || "+91 98450 00000",
          relation: "Family/Doctor",
        },
        alertThreshold,
        maskType:
          activeRole.id === "asthma_patient"
            ? "N95 / FFP2 Certified Respirator"
            : activeRole.id === "delivery_rider"
            ? "Dual Activated Carbon Filter"
            : "Particulate Sports Shield",
        hasPurifierAtHome: selectedSensitivities.includes("Asthma / Wheezing"),
        inhalerRequired: selectedSensitivities.includes("Asthma / Wheezing"),
      },
    };

    completeOnboarding(onboardingPayload);
    if (onComplete) {
      onComplete("home");
    }
  };

  // Calculate dynamic vulnerability risk index
  const calculateVulnerability = () => {
    let score = 30; // base score
    if (selectedRoleId === "asthma_patient") score += 40;
    if (selectedRoleId === "runner") score += 25;
    if (selectedRoleId === "delivery_rider") score += 30;
    if (selectedRoleId === "parent") score += 20;

    if (selectedSensitivities.includes("Asthma / Wheezing")) score += 20;
    if (selectedSensitivities.includes("Cardiovascular Vulnerability")) score += 15;
    if (outdoorHours >= 5) score += 20;

    score = Math.min(score, 98);

    if (score >= 75) return { label: "High Vulnerability", color: "text-red-600 bg-red-50", multiplier: "2.1x" };
    if (score >= 50) return { label: "Moderate Vulnerability", color: "text-amber-600 bg-amber-50", multiplier: "1.4x" };
    return { label: "Standard Baseline", color: "text-emerald-600 bg-emerald-50", multiplier: "1.0x" };
  };

  const vulnerability = calculateVulnerability();

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-6 overflow-y-auto no-scrollbar">
      {/* Top Wizard Navigation */}
      <header className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
          ) : onCancel ? (
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 font-semibold hover:text-slate-800"
            >
              Cancel
            </button>
          ) : null}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Setup Wizard • Step {step} of 3
            </span>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {step === 1 && "Choose Your Persona"}
              {step === 2 && "File Health & Commute Details"}
              {step === 3 && "Personalized Safety Shield"}
            </h1>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-6 bg-blue-600"
                  : s < step
                  ? "w-3 bg-emerald-500"
                  : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </header>

      {/* ================= STEP 1: CHOOSE ROLE ================= */}
      {step === 1 && (
        <div className="space-y-3.5 flex-1 pt-1">
          <p className="text-xs text-slate-500 leading-relaxed">
            AtmosAi evaluates rolling meteorological and PM2.5 trends with AWS Bedrock to deliver targeted advice customized for your daily routine.
          </p>

          <div className="space-y-2.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoleId === role.id;

              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={`w-full p-3.5 rounded-2xl flex items-start justify-between text-left transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-600/30"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
                      {role.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {role.name}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {role.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                        {role.tagline}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "border border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 sticky bottom-0 bg-slate-50 py-2">
            <button
              onClick={handleNextStep}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to File Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: FILE DETAILS ================= */}
      {step === 2 && (
        <div className="space-y-4 flex-1 pt-1">
          {/* Persona Header Pill */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center gap-3">
            <span className="text-2xl">{activeRole.avatar}</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                Configuring Profile for
              </span>
              <h3 className="text-xs font-bold text-slate-900">
                {activeRole.name}
              </h3>
            </div>
          </div>

          {/* User Display Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
              Full Name / Display Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ananya Rao"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Base Location & Age Bracket */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
                Base Monitored Zone
              </label>
              <div className="relative">
                <select
                  value={baseLocation}
                  onChange={(e) => setBaseLocation(e.target.value)}
                  className="w-full py-2.5 px-3 text-xs bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all font-medium text-slate-800"
                >
                  <option value="Bengaluru">Bengaluru Central</option>
                  <option value="Silk Board">Silk Board Junction</option>
                  <option value="Peenya">Peenya Industrial</option>
                  <option value="Yelahanka">Yelahanka Corridor</option>
                  <option value="Koramangala">Koramangala Tech</option>
                  <option value="Hebbal">Hebbal Ring Road</option>
                  <option value="Electronic City">Electronic City</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
                Age Demographic
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full py-2.5 px-3 text-xs bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all font-medium text-slate-800"
              >
                <option value="18-24">18 - 24 years</option>
                <option value="25-34">25 - 34 years</option>
                <option value="35-49">35 - 49 years</option>
                <option value="50-64">50 - 64 years</option>
                <option value="65+">65+ Senior</option>
              </select>
            </div>
          </div>

          {/* Health Sensitivities (Multi-select) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
              Respiratory & Health Sensitivities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HEALTH_CONDITIONS.map((cond) => {
                const isSelected = selectedSensitivities.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleSensitivity(cond)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px] leading-tight">{cond}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Outdoor Exposure */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
              Average Daily Outdoor Exposure
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {OUTDOOR_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setOutdoorHours(opt.value)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    outdoorHours === opt.value
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-[11px] font-bold">{opt.label}</div>
                  <div className="text-[9px] opacity-75">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Medical Contact */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800">
              <Phone className="w-4 h-4 text-red-500" />
              <h4 className="text-xs font-bold">Emergency SOS / Doctor Contact</h4>
            </div>
            <p className="text-[10px] text-slate-500">
              Triggered during critical AQI surges (&gt; 200) for fast medical dispatch or family notification.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Doctor / Contact Name"
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
              />
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 98450 00000"
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 sticky bottom-0 bg-slate-50 py-2">
            <button
              onClick={handleNextStep}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Review Safety Strategy</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: CONFIRMATION & STRATEGY ================= */}
      {step === 3 && (
        <div className="space-y-4 flex-1 pt-1">
          {/* AI Strategy Header Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl">{activeRole.avatar}</span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {name || user?.name || "AtmosAi Protected Member"}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {activeRole.name} • {baseLocation}
                  </p>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${vulnerability.color}`}>
                {vulnerability.label}
              </span>
            </div>

            {/* Risk Multiplier Metric */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Calculated Multiplier</div>
                <div className="text-sm font-extrabold text-blue-400">
                  {vulnerability.multiplier} Exposure
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/60">
                <div className="text-[10px] text-slate-400">Monitored Window</div>
                <div className="text-sm font-extrabold text-emerald-400">
                  Rolling 3-Hour AI
                </div>
              </div>
            </div>
          </div>

          {/* AI Tailored Action Plan */}
          <div className="app-card p-3.5 space-y-2 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-bold">AWS Bedrock Safeguard Action</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activeRole.id === "asthma_patient"
                ? "Immediate alerts prioritized when PM2.5 crosses 60 µg/m³. HEPA indoor buffer scheduled from 6:00 PM to 9:00 PM with inhaler readiness check."
                : activeRole.id === "runner"
                ? "Cardio endurance routing adjusted to avoid evening traffic surges. Morning clean-air windows automatically broadcasted."
                : activeRole.id === "delivery_rider"
                ? "Real-time rerouting around Peenya & Silk Board choke points with certified particulate respirator reminders."
                : activeRole.id === "parent"
                ? "Safe outdoor playground index provided. Immediate alerts before school dismissal hours."
                : "Continuous localized air telemetry active with 3-hour surge warning alerts."}
            </p>
          </div>

          {/* Details Summary Table */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-xs space-y-2">
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Profile Summary
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Primary Node:</span>
              <span className="font-bold text-slate-800">{baseLocation}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Outdoor Time:</span>
              <span className="font-bold text-slate-800">{outdoorHours} hrs / day</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
              <span>Sensitivities:</span>
              <span className="font-bold text-slate-800">
                {selectedSensitivities.join(", ") || "None"}
              </span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>SOS Contact:</span>
              <span className="font-bold text-slate-800">
                {emergencyName ? `${emergencyName} (${emergencyPhone})` : "Standard Emergency"}
              </span>
            </div>
          </div>

          {/* Final Finish Button */}
          <div className="pt-2">
            <button
              onClick={handleFinish}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:from-emerald-800 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Activate Safe Air Shield & Open Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
