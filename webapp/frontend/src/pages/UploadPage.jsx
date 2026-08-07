import React, { useState } from 'react';
import DropZone from '../components/DropZone';
import ResultCard from '../components/ResultCard';
import GradCamViewer from '../components/GradCamViewer';
import { uploadAndDetect, registerOnBackend } from '../utils/api';
import { registerFileOnChainMetaMask } from '../utils/wallet';
import { Sparkles, AlertCircle, CheckCircle2, Film } from 'lucide-react';

const MAX_FILE_SIZE_MB = 100;

export default function UploadPage({ wallet, onConnectWallet }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isVideoFile = (f) => f && ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(f.type);

  const handleFileSelect = async (selectedFile) => {
    // Client-side file size guard
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    setResult(null);

    try {
      const data = await uploadAndDetect(selectedFile);
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail || 'Failed to analyze media with Deep Learning model. Is the backend running?'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterOnChain = async () => {
    if (!result) return;
    if (!wallet) {
      alert('Please connect your MetaMask wallet first using the top navbar button.');
      onConnectWallet();
      return;
    }

    setIsRegistering(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Submit on-chain via MetaMask
      const txResult = await registerFileOnChainMetaMask(result.file_hash, result.prediction);

      // 2. Notify backend to update DB record
      await registerOnBackend(result.file_hash, result.prediction, wallet, txResult.txHash);

      setResult((prev) => ({
        ...prev,
        is_on_chain: true,
        tx_hash: txResult.txHash,
        wallet_address: wallet
      }));

      setSuccessMsg(`Successfully registered on Ethereum Blockchain! Tx: ${txResult.txHash.slice(0, 10)}...`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to complete blockchain registration transaction.');
    } finally {
      setIsRegistering(false);
    }
  };

  const isVideo = file && isVideoFile(file);
  // Video timeline data from the result
  const videoTimeline = result?.timeline || null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Module 1 &amp; 2 Integrated</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          DeepFake Detection &amp; Blockchain Registry
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Upload an image or video to run EfficientNetB0 Deep Learning classification, visualize Grad-CAM activation heatmaps, and anchor SHA-256 cryptographic authenticity on the Ethereum blockchain.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Drop Zone */}
      <DropZone onFileSelect={handleFileSelect} isLoading={isLoading} />

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          <ResultCard
            result={result}
            onRegisterOnChain={handleRegisterOnChain}
            isRegistering={isRegistering}
            wallet={wallet}
          />

          <GradCamViewer
            originalFileUrl={previewUrl}
            gradcamUrl={result.gradcam_url}
            gradcamFailed={result.gradcam_failed || false}
            isVideo={!!isVideo}
          />

          {/* Video Frame Timeline Panel */}
          {isVideo && videoTimeline && videoTimeline.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <Film className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-gray-200">Video Frame Analysis Timeline</h3>
                <span className="ml-auto text-xs text-gray-400 font-mono">{videoTimeline.length} frames sampled at 1 FPS</span>
              </div>

              {/* Fake frame percentage summary */}
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="text-gray-400">Fake Frames:</span>
                <span className="text-rose-400 font-bold">{result.fake_frame_percentage ?? 0}%</span>
                <span className="text-gray-400">Analyzed:</span>
                <span className="text-gray-200">{result.analyzed_frames ?? videoTimeline.length} frames</span>
              </div>

              {/* Frame-by-frame timeline scrollable */}
              <div className="max-h-56 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                {videoTimeline.map((frame) => (
                  <div
                    key={frame.frame_index}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg text-xs font-mono border ${
                      frame.prediction === 'FAKE'
                        ? 'bg-rose-950/30 border-rose-500/20 text-rose-300'
                        : 'bg-emerald-950/20 border-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    <span className="text-gray-400">t={frame.timestamp_sec}s</span>
                    <span className={`font-bold ${frame.prediction === 'FAKE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {frame.prediction}
                    </span>
                    <span>{frame.confidence}%</span>
                    <span className="text-gray-500">raw: {frame.raw_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
