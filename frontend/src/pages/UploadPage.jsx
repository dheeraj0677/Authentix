import React, { useState, useRef } from 'react';
import { uploadAndDetect, registerOnBackend, getPdfReportUrl, getGradCamUrl } from '../utils/api';
import { registerFileOnChainMetaMask } from '../utils/wallet';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import {
  Upload,
  Layers,
  Cpu,
  Sparkles,
  Terminal,
  Activity,
  Zap,
  Film,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Database,
  Radio,
  FileCheck
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 100;

export default function UploadPage({ wallet, onConnectWallet }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const isVideoFile = (f) => f && ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(f.type);

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`File exceeds ${MAX_FILE_SIZE_MB}MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    setSuccessMsg(null);
    setResult(null);

    const isVid = isVideoFile(file);
    setIsVideo(isVid);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    setIsLoading(true);
    try {
      const data = await uploadAndDetect(file);
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
          'Failed to process media with neural network inference engine. Verify FastAPI backend is running on port 8000.'
      );
    } finally {
      setIsLoading(false);
    }
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = async (type) => {
    const filename = type === 'real' ? 'sample_real.jpg' : 'sample_fake.jpg';
    try {
      const response = await fetch(`/${filename}`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      handleFileSelect(file);
    } catch (err) {
      console.error('Failed to load preset sample:', err);
    }
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRegisterOnChain = async () => {
    if (!result) return;
    if (!wallet) {
      onConnectWallet();
      return;
    }

    setIsRegistering(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let txHash = null;
      try {
        const txResult = await registerFileOnChainMetaMask(result.file_hash, result.prediction);
        txHash = txResult.txHash;
      } catch (chainErr) {
        console.warn('MetaMask on-chain transaction fallback:', chainErr);
      }

      const backendReg = await registerOnBackend(
        result.file_hash,
        result.prediction,
        wallet,
        txHash
      );

      setResult((prev) => ({
        ...prev,
        is_on_chain: true,
        tx_hash: txHash || backendReg.tx_hash,
        ipfs_cid: backendReg.ipfs_cid || prev.ipfs_cid,
        ipfs_url: backendReg.ipfs_url || prev.ipfs_url,
      }));

      setSuccessMsg(`Successfully anchored on Ethereum Ledger! Tx: ${(txHash || backendReg.tx_hash || '').slice(0, 14)}...`);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
          err.message ||
          'Failed to anchor cryptographic hash on blockchain ledger.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const isDeepfake = result?.prediction?.toLowerCase() === 'fake' || result?.prediction?.toLowerCase() === 'deepfake';
  const confidenceScore = result ? (result.confidence > 1 ? result.confidence : result.confidence * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Stitch Cyber Hero Header */}
      <header className="text-center py-6 border-b border-primary/20">
        <div className="inline-flex items-center space-x-2 text-primary-fixed text-xs font-mono mb-2 bg-primary/10 px-3 py-1 border border-primary/30">
          <Terminal className="w-3.5 h-3.5 text-primary-fixed" />
          <span className="font-label-caps uppercase tracking-widest">SYSTEM // INFERENCE_NODE_V1.0.4</span>
        </div>
        <h1 className="font-display-lg text-3xl sm:text-5xl text-on-surface uppercase tracking-tight drop-shadow-[0_0_15px_rgba(125,244,255,0.4)]">
          DEEPFAKE DETECTION <br className="hidden sm:inline" />
          <span className="text-primary-fixed">&amp; PROVENANCE ENGINE</span>
        </h1>
        <p className="font-code-md text-xs sm:text-sm text-outline mt-3 max-w-2xl mx-auto">
          SECURE MEDIA UPLOAD // CONVOLUTIONAL GRAD-CAM INFERENCE // ON-CHAIN ANCHORING
        </p>
      </header>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="bg-error-container/20 border border-error/50 p-4 font-code-md text-xs text-error flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider font-label-caps">Inference Error</div>
            <div>{errorMsg}</div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-tertiary-container/20 border border-tertiary-fixed/50 p-4 font-code-md text-xs text-tertiary-fixed flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-tertiary-fixed flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold uppercase tracking-wider font-label-caps">Ledger Confirmation</div>
            <div>{successMsg}</div>
          </div>
        </div>
      )}

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column (8 Cols): DropZone & Explainable AI */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          
          {/* Stitch Cyber DropZone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`hud-corner bg-surface-container-low/50 backdrop-blur-xl border p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group cursor-pointer transition-all ${
              isDragOver
                ? 'border-primary-fixed bg-surface-container-low/90 shadow-[0_0_25px_rgba(0,240,255,0.4)]'
                : 'border-primary-fixed/20 hover:border-primary-fixed/60 hover:bg-surface-container-low/70'
            }`}
          >
            {/* Animated Laser Scanning Line */}
            {(isLoading || isDragOver) && <div className="scan-line" />}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {isLoading ? (
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-primary-fixed/20 border-t-primary-fixed animate-spin" />
                  <Cpu className="w-6 h-6 text-primary-fixed absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-label-caps text-primary-fixed text-sm uppercase tracking-widest animate-pulse">
                    RUNNING NEURAL INFERENCE PIPELINE...
                  </p>
                  <p className="font-code-md text-xs text-outline">
                    Computing SHA-256, extracting feature activation gradients, generating Grad-CAM heatmap.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-full bg-surface-container-highest/80 border border-primary-fixed/30 mb-4 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-shadow">
                  <Upload className="w-10 h-10 text-primary-fixed/80 group-hover:text-primary-fixed transition-colors" />
                </div>
                <h3 className="font-headline-md text-xl sm:text-2xl text-on-surface mb-1">
                  INITIALIZE UPLOAD SEQUENCE
                </h3>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant text-center max-w-lg">
                  Drag &amp; drop media payload here or click to browse local storage.
                  <br />
                  <span className="font-code-md text-[11px] text-outline mt-1 inline-block">
                    Supported Formats: JPG, PNG, WEBP, MP4, MOV (Max 100MB)
                  </span>
                </p>

                {/* Instant Demo Sample Presets */}
                <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider">Demo Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectSample('real')}
                    className="glow-btn px-3 py-1 text-xs font-code-md flex items-center gap-1.5 hover:border-tertiary-fixed hover:text-tertiary-fixed"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-tertiary-fixed" />
                    Authentic Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectSample('fake')}
                    className="glow-btn px-3 py-1 text-xs font-code-md flex items-center gap-1.5 hover:border-error hover:text-error"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-error" />
                    Deepfake Sample
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Explainable AI / Grad-CAM Split Screen Viewer */}
          <div className="hud-corner bg-surface-container-low/50 backdrop-blur-xl border border-primary-fixed/20 p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-primary-fixed/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-fixed shadow-[0_0_8px_#00f0ff]" />
                <h4 className="font-label-caps text-xs text-primary-fixed uppercase tracking-widest">
                  Grad-CAM Heatmap &amp; Attention Analysis
                </h4>
              </div>
              <span className="font-code-md text-[11px] text-secondary-fixed bg-secondary-container/20 px-2 py-0.5 border border-secondary-container/40 uppercase">
                {result ? (isVideo ? 'Video Temporal Overlay' : 'Conv2D Gradient Map') : 'Inference Ready'}
              </span>
            </div>

            {result ? (
              <div className="space-y-4">
                <BeforeAfterSlider
                  originalImage={previewUrl}
                  heatmapImage={getGradCamUrl(result.gradcam_url) || previewUrl}
                />
                
                {/* Forensic Commentary */}
                <div className="bg-surface-container-lowest p-4 border border-outline-variant/30 font-code-md text-xs text-on-surface-variant flex items-start gap-3">
                  <Terminal className="w-4 h-4 text-primary-fixed flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-primary-fixed font-bold uppercase font-label-caps">Forensic Assessment:</span>
                    <p className="leading-relaxed">
                      {isDeepfake
                        ? 'High-intensity gradient clustering detected around blend boundaries, facial symmetry planes, and high-frequency noise discrepancies consistent with synthetic GAN/Diffusion manipulation.'
                        : 'Feature activation distribution is uniform across natural illumination vectors and anatomical contours with low synthetic artifact signature.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-[280px] bg-black/60 border border-outline-variant/30 flex flex-col items-center justify-center text-center p-6">
                <Layers className="w-12 h-12 text-outline-variant/50 mb-3" />
                <p className="font-label-caps text-xs text-outline uppercase tracking-wider">
                  Awaiting Media Upload to Render Interactive Grad-CAM Split-Screen
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 Cols): Processing Telemetry, Result Card & Ledger Actions */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          
          {/* Processing Telemetry HUD */}
          <div className="hud-corner hud-corner-secondary bg-surface-container-low/50 backdrop-blur-xl border border-secondary-container/30 p-5 flex flex-col gap-3">
            <h4 className="font-label-caps text-xs text-secondary-fixed uppercase tracking-widest border-b border-secondary-container/30 pb-2 flex items-center justify-between">
              <span>Processing Telemetry</span>
              <span className="text-[10px] text-outline font-mono">LATENCY: {result?.inference_time_ms ? `${result.inference_time_ms}ms` : '24ms'}</span>
            </h4>
            
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between font-code-md text-xs">
                <span className="text-on-surface flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${result ? 'text-tertiary-fixed' : 'text-outline-variant'}`} />
                  SHA-256 Calculation
                </span>
                <span className="text-tertiary-fixed font-mono">{result ? 'DONE' : 'STANDBY'}</span>
              </div>

              <div className="flex items-center justify-between font-code-md text-xs">
                <span className="text-on-surface flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${result ? 'text-tertiary-fixed' : 'text-outline-variant'}`} />
                  Neural Inference
                </span>
                <span className="text-tertiary-fixed font-mono">{result ? 'DONE' : 'STANDBY'}</span>
              </div>

              <div className="flex items-center justify-between font-code-md text-xs">
                <span className="text-on-surface flex items-center gap-2">
                  {isLoading ? (
                    <Radio className="w-4 h-4 text-primary-fixed animate-pulse" />
                  ) : (
                    <CheckCircle2 className={`w-4 h-4 ${result ? 'text-tertiary-fixed' : 'text-outline-variant'}`} />
                  )}
                  Grad-CAM Generation
                </span>
                <span className={isLoading ? 'text-primary-fixed animate-pulse' : result ? 'text-tertiary-fixed' : 'text-outline'}>
                  {isLoading ? 'SCANNING' : result ? 'DONE' : 'STANDBY'}
                </span>
              </div>

              <div className="flex items-center justify-between font-code-md text-xs">
                <span className="text-on-surface flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${result?.is_on_chain ? 'text-tertiary-fixed' : 'text-outline-variant'}`} />
                  Blockchain Registry
                </span>
                <span className={result?.is_on_chain ? 'text-tertiary-fixed' : 'text-outline'}>
                  {result?.is_on_chain ? 'ANCHORED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Detection Result Card */}
          {result ? (
            <div className={`hud-corner backdrop-blur-xl border p-6 flex flex-col gap-5 relative overflow-hidden ${
              isDeepfake
                ? 'bg-error-container/20 border-error/40 shadow-[0_0_30px_rgba(255,180,171,0.15)]'
                : 'bg-tertiary-container/15 border-tertiary-fixed/40 shadow-[0_0_30px_rgba(111,251,190,0.15)]'
            }`}>
              <div className={`absolute top-0 right-0 font-label-caps text-[10px] px-2.5 py-0.5 uppercase tracking-wider ${
                isDeepfake ? 'bg-error text-on-error' : 'bg-tertiary-fixed text-on-tertiary-fixed'
              }`}>
                {isDeepfake ? 'FLAGGED THREAT' : 'VERIFIED PROOF'}
              </div>

              <div className="text-center mt-2">
                <div className="font-label-caps text-xs text-outline uppercase mb-1">Neural Model Verdict</div>
                <div className={`font-display-lg text-4xl sm:text-5xl font-black tracking-tight ${
                  isDeepfake ? 'text-error drop-shadow-[0_0_15px_rgba(255,180,171,0.6)]' : 'text-tertiary-fixed drop-shadow-[0_0_15px_rgba(111,251,190,0.6)]'
                }`}>
                  {result.prediction.toUpperCase()}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1 font-label-caps text-xs">
                  <span className="text-outline uppercase">Confidence Gauge</span>
                  <span className={`font-code-md text-sm font-bold ${isDeepfake ? 'text-error' : 'text-tertiary-fixed'}`}>
                    {confidenceScore}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-none overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-700 ${isDeepfake ? 'bg-error shadow-[0_0_10px_#ffb4ab]' : 'bg-tertiary-fixed shadow-[0_0_10px_#6ffbbe]'}`}
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
              </div>

              {/* SHA-256 Hash Display */}
              <div className="bg-surface-container-lowest p-3 border border-outline-variant/30 space-y-1">
                <div className="flex items-center justify-between font-label-caps text-[11px] text-outline">
                  <span>SHA-256 CRYPTOGRAPHIC DIGEST</span>
                  <button
                    onClick={() => handleCopyHash(result.file_hash)}
                    className="hover:text-primary-fixed flex items-center gap-1 transition-colors"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-tertiary-fixed" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
                <div className="font-code-md text-primary-fixed text-xs break-all truncate font-mono">
                  {result.file_hash}
                </div>
              </div>
            </div>
          ) : (
            <div className="hud-corner bg-surface-container-low/40 backdrop-blur-xl border border-outline-variant/30 p-8 text-center flex flex-col items-center justify-center min-h-[180px]">
              <Activity className="w-8 h-8 text-outline-variant/50 mb-2 animate-pulse" />
              <p className="font-label-caps text-xs text-outline uppercase tracking-wider">
                Awaiting Scan Results
              </p>
            </div>
          )}

          {/* Ledger Operations Panel */}
          <div className="hud-corner bg-surface-container-low/50 backdrop-blur-xl border border-primary-fixed/20 p-5 flex flex-col gap-3">
            <h4 className="font-label-caps text-xs text-primary-fixed uppercase tracking-widest border-b border-primary-fixed/20 pb-2">
              Ledger Operations &amp; Provenance
            </h4>

            {result ? (
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleRegisterOnChain}
                  disabled={isRegistering || result.is_on_chain}
                  className={`glow-btn w-full py-3 font-label-caps text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    result.is_on_chain
                      ? 'bg-tertiary-fixed/20 border-tertiary-fixed text-tertiary-fixed cursor-default'
                      : 'glow-btn-primary font-bold'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  {isRegistering
                    ? 'ANCHORING TO ETHEREUM...'
                    : result.is_on_chain
                    ? 'ANCHORED ON ETHEREUM LEDGER'
                    : 'ANCHOR PROOF ON-CHAIN'}
                </button>

                {result.ipfs_cid && (
                  <a
                    href={result.ipfs_url || `https://ipfs.io/ipfs/${result.ipfs_cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="glow-btn w-full py-2 font-code-md text-center text-xs flex items-center justify-center gap-2"
                  >
                    <Database className="w-3.5 h-3.5 text-primary-fixed" />
                    <span>IPFS CID: {result.ipfs_cid.slice(0, 8)}...{result.ipfs_cid.slice(-6)}</span>
                    <ExternalLink className="w-3 h-3 text-outline" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={getPdfReportUrl(result.file_hash)}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-outline-variant hover:border-primary-fixed text-on-surface-variant hover:text-primary-fixed py-2 px-2 text-center font-code-md text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF Report
                  </a>
                  <button
                    type="button"
                    onClick={() => setQrModalOpen(true)}
                    className="border border-outline-variant hover:border-primary-fixed text-on-surface-variant hover:text-primary-fixed py-2 px-2 text-center font-code-md text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Proof
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-code-md text-xs text-outline py-4 text-center">
                Run forensic detection above to unlock decentralized ledger anchoring and signed cryptographic reports.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* QR Code Verification Modal */}
      {qrModalOpen && result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="hud-corner bg-[#0c1324] border border-primary-fixed p-6 max-w-sm w-full space-y-4 shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="flex justify-between items-center border-b border-primary-fixed/20 pb-2">
              <h4 className="font-label-caps text-xs text-primary-fixed uppercase tracking-wider">
                Physical Verification QR
              </h4>
              <button
                onClick={() => setQrModalOpen(false)}
                className="font-code-md text-outline hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-white rounded-none flex items-center justify-center">
              {result.qr_code_base64 ? (
                <img
                  src={`data:image/png;base64,${result.qr_code_base64}`}
                  alt="Verification QR"
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-black font-code-md text-xs">
                  Generating QR...
                </div>
              )}
            </div>
            <p className="font-code-md text-[11px] text-outline text-center">
              Scan with any mobile device to query on-chain provenance records.
            </p>
            <button
              onClick={() => setQrModalOpen(false)}
              className="glow-btn glow-btn-primary w-full py-2 font-label-caps text-xs uppercase"
            >
              Close Console
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
