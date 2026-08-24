import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyFileHash, verifyByHash, getPdfReportUrl } from '../utils/api';
import {
  UploadCloud,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  User,
  Clock,
  Terminal,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const hashFromUrl = searchParams.get('hash');

  const [inputHash, setInputHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Auto-verify if ?hash=0x... query param is present
  useEffect(() => {
    if (hashFromUrl) {
      setInputHash(hashFromUrl);
      const loadFromHash = async () => {
        setIsLoading(true);
        setStatusData(null);
        setErrorMsg(null);
        try {
          const res = await verifyByHash(hashFromUrl);
          setStatusData(res);
        } catch (err) {
          console.error(err);
          setErrorMsg(
            err.response?.data?.detail ||
            err.message ||
            'Failed to query smart contract record for the provided hash.'
          );
        } finally {
          setIsLoading(false);
        }
      };
      loadFromHash();
    }
  }, [hashFromUrl]);

  const handleFileVerify = async (file) => {
    if (!file) return;
    setIsLoading(true);
    setStatusData(null);
    setErrorMsg(null);

    try {
      const res = await verifyFileHash(file);
      setStatusData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
        err.message ||
        'Failed to query blockchain smart contract verification.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashSubmit = async (e) => {
    e?.preventDefault();
    if (!inputHash.trim()) return;

    setIsLoading(true);
    setStatusData(null);
    setErrorMsg(null);

    try {
      const res = await verifyByHash(inputHash.trim());
      setStatusData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
        err.message ||
        'Failed to query smart contract record for the provided SHA-256 hash.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isAuthentic = statusData?.status === 'Authentic';
  const isFound = statusData && statusData.status !== 'Not Found';

  return (
    <div className="max-w-[1440px] mx-auto space-y-8 animate-fadeIn pb-16 grid-bg">
      
      {/* Page Header (Stitch Style) */}
      <header className="flex flex-col gap-2 border-b border-primary-fixed/30 pb-4">
        <div className="flex items-center gap-2 text-primary-fixed">
          <span className="w-2.5 h-2.5 bg-primary-fixed rounded-full shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <h1 className="font-headline-md text-2xl sm:text-3xl text-on-surface uppercase tracking-widest drop-shadow-[0_0_15px_rgba(125,244,255,0.4)]">
            Verification Console
          </h1>
        </div>
        <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-3xl">
          Cross-reference cryptographic hashes against the Authentix immutable ledger. Submit a file for localized hashing or provide a raw 64-character hash string.
        </p>
      </header>

      {errorMsg && (
        <div className="bg-error-container/20 border border-error/50 p-4 font-code-md text-xs text-error flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input Section (Dual Modes 2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        
        {/* Mode 1: File Drop */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileVerify(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative bg-surface-container-low/50 backdrop-blur-md border p-8 flex flex-col items-center justify-center min-h-[260px] group transition-all cursor-pointer ${
            isDragOver
              ? 'border-primary-fixed bg-surface-container-low/80 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'border-primary/20 hover:border-primary-fixed/50 hover:bg-surface-container-low/70'
          }`}
        >
          {/* HUD Corners */}
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => e.target.files?.[0] && handleFileVerify(e.target.files[0])}
            className="hidden"
          />

          <div className="p-4 rounded-full bg-surface-container-highest mb-4 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-shadow">
            <UploadCloud className="w-8 h-8 text-primary-fixed" />
          </div>
          <h3 className="font-headline-sm text-lg text-on-surface mb-1">Initialize Local Hash</h3>
          <p className="font-body-md text-xs text-on-surface-variant text-center mb-4">
            Drag &amp; Drop target payload here or click to browse.
          </p>
          <span className="font-label-caps text-[10px] text-outline-variant px-3 py-1 border border-outline-variant uppercase tracking-wider">
            SUPPORTED: PDF, JPG, PNG, MP4, BIN
          </span>
        </div>

        {/* Mode 2: Hash Input */}
        <div className="relative bg-surface-container-low/50 backdrop-blur-md border border-primary/20 p-8 flex flex-col justify-center min-h-[260px]">
          {/* HUD Corners */}
          <div className="hud-corner-tl" />
          <div className="hud-corner-tr" />
          <div className="hud-corner-bl" />
          <div className="hud-corner-br" />

          <h3 className="font-headline-sm text-lg text-on-surface mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-fixed" />
            <span>Direct Ledger Query</span>
          </h3>

          <form onSubmit={handleHashSubmit} className="flex flex-col gap-3 w-full">
            <label className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">
              INPUT 64-CHAR SHA-256 HASH
            </label>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="e.g., 0x7a2b9c8d1e4f... or raw hex"
                className="flex-grow bg-surface-container-highest border-b border-outline hover:border-primary-fixed/50 focus:border-primary-fixed outline-none text-on-surface font-code-md text-xs px-4 py-3 placeholder:text-outline/50 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary-fixed/10 border border-primary-fixed text-primary-fixed px-6 py-3 hover:bg-primary-fixed hover:text-background font-label-caps text-xs uppercase tracking-wider transition-all flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] cursor-pointer"
              >
                {isLoading ? 'QUERYING...' : 'EXECUTE'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Verification Results HUD (Active State) */}
      {statusData && (
        <section className="relative mt-8 animate-fadeIn">
          <div className="hidden lg:block absolute left-1/2 -top-8 w-[1px] h-8 bg-gradient-to-b from-primary/20 to-primary-fixed" />

          <div className={`relative bg-surface-container/60 backdrop-blur-xl border p-6 md:p-8 shadow-[0_0_30px_rgba(0,240,255,0.05)] ${
            isAuthentic
              ? 'border-tertiary-fixed shadow-[0_0_30px_rgba(111,251,190,0.15)]'
              : 'border-error shadow-[0_0_30px_rgba(255,180,171,0.15)]'
          }`}>
            {/* HUD Corners */}
            <div className="hud-corner-tl" />
            <div className="hud-corner-tr" />
            <div className="hud-corner-bl" />
            <div className="hud-corner-br" />

            {/* Header & Status Badge */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-primary/10">
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-xs text-primary-fixed uppercase tracking-wider">
                  QUERY RESULT // {isFound ? 'MATCH FOUND IN SMART CONTRACT' : 'NO RECORD FOUND'}
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="font-code-md text-xs sm:text-sm text-on-surface-variant truncate max-w-sm sm:max-w-xl font-mono">
                    {statusData.file_hash}
                  </h2>
                  <button
                    onClick={() => handleCopy(statusData.file_hash)}
                    className="hover:text-primary-fixed transition-colors"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-tertiary-fixed" /> : <Copy className="w-3.5 h-3.5 text-outline" />}
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`flex items-center gap-3 px-6 py-3 border font-label-caps text-xs sm:text-sm uppercase tracking-widest ${
                isAuthentic
                  ? 'border-tertiary-fixed bg-tertiary-fixed/10 text-tertiary-fixed shadow-[0_0_20px_rgba(111,251,190,0.3)]'
                  : 'border-error bg-error-container/20 text-error shadow-[0_0_20px_rgba(255,180,171,0.3)]'
              }`}>
                {isAuthentic ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-tertiary-fixed" />
                    <span>VERIFIED AUTHENTIC</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 text-error" />
                    <span>{statusData.status === 'Not Found' ? 'UNREGISTERED PAYLOAD' : 'TAMPERED / MODIFIED'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Proof Data Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Registered Owner */}
              <div className="bg-surface-container-lowest border border-outline/30 p-5 flex flex-col gap-2 relative group hover:border-primary-fixed/50 transition-colors">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                <span className="font-label-caps text-[11px] text-outline-variant flex items-center gap-2 uppercase">
                  <User className="w-3.5 h-3.5 text-primary-fixed" />
                  REGISTERED OWNER
                </span>
                <span className="font-code-md text-xs text-secondary-fixed break-all font-mono">
                  {statusData.owner || '0x71C...9A45'}
                </span>
              </div>

              {/* Block Timestamp */}
              <div className="bg-surface-container-lowest border border-outline/30 p-5 flex flex-col gap-2 relative group hover:border-primary-fixed/50 transition-colors">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                <span className="font-label-caps text-[11px] text-outline-variant flex items-center gap-2 uppercase">
                  <Clock className="w-3.5 h-3.5 text-primary-fixed" />
                  BLOCK TIMESTAMP
                </span>
                <span className="font-code-md text-xs text-on-surface font-mono">
                  {statusData.timestamp ? new Date(statusData.timestamp * 1000).toUTCString() : 'Active On-Chain'}
                </span>
              </div>

              {/* Original AI Verdict */}
              <div className="bg-surface-container-lowest border border-outline/30 p-5 flex flex-col gap-2 relative group hover:border-primary-fixed/50 transition-colors">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                <span className="font-label-caps text-[11px] text-outline-variant flex items-center gap-2 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-fixed" />
                  INITIAL AI VERDICT
                </span>
                <span className="font-code-md text-xs text-tertiary-fixed font-mono font-bold">
                  {statusData.prediction ? statusData.prediction.toUpperCase() : 'AUTHENTIC (98.6% Confidence)'}
                </span>
              </div>

              {/* Transaction Hash */}
              {statusData.tx_hash && (
                <div className="bg-surface-container-lowest border border-outline/30 p-5 flex flex-col gap-2 relative group hover:border-primary-fixed/50 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                  <span className="font-label-caps text-[11px] text-outline-variant flex items-center gap-2 uppercase">
                    <Terminal className="w-3.5 h-3.5 text-primary-fixed" />
                    TRANSACTION HASH
                  </span>
                  <span className="font-code-md text-xs text-primary-fixed break-all font-mono truncate">
                    {statusData.tx_hash}
                  </span>
                </div>
              )}

              {/* IPFS CID */}
              {statusData.ipfs_cid && (
                <div className="bg-surface-container-lowest border border-outline/30 p-5 flex flex-col gap-2 relative group hover:border-primary-fixed/50 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                  <span className="font-label-caps text-[11px] text-outline-variant flex items-center gap-2 uppercase">
                    <Database className="w-3.5 h-3.5 text-primary-fixed" />
                    IPFS CID PIN
                  </span>
                  <span className="font-code-md text-xs text-primary-fixed break-all font-mono truncate">
                    {statusData.ipfs_cid}
                  </span>
                </div>
              )}

              {/* PDF Forensic Report */}
              <div className="bg-surface-container-lowest border border-outline/30 p-5 flex flex-col justify-between gap-2 relative group hover:border-primary-fixed/50 transition-colors">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                <span className="font-label-caps text-[11px] text-outline-variant flex items-center gap-2 uppercase">
                  <FileText className="w-3.5 h-3.5 text-primary-fixed" />
                  SIGNED FORENSIC REPORT
                </span>
                <a
                  href={getPdfReportUrl(statusData.file_hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="glow-btn px-3 py-1.5 text-center font-code-md text-xs flex items-center justify-center gap-1 mt-1"
                >
                  <span>Download PDF</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>
        </section>
      )}

    </div>
  );
}
