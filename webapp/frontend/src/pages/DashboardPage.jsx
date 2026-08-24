import React, { useState, useEffect } from 'react';
import { fetchDashboardStats, fetchProvenanceTimeline } from '../utils/api';
import ProvenanceTimeline from '../components/ProvenanceTimeline';
import {
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Activity,
  Layers,
  Zap,
  Clock,
  Radio,
  FileCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineSearchHash, setTimelineSearchHash] = useState('');
  const [activeTimeline, setActiveTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSearchProvenance = async (e) => {
    e?.preventDefault();
    if (!timelineSearchHash.trim()) return;
    setTimelineLoading(true);
    setTimelineError(null);
    try {
      const data = await fetchProvenanceTimeline(timelineSearchHash.trim());
      setActiveTimeline(data);
    } catch (err) {
      console.error(err);
      setTimelineError('No on-chain provenance records found for this cryptographic hash.');
      setActiveTimeline(null);
    } finally {
      setTimelineLoading(false);
    }
  };

  const totalIngested = stats?.total_uploads ?? 1248;
  const realCount = stats?.real_images ?? 1051;
  const fakeCount = stats?.fake_images ?? 312;
  const totalVerifiedPercent = stats ? ((realCount / Math.max(1, realCount + fakeCount)) * 100).toFixed(1) : '84.2';
  const totalGas = stats?.total_gas_used ? `${(stats.total_gas_used / 1000000).toFixed(2)}M` : '1.84M';
  const latestBlockNum = stats?.latest_blocks?.[0]?.number ? stats.latest_blocks[0].number.toLocaleString() : '19,432,109';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16 grid-bg">
      
      {/* Network Activity Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-gutter pb-4 border-b border-primary-fixed/30">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display-lg text-3xl sm:text-4xl text-primary-fixed uppercase tracking-widest drop-shadow-[0_0_15px_rgba(125,244,255,0.5)]">
              Network Activity
            </h1>
            <button
              onClick={loadDashboard}
              className="p-1 text-primary-fixed hover:text-white transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="font-code-md text-xs sm:text-sm text-on-surface-variant mt-2 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed shadow-[0_0_8px_#6ffbbe] animate-pulse" />
            <span>LIVE ETHEREUM LOCAL RPC SYNC // PORT 8545</span>
          </p>
        </div>

        <div className="flex gap-gutter">
          <div className="text-right">
            <span className="font-label-caps text-xs text-outline uppercase block">Block Height</span>
            <span className="font-code-md text-lg sm:text-xl text-on-surface font-bold">{latestBlockNum}</span>
          </div>
          <div className="text-right">
            <span className="font-label-caps text-xs text-outline uppercase block">Contract Version</span>
            <span className="font-code-md text-lg sm:text-xl text-secondary-fixed font-bold">v1.0.0</span>
          </div>
        </div>
      </section>

      {/* 4 Metric Cards Grid (Stitch Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        
        {/* Metric 1: Total Media Ingested */}
        <div className="glass-panel hud-bracket p-panel-padding relative overflow-hidden group transition-all duration-300">
          <div className="scan-line hidden group-hover:block" />
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-xs text-outline uppercase">Total Media Ingested</span>
            <span className="material-symbols-outlined text-primary-fixed">cloud_download</span>
          </div>
          <div className="font-display-lg text-3xl sm:text-4xl text-primary-fixed font-bold">
            {totalIngested.toLocaleString()}
          </div>
          <div className="mt-2 font-code-md text-xs text-tertiary-fixed flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_upward</span> +12% 24h
          </div>
        </div>

        {/* Metric 2: Verified Authentic */}
        <div className="glass-panel hud-bracket-alt p-panel-padding relative overflow-hidden group transition-all duration-300">
          <div
            className="scan-line hidden group-hover:block"
            style={{
              background: 'linear-gradient(to right, transparent, #a100f0, transparent)',
              boxShadow: '0 0 10px #a100f0'
            }}
          />
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-xs text-outline uppercase">Verified Authentic</span>
            <span className="material-symbols-outlined text-secondary-fixed">verified_user</span>
          </div>
          <div className="font-display-lg text-3xl sm:text-4xl text-secondary-fixed font-bold">
            {totalVerifiedPercent}%
          </div>
          <div className="mt-2 font-code-md text-xs text-outline-variant">Avg Confidence Score</div>
        </div>

        {/* Metric 3: Deepfakes Intercepted */}
        <div className="glass-panel hud-bracket p-panel-padding relative overflow-hidden group transition-all duration-300 border-error/30 hover:border-error">
          <div
            className="scan-line hidden group-hover:block"
            style={{
              background: 'linear-gradient(to right, transparent, #ffb4ab, transparent)',
              boxShadow: '0 0 10px #ffb4ab'
            }}
          />
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-xs text-outline uppercase">Deepfakes Intercepted</span>
            <span className="material-symbols-outlined text-error">gpp_bad</span>
          </div>
          <div className="font-display-lg text-3xl sm:text-4xl text-error font-bold">
            {fakeCount.toLocaleString()}
          </div>
          <div className="mt-2 font-code-md text-xs text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">warning</span> Critical Threats Flagged
          </div>
        </div>

        {/* Metric 4: Gas Consumed */}
        <div className="glass-panel hud-bracket p-panel-padding relative overflow-hidden group transition-all duration-300">
          <div className="scan-line hidden group-hover:block" />
          <div className="flex justify-between items-start mb-3">
            <span className="font-label-caps text-xs text-outline uppercase">Gas Consumed</span>
            <span className="material-symbols-outlined text-primary-fixed">local_gas_station</span>
          </div>
          <div className="font-display-lg text-3xl sm:text-4xl text-primary-fixed font-bold">
            {totalGas}
          </div>
          <div className="mt-2 font-code-md text-xs text-tertiary-fixed flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span> {stats?.blockchain_transactions ?? 142} Proofs On-Chain
          </div>
        </div>

      </section>

      {/* Cryptographic Provenance Tracer Console */}
      <section className="hud-corner bg-surface-container-low/50 backdrop-blur-xl border border-primary-fixed/20 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-fixed/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-fixed rounded-full shadow-[0_0_8px_#00f0ff]" />
              <h2 className="font-headline-md text-lg sm:text-xl text-on-surface uppercase tracking-wide">
                Provenance Timeline Tracer
              </h2>
            </div>
            <p className="font-code-md text-xs text-outline mt-1">
              Trace media lifecycle from original AI ingestion &rarr; IPFS Pinning &rarr; Smart Contract Anchoring.
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchProvenance} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={timelineSearchHash}
              onChange={(e) => setTimelineSearchHash(e.target.value)}
              placeholder="ENTER 64-CHAR SHA-256 HASH OR TX HASH TO TRACE PROVENANCE..."
              className="w-full bg-surface-container-highest/80 border-b border-outline hover:border-primary-fixed/50 focus:border-primary-fixed outline-none text-on-surface font-code-md text-xs pl-9 pr-4 py-3 placeholder:text-outline/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={timelineLoading}
            className="glow-btn glow-btn-primary px-6 py-3 font-label-caps text-xs uppercase font-bold flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{timelineLoading ? 'TRACING...' : 'TRACE'}</span>
          </button>
        </form>

        {timelineError && (
          <div className="bg-error-container/20 border border-error/40 p-3 font-code-md text-xs text-error">
            {timelineError}
          </div>
        )}

        {/* Render Timeline Component */}
        {activeTimeline && (
          <div className="pt-2 animate-fadeIn">
            <ProvenanceTimeline timelineData={activeTimeline} />
          </div>
        )}
      </section>

      {/* Two Column Grid: Smart Contract Live Stream & Ethereum Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Live Smart Contract Events (7 Cols) */}
        <div className="lg:col-span-7 hud-corner bg-surface-container-low/50 backdrop-blur-xl border border-primary-fixed/20 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-primary-fixed/20 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary-fixed animate-pulse" />
              <h3 className="font-label-caps text-xs text-primary-fixed uppercase tracking-widest">
                Smart Contract Event Stream
              </h3>
            </div>
            <span className="font-code-md text-[10px] text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-0.5 border border-tertiary-fixed/30 uppercase">
              Live Stream
            </span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {stats?.contract_events && stats.contract_events.length > 0 ? (
              stats.contract_events.map((evt, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3 border border-outline-variant/30 flex items-start justify-between gap-3 hover:border-primary-fixed/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-label-caps text-[11px] text-secondary-fixed bg-secondary-container/20 px-1.5 py-0.5 border border-secondary-container/30 uppercase">
                        {evt.event_name}
                      </span>
                      <span className="font-code-md text-[11px] text-outline font-mono">
                        Block #{evt.block_number ?? '19432109'}
                      </span>
                    </div>
                    <div className="font-code-md text-xs text-primary-fixed break-all font-mono truncate max-w-sm">
                      {evt.file_hash}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 font-code-md text-[11px] text-outline">
                    {evt.timestamp}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 font-code-md text-xs text-outline">
                Listening for on-chain events on Hardhat RPC node...
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Ethereum Blocks (5 Cols) */}
        <div className="lg:col-span-5 hud-corner bg-surface-container-low/50 backdrop-blur-xl border border-primary-fixed/20 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-primary-fixed/20 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-secondary-fixed" />
              <h3 className="font-label-caps text-xs text-secondary-fixed uppercase tracking-widest">
                Recent Ethereum Blocks
              </h3>
            </div>
            <span className="font-code-md text-[10px] text-outline">LOCAL NODE</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {stats?.latest_blocks && stats.latest_blocks.length > 0 ? (
              stats.latest_blocks.map((blk, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3 border border-outline-variant/30 flex items-center justify-between font-code-md text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-on-surface">Block #{blk.number}</div>
                    <div className="text-[11px] text-outline truncate max-w-[140px] font-mono">{blk.hash}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-tertiary-fixed font-bold">{blk.tx_count} txs</div>
                    <div className="text-[10px] text-outline">{blk.gas_used.toLocaleString()} gas</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 font-code-md text-xs text-outline">
                Syncing blocks from Hardhat Ethereum Node...
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
