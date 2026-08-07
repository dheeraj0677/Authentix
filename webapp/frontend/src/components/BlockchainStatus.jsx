import React from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, QrCode } from 'lucide-react';

export default function BlockchainStatus({ statusData }) {
  if (!statusData) return null;

  const isAuthentic = statusData.status === 'Authentic';
  const isModified = statusData.status === 'Modified';

  return (
    <div
      className={`rounded-2xl p-6 border transition-all duration-300 space-y-4 ${
        isAuthentic
          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
          : isModified
          ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          : 'bg-gray-900/60 border-gray-800 text-gray-300'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`p-3 rounded-xl ${
            isAuthentic
              ? 'bg-emerald-500/20 text-emerald-400'
              : isModified
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          {isAuthentic ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider font-mono opacity-80">
            Blockchain Verification Result
          </span>
          <h3 className="text-2xl font-bold font-mono">
            {statusData.status}
          </h3>
        </div>
      </div>

      <p className="text-sm font-medium">{statusData.message}</p>

      {/* Details breakdown */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">File SHA-256 Hash:</span>
          <span className="break-all font-mono text-gray-200">{statusData.file_hash}</span>
        </div>

        {statusData.ipfs_cid && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">IPFS Decentralized CID:</span>
            <div className="flex items-center space-x-2">
              <span className="break-all font-mono text-purple-300">{statusData.ipfs_cid}</span>
              {statusData.ipfs_url && (
                <a
                  href={statusData.ipfs_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:underline flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {statusData.on_chain_prediction && (
          <div className="flex justify-between">
            <span className="text-gray-400">On-Chain Prediction Record:</span>
            <span className="font-bold text-cyan-400">{statusData.on_chain_prediction}</span>
          </div>
        )}

        {statusData.tx_hash && (
          <div className="flex justify-between">
            <span className="text-gray-400">Transaction Hash:</span>
            <span className="text-cyan-400 font-mono break-all">{statusData.tx_hash}</span>
          </div>
        )}

        {statusData.owner && (
          <div className="flex justify-between">
            <span className="text-gray-400">Registrar Wallet:</span>
            <span className="text-gray-300">{statusData.owner}</span>
          </div>
        )}

        {statusData.timestamp > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">On-Chain Timestamp:</span>
            <span className="text-gray-300">{new Date(statusData.timestamp * 1000).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Permanent QR Code Card */}
      {statusData.qr_code_base64 && (
        <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center space-x-2 text-cyan-400 justify-center sm:justify-start">
              <QrCode className="w-4 h-4" />
              <span className="font-bold uppercase text-[11px]">Permanent QR Verification Code</span>
            </div>
            <p className="text-gray-400 text-[11px] max-w-sm">
              Scan this QR code with any mobile device to directly access and verify this on-chain record at any time.
            </p>
            {statusData.verification_url && (
              <a
                href={statusData.verification_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-cyan-400 hover:underline text-[11px] pt-1"
              >
                <span>{statusData.verification_url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="p-2 bg-black/60 rounded-xl border border-cyan-500/30 shrink-0 glow-cyan">
            <img
              src={statusData.qr_code_base64}
              alt="Permanent Verification QR Code"
              className="w-28 h-28 object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
