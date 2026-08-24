import React from 'react';
import { ShieldCheck, Cpu, Database, Flame, Sparkles, Lock, ArrowRight, Activity, Zap, Terminal, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingHero({ onScrollToUpload }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 holo-glass p-8 sm:p-14 shadow-2xl hud-box transition-all duration-300">
      
      {/* Decorative Cyber Ambient Spotlights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Grid Background Accent */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">

        {/* Top Floating Cyber Badge */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wide animate-pulse-glow shadow-neon-cyan">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-extrabold uppercase tracking-widest text-[11px] font-orbitron">
            NEXT-GEN AI DEEP LEARNING + ZERO-KNOWLEDGE LEDGER
          </span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        </div>

        {/* Main Shifting Gradient Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-syne text-white tracking-tight leading-[1.08]">
          Detect DeepFakes.{' '}
          <span className="gradient-text-animated">
            Verify Reality.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
          Authentix safeguards visual truth by coupling deep transfer-learning neural networks with immutable Ethereum blockchain ledgering and explainable Grad-CAM spatial activation heatmaps.
        </p>

        {/* CTA Buttons Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onScrollToUpload}
            className="px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-black font-black text-sm font-orbitron tracking-wider flex items-center space-x-3 shadow-neon-cyan transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-black fill-current" />
            <span>Launch Neural Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/verify"
            className="px-7 py-4 rounded-2xl bg-[#050c1e]/90 hover:bg-[#081329] text-white hover:text-cyan-300 font-bold text-sm font-orbitron tracking-wider border border-cyan-500/40 flex items-center space-x-2.5 transition-all transform hover:-translate-y-0.5 shadow-lg hover:border-cyan-400"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Verify File On-Chain</span>
          </Link>
        </div>

        {/* 3 Pillar Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 text-left">
          
          {/* Card 1 */}
          <div className="p-6 rounded-2xl holo-card border border-cyan-500/25 hover:border-cyan-400 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-3.5 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-3.5 border border-cyan-500/30 group-hover:scale-110 transition-transform shadow-neon-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-orbitron tracking-wide">EfficientNetB4 Neural Net</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
              High-resolution convolutional feature extraction spotting GAN blending, frequency distortions, and facial boundary tampering.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl holo-card border border-purple-500/25 hover:border-purple-400 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-3.5 border border-purple-500/30 group-hover:scale-110 transition-transform shadow-neon-purple">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-orbitron tracking-wide">Ethereum Smart Registry</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
              Zero-knowledge SHA-256 cryptographic hash anchoring guaranteeing tamper-evident media provenance and author proof.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl holo-card border border-pink-500/25 hover:border-pink-400 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-3.5 rounded-xl bg-pink-500/10 text-pink-400 w-fit mb-3.5 border border-pink-500/30 group-hover:scale-110 transition-transform shadow-neon-pink">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white font-orbitron tracking-wide">Grad-CAM Spatial Heatmaps</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed font-mono">
              Visual explainable AI (XAI) mapping exact pixel coordinate regions driving neural network classification decisions.
            </p>
          </div>

        </div>

        {/* Live Protocol Metrics Ticker */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-400 border-t border-cyan-500/20">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Trained Model AUC: <strong className="text-emerald-400 font-bold">93.8%</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Zero-Knowledge <strong className="text-cyan-400 font-bold">SHA-256 Proofs</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>MetaMask <strong className="text-purple-400 font-bold">EIP-191 Auth</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}

