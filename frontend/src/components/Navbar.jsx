import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Upload,
  Search,
  LayoutDashboard,
  Brain,
  History,
  Menu,
  X,
  Radio,
  Terminal
} from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Navbar({
  wallet,
  userRole = 'Public User',
  onConnect,
  onDisconnect,
  isAuthenticating,
  theme = 'dark',
  onToggleTheme,
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Detect' },
    { path: '/dashboard', label: 'Explorer' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/verify', label: 'Verify' },
    { path: '/history', label: 'Audit' },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-primary/20 shadow-[0_0_20px_rgba(0,219,233,0.1)] transition-all duration-300">
      
      {/* Top telemetry ticker */}
      <div className="hidden sm:flex items-center justify-between px-panel-padding py-1 bg-surface-container-lowest border-b border-primary/10 text-[11px] font-code-md text-outline">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed shadow-[0_0_8px_#6ffbbe] animate-pulse" />
            <span className="text-outline">Engine:</span>
            <span className="text-tertiary-fixed font-bold">EfficientNet-B4 (96.4% ACC)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-fixed shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <span className="text-outline">RPC Node:</span>
            <span className="text-primary-fixed font-bold">127.0.0.1:8545 Active</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_#e5b5ff] animate-pulse" />
            <span className="text-outline">Ledger:</span>
            <span className="text-secondary-fixed font-bold">Contract v1.0.0</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-primary-fixed/80">
          <Terminal className="w-3.5 h-3.5 text-primary-fixed" />
          <span className="font-label-caps tracking-widest text-[10px]">AUTHENTIX PROVENANCE PROTOCOL</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-panel-padding">
        <div className="flex items-center justify-between h-16">

          {/* Brand Logo (Stitch Cyber HUD style) */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMobile}>
            <span className="font-display-lg text-headline-md tracking-tighter text-primary-fixed drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] uppercase">
              AUTHENTIX
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-label-caps text-xs uppercase px-2 py-1 transition-all duration-200 ${
                    isActive
                      ? 'text-primary-fixed border-b-2 border-primary-fixed pb-1 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'text-on-surface-variant hover:text-primary-fixed-dim hover:bg-primary/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Web3 Wallet Connect */}
          <div className="flex items-center gap-3">
            <WalletConnect
              wallet={wallet}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              isAuthenticating={isAuthenticating}
            />

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-primary-fixed hover:bg-primary/10 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-primary/20 bg-surface-container-lowest/98 px-panel-padding py-4 space-y-2 animate-slideDown">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobile}
                className={`block px-4 py-2 text-xs font-label-caps uppercase transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary-fixed border-l-2 border-primary-fixed'
                    : 'text-on-surface-variant hover:text-primary-fixed'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
