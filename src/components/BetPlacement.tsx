import React, { useState } from 'react';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { executePlaceBet } from '../utils/contract.ts';
import { saveReceipt } from '../utils/storage.ts';
import { truncateAddress } from '../utils/formatters.ts';

interface BetPlacementProps {
  marketId: string;
  initialSide?: boolean;
  wallet: MidnightWalletState;
  onBetPlaced?: () => void;
}

export const BetPlacement: React.FC<BetPlacementProps> = ({
  marketId,
  initialSide = true,
  wallet,
  onBetPlaced
}) => {
  const [selectedSide, setSelectedSide] = useState<boolean>(initialSide);
  const [orderMode, setOrderMode] = useState<'buy' | 'sell'>('buy');
  const [amountStr, setAmountStr] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentTx, setRecentTx] = useState<{ txHash: string; commitmentHex: string } | null>(null);

  const amount = BigInt(Math.max(1, parseInt(amountStr || '0', 10)));
  const sharesCount = amount * 2n; // At 50¢ fixed odds, 1 tDUST buys 2 shares
  const potentialReturn = sharesCount; // Each winning share pays 1 tDUST

  const handleQuickAdd = (added: number) => {
    const current = parseInt(amountStr || '0', 10);
    setAmountStr(String(current + added));
  };

  const handleMax = () => {
    setAmountStr('250');
  };

  const handlePlaceBet = async () => {
    if (!wallet.isConnected) {
      wallet.connect('1am');
      return;
    }

    if (amount <= 0n) {
      setErrorMsg('Please enter a valid stake amount (min 1 tDUST).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setRecentTx(null);
    setProgressStage('Initializing confidential ZK witness...');

    try {
      const providers = await wallet.getProviders();

      const result = await executePlaceBet(providers, {
        marketId,
        side: selectedSide,
        amount,
        userSecret: wallet.walletSecret || undefined,
        onProgress: (stage: string) => setProgressStage(stage)
      });

      // Persist the private receipt securely in local witness storage
      if (result.receipt) {
        saveReceipt(result.receipt);
      }

      setRecentTx({
        txHash: result.txHash,
        commitmentHex: result.commitmentHex
      });

      setIsSubmitting(false);
      if (onBetPlaced) onBetPlaced();
    } catch (err: any) {
      console.error('Bet submission failed:', err);
      setIsSubmitting(false);
      setErrorMsg(err?.reason || err?.message || 'Transaction was rejected or proof generation failed.');
    }
  };

  return (
    <div className="rounded-xl border border-[#252832] bg-[#13151A] p-5 shadow-2xl flex flex-col gap-4 font-sans">
      {/* 1. Buy / Sell Segmented Control */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-[#0A0B0D] border border-[#252832] text-xs font-semibold">
        <button
          type="button"
          onClick={() => setOrderMode('buy')}
          className={`py-2 text-center rounded transition-colors cursor-pointer ${
            orderMode === 'buy'
              ? 'bg-[#1C1E26] text-white shadow-sm font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setOrderMode('sell')}
          className={`py-2 text-center rounded transition-colors cursor-pointer ${
            orderMode === 'sell'
              ? 'bg-[#1C1E26] text-white shadow-sm font-bold'
              : 'text-[#94A3B8] hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* 2. Big Outcome Selection Cards (Side-by-Side YES/NO - Blue & Red) */}
      <div className="grid grid-cols-2 gap-3">
        {/* YES Card (Blue) */}
        <button
          type="button"
          onClick={() => setSelectedSide(true)}
          className={`flex flex-col gap-1 p-3.5 rounded-lg text-left relative transition-all active:scale-[0.98] cursor-pointer ${
            selectedSide
              ? 'border-2 border-[#0EA5E9] bg-[#0EA5E9]/15 shadow-[0_0_12px_rgba(14,165,233,0.15)]'
              : 'border border-[#252832] bg-[#0A0B0D] hover:border-[#0EA5E9]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0EA5E9]">Yes</span>
            {selectedSide ? (
              <span className="text-[#0EA5E9] text-xs font-bold">✓</span>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-[#252832]" />
            )}
          </div>
          <span className="text-xl font-extrabold text-white tabular-nums">50¢</span>
          <span className="text-[10px] text-[#94A3B8] tabular-nums">Payout: 1.00 DUST</span>
        </button>

        {/* NO Card (Red) */}
        <button
          type="button"
          onClick={() => setSelectedSide(false)}
          className={`flex flex-col gap-1 p-3.5 rounded-lg text-left relative transition-all active:scale-[0.98] cursor-pointer ${
            !selectedSide
              ? 'border-2 border-[#F43F5E] bg-[#F43F5E]/15 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
              : 'border border-[#252832] bg-[#0A0B0D] hover:border-[#F43F5E]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F43F5E]">No</span>
            {!selectedSide ? (
              <span className="text-[#F43F5E] text-xs font-bold">✓</span>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-[#252832]" />
            )}
          </div>
          <span className="text-xl font-extrabold text-white tabular-nums">50¢</span>
          <span className="text-[10px] text-[#94A3B8] tabular-nums">Payout: 1.00 DUST</span>
        </button>
      </div>

      {/* 3. Order Type Selector */}
      <div className="flex items-center justify-between border-b border-[#252832] pb-3 text-xs">
        <span className="text-[#94A3B8]">Order Type</span>
        <div className="flex items-center gap-3 font-semibold">
          <span className="text-[#F59E0B] border-b-2 border-[#F59E0B] pb-0.5">Market</span>
          <span className="text-[#64748B] hover:text-white cursor-pointer">Limit</span>
        </div>
      </div>

      {/* 4. Amount Entry Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8] font-medium">Stake Amount</span>
          <span className="text-xs text-[#64748B] tabular-nums">
            Balance: <span className="text-white font-semibold">1,000 tDUST</span>
          </span>
        </div>

        <div className="relative">
          <input
            type="number"
            min="1"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="0"
            className="w-full bg-[#0A0B0D] border border-[#252832] focus:border-[#F59E0B] rounded-lg py-2.5 px-3.5 text-white font-bold text-lg tabular-nums focus:outline-none transition-colors"
          />
          <div className="absolute right-3.5 top-3 text-xs font-semibold text-[#94A3B8]">
            tDUST
          </div>
        </div>

        {/* Quick Amount Chips */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {([10, 50, 100] as const).map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleQuickAdd(chip)}
              className="py-1 px-2 rounded bg-[#0A0B0D] hover:bg-[#1C1E26] border border-[#252832] text-xs font-semibold tabular-nums text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              +{chip}
            </button>
          ))}
          <button
            type="button"
            onClick={handleMax}
            className="py-1 px-2 rounded bg-[#0A0B0D] hover:bg-[#1C1E26] border border-[#252832] text-xs font-bold text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors cursor-pointer"
          >
            Max
          </button>
        </div>
      </div>

      {/* 5. Detailed Trade Calculation Summary Box */}
      <div className="bg-[#1C1E26] rounded-lg p-3.5 space-y-2 border border-[#252832] text-xs font-sans">
        <div className="flex items-center justify-between">
          <span className="text-[#94A3B8]">Avg Price</span>
          <span className="text-white font-bold tabular-nums">50¢</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#94A3B8]">Estimated Shares</span>
          <span className="text-white font-bold tabular-nums">{sharesCount.toString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#94A3B8]">Potential Return</span>
          <span className="text-[#0EA5E9] font-bold tabular-nums">
            {potentialReturn.toString()} tDUST (+100%)
          </span>
        </div>
        <div className="border-t border-[#252832] pt-2 flex items-center justify-between">
          <span className="text-[#94A3B8] flex items-center gap-1">
            <span>🛡️</span>
            <span>Settlement Security</span>
          </span>
          <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Escrow Collateralized
          </span>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900 text-rose-300 text-xs">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* In-Flight Prover Progress */}
      {isSubmitting && (
        <div className="p-3.5 rounded-lg bg-[#1C1E26] border border-[#F59E0B]/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#F59E0B] font-bold">
            <span className="w-3 h-3 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin" />
            <span>Securing Confidential Order...</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">{progressStage}</div>
          <div className="w-full bg-[#0A0B0D] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#F59E0B] h-full w-3/4 animate-pulse rounded-full" />
          </div>
        </div>
      )}

      {/* 6. Primary Action Button */}
      <button
        type="button"
        onClick={handlePlaceBet}
        disabled={isSubmitting}
        className={`w-full py-3.5 rounded-lg font-bold text-sm flex flex-col items-center justify-center shadow-lg active:scale-[0.98] transition-all cursor-pointer ${
          selectedSide
            ? 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white'
            : 'bg-[#F43F5E] hover:bg-[#E11D48] text-white'
        } disabled:opacity-50`}
      >
        <span>
          {isSubmitting
            ? 'Confirming Transaction...'
            : wallet.isConnected
            ? `Buy ${selectedSide ? 'Yes' : 'No'}`
            : 'Connect Wallet to Trade'}
        </span>
        <span className="text-[11px] opacity-80 font-normal">
          Deterministic On-Chain Escrow Settlement
        </span>
      </button>

      {/* Success Notification */}
      {recentTx && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <span>✓</span>
            <span>Order Placed &amp; Escrow Settled!</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">
            Receipt: {truncateAddress(recentTx.commitmentHex, 8, 6)} • Tx: {truncateAddress(recentTx.txHash, 8, 6)}
          </div>
        </div>
      )}

      {/* 7. Prover Status Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#64748B]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Instant matching engine active · Zero front-running</span>
      </div>

      <p className="text-center text-[10px] text-[#64748B] border-t border-[#252832] pt-2 leading-relaxed">
        Autonomous smart contract escrow. Private execution guarantees no slippage or MEV bots.
      </p>
    </div>
  );
};

export default BetPlacement;
