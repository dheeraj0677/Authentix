import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DropZone from '../components/DropZone';
import BlockchainStatus from '../components/BlockchainStatus';
import ProvenanceTimeline from '../components/ProvenanceTimeline';
import { verifyFileHash, verifyByHash } from '../utils/api';
import { FileCheck, ShieldAlert, QrCode } from 'lucide-react';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const hashFromUrl = searchParams.get('hash');

  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Auto-verify if ?hash=0x... query param is present (e.g. via QR code scan)
  useEffect(() => {
    if (hashFromUrl) {
      const loadFromHash = async () => {
        setIsLoading(true);
        setStatusData(null);
        setErrorMsg(null);
        try {
          const res = await verifyByHash(hashFromUrl);
          setStatusData(res);
        } catch (err) {
          console.error(err);
          setErrorMsg('Failed to query smart contract record for the provided QR code hash.');
        } finally {
          setIsLoading(false);
        }
      };
      loadFromHash();
    }
  }, [hashFromUrl]);

  const handleFileVerify = async (file) => {
    setIsLoading(true);
    setStatusData(null);
    setErrorMsg(null);

    try {
      const res = await verifyFileHash(file);
      setStatusData(res);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to query blockchain smart contract verification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Zero-Knowledge Hash Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify File Authenticity On-Chain
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          Upload any file to recompute its SHA-256 cryptographic hash and cross-check against immutable smart contract records to verify if it is Authentic, Tampered/Modified, or Unregistered.
        </p>
      </div>

      {/* QR Code Auto-Verification Notification */}
      {hashFromUrl && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center space-x-3 animate-fadeIn">
          <QrCode className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <span className="font-bold block">Permanent QR Code Verification Session Active</span>
            <span>Querying blockchain record for hash: <code className="text-cyan-200">{hashFromUrl}</code></span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <DropZone
        onFileSelect={handleFileVerify}
        isLoading={isLoading}
        title="Upload File for Hash Verification"
        subtitle="Recomputes SHA-256 hash & checks Ethereum smart contract ledger"
      />

      {statusData && (
        <div className="space-y-8 animate-fadeIn">
          <BlockchainStatus statusData={statusData} />
          <ProvenanceTimeline initialFileHash={statusData.file_hash || hashFromUrl} />
        </div>
      )}

      {!statusData && (
        <ProvenanceTimeline initialFileHash={hashFromUrl} />
      )}

    </div>
  );
}

