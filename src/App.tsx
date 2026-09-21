import React, { useState, useEffect, useCallback } from 'react';
import { useMidnight } from './hooks/useMidnight.ts';
import Layout from './components/Layout.tsx';
import OddsDisplay from './components/OddsDisplay.tsx';
import BetPlacement from './components/BetPlacement.tsx';
import {
  fetchMarketPublicState,
  INITIAL_SEEDED_MARKET,
  LIVE_CONTRACT_ADDRESS,
  type MarketPublicData,
  type BetTransactionResult
} from './utils/contract.ts';
import { loadReceipts } from './utils/storage.ts';
import type { ShieldedBetReceipt } from './types/index.ts';
import preprodConfig from './config/preprod-deployment.json';

export const App: React.FC = () => {
  const wallet = useMidnight();
  const [market, setMarket] = useState<MarketPublicData>(INITIAL_SEEDED_MARKET);
  const [receipts, setReceipts] = useState<ShieldedBetReceipt[]>([]);
  const [showDeployerModal, setShowDeployerModal] = useState<boolean>(false);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);

  // Load market state and bet receipts
  const refreshData = useCallback(async () => {
    try {
      const publicState = await fetchMarketPublicState();
      setMarket(publicState);
    } catch (err) {
      console.warn('Could not refresh public market state:', err);
    }

    try {
      const loaded = Array.from(loadReceipts().values()).reverse();
      setReceipts(loaded);
    } catch (err) {
      console.warn('Could not load bet receipts:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleBetPlaced = (_result: BetTransactionResult) => {
    refreshData();
  };

  const copyContractAddress = () => {
    navigator.clipboard.writeText(LIVE_CONTRACT_ADDRESS);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const formatTimestamp = (ts: bigint | number) => {
    try {
      const ms = typeof ts === 'bigint' ? Number(ts) * 1000 : ts * 1000;
      return new Date(ms).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Dec 31, 2026';
    }
  };

  return (
    <Layout wallet={wallet}>
      <div className="space-y-8 animate-fadeIn">
        {/* Top Notification / Contract Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-slate-300">
              <span className="font-semibold text-slate-200">Live on Midnight Preprod: </span>
              <span className="font-mono text-cyan-400 select-all cursor-pointer" onClick={copyContractAddress}>
                {LIVE_CONTRACT_ADDRESS.slice(0, 10)}...{LIVE_CONTRACT_ADDRESS.slice(-8)}
              </span>
              <button
                onClick={copyContractAddress}
                className="ml-1.5 text-[11px] text-slate-500 hover:text-cyan-400 cursor-pointer"
                title="Copy full contract address"
              >
                {copiedContract ? '✓ Copied' : '⧉'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={preprodConfig.explorerContractUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Midnight Explorer</span>
              <span>↗</span>
            </a>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setShowDeployerModal(true)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Deployer Console
            </button>
          </div>
        </div>

        {/* Market Header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-semibold rounded-full">
              {market.category}
            </span>
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open for Betting
            </span>
            <span className="px-3 py-1 bg-slate-950 text-slate-400 border border-slate-800 text-xs font-mono rounded-full">
              Market #1
            </span>
          </div>

          {/* Question */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            {market.question}
          </h1>

          {/* Metadata row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <div className="text-slate-500 text-[11px] mb-0.5">Resolution Source</div>
              <div className="text-slate-200 font-medium truncate" title={market.resolutionSource}>
                {market.resolutionSource}
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[11px] mb-0.5">Estimated Close Date</div>
              <div className="text-slate-200 font-mono">
                {formatTimestamp(market.closeTimestamp)}
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[11px] mb-0.5">Privacy Guarantees</div>
              <div className="text-cyan-400 font-medium flex items-center gap-1">
                <span>🔒 Shielded Stakes &amp; Side Choice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Grid: Odds + Positions (Left) vs Bet Placement (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 cols): Odds Display + Privacy Explainer + User Positions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Aggregate Odds */}
            <OddsDisplay market={market} />

            {/* Privacy Architecture Explainer Card */}
            <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>🛡️</span>
                <span>The ShadowMarket Zero-Knowledge Privacy Model</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400">1. Private Position</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Your choice (YES or NO) and bet amount are kept in local storage and never disclosed on-chain.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-purple-400">2. Local Prover</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Your local Docker proof server (<code className="text-slate-300">port 6300</code>) creates a PLONK proof of solvency.
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-emerald-400">3. Verified Tally</div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Only aggregate market odds update. No one can front-run your trade or deanonymize your wallet.
                  </p>
                </div>
              </div>
            </div>

            {/* Bettor's Shielded Positions History (Client-Side) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-200">Your Shielded Positions</h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400">
                    {receipts.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">Stored privately in your browser</span>
              </div>

              {receipts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  <div className="text-2xl mb-1">🎫</div>
                  <div>No shielded positions placed yet.</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Use the bet panel to place your first zero-knowledge prediction.
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {receipts.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs font-mono ${
                            r.isYes
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {r.isYes ? 'YES' : 'NO'}
                        </span>
                        <div>
                          <div className="font-mono text-slate-200 font-bold">
                            {r.amount.toString()} units
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            Commitment: {r.commitmentHex.slice(0, 12)}...{r.commitmentHex.slice(-8)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-900 px-2 py-0.5 rounded-full">
                          Shielded / Unclaimed
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Interactive Bet Placement Panel */}
          <div className="lg:col-span-5 sticky top-24">
            <BetPlacement market={market} wallet={wallet} onBetPlaced={handleBetPlaced} />
          </div>
        </div>

        {/* Deployer Modal (for inspection / maintenance) */}
        {showDeployerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-base">Contract Deployment Information</h3>
                <button
                  onClick={() => setShowDeployerModal(false)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 mb-1">Contract Address:</div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-cyan-300 break-all select-all">
                    {preprodConfig.contractAddress}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Deployment Transaction:</div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-slate-300 break-all select-all">
                    {preprodConfig.txHash}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="text-slate-500">Block Height</div>
                    <div className="font-mono text-slate-200 font-bold">{preprodConfig.deployedAtBlock}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="text-slate-500">Target Network</div>
                    <div className="font-mono text-slate-200 font-bold">{preprodConfig.networkId}</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Deployer 1am Address:</div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-slate-400 break-all select-all">
                    {preprodConfig.deployerAddress}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowDeployerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

