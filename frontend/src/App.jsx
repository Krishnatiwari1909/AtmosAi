import React, { useState, useEffect, useCallback } from "react";
import MobileStatusBar from "./components/ui/MobileStatusBar";
import BottomNav from "./components/ui/BottomNav";
import ScreenSwitcherBar from "./components/ui/ScreenSwitcherBar";

// Screen Components
import HomeScreen from "./components/screens/HomeScreen";
import ProfileScreen from "./components/screens/ProfileScreen";
import ForecastScreen from "./components/screens/ForecastScreen";
import WhyScreen from "./components/screens/WhyScreen";
import MapScreen from "./components/screens/MapScreen";
import StatsScreen from "./components/screens/StatsScreen";
import AlertsScreen from "./components/screens/AlertsScreen";
import SettingsScreen from "./components/screens/SettingsScreen";
import LocationScreen from "./components/screens/LocationScreen";
import AboutScreen from "./components/screens/AboutScreen";
import LoginScreen from "./components/screens/LoginScreen";
import OnboardingScreen from "./components/screens/OnboardingScreen";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { usePWA } from "./hooks/usePWA";
import {
  fetchLiveForecast,
  fetchAlerts,
  fetchAccuracy,
  fetchHealth,
} from "./api/atmosApi";
import { MOCK_FORECAST_DATA, getAqiAndLevel } from "./data/mockData";

