import React, { useState, useEffect, useMemo } from 'react';
import { fetchHistory, fetchVerificationHistory, getPdfReportUrl, getGradCamUrl } from '../utils/api';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  FileText,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Database,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

const PAGE_SIZE = 10;

export default function HistoryPage({ wallet }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [viewTab, setViewTab] = useState('my'); // 'my' vs 'global'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedHash, setCopiedHash] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (viewTab === 'my') {
        const targetWallet = wallet || 'all';
        const items = await fetchHistory(targetWallet);
        setHistoryItems(items);
      } else {
        const items = await fetchVerificationHistory('all');
        setHistoryItems(items);
      }
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [wallet, viewTab]);

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return historyItems;
    const q = searchQuery.toLowerCase();
    return historyItems.filter((item) => {
      const matchHash = item.file_hash?.toLowerCase().includes(q);
      const matchFile = item.filename?.toLowerCase().includes(q);
      const matchPred = item.prediction?.toLowerCase().includes(q);
      return matchHash || matchFile || matchPred;
    });
  }, [historyItems, searchQuery]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const handleCopy = (hash) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn pb-16 grid-bg">
      
      {/* Page Header (Stitch Style) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-fixed">
            <Terminal className="w-4 h-4 text-primary-fixed" />
            <span className="font-code-md text-xs uppercase tracking-widest text-primary-fixed/70">
              System // Registry_Access
            </span>
          </div>
          <h1 className="font-display-lg text-3xl sm:text-4xl text-primary-fixed tracking-tight uppercase drop-shadow-[0_0_15px_rgba(125,244,255,0.4)]">
            Audit History
          </h1>
          <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Immutable ledger of analyzed media assets and their cryptographic provenance proofs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="glow-btn px-4 py-2 font-label-caps text-xs uppercase flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls: Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full p-4 bg-surface-container-low/80 backdrop-blur-md border border-primary/20 relative">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewTab('my')}
            className={`font-label-caps text-xs uppercase px-4 py-2 transition-all ${
              viewTab === 'my'
                ? 'bg-primary/10 border border-primary-fixed text-primary-fixed shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'border border-outline-variant text-outline hover:border-primary/50 hover:text-primary-fixed'
            }`}
          >
            My Registered Media
          </button>
          <button
            onClick={() => setViewTab('global')}
            className={`font-label-caps text-xs uppercase px-4 py-2 transition-all ${
              viewTab === 'global'
                ? 'bg-primary/10 border border-primary-fixed text-primary-fixed shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'border border-outline-variant text-outline hover:border-primary/50 hover:text-primary-fixed'
            }`}
          >
            Global Audit Log
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="SEARCH HASH OR FILENAME..."
              className="w-full bg-surface-dim border-0 border-b border-outline-variant focus:border-primary-fixed focus:ring-0 text-on-surface font-code-md text-xs pl-9 pr-3 py-2 placeholder-outline/50 outline-none"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="border border-outline-variant p-2 text-outline hover:text-primary-fixed hover:border-primary-fixed transition-colors"
            title="Clear Filter"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Registry Data Grid (Table Alternative) */}
      <div className="w-full relative border border-primary/20 bg-surface-container-lowest/50 backdrop-blur-xl">
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        {/* Scanning Line Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hud-scanline w-full h-[15%] absolute top-0" />
        </div>

        {/* Header Row */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-primary/20 font-label-caps text-[11px] text-secondary-fixed uppercase bg-surface-container/50 tracking-wider">
          <div className="col-span-1">Preview</div>
          <div className="col-span-3">Asset Details</div>
          <div className="col-span-3">Cryptographic Hash</div>
          <div className="col-span-2">Analysis Status</div>
          <div className="col-span-1">Ledger</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Data Rows Container */}
        <div className="flex flex-col divide-y divide-primary/10">
          {paginatedItems.length > 0 ? (
            paginatedItems.map((item, idx) => {
              const isDeepfake = item.prediction?.toLowerCase() === 'fake' || item.prediction?.toLowerCase() === 'deepfake';
              const fileHash = item.file_hash || `0x${idx}a8f...92c`;
              const filename = item.filename || `payload_capture_${idx + 1}.jpg`;
              const timestampStr = item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString();

              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-primary/5 transition-colors group"
                >
                  {/* Thumbnail Preview */}
                  <div className="col-span-1">
                    <div className="w-12 h-12 border border-primary/30 relative bg-surface-container overflow-hidden">
                      {item.gradcam_url ? (
                        <img
                          src={getGradCamUrl(item.gradcam_url)}
                          alt="Thumbnail"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/40 text-primary-fixed font-code-md text-[10px]">
                          PAYLOAD
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
                    </div>
                  </div>

                  {/* Asset Details */}
                  <div className="col-span-3 flex flex-col justify-center font-code-md text-xs">
                    <span className="text-on-surface truncate font-bold">{filename}</span>
                    <span className="font-label-caps text-[10px] text-outline mt-0.5">{timestampStr}</span>
                  </div>

                  {/* Cryptographic Hash */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div
                      className="font-code-md text-[11px] text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-1 border border-tertiary-fixed/30 truncate font-mono flex-grow"
                      title={fileHash}
                    >
                      {fileHash.slice(0, 10)}...{fileHash.slice(-8)}
                    </div>
                    <button
                      onClick={() => handleCopy(fileHash)}
                      className="text-outline hover:text-primary-fixed transition-colors"
                      title="Copy Hash"
                    >
                      {copiedHash === fileHash ? <Check className="w-3.5 h-3.5 text-tertiary-fixed" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Analysis Status */}
                  <div className="col-span-2 flex items-center">
                    <span className={`font-label-caps text-[10px] px-2.5 py-1 uppercase border tracking-wider ${
                      isDeepfake
                        ? 'bg-error-container/40 text-error border-error/50'
                        : 'bg-tertiary-container/30 text-tertiary-fixed border-tertiary-fixed/50'
                    }`}>
                      {isDeepfake ? 'Deepfake Detected' : 'Authentic Media'}
                    </span>
                  </div>

                  {/* Ledger Status */}
                  <div className="col-span-1 flex items-center">
                    <CheckCircle2
                      className={`w-4 h-4 ${item.is_on_chain !== false ? 'text-tertiary-fixed' : 'text-outline'}`}
                      title={item.is_on_chain !== false ? 'Anchored to Ethereum' : 'Off-Chain Record'}
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-2 text-outline-variant font-code-md text-xs">
                    {item.ipfs_cid && (
                      <a
                        href={`https://ipfs.io/ipfs/${item.ipfs_cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary-fixed transition-colors p-1"
                        title="View on IPFS"
                      >
                        <Database className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <a
                      href={getPdfReportUrl(fileHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary-fixed transition-colors p-1"
                      title="Download PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`/dashboard`}
                      className="border border-primary/30 px-2 py-1 text-[10px] font-label-caps text-primary-fixed hover:bg-primary/10 ml-1 transition-colors"
                    >
                      PROVENANCE
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center font-code-md text-xs text-outline">
              {isLoading ? 'Fetching immutable audit ledger...' : 'No audit records match your query.'}
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-primary/20 font-label-caps text-xs">
            <span className="text-outline">
              PAGE {currentPage} OF {totalPages} ({filteredItems.length} TOTAL RECORDS)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="glow-btn px-3 py-1 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                PREV
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="glow-btn px-3 py-1 flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none"
              >
                NEXT
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
