import React from 'react';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import WalletConnect from './WalletConnect.tsx';
import preprodConfig from '../config/preprod-deployment.json';

interface LayoutProps {
  children?: React.ReactNode;
  wallet: MidnightWalletState;
}

export const Layout: React.FC<LayoutProps> = ({ children, wallet }) => {
  return (
    <div className="min-h-screen bg-[#06070c] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Navbar */}
      <header className="sticky top-0 z-40 bg-[#06070c]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Network Tag */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-cyan-500/20">
              SM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  ShadowMarket
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Preprod
                </span>
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">
                Shielded Prediction Markets on Midnight
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <span className="text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer">
              Markets
            </span>
            <span className="hover:text-cyan-400 transition-colors cursor-pointer">
              Create Market
            </span>
            <span className="hover:text-cyan-400 transition-colors cursor-pointer">
              My Bets
            </span>
            <span className="hover:text-cyan-400 transition-colors cursor-pointer">
              About
            </span>
          </nav>

          {/* Right Header Area: Proof server pulse & Wallet Connect */}
          <div className="flex items-center gap-3">
            <WalletConnect wallet={wallet} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 px-4 sm:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 font-medium text-slate-400">
              <span>ShadowMarket</span>
              <span>•</span>
              <span className="text-cyan-400">Zero-Knowledge Prediction Protocol</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Live on Midnight Preprod Contract: <a
                href={preprodConfig.explorerContractUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-cyan-500 hover:underline"
              >
                {preprodConfig.contractAddress.slice(0, 10)}...{preprodConfig.contractAddress.slice(-8)}
              </a>
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a
              href="https://explorer.preprod.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Midnight Explorer
            </a>
            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Midnight Docs
            </a>
            <span className="font-mono text-slate-600">v1.0.0-preprod</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

