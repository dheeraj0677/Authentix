import React, { useState, useEffect } from 'react';
import { fetchProvenanceTimeline } from '../utils/api';
import {
  GitCommit,
  Upload,
  ShieldCheck,
  Edit3,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Radio
} from 'lucide-react';

export default function ProvenanceTimeline({ initialFileHash }) {
  const [searchHash, setSearchHash] = useState(initialFileHash || '0x4a7e8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a');
  const [timelineData, setTimelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadTimeline = async (hashToFetch) => {
    if (!hashToFetch) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchProvenanceTimeline(hashToFetch);
      setTimelineData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load provenance lifecycle timeline for this file hash.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchHash) {
      loadTimeline(searchHash);
    }
  }, [initialFileHash]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTimeline(searchHash);
  };

  const getStageIcon = (stageName) => {
    switch (stageName) {
      case 'Original Upload':
        return <Upload className="w-4 h-4 text-cyan-400" />;
      case 'Verification':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'Modification':
        return <Edit3 className="w-4 h-4 text-amber-400" />;
      case 'Ownership Transfer':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'Reverification':
        return <RefreshCw className="w-4 h-4 text-pink-400" />;
      default:
        return <GitCommit className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStageBadgeColor = (stageName) => {
    switch (stageName) {
      case 'Original Upload':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-neon-cyan';
      case 'Verification':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-neon-emerald';
      case 'Modification':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-neon-amber';
      case 'Ownership Transfer':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-neon-purple';
      case 'Reverification':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/40 shadow-neon-pink';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="holo-glass rounded-3xl p-6 sm:p-8 border border-cyan-500/30 space-y-6 animate-fadeIn transition-all duration-300 hud-box">
      
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <GitCommit className="w-4 h-4" />
            <span className="uppercase font-bold tracking-wider">End-to-End Media Provenance Graph</span>
          </div>
          <h2 className="text-xl font-bold text-white font-orbitron">
            Lifecycle Stage Audit Trail
          </h2>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-500/60 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="Search file SHA-256 hash..."
              className="pl-9 pr-4 py-2 rounded-xl bg-[#020617] border border-cyan-500/30 text-cyan-300 text-xs font-mono w-64 sm:w-80 focus:outline-none focus:border-cyan-400 focus:shadow-neon-cyan shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-orbitron hover:bg-cyan-500/30 transition-all cursor-pointer font-bold shadow-neon-cyan"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Inspect'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Provenance Metadata Banner */}
      {timelineData && (
        <div className="p-4 rounded-2xl bg-[#020617]/90 border border-cyan-500/20 flex flex-col sm:flex-row justify-between gap-3 text-xs font-mono shadow-inner">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">File Name</span>
            <span className="text-white font-bold">{timelineData.filename}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Owner</span>
            <span className="text-purple-300 font-bold">{timelineData.current_owner?.slice(0, 8)}...{timelineData.current_owner?.slice(-6)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Authenticity Verdict</span>
            <span className={`font-bold font-orbitron ${timelineData.is_authentic ? 'text-emerald-400 text-glow-emerald' : 'text-pink-400 text-glow-pink'}`}>
              {timelineData.is_authentic ? 'AUTHENTIC (REAL)' : 'TAMPERED / FAKE'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Stages Tracked</span>
            <span className="text-cyan-400 font-bold">{timelineData.total_stages} Blockchain Events</span>
          </div>
        </div>
      )}

      {/* Interactive Vertical Provenance Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-pink-500">
        
        {timelineData?.timeline?.map((stage) => (
          <div key={stage.stage_id} className="relative group">
            
            {/* Stage Icon Node */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 p-1.5 rounded-full bg-[#050c1e] border border-cyan-400 shadow-neon-cyan flex items-center justify-center">
              {getStageIcon(stage.stage_name)}
            </div>

            {/* Stage Content Card */}
            <div className="p-5 rounded-2xl holo-card border border-cyan-500/20 hover:border-cyan-400 transition-all duration-200 space-y-2.5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/15 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-slate-400 font-bold">Stage #{stage.stage_id}</span>
                  <span className={`px-2.5 py-0.5 rounded-md border text-[10px] font-mono font-bold ${getStageBadgeColor(stage.stage_name)}`}>
                    {stage.stage_name}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#020617] text-cyan-400 font-mono text-[9px] border border-cyan-500/20">
                    {stage.event_name}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{stage.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-200 font-mono leading-relaxed">
                {stage.details}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                {stage.actor && (
                  <div className="truncate">
                    <span className="text-slate-400">Actor Wallet: </span>
                    <span className="text-slate-200 font-semibold">{stage.actor}</span>
                  </div>
                )}

                {stage.tx_hash && (
                  <div className="truncate">
                    <span className="text-slate-400">Tx Hash: </span>
                    <span className="text-cyan-300 font-semibold">{stage.tx_hash}</span>
                  </div>
                )}

                {stage.ipfs_cid && (
                  <div className="truncate">
                    <span className="text-slate-400">IPFS CID: </span>
                    <span className="text-purple-300 font-semibold">{stage.ipfs_cid}</span>
                  </div>
                )}

                {stage.prediction && (
                  <div>
                    <span className="text-slate-400">Verdict: </span>
                    <span className={`font-bold font-orbitron ${stage.prediction === 'REAL' ? 'text-emerald-400' : 'text-pink-400'}`}>
                      {stage.prediction} ({stage.confidence || 98.5}%)
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

