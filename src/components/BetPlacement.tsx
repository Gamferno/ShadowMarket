import React, { useState } from 'react';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import type { MarketPublicData } from '../utils/contract.ts';
import { executePlaceShieldedBet, type BetTransactionResult } from '../utils/contract.ts';

interface BetPlacementProps {
  market: MarketPublicData;
  wallet: MidnightWalletState;
  onBetPlaced?: (result: BetTransactionResult) => void;
}

export const BetPlacement: React.FC<BetPlacementProps> = ({ market, wallet, onBetPlaced }) => {
  const [selectedSide, setSelectedSide] = useState<boolean>(true); // true = YES, false = NO
  const [amountStr, setAmountStr] = useState<string>('50');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [recentTx, setRecentTx] = useState<BetTransactionResult | null>(null);

  const amount = BigInt(Math.max(1, parseInt(amountStr) || 1));

  // Compute live odds ratio & potential payout
  const totalStakeYes = market.totalStakeYes;
  const totalStakeNo = market.totalStakeNo;
  const totalVol = market.totalVolume;

  let projectedOddsYes = 50;
  let projectedOddsNo = 50;
  const simTotal = totalVol + amount;

  if (simTotal > 0n) {
    const simYes = selectedSide ? totalStakeYes + amount : totalStakeYes;
    projectedOddsYes = Number((simYes * 100n) / simTotal);
    projectedOddsNo = 100 - projectedOddsYes;
  }

  // Estimated payout
  const winningStakeAfterBet = (selectedSide ? totalStakeYes : totalStakeNo) + amount;
  const estimatedPayout = winningStakeAfterBet > 0n ? (amount * simTotal) / winningStakeAfterBet : amount;
  const multiplier = amount > 0n ? (Number(estimatedPayout) / Number(amount)).toFixed(2) : '1.00';

  const handleStartBet = () => {
    setErrorMsg('');
    setRecentTx(null);
    if (!wallet.isConnected) {
      wallet.connect('1am').catch(() => {});
      return;
    }
    if (amount <= 0n) {
      setErrorMsg('Please enter a valid bet amount.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmBet = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    setErrorMsg('');
    setProgressStage('Initializing Midnight providers and witnesses...');

    try {
      const providers = await wallet.getProviders();
      const result = await executePlaceShieldedBet(providers, {
        marketId: BigInt(market.id),
        isYes: selectedSide,
        amount,
        onProgress: (stage) => setProgressStage(stage)
      });

      setRecentTx(result);
      setIsSubmitting(false);
      onBetPlaced?.(result);
    } catch (err: any) {
      console.error('Bet submission failed:', err);
      setIsSubmitting(false);
      setErrorMsg(err?.reason || err?.message || 'Transaction was rejected or proof generation failed.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Title & Privacy Callout */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🛡️</span>
            <span>Place Shielded Position</span>
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            Zero-Knowledge PLONK
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Your choice and bet size remain strictly private. The smart contract validates your bet via local ZK proof and records an anonymous commitment.
        </p>
      </div>

      {/* Outcome Selector: YES / NO */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedSide(true)}
          className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1 cursor-pointer border ${
            selectedSide
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">▲</span>
            <span>YES</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400/80">
            Est. {projectedOddsYes}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSide(false)}
          className={`py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex flex-col items-center gap-1 cursor-pointer border ${
            !selectedSide
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50 ring-2 ring-rose-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base">▼</span>
            <span>NO</span>
          </div>
          <span className="text-[11px] font-mono text-rose-400/80">
            Est. {projectedOddsNo}%
          </span>
        </button>
      </div>

      {/* Stake Amount Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-slate-300">Stake Amount</label>
          <span className="text-slate-400 font-mono">Currency: tDUST / Units</span>
        </div>

        <div className="relative">
          <input
            type="number"
            min="1"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-mono text-lg focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
            placeholder="50"
          />
          <div className="absolute right-3 top-3 text-xs font-mono text-slate-500 pointer-events-none">
            UNITS
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="flex gap-2">
          {['10', '50', '100', '250', '500'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountStr(preset)}
              disabled={isSubmitting}
              className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                amountStr === preset
                  ? 'bg-cyan-950 border-cyan-800 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              +{preset}
            </button>
          ))}
        </div>
      </div>

      {/* Return Calculation Breakdown */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Expected Return Ratio</span>
          <span className="font-mono text-emerald-400 font-bold">{multiplier}x</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Est. Potential Payout</span>
          <span className="font-mono text-slate-200 font-semibold">{estimatedPayout.toString()} units</span>
        </div>
        <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Privacy Guarantee</span>
          <span className="text-cyan-400">Fully Shielded Position</span>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {market.state === 1 /* MarketState.Closed */ ? (
          <div className="w-full py-3.5 px-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-center text-xs font-bold">
            Bidding Closed — Awaiting Oracle Resolution
          </div>
        ) : market.state === 2 /* MarketState.Resolved */ ? (
          <div className="w-full py-3.5 px-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-center text-xs font-bold space-y-1">
            <div>Market Permanently Resolved</div>
            <div className="text-[11px] font-mono text-slate-400">
              Outcome: {market.outcome === 1 ? 'YES Won' : market.outcome === 2 ? 'NO Won' : 'Inconclusive'}
            </div>
          </div>
        ) : !wallet.isConnected ? (
          <button
            type="button"
            onClick={() => wallet.connect('1am')}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl transition-all cursor-pointer"
          >
            Connect 1am Wallet to Place Bet
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartBet}
            disabled={isSubmitting || wallet.proofServerOk === false}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedSide
                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500'
                : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Shielded Bet...</span>
              </>
            ) : (
              <span>Place Shielded Bet ({selectedSide ? 'YES' : 'NO'})</span>
            )}
          </button>
        )}
      </div>

      {/* In-Flight Multi-Stage Progress */}
      {isSubmitting && progressStage && (
        <div className="bg-cyan-950/40 border border-cyan-800/80 p-4 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Zero-Knowledge Pipeline Active</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            {progressStage}
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-950/50 border border-rose-900 p-4 rounded-xl text-xs text-rose-300 font-medium">
          <span className="font-bold mr-1">Error:</span> {errorMsg}
        </div>
      )}

      {/* Success Banner */}
      {recentTx && (
        <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>✓</span>
            <span>Shielded Bet Confirmed on Preprod!</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Position:</span>
              <span className="font-semibold text-emerald-300">{recentTx.isYes ? 'YES' : 'NO'} ({recentTx.amount.toString()} units)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Private Commitment:</span>
              <span className="font-mono text-slate-400">{recentTx.commitmentHex.slice(0, 16)}...</span>
            </div>
          </div>
          <div className="pt-1">
            <a
              href={`https://preprod.midnightexplorer.com/transactions/0x${recentTx.txHash.replace(/^0x/, '')}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:underline font-mono inline-flex items-center gap-1"
            >
              <span>View Transaction on Midnight Explorer →</span>
            </a>
          </div>
        </div>
      )}

      {/* Bet Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <span>🛡️</span>
                <span>Confirm Shielded Bet</span>
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 mb-1">Market Question:</div>
                <div className="text-slate-200 font-semibold">{market.question}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 mb-0.5">Your Position</div>
                  <div className={`font-bold text-sm ${selectedSide ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedSide ? 'YES' : 'NO'}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-400 mb-0.5">Stake Amount</div>
                  <div className="font-bold text-sm text-slate-100 font-mono">
                    {amount.toString()} units
                  </div>
                </div>
              </div>

              <div className="bg-cyan-950/30 border border-cyan-800/60 p-3 rounded-xl space-y-1">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Cryptographic Shield Active</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This transaction will generate a ZK proof locally on your proof server (<code className="text-cyan-400">localhost:6300</code>). No wallet address or side choice is exposed to on-chain observers.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBet}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Confirm &amp; Prove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetPlacement;

