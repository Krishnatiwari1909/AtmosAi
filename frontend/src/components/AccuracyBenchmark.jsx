import React from "react";
import {
  BarChart3,
  Award,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Target,
  Flame,
} from "lucide-react";

export default function AccuracyBenchmark({ accuracyData }) {
  const data = accuracyData || {
    model_version: "lgbm-v1.0",
    evaluation_period_days: 18,
    severe_events_total: 51,
    severe_events_detected: 27,
    severe_event_recall_pct: 52.9,
    precision_pct: 65.9,
    f1_score: 0.587,
    false_alarms: 14,
    avg_lead_time_hours: 3.8,
    baseline_recall_pct: 25.5,
  };

  const improvementFactor = (
    ((data.severe_event_recall_pct - data.baseline_recall_pct) /
      data.baseline_recall_pct) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Model Evaluation & Time-Series Backtest Benchmark
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Strict out-of-time chronological backtesting evaluated over {data.evaluation_period_days} days of
              Bengaluru diurnal rush-hour pollution cycles against the CPCB severe event threshold (90 µg/m³).
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Artifact: {data.model_version}</span>
          </div>
        </div>
      </div>

      {/* High-Impact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Severe Event Recall */}
        <div className="rounded-2xl glass-panel p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Severe Surge Recall
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 rounded border border-emerald-800/40">
              +{improvementFactor}% vs Baseline
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
              {data.severe_event_recall_pct}%
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {data.severe_events_detected} of {data.severe_events_total} severe surge events detected in advance.
          </p>
        </div>

        {/* Card 2: Average Lead Time */}
        <div className="rounded-2xl glass-panel p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Early-Warning Lead Time
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono">
              {data.avg_lead_time_hours}
            </span>
            <span className="text-xs text-slate-400 font-mono">hours</span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Average advance warning provided prior to PM2.5 crossing 90 µg/m³.
          </p>
        </div>

        {/* Card 3: Model Precision */}
        <div className="rounded-2xl glass-panel p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Model Precision
            </span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mono">
              {data.precision_pct}%
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            High positive predictive value; only {data.false_alarms} false alarms across evaluation period.
          </p>
        </div>

        {/* Card 4: F1 Score */}
        <div className="rounded-2xl glass-panel p-5 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              F1 Benchmark Score
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-300 font-mono">
              {data.f1_score}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Balanced harmonic mean between sensitivity and false alarm rejection.
          </p>
        </div>

      </div>

      {/* Comparison: Naive Baseline vs AtmosAI LightGBM */}
      <div className="rounded-2xl glass-panel p-6 border border-slate-800 space-y-5">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Benchmark Comparison: Persistence Baseline vs AtmosAi LightGBM
        </h4>

        <div className="space-y-4">
          {/* AtmosAI LightGBM Model Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-emerald-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                AtmosAi LightGBM Engine (Rolling 3h Momentum + 15 Features)
              </span>
              <span className="font-mono text-emerald-400 font-bold">{data.severe_event_recall_pct}% Recall</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${data.severe_event_recall_pct}%` }}
              />
            </div>
          </div>

          {/* Naive Persistence Baseline Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Standard Persistence Baseline (Current Reading &ge; 90)
              </span>
              <span className="font-mono text-slate-400 font-bold">{data.baseline_recall_pct}% Recall</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
              <div
                className="bg-slate-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${data.baseline_recall_pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Narrative Analysis */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong>Key Finding:</strong> Traditional air-quality apps rely on static indices or simple persistence ("if it's clean now, it stays clean").
            During evening boundary-layer inversions and rush hour peaks in Bengaluru, pollution surges occur rapidly.
          </p>
          <p className="text-slate-400">
            By evaluating rolling 3-hour PM2.5 differentials, diurnal traffic hour flags, and surface wind ventilation indices,
            <strong> AtmosAi doubles detection recall from 25.5% to 52.9%</strong>, providing vulnerable demographics nearly 4 hours of actionable advance warning.
          </p>
        </div>
      </div>
    </div>
  );
}
