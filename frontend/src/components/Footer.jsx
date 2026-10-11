import React from "react";
import { Wind, Shield, Heart, Sparkles, ExternalLink, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Left: Brand & Hackathon */}
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-base font-bold text-white tracking-tight">AtmosAi</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-mono">
                Team TechinX
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Built for <strong className="text-slate-300">AWS Environmental Hacks 2026</strong>. Localized air quality surge early-warning system.
            </p>
          </div>

          {/* Center: Tech Stack Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              FastAPI
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
              LightGBM
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">
              AWS Bedrock Claude Sonnet
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-300">
              DynamoDB
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-300">
              Open-Meteo & OpenAQ
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300">
              MQTT Simulator
            </span>
          </div>

          {/* Right: API Docs Link */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-cyan-400 transition"
            >
              <span>Swagger API Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-900/60 text-center text-xs text-slate-500">
          © 2026 AtmosAi Team TechinX. Protecting vulnerable communities with predictive environmental intelligence.
        </div>
      </div>
    </footer>
  );
}
