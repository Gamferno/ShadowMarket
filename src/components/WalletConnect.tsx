import React, { useState } from 'react';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';

interface WalletConnectProps {
  wallet: MidnightWalletState;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ wallet }) => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (wallet.userAddress) {
      navigator.clipboard.writeText(wallet.userAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncate = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
  };

  return (
    <div className="relative">
      {wallet.isConnected ? (
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-1.5 pl-3">
          {/* Proof Server Pulse */}
          <div className="flex items-center gap-1.5" title="Local Proof Server status">
            <span
              className={`w-2 h-2 rounded-full ${
                wallet.proofServerOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              {wallet.proofServerOk ? 'Prover 6300' : 'Prover Offline'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Wallet and Network Badges */}
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/80 rounded-md">
              {wallet.connectedWallet || '1am'}
            </span>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80 rounded-md">
              Preprod
            </span>
          </div>

          {/* User Address with Copy */}
          {wallet.userAddress && (
            <button
              onClick={copyAddress}
              className="text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 cursor-pointer"
              title="Click to copy full unshielded address"
            >
              <span>{truncate(wallet.userAddress)}</span>
              <span className="text-[10px] text-slate-400">{copied ? '✓' : '⧉'}</span>
            </button>
          )}

          {/* Disconnect Button */}
          <button
            onClick={wallet.disconnect}
            className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Disconnect wallet"
          >
            ✕
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowModal(true)}
            disabled={wallet.isConnecting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {wallet.isConnecting ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-base">Connect Midnight Wallet</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Select your installed Midnight wallet extension to interact with shielded prediction markets on Preprod.
                </p>

                <div className="space-y-2.5">
                  {/* 1am Wallet */}
                  <button
                    onClick={async () => {
                      try {
                        await wallet.connect('1am');
                        setShowModal(false);
                      } catch {
                        // Error handled in hook
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center font-bold text-purple-300 text-xs">
                        1am
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-purple-300">
                          1am Wallet
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {wallet.has1am ? 'Detected in browser' : 'Recommended Midnight Wallet'}
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-purple-400 text-xs">→</span>
                  </button>

                  {/* Lace Wallet */}
                  <button
                    onClick={async () => {
                      try {
                        await wallet.connect('Lace');
                        setShowModal(false);
                      } catch {
                        // Error handled in hook
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center font-bold text-indigo-300 text-xs">
                        MN
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">
                          Midnight Lace
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {wallet.hasLace ? 'Detected in browser' : 'Browser extension'}
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-indigo-400 text-xs">→</span>
                  </button>
                </div>

                {wallet.error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-300 text-xs font-medium">
                    {wallet.error}
                  </div>
                )}

                <div className="pt-2 text-[11px] text-slate-500 text-center">
                  Target Network: <span className="text-cyan-400 font-mono">Midnight Preprod</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

