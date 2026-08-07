import React from 'react';
import { Eye, Flame, AlertTriangle } from 'lucide-react';
import { getGradCamUrl } from '../utils/api';

/**
 * Detects whether a blob URL or filename refers to a video.
 */
function isVideoFile(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith('.mp4') || lower.endsWith('.avi') || lower.endsWith('.mov') ||
    lower.endsWith('.webm') || lower.endsWith('.mkv') || lower.startsWith('blob:');
}

export default function GradCamViewer({ originalFileUrl, gradcamUrl, gradcamFailed = false, isVideo = false }) {
  if (!originalFileUrl && !gradcamUrl) return null;

  const fullGradcamUrl = getGradCamUrl(gradcamUrl);

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-200 flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Grad-CAM Explainability Heatmap</span>
        </h3>
        <span className="text-xs text-gray-400">
          {isVideo ? 'Most Suspicious Frame — ' : ''}Convolutional Feature Activation Map
        </span>
      </div>

      {/* Grad-CAM failed warning banner */}
      {gradcamFailed && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Grad-CAM computation encountered an issue — the original image is shown in place of the heatmap.
            This can happen when the model file is not yet trained or Grad-CAM layer traversal fails.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Original Image or Video */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-400 font-mono">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Original Upload</span>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-black/50 aspect-square flex items-center justify-center border border-gray-800">
            {originalFileUrl ? (
              isVideo ? (
                <video
                  src={originalFileUrl}
                  controls
                  className="w-full h-full object-contain"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={originalFileUrl}
                  alt="Original Upload"
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <span className="text-xs text-gray-500">No preview</span>
            )}
          </div>
        </div>

        {/* Grad-CAM Heatmap Overlay (always an image — extracted frame for video) */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-mono">
            <Flame className="w-3.5 h-3.5" />
            <span>{gradcamFailed ? 'Original Frame (Heatmap Unavailable)' : 'Grad-CAM Heatmap Overlay'}</span>
          </div>
          <div className={`relative rounded-xl overflow-hidden bg-black/50 aspect-square flex items-center justify-center border ${gradcamFailed ? 'border-amber-500/20' : 'border-amber-500/20 glow-purple'}`}>
            {fullGradcamUrl ? (
              <img
                src={fullGradcamUrl}
                alt="Grad-CAM Heatmap Overlay"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to original image if Grad-CAM static route not found
                  if (originalFileUrl && !isVideo) e.target.src = originalFileUrl;
                }}
              />
            ) : (
              <span className="text-xs text-gray-500">Generating Heatmap...</span>
            )}
          </div>
        </div>

      </div>

      <p className="text-xs text-gray-400 italic">
        {gradcamFailed
          ? '* Grad-CAM could not be computed. Train the model first using train.py before running inference.'
          : '* Red/yellow high-intensity regions indicate pixel areas that exerted maximum influence on the EfficientNetB0 binary decision.'}
      </p>
    </div>
  );
}
