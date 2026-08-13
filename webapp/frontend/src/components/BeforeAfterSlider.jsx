import React, { useState, useRef, useEffect } from 'react';
import { Eye, Flame, Sliders, Layers } from 'lucide-react';

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
    <div className="space-y-3">
      
      {/* Mode Switcher */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-400 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Visualization Mode</span>
        </span>
        <div className="inline-flex rounded-lg bg-zinc-900/80 p-0.5 border border-zinc-800">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === 'slider'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Split Slider
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Interactive Split View */}
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
          className="relative w-full aspect-square rounded-2xl overflow-hidden select-none cursor-ew-resize border border-zinc-800 bg-black shadow-2xl"
        >
          {/* Layer 1: Grad-CAM Heatmap (Base background) */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={gradcamUrl}
              alt="Grad-CAM Overlay"
              className="w-full h-full object-contain pointer-events-none"
            />
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-amber-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold z-10 flex items-center space-x-1">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Grad-CAM Activation</span>
            </span>
          </div>

          {/* Layer 2: Original Image (Clipped by slider position) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden bg-black"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="relative w-full h-full">
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
                  style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
                />
              )}
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-700 text-cyan-400 text-[10px] font-mono font-bold z-10 flex items-center space-x-1">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>Original Image</span>
              </span>
            </div>
          </div>

          {/* Vertical Slider Handle Line */}
          <div
            className="absolute inset-y-0 w-0.5 bg-gradient-to-b from-amber-400 via-white to-amber-400 z-20 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-950 border-2 border-amber-400 shadow-xl flex items-center justify-center text-amber-400">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        /* Side-by-Side Dual View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[11px] text-cyan-400 font-mono flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Original Upload</span>
            </span>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-zinc-800">
              {isVideo ? (
                <video src={originalUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={originalUrl} alt="Original Upload" className="w-full h-full object-contain" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] text-amber-400 font-mono flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Grad-CAM Heatmap</span>
            </span>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-amber-500/30 glow-purple">
              <img src={gradcamUrl} alt="Grad-CAM Heatmap" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
