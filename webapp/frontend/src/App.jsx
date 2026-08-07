import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import AIAnalyticsDashboard from './pages/AIAnalyticsDashboard';
import UploadPage from './pages/UploadPage';
import VerifyPage from './pages/VerifyPage';
import HistoryPage from './pages/HistoryPage';
import { connectWallet, checkMetaMaskInstalled, signNonceMessage } from './utils/wallet';
import { getAuthNonce, verifyAuthSignature, getAuthSession, logoutAuthSession } from './utils/api';

import NeuralBackgroundCanvas from './components/NeuralBackgroundCanvas';

const SESSION_STORAGE_KEY = 'authentix_session_token';
const WALLET_STORAGE_KEY = 'authentix_wallet_address';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [userRole, setUserRole] = useState('Public User');
  const [sessionToken, setSessionToken] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
            // Token expired or invalid
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

    // Handle MetaMask account changes
    if (checkMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          handleDisconnectWallet();
        } else if (wallet && accounts[0].lower() !== wallet.lower()) {
          // Account switched — prompt signature re-auth
          handleDisconnectWallet();
        }
      });
    }
  }, []);

  // Connect MetaMask + EIP-191 Signature Authentication Flow
  const handleConnectWallet = async () => {
    setIsAuthenticating(true);
    try {
      // 1. Connect MetaMask wallet
      const connection = await connectWallet();
      const walletAddress = connection.account;

      // 2. Fetch challenge nonce from backend
      const nonceRes = await getAuthNonce(walletAddress);

      // 3. Prompt user to sign nonce message via MetaMask
      const signature = await signNonceMessage(nonceRes.message);

      // 4. Verify signature on backend & obtain session token
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

  // Disconnect Wallet Session
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
      <div className="min-h-screen flex flex-col relative selection:bg-cyan-500 selection:text-black bg-black text-gray-100">
        
        {/* Interactive Neural & Cryptographic Constellation Canvas Background */}
        <NeuralBackgroundCanvas />

        <Navbar
          wallet={wallet}
          userRole={userRole}
          onConnect={handleConnectWallet}
          onDisconnect={handleDisconnectWallet}
          isAuthenticating={isAuthenticating}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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

        <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 font-mono relative z-10 bg-black/60 backdrop-blur-md">
          Authentix &copy; {new Date().getFullYear()} — EIP-191 MetaMask Signature Authentication &amp; Ethereum Blockchain Registry
        </footer>
      </div>
    </Router>
  );
}

