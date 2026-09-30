import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { MidnightWalletState } from '../hooks/useMidnight.ts';
import { executeCreateMarket } from '../utils/contract.ts';
import { MarketCard } from '../components/MarketCard.tsx';
import { MarketState, Outcome, type MarketCategory } from '../types/index.ts';

interface CreateMarketPageProps {
  wallet: MidnightWalletState;
}

const CATEGORIES: MarketCategory[] = ['Crypto/Macro', 'Politics', 'Sports', 'Local/Civic', 'Custom'];

export const CreateMarketPage: React.FC<CreateMarketPageProps> = ({ wallet }) => {
  const navigate = useNavigate();

  // Form State
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<MarketCategory>('Crypto/Macro');
  const [resolutionSource, setResolutionSource] = useState('');

  // Default close date: 30 days in future
  const defaultCloseDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 16);
  const [closeDateTime, setCloseDateTime] = useState(defaultCloseDate);

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ id: string; txHash: string } | null>(null);

  // Validation
  const isValid =
    question.trim().length >= 8 &&
    resolutionSource.trim().length >= 4 &&
    new Date(closeDateTime).getTime() > Date.now();

  const closeTimestampSeconds = BigInt(Math.floor(new Date(closeDateTime).getTime() / 1000));

  // Preview dummy market
  const previewMarket = {
    id: 'preview',
    question: question.trim() || 'Will Midnight testnet achieve privacy benchmarks in 2026?',
    category,
    resolutionSource: resolutionSource.trim() || 'Official Project Documentation & Verified Ledger',
    closeTimestamp: closeTimestampSeconds,
    state: MarketState.Open,
    outcome: Outcome.None,
    totalVolume: 0n,
    betCounter: 0n,
    escrowBalance: 0n
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    if (!wallet.isConnected) {
      setErrorMsg('Please connect your Midnight wallet (1am or Lace) first to deploy a market.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setProgressStage('Initializing market deployment on Midnight...');

    try {
      const providers = await wallet.getProviders();
      const result = await executeCreateMarket(providers, {
        question: question.trim(),
        category,
        resolutionSource: resolutionSource.trim(),
        closeTimestamp: closeTimestampSeconds,
        userSecret: wallet.walletSecret || undefined,
        onProgress: (stage) => setProgressStage(stage)
      });

      setSuccessResult({
        id: result.marketId,
        txHash: result.txHash
      });
    } catch (err: any) {
      console.error('Market creation failed:', err);
      setErrorMsg(err.message || 'Failed to deploy market to Midnight Preprod.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2 font-sans">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-xs text-[#94A3B8]">
          <Link
            to="/markets"
            className="hover:text-white transition-colors"
          >
            Markets
          </Link>
          <span>/</span>
          <span className="text-white font-medium">Create Market</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create a Prediction Market
          </h1>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 font-semibold">
            Midnight Preprod
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 max-w-2xl leading-relaxed">
          Deploy an immutable binary prediction market onto Midnight Network. Participants wager via client-side zero-knowledge proofs; public odds update deterministically while individual stakes remain completely shielded.
        </p>
      </div>

      {/* Success Notification Modal */}
      {successResult && (
        <div className="p-6 rounded-2xl bg-[#13151A] border border-[#F59E0B]/50 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5 text-[#FBBF24] font-bold text-lg">
            <span className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-sm">✓</span>
            <span>Market Deployed Successfully</span>
          </div>
          <p className="text-[#94A3B8] text-xs leading-relaxed">
            Your prediction market has been registered on-chain. Traders can now place confidential YES/NO orders.
          </p>
          <div className="p-4 bg-[#0A0B0D] rounded-xl border border-[#252832] text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8]">Market ID:</span>
              <span className="text-white font-bold tabular-nums">#{successResult.id}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-[#94A3B8]">Transaction Hash:</span>
              <a
                href={`https://preprod.midnightexplorer.com/transactions/0x${successResult.txHash.replace(/^0x/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#F59E0B] hover:underline truncate max-w-xs tabular-nums text-xs"
                title="View on Midnight Explorer"
              >
                {successResult.txHash} ↗
              </a>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/markets/${successResult.id}`)}
              className="px-5 py-2.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer active:scale-[0.98]"
            >
              View Live Market →
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setQuestion('');
                setDescription('');
                setResolutionSource('');
              }}
              className="px-4 py-2.5 rounded-lg bg-[#1C1E26] hover:bg-[#252832] border border-[#252832] text-[#94A3B8] hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Create Another Market
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleCreateMarket} className="space-y-5 bg-[#13151A] p-6 sm:p-7 rounded-2xl border border-[#252832] shadow-xl">
            {/* Question */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Market Question <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Will Midnight launch native private tokens before December 2026?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0D] border border-[#252832] focus:border-[#F59E0B] focus:outline-none text-white text-xs placeholder-[#64748B] transition-colors"
                required
              />
              <p className="text-[11px] text-[#64748B] mt-1.5">
                Must be an unambiguous proposition resolving strictly to YES or NO.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">
                Category <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      category === cat
                        ? 'bg-[#F59E0B] text-[#0A0B0D] border-[#F59E0B] shadow-sm font-bold'
                        : 'bg-[#0A0B0D] text-[#94A3B8] border-[#252832] hover:text-white hover:bg-[#1C1E26]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Rules */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Resolution Criteria &amp; Rules (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe exact conditions under which this market will resolve to YES or NO..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0D] border border-[#252832] focus:border-[#F59E0B] focus:outline-none text-white text-xs placeholder-[#64748B] transition-colors leading-relaxed"
              />
            </div>

            {/* Resolution Source */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Resolution Source / Authenticated Oracle <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={resolutionSource}
                onChange={(e) => setResolutionSource(e.target.value)}
                placeholder="e.g. Official Midnight Consensus & GitHub Release Milestone"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0D] border border-[#252832] focus:border-[#F59E0B] focus:outline-none text-white text-xs placeholder-[#64748B] transition-colors"
                required
              />
              <p className="text-[11px] text-[#64748B] mt-1.5">
                The verifiable public source or authority that will determine the final outcome.
              </p>
            </div>

            {/* Close Date and Time */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">
                Bidding Close Timestamp <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="datetime-local"
                value={closeDateTime}
                onChange={(e) => setCloseDateTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0B0D] border border-[#252832] focus:border-[#F59E0B] focus:outline-none text-white text-xs transition-colors [color-scheme:dark]"
                required
              />
              <p className="text-[11px] text-[#64748B] mt-1.5">
                After this timestamp, orders can no longer be placed and oracle resolution is enabled.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#FCA5A5] text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* In-Flight Progress */}
            {isSubmitting && (
              <div className="p-4 rounded-xl bg-[#1C1E26] border border-[#F59E0B]/40 text-xs space-y-2.5">
                <div className="flex items-center gap-2.5 text-[#F59E0B] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
                  <span>{progressStage}</span>
                </div>
                <div className="w-full bg-[#0A0B0D] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#F59E0B] h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all cursor-pointer ${
                  isValid && !isSubmitting
                    ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] active:scale-[0.98]'
                    : 'bg-[#1C1E26] text-[#64748B] border border-[#252832] cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Proving & Deploying...' : 'Deploy Market to Preprod →'}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-3 rounded-xl bg-[#1C1E26] hover:bg-[#252832] text-[#94A3B8] hover:text-white font-semibold text-xs border border-[#252832] transition-colors cursor-pointer"
              >
                {showPreview ? 'Hide Preview' : 'Preview Card'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview / Info Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-2xl bg-[#13151A] border border-[#252832] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Live Card Preview
            </h3>
            <p className="text-xs text-[#64748B]">
              How this market will appear in the prediction directory:
            </p>
            <div className="pointer-events-none">
              <MarketCard market={previewMarket} />
            </div>
          </div>

          {/* Privacy & Protocol Notes */}
          <div className="p-5 rounded-2xl bg-[#13151A] border border-[#252832] space-y-2.5 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <span className="text-[#F59E0B]">🛡️</span>
              <span>Confidential Trading Guarantees</span>
            </div>
            <p className="leading-relaxed">
              When this market is deployed, its question, resolution source, and closing timestamp are published to the Midnight Preprod ledger.
            </p>
            <p className="leading-relaxed">
              However, <strong className="text-white">all participant orders remain completely private</strong>. Bettor addresses, bet amounts, and chosen positions are shielded by client-side zero-knowledge proofs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMarketPage;
