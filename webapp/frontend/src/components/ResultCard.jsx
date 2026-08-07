import React from 'react';
import { ShieldCheck, ShieldAlert, Key, Cpu, ExternalLink, Loader2, FileText, Database, Clock, Flame } from 'lucide-react';
import { getPdfReportUrl } from '../utils/api';
import ExplainableAIViewer from './ExplainableAIViewer';

export default function ResultCard({ result, onRegisterOnChain, isRegistering, wallet }) {
  if (!result) return null;

  const isReal = result.prediction === 'REAL';
  const confidence = result.confidence;
  const meta = result.model_metadata;

  return (
    <div className="glass-card rounded-2xl p-6 border border-zinc-900 bg-black/90 space-y-6">
      
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${isReal ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {isReal ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold tracking-wide ${isReal ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.prediction}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 font-mono border border-zinc-800">
                {confidence}% Confidence
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center space-x-1.5 font-mono">
              <span>{meta?.model_name || 'EfficientNetB0 Classifier'}</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-950 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                {meta?.model_version || 'v1.0.0'}
              </span>
            </p>
          </div>
        </div>

        {result.is_on_chain && (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono">
            <span>On-Chain Registered</span>
          </span>
        )}
      </div>


      {/* Model Version & Performance Metrics Metadata Panel */}
      {meta && (
        <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-900 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-900 pb-2">

            <span className="text-emerald-400 font-semibold uppercase text-[10px] tracking-wider">Model &amp; Dataset Specifications</span>

            <span className="text-purple-400 text-[11px]">Trained: {meta.training_date}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-gray-500 block text-[10px]">MODEL VER</span>
              <span className="text-gray-200 font-bold">{meta.model_version}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">DATASET</span>
              <span className="text-gray-200 font-bold truncate block">{meta.dataset_version}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">ACCURACY</span>
              <span className="text-emerald-400 font-bold">{(meta.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">F1 SCORE</span>
              <span className="text-cyan-400 font-bold">{(meta.f1_score * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-800/40 text-[10px] text-gray-400">
            <div>Precision: <span className="text-gray-200">{(meta.precision * 100).toFixed(1)}%</span></div>
            <div>Recall: <span className="text-gray-200">{(meta.recall * 100).toFixed(1)}%</span></div>
          </div>
        </div>
      )}

      {/* Inference Time & Heatmap Availability Metadata Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inference Time:</span>
          <span className="text-cyan-300 font-bold">
            {result.inference_time_ms ? `${result.inference_time_ms} ms` : '~120 ms'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Heatmap:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.heatmap_available !== false ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-gray-800 text-gray-500'}`}>
            {result.heatmap_available !== false ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Probability Distribution & Confidence Progress Bars */}
      <div className="space-y-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800/80">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-gray-400 uppercase text-[10px] tracking-wider">Probability Distribution</span>
          <span className="text-cyan-400 font-bold">{confidence}% Confidence</span>
        </div>

        {/* Real Probability Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-emerald-400">
            <span>REAL Probability</span>
            <span>{result.probability_distribution?.real ?? (isReal ? confidence : (100 - confidence).toFixed(2))}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
              style={{ width: `${result.probability_distribution?.real ?? (isReal ? confidence : 100 - confidence)}%` }}
            />
          </div>
        </div>

        {/* Fake Probability Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-rose-400">
            <span>FAKE Probability</span>
            <span>{result.probability_distribution?.fake ?? (!isReal ? confidence : (100 - confidence).toFixed(2))}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-500"
              style={{ width: `${result.probability_distribution?.fake ?? (!isReal ? confidence : 100 - confidence)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SHA-256 File Hash */}
      <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1 font-mono text-xs">
        <div className="flex items-center space-x-2 text-gray-400">
          <Key className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase text-[10px] tracking-wider">Cryptographic SHA-256 Hash</span>
        </div>
        <div className="text-gray-300 break-all select-all font-mono">
          {result.file_hash}
        </div>
      </div>

      {/* IPFS CID & Gateway Link */}
      {result.ipfs_cid && (
        <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 space-y-1 font-mono text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span className="uppercase text-[10px] tracking-wider">Decentralized IPFS CID</span>
            </div>
            {result.ipfs_url && (
              <a
                href={result.ipfs_url}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline text-[11px] flex items-center space-x-1"
              >
                <span>View on IPFS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="text-gray-300 break-all select-all font-mono">
            {result.ipfs_cid}
          </div>
        </div>
      )}

      {/* Action Button: Register on Blockchain */}
      {!result.is_on_chain ? (
        <button
          onClick={onRegisterOnChain}
          disabled={isRegistering}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium text-sm shadow-lg glow-cyan flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
        >
          {isRegistering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Confirming on Ethereum Blockchain...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 text-white" />
              <span>Register Hash on Blockchain (MetaMask)</span>
            </>
          )}
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between">
          <span>Registered on-chain successfully!</span>
          {result.tx_hash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${result.tx_hash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-cyan-400 hover:underline font-mono text-[11px]"
            >
              <span>Tx: {result.tx_hash.slice(0, 8)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* PDF Certificate Download Button */}
      <div className="pt-2">
        <a
          href={getPdfReportUrl(result.file_hash)}
          target="_blank"
          rel="noreferrer"
          download
          className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center space-x-2 transition-all duration-200"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Download Official PDF Verification Certificate</span>
        </a>
      </div>

      {/* Explainable AI (XAI) Deep Inspection Component */}
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

