import React, { createContext, useContext, useState, useEffect } from "react";
import { syncUserProfile } from "../api/atmosApi";

const STORAGE_KEY = "atmosai_user_session_v2";
const PROFILE_STORAGE_KEY = "atmosai_user_profile";

export const PRESET_PERSONAS = {
  runner: {
    id: "usr_runner_01",
    name: "Priya Sharma",
    email: "priya.runner@atmosai.org",
    role: "runner",
    roleName: "Runner / Athlete",
    avatar: "🏃",
    onboarded: true,
    details: {
      ageGroup: "25-34",
      baseLocation: "Bengaluru",
      sensitivities: ["Dust & Pollen Allergy"],
      dailyOutdoorHours: 2.5,
      emergencyContact: {
        name: "Arun Sharma (Spouse)",
        phone: "+91 98765 43210",
        relation: "Family",
      },
      alertThreshold: "moderate",
      maskType: "Sport Anti-Pollution Mask",
      hasPurifierAtHome: true,
      inhalerRequired: false,
    },
  },
  asthma_patient: {
    id: "usr_asthma_02",
    name: "Dr. Ananya Rao",
    email: "ananya.rao@healthnet.in",
    role: "asthma_patient",
    roleName: "Respiratory Sensitive",
    avatar: "🫁",
    onboarded: true,
    details: {
      ageGroup: "35-49",
      baseLocation: "Silk Board",
      sensitivities: ["Asthma / Wheezing", "Dust & Pollen Allergy"],
      dailyOutdoorHours: 1.0,
      emergencyContact: {
        name: "Apollo Pulmonology Emergency",
        phone: "+91 80 2630 4050",
        relation: "Physician / Hospital",
      },
      alertThreshold: "low",
      maskType: "N95 / FFP2 Certified Respirator",
      hasPurifierAtHome: true,
      inhalerRequired: true,
      prescribedMedication: "Budecort & Asthalin Inhaler",
    },
  },
  parent: {
    id: "usr_parent_03",
    name: "Meera & Vikram",
    email: "meera.family@outlook.com",
    role: "parent",
    roleName: "Parent / Guardian",
    avatar: "👶",
    onboarded: true,
    details: {
      ageGroup: "30-44",
      baseLocation: "Yelahanka",
      sensitivities: ["Developing Pediatric Lungs"],
      dailyOutdoorHours: 2.0,
      emergencyContact: {
        name: "Dr. Sunita (Pediatrician)",
        phone: "+91 80 4123 7890",
        relation: "Pediatric Clinic",
      },
      alertThreshold: "moderate",
      maskType: "Child-Sized KF94 Filter Mask",
      hasPurifierAtHome: true,
      inhalerRequired: false,
    },
  },
  delivery_rider: {
    id: "usr_rider_04",
    name: "Rahul Verma",
    email: "rahul.rider@quicklogistics.in",
    role: "delivery_rider",
    roleName: "Delivery Rider / Field",
    avatar: "🛵",
    onboarded: true,
    details: {
      ageGroup: "18-24",
      baseLocation: "Peenya",
      sensitivities: ["Exhaust Gas Exposure"],
      dailyOutdoorHours: 8.5,
      emergencyContact: {
        name: "Fleet Ops Dispatch",
        phone: "+91 98450 99887",
        relation: "Fleet Supervisor",
      },
      alertThreshold: "high",
      maskType: "Dual Activated Carbon Valve Mask",
      hasPurifierAtHome: false,
      inhalerRequired: false,
    },
  },
  general: {
    id: "usr_general_05",
    name: "Karan Patel",
    email: "karan.patel@gmail.com",
    role: "general",
    roleName: "General Public",
    avatar: "👤",
    onboarded: true,
    details: {
      ageGroup: "25-34",
      baseLocation: "Bengaluru",
      sensitivities: ["None / Generally Healthy"],
      dailyOutdoorHours: 1.5,
      emergencyContact: {
        name: "Deepak Patel (Brother)",
        phone: "+91 91234 56789",
        relation: "Family",
      },
      alertThreshold: "moderate",
      maskType: "Standard 3-Ply Surgical Mask",
      hasPurifierAtHome: false,
      inhalerRequired: false,
    },
  },
};

