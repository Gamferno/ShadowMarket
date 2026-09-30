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
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="relative font-sans">
      {wallet.isConnected ? (
        <div className="flex items-center gap-2 bg-[#13151A] border border-[#252832] hover:border-[#373B45] rounded-lg p-1 pr-2 shadow-sm transition-colors">
          {/* Prover Status Light */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A0B0D] text-[11px] font-sans"
            title="ZK Proof Engine status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                wallet.proofServerOk ? 'bg-[#F59E0B] animate-pulse' : 'bg-[#78350F]'
              }`}
            />
            <span className="text-[#94A3B8] hidden sm:inline">
              {wallet.proofServerOk ? 'Prover Active' : 'Proof Engine'}
            </span>
          </div>

          {/* User Address with Copy button */}
          {wallet.userAddress && (
            <button
              onClick={copyAddress}
              className="text-xs font-semibold tabular-nums text-white hover:text-[#FBBF24] transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1C1E26] cursor-pointer"
              title="Click to copy address"
            >
              <span>{truncate(wallet.userAddress)}</span>
              <span className="text-[10px] text-[#94A3B8]">{copied ? '✓' : '⧉'}</span>
            </button>
          )}

          {/* Wallet Type Badge */}
          <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-[#1C1E26] text-[#FBBF24] font-semibold uppercase hidden md:inline">
            {wallet.connectedWallet || '1AM'}
          </span>

          {/* Disconnect Button */}
          <button
            onClick={wallet.disconnect}
            className="text-[#94A3B8] hover:text-[#F43F5E] p-1 rounded hover:bg-[#1C1E26] transition-colors cursor-pointer text-xs"
            title="Disconnect wallet"
          >
            ✕
          </button>
        </div>
      ) : (
        <div>
          {/* Amber Primary CTA */}
          <button
            onClick={() => setShowModal(true)}
            disabled={wallet.isConnecting}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] active:scale-[0.98] text-[#0A0B0D] text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {wallet.isConnecting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#0A0B0D] border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                <span>Connect Wallet</span>
              </>
            )}
          </button>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#13151A] border border-[#252832] w-full max-w-sm rounded-xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#252832] pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base">Connect Midnight Wallet</h3>
                    <div className="text-[11px] text-[#94A3B8]">Select DApp Connector Interface</div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-[#94A3B8] hover:text-white cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Connect your Midnight wallet to generate client-side zero-knowledge proofs and trade shielded binary predictions.
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
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0A0B0D] hover:bg-[#1C1E26] border border-[#252832] hover:border-[#F59E0B] transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#13151A] border border-[#252832] flex items-center justify-center font-bold text-[#F59E0B] text-xs">
                        1AM
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#F59E0B]">
                          1am Wallet
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          {wallet.has1am ? 'Detected in browser' : 'Midnight Web Wallet'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[#94A3B8] group-hover:text-[#F59E0B] text-sm">→</span>
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
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0A0B0D] hover:bg-[#1C1E26] border border-[#252832] hover:border-[#F59E0B] transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#13151A] border border-[#252832] flex items-center justify-center font-bold text-[#FBBF24] text-xs">
                        LACE
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#FBBF24]">
                          Midnight Lace
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          {wallet.hasLace ? 'Detected in browser' : 'Browser extension'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[#94A3B8] group-hover:text-[#FBBF24] text-sm">→</span>
                  </button>
                </div>

                {wallet.error && (
                  <div className="p-2.5 rounded bg-rose-950/60 border border-rose-900 text-rose-300 text-xs">
                    {wallet.error}
                  </div>
                )}

                <div className="pt-2 text-xs text-[#64748B] text-center font-sans">
                  Network: <span className="text-white font-medium">Midnight Preprod</span>
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
