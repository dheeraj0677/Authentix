import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AIAnalyticsDashboard from './pages/AIAnalyticsDashboard';
import UploadPage from './pages/UploadPage';
import VerifyPage from './pages/VerifyPage';
import HistoryPage from './pages/HistoryPage';
import { connectWallet, checkMetaMaskInstalled, signNonceMessage } from './utils/wallet';
import { getAuthNonce, verifyAuthSignature, getAuthSession, logoutAuthSession } from './utils/api';
import CyberCanvas from './components/CyberCanvas';
import { ShieldCheck, Cpu, Database, ExternalLink, Github, Sparkles, Lock, Layers, Activity, Zap, Radio, Terminal } from 'lucide-react';

const SESSION_STORAGE_KEY = 'authentix_session_token';
const WALLET_STORAGE_KEY = 'authentix_wallet_address';
const THEME_STORAGE_KEY = 'authentix_theme';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [userRole, setUserRole] = useState('Public User');
  const [sessionToken, setSessionToken] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Default theme is dark cyberpunk
  const [theme, setTheme] = useState('dark');

  // Keep dark class on <html>
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    // Cyberpunk theme remains dark by default
    setTheme((prev) => (prev === 'dark' ? 'dark' : 'dark'));
  };

  // Restore authenticated session on page load
  useEffect(() => {
    const savedToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedToken) {
      getAuthSession(savedToken)
        .then((res) => {
          if (res && res.authenticated) {
            setSessionToken(savedToken);
            setWallet(res.wallet_address);
            setUserRole(res.role || 'Media Owner');
          } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(WALLET_STORAGE_KEY);
            setUserRole('Public User');
          }
        })
        .catch(() => {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem(WALLET_STORAGE_KEY);
          setUserRole('Public User');
        });
    }

    if (checkMetaMaskInstalled() && window.ethereum?.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          handleDisconnectWallet();
        } else if (wallet && accounts[0].toLowerCase() !== wallet.toLowerCase()) {
          handleDisconnectWallet();
        }
      });
    }
  }, []);

  const handleConnectWallet = async () => {
    setIsAuthenticating(true);
    try {
      const connection = await connectWallet();
      const walletAddress = connection.account;
      const nonceRes = await getAuthNonce(walletAddress);
      const signature = await signNonceMessage(nonceRes.message);
      const authRes = await verifyAuthSignature(walletAddress, signature, nonceRes.message);

      if (authRes && authRes.authenticated) {
        setWallet(authRes.wallet_address);
        setUserRole(authRes.role || 'Media Owner');
        setSessionToken(authRes.session_token);
        localStorage.setItem(SESSION_STORAGE_KEY, authRes.session_token);
        localStorage.setItem(WALLET_STORAGE_KEY, authRes.wallet_address);
      } else {
        throw new Error('Signature authentication failed.');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'MetaMask signature authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectWallet = async () => {
    if (sessionToken) {
      try {
        await logoutAuthSession(sessionToken);
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setWallet(null);
    setUserRole('Public User');
    setSessionToken(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(WALLET_STORAGE_KEY);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
        
        {/* Interactive Neural Constellation & Particle Background */}
        <CyberCanvas />

        {/* Ambient Pulsing Glow Orbs */}
        <div className="fixed top-0 left-1/4 w-[36rem] h-[36rem] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse-glow" />
        <div className="fixed bottom-10 right-1/4 w-[36rem] h-[36rem] bg-purple-600/10 rounded-full blur-[130px] pointer-events-none z-0 animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="fixed top-1/2 right-10 w-[24rem] h-[24rem] bg-pink-500/05 rounded-full blur-[100px] pointer-events-none z-0" />

        <Navbar
          wallet={wallet}
          userRole={userRole}
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnectWallet}
          isAuthenticating={isAuthenticating}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <Routes>
            <Route
              path="/"
              element={<UploadPage wallet={wallet} onConnectWallet={handleConnectWallet} />}
            />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AIAnalyticsDashboard />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/history" element={<HistoryPage wallet={wallet} />} />
          </Routes>
        </main>

        {/* Ultra-Futuristic Cyber HUD Footer */}
        <footer className="border-t border-cyan-500/20 py-10 relative z-10 bg-[#020617]/90 backdrop-blur-2xl text-xs font-mono text-slate-400">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Brand Col */}
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2.5">
                  <span className="font-black text-lg font-orbitron tracking-wider text-glow-cyan text-cyan-400">AUTHENTIX</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold tracking-widest uppercase">
                    PROTOCOL v2.0
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] max-w-md">
                  Decentralized DeepFake Neural Detection &amp; Zero-Knowledge Smart Contract Registry
                </p>
              </div>

              {/* Quick Link Navigation */}
              <div className="flex flex-wrap justify-center gap-6 text-[11px] font-semibold tracking-wider">
                <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <span className="text-cyan-500/60">//</span>
                  <span>Detect &amp; Register</span>
                </Link>
                <Link to="/verify" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <span className="text-cyan-500/60">//</span>
                  <span>Verify On-Chain</span>
                </Link>
                <Link to="/dashboard" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <span className="text-cyan-500/60">//</span>
                  <span>Blockchain Terminal</span>
                </Link>
                <Link to="/analytics" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <span className="text-cyan-500/60">//</span>
                  <span>AI Telemetry</span>
                </Link>
                <Link to="/history" className="hover:text-cyan-400 transition-colors flex items-center space-x-1">
                  <span className="text-cyan-500/60">//</span>
                  <span>Audit Ledger</span>
                </Link>
              </div>

              {/* Status Badges */}
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-[11px] text-emerald-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Hardhat Node (8545)</span>
                </span>
                <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-[11px] text-cyan-300 shadow-sm">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EIP-191 Auth</span>
                </span>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-500/70" />
                <span>Authentix &copy; {new Date().getFullYear()} — EfficientNetB4 Neural Net &bull; Ethereum Smart Contract Registry</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-cyan-500/80">Contract: 0x5FbDB...80aa3</span>
                <span className="text-purple-400/80">FastAPI: Port 8000</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
}

