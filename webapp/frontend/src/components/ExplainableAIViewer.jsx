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
  CheckCircle2
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
    <div className="glass-card rounded-2xl p-6 border border-purple-500/30 space-y-6 animate-fadeIn glow-purple">
      
      {/* Title & Interactive Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono mb-1">
            <Brain className="w-4 h-4" />
            <span className="uppercase font-bold tracking-wider">Explainable AI (XAI) Deep Inspection</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
            <span>Model Attention &amp; Feature Diagnostic</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPdf}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold transition-all cursor-pointer shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export XAI Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Interactive Feature Toggle Controls */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800 font-mono text-xs">
        <span className="text-gray-400 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Interactive XAI Layers:</span>
        </span>

        <button
          onClick={() => setShowHeatmap((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer ${
            showHeatmap
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-gray-900 text-gray-500 border-gray-800'
          }`}
        >
          {showHeatmap ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Grad-CAM Heatmap</span>
        </button>

        <button
          onClick={() => setShowBoundingBox((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer ${
            showBoundingBox
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-gray-900 text-gray-500 border-gray-800'
          }`}
        >
          {showBoundingBox ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Confidence Region Bounding Box</span>
        </button>

        <button
          onClick={() => setShowActivations((prev) => !prev)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer ${
            showActivations
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-gray-900 text-gray-500 border-gray-800'
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
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Attention Region Heatmap Overlay</span>
            </span>
            <span className="text-[10px] text-purple-300 font-bold">224x224 Receptive Field</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-purple-500/30 bg-black aspect-video flex items-center justify-center group">
            {/* Base Grad-CAM Image */}
            {showHeatmap && gradcamUrl ? (
              <img
                src={getGradCamUrl(gradcamUrl)}
                alt="Grad-CAM Heatmap Overlay"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">
                Heatmap Overlay Toggled Off
              </div>
            )}

            {/* Bounding Box Overlay for Highest Confidence Region */}
            {showBoundingBox && confidence_region && (
              <div
                className="absolute border-2 border-amber-400 bg-amber-400/10 rounded-md animate-pulse shadow-lg glow-amber flex items-start justify-start p-1"
                style={{
                  left: `${(confidence_region.x / 224) * 100}%`,
                  top: `${(confidence_region.y / 224) * 100}%`,
                  width: `${(confidence_region.width / 224) * 100}%`,
                  height: `${(confidence_region.height / 224) * 100}%`,
                }}
              >
                <span className="bg-amber-400 text-black font-mono text-[9px] font-bold px-1 rounded shadow">
                  Region ({confidence_region.attention_density}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Plain-Text Explanation & Bounding Box Specs */}
        <div className="space-y-4 flex flex-col justify-between font-mono text-xs">
          
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase text-[11px]">
              <FileText className="w-4 h-4" />
              <span>Natural Language Model Explanation</span>
            </div>
            <p className="text-gray-200 leading-relaxed text-xs">
              {explanation_text}
            </p>
          </div>

          {/* Bounding Box Specification Details */}
          <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-amber-400 font-bold text-[11px] uppercase">
              <span className="flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Confidence Bounding Box Spec</span>
              </span>
              <span>Density: {confidence_region?.attention_density}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-400 text-[11px]">
              <div>X Coordinate: <span className="text-gray-200">{confidence_region?.x} px</span></div>
              <div>Y Coordinate: <span className="text-gray-200">{confidence_region?.y} px</span></div>
              <div>Region Width: <span className="text-gray-200">{confidence_region?.width} px</span></div>
              <div>Region Height: <span className="text-gray-200">{confidence_region?.height} px</span></div>
            </div>
          </div>

        </div>

      </div>

      {/* Layer Activations Graph */}
      {showActivations && (
        <div className="p-4 rounded-xl bg-black/40 border border-gray-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>EfficientNet Convolutional Layer Activation Norms</span>
            </span>
            <span className="text-gray-500 text-[10px]">Feature Map Analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {layer_activations.map((layer) => (
              <div key={layer.layer_name} className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 space-y-1">
                <span className="text-gray-400 text-[11px] font-bold block truncate">{layer.layer_name}</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-400 font-bold">{layer.mean_activation}</span>
                  <span className="text-gray-500 text-[10px]">{layer.feature_maps} maps</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
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
