import React, { useState } from 'react';
import {
  Brain,
  Layers,
  Target,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  Cpu,
  Zap
} from 'lucide-react';
import { getGradCamUrl } from '../utils/api';

export default function ExplainableAIViewer({ xaiData, prediction, confidence, fileHash, gradcamUrl, gradcamFailed }) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showActivations, setShowActivations] = useState(true);

  if (!xaiData) return null;

  const { layer_activations, confidence_region, explanation_text } = xaiData;
  const isFake = prediction === 'FAKE';

  const handleExportPdf = () => {
    if (!fileHash) return;
    const reportUrl = `http://localhost:8000/report/pdf/${fileHash}`;
    window.open(reportUrl, '_blank');
  };

  return (
    <div className="holo-card-purple rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-2xl transition-all duration-300 hud-box">
      
      {/* Title & Interactive Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono mb-1">
            <Brain className="w-4 h-4" />
            <span className="uppercase font-bold tracking-wider">Explainable AI (XAI) Deep Inspection</span>
          </div>
          <h2 className="text-xl font-bold text-white font-orbitron flex items-center space-x-2">
            <span>Model Attention &amp; Feature Diagnostic</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-orbitron font-bold tracking-wider transition-all cursor-pointer shadow-neon-purple"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export XAI PDF</span>
          </button>
        </div>
      </div>

      {/* Interactive Feature Toggle Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[#050c1e]/90 border border-purple-500/20 font-mono text-xs">
        <span className="text-slate-300 flex items-center space-x-1.5 font-bold">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive XAI Layers:</span>
        </span>

        <button
          onClick={() => setShowHeatmap((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
            showHeatmap
              ? 'bg-purple-500/25 text-purple-200 border-purple-500/50 shadow-neon-purple'
              : 'bg-[#020617] text-slate-400 border-purple-500/20'
          }`}
        >
          {showHeatmap ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Grad-CAM Heatmap</span>
        </button>

        <button
          onClick={() => setShowBoundingBox((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
            showBoundingBox
              ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-neon-amber'
              : 'bg-[#020617] text-slate-400 border-amber-500/20'
          }`}
        >
          {showBoundingBox ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Confidence Region Box</span>
        </button>

        <button
          onClick={() => setShowActivations((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
            showActivations
              ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500/50 shadow-neon-cyan'
              : 'bg-[#020617] text-slate-400 border-cyan-500/20'
          }`}
        >
          {showActivations ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Layer Activations Graph</span>
        </button>
      </div>

      {/* Main Grid: Heatmap + Bounding Box Canvas Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Visual Heatmap & Bounding Box Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center space-x-1.5 font-bold">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Attention Region Heatmap Overlay</span>
            </span>
            <span className="text-[10px] text-purple-400 font-bold">224x224 Receptive Field</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#020617] aspect-video flex items-center justify-center group shadow-xl">
            {/* Base Grad-CAM Image */}
            {showHeatmap && gradcamUrl ? (
              <img
                src={getGradCamUrl(gradcamUrl)}
                alt="Grad-CAM Heatmap Overlay"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="p-8 text-center text-slate-400 font-mono text-xs">
                Heatmap Overlay Toggled Off
              </div>
            )}

            {/* Bounding Box Overlay for Highest Confidence Region */}
            {showBoundingBox && confidence_region && (
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-md animate-pulse shadow-[0_0_15px_#ffb800] flex items-start justify-start p-1"
                style={{
                  left: `${(confidence_region.x / 224) * 100}%`,
                  top: `${(confidence_region.y / 224) * 100}%`,
                  width: `${(confidence_region.width / 224) * 100}%`,
                  height: `${(confidence_region.height / 224) * 100}%`,
                }}
              >
                <span className="bg-amber-400 text-black font-mono text-[9px] font-bold px-1.5 rounded shadow">
                  Region ({confidence_region.attention_density}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Plain-Text Explanation & Bounding Box Specs */}
        <div className="space-y-4 flex flex-col justify-between font-mono text-xs">
          
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-purple-300 font-bold uppercase text-[11px] font-orbitron">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Natural Language Model Explanation</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              {explanation_text}
            </p>
          </div>

          {/* Bounding Box Specification Details */}
          <div className="p-4 rounded-2xl bg-[#050c1e]/90 border border-purple-500/20 space-y-2">
            <div className="flex items-center justify-between text-amber-300 font-bold text-[11px] uppercase font-orbitron">
              <span className="flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>Confidence Bounding Box Spec</span>
              </span>
              <span>Density: {confidence_region?.attention_density}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
              <div>X Coordinate: <span className="text-cyan-300 font-bold">{confidence_region?.x} px</span></div>
              <div>Y Coordinate: <span className="text-cyan-300 font-bold">{confidence_region?.y} px</span></div>
              <div>Region Width: <span className="text-cyan-300 font-bold">{confidence_region?.width} px</span></div>
              <div>Region Height: <span className="text-cyan-300 font-bold">{confidence_region?.height} px</span></div>
            </div>
          </div>

        </div>

      </div>

      {/* Layer Activations Graph */}
      {showActivations && (
        <div className="p-5 rounded-2xl bg-[#050c1e]/90 border border-cyan-500/20 space-y-3.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2.5">
            <span className="font-extrabold text-cyan-400 uppercase tracking-wider flex items-center space-x-2 font-orbitron">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>EfficientNetB4 Convolutional Layer Activations</span>
            </span>
            <span className="text-slate-400 text-[10px]">Feature Map Gradient Norms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {layer_activations.map((layer) => (
              <div key={layer.layer_name} className="p-3.5 rounded-xl bg-[#020617] border border-cyan-500/20 space-y-1.5 shadow-sm">
                <span className="text-slate-300 text-[11px] font-bold block truncate">{layer.layer_name}</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 font-bold">{layer.mean_activation}</span>
                  <span className="text-slate-400 text-[10px]">{layer.feature_maps} maps</span>
                </div>
                <div className="w-full h-2 bg-[#050c1e] rounded-full overflow-hidden border border-cyan-500/15">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                    style={{ width: `${Math.min(100, layer.mean_activation * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

