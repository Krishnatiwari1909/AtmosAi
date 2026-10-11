import React, { useState, useEffect, useCallback, useRef } from "react";
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
  fetchLiveForecastByCoords,
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
    } catch {}
    return "login";
  });

  const [navHistory, setNavHistory] = useState([currentScreen]);
  const [isDeviceFrame, setIsDeviceFrame] = useState(true);
  const [dataSourceMode, setDataSourceMode] = useState("live"); // 'live' or 'demo'

  // Developer scaffolding / judge demo mode bar (hidden by default)
  // Toggle with Ctrl+D or Alt+M, or load with ?dev=true
  const [showDevBar, setShowDevBar] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("dev") === "true" || params.get("dev") === "1";
    }
    return false;
  });
  const [devShortcutToast, setDevShortcutToast] = useState(null);

  // Keyboard shortcut listener: Ctrl+D or Alt+M toggles developer screen navigation bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) ||
        (e.altKey && (e.key === "m" || e.key === "M"))
      ) {
        e.preventDefault();
        setShowDevBar((prev) => {
          const next = !prev;
          setDevShortcutToast(next ? "Dev Navigator Enabled (Ctrl+D to hide)" : "Clean Pitch Mode Enabled");
          setTimeout(() => setDevShortcutToast(null), 2400);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // User App State (synced with logged-in user)
  const [selectedLocation, setSelectedLocation] = useState(
    user?.details?.baseLocation || "Bengaluru"
  );
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null); // { lat, lon, accuracy, locality }
  const [forecastError, setForecastError] = useState(null);

  const [selectedProfile, setSelectedProfile] = useState(
    user?.role || "runner"
  );
  const [forecastData, setForecastData] = useState(MOCK_FORECAST_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const abortControllerRef = useRef(null);

  // PWA Hook
  const { isInstallable, isInstalled, installPWA } = usePWA();

  // Keep state synchronized with active user session
  useEffect(() => {
    if (user?.role) {
      setSelectedProfile(user.role);
    }
    if (user?.details?.baseLocation) {
      setSelectedLocation(user.details.baseLocation);
      setIsUsingCurrentLocation(false);
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

  // Helper to transform backend forecast response into frontend state model
  const transformForecastData = useCallback(
    (data, isGpsMode, coords, locName, prof) => {
      const curPm = Math.round(
        data.features_used?.pm25_current || data.current_observations?.pm25 || 39
      );
      const predPm = Math.round(data.predicted_pm25 || curPm * 1.15);
      const curAqiInfo = getAqiAndLevel(curPm);

      const step1 = Math.round(curPm + (predPm - curPm) * 0.33);
      const step2 = Math.round(curPm + (predPm - curPm) * 0.66);

      const isSurge = data.risk === "VERY_HIGH" || data.risk === "HIGH" || curPm >= 90;
      const isModerate = data.risk === "MODERATE" || (curPm >= 50 && curPm < 90);

      const resolvedName = isGpsMode
        ? data.location || coords?.locality || "Current Location (GPS)"
        : data.location || locName;

      return {
        location: resolvedName,
        isCurrentLocation: isGpsMode,
        coordinates: coords ? { lat: coords.lat, lon: coords.lon } : data.coordinates || null,
        accuracy: coords?.accuracy || null,
        profile: prof,
        currentAqi: curAqiInfo.aqi,
        currentPm25: curPm,
        currentLevel: curAqiInfo.level,
        updatedTime: isGpsMode ? "Live GPS • Open-Meteo" : "Live Open-Meteo",
        telemetrySource:
          data.telemetry_source ||
          (isGpsMode ? "Open-Meteo Air Quality (Live CAMS model/observations)" : "Open-Meteo"),
        weatherSource: data.weather_source || "Open-Meteo",
        predictionSource: data.prediction_source || "LightGBM ML Model",
        riskLevel: isSurge ? "High Risk" : isModerate ? "Moderate Risk" : "Low Risk",
        riskDescription:
          data.explanation?.summary ||
          (isSurge
            ? `Air quality is likely to worsen over the next 3 hours near ${resolvedName}.`
            : `Air quality is projected to remain stable near ${resolvedName}.`),
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
          data.recommended_action ||
          data.explanation?.action ||
          data.action ||
          "Maintain regular hydration and plan workouts during cleaner daylight hours.",
      };
    },
    []
  );

  const debounceTimerRef = useRef(null);
  const initialLoadRef = useRef(true);

  const currentLat = currentCoords?.lat;
  const currentLon = currentCoords?.lon;
  const currentAccuracy = currentCoords?.accuracy;
  const currentLocality = currentCoords?.locality;

  // Load and refresh live data with 15-minute cache checking
  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (dataSourceMode === "demo") {
        setForecastData(MOCK_FORECAST_DATA);
        setForecastError(null);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsRefreshing(true);
      setForecastError(null);

      try {
        let data;
        if (
          isUsingCurrentLocation &&
          currentLat !== undefined &&
          currentLon !== undefined
        ) {
          data = await fetchLiveForecastByCoords(
            currentLat,
            currentLon,
            selectedProfile,
            controller.signal,
            forceRefresh
          );
        } else {
          const locParam = selectedLocation.toLowerCase().replace(/\s+/g, "_");
          data = await fetchLiveForecast(locParam, selectedProfile, controller.signal, forceRefresh);
        }

        if (data && data.predicted_pm25 !== undefined) {
          const coordsObj = isUsingCurrentLocation && currentLat !== undefined
            ? { lat: currentLat, lon: currentLon, accuracy: currentAccuracy, locality: currentLocality }
            : null;
          const parsed = transformForecastData(
            data,
            isUsingCurrentLocation,
            coordsObj,
            selectedLocation,
            selectedProfile
          );
          setForecastData(parsed);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.warn("Forecast load warning:", err.message);
        setForecastError(err.message || "Failed to load live forecast data.");
      } finally {
        setIsRefreshing(false);
      }
    },
    [
      dataSourceMode,
      isUsingCurrentLocation,
      currentLat,
      currentLon,
      currentAccuracy,
      currentLocality,
      selectedLocation,
      selectedProfile,
      transformForecastData,
    ]
  );

  // Stable string representations for dependencies to avoid array/object reference thrashing
  const userProfileKey = `${user?.name || ""}|${user?.role || ""}|${(user?.healthSafeguards || []).join(",")}`;
  const coordsKey = isUsingCurrentLocation && currentLat !== undefined ? `${currentLat.toFixed(3)},${currentLon?.toFixed(3)}` : "manual";

  useEffect(() => {
    // Initial load executes immediately
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      loadData(false);
      return;
    }

    // Debounce any API calls triggered by profile setting or location changes (1000ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadData(false);
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    loadData,
    selectedLocation,
    selectedProfile,
    coordsKey,
    userProfileKey,
  ]);

  // Handler for selecting Current Location (GPS)
  const handleSelectCurrentLocation = useCallback(
    async ({ lat, lon, accuracy }) => {
      setIsUsingCurrentLocation(true);
      const initialCoords = { lat, lon, accuracy, locality: "Locating..." };
      setCurrentCoords(initialCoords);
      setForecastError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsRefreshing(true);
      try {
        const data = await fetchLiveForecastByCoords(lat, lon, selectedProfile, controller.signal);
        const resolvedName = data.location || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        const updatedCoords = { lat, lon, accuracy, locality: resolvedName };

        setCurrentCoords(updatedCoords);
        setSelectedLocation(resolvedName);

        if (data && data.predicted_pm25 !== undefined) {
          const parsed = transformForecastData(data, true, updatedCoords, resolvedName, selectedProfile);
          setForecastData(parsed);
        }
        return data;
      } catch (err) {
        if (err.name === "AbortError") return null;
        setForecastError(err.message || "Could not retrieve live forecast for coordinates.");
        throw err;
      } finally {
        setIsRefreshing(false);
      }
    },
    [selectedProfile, transformForecastData]
  );

  // Handler for manual location selection
  const handleSelectManualLocation = useCallback((newLocation) => {
    setIsUsingCurrentLocation(false);
    setSelectedLocation(newLocation);
    setForecastError(null);
  }, []);

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
      {/* Dev Shortcut Feedback Toast */}
      {devShortcutToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-800/95 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700 pointer-events-none animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>{devShortcutToast}</span>
        </div>
      )}

      {/* Desktop Screen Switcher Bar (Hidden by default for clean pitch view) */}
      {showDevBar && (
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
          onClose={() => setShowDevBar(false)}
        />
      )}

      {/* Main App Container */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-4 md:p-6">
        <main
          className={`${
            isDeviceFrame
              ? "mobile-device-frame"
              : "w-full max-w-xl min-h-[90vh] bg-slate-50 sm:rounded-3xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden"
          } transition-all duration-300 relative`}
        >
          {/* Mobile Top Status Bar (Only shown in desktop frame mockup; real phones use native device status bar) */}
          {isDeviceFrame && (
            <div className="hidden sm:block">
              <MobileStatusBar />
            </div>
          )}

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
                isUsingCurrentLocation={isUsingCurrentLocation}
                currentCoords={currentCoords}
                forecastError={forecastError}
                onRetryForecast={() => loadData(true)}
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
                isUsingCurrentLocation={isUsingCurrentLocation}
                currentCoords={currentCoords}
              />
            )}

            {currentScreen === "why" && <WhyScreen onBack={popScreen} />}

            {currentScreen === "map" && (
              <MapScreen
                onSelectLocationNode={(node) => {
                  handleSelectManualLocation(node.shortName);
                  pushScreen("home");
                }}
                isUsingCurrentLocation={isUsingCurrentLocation}
                currentCoords={currentCoords}
                locationName={selectedLocation}
                onUseCurrentLocation={() => pushScreen("location")}
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
                onSelectLocation={handleSelectManualLocation}
                onBack={popScreen}
                isUsingCurrentLocation={isUsingCurrentLocation}
                currentCoords={currentCoords}
                onSelectCurrentLocation={handleSelectCurrentLocation}
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
