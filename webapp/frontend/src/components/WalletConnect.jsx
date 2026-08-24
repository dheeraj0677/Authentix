import React, { useState } from 'react';
import { Wallet, CheckCircle2, LogOut, Loader2, ShieldCheck, Sparkles, UserCheck, Key, Terminal } from 'lucide-react';
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
          className="flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:border-cyan-400 hover:shadow-neon-cyan transition-all cursor-pointer shadow-lg"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          </div>
          <span className="font-bold tracking-wider">{truncated}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase">
            EIP-191
          </span>
        </button>

        {/* Wallet Session Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 holo-glass border border-cyan-500/40 bg-[#050c1e]/95 rounded-2xl shadow-2xl py-4 px-5 z-50 space-y-4 animate-fadeIn hud-box">
            <div className="flex items-center justify-between text-xs border-b border-cyan-500/20 pb-2.5">
              <span className="text-slate-400 font-mono">Provider Interface</span>
              <span className="text-emerald-400 font-bold font-mono flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{walletInfo.name}</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-wider font-bold flex items-center space-x-1">
                <Key className="w-3 h-3 text-cyan-400" />
                <span>Active Signer Address</span>
              </span>
              <p className="text-xs text-slate-200 font-mono break-all select-all bg-[#020617] p-2.5 rounded-xl border border-cyan-500/20 shadow-inner">
                {wallet}
              </p>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-cyan-300 font-mono bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/30">
              <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>EIP-191 Cryptographic Session Verified</span>
            </div>

            <button
              onClick={() => {
                setShowDropdown(false);
                onDisconnect();
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-mono transition-colors cursor-pointer font-bold shadow-lg"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Disconnect Wallet Session</span>
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
      className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-black font-extrabold text-xs font-orbitron tracking-wider shadow-neon-cyan transition-all duration-300 disabled:opacity-50 cursor-pointer transform hover:-translate-y-0.5"
    >
      {isAuthenticating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-black" />
          <span>Signing Challenge...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 text-black" />
          <span>Connect MetaMask</span>
        </>
      )}
    </button>
  );
}

