import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertCircle, Image as ImageIcon, Film, Sparkles } from 'lucide-react';

export default function DropZone({ onFileSelect, isLoading, title = "Upload Media (Image or Video)", subtitle = "Supports PNG, JPG, JPEG, WEBP, MP4, AVI, MOV, WEBM · Max 100 MB" }) {
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

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 overflow-hidden ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-2xl glow-emerald'
            : 'border-zinc-800 hover:border-emerald-500/50 bg-zinc-950/80 hover:bg-zinc-900/90'
        }`}
      >
        {/* Scanning laser line when processing */}
        {isLoading && <div className="scanner-line z-20" />}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="relative">
                <Loader2 className="w-14 h-14 text-emerald-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-emerald-400 text-sm font-bold animate-pulse font-mono tracking-wide">
                  RUNNING NEURAL DEEP LEARNING ANALYSIS &amp; GRAD-CAM...
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  Extracting spatial activation maps &amp; computing SHA-256 cryptographic hash
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Icon */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-lg glow-emerald">
                <UploadCloud className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-100 tracking-tight">{title}</h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">{subtitle}</p>
              </div>

              {/* Supported Badges */}
              <div className="flex items-center space-x-3 pt-1 text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Images</span>
                </span>
                <span className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
                  <Film className="w-3.5 h-3.5 text-purple-400" />
                  <span>Videos</span>
                </span>
              </div>

              <span className="inline-block px-5 py-2 rounded-full bg-zinc-900/90 text-zinc-200 text-xs font-mono font-medium border border-zinc-700/80 group-hover:border-emerald-500/60 group-hover:text-emerald-300 transition-all shadow-md">
                Drag &amp; Drop or Click to Browse
              </span>
            </>
          )}
        </div>
      </div>

      {/* File size error */}
      {sizeError && (
        <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{sizeError}</span>
        </div>
      )}
    </div>
  );
}

