import React from 'react';
import { Flame, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { getGradCamUrl } from '../utils/api';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function GradCamViewer({ originalFileUrl, gradcamUrl, gradcamFailed = false, isVideo = false }) {
  if (!originalFileUrl && !gradcamUrl) return null;

  const fullGradcamUrl = getGradCamUrl(gradcamUrl);

  return (
    <div className="holo-glass rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-[#050c1e]/90 space-y-6 shadow-2xl animate-fadeIn transition-all duration-300 hud-box">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white font-orbitron tracking-wider flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Grad-CAM Explainability Activation Map</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {isVideo ? 'Most Suspicious Frame &bull; ' : ''}Convolutional Feature Gradient Activation Overlay
          </p>
        </div>
        <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold w-fit shadow-neon-amber">
          <span>XAI Module 1</span>
        </span>
      </div>

      {/* Grad-CAM failure fallback */}
      {gradcamFailed ? (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Grad-CAM generation issue — original image is displayed. Ensure the DL model is trained and active.</span>
        </div>
      ) : (
        /* Interactive Before/After Split Slider */
        <BeforeAfterSlider
          originalUrl={originalFileUrl}
          gradcamUrl={fullGradcamUrl}
          isVideo={isVideo}
        />
      )}

      {/* Color Map Legend Bar */}
      <div className="p-4 rounded-2xl bg-[#020617] border border-amber-500/20 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 flex items-center space-x-1.5 font-bold">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grad-CAM Jet Colormap Intensity Scale:</span>
          </span>
          <span className="text-amber-400 font-bold text-[11px] font-orbitron">Neural Activation</span>
        </div>

        {/* Gradient Color Scale Bar */}
        <div className="relative w-full h-3.5 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />

        <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
          <span>🔵 Low Attention (Natural context)</span>
          <span>🟡 Moderate Weight</span>
          <span>🔴 High Artifact Focus (Synthetic anomaly)</span>
        </div>
      </div>

    </div>
  );
}

