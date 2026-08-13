import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function ConfidenceGauge({ prediction, confidence, isReal }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Smooth count-up effect
  useEffect(() => {
    let start = 0;
    const end = parseFloat(confidence) || 0;
    const duration = 1200; // ms
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
  let riskLevel = 'LOW';
  let riskColor = 'text-emerald-400';
  let riskBg = 'bg-emerald-500/10 border-emerald-500/30';
  let RiskIcon = ShieldCheck;

  if (!isReal) {
    if (confidence >= 85) {
      riskLevel = 'CRITICAL DEEPFAKE RISK';
      riskColor = 'text-rose-500';
      riskBg = 'bg-rose-950/60 border-rose-500/40 glow-rose';
      RiskIcon = AlertOctagon;
    } else if (confidence >= 65) {
      riskLevel = 'HIGH MANIPULATION RISK';
      riskColor = 'text-rose-400';
      riskBg = 'bg-rose-900/40 border-rose-500/30';
      RiskIcon = ShieldAlert;
    } else {
      riskLevel = 'MODERATE SUSPICION';
      riskColor = 'text-amber-400';
      riskBg = 'bg-amber-950/40 border-amber-500/30';
      RiskIcon = AlertTriangle;
    }
  } else {
    if (confidence < 70) {
      riskLevel = 'LOW CONFIDENCE AUTHENTIC';
      riskColor = 'text-amber-400';
      riskBg = 'bg-amber-950/30 border-amber-500/20';
      RiskIcon = AlertTriangle;
    } else {
      riskLevel = 'AUTHENTIC MEDIA VERIFIED';
      riskColor = 'text-emerald-400';
      riskBg = 'bg-emerald-950/40 border-emerald-500/30 glow-emerald';
      RiskIcon = ShieldCheck;
    }
  }

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-6 sm:space-y-0 sm:space-x-8">
      
      {/* Circular Gauge Arc */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#18181b"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={isReal ? 'url(#emeraldGradient)' : 'url(#roseGradient)'}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold tracking-tight font-mono ${isReal ? 'text-emerald-400' : 'text-rose-400'}`}>
            {animatedValue.toFixed(1)}%
          </span>
          <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-widest mt-0.5">
            Confidence
          </span>
        </div>
      </div>

      {/* Text Details & Risk Badge */}
      <div className="flex-1 space-y-3 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start space-x-2">
          <span className={`text-3xl font-black tracking-wide uppercase ${isReal ? 'text-emerald-400' : 'text-rose-400'}`}>
            {prediction}
          </span>
        </div>

        {/* Risk Level Badge */}
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold ${riskBg}`}>
          <RiskIcon className={`w-4 h-4 ${riskColor}`} />
          <span className={riskColor}>{riskLevel}</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-mono">
          {isReal
            ? 'Neural network analysis confirms natural biological facial structures and consistent lighting gradients.'
            : 'Deep learning classification detected high-frequency neural artifacts characteristic of AI face-swapping pipelines.'}
        </p>
      </div>

    </div>
  );
}
