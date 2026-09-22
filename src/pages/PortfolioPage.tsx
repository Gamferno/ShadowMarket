import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { loadReceipts } from '../utils/storage.ts';
import { getAllMarkets } from '../utils/markets.ts';
import { executeClaimPayout, type MarketPublicData } from '../utils/contract.ts';
import { formatDust, truncateAddress } from '../utils/formatters.ts';
import { MarketState, Outcome, type ShieldedBetReceipt } from '../types/index.ts';

interface PortfolioPageProps {
  wallet: MidnightWalletState;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ wallet }) => {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const [receipts, setReceipts] = useState<ShieldedBetReceipt[]>([]);
  const [marketsMap, setMarketsMap] = useState<Map<string, MarketPublicData>>(new Map());

  // Claim in-flight state
  const [claimingReceiptId, setClaimingReceiptId] = useState<string | null>(null);
  const [claimProgressStage, setClaimProgressStage] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<{ receiptId: string; amount: bigint; txHash: string } | null>(null);

  const refreshData = () => {
    const rawReceipts = Array.from(loadReceipts().values()).sort((a, b) => b.timestamp - a.timestamp);
    setReceipts(rawReceipts);

    const allMarkets = getAllMarkets();
    const map = new Map<string, MarketPublicData>();
    for (const m of allMarkets) {
      map.set(m.id, m);
    }
    setMarketsMap(map);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Compute Metrics
  let totalWagered = 0n;
  let totalClaimed = 0n;
  let activeBetsCount = 0;
  let claimableBetsCount = 0;

  for (const r of receipts) {
    totalWagered += r.amount;
    if (r.claimed && r.claimedPayout) {
      totalClaimed += r.claimedPayout;
    }

    const m = marketsMap.get(r.marketId);
    if (!m || m.state !== MarketState.Resolved) {
      activeBetsCount++;
    } else {
      const won = (m.outcome === Outcome.Yes && r.isYes) || (m.outcome === Outcome.No && !r.isYes) || m.outcome === Outcome.Inconclusive;
      if (won && !r.claimed) {
        claimableBetsCount++;
      }
    }
  }

  // Filter positions
  const openPositions = receipts.filter((r) => {
    const m = marketsMap.get(r.marketId);
    return !m || m.state !== MarketState.Resolved;
  });

  const historyPositions = receipts.filter((r) => {
    const m = marketsMap.get(r.marketId);
    return m && m.state === MarketState.Resolved;
  });

  // Calculate estimated payout for a winning receipt
  const computePotentialPayout = (r: ShieldedBetReceipt, m?: MarketPublicData): bigint => {
    if (!m) return r.amount * 2n;
    if (m.outcome === Outcome.Inconclusive) return r.amount;
    const winningStake = r.isYes ? m.totalStakeYes : m.totalStakeNo;
    if (winningStake === 0n) return r.amount;
    return (r.amount * m.totalVolume) / winningStake;
  };

  const handleClaimPayout = async (r: ShieldedBetReceipt) => {
    if (claimingReceiptId) return;
    if (!wallet.isConnected) {
      setClaimError('Please connect your wallet to submit the Zero-Knowledge payout claim.');
      return;
    }

    const m = marketsMap.get(r.marketId);
    const payout = computePotentialPayout(r, m);

    setClaimingReceiptId(r.id);
    setClaimError(null);
    setClaimProgressStage('Setting up private claim witness...');

    try {
      const providers = await wallet.getProviders();
      const result = await executeClaimPayout(providers, {
        marketId: BigInt(r.marketId),
        receiptId: r.id,
        payoutAmount: payout,
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
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              Private Portfolio & Positions
            </h1>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Shielded Storage
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Client-side decrypted view of your confidential bets. These receipts exist only in your browser's private
            storage and are never exposed in plaintext on the public ledger.
          </p>
        </div>

        <Link
          to="/markets"
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-700"
        >
          <span>Explore All Markets</span>
          <span>→</span>
        </Link>
      </div>

      {/* Disconnected Notice */}
      {!wallet.isConnected && (
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <div className="text-sm font-bold text-amber-300">Wallet Disconnected</div>
              <div className="text-xs text-slate-400">
                Connect your Midnight wallet (1am or Lace) to execute shielded payout claims on Midnight Preprod.
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500">Total Wagered</div>
          <div className="text-xl font-mono font-bold text-slate-100 flex items-baseline gap-1.5">
            <span>{formatDust(totalWagered)}</span>
            <span className="text-xs text-slate-500 font-sans font-normal">tDUST</span>
          </div>
          <div className="text-[11px] text-slate-500">{receipts.length} total shielded bets</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500">Open Positions</div>
          <div className="text-xl font-mono font-bold text-cyan-400">
            {activeBetsCount}
          </div>
          <div className="text-[11px] text-slate-500">Markets pending resolution</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500">Claimable Wins</div>
          <div className={`text-xl font-mono font-bold ${claimableBetsCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
            {claimableBetsCount}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting ZK nullifier claim</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <div className="text-xs font-mono uppercase text-slate-500">Total Claimed</div>
          <div className="text-xl font-mono font-bold text-emerald-400 flex items-baseline gap-1.5">
            <span>{formatDust(totalClaimed)}</span>
            <span className="text-xs text-emerald-500/70 font-sans font-normal">tDUST</span>
          </div>
          <div className="text-[11px] text-emerald-500/80">Disbursed on Preprod</div>
        </div>
      </div>

      {/* Claim Success Notification */}
      {claimSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>
              Claimed <strong>{formatDust(claimSuccess.amount)} tDUST</strong> via zero-knowledge proof! Tx:{' '}
              <code className="text-emerald-200">{truncateAddress(claimSuccess.txHash, 10, 8)}</code>
            </span>
          </div>
          <button
            onClick={() => setClaimSuccess(null)}
            className="text-slate-400 hover:text-slate-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Claim Error Alert */}
      {claimError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center justify-between gap-4">
          <div>⚠️ {claimError}</div>
          <button onClick={() => setClaimError(null)} className="text-slate-400 hover:text-slate-200 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'open'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open Positions ({openPositions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            History & Claims ({historyPositions.length})
          </button>
        </div>

        <button
          onClick={refreshData}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <span>↻</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* TAB CONTENT: Open Positions */}
      {activeTab === 'open' && (
        <div className="space-y-4">
          {openPositions.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center text-xl mx-auto">
                🎲
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">No active positions found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You have not placed any shielded bets on currently open prediction markets.
                </p>
              </div>
              <Link
                to="/markets"
                className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Browse Markets
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {openPositions.map((receipt) => {
                const market = marketsMap.get(receipt.marketId);
                const question = market?.question || receipt.marketQuestion || `Market #${receipt.marketId}`;
                const dateStr = new Date(receipt.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={receipt.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                          Market #{receipt.marketId}
                        </span>
                        {market?.category && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-400">
                            {market.category}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{dateStr}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                        <Link to={`/markets/${receipt.marketId}`}>{question}</Link>
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-slate-500">Commitment:</span>
                        <span className="text-slate-400">{truncateAddress(receipt.commitmentHex, 8, 6)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-mono">Position</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase ${
                              receipt.isYes
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {receipt.isYes ? 'YES' : 'NO'}
                          </span>
                          <span className="text-base font-bold font-mono text-slate-100">
                            {formatDust(receipt.amount)} <span className="text-xs font-normal text-slate-500">tDUST</span>
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/markets/${receipt.marketId}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        View Market
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: History & Claims */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {historyPositions.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center text-xl mx-auto">
                📜
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-200">No resolved positions yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When prediction markets close and resolve, your past winning bets will appear here for payout claims.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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
                    className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isWon
                        ? 'bg-slate-900/80 border-emerald-500/30 shadow-lg shadow-emerald-950/10'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-80'
                    }`}
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                          Market #{receipt.marketId}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                            outcome === Outcome.Yes
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : outcome === Outcome.No
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          Outcome: {outcome === Outcome.Yes ? 'YES Won' : outcome === Outcome.No ? 'NO Won' : 'Inconclusive'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                        <Link to={`/markets/${receipt.marketId}`}>{question}</Link>
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-slate-500">My Bet:</span>
                        <span className={receipt.isYes ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {receipt.isYes ? 'YES' : 'NO'} ({formatDust(receipt.amount)} tDUST)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-mono">
                          {receipt.claimed ? 'Claimed Payout' : isWon ? 'Claimable Payout' : 'Result'}
                        </div>
                        <div className="text-base font-bold font-mono">
                          {receipt.claimed ? (
                            <span className="text-emerald-400">
                              +{formatDust(receipt.claimedPayout || potentialPayout)} tDUST
                            </span>
                          ) : isWon ? (
                            <span className="text-amber-400 font-black animate-pulse">
                              +{formatDust(potentialPayout)} tDUST
                            </span>
                          ) : (
                            <span className="text-slate-500">Lost</span>
                          )}
                        </div>
                      </div>

                      {/* Claim Action */}
                      {isWon && !receipt.claimed && (
                        <button
                          onClick={() => handleClaimPayout(receipt)}
                          disabled={isClaiming || !wallet.isConnected}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
                        >
                          {isClaiming ? claimProgressStage || 'Generating ZK Proof...' : 'Claim Payout →'}
                        </button>
                      )}

                      {receipt.claimed && (
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                          <span>✓</span>
                          <span>Claimed</span>
                        </span>
                      )}

                      {isLost && (
                        <span className="text-xs font-mono text-slate-600">Settled</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
