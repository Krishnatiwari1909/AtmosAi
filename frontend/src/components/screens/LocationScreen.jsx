import React, { useState } from "react";
import {
  ChevronLeft,
  Search,
  Navigation,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { MOCK_LOCATIONS } from "../../data/mockData";

export default function LocationScreen({
  selectedLocation = "Bengaluru",
  onSelectLocation,
  onBack,
  isUsingCurrentLocation = false,
  currentCoords = null,
  onSelectCurrentLocation,
}) {
  const [currentLoc, setCurrentLoc] = useState(
    isUsingCurrentLocation ? "Current Location (GPS)" : selectedLocation
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [geoState, setGeoState] = useState("idle"); // 'idle' | 'acquiring_gps' | 'fetching_forecast' | 'error' | 'success'
  const [geoError, setGeoError] = useState(null);

  const popular = MOCK_LOCATIONS.filter((l) => l.isPopular);
  const others = MOCK_LOCATIONS.filter((l) => !l.isPopular);

  const filterList = (list) =>
    list.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredPopular = filterList(popular);
  const filteredOthers = filterList(others);

  const formatCoordDisplay = (lat, lon) => {
    if (lat === undefined || lon === undefined) return "";
    const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
    const lonStr = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
    return `${latStr}, ${lonStr}`;
  };

  const handleUseCurrentLocation = () => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError(
        "Geolocation is not supported by your current browser. Please choose a city from the list below."
      );
      setGeoState("error");
      return;
    }

    setGeoState("acquiring_gps");

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGeoState("fetching_forecast");

        try {
          if (onSelectCurrentLocation) {
            await onSelectCurrentLocation({
              lat: latitude,
              lon: longitude,
              accuracy: accuracy ? Math.round(accuracy) : null,
            });
            setGeoState("success");
            onBack();
          } else {
            setGeoState("success");
          }
        } catch (err) {
          console.error("Coordinate forecast error:", err);
          setGeoError(
            err.message ||
              "Failed to retrieve air quality forecast for your coordinates. Please try again or choose a city below."
          );
          setGeoState("error");
        }
      },
      (err) => {
        console.warn("Geolocation acquisition error:", err);
        let message = "Unable to determine your location.";
        switch (err.code) {
          case 1: // PERMISSION_DENIED
            message =
              "Location permission was denied. Please allow location access in your browser settings, or select a city below.";
            break;
          case 2: // POSITION_UNAVAILABLE
            message =
              "Location unavailable. Please verify device location/GPS services are enabled, or select a city below.";
            break;
          case 3: // TIMEOUT
            message =
              "Location request timed out (10s). Please check your GPS signal or choose a city below.";
            break;
          default:
            message = err.message || "An unexpected error occurred while reading GPS.";
        }
        setGeoError(message);
        setGeoState("error");
      },
      geoOptions
    );
  };

  const handleSelectManual = (locName) => {
    setCurrentLoc(locName);
    setGeoError(null);
  };

  const handleContinue = () => {
    if (currentLoc === "Current Location (GPS)") {
      // If user clicks continue while current location was selected, invoke geolocation if not already active
      if (!isUsingCurrentLocation) {
        handleUseCurrentLocation();
        return;
      }
      onBack();
      return;
    }
    onSelectLocation(currentLoc);
    onBack();
  };

  const isLoadingGeo =
    geoState === "acquiring_gps" || geoState === "fetching_forecast";

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-6 space-y-3.5 overflow-y-auto no-scrollbar">
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

      {/* Screen Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Select Location
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Choose a monitoring station or use live GPS coordinates
        </p>
      </div>

      {/* GPS Current Location Feature Card */}
      <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/50 p-3.5 shadow-sm space-y-3">
        {/* Pre-Permission Explanation */}
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">
              Hyper-Local Atmospheric Forecasting
            </h2>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              AtmosAI uses your geographic coordinates solely to query Open-Meteo &amp; CAMS atmospheric readings at your nearest point. Precise coordinates are never stored permanently.
            </p>
          </div>
        </div>

        {/* Action Button: "📍 Use my current location" */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={isLoadingGeo}
          className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all shadow-sm focus:outline-none ${
            isUsingCurrentLocation && currentLoc === "Current Location (GPS)" && !isLoadingGeo
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20 disabled:opacity-80"
          }`}
        >
          <div className="flex items-center gap-2">
            {isLoadingGeo ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Navigation className="w-4 h-4 text-white fill-white" />
            )}
            <div className="text-left">
              <span className="block font-bold">
                {geoState === "acquiring_gps"
                  ? "Acquiring GPS coordinates..."
                  : geoState === "fetching_forecast"
                  ? "Fetching live atmospheric forecast..."
                  : isUsingCurrentLocation && currentLoc === "Current Location (GPS)"
                  ? "📍 Using Current Location (Active)"
                  : "📍 Use my current location"}
              </span>
              <span className="text-[10px] opacity-90 font-normal block">
                {isLoadingGeo
                  ? "High accuracy mode active (up to 10s timeout)"
                  : isUsingCurrentLocation && currentCoords
                  ? `${currentCoords.locality || "Current Location"} • ${formatCoordDisplay(currentCoords.lat, currentCoords.lon)}${currentCoords.accuracy ? ` (±${currentCoords.accuracy}m)` : ""}`
                  : "Tap to request permission & detect coordinates"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isLoadingGeo ? (
              <span className="text-[10px] font-medium animate-pulse">Detecting...</span>
            ) : isUsingCurrentLocation && currentLoc === "Current Location (GPS)" ? (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                Live
              </span>
            ) : (
              <span className="text-xs">→</span>
            )}
          </div>
        </button>

        {/* GPS Error Alert (User-friendly, non-blocking) */}
        {geoError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-[11px] block text-rose-900">
                Geolocation Notice
              </span>
              <p className="text-[11px] text-rose-700 leading-snug mt-0.5">
                {geoError}
              </p>
              <button
                onClick={() => setGeoError(null)}
                className="mt-1 text-[10px] font-semibold text-rose-600 hover:text-rose-900 underline"
              >
                Dismiss notice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider / Manual Selection Label */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Or Select A Monitoring Station
        </span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search city or area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Popular Locations Section */}
      {filteredPopular.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
            Popular Locations
          </h2>

          <div className="space-y-2">
            {filteredPopular.map((loc) => {
              const isSelected =
                currentLoc === loc.name &&
                (!isUsingCurrentLocation || currentLoc !== "Current Location (GPS)");

              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelectManual(loc.name)}
                  className={`app-card p-3 flex items-center justify-between border cursor-pointer transition-all shadow-sm ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/30"
                      : "border-slate-200/80 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 border border-slate-200/60 font-bold text-xs">
                      {loc.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {loc.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {loc.subtitle}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Locations Section */}
      {filteredOthers.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
            Other Locations
          </h2>

          <div className="space-y-2">
            {filteredOthers.map((loc) => {
              const isSelected =
                currentLoc === loc.name &&
                (!isUsingCurrentLocation || currentLoc !== "Current Location (GPS)");

              return (
                <div
                  key={loc.id}
                  onClick={() => handleSelectManual(loc.name)}
                  className={`app-card p-3 flex items-center justify-between border cursor-pointer transition-all shadow-sm ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500/30"
                      : "border-slate-200/80 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0 border border-slate-200/60 font-bold text-xs">
                      {loc.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {loc.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {loc.subtitle}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Primary Action Button */}
      <div className="pt-2 flex-1 flex flex-col justify-end">
        <button
          onClick={handleContinue}
          disabled={isLoadingGeo}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all focus:outline-none disabled:opacity-50"
        >
          {currentLoc === "Current Location (GPS)" ? "Apply GPS Location" : "Continue"}
        </button>
      </div>
    </div>
  );
}
