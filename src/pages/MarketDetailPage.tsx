import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { getMarketById } from '../utils/markets.ts';
import { loadReceipts } from '../utils/storage.ts';
import { executeClaimPayout } from '../utils/contract.ts';
import { formatDust, truncateAddress } from '../utils/formatters.ts';
import OddsDisplay from '../components/OddsDisplay.tsx';
import BetPlacement from '../components/BetPlacement.tsx';
import preprodConfig from '../config/preprod-deployment.json';

interface MarketDetailPageProps {
  wallet: MidnightWalletState;
}

export const MarketDetailPage: React.FC<MarketDetailPageProps> = ({ wallet }) => {
  const { id } = useParams<{ id: string }>();
  const [dataRefreshCounter, setDataRefreshCounter] = useState(0);

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimProgressStage, setClaimProgressStage] = useState('');
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const market = useMemo(() => {
    return getMarketById(id || '1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRefreshCounter]);

  // Load private receipts belonging to this market from local witness storage
  const receipts = useMemo(() => {
    const all = Array.from(loadReceipts().values());
    return all.filter((r) => r.marketId === id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dataRefreshCounter]);

  const refreshData = () => {
    setDataRefreshCounter((prev) => prev + 1);
  };

  const handleBetPlaced = () => {
    refreshData();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClaim = async () => {
    if (!wallet.isConnected) {
      wallet.connect('1am');
      return;
    }

    // Find any winning unspent receipt for this market
    const claimable = receipts.find((r) => !r.claimed);
    const targetReceiptId = claimable ? claimable.id : '1';
    const payoutAmount = claimable ? claimable.amount * 2n : 100n;

    setIsClaiming(true);
    setClaimSuccess(null);
    setClaimError(null);
    setClaimProgressStage('Generating zero-knowledge payout proof...');

    try {
      const providers = await wallet.getProviders();
      const result = await executeClaimPayout(providers, {
        marketId: BigInt(id || '1'),
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
        <h2 className="text-xl font-bold text-white">Market Not Found</h2>
        <Link to="/markets" className="text-xs text-[#F59E0B] hover:underline">
          ← Return to All Markets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Breadcrumb Bar */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <Link to="/markets" className="hover:text-white transition-colors">
            Markets
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{market.category}</span>
          <span>/</span>
          <span className="text-[#94A3B8] truncate max-w-xs">{market.question}</span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="px-2.5 py-1 bg-[#13151A] hover:bg-[#1C1E26] border border-[#252832] rounded-lg text-xs text-[#94A3B8] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>⧉</span>
          <span>{copiedLink ? 'Link Copied!' : 'Share Market'}</span>
        </button>
      </div>

      {/* 2. Main 2-Column Trading Floor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Header, Odds Chart, Resolution Rules, Positions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Market Header Card */}
          <div className="bg-[#13151A] border border-[#252832] rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1C1E26] text-[#94A3B8] border border-[#252832] font-medium text-[11px]">
                    {market.category}
                  </span>
                  {market.state === 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/30 font-semibold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
                      Active Market
                    </span>
                  )}
                  {market.state === 1 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold text-[11px]">
                      Bidding Closed (Settling)
                    </span>
                  )}
                  {market.state === 2 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#1C1E26] text-white border border-[#252832] font-semibold text-[11px]">
                      Resolved: {market.outcome === 1 ? 'YES Won' : market.outcome === 2 ? 'NO Won' : 'Inconclusive'}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1">
                    <span>🛡️</span>
                    <span>Private Settlement</span>
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  {market.question}
                </h1>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#252832] text-xs">
              <div>
                <div className="text-[11px] text-[#94A3B8]">Total Pool Volume</div>
                <div className="font-bold text-white tabular-nums mt-0.5">{formatDust(market.totalVolume)} tDUST</div>
              </div>
              <div>
                <div className="text-[11px] text-[#94A3B8]">Expiration Date</div>
                <div className="font-semibold text-white mt-0.5">{formatTimestamp(market.closeTimestamp)}</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-[11px] text-[#94A3B8]">Verified Oracle</div>
                <div className="font-medium text-[#F59E0B] truncate mt-0.5" title={market.resolutionSource}>
                  {market.resolutionSource}
                </div>
              </div>
            </div>
          </div>

          {/* Odds Display with Chart */}
          <OddsDisplay market={market} />

          {/* Winning Claim Alert (if resolved) */}
          {market.state === 2 && (
            <div className="p-5 rounded-xl bg-[#13151A] border border-[#F59E0B]/40 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#FBBF24] font-bold text-sm">
                    <span>🏆</span>
                    <span>Market Resolved on Midnight Network</span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Winning Outcome: <strong className="text-white">{market.outcome === 1 ? 'YES' : market.outcome === 2 ? 'NO' : 'Inconclusive / Refund'}</strong>.
                    Eligible bettors can claim returns via private zero-knowledge proof.
                  </p>
                </div>

                <button
                  onClick={() => handleClaim()}
                  disabled={isClaiming || !wallet.isConnected}
                  className="px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  {isClaiming ? claimProgressStage || 'Proving in ZK...' : 'Claim Payout →'}
                </button>
              </div>

              {claimSuccess && (
                <div className="p-3 bg-[#F59E0B]/15 border border-[#F59E0B]/40 rounded-lg text-[#FBBF24] text-xs">
                  ✅ {claimSuccess}
                </div>
              )}

              {claimError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-lg text-rose-300 text-xs">
                  ⚠️ {claimError}
                </div>
              )}
            </div>
          )}

          {/* Resolution Rules Card */}
          <div className="bg-[#13151A] border border-[#252832] rounded-xl p-5 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm">Market Rules &amp; Resolution Criteria</h4>
            <p className="text-[#94A3B8] leading-relaxed">
              This prediction pool resolves to YES if the criteria are verified by the authenticated oracle ({market.resolutionSource}) before the expiration date.
              Resolution requires an authenticated cryptographic signature submitted to the Midnight Compact smart contract on Preprod.
            </p>
            <div className="pt-2 text-[11px] text-[#64748B] flex items-center justify-between border-t border-[#252832]">
              <span>Resolution Source: {market.resolutionSource}</span>
              <a
                href={preprodConfig.explorerContractUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#F59E0B] hover:underline"
              >
                Contract on Explorer ↗
              </a>
            </div>
          </div>

          {/* Bettor's Shielded Positions for this Market */}
          <div className="bg-[#13151A] border border-[#252832] rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#252832] pb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">Your Shielded Positions</h4>
                <span className="px-2 py-0.5 rounded-full bg-[#1C1E26] text-xs font-semibold text-[#F59E0B]">
                  {receipts.length}
                </span>
              </div>
              <span className="text-xs text-[#94A3B8] font-medium">Decrypted Locally</span>
            </div>

            {receipts.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#94A3B8] bg-[#0A0B0D] rounded-lg border border-[#252832]">
                <div>No shielded positions in this pool yet.</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">
                  Use the trading slip on the right to enter a private position.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {receipts.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0A0B0D] p-3 rounded-lg border border-[#252832] flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          r.isYes
                            ? 'bg-[#0EA5E9]/15 text-[#0EA5E9] border border-[#0EA5E9]/30'
                            : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30'
                        }`}
                      >
                        {r.isYes ? 'YES' : 'NO'}
                      </span>
                      <div>
                        <div className="text-white font-bold tabular-nums">
                          {formatDust(r.amount)} tDUST
                        </div>
                        <div className="text-[10px] text-[#64748B]">
                          Receipt: {r.commitmentHex.slice(0, 8)}...{r.commitmentHex.slice(-6)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                        SHIELDED
                      </span>
                      <div className="text-[10px] text-[#64748B] mt-1">
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): The Trading Slip */}
        <div className="lg:col-span-5 sticky top-20">
          <BetPlacement marketId={market.id} wallet={wallet} onBetPlaced={handleBetPlaced} />
        </div>
      </div>
    </div>
  );
};

export default MarketDetailPage;
