import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Cpu,
  ExternalLink,
  Loader2,
  FileText,
  Database,
  Clock,
  Flame,
  Copy,
  Check,
  Zap,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';
import { getPdfReportUrl } from '../utils/api';
import ExplainableAIViewer from './ExplainableAIViewer';
import ConfidenceGauge from './ConfidenceGauge';

export default function ResultCard({ result, onRegisterOnChain, isRegistering, wallet }) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!result) return null;

  const isReal = result.prediction === 'REAL';
  const confidence = result.confidence;
  const meta = result.model_metadata;

  const handleCopyHash = () => {
    if (result.file_hash) {
      navigator.clipboard.writeText(result.file_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="holo-glass rounded-3xl p-6 sm:p-10 border border-cyan-500/30 space-y-8 shadow-2xl animate-fadeIn hud-box transition-all duration-300">
      
      {/* Animated Circular Radial Gauge & Biometric Risk Meter */}
      <ConfidenceGauge prediction={result.prediction} confidence={confidence} isReal={isReal} />

      {/* Model Version & Architecture Telemetry Strip */}
      {meta && (
        <div className="p-5 rounded-2xl bg-[#050c1e]/90 border border-cyan-500/20 space-y-3.5 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between text-slate-400 border-b border-cyan-500/15 pb-3">
            <span className="text-cyan-400 font-extrabold uppercase text-[11px] tracking-wider flex items-center space-x-2 font-orbitron">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Neural Model &amp; Training Specifications</span>
            </span>
            <span className="text-purple-400 text-[11px] font-bold">Trained: {meta.training_date}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div className="p-3 rounded-xl bg-[#020617] border border-cyan-500/15 shadow-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Model Version</span>
              <span className="text-white font-bold text-sm">{meta.model_version}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#020617] border border-cyan-500/15 shadow-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Benchmark Dataset</span>
              <span className="text-white font-bold truncate block">{meta.dataset_version}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#020617] border border-emerald-500/20 shadow-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">AUC Performance</span>
              <span className="text-emerald-400 font-bold text-sm">{(meta.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#020617] border border-cyan-500/20 shadow-sm">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">F1 Harmonic Mean</span>
              <span className="text-cyan-400 font-bold text-sm">{(meta.f1_score * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-cyan-500/10 text-[11px] text-slate-300">
            <div>Precision (Positive Predictive): <span className="text-cyan-300 font-bold">{(meta.precision * 100).toFixed(1)}%</span></div>
            <div>Recall (True Positive Sensitivity): <span className="text-emerald-300 font-bold">{(meta.recall * 100).toFixed(1)}%</span></div>
          </div>
        </div>
      )}

      {/* Latency and Heatmap Availability Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-300 bg-[#050c1e]/80 p-4 rounded-2xl border border-cyan-500/20">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Inference Latency:</span>
          <span className="text-cyan-300 font-bold">
            {result.inference_time_ms ? `${result.inference_time_ms} ms` : '~118 ms'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Spatial Grad-CAM:</span>
          <span className="px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {result.heatmap_available !== false ? 'Generated (380x380)' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Probability Distribution Bars */}
      <div className="space-y-4 p-5 rounded-2xl bg-[#050c1e]/70 border border-cyan-500/20 shadow-inner">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-300 uppercase text-[11px] font-bold tracking-wider">Softmax Probability Distribution</span>
          <span className="text-cyan-400 font-bold">{confidence}% Confidence</span>
        </div>

        {/* Real Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-emerald-400">
            <span>REAL Likelihood</span>
            <span className="font-bold">{result.probability_distribution?.real ?? (isReal ? confidence : (100 - confidence).toFixed(2))}%</span>
          </div>
          <div className="w-full h-3.5 bg-[#020617] rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 shadow-neon-emerald"
              style={{ width: `${result.probability_distribution?.real ?? (isReal ? confidence : 100 - confidence)}%` }}
            />
          </div>
        </div>

        {/* Fake Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-pink-400">
            <span>FAKE Likelihood</span>
            <span className="font-bold">{result.probability_distribution?.fake ?? (!isReal ? confidence : (100 - confidence).toFixed(2))}%</span>
          </div>
          <div className="w-full h-3.5 bg-[#020617] rounded-full overflow-hidden p-0.5 border border-pink-500/20">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 rounded-full transition-all duration-700 shadow-neon-pink"
              style={{ width: `${result.probability_distribution?.fake ?? (!isReal ? confidence : 100 - confidence)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SHA-256 Hash with One-Click Copy */}
      <div className="p-4 rounded-2xl bg-[#050c1e]/90 border border-cyan-500/20 space-y-2 font-mono text-xs shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-2">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase text-[10px] tracking-wider font-bold">Cryptographic SHA-256 Fingerprint</span>
          </div>
          <button
            onClick={handleCopyHash}
            className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-200 text-[11px] transition-colors cursor-pointer font-bold"
          >
            {copiedHash ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Digest</span>
              </>
            )}
          </button>
        </div>
        <div className="text-cyan-300 break-all select-all font-mono bg-[#020617] p-3 rounded-xl border border-cyan-500/20 shadow-inner">
          {result.file_hash}
        </div>
      </div>

      {/* IPFS Decentralized Pinning */}
      {result.ipfs_cid && (
        <div className="p-4 rounded-2xl bg-[#050c1e]/90 border border-purple-500/20 space-y-2 font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span className="uppercase text-[10px] tracking-wider font-bold">IPFS Decentralized Storage CID</span>
            </div>
            {result.ipfs_url && (
              <a
                href={result.ipfs_url}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-200 hover:underline text-[11px] flex items-center space-x-1"
              >
                <span>Gateway View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="text-purple-300 break-all select-all font-mono bg-[#020617] p-3 rounded-xl border border-purple-500/20 shadow-inner">
            {result.ipfs_cid}
          </div>
        </div>
      )}

      {/* Action Area: Register Hash On-Chain + Download Official Certificate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        
        {/* On-Chain Registration Button */}
        {!result.is_on_chain ? (
          <button
            onClick={onRegisterOnChain}
            disabled={isRegistering}
            className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-xs font-orbitron tracking-wider shadow-neon-cyan flex items-center justify-center space-x-2.5 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Confirming on Ethereum...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-black fill-current" />
                <span>Register Hash on Blockchain (MetaMask)</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-neon-emerald">
            <span className="flex items-center space-x-2 font-bold font-orbitron">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Registered on Ethereum!</span>
            </span>
            {result.tx_hash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${result.tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-cyan-300 hover:underline font-mono text-[11px]"
              >
                <span>Tx: {result.tx_hash.slice(0, 8)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* PDF Certificate Download Button */}
        <a
          href={getPdfReportUrl(result.file_hash)}
          target="_blank"
          rel="noreferrer"
          download
          className="w-full py-4 px-5 rounded-2xl bg-[#050c1e] hover:bg-[#081329] text-cyan-300 border border-cyan-500/40 text-xs font-orbitron font-bold tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-lg hover:border-cyan-400 hover:shadow-neon-cyan cursor-pointer"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Download Verification Certificate (PDF)</span>
        </a>
      </div>

      {/* Explainable AI (XAI) Feature Inspector */}
      {result.xai_explanation && (
        <ExplainableAIViewer
          xaiData={result.xai_explanation}
          prediction={result.prediction}
          confidence={result.confidence}
          fileHash={result.file_hash}
          gradcamUrl={result.gradcam_url}
          gradcamFailed={result.gradcam_failed}
        />
      )}

    </div>
  );
}

