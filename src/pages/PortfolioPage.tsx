import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { loadReceipts, type BetReceipt } from '../utils/storage.ts';
import { getAllMarkets } from '../utils/markets.ts';
import { executeClaimPayout, type MarketPublicData } from '../utils/contract.ts';
import { formatDust, truncateAddress } from '../utils/formatters.ts';
import { MarketState, Outcome } from '../types/index.ts';

interface PortfolioPageProps {
  wallet: MidnightWalletState;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ wallet }) => {
  const [dataVersion, setDataVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [claimingReceiptId, setClaimingReceiptId] = useState<string | null>(null);
  const [claimProgressStage, setClaimProgressStage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState<{ receiptId: string; amount: bigint; txHash: string } | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const refreshData = () => {
    setDataVersion((v) => v + 1);
  };

  // Load user receipts from encrypted local witness storage
  const receipts = useMemo(() => {
    return Array.from(loadReceipts().values()).sort((a, b) => b.timestamp - a.timestamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  // Load all markets to join status and outcomes
  const allMarkets = useMemo(() => {
    return getAllMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);

  const marketsMap = useMemo(() => {
    const map = new Map<string, MarketPublicData>();
    for (const m of allMarkets) {
      map.set(m.id, m);
    }
    return map;
  }, [allMarkets]);

  // Calculations for portfolio summary metrics
  const totalWagered = receipts.reduce((acc, r) => acc + r.amount, 0n);

  const totalClaimed = receipts
    .filter((r) => r.claimed)
    .reduce((acc, r) => acc + (r.claimedPayout || r.amount * 2n), 0n);

  const openPositions = receipts.filter((r) => {
    const market = marketsMap.get(r.marketId);
    return !market || market.state !== MarketState.Resolved;
  });

  const historyPositions = receipts.filter((r) => {
    const market = marketsMap.get(r.marketId);
    return market && market.state === MarketState.Resolved;
  });

  const activeBetsCount = openPositions.length;

  const computePotentialPayout = (r: BetReceipt, m?: MarketPublicData): bigint => {
    if (!m || m.state !== MarketState.Resolved) {
      return r.amount * 2n; // 1:1 payout on 50¢ fixed prototype odds
    }
    if (m.outcome === Outcome.Inconclusive) {
      return r.amount; // Refund exact principal
    }
    const isWinner =
      (m.outcome === Outcome.Yes && r.isYes) ||
      (m.outcome === Outcome.No && !r.isYes);
    return isWinner ? r.amount * 2n : 0n;
  };

  // Compute pending claimable sum
  const claimableWinnings = useMemo(() => {
    return historyPositions.filter((r) => {
      if (r.claimed) return false;
      const m = marketsMap.get(r.marketId);
      if (!m || m.state !== MarketState.Resolved) return false;
      return (
        (m.outcome === Outcome.Yes && r.isYes) ||
        (m.outcome === Outcome.No && !r.isYes) ||
        m.outcome === Outcome.Inconclusive
      );
    });
  }, [historyPositions, marketsMap]);

  const claimableBetsCount = claimableWinnings.length;
  const totalClaimableAmount = claimableWinnings.reduce(
    (acc, r) => acc + computePotentialPayout(r, marketsMap.get(r.marketId)),
    0n
  );

  const handleClaimPayout = async (r: BetReceipt) => {
    if (!wallet.isConnected) {
      wallet.connect('1am');
      return;
    }

    const market = marketsMap.get(r.marketId);
    const payout = computePotentialPayout(r, market);

    setClaimingReceiptId(r.id);
    setClaimSuccess(null);
    setClaimError(null);
    setClaimProgressStage('Proving private entitlement in ZK...');

    try {
      const providers = await wallet.getProviders();
      const result = await executeClaimPayout(providers, {
        marketId: BigInt(r.marketId),
        receiptId: r.id,
        payoutAmount: payout,
        userSecret: wallet.walletSecret || undefined,
        onProgress: (stage) => setClaimProgressStage(stage)
      });

      setClaimSuccess({
        receiptId: r.id,
        amount: payout,
        txHash: result.txHash
      });

      refreshData();
    } catch (err: any) {
      console.error('Claim payout failed:', err);
      setClaimError(err.message || 'Failed to claim shielded payout on Midnight Preprod.');
    } finally {
      setClaimingReceiptId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio &amp; Positions
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Client-side view of your confidential bets on Midnight Network. Receipts exist only in your browser storage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3 py-1.5 bg-[#13151A] hover:bg-[#1C1E26] border border-[#252832] rounded-lg text-xs font-medium text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            ↻ Refresh
          </button>
          <Link
            to="/markets"
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs rounded-lg transition-colors shadow-sm"
          >
            Explore Markets →
          </Link>
        </div>
      </div>

      {/* Disconnected Notice */}
      {!wallet.isConnected && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <span className="text-base">⚠️</span>
            <span>Wallet disconnected. Connect your Midnight wallet to claim your shielded winnings on Preprod.</span>
          </div>
          <button
            onClick={() => wallet.connect('1am')}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* 2. Hero Portfolio Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="bg-[#13151A] border border-[#252832] rounded-xl p-4 sm:p-5 space-y-1">
          <div className="text-xs text-[#94A3B8] font-medium">Total Shielded Stake</div>
          <div className="text-2xl font-extrabold text-white tabular-nums">
            {formatDust(totalWagered)} <span className="text-xs font-normal text-[#94A3B8]">tDUST</span>
          </div>
          <div className="text-[11px] text-[#F59E0B] font-semibold flex items-center gap-1">
            <span>●</span>
            <span>{receipts.length} Active Positions</span>
          </div>
        </div>

        {/* Active Pools */}
        <div className="bg-[#13151A] border border-[#252832] rounded-xl p-4 sm:p-5 space-y-1">
          <div className="text-xs text-[#94A3B8] font-medium">Active Positions</div>
          <div className="text-2xl font-extrabold text-[#F59E0B] tabular-nums">
            {activeBetsCount}
          </div>
          <div className="text-[11px] text-[#94A3B8]">Awaiting resolution</div>
        </div>

        {/* Claimable Winnings */}
        <div className={`bg-[#13151A] border rounded-xl p-4 sm:p-5 space-y-1 ${
          claimableBetsCount > 0 ? 'border-[#F59E0B]/50 shadow-md shadow-[#F59E0B]/10' : 'border-[#252832]'
        }`}>
          <div className="text-xs text-[#94A3B8] font-medium">Claimable Winnings</div>
          <div className={`text-2xl font-extrabold tabular-nums ${
            claimableBetsCount > 0 ? 'text-[#F59E0B] animate-pulse' : 'text-[#94A3B8]'
          }`}>
            {claimableBetsCount > 0 ? `+${formatDust(totalClaimableAmount)}` : '0'}{' '}
            <span className="text-xs font-normal text-[#94A3B8]">tDUST</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            {claimableBetsCount} winning position{claimableBetsCount === 1 ? '' : 's'} ready
          </div>
        </div>

        {/* Settled Disbursements */}
        <div className="bg-[#13151A] border border-[#252832] rounded-xl p-4 sm:p-5 space-y-1">
          <div className="text-xs text-[#94A3B8] font-medium">Total Claimed</div>
          <div className="text-2xl font-extrabold text-white tabular-nums">
            {formatDust(totalClaimed)} <span className="text-xs font-normal text-[#94A3B8]">tDUST</span>
          </div>
          <div className="text-[11px] text-emerald-400">Settled on-chain</div>
        </div>
      </div>

      {/* Claim Success Notification */}
      {claimSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>
              Claimed <strong>{formatDust(claimSuccess.amount)} tDUST</strong> successfully! Tx:{' '}
              <code className="text-white underline">{truncateAddress(claimSuccess.txHash, 8, 6)}</code>
            </span>
          </div>
          <button
            onClick={() => setClaimSuccess(null)}
            className="text-[#94A3B8] hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Claim Error Alert */}
      {claimError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center justify-between gap-4 font-sans">
          <div>⚠️ {claimError}</div>
          <button onClick={() => setClaimError(null)} className="text-[#94A3B8] hover:text-white font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 3. Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#252832] pb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'open'
              ? 'bg-[#1C1E26] text-white border border-[#252832]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Active Positions ({openPositions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-[#1C1E26] text-white border border-[#252832]'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          <span>Resolved &amp; Claims ({historyPositions.length})</span>
          {claimableBetsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          )}
        </button>
      </div>

      {/* 4. Positions Table */}
      {activeTab === 'open' && (
        <div className="space-y-3">
          {openPositions.length === 0 ? (
            <div className="text-center py-16 bg-[#13151A] border border-[#252832] rounded-xl space-y-3">
              <div className="text-3xl">🎫</div>
              <h3 className="font-bold text-white text-base">No active positions</h3>
              <p className="text-xs text-[#94A3B8]">
                You have not placed any shielded bets on currently open prediction markets.
              </p>
              <Link
                to="/markets"
                className="inline-block px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs transition-colors"
              >
                Browse Markets →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {openPositions.map((receipt) => {
                const market = marketsMap.get(receipt.marketId);
                const question = market?.question || receipt.marketQuestion || `Market #${receipt.marketId}`;
                const dateStr = new Date(receipt.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={receipt.id}
                    className="p-4 sm:p-5 rounded-xl bg-[#13151A] border border-[#252832] hover:border-[#F59E0B]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                        <span className="px-2 py-0.5 rounded bg-[#1C1E26] text-white">
                          #{receipt.marketId}
                        </span>
                        {market?.category && (
                          <span className="px-2 py-0.5 rounded bg-[#1C1E26] text-[#94A3B8]">
                            {market.category}
                          </span>
                        )}
                        <span>{dateStr}</span>
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <span>🛡️</span>
                          <span>Private</span>
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm hover:text-[#F59E0B] transition-colors">
                        <Link to={`/markets/${receipt.marketId}`}>{question}</Link>
                      </h4>

                      <div className="text-[11px] text-[#64748B]">
                        Receipt: {truncateAddress(receipt.commitmentHex, 8, 6)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-[#252832]">
                      <div className="text-right">
                        <div className="text-[11px] text-[#94A3B8]">Position</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase ${
                              receipt.isYes
                                ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30'
                                : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                            }`}
                          >
                            {receipt.isYes ? 'YES' : 'NO'}
                          </span>
                          <span className="text-sm font-bold text-white tabular-nums">
                            {formatDust(receipt.amount)} tDUST
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/markets/${receipt.marketId}`}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1C1E26] hover:bg-[#252832] border border-[#252832] text-white text-xs font-semibold transition-colors"
                      >
                        Trade →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History & Claims Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyPositions.length === 0 ? (
            <div className="text-center py-16 bg-[#13151A] border border-[#252832] rounded-xl space-y-3">
              <div className="text-3xl">📜</div>
              <h3 className="font-bold text-white text-base">No resolved positions</h3>
              <p className="text-xs text-[#94A3B8]">
                When markets close and resolve, your past bets will appear here for payout claims.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {historyPositions.map((receipt) => {
                const market = marketsMap.get(receipt.marketId);
                const question = market?.question || receipt.marketQuestion || `Market #${receipt.marketId}`;
                const outcome = market?.outcome ?? Outcome.None;

                const isWon =
                  (outcome === Outcome.Yes && receipt.isYes) ||
                  (outcome === Outcome.No && !receipt.isYes) ||
                  outcome === Outcome.Inconclusive;

                const isLost =
                  (outcome === Outcome.Yes && !receipt.isYes) ||
                  (outcome === Outcome.No && receipt.isYes);

                const potentialPayout = computePotentialPayout(receipt, market);
                const isClaiming = claimingReceiptId === receipt.id;

                return (
                  <div
                    key={receipt.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                      isWon && !receipt.claimed
                        ? 'bg-[#13151A] border-[#F59E0B]/50 shadow-md'
                        : 'bg-[#13151A] border-[#252832]'
                    }`}
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[#1C1E26] text-white tabular-nums font-semibold">
                          #{receipt.marketId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold uppercase ${
                            outcome === Outcome.Yes
                              ? 'bg-[#0EA5E9]/15 text-[#0EA5E9]'
                              : outcome === Outcome.No
                              ? 'bg-[#F43F5E]/15 text-[#F43F5E]'
                              : 'bg-[#1C1E26] text-white'
                          }`}
                        >
                          Outcome: {outcome === Outcome.Yes ? 'YES Won' : outcome === Outcome.No ? 'NO Won' : 'Inconclusive'}
                        </span>
                        {isWon && !receipt.claimed && (
                          <span className="px-2 py-0.5 rounded bg-[#F59E0B] text-[#0A0B0D] font-bold text-[10px] animate-pulse">
                            CLAIMABLE
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-sm hover:text-[#F59E0B] transition-colors">
                        <Link to={`/markets/${receipt.marketId}`}>{question}</Link>
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                        <span>My Stake: {receipt.isYes ? 'YES' : 'NO'} (<span className="tabular-nums font-medium text-white">{formatDust(receipt.amount)}</span> tDUST)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-2 md:pt-0 border-t md:border-t-0 border-[#252832]">
                      <div className="text-right">
                        <div className="text-[11px] text-[#94A3B8]">
                          {receipt.claimed ? 'Claimed Payout' : isWon ? 'Claimable Payout' : 'Result'}
                        </div>
                        <div className="text-sm font-bold tabular-nums">
                          {receipt.claimed ? (
                            <span className="text-[#0EA5E9]">
                              +{formatDust(receipt.claimedPayout || potentialPayout)} tDUST
                            </span>
                          ) : isWon ? (
                            <span className="text-[#0EA5E9] font-extrabold">
                              +{formatDust(potentialPayout)} tDUST
                            </span>
                          ) : (
                            <span className="text-[#64748B]">Lost</span>
                          )}
                        </div>
                      </div>

                      {/* Claim Action */}
                      {isWon && !receipt.claimed && (
                        <button
                          onClick={() => handleClaimPayout(receipt)}
                          disabled={isClaiming || !wallet.isConnected}
                          className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                        >
                          {isClaiming ? claimProgressStage || 'Proving...' : 'Claim Payout →'}
                        </button>
                      )}

                      {receipt.claimed && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#0EA5E9]/15 text-[#0EA5E9] font-bold text-xs flex items-center gap-1">
                          <span>✓</span>
                          <span>Claimed</span>
                        </span>
                      )}

                      {isLost && (
                        <span className="text-xs text-[#64748B]">Settled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. Privacy Protocol Note */}
      <div className="p-4 rounded-xl bg-[#13151A] border border-[#252832] flex items-center gap-3 text-xs text-[#94A3B8]">
        <span className="text-lg">🔒</span>
        <div>
          <strong className="text-white">Confidential Portfolio:</strong> Your position sizes and order receipts are stored client-side with zero-knowledge cryptographic privacy. Only your wallet holds the keys to view or redeem settled payouts.
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
