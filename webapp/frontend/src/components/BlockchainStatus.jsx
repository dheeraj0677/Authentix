import React from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, QrCode, Terminal, Key, Database } from 'lucide-react';

export default function BlockchainStatus({ statusData }) {
  if (!statusData) return null;

  const isAuthentic = statusData.status === 'Authentic';
  const isModified = statusData.status === 'Modified';

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 border transition-all duration-300 space-y-6 shadow-2xl hud-box ${
        isAuthentic
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-neon-emerald'
          : isModified
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-neon-pink'
          : 'holo-glass border-cyan-500/30 text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`p-4 rounded-2xl ${
            isAuthentic
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : isModified
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
          }`}
        >
          {isAuthentic ? <ShieldCheck className="w-8 h-8 filter drop-shadow-[0_0_8px_#10b981]" /> : <AlertTriangle className="w-8 h-8 filter drop-shadow-[0_0_8px_#ff3366]" />}
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest font-mono opacity-80 font-bold">
            Ethereum Smart Contract Verdict
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-orbitron tracking-wider">
            {statusData.status}
          </h3>
        </div>
      </div>

      <p className="text-sm font-medium leading-relaxed font-mono">{statusData.message}</p>

      {/* Details breakdown */}
      <div className="p-5 rounded-2xl bg-[#020617]/90 border border-cyan-500/20 space-y-3 font-mono text-xs shadow-inner">
        <div className="flex flex-col sm:flex-row justify-between gap-1">
          <span className="text-slate-400">File SHA-256 Digest:</span>
          <span className="break-all font-mono text-cyan-300 font-bold">{statusData.file_hash}</span>
        </div>

        {statusData.ipfs_cid && (
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
            <span className="text-slate-400">IPFS Storage CID:</span>
            <div className="flex items-center space-x-2">
              <span className="break-all font-mono text-purple-300 font-bold">{statusData.ipfs_cid}</span>
              {statusData.ipfs_url && (
                <a
                  href={statusData.ipfs_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:text-purple-200 hover:underline flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {statusData.on_chain_prediction && (
          <div className="flex justify-between">
            <span className="text-slate-400">On-Chain Verdict Record:</span>
            <span className="font-bold text-cyan-400 font-orbitron">{statusData.on_chain_prediction}</span>
          </div>
        )}

        {statusData.tx_hash && (
          <div className="flex flex-col sm:flex-row justify-between gap-1">
            <span className="text-slate-400">Transaction Hash:</span>
            <span className="text-cyan-300 font-mono break-all font-bold">{statusData.tx_hash}</span>
          </div>
        )}

        {statusData.owner && (
          <div className="flex flex-col sm:flex-row justify-between gap-1">
            <span className="text-slate-400">Registrar Wallet:</span>
            <span className="text-slate-200 font-bold">{statusData.owner}</span>
          </div>
        )}

        {statusData.timestamp > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-400">On-Chain Block Timestamp:</span>
            <span className="text-slate-200 font-semibold">{new Date(statusData.timestamp * 1000).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Permanent QR Code Card */}
      {statusData.qr_code_base64 && (
        <div className="p-5 rounded-2xl bg-[#020617]/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-neon-cyan">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center space-x-2 text-cyan-400 justify-center sm:justify-start">
              <QrCode className="w-4 h-4" />
              <span className="font-bold uppercase text-[11px] font-orbitron">Permanent QR Verification Code</span>
            </div>
            <p className="text-slate-400 text-[11px] max-w-sm leading-relaxed">
              Scan this QR code with any mobile device to directly access and verify this on-chain record at any time.
            </p>
            {statusData.verification_url && (
              <a
                href={statusData.verification_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-cyan-300 hover:text-white hover:underline text-[11px] pt-1 font-bold"
              >
                <span>{statusData.verification_url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="p-2.5 bg-[#050c1e] rounded-2xl border border-cyan-400/50 shrink-0 shadow-lg">
            <img
              src={statusData.qr_code_base64}
              alt="Permanent Verification QR Code"
              className="w-28 h-28 object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