export const DEFAULT_USER_PROFILE = {
  id: "usr_atmosai_01",
  name: "AtmosAi User",
  email: "user@atmosai.org",
  role: "runner",
  roleName: "Runner / Athlete",
  avatar: "🏃",
  dailyOutdoorTime: 2.5,
  healthSafeguards: ["Dust & Pollen Allergy"],
  location: "Bengaluru",
  baseLocation: "Bengaluru",
  emergencyContact: {
    name: "Emergency Medical Contact",
    phone: "+91 98450 00000",
    relation: "Family/Doctor",
  },
  details: {
    ageGroup: "25-34",
    baseLocation: "Bengaluru",
    location: "Bengaluru",
    dailyOutdoorHours: 2.5,
    dailyOutdoorTime: 2.5,
    sensitivities: ["Dust & Pollen Allergy"],
    healthSafeguards: ["Dust & Pollen Allergy"],
    alertThreshold: "moderate",
    maskType: "Sport Anti-Pollution Mask",
    emergencyContact: {
      name: "Emergency Medical Contact",
      phone: "+91 98450 00000",
      relation: "Family/Doctor",
    },
    hasPurifierAtHome: true,
    inhalerRequired: false,
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return DEFAULT_USER_PROFILE;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      return Boolean(stored);
    } catch {
      return false;
    }
  });

  const [isGuest, setIsGuest] = useState(false);

  // Sync directly to localStorage ('atmosai_user_profile') and debounced backend /api/profile
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error("Failed saving session", e);
    }

    // Debounce backend sync by 1000ms to avoid flooding the API while typing or clicking
    const timer = setTimeout(() => {
      syncUserProfile(user).catch((e) => console.warn("Background sync error:", e));
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  const login = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const matched = Object.values(PRESET_PERSONAS).find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    if (matched) {
      // Load user and require them to review/file role & details
      const userSession = { ...matched, onboarded: false };
      setUser(userSession);
      setIsAuthenticated(true);
      setIsGuest(false);
      return { success: true, user: userSession, needsOnboarding: true };
    }

    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      role: "runner",
      roleName: "Runner / Athlete",
      avatar: "🏃",
      onboarded: false, // explicitly triggers role selection & details filing!
      details: {
        ageGroup: "25-34",
        baseLocation: "Bengaluru",
        sensitivities: ["Dust & Pollen Allergy"],
        dailyOutdoorHours: 2.0,
        emergencyContact: { name: "", phone: "", relation: "" },
        alertThreshold: "moderate",
        maskType: "Sport Anti-Pollution Mask",
        hasPurifierAtHome: false,
        inhalerRequired: false,
      },
    };

    setUser(newUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    return { success: true, user: newUser, needsOnboarding: true };
  };

  const signup = async ({ name, email, password }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name.trim() || email.split("@")[0],
      email: email.trim(),
      role: "general",
      roleName: "General Public",
      avatar: "👤",
      onboarded: false, // triggers role selection and detail filing immediately!
      details: {
        ageGroup: "25-34",
        baseLocation: "Bengaluru",
        sensitivities: [],
        dailyOutdoorHours: 2.0,
        emergencyContact: { name: "", phone: "", relation: "" },
        alertThreshold: "moderate",
        maskType: "N95 Particulate Respirator",
        hasPurifierAtHome: false,
        inhalerRequired: false,
      },
    };

    setUser(newUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    return { success: true, user: newUser, needsOnboarding: true };
  };

  const quickLoginAs = (personaKey, directToDashboard = false) => {
    const persona = PRESET_PERSONAS[personaKey] || PRESET_PERSONAS.runner;
    const sessionUser = {
      ...persona,
      onboarded: directToDashboard ? true : false,
    };
    setUser(sessionUser);
    setIsAuthenticated(true);
    setIsGuest(false);
    return sessionUser;
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setIsAuthenticated(false);
    setUser({
      id: "usr_guest",
      name: "Guest Explorer",
      email: "guest@atmosai.org",
      role: "general",
      roleName: "General Public",
      avatar: "🌍",
      onboarded: true,
      details: {
        ageGroup: "25-34",
        baseLocation: "Bengaluru",
        sensitivities: ["General Preview"],
        dailyOutdoorHours: 2.0,
        emergencyContact: { name: "Guest Support", phone: "+91 80 0000 0000" },
        alertThreshold: "moderate",
      },
    });
  };

  const completeOnboarding = (onboardingData) => {
    setUser((prev) => {
      const updated = {
        ...(prev || {}),
        name: onboardingData.name || prev?.name || "AtmosAi User",
        role: onboardingData.role || prev?.role || "general",
        roleName: onboardingData.roleName || prev?.roleName || "General Public",
        avatar: onboardingData.avatar || prev?.avatar || "👤",
        onboarded: true,
        details: {
          ...(prev?.details || {}),
          ...onboardingData.details,
          baseLocation: onboardingData.details?.baseLocation || prev?.details?.baseLocation || "Bengaluru",
        },
      };
      return updated;
    });
    setIsAuthenticated(true);
    setIsGuest(false);
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const base = prev || DEFAULT_USER_PROFILE;
      const updated = {
        ...base,
        ...updatedFields,
        details: {
          ...(base?.details || {}),
          ...(updatedFields?.details || {}),
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const logout = () => {
    setUser(DEFAULT_USER_PROFILE);
    setIsAuthenticated(false);
    setIsGuest(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isGuest,
        login,
        signup,
        logout,
        quickLoginAs,
        continueAsGuest,
        completeOnboarding,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
