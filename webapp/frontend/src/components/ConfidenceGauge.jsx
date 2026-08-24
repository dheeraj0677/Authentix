import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, Activity, Sparkles, Flame, CheckCircle2, Cpu, Zap, Radio } from 'lucide-react';

export default function ConfidenceGauge({ prediction, confidence, isReal }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Smooth count-up effect
  useEffect(() => {
    let start = 0;
    const end = parseFloat(confidence) || 0;
    const duration = 1100; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedValue(end);
        clearInterval(timer);
      } else {
        setAnimatedValue(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [confidence]);

  // Risk Rating Calculation
  let riskLevel = 'LOW RISK';
  let riskColor = 'text-emerald-400';
  let riskBorder = 'border-emerald-500/40 bg-emerald-500/15 shadow-neon-emerald';
  let RiskIcon = ShieldCheck;
  let summaryText = 'Neural network inference confirms biological facial textures, coherent ocular reflections, and organic spatial edge gradients with zero synthetic manipulation signatures.';

  if (!isReal) {
    if (confidence >= 85) {
      riskLevel = 'CRITICAL SYNTHETIC ANOMALIES';
      riskColor = 'text-pink-400';
      riskBorder = 'border-pink-500/50 bg-pink-500/15 shadow-neon-pink';
      RiskIcon = AlertOctagon;
      summaryText = 'Critical level synthetic deepfake patterns detected. Convolutional feature maps indicate GAN boundary blending, spatial frequency distortions, and facial reconstruction artifacts.';
    } else if (confidence >= 65) {
      riskLevel = 'HIGH MANIPULATION SUSPICION';
      riskColor = 'text-rose-400';
      riskBorder = 'border-rose-500/40 bg-rose-500/15';
      RiskIcon = ShieldAlert;
      summaryText = 'Significant synthetic media patterns detected across critical facial keypoints and texture boundaries.';
    } else {
      riskLevel = 'MODERATE PIXEL DISTORTION';
      riskColor = 'text-amber-400';
      riskBorder = 'border-amber-500/40 bg-amber-500/15 shadow-neon-amber';
      RiskIcon = AlertTriangle;
      summaryText = 'Subtle pixel distribution anomalies spotted. Review Grad-CAM heatmaps for localized spatial inspection.';
    }
  } else {
    if (confidence < 70) {
      riskLevel = 'PROBABLE AUTHENTIC (MODERATE)';
      riskColor = 'text-amber-400';
      riskBorder = 'border-amber-500/40 bg-amber-500/15';
      RiskIcon = AlertTriangle;
      summaryText = 'Media classified as authentic with moderate model confidence. Minor compression noise detected.';
    } else {
      riskLevel = 'AUTHENTIC MEDIA VERIFIED';
      riskColor = 'text-emerald-400';
      riskBorder = 'border-emerald-500/40 bg-emerald-500/15 shadow-neon-emerald';
      RiskIcon = ShieldCheck;
      summaryText = 'Transfer-learning convolutional filters confirm authentic biometric facial geometry, natural lighting, and zero GAN artifacts.';
    }
  }

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl holo-glass border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl hud-box transition-all duration-300">
      
      {/* Background ambient glow */}
      <div className={`absolute -right-20 -bottom-20 w-72 h-72 rounded-full blur-3xl pointer-events-none ${isReal ? 'bg-emerald-500/15' : 'bg-pink-500/15'}`} />

      {/* Radial Cyber Circular Ring */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className={`absolute w-48 h-48 rounded-full blur-2xl opacity-50 ${isReal ? 'bg-emerald-500/30' : 'bg-pink-500/30'}`} />
        
        <svg className="w-48 h-48 transform -rotate-90 relative z-10">
          {/* Background Outer Ring */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            className="text-slate-800/80"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Inner tick track */}
          <circle
            cx="96"
            cy="96"
            r={radius - 12}
            stroke="currentColor"
            className="text-cyan-500/20"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            fill="transparent"
          />
          {/* Animated Value Progress Ring */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={isReal ? 'url(#emeraldCyberGradient)' : 'url(#roseCyberGradient)'}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out filter drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]"
          />
          <defs>
            <linearGradient id="emeraldCyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#39ff14" />
            </linearGradient>
            <linearGradient id="roseCyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" />
              <stop offset="50%" stopColor="#ff007f" />
              <stop offset="100%" stopColor="#b026ff" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center z-20">
          <span className={`text-4xl font-black tracking-tight font-orbitron ${isReal ? 'text-glow-emerald text-emerald-300' : 'text-glow-pink text-pink-300'}`}>
            {animatedValue.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-widest font-bold mt-1">
            Neural Confidence
          </span>
        </div>
      </div>

      {/* Right Column: Prediction Details & Risk Status */}
      <div className="flex-1 space-y-4 text-center md:text-left z-10">
        
        {/* Main Verdict Label */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-4">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">Classification:</span>
            <span className={`text-3xl sm:text-4xl font-black font-orbitron tracking-wider ${isReal ? 'text-emerald-400 text-glow-emerald' : 'text-pink-400 text-glow-pink'}`}>
              {prediction}
            </span>
          </div>

          <span className={`inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full border text-xs font-orbitron font-bold tracking-wider ${riskBorder}`}>
            <RiskIcon className={`w-4 h-4 ${riskColor}`} />
            <span className={riskColor}>{riskLevel}</span>
          </span>
        </div>

        {/* Diagnostic Explanation Paragraph */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-mono bg-[#050c1e]/90 p-4 rounded-2xl border border-cyan-500/20 shadow-inner">
          {summaryText}
        </p>

        {/* Biometric Telemetry Micro-Badges */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-[11px] font-mono text-slate-300 pt-1">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>TTA: Active (5x Transforms)</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Grad-CAM: High-Res Map</span>
          </span>
          <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Input: 380&times;380 Dynamic</span>
          </span>
        </div>

      </div>

    </div>
  );
}