function AppContent() {
  const { user, isAuthenticated, isGuest } = useAuth();

  // Navigation State
  // Initial screen: If user has completed onboarding -> 'home', if logged in but needs onboarding -> 'onboarding', otherwise -> 'login'
  const [currentScreen, setCurrentScreen] = useState(() => {
    try {
      const stored = localStorage.getItem("atmosai_user_session_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.onboarded) return "home";
        return "onboarding";
      }
    } catch { }
    return "login";
  });

  const [navHistory, setNavHistory] = useState([currentScreen]);
  const [isDeviceFrame, setIsDeviceFrame] = useState(true);
  const [dataSourceMode, setDataSourceMode] = useState("live"); // 'live' or 'demo'

  // User App State (synced with logged-in user)
  const [selectedLocation, setSelectedLocation] = useState(
    user?.details?.baseLocation || "Bengaluru"
  );
  const [selectedProfile, setSelectedProfile] = useState(
    user?.role || "runner"
  );
  const [forecastData, setForecastData] = useState(MOCK_FORECAST_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PWA Hook
  const { isInstallable, isInstalled, installPWA } = usePWA();

  // Keep state synchronized with active user session
  useEffect(() => {
    if (user?.role) {
      setSelectedProfile(user.role);
    }
    if (user?.details?.baseLocation) {
      setSelectedLocation(user.details.baseLocation);
    }
  }, [user?.role, user?.details?.baseLocation]);

  // Navigation handlers
  const pushScreen = (screenId) => {
    setNavHistory((prev) => [...prev, screenId]);
    setCurrentScreen(screenId);
  };

  const popScreen = () => {
    if (navHistory.length > 1) {
      const nextHistory = [...navHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setNavHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen("home");
    }
  };

  const handleTabSelect = (tabId) => {
    setNavHistory([tabId]);
    setCurrentScreen(tabId);
  };

  // Direct navigation from top switcher bar
  const handleDirectNavigate = (screenId) => {
    setNavHistory([screenId]);
    setCurrentScreen(screenId);
  };

  // Load and refresh live data
  const loadData = useCallback(async () => {
    if (dataSourceMode === "demo") {
      setForecastData(MOCK_FORECAST_DATA);
      return;
    }

    setIsRefreshing(true);
    try {
      const locParam = selectedLocation.toLowerCase().replace(/\s+/g, "_");
      const data = await fetchLiveForecast(locParam, selectedProfile);

      if (data && data.predicted_pm25 !== undefined) {
        const curPm = Math.round(data.features_used?.pm25_current || 39);
        const predPm = Math.round(data.predicted_pm25 || curPm * 1.15);
        const curAqiInfo = getAqiAndLevel(curPm);

        const step1 = Math.round(curPm + (predPm - curPm) * 0.33);
        const step2 = Math.round(curPm + (predPm - curPm) * 0.66);

        const isSurge = data.risk === "VERY_HIGH" || data.risk === "HIGH" || curPm >= 90;
        const isModerate = data.risk === "MODERATE" || (curPm >= 50 && curPm < 90);

        setForecastData({
          location: selectedLocation,
          profile: selectedProfile,
          currentAqi: curAqiInfo.aqi,
          currentPm25: curPm,
          currentLevel: curAqiInfo.level,
          updatedTime: "Live Open-Meteo",
          riskLevel: isSurge ? "High Risk" : isModerate ? "Moderate Risk" : "Low Risk",
          riskDescription:
            data.explanation?.summary ||
            (isSurge
              ? "Air quality is likely to worsen over the next 3 hours."
              : "Air quality is projected to remain stable."),
          riskWindow: data.forecast_window || "Next 3 Hours",
          projectionTimeline: [
            {
              time: "Now",
              pm25: curPm,
              aqi: curAqiInfo.aqi,
              level: curAqiInfo.level,
              dotColor: curAqiInfo.dotColor,
            },
            {
              time: "+1h",
              pm25: step1,
              aqi: getAqiAndLevel(step1).aqi,
              level: getAqiAndLevel(step1).level,
              dotColor: getAqiAndLevel(step1).dotColor,
            },
            {
              time: "+2h",
              pm25: step2,
              aqi: getAqiAndLevel(step2).aqi,
              level: getAqiAndLevel(step2).level,
              dotColor: getAqiAndLevel(step2).dotColor,
            },
            {
              time: "+3h",
              pm25: predPm,
              aqi: getAqiAndLevel(predPm).aqi,
              level: getAqiAndLevel(predPm).level,
              dotColor: getAqiAndLevel(predPm).dotColor,
            },
          ],
          recommendedAction:
            data.explanation?.action ||
            "Maintain regular hydration and plan workouts during cleaner daylight hours.",
        });
      }
    } catch {
      // Retain mockData if offline
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedLocation, selectedProfile, dataSourceMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Bottom navigation visibility and active tab mapping
  const showBottomNav = ["home", "map", "stats", "alerts", "profile", "about"].includes(
    currentScreen
  );

  const getActiveBottomTab = () => {
    if (["home", "map", "stats", "alerts", "profile"].includes(currentScreen))
      return currentScreen;
    if (currentScreen === "about") return "profile";
    return "home";
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-700">
      {/* Desktop Screen Switcher Bar */}
      <ScreenSwitcherBar
        currentScreen={currentScreen}
        onNavigate={handleDirectNavigate}
        isDeviceFrame={isDeviceFrame}
        onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
        dataSourceMode={dataSourceMode}
        onToggleDataSourceMode={() =>
          setDataSourceMode((prev) => (prev === "live" ? "demo" : "live"))
        }
        onRefresh={loadData}
        isRefreshing={isRefreshing}
      />

      {/* Main App Container */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6">
        <main
          className={`${isDeviceFrame
              ? "mobile-device-frame"
              : "w-full max-w-xl min-h-[90vh] bg-slate-50 sm:rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden"
            } transition-all duration-300 relative`}
        >
          {/* Mobile Top Status Bar */}
          <MobileStatusBar />

          {/* Active Screen View */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {currentScreen === "home" && (
              <HomeScreen
                location={selectedLocation}
                profile={selectedProfile}
                onOpenLocation={() => pushScreen("location")}
                onOpenProfile={() => pushScreen("profile")}
                onOpenForecast={() => pushScreen("forecast")}
                onOpenWhy={() => pushScreen("why")}
                onOpenAlerts={() => pushScreen("alerts")}
                onOpenLogin={() => {
                  setNavHistory(["login"]);
                  setCurrentScreen("login");
                }}
                forecastData={forecastData}
                isAuthenticated={isAuthenticated}
                isGuest={isGuest}
              />
            )}

            {currentScreen === "login" && (
              <LoginScreen
                onBack={navHistory.length > 1 ? popScreen : () => {
                  setNavHistory(["home"]);
                  setCurrentScreen("home");
                }}
                onComplete={(target) => {
                  if (target === "onboarding") {
                    setNavHistory(["home", "onboarding"]);
                    setCurrentScreen("onboarding");
                  } else {
                    setNavHistory([target || "home"]);
                    setCurrentScreen(target || "home");
                  }
                }}
              />
            )}

            {currentScreen === "onboarding" && (
              <OnboardingScreen
                onComplete={(target) => {
                  setNavHistory([target || "home"]);
                  setCurrentScreen(target || "home");
                }}
                onCancel={() => {
                  if (isAuthenticated || isGuest) {
                    popScreen();
                  } else {
                    setNavHistory(["login"]);
                    setCurrentScreen("login");
                  }
                }}
              />
            )}

            {currentScreen === "profile" && (
              <ProfileScreen
                selectedProfile={selectedProfile}
                onSelectProfile={setSelectedProfile}
                onBack={popScreen}
                onOpenEditOnboarding={() => pushScreen("onboarding")}
                onOpenLogin={() => {
                  setNavHistory(["login"]);
                  setCurrentScreen("login");
                }}
                onOpenAbout={() => pushScreen("about")}
                onOpenSettings={() => pushScreen("settings")}
              />
            )}

            {currentScreen === "forecast" && (
              <ForecastScreen
                location={selectedLocation}
                profile={selectedProfile}
                onBack={popScreen}
                onOpenWhy={() => pushScreen("why")}
                forecastData={forecastData}
              />
            )}

            {currentScreen === "why" && <WhyScreen onBack={popScreen} />}

            {currentScreen === "map" && (
              <MapScreen
                onSelectLocationNode={(node) => {
                  setSelectedLocation(node.shortName);
                  pushScreen("home");
                }}
              />
            )}

            {currentScreen === "stats" && (
              <StatsScreen onBack={navHistory.length > 1 ? popScreen : null} />
            )}

            {currentScreen === "alerts" && (
              <AlertsScreen onOpenSettings={() => pushScreen("settings")} />
            )}

            {currentScreen === "settings" && (
              <SettingsScreen
                location={selectedLocation}
                onBack={popScreen}
                onOpenLocation={() => pushScreen("location")}
              />
            )}

            {currentScreen === "location" && (
              <LocationScreen
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                onBack={popScreen}
              />
            )}

            {currentScreen === "about" && (
              <AboutScreen
                onBack={navHistory.length > 1 ? popScreen : null}
                isInstallable={isInstallable}
                installPWA={installPWA}
                isInstalled={isInstalled}
              />
            )}
          </div>

          {/* Bottom Navigation Bar */}
          {showBottomNav && (
            <BottomNav
              activeTab={getActiveBottomTab()}
              onSelectTab={handleTabSelect}
              alertCount={2}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
