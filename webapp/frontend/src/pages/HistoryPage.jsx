import React, { useState, useEffect, useMemo } from 'react';
import { fetchHistory, fetchVerificationHistory } from '../utils/api';
import { History, ExternalLink, ShieldCheck, ShieldAlert, Clock, RefreshCw, Wallet, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

const PAGE_SIZE = 10;

export default function HistoryPage({ wallet }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [viewTab, setViewTab] = useState('registered'); // 'registered' or 'attempts'
  const [filterMode, setFilterMode] = useState('connected'); // 'connected' or 'all'
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (viewTab === 'attempts') {
        const queryParam = filterMode === 'connected' && wallet ? wallet : 'all';
        const items = await fetchVerificationHistory(queryParam);
        setHistoryItems(items);
      } else {
        const targetWallet = filterMode === 'connected' ? wallet : 'all';
        const items = await fetchHistory(targetWallet);
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
  }, [wallet, filterMode, viewTab]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(historyItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return historyItems.slice(start, start + PAGE_SIZE);
  }, [historyItems, currentPage]);

  // Empty-state: wallet not connected and in "My Wallet" mode
  if (filterMode === 'connected' && !wallet) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <History className="w-8 h-8 text-cyan-400" />
              <span>Blockchain Audit Ledger</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              History of deepfake predictions &amp; registered on-chain file hashes
            </p>
          </div>
          <div className="bg-gray-900 p-1 rounded-xl border border-gray-800 flex text-xs">
            <button
              onClick={() => setFilterMode('connected')}
              className="px-3 py-1.5 rounded-lg transition-all bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            >
              My Wallet
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className="px-3 py-1.5 rounded-lg transition-all text-gray-400 hover:text-gray-200"
            >
              All Records
            </button>
          </div>
        </div>

        {/* Wallet not connected empty state */}
        <div className="glass-card rounded-2xl p-12 border border-gray-800 flex flex-col items-center justify-center space-y-4 text-center animate-fadeIn">
          <div className="p-4 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Wallet className="w-10 h-10 text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-200">Connect Your MetaMask Wallet</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Connect your MetaMask wallet to view your personal verification history and registered on-chain file records.
          </p>
          <button
            onClick={() => setFilterMode('all')}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700 transition-colors"
          >
            View All Records Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <History className="w-8 h-8 text-cyan-400" />
            <span>Blockchain Audit Ledger</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            History of deepfake predictions &amp; registered on-chain file hashes
            {historyItems.length > 0 && (
              <span className="ml-2 text-cyan-400 font-mono">{historyItems.length} record{historyItems.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Tab Selector: Registered vs Verification Attempts */}
          <div className="bg-gray-900 p-1 rounded-xl border border-gray-800 flex text-xs">
            <button
              onClick={() => setViewTab('registered')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                viewTab === 'registered'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Registered Files</span>
            </button>
            <button
              onClick={() => setViewTab('attempts')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                viewTab === 'attempts'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Verification Attempts</span>
            </button>
          </div>

          <div className="bg-gray-900 p-1 rounded-xl border border-gray-800 flex text-xs">
            <button
              onClick={() => setFilterMode('connected')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'connected'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              My Wallet
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All Records
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-800 uppercase tracking-wider">
              {viewTab === 'attempts' ? (
                <tr>
                  <th className="px-6 py-4">Verification Time</th>
                  <th className="px-6 py-4">Result</th>
                  <th className="px-6 py-4">SHA-256 Hash</th>
                  <th className="px-6 py-4">DL Verdict</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Model Version</th>
                  <th className="px-6 py-4">Wallet</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4">Filename</th>
                  <th className="px-6 py-4">DL Verdict</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">SHA-256 Hash</th>
                  <th className="px-6 py-4">Blockchain Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-800/50 text-gray-300">
              {isLoading ? (
                <tr>
                  <td colSpan={viewTab === 'attempts' ? 8 : 6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Loading records...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={viewTab === 'attempts' ? 8 : 6} className="px-6 py-12 text-center text-gray-500">
                    {filterMode === 'connected'
                      ? 'No records found for your wallet address.'
                      : 'No records found.'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  if (viewTab === 'attempts') {
                    const isAuth = item.verification_result === 'Authentic';
                    const isMod = item.verification_result === 'Modified';
                    return (
                      <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-300">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span>{new Date(item.verification_time).toLocaleString()}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isAuth
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isMod
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {isAuth ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            <span>{item.verification_result}</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-400 font-mono text-[11px]" title={item.file_hash}>
                          {item.file_hash.slice(0, 8)}...{item.file_hash.slice(-6)}
                        </td>

                        <td className="px-6 py-4 text-gray-300 font-semibold">
                          {item.prediction}
                        </td>

                        <td className="px-6 py-4 font-bold text-cyan-400">
                          {item.confidence_score}%
                        </td>

                        <td className="px-6 py-4 text-gray-400 text-[11px]">
                          {item.model_version}
                        </td>

                        <td className="px-6 py-4 text-gray-400 text-[11px]">
                          {item.wallet_address ? `${item.wallet_address.slice(0, 6)}...` : 'Anonymous'}
                        </td>

                        <td className="px-6 py-4 text-gray-500 text-[11px]">
                          {item.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  }

                  const isReal = item.prediction === 'REAL';
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-sans font-medium text-gray-200 max-w-[150px] truncate" title={item.filename}>
                        {item.filename}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] ${
                            isReal
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isReal ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          <span>{item.prediction}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold">
                        {item.confidence}%
                      </td>

                      <td className="px-6 py-4 text-gray-400 font-mono text-[11px]">
                        {item.file_hash.slice(0, 10)}...{item.file_hash.slice(-8)}
                      </td>

                      <td className="px-6 py-4">
                        {item.is_on_chain ? (
                          <span className="inline-flex items-center space-x-1 text-cyan-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            <span>On-Chain</span>
                            {item.tx_hash && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${item.tx_hash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-1 text-cyan-500 hover:text-cyan-300"
                                title={`View tx: ${item.tx_hash}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-500">Cached Only</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-[11px]">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span>{new Date(item.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>
            Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, historyItems.length)} of {historyItems.length}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
