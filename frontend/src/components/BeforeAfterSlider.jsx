import React, { useState, useRef, useEffect } from 'react';
import { Eye, Flame, Sliders, Layers, ZoomIn, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function BeforeAfterSlider({ originalUrl, gradcamUrl, isVideo = false }) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0-100
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side'
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  return (
    <div className="space-y-4">
      
      {/* Interactive Mode Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#050c1e]/90 border border-cyan-500/20 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="font-bold font-orbitron tracking-wider text-[11px]">Grad-CAM Explainable AI (XAI) Inspector</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="inline-flex rounded-xl bg-[#020617] p-1 border border-cyan-500/20">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all cursor-pointer ${
                viewMode === 'slider'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-neon-amber'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split Slider
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-4 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-neon-amber'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dual View
            </button>
          </div>
        </div>
      </div>

      {/* Viewport Area */}
      {viewMode === 'slider' ? (
        <div
          ref={containerRef}
          onMouseDown={(e) => {
            setIsDragging(true);
            handleMove(e.clientX);
          }}
          onTouchStart={(e) => {
            setIsDragging(true);
            if (e.touches[0]) handleMove(e.touches[0].clientX);
          }}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full aspect-square max-h-[500px] rounded-3xl overflow-hidden select-none cursor-ew-resize border border-cyan-500/30 bg-[#020617] shadow-2xl hud-box"
        >
          {/* Layer 1: Grad-CAM Heatmap (Base Background) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#020617]">
            <img
              src={gradcamUrl}
              alt="Grad-CAM Activation Heatmap"
              className="w-full h-full object-contain pointer-events-none"
            />
            <span className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-[#050c1e]/90 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-mono font-bold z-10 flex items-center space-x-2 shadow-neon-amber">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Grad-CAM Spatial Heatmap</span>
            </span>
          </div>

          {/* Layer 2: Original Media (Clipped by slider position) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden bg-[#020617]"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {isVideo ? (
                <video
                  src={originalUrl}
                  controls
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <img
                  src={originalUrl}
                  alt="Original Media"
                  className="w-full h-full object-contain pointer-events-none"
                  style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                />
              )}
              <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-[#050c1e]/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold z-10 flex items-center space-x-2 shadow-neon-cyan">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Original Media</span>
              </span>
            </div>
          </div>

          {/* Vertical Slider Handle Line (Laser glow) */}
          <div
            className="absolute inset-y-0 w-1 bg-gradient-to-b from-amber-400 via-cyan-400 to-amber-400 z-20 shadow-[0_0_20px_#00f0ff]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl bg-[#050c1e] border-2 border-cyan-400 shadow-[0_0_15px_#00f0ff] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
        </div>
      ) : (
        /* Side-by-Side Dual View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-xs text-cyan-400 font-mono flex items-center space-x-1.5 px-1 font-bold">
              <Eye className="w-3.5 h-3.5" />
              <span>Original Upload</span>
            </span>
            <div className="relative rounded-3xl overflow-hidden bg-[#020617] aspect-square flex items-center justify-center border border-cyan-500/30 shadow-xl p-2">
              {isVideo ? (
                <video src={originalUrl} controls className="w-full h-full object-contain rounded-2xl" />
              ) : (
                <img src={originalUrl} alt="Original Upload" className="w-full h-full object-contain rounded-2xl" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs text-amber-400 font-mono flex items-center space-x-1.5 px-1 font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>Grad-CAM Spatial Heatmap</span>
            </span>
            <div className="relative rounded-3xl overflow-hidden bg-[#020617] aspect-square flex items-center justify-center border border-amber-500/40 shadow-neon-amber p-2">
              <img src={gradcamUrl} alt="Grad-CAM Heatmap" className="w-full h-full object-contain rounded-2xl" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

