import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import OddsDisplay from '../components/OddsDisplay.tsx';
import BetPlacement from '../components/BetPlacement.tsx';
import { getMarketById } from '../utils/markets.ts';
import { loadReceipts } from '../utils/storage.ts';
import {
  type MarketPublicData,
  type BetTransactionResult,
  executeClaimPayout
} from '../utils/contract.ts';
import type { ShieldedBetReceipt } from '../types/index.ts';
import { formatDust, truncateAddress } from '../utils/formatters.ts';
import preprodConfig from '../config/preprod-deployment.json';

interface MarketDetailPageProps {
  wallet: MidnightWalletState;
}

export const MarketDetailPage: React.FC<MarketDetailPageProps> = ({ wallet }) => {
  const { id } = useParams<{ id: string }>();
  const marketId = id || '1';

  const [market, setMarket] = useState<MarketPublicData | null>(null);
  const [receipts, setReceipts] = useState<ShieldedBetReceipt[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Claim states
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimProgressStage, setClaimProgressStage] = useState<string>('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const refreshData = useCallback(() => {
    const found = getMarketById(marketId);

    if (found) {
      setMarket(found);
    }
    const allReceipts = Array.from(loadReceipts().values()).reverse();
    setReceipts(allReceipts.filter((r) => r.marketId === marketId));
  }, [marketId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleBetPlaced = (_result: BetTransactionResult) => {
    refreshData();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleClaim = async (receipt?: ShieldedBetReceipt) => {
    if (isClaiming) return;
    if (!wallet.isConnected) {
      setClaimError('Please connect your Midnight wallet to claim your shielded payout.');
      return;
    }

    setIsClaiming(true);
    setClaimError(null);
    setClaimSuccess(null);
    setClaimProgressStage('Setting up private claim witness & nullifier...');

    try {
      const providers = await wallet.getProviders();
      const targetReceiptId = receipt?.id || receipts[0]?.id || 'receipt_sim';
      const payoutAmount = receipt?.amount ? receipt.amount * 2n : 100_000_000n;

      const result = await executeClaimPayout(providers, {
        marketId: BigInt(marketId),
        receiptId: targetReceiptId,
        payoutAmount,
        onProgress: (stage) => setClaimProgressStage(stage)
      });

      setClaimSuccess(
        `Successfully claimed ${formatDust(result.claimedPayout)} tDUST via Zero-Knowledge proof! Nullifier registered on Preprod (Tx: ${truncateAddress(result.txHash, 8, 6)}).`
      );
      refreshData();
    } catch (err: any) {
      console.error('Claim error:', err);
      setClaimError(err.message || 'Failed to claim payout. Proof verification rejected or nullifier already spent.');
    } finally {
      setIsClaiming(false);
    }
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

  if (!market) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Market Not Found</h2>
        <Link to="/markets" className="text-sm text-cyan-400 hover:underline">
          ← Back to All Markets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/markets"
          className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5 font-medium"
        >
          <span>←</span>
          <span>Back to Markets</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔗</span>
            <span>{copiedLink ? 'Link Copied!' : 'Share Market'}</span>
          </button>
        </div>
      </div>

      {/* Market Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-semibold rounded-full">
            {market.category}
          </span>
          {market.state === 0 && (
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open for Betting
            </span>
          )}
          {market.state === 1 && (
            <span className="px-3 py-1 bg-amber-950/80 text-amber-400 border border-amber-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span>⏳</span>
              Bidding Closed
            </span>
          )}
          {market.state === 2 && (
            <span className="px-3 py-1 bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <span>⚖️</span>
              Resolved: {market.outcome === 1 ? 'YES Won' : market.outcome === 2 ? 'NO Won' : 'Inconclusive'}
            </span>
          )}
          <span className="px-3 py-1 bg-slate-950 text-slate-400 border border-slate-800 text-xs font-mono rounded-full">
            Market #{market.id}
          </span>
          {market.id === '1' && (
            <span className="px-3 py-1 bg-purple-950/80 text-purple-300 border border-purple-800 text-xs font-mono rounded-full">
              Live on Preprod Contract
            </span>
          )}
        </div>

        {/* Question Title */}
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
            {market.id === '1' && (
              <div className="pt-1">
                <a
                  href={preprodConfig.explorerContractUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:underline"
                >
                  View Contract on Explorer ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Resolution Shielded Payout Banner (Always shown post-resolution regardless of outcome to preserve privacy) */}
      {market.state === 2 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-base">
                <span>🏆</span>
                <span>Market Settled on Midnight Preprod</span>
              </div>
              <p className="text-xs text-slate-400">
                Official Winning Outcome: <strong className="text-purple-200">{market.outcome === 1 ? 'YES' : market.outcome === 2 ? 'NO' : 'Inconclusive / Refund'}</strong>.
                Winners can claim their proportional share via Zero-Knowledge proof.
              </p>
            </div>

            <button
              onClick={() => handleClaim()}
              disabled={isClaiming || !wallet.isConnected}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-600 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {isClaiming ? claimProgressStage || 'Proving in ZK...' : 'Claim Payout (ZK Proof) →'}
            </button>
          </div>

          {claimSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs">
              ✅ {claimSuccess}
            </div>
          )}

          {claimError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs">
              ⚠️ {claimError}
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Left (Odds + Chart + History) vs Right (Bet Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Odds Display with embedded interactive SVG trajectory chart */}
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

          {/* Bettor's Shielded Positions History for this Market */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-200">Your Shielded Positions in this Market</h4>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-400">
                  {receipts.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Stored privately in browser</span>
            </div>

            {receipts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
                <div className="text-2xl mb-1">🎫</div>
                <div>No shielded positions placed in Market #{market.id} yet.</div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Use the bet panel on the right to lock in your private position.
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

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <BetPlacement market={market} wallet={wallet} onBetPlaced={handleBetPlaced} />
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
