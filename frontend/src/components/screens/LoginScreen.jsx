import React, { useState } from "react";
import {
  Cloud,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth, PRESET_PERSONAS } from "../../context/AuthContext";

export default function LoginScreen({ onBack, onComplete }) {
  const { login, signup, quickLoginAs, continueAsGuest } = useAuth();

  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result.success) {
          onComplete("onboarding");
        }
      } else {
        const result = await signup({ name, email, password });
        if (result.success) {
          onComplete("onboarding");
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = (roleKey) => {
    quickLoginAs(roleKey, false);
    onComplete("onboarding");
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-3 pb-6 overflow-y-auto no-scrollbar">
      {/* Top Header / Back Navigation */}
      {onBack && (
        <header className="flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>AWS Bedrock Protected</span>
          </div>
        </header>
      )}

      {/* Brand Hero Visual */}
      <div className="text-center pt-2 pb-5">
        <div className="inline-flex relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 ring-4 ring-blue-50">
            <Cloud className="w-9 h-9 stroke-[2.2]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center text-white text-[10px] font-bold">
            ✓
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {mode === "login" ? "Welcome to AtmosAi" : "Create Safe Air Account"}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Predictive early-warning intelligence & demographic safeguards for localized air quality.
        </p>
      </div>

      {/* Auth Mode Tabs (Sign In / Register) */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center mb-4">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === "login"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mode === "signup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2.5 text-red-700 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === "signup" && (
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Ananya Rao"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 pl-0.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white rounded-xl border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 pl-0.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setEmail("priya.runner@atmosai.org")}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                Auto-fill demo?
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-white rounded-xl border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mode === "login" && (
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600">Remember this device</span>
            </label>
            <span className="text-[11px] text-slate-400">Encrypted session</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === "login" ? "Sign In & Open Dashboard" : "Create Account & Choose Role"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
          <span className="bg-slate-50 px-3 text-slate-400">
            or instant 1-click test personas
          </span>
        </div>
      </div>

      {/* Quick Test Demo Personas */}
      <div className="space-y-2">
        <p className="text-[11px] text-slate-500 font-medium text-center">
          Select a pre-configured persona to test custom telemetry & AI advice:
        </p>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESET_PERSONAS).slice(0, 4).map(([key, persona]) => (
            <button
              key={key}
              onClick={() => handleQuickPersona(key)}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-left flex items-center gap-2.5 group shadow-xs cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base flex-shrink-0 group-hover:scale-110 transition-transform">
                {persona.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-slate-800 truncate">
                  {persona.name.split(" ")[0]}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {persona.roleName.split("/")[0]}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Offline / Guest Mode */}
      <div className="pt-4 text-center">
        <button
          onClick={() => {
            continueAsGuest();
            onComplete("home");
          }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Continue as Guest Demo Preview →
        </button>
      </div>
    </div>
  );
}
