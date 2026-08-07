import React, { useState } from 'react';
import { Wallet, CheckCircle2, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { detectInstalledWallets } from '../utils/wallet';

export default function WalletConnect({ wallet, onConnect, onDisconnect, isAuthenticating }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const walletInfo = detectInstalledWallets();

  if (wallet) {
    const truncated = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{truncated}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
        </button>

        {/* Wallet Session Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 glass-panel border border-zinc-900 bg-black/95 rounded-xl shadow-2xl py-3 px-4 z-50 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs border-b border-zinc-900 pb-2">
              <span className="text-zinc-400 font-mono">Wallet Provider</span>
              <span className="text-emerald-400 font-bold font-mono">{walletInfo.name}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">Signed In Wallet</span>
              <p className="text-xs text-zinc-200 font-mono break-all select-all bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                {wallet}
              </p>
            </div>

            <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>EIP-191 Signature Verified Session</span>
            </div>


            <button
              onClick={() => {
                setShowDropdown(false);
                onDisconnect();
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isAuthenticating}
      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg glow-emerald transition-all duration-200 disabled:opacity-50 cursor-pointer"
    >

      {isAuthenticating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Verifying Signature...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>Connect MetaMask</span>
        </>
      )}
    </button>
  );
}
