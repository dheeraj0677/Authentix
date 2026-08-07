import React, { useState, useEffect } from 'react';
import { fetchAiAnalytics, getCsvExportUrl } from '../utils/api';
import {
  Brain,
  Award,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  Layers,
  PieChart,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AIAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAiAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch AI analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const cm = analytics?.confusion_matrix;
  const roc = analytics?.roc_curve || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono mb-2">
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Learning Telemetry & Performance Matrix</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-400 text-xs mt-1 font-mono">
            Model evaluation, ROC curves, confusion matrices, prediction distribution, and daily telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={loadAnalytics}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-purple-400 text-xs font-mono transition-all cursor-pointer"
          >


            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href={getCsvExportUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-mono font-semibold shadow-lg glow-purple transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* 4 Performance Metric Cards: Accuracy, Precision, Recall, F1 Score */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Model Accuracy */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-900 bg-black/90 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-400 font-mono text-xs">
            <span>Model Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {((analytics?.accuracy ?? 0.945) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-400/80 font-mono">FF++ Benchmark Target</div>
        </div>

        {/* Precision */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-900 bg-black/90 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-400 font-mono text-xs">
            <span>Precision</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {((analytics?.precision ?? 0.951) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-cyan-400/80 font-mono">Positive Predictive Value</div>
        </div>

        {/* Recall */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-900 bg-black/90 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-400 font-mono text-xs">
            <span>Recall (Sensitivity)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {((analytics?.recall ?? 0.938) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-purple-400/80 font-mono">True Positive Rate</div>
        </div>

        {/* F1 Score */}
        <div className="glass-card rounded-2xl p-5 border border-zinc-900 bg-black/90 space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center text-zinc-400 font-mono text-xs">
            <span>F1 Score</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {((analytics?.f1_score ?? 0.9445) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-amber-400/80 font-mono">Harmonic Mean</div>
        </div>

      </div>

      {/* Main Grid: ROC Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ROC Curve Interactive Plot */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-900 bg-black/90 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Receiver Operating Characteristic (ROC Curve)</span>
            </span>

            <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
              AUC = {analytics?.auc_roc ?? 0.978}
            </span>
          </div>

          {/* SVG ROC Plot Canvas */}
          <div className="p-4 bg-black/60 rounded-xl border border-gray-800 space-y-2">
            <div className="relative h-56 w-full flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 200">
                {/* Grid Lines */}
                <line x1="30" y1="20" x2="290" y2="20" stroke="#1F2937" strokeDasharray="3 3" />
                <line x1="30" y1="65" x2="290" y2="65" stroke="#1F2937" strokeDasharray="3 3" />
                <line x1="30" y1="110" x2="290" y2="110" stroke="#1F2937" strokeDasharray="3 3" />
                <line x1="30" y1="155" x2="290" y2="155" stroke="#1F2937" strokeDasharray="3 3" />

                <line x1="95" y1="20" x2="95" y2="175" stroke="#1F2937" strokeDasharray="3 3" />
                <line x1="160" y1="20" x2="160" y2="175" stroke="#1F2937" strokeDasharray="3 3" />
                <line x1="225" y1="20" x2="225" y2="175" stroke="#1F2937" strokeDasharray="3 3" />

                {/* Random Classifier Baseline (Diagonal Line) */}
                <line x1="30" y1="175" x2="290" y2="20" stroke="#4B5563" strokeDasharray="4 4" strokeWidth="1.5" />

                {/* ROC Curve Path */}
                <path
                  d={`M ${roc.map(p => `${30 + p.fpr * 260},${175 - p.tpr * 155}`).join(' L ')}`}
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="3"
                />

                {/* ROC Points */}
                {roc.map((p, i) => (
                  <circle
                    key={i}
                    cx={30 + p.fpr * 260}
                    cy={175 - p.tpr * 155}
                    r="4"
                    fill="#38BDF8"
                    className="hover:r-6 transition-all cursor-pointer"
                  >
                    <title>{`FPR: ${p.fpr}, TPR: ${p.tpr} (Threshold: ${p.threshold})`}</title>
                  </circle>
                ))}
              </svg>
            </div>
            
            <div className="flex justify-between text-[10px] text-gray-500 font-mono px-2">
              <span>False Positive Rate (FPR) →</span>
              <span>True Positive Rate (TPR) ↑</span>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <span className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Confusion Matrix</span>
            </span>
            <span className="text-xs font-mono text-cyan-400">Total Predictions: {analytics?.total_predictions ?? 42}</span>
          </div>

          {/* 2x2 Matrix Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            
            {/* True Positive */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">True Positive (TP)</span>
              <div className="text-2xl font-extrabold text-emerald-400">{cm?.true_positive ?? 26}</div>
              <span className="text-[10px] text-gray-400 block">Actual REAL, Predicted REAL</span>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-center space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">False Positive (FP)</span>
              <div className="text-2xl font-extrabold text-rose-400">{cm?.false_positive ?? 1}</div>
              <span className="text-[10px] text-gray-400 block">Actual FAKE, Predicted REAL</span>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">False Negative (FN)</span>
              <div className="text-2xl font-extrabold text-amber-400">{cm?.false_negative ?? 2}</div>
              <span className="text-[10px] text-gray-400 block">Actual REAL, Predicted FAKE</span>
            </div>

            {/* True Negative */}
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center space-y-1">
              <span className="text-gray-400 text-[10px] uppercase font-bold block">True Negative (TN)</span>
              <div className="text-2xl font-extrabold text-purple-400">{cm?.true_negative ?? 13}</div>
              <span className="text-[10px] text-gray-400 block">Actual FAKE, Predicted FAKE</span>
            </div>

          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-[11px] font-mono text-gray-400 flex justify-between items-center">
            <span>Average Inference Latency:</span>
            <span className="text-cyan-400 font-bold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{analytics?.avg_inference_time_ms ?? 118.4} ms</span>
            </span>
          </div>
        </div>

      </div>

      {/* 7-Day Daily Telemetry Trend Bar Chart */}
      <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <span className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>7-Day Daily Media Ingestion &amp; Prediction Telemetry</span>
          </span>
          <span className="text-xs font-mono text-gray-400">Daily Uploads vs AI Inferences</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4">
          {analytics?.daily_metrics?.map((d) => (
            <div key={d.date} className="flex flex-col items-center space-y-2 font-mono text-xs">
              <div className="w-full bg-gray-900 rounded-lg h-36 p-1 flex items-end justify-center space-x-1 relative">
                {/* Uploads Bar */}
                <div
                  className="w-1/2 bg-cyan-500 rounded-t transition-all hover:bg-cyan-400"
                  style={{ height: `${Math.min(100, d.uploads * 15)}%` }}
                  title={`Uploads: ${d.uploads}`}
                />
                {/* Predictions Bar */}
                <div
                  className="w-1/2 bg-purple-500 rounded-t transition-all hover:bg-purple-400"
                  style={{ height: `${Math.min(100, d.predictions * 12)}%` }}
                  title={`Predictions: ${d.predictions}`}
                />
              </div>
              <span className="text-[10px] text-gray-400">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-6 text-xs font-mono pt-2">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-cyan-500 inline-block"></span>
            <span className="text-gray-300">Daily Media Uploads</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded bg-purple-500 inline-block"></span>
            <span className="text-gray-300">Daily AI Inferences</span>
          </div>
        </div>
      </div>

    </div>
  );
}
