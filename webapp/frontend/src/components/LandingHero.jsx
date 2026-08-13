import React from 'react';
import { ShieldCheck, Cpu, Database, Flame, Sparkles, Lock, ArrowRight, Activity } from 'lucide-react';

export default function LandingHero({ onScrollToUpload }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-zinc-950/90 via-black/80 to-zinc-950/90 p-8 sm:p-12 shadow-2xl">
      
      {/* Decorative Glow Orbs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wide animate-pulseGlow">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase text-[11px]">AI Deep Learning + Ethereum Blockchain Protocol</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
          Detect DeepFakes.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Verify Reality.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Authentix combines state-of-the-art transfer learning neural networks with zero-knowledge cryptographic hashing to detect AI synthetic media and anchor proof of origin on the Ethereum ledger.
        </p>

        {/* Key Feature Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">EfficientNet Neural Net</h3>
            <p className="text-xs text-zinc-400 mt-1">Deep convolutional feature extraction spotting facial blending & GAN artifacts.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-purple-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Ethereum Ledger</h3>
            <p className="text-xs text-zinc-400 mt-1">Immutable SHA-256 hash anchoring guaranteeing tamper-evident media origin.</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200">Grad-CAM Heatmaps</h3>
            <p className="text-xs text-zinc-400 mt-1">Visual explainability highlighting exact spatial pixels driving AI predictions.</p>
          </div>

        </div>

        {/* Live Metrics Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-400 border-t border-zinc-900/80">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>AUC Score: <strong className="text-emerald-400">93.8%</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Zero-Knowledge <strong className="text-cyan-400">SHA-256</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>MetaMask <strong className="text-purple-400">EIP-191 Auth</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
