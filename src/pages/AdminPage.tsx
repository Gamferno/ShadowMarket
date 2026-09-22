import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { getAllMarkets } from '../utils/markets.ts';
import {
  executeCloseMarket,
  executeResolveMarket,
  type MarketPublicData,
  LIVE_CONTRACT_ADDRESS
} from '../utils/contract.ts';
import { MarketState, Outcome } from '../types/index.ts';
import { formatDust, truncateAddress } from '../utils/formatters.ts';

interface AdminPageProps {
  wallet: MidnightWalletState;
}

export const AdminPage: React.FC<AdminPageProps> = ({ wallet }) => {
  const [markets, setMarkets] = useState<MarketPublicData[]>([]);
  const [filterState, setFilterState] = useState<'All' | 'Open' | 'Closed' | 'Resolved'>('All');

  // Confirmation Modal state
  const [pendingResolution, setPendingResolution] = useState<{
    market: MarketPublicData;
    outcome: Outcome;
    outcomeLabel: string;
  } | null>(null);

  // In-flight progress state
  const [activeActionMarketId, setActiveActionMarketId] = useState<string | null>(null);
  const [actionProgressStage, setActionProgressStage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    const all = getAllMarkets();
    setMarkets(all);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMarkets = markets.filter((m) => {
    if (filterState === 'All') return true;
    if (filterState === 'Open') return m.state === MarketState.Open;
    if (filterState === 'Closed') return m.state === MarketState.Closed;
    if (filterState === 'Resolved') return m.state === MarketState.Resolved;
    return true;
  });

  const handleCloseMarket = async (m: MarketPublicData) => {
    if (activeActionMarketId) return;
    if (!wallet.isConnected) {
      setActionError('Please connect your Midnight wallet to close this market.');
      return;
    }

    setActiveActionMarketId(m.id);
    setActionError(null);
    setActionSuccess(null);
    setActionProgressStage('Initiating market close on Preprod...');

    try {
      const providers = await wallet.getProviders();
      await executeCloseMarket(providers, {
        marketId: BigInt(m.id),
        onProgress: (stage) => setActionProgressStage(stage)
      });

      setActionSuccess(`Market #${m.id} bidding successfully closed!`);
      loadData();
    } catch (err: any) {
      console.error('Close market error:', err);
      setActionError(err.message || `Failed to close Market #${m.id}.`);
    } finally {
      setActiveActionMarketId(null);
    }
  };

  const handleConfirmResolve = async () => {
    if (!pendingResolution || activeActionMarketId) return;
    if (!wallet.isConnected) {
      setActionError('Please connect your Midnight wallet to resolve this market.');
      setPendingResolution(null);
      return;
    }

    const { market, outcome, outcomeLabel } = pendingResolution;
    setActiveActionMarketId(market.id);
    setPendingResolution(null);
    setActionError(null);
    setActionSuccess(null);
    setActionProgressStage(`Verifying authority and generating ZK proof for ${outcomeLabel}...`);

    try {
      const providers = await wallet.getProviders();
      await executeResolveMarket(providers, {
        marketId: BigInt(market.id),
        winningOutcome: outcome,
        onProgress: (stage) => setActionProgressStage(stage)
      });

      setActionSuccess(`Market #${market.id} resolved to ${outcomeLabel}! Payouts are now claimable in ZK.`);
      loadData();
    } catch (err: any) {
      console.error('Resolve market error:', err);
      setActionError(err.message || `Failed to resolve Market #${market.id}.`);
    } finally {
      setActiveActionMarketId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              Resolver & Admin Console
            </h1>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-950 text-purple-400 border border-purple-800 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Attestation Authority</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Cryptographic resolution dashboard. The market creator or protocol admin signs and settles prediction
            outcomes on Midnight Preprod via Zero-Knowledge proof attestation.
          </p>
        </div>

        {/* Contract & Network Badge */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between gap-4 text-slate-500">
            <span>Contract Address:</span>
            <span className="text-cyan-400 font-bold">
              {truncateAddress(LIVE_CONTRACT_ADDRESS, 8, 6)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-500">
            <span>Role:</span>
            <span className="text-purple-300 font-bold">Creator / Admin</span>
          </div>
        </div>
      </div>

      {/* Disconnected Warning */}
      {!wallet.isConnected && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="text-sm font-bold text-amber-300">Wallet Connection Required</div>
              <div className="text-xs text-slate-400">
                You must connect a Midnight wallet holding creator or protocol admin authority to submit on-chain resolution transactions.
              </div>
            </div>
          </div>
          <button
            onClick={() => wallet.connect('1am')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all whitespace-nowrap"
          >
            Connect 1am Wallet
          </button>
        </div>
      )}

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-slate-200 font-bold">
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between gap-4">
          <div>⚠️ {actionError}</div>
          <button onClick={() => setActionError(null)} className="text-slate-400 hover:text-slate-200 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* State Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {(['All', 'Open', 'Closed', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterState(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterState === tab
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab} Markets ({tab === 'All' ? markets.length : markets.filter((m) => {
              if (tab === 'Open') return m.state === MarketState.Open;
              if (tab === 'Closed') return m.state === MarketState.Closed;
              if (tab === 'Resolved') return m.state === MarketState.Resolved;
              return true;
            }).length})
          </button>
        ))}
      </div>

      {/* Markets List */}
      <div className="space-y-4">
        {filteredMarkets.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-2">
            <div className="text-xl">📭</div>
            <h3 className="text-sm font-bold text-slate-300">No markets matching "{filterState}" filter</h3>
            <p className="text-xs text-slate-500">Markets will appear here when their lifecycle reaches this state.</p>
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const isProcessing = activeActionMarketId === market.id;
            const totalStake = market.totalStakeYes + market.totalStakeNo;
            const yesPercent = totalStake > 0n ? Number((market.totalStakeYes * 100n) / totalStake) : 50;
            const noPercent = 100 - yesPercent;

            return (
              <div
                key={market.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4"
              >
                {/* Top Info Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-bold">
                        Market #{market.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400">
                        {market.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                          market.state === MarketState.Open
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : market.state === MarketState.Closed
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        State: {market.state === MarketState.Open ? 'Open' : market.state === MarketState.Closed ? 'Closed' : 'Resolved'}
                      </span>
                      {market.state === MarketState.Resolved && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 font-bold text-slate-200">
                          Outcome: {market.outcome === Outcome.Yes ? 'YES' : market.outcome === Outcome.No ? 'NO' : 'Inconclusive'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      <Link to={`/markets/${market.id}`} className="hover:text-cyan-300 transition-colors">
                        {market.question}
                      </Link>
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Oracle Source:</span>
                      <span className="text-slate-400 italic">{market.resolutionSource}</span>
                    </div>
                  </div>

                  {/* Volume & Odds Summary */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-right min-w-[180px] space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Volume:</span>
                      <span className="text-slate-200 font-bold">{formatDust(market.totalVolume)} tDUST</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>YES Odds:</span>
                      <span className="text-emerald-400 font-bold">{yesPercent}%</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>NO Odds:</span>
                      <span className="text-rose-400 font-bold">{noPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* In-Flight Status for this Market */}
                {isProcessing && (
                  <div className="p-3 bg-purple-950/30 border border-purple-800 rounded-xl text-xs space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 text-purple-300 font-bold">
                      <div className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                      <span>{actionProgressStage}</span>
                    </div>
                  </div>
                )}

                {/* Admin Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                  <div className="text-xs text-slate-500">
                    {market.state === MarketState.Open && 'Market is currently open for participant bets.'}
                    {market.state === MarketState.Closed && 'Bidding closed. Ready for final cryptographic outcome attestation.'}
                    {market.state === MarketState.Resolved && 'Market permanently settled. Winners can claim payouts in ZK.'}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Close Bidding Button */}
                    {market.state === MarketState.Open && (
                      <button
                        onClick={() => handleCloseMarket(market)}
                        disabled={isProcessing || !wallet.isConnected}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        Close Bidding
                      </button>
                    )}

                    {/* Resolution Buttons (Only if Open or Closed) */}
                    {market.state !== MarketState.Resolved && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPendingResolution({
                              market,
                              outcome: Outcome.Yes,
                              outcomeLabel: 'YES'
                            })
                          }
                          disabled={isProcessing || !wallet.isConnected}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Resolve YES
                        </button>

                        <button
                          onClick={() =>
                            setPendingResolution({
                              market,
                              outcome: Outcome.No,
                              outcomeLabel: 'NO'
                            })
                          }
                          disabled={isProcessing || !wallet.isConnected}
                          className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Resolve NO
                        </button>

                        <button
                          onClick={() =>
                            setPendingResolution({
                              market,
                              outcome: Outcome.Inconclusive,
                              outcomeLabel: 'Inconclusive (Refund All)'
                            })
                          }
                          disabled={isProcessing || !wallet.isConnected}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          Refund
                        </button>
                      </div>
                    )}

                    {/* View Details Link */}
                    <Link
                      to={`/markets/${market.id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      View Market →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Irreversible Confirmation Modal */}
      {pendingResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 rounded-2xl border border-purple-500/50 p-6 space-y-5 shadow-2xl shadow-purple-950/40">
            <div className="flex items-center gap-3 text-purple-300 font-bold text-lg">
              <span className="text-2xl">⚖️</span>
              <span>Confirm On-Chain Resolution</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                You are about to cryptographically resolve <strong>Market #{pendingResolution.market.id}</strong> on
                Midnight Preprod:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-1">
                <div className="text-slate-400 font-sans font-bold">{pendingResolution.market.question}</div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Winning Outcome:</span>
                  <span className="text-purple-400 font-bold text-sm">{pendingResolution.outcomeLabel}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Irreversible Action</span>
                </div>
                <div>
                  Once broadcast to the blockchain, this resolution is permanent. Winning participants will immediately be
                  able to withdraw proportional payouts via private Zero-Knowledge proofs.
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmResolve}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 transition-all"
              >
                Confirm & Broadcast to Preprod
              </button>
              <button
                onClick={() => setPendingResolution(null)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
