import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Upload, FileSearch, History, LayoutDashboard, Brain, Menu, X } from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Navbar({ wallet, userRole = 'Public User', onConnect, onDisconnect, isAuthenticating }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allNavLinks = [
    { path: '/', label: 'Detect & Register', icon: Upload, allowedRoles: ['Admin', 'Media Owner'] },
    { path: '/dashboard', label: 'Blockchain Dashboard', icon: LayoutDashboard, allowedRoles: ['Admin', 'Researcher'] },
    { path: '/analytics', label: 'AI Telemetry', icon: Brain, allowedRoles: ['Admin', 'Researcher'] },
    { path: '/verify', label: 'Verify Authenticity', icon: FileSearch, allowedRoles: ['Admin', 'Researcher', 'Media Owner', 'Public User'] },
    { path: '/history', label: 'Ledger History', icon: History, allowedRoles: ['Admin', 'Researcher', 'Media Owner'] },
  ];


  const visibleNavLinks = allNavLinks.filter((link) => link.allowedRoles.includes(userRole));

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-zinc-900 bg-black/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMobile}>
            <img
              src="/logo.png"
              alt="Authentix Logo"
              className="w-9 h-9 rounded-xl object-contain shadow-lg glow-emerald group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent tracking-tight">
                  AUTHENTIX
                </span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                  {userRole}
                </span>
              </div>
              <span className="block text-[10px] tracking-widest text-emerald-400/90 font-mono -mt-0.5">
                DL + BLOCKCHAIN
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (RBAC Filtered) */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>


          {/* Right: Wallet + Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            <WalletConnect
              wallet={wallet}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              isAuthenticating={isAuthenticating}
            />

            {/* Mobile hamburger button */}
            <button
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu (RBAC Filtered) */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-900 animate-slideDown">
          <nav className="flex flex-col px-4 py-3 space-y-1 glass-panel bg-black/95">

            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobile}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

    </header>
  );
}
