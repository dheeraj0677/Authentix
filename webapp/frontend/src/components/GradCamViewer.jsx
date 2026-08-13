import React from 'react';
import { Flame, AlertTriangle, Info } from 'lucide-react';
import { getGradCamUrl } from '../utils/api';
import BeforeAfterSlider from './BeforeAfterSlider';

export default function GradCamViewer({ originalFileUrl, gradcamUrl, gradcamFailed = false, isVideo = false }) {
  if (!originalFileUrl && !gradcamUrl) return null;

  const fullGradcamUrl = getGradCamUrl(gradcamUrl);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-zinc-800/80 bg-zinc-950/90 space-y-6 shadow-2xl animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Grad-CAM Explainability Activation Map</span>
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {isVideo ? 'Most Suspicious Frame — ' : ''}Convolutional Feature Gradient Activation Overlay
          </p>
        </div>
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono w-fit">
          <span>XAI Module 1</span>
        </span>
      </div>

      {/* Grad-CAM failure fallback */}
      {gradcamFailed ? (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono">
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
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Grad-CAM Jet Colormap Intensity Legend:</span>
          </span>
          <span className="text-amber-400 font-bold text-[11px]">Attention Heatmap</span>
        </div>

        {/* Gradient Color Scale Bar */}
        <div className="relative w-full h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />

        <div className="flex justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
          <span>🔵 Low Attention (Natural background)</span>
          <span>🟡 Moderate Neural Weight</span>
          <span>🔴 High Artifact Attention (DeepFake region)</span>
        </div>
      </div>

    </div>
  );
}

