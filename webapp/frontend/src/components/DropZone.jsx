import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertCircle, Image as ImageIcon, Film, Sparkles, Zap, Wand2, Terminal, Cpu } from 'lucide-react';

export default function DropZone({
  onFileSelect,
  isLoading,
  onSelectSample,
  title = "Upload Media for AI DeepFake Neural Inspection",
  subtitle = "Accepts JPG, PNG, WEBP, MP4, AVI, MOV, WEBM &bull; Max 100 MB"
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [sizeError, setSizeError] = useState(null);
  const fileInputRef = useRef(null);

  const MAX_MB = 100;

  const validate = (file) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setSizeError(`"${file.name}" exceeds the ${MAX_MB} MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return false;
    }
    setSizeError(null);
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (validate(f)) onFileSelect(f);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (validate(f)) onFileSelect(f);
    }
  };

  const handleSampleClick = (sampleType) => {
    if (onSelectSample) {
      onSelectSample(sampleType);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Main Drag-and-Drop Holographic Cyber Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all duration-300 overflow-hidden hud-box ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/15 scale-[1.01] shadow-2xl shadow-neon-cyan'
            : 'border-cyan-500/30 hover:border-cyan-400 bg-[#050c1e]/85 hover:bg-[#081329]/95 shadow-2xl hover:shadow-neon-cyan'
        }`}
      >
        {/* Holographic Laser Scanning Line */}
        {isLoading && <div className="scanner-line z-30" />}

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-5 py-8 animate-fadeIn">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-cyan-500/30 blur-xl animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative filter drop-shadow-[0_0_10px_#00f0ff]" />
                <Cpu className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
              </div>
              <div className="space-y-2 text-center max-w-md">
                <p className="text-cyan-300 text-sm font-bold font-orbitron tracking-widest animate-pulse">
                  RUNNING EFFICIENTNETB4 INFERENCE &amp; GRAD-CAM...
                </p>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Computing SHA-256 cryptographic digest, extracting convolutional activation gradients, and running Test-Time Augmentations (TTA).
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Animated Cyber Upload Icon */}
              <div className="relative">
                <div className="absolute -inset-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-60 blur group-hover:opacity-100 transition duration-300 group-hover:scale-110 animate-border-flow" />
                <div className="relative p-5 rounded-2xl bg-[#050c1e] border border-cyan-500/40 text-cyan-400 shadow-xl group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-12 h-12 filter drop-shadow-[0_0_8px_#00f0ff]" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white font-syne tracking-wide group-hover:text-cyan-300 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-slate-400 font-mono" dangerouslySetInnerHTML={{ __html: subtitle }} />
              </div>

              {/* Supported Format Pills */}
              <div className="flex items-center space-x-3 pt-1 text-xs font-mono">
                <span className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Images (PNG, JPG, WEBP)</span>
                </span>
                <span className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-sm">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Videos (MP4, MOV, WEBM)</span>
                </span>
              </div>

              <span className="inline-block px-7 py-3 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-cyan-500/15 text-cyan-300 text-xs font-orbitron font-extrabold tracking-wider border border-cyan-500/40 group-hover:border-cyan-400 group-hover:text-white transition-all shadow-neon-cyan">
                Drag &amp; Drop Media or Click to Browse Local Files
              </span>
            </>
          )}
        </div>
      </div>

      {/* Instant Demo Samples Bar */}
      {onSelectSample && !isLoading && (
        <div className="holo-card rounded-2xl p-4 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Wand2 className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Instant Demo Presets:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSampleClick('real');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-orbitron tracking-wider flex items-center space-x-2 transition-all shadow cursor-pointer hover:border-emerald-400 hover:shadow-neon-emerald"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Test Authentic Portrait</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSampleClick('fake');
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold font-orbitron tracking-wider flex items-center space-x-2 transition-all shadow cursor-pointer hover:border-rose-400 hover:shadow-neon-pink"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>Test DeepFake FaceSwap</span>
            </button>
          </div>
        </div>
      )}

      {/* File Size Error Alert */}
      {sizeError && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-mono animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{sizeError}</span>
        </div>
      )}

    </div>
  );
}
