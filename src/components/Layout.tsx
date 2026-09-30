import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import WalletConnect from './WalletConnect.tsx';
import Logo from './Logo.tsx';
import preprodConfig from '../config/preprod-deployment.json';
import { loadReceipts } from '../utils/storage.ts';
import { formatDust } from '../utils/formatters.ts';

interface LayoutProps {
  children?: React.ReactNode;
  wallet: MidnightWalletState;
}

export const Layout: React.FC<LayoutProps> = ({ children, wallet }) => {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');

  // Calculate quick portfolio balance from stored receipts
  const receipts = Array.from(loadReceipts().values());
  const totalWagered = receipts.reduce((acc, r) => acc + r.amount, 0n);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/markets?q=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F8FAFC] font-sans flex flex-col justify-between selection:bg-[#F59E0B] selection:text-black">
      {/* 1. Sticky Top App Bar */}
      <header className="sticky top-0 z-50 bg-[#0A0B0D]/95 backdrop-blur-md border-b border-[#252832]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Search cluster */}
          <div className="flex items-center gap-6 flex-1 max-w-xl">
            {/* Brand Logo Anchor */}
            <Link to="/" className="group shrink-0 hover:opacity-95 transition-opacity">
              <Logo size="md" />
            </Link>

            {/* Central Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search markets, assets, or outcomes..."
                className="w-full pl-9 pr-14 py-1.5 bg-[#13151A] border border-[#252832] hover:border-[#373B45] focus:border-[#F59E0B] rounded-lg text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold bg-[#1C1E26] border border-[#252832] rounded text-[#94A3B8]">
                  ⌘K
                </kbd>
              </div>
            </form>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
            <NavLink
              to="/markets"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive
                    ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`
              }
            >
              Markets
            </NavLink>

            <NavLink
              to="/portfolio"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive
                    ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`
              }
            >
              Portfolio
            </NavLink>

            <NavLink
              to="/create"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive
                    ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`
              }
            >
              + Create
            </NavLink>

            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive
                    ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`
              }
            >
              Oracle Resolver
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive
                    ? 'text-[#F59E0B] border-b-2 border-[#F59E0B] font-bold'
                    : 'text-[#94A3B8] hover:text-white'
                }`
              }
            >
              How it works
            </NavLink>
          </nav>

          {/* Right Header Utilities: Network, Portfolio Value & Wallet */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Network Indicator Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#13151A] border border-[#252832] text-xs text-[#94A3B8]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white font-medium">Preprod Live</span>
            </div>

            {/* Quick Portfolio Balance Pill */}
            <Link
              to="/portfolio"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#13151A] hover:bg-[#1C1E26] hover:border-[#3E4456] border border-[#252832] transition-all text-xs"
              title="Your Portfolio Value"
            >
              <span className="text-[#94A3B8]">Vault:</span>
              <span className="font-bold text-white tabular-nums">
                {formatDust(totalWagered)} tDUST
              </span>
            </Link>

            {/* Wallet Connect Button */}
            <WalletConnect wallet={wallet} />
          </div>
        </div>
      </header>

      {/* 2. Main Application Canvas */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* 3. Modern Institutional Footer */}
      <footer className="border-t border-[#252832] bg-[#0A0B0D] text-xs text-[#94A3B8] mt-12 py-8 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Logo size="sm" showWordmark={true} />
              <span className="text-[#252832]">|</span>
              <span className="text-[#94A3B8] text-xs">Confidential Prediction Exchange</span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Institutional prediction protocol with client-side private settlement and deterministic odds resolution.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 text-xs text-[#94A3B8]">
            <Link to="/markets" className="hover:text-white transition-colors">
              Markets
            </Link>
            <Link to="/portfolio" className="hover:text-white transition-colors">
              Portfolio
            </Link>
            <Link to="/create" className="hover:text-white transition-colors">
              Create Market
            </Link>
            <Link to="/admin" className="hover:text-white transition-colors">
              Oracle Resolver
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              Protocol Specs
            </Link>
            <a
              href={preprodConfig.explorerContractUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#F59E0B] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Explorer</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
