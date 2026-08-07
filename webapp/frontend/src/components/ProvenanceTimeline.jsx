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
  Clock
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
        return <Upload className="w-5 h-5 text-cyan-400" />;
      case 'Verification':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Modification':
        return <Edit3 className="w-5 h-5 text-amber-400" />;
      case 'Ownership Transfer':
        return <UserCheck className="w-5 h-5 text-purple-400" />;
      case 'Reverification':
        return <RefreshCw className="w-5 h-5 text-sky-400" />;
      default:
        return <GitCommit className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStageBadgeColor = (stageName) => {
    switch (stageName) {
      case 'Original Upload':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'Verification':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Modification':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Ownership Transfer':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'Reverification':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-6 animate-fadeIn">
      
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <GitCommit className="w-4 h-4" />
            <span className="uppercase font-bold tracking-wider">End-to-End Media Provenance Graph</span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono">
            Lifecycle Stage Audit Trail
          </h2>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              placeholder="Search file SHA-256 hash..."
              className="pl-9 pr-4 py-1.5 rounded-xl bg-black/50 border border-gray-800 text-gray-200 text-xs font-mono w-64 sm:w-80 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Inspect'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Provenance Metadata Banner */}
      {timelineData && (
        <div className="p-4 rounded-xl bg-black/40 border border-gray-800 flex flex-col sm:flex-row justify-between gap-3 text-xs font-mono">
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">File Name</span>
            <span className="text-white font-bold">{timelineData.filename}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Current Owner</span>
            <span className="text-purple-300">{timelineData.current_owner?.slice(0, 8)}...{timelineData.current_owner?.slice(-6)}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Authenticity Verdict</span>
            <span className={`font-bold ${timelineData.is_authentic ? 'text-emerald-400' : 'text-rose-400'}`}>
              {timelineData.is_authentic ? 'AUTHENTIC (REAL)' : 'TAMPERED / FAKE'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10px] uppercase">Total Stages Tracked</span>
            <span className="text-cyan-400 font-bold">{timelineData.total_stages} Blockchain Events</span>
          </div>
        </div>
      )}

      {/* Interactive Vertical Provenance Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-purple-500 before:to-emerald-500">
        
        {timelineData?.timeline?.map((stage) => (
          <div key={stage.stage_id} className="relative group">
            
            {/* Stage Icon Node */}
            <div className="absolute -left-6 sm:-left-8 top-1.5 p-1.5 rounded-full bg-gray-900 border border-cyan-500/50 shadow-lg glow-cyan flex items-center justify-center">
              {getStageIcon(stage.stage_name)}
            </div>

            {/* Stage Content Card */}
            <div className="p-4 rounded-xl glass-panel border border-gray-800/80 hover:border-cyan-500/40 transition-all duration-200 space-y-2">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/60 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-gray-400 font-bold">Stage #{stage.stage_id}</span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${getStageBadgeColor(stage.stage_name)}`}>
                    {stage.stage_name}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-gray-900 text-gray-400 font-mono text-[9px]">
                    {stage.event_name}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-[11px] text-gray-500 font-mono">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{stage.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-gray-300 font-mono">
                {stage.details}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-gray-400 pt-1">
                {stage.actor && (
                  <div className="truncate">
                    <span className="text-gray-500">Actor Wallet: </span>
                    <span className="text-gray-300">{stage.actor}</span>
                  </div>
                )}

                {stage.tx_hash && (
                  <div className="truncate">
                    <span className="text-gray-500">Tx Hash: </span>
                    <span className="text-cyan-400">{stage.tx_hash}</span>
                  </div>
                )}

                {stage.ipfs_cid && (
                  <div className="truncate">
                    <span className="text-gray-500">IPFS CID: </span>
                    <span className="text-purple-300">{stage.ipfs_cid}</span>
                  </div>
                )}

                {stage.prediction && (
                  <div>
                    <span className="text-gray-500">Verdict: </span>
                    <span className={`font-bold ${stage.prediction === 'REAL' ? 'text-emerald-400' : 'text-rose-400'}`}>
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
