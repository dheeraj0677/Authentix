import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';

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
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
            : 'border-zinc-800 hover:border-emerald-500/50 bg-black/80 hover:bg-zinc-950/90'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center space-y-3 py-4">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <p className="text-emerald-400 text-sm font-medium animate-pulse font-mono">
                Running Deep Learning Analysis &amp; Grad-CAM...
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-200 shadow-lg glow-emerald">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">{subtitle}</p>
              </div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 text-zinc-300 text-xs font-mono font-medium border border-zinc-800 group-hover:border-emerald-500/40 transition-colors">
                Drag &amp; Drop or Click to Browse
              </span>
            </>
          )}
        </div>
      </div>



      {/* File size error */}
      {sizeError && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{sizeError}</span>
        </div>
      )}
    </div>
  );
}
