import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Radio,
  Play,
  Square,
  Send,
  Database,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Cpu,
  Wifi,
} from "lucide-react";
import { sendTelemetryReading } from "../api/atmosApi";

export default function TelemetryStreamer({ locations, selectedLocation }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamLog, setStreamLog] = useState([
    {
      id: "init-01",
      node_id: "peenya",
      timestamp: new Date(Date.now() - 20000).toISOString(),
      pm25: 78.4,
      pm10: 125.1,
      temperature: 28.2,
      humidity: 62.0,
      dynamodb_synced: false,
      message: "Initial telemetry packet registered in local memory buffer.",
    },
    {
      id: "init-02",
      node_id: "silk_board",
      timestamp: new Date(Date.now() - 10000).toISOString(),
      pm25: 94.6,
      pm10: 151.2,
      temperature: 27.8,
      humidity: 65.5,
      dynamodb_synced: false,
      message: "Rush-hour surge telemetry packet broadcasted.",
    },
  ]);

  const [customNode, setCustomNode] = useState(selectedLocation || "silk_board");
  const [customPm25, setCustomPm25] = useState(85.0);
  const [customPm10, setCustomPm10] = useState(136.0);
  const [customTemp, setCustomTemp] = useState(28.0);
  const [customHumidity, setCustomHumidity] = useState(60.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const streamIntervalRef = useRef(null);

  // Automatically broadcast simulated packets when streaming is active
  useEffect(() => {
    if (isStreaming) {
      streamIntervalRef.current = setInterval(async () => {
        const nodes = ["peenya", "silk_board", "yelahanka"];
        const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
        const hour = new Date().getHours();
        const isRush = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);

        let basePm = targetNode === "peenya" ? 75 : targetNode === "silk_board" ? 85 : 35;
        if (isRush) basePm += Math.random() * 30 + 15;
        const currentPm25 = Math.round((basePm + (Math.random() * 8 - 4)) * 10) / 10;
        const currentPm10 = Math.round(currentPm25 * 1.6 * 10) / 10;

        const packet = {
          node_id: targetNode,
          timestamp: new Date().toISOString(),
          pm25: currentPm25,
          pm10: currentPm10,
          temperature: Math.round((27 + (Math.random() * 3 - 1.5)) * 10) / 10,
          humidity: Math.round((62 + (Math.random() * 8 - 4)) * 10) / 10,
        };

        const res = await sendTelemetryReading(packet);
        setStreamLog((prev) => [
          {
            id: `pkt-${Date.now()}-${Math.random()}`,
            ...packet,
            dynamodb_synced: res?.dynamodb_synced || false,
            message: res?.message || "Broadcasted packet",
          },
          ...prev.slice(0, 49),
        ]);
      }, 3500);
    } else {
      clearInterval(streamIntervalRef.current);
    }

    return () => clearInterval(streamIntervalRef.current);
  }, [isStreaming]);

  const handleManualSend = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const packet = {
      node_id: customNode,
      timestamp: new Date().toISOString(),
      pm25: Number(customPm25),
      pm10: Number(customPm10),
      temperature: Number(customTemp),
      humidity: Number(customHumidity),
    };

    const res = await sendTelemetryReading(packet);
    setStreamLog((prev) => [
      {
        id: `manual-${Date.now()}`,
        ...packet,
        dynamodb_synced: res?.dynamodb_synced || false,
        message: "Manually injected telemetry packet: " + (res?.message || "Saved"),
      },
      ...prev.slice(0, 49),
    ]);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                IoT Edge Hardware Telemetry Streamer
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Broadcasting simulated Bengaluru sensor telemetry to FastAPI backend and AWS DynamoDB table.
              Mimics hardware nodes deploying diurnal rush-hour surges.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg cursor-pointer ${
                isStreaming
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20"
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Halt Broadcast</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Start Live IoT Stream</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Manual Injector Form on Left, Scrolling Log on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Manual Inject Form */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            Inject Custom Sensor Reading
          </h4>

          <form onSubmit={handleManualSend} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Target Sensor Node
              </label>
              <select
                value={customNode}
                onChange={(e) => setCustomNode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  PM2.5 (µg/m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customPm25}
                  onChange={(e) => setCustomPm25(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  PM10 (µg/m³)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customPm10}
                  onChange={(e) => setCustomPm10(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={customTemp}
                  onChange={(e) => setCustomTemp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={customHumidity}
                  onChange={(e) => setCustomHumidity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Telemetry Packet</span>
            </button>
          </form>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Endpoint Target:</span>
            <code className="text-cyan-300">POST /api/telemetry</code>
            <p className="text-slate-500 mt-1">
              Synchronously routed to DynamoDB table or in-memory fallback buffer.
            </p>
          </div>
        </div>

        {/* Right: Scrolling Stream Inspector */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${isStreaming ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                <span className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Telemetry Stream Log ({streamLog.length} Packets)
                </span>
              </div>
              <button
                onClick={() => setStreamLog([])}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {/* Scroll Area */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {streamLog.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-mono">
                  No telemetry packets in memory. Click "Start Live IoT Stream" above.
                </div>
              ) : (
                streamLog.map((pkt) => (
                  <div
                    key={pkt.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 uppercase font-bold">
                          {pkt.node_id}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(pkt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          pkt.dynamodb_synced
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                            : "bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                        }`}
                      >
                        {pkt.dynamodb_synced ? "DynamoDB Synced" : "Memory Buffer"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-300 pt-1">
                      <span>PM2.5: <strong className="text-amber-400">{pkt.pm25}</strong></span>
                      <span>PM10: <strong className="text-slate-200">{pkt.pm10}</strong></span>
                      {pkt.temperature && <span>Temp: {pkt.temperature}°C</span>}
                      {pkt.humidity && <span>Hum: {pkt.humidity}%</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
