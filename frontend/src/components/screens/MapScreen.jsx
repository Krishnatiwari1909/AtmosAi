import React, { useState } from "react";
import {
  Search,
  Crosshair,
  Plus,
  Minus,
  Navigation,
  Info,
} from "lucide-react";
import { MAP_NODES } from "../../data/mockData";

export default function MapScreen({
  onSelectLocationNode,
  isUsingCurrentLocation = false,
  currentCoords = null,
  locationName = "Bengaluru",
  onUseCurrentLocation = null,
}) {
  const [mapMode, setMapMode] = useState("forecast"); // 'current' or 'forecast'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState(MAP_NODES[0]); // default to Bengaluru central
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredNodes = MAP_NODES.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 1.6));
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    setSelectedNode(MAP_NODES[0]);
  };

  return (
    <div className="flex-1 flex flex-col px-4 pt-2 pb-4 space-y-3 overflow-hidden select-none">
      {/* Title */}
      <div className="pt-1">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center">
          Air Quality Map
        </h1>
      </div>

      {/* GPS Status / Reference Monitor Guidance */}
      {isUsingCurrentLocation ? (
        <div className="p-2 px-3 rounded-xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2 truncate">
            <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600 flex-shrink-0 animate-pulse" />
            <div className="truncate">
              <span className="font-bold text-[11px] block truncate">
                GPS Active: {locationName}
              </span>
              <span className="text-[10px] text-blue-700 block truncate">
                {currentCoords ? `${currentCoords.lat?.toFixed(2)}°N, ${currentCoords.lon?.toFixed(2)}°E (±${currentCoords.accuracy || 15}m)` : "Coordinates active"} • Pins show reference stations
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold flex-shrink-0">
            GPS Live
          </span>
        </div>
      ) : (
        <div className="px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">Pins show Bengaluru reference monitors</span>
          </div>
          {onUseCurrentLocation && (
            <button
              onClick={onUseCurrentLocation}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex-shrink-0 ml-2"
            >
              📍 Locate Me
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* Segmented Toggle: Current vs Forecast */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setMapMode("current")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            mapMode === "current"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Current
        </button>
        <button
          onClick={() => setMapMode("forecast")}
          className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
            mapMode === "forecast"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Forecast
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative flex-1 rounded-2xl bg-emerald-50/20 border border-slate-200/90 overflow-hidden shadow-inner flex flex-col justify-between">
        {/* SVG Topographical & Road Network Background */}
        <div
          className="absolute inset-0 transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d">
            {/* Soft grid background */}
            <defs>
              <pattern id="mapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
              </pattern>
              {/* Radial glow filter */}
              <radialGradient id="glowRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glowOrange" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="100" height="100" fill="#F8FAFC" />
            <rect width="100" height="100" fill="url(#mapGrid)" />

            {/* Major road corridors / Ring roads */}
            {/* Outer Ring Road */}
            <circle cx="50" cy="52" r="32" fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="2 1" />
            {/* Intermediate corridors */}
            <path d="M 52 5 L 50 95" stroke="#CBD5E1" strokeWidth="1.5" />
            <path d="M 10 50 L 90 54" stroke="#CBD5E1" strokeWidth="1.5" />
            <path d="M 25 35 L 75 75" stroke="#E2E8F0" strokeWidth="1.2" />
            <path d="M 25 75 L 75 35" stroke="#E2E8F0" strokeWidth="1.2" />

            {/* Sensor nodes and heat halos */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const aqiVal = mapMode === "forecast" ? Math.round(node.aqi * 1.15) : node.aqi;
              const isHighRisk = aqiVal > 140;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  {/* Heat halo */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 10 : 7}
                    fill={node.color}
                    fillOpacity={isSelected ? 0.35 : 0.2}
                    className={isHighRisk ? "animate-pulse" : ""}
                  />

                  {/* Node solid circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 3.5 : 2.5}
                    fill={node.color}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />

                  {/* Area Label */}
                  <text
                    x={node.x}
                    y={node.y + (node.id === "central" ? 8 : 6)}
                    fontSize="3"
                    fontWeight="600"
                    fill="#475569"
                    textAnchor="middle"
                  >
                    {node.shortName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Node Badge (Bengaluru AQI 142) */}
        {selectedNode && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-8 z-10 pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-rose-600 text-white shadow-lg text-[11px] font-bold flex flex-col items-center border border-white">
              <span>{selectedNode.shortName}</span>
              <span className="text-[10px] font-semibold text-rose-100">
                AQI {mapMode === "forecast" ? Math.round(selectedNode.aqi * 1.15) : selectedNode.aqi}
              </span>
            </div>
          </div>
        )}

        {/* Floating Map Controls on right */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
          {onUseCurrentLocation && (
            <button
              onClick={onUseCurrentLocation}
              className={`w-8 h-8 rounded-xl shadow-md border flex items-center justify-center transition-colors focus:outline-none ${
                isUsingCurrentLocation
                  ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                  : "bg-white border-slate-200/80 text-slate-700 hover:text-blue-600"
              }`}
              aria-label="Use Current GPS Location"
              title="Use Current GPS Location"
            >
              <Navigation className="w-4 h-4 fill-current" />
            </button>
          )}
          <button
            onClick={handleRecenter}
            className="w-8 h-8 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors focus:outline-none"
            aria-label="Recenter"
          >
            <Crosshair className="w-4 h-4 stroke-[2]" />
          </button>
          <button
            onClick={() => handleZoom(0.2)}
            className="w-8 h-8 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors focus:outline-none"
            aria-label="Zoom in"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="w-8 h-8 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors focus:outline-none"
            aria-label="Zoom out"
          >
            <Minus className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Selected Node Bottom Quick Card */}
        {selectedNode && (
          <div className="m-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md flex items-center justify-between z-20">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color }} />
                <h3 className="text-xs font-bold text-slate-900">{selectedNode.name}</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Status: {selectedNode.status} • PM2.5: {selectedNode.pm25} µg/m³
              </p>
            </div>
            <button
              onClick={() => onSelectLocationNode && onSelectLocationNode(selectedNode)}
              className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-colors focus:outline-none"
            >
              Set Location
            </button>
          </div>
        )}
      </div>

      {/* Legend Bar at Bottom */}
      <div className="app-card py-2 px-3 border border-slate-200/80 flex items-center justify-between text-[10px] font-semibold text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Good</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Poor</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Unhealthy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Very Poor</span>
        </div>
      </div>
    </div>
  );
}
