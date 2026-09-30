import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { getAllMarkets } from '../utils/markets.ts';
import { executeCloseMarket, executeResolveMarket, type MarketPublicData } from '../utils/contract.ts';
import { formatDust, truncateAddress } from '../utils/formatters.ts';
import { MarketState, Outcome } from '../types/index.ts';

interface AdminPageProps {
  wallet: MidnightWalletState;
}

const LIVE_CONTRACT_ADDRESS = '02008779956d758933ba17f09328fa8bfcb9a9d28227b610c144f83ee07ff49c6efc';

export const AdminPage: React.FC<AdminPageProps> = ({ wallet }) => {
  const [dataVersion, setDataVersion] = useState(0);
  const [activeActionMarketId, setActiveActionMarketId] = useState<string | null>(null);
  const [actionProgressStage, setActionProgressStage] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal confirmation for irreversible resolution
  const [pendingResolution, setPendingResolution] = useState<{
    market: MarketPublicData;
    outcome: Outcome;
    outcomeLabel: string;
  } | null>(null);

  const [filterState, setFilterState] = useState<'All' | 'Open' | 'Closed' | 'Resolved'>('All');

  const refreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const markets = useMemo(() => {
    return getAllMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const filteredMarkets = markets.filter((m) => {
    if (filterState === 'All') return true;
    if (filterState === 'Open') return m.state === MarketState.Open;
    if (filterState === 'Closed') return m.state === MarketState.Closed;
    if (filterState === 'Resolved') return m.state === MarketState.Resolved;
    return true;
  });

  const handleCloseMarket = async (market: MarketPublicData) => {
    if (!wallet.isConnected) {
      wallet.connect('1am');
      return;
    }

    setActiveActionMarketId(market.id);
    setActionSuccess(null);
    setActionError(null);
    setActionProgressStage('Closing bidding on Midnight Preprod...');

    try {
      const providers = await wallet.getProviders();
      const result = await executeCloseMarket(providers, {
        marketId: BigInt(market.id),
        userSecret: wallet.walletSecret || undefined,
        onProgress: (stage) => setActionProgressStage(stage)
      });

      setActionSuccess(`Bidding successfully closed for Market #${market.id}. Tx: ${truncateAddress(result.txHash, 8, 6)}`);
      refreshData();
    } catch (err: any) {
      console.error('Close market error:', err);
      setActionError(err.message || 'Failed to close bidding on Midnight Preprod.');
    } finally {
      setActiveActionMarketId(null);
    }
  };

  const handleConfirmResolve = async () => {
    if (!pendingResolution || !wallet.isConnected) return;

    const { market, outcome, outcomeLabel } = pendingResolution;
    setPendingResolution(null);
    setActiveActionMarketId(market.id);
    setActionSuccess(null);
    setActionError(null);
    setActionProgressStage(`Generating Jubjub Schnorr Oracle attestation & verifying in ZK circuit for ${outcomeLabel}...`);

    try {
      const providers = await wallet.getProviders();
      const result = await executeResolveMarket(providers, {
        marketId: BigInt(market.id),
        winningOutcome: outcome,
        userSecret: wallet.walletSecret || undefined,
        onProgress: (stage) => setActionProgressStage(stage)
      });

      setActionSuccess(
        `Market #${market.id} resolved to ${outcomeLabel} with verified Oracle Attestation! Payout claims are now enabled. Tx: ${truncateAddress(result.txHash, 8, 6)}`
      );
      refreshData();
    } catch (err: any) {
      console.error('Resolve market error:', err);
      setActionError(err.message || 'Failed to resolve market on Midnight Preprod.');
    } finally {
      setActiveActionMarketId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252832] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#13151A] border border-[#252832] text-[11px] text-[#FBBF24] font-medium">
              <span>⚡</span>
              <span>Attestation Authority</span>
            </span>
            <span className="text-xs text-[#64748B]">•</span>
            <span className="text-xs text-[#94A3B8]">Midnight Preprod Settlement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Oracle Settlement &amp; Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Cryptographic resolution console. The authenticated oracle or market creator signs and settles prediction outcomes on Midnight Preprod via Zero-Knowledge proof attestation.
          </p>
        </div>

        {/* Contract & Network Badge */}
        <div className="p-4 bg-[#13151A] rounded-xl border border-[#252832] text-xs space-y-1.5">
          <div className="flex items-center justify-between gap-4 text-[#94A3B8]">
            <span>Contract:</span>
            <span className="text-white tabular-nums font-medium">
              {truncateAddress(LIVE_CONTRACT_ADDRESS, 8, 6)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#94A3B8]">
            <span>Role:</span>
            <span className="text-[#F59E0B] font-semibold">Authenticated Resolver</span>
          </div>
        </div>
      </div>

      {/* Disconnected Warning */}
      {!wallet.isConnected && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#13151A] border border-[#F59E0B]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold text-white text-sm">Wallet Connection Required</div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                Connect a Midnight wallet holding creator or oracle authority to submit on-chain resolution transactions.
              </div>
            </div>
          </div>
          <button
            onClick={() => wallet.connect('1am')}
            className="px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow cursor-pointer active:scale-[0.98]"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#FBBF24] text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-[#94A3B8] hover:text-white font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#FCA5A5] text-xs flex items-center justify-between gap-4">
          <div>⚠️ {actionError}</div>
          <button onClick={() => setActionError(null)} className="text-[#94A3B8] hover:text-white font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* State Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#252832] pb-3">
        {(['All', 'Open', 'Closed', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterState(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterState === tab
                ? 'bg-[#1C1E26] text-white border border-[#252832]'
                : 'text-[#94A3B8] hover:text-white hover:bg-[#1C1E26]'
            }`}
          >
            {tab} ({tab === 'All' ? markets.length : markets.filter((m) => {
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
          <div className="py-16 text-center rounded-2xl bg-[#13151A] border border-[#252832] space-y-2">
            <div className="text-2xl">📭</div>
            <h3 className="text-sm font-bold text-white">No markets matching &quot;{filterState}&quot; filter</h3>
            <p className="text-xs text-[#94A3B8]">Markets will appear here when their lifecycle reaches this stage.</p>
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const isProcessing = activeActionMarketId === market.id;
            const yesPercent = 50;
            const noPercent = 50;

            return (
              <div
                key={market.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#13151A] border border-[#252832] hover:border-[#373B45] transition-all space-y-4 shadow-lg"
              >
                {/* Top Info Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1C1E26] text-[#FBBF24] tabular-nums font-bold">
                        #{market.id}
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1C1E26] text-[#94A3B8] font-medium">
                        {market.category}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                          market.state === MarketState.Open
                            ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30'
                            : market.state === MarketState.Closed
                            ? 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30'
                            : 'bg-[#1C1E26] text-[#94A3B8] border-[#252832]'
                        }`}
                      >
                        {market.state === MarketState.Open ? 'Open' : market.state === MarketState.Closed ? 'Closed' : 'Resolved'}
                      </span>
                      {market.state === MarketState.Resolved && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1C1E26] font-semibold text-white border border-[#252832]">
                          Outcome: {market.outcome === Outcome.Yes ? 'YES' : market.outcome === Outcome.No ? 'NO' : 'Inconclusive'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">
                      <Link to={`/markets/${market.id}`} className="hover:text-[#F59E0B] transition-colors">
                        {market.question}
                      </Link>
                    </h3>

                    <div className="text-xs text-[#94A3B8] flex items-center gap-1.5">
                      <span>Oracle Source:</span>
                      <span className="text-white italic">{market.resolutionSource}</span>
                    </div>
                  </div>

                  {/* Volume & Odds Summary (Blue & Red) */}
                  <div className="bg-[#0A0B0D] p-3.5 rounded-xl border border-[#252832] text-right min-w-[180px] space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>Volume:</span>
                      <span className="text-white font-bold tabular-nums">{formatDust(market.totalVolume)} tDUST</span>
                    </div>
                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>YES Price:</span>
                      <span className="text-[#0EA5E9] font-bold tabular-nums">{yesPercent}¢</span>
                    </div>
                    <div className="flex justify-between items-center text-[#94A3B8]">
                      <span>NO Price:</span>
                      <span className="text-[#F43F5E] font-bold tabular-nums">{noPercent}¢</span>
                    </div>
                  </div>
                </div>

                {/* In-Flight Status for this Market */}
                {isProcessing && (
                  <div className="p-3 bg-[#1C1E26] border border-[#F59E0B]/40 rounded-xl text-xs space-y-1.5 animate-pulse">
                    <div className="flex items-center gap-2 text-[#F59E0B] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                      <span>{actionProgressStage}</span>
                    </div>
                  </div>
                )}

                {/* Admin Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#252832]">
                  <div className="text-xs text-[#94A3B8]">
                    {market.state === MarketState.Open && 'Market is open for confidential participant orders.'}
                    {market.state === MarketState.Closed && 'Bidding closed. Ready for final cryptographic outcome attestation.'}
                    {market.state === MarketState.Resolved && 'Market settled. Eligible participants can claim payouts in ZK.'}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Close Bidding Button */}
                    {market.state === MarketState.Open && (
                      <button
                        onClick={() => handleCloseMarket(market)}
                        disabled={isProcessing || !wallet.isConnected}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1C1E26] hover:bg-[#252832] text-[#FBBF24] border border-[#F59E0B]/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        Close Bidding
                      </button>
                    )}

                    {/* Resolution Buttons (Only if Open or Closed - Blue & Red outcomes) */}
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
                          className="px-3.5 py-1.5 rounded-lg bg-[#0EA5E9]/15 hover:bg-[#0EA5E9]/25 text-[#0EA5E9] border border-[#0EA5E9]/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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
                          className="px-3.5 py-1.5 rounded-lg bg-[#F43F5E]/15 hover:bg-[#F43F5E]/25 text-[#F43F5E] border border-[#F43F5E]/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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
                          className="px-3 py-1.5 rounded-lg bg-[#1C1E26] hover:bg-[#252832] text-[#94A3B8] hover:text-white text-xs font-medium transition-all disabled:opacity-50 cursor-pointer"
                        >
                          Refund
                        </button>
                      </div>
                    )}

                    {/* View Details Link */}
                    <Link
                      to={`/markets/${market.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1C1E26] hover:bg-[#252832] border border-[#252832] text-[#94A3B8] hover:text-white text-xs font-medium transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full bg-[#13151A] rounded-2xl border border-[#252832] p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-white font-bold text-lg">
              <span className="text-xl">⚖️</span>
              <span>Confirm On-Chain Resolution</span>
            </div>

            <div className="space-y-3 text-xs text-[#94A3B8]">
              <p>
                You are about to cryptographically resolve <strong className="text-white">Market #{pendingResolution.market.id}</strong> on
                Midnight Preprod:
              </p>
              <div className="p-4 bg-[#0A0B0D] rounded-xl border border-[#252832] space-y-2">
                <div className="text-white font-semibold text-sm">{pendingResolution.market.question}</div>
                <div className="flex justify-between items-center pt-1 border-t border-[#252832]">
                  <span className="text-[#94A3B8]">Winning Outcome:</span>
                  <span className="text-[#FBBF24] font-bold text-sm">{pendingResolution.outcomeLabel}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B] pt-1 border-t border-[#252832]">
                  <span>Oracle Attestation:</span>
                  <span className="text-[#0EA5E9] font-medium">Jubjub Schnorr Signature (Curve Point: (0, 1))</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#F43F5E]/10 border border-[#F43F5E]/30 rounded-xl text-[#FCA5A5] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>Irreversible Action</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  Once broadcast to the blockchain, this resolution is permanent. Winning participants will immediately be
                  able to withdraw proportional payouts via private Zero-Knowledge proofs.
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleConfirmResolve}
                className="flex-1 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase tracking-wider transition-all shadow cursor-pointer active:scale-[0.98]"
              >
                Confirm &amp; Broadcast to Preprod
              </button>
              <button
                onClick={() => setPendingResolution(null)}
                className="px-4 py-2.5 rounded-xl bg-[#1C1E26] hover:bg-[#252832] text-[#94A3B8] hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-[#252832]"
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

export default AdminPage;
