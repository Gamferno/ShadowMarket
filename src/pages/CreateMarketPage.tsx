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
    totalStakeYes: 0n,
    totalStakeNo: 0n,
    totalVolume: 0n,
    betCounter: 0n
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
    setProgressStage('Initializing market deployment...');

    try {
      const providers = await wallet.getProviders();
      const result = await executeCreateMarket(providers, {
        question: question.trim(),
        category,
        resolutionSource: resolutionSource.trim(),
        closeTimestamp: closeTimestampSeconds,
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Link
            to="/markets"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            ← Back to Markets
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-slate-400">Permissionless Market Creation</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-slate-100 flex items-center gap-3">
          Create Prediction Market
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
            On-Chain Preprod
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
          Deploy a new confidential binary prediction market onto Midnight Network. Bettors will wager with 100%
          client-side shielded Zero-Knowledge proofs while public odds update automatically.
        </p>
      </div>

      {/* Success Notification Modal */}
      {successResult && (
        <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 backdrop-blur-md space-y-4 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center gap-3 text-cyan-400 font-bold text-lg">
            <span className="text-2xl">🎉</span>
            Market Deployed Successfully to Midnight Preprod!
          </div>
          <p className="text-xs text-slate-300">
            Your market has been registered on-chain via the <code className="text-cyan-300">createMarket</code> circuit.
            Bettors can now place shielded YES/NO stakes.
          </p>
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Market ID:</span>
              <span className="text-cyan-300 font-bold">#{successResult.id}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-slate-500">Transaction Hash:</span>
              <a
                href={`https://preprod.midnightexplorer.com/transactions/0x${successResult.txHash.replace(/^0x/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline truncate max-w-xs font-mono inline-flex items-center gap-1"
                title="View on Midnight Explorer"
              >
                <span>{successResult.txHash}</span>
                <span>↗</span>
              </a>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/markets/${successResult.id}`)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
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
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Create Another Market
            </button>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleCreateMarket} className="space-y-6 bg-slate-900/60 p-6 sm:p-8 rounded-2xl border border-slate-800">
            {/* Question */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Market Question <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Will Midnight launch native private tokens before December 2026?"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 text-sm placeholder:text-slate-600 transition-colors"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Must be an unambiguous binary proposition resolving strictly to YES or NO.
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Category <span className="text-cyan-400">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      category === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / Rules */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Resolution Criteria & Rules (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe exact conditions under which this market will resolve to YES or NO..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 text-sm placeholder:text-slate-600 transition-colors"
              />
            </div>

            {/* Resolution Source */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Resolution Source / Oracle <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                value={resolutionSource}
                onChange={(e) => setResolutionSource(e.target.value)}
                placeholder="e.g. Official Midnight Consensus & GitHub Release Milestone"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 text-sm placeholder:text-slate-600 transition-colors"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                The verifiable public source or authority that will determine the final outcome.
              </p>
            </div>

            {/* Close Date and Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Bidding Close Date & Time <span className="text-cyan-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={closeDateTime}
                onChange={(e) => setCloseDateTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-slate-100 text-sm transition-colors [color-scheme:dark]"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                After this timestamp, bets can no longer be placed and the market can be resolved.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* In-Flight Progress */}
            {isSubmitting && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <span>{progressStage}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-2/3 animate-pulse" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className={`flex-1 py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                  isValid && !isSubmitting
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Deploying On-Chain...' : 'Deploy Market to Preprod'}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview / Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Card Preview
            </h3>
            <p className="text-xs text-slate-500">
              This is how your market card will look in the public catalog:
            </p>
            <div className="pointer-events-none">
              <MarketCard market={previewMarket} />
            </div>
          </div>

          {/* Privacy & Protocol Notes */}
          <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-900/50 space-y-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span>🛡️</span>
              <span>Confidentiality Model</span>
            </div>
            <p>
              When this market is deployed, its metadata, initial odds, and aggregate liquidity are publicly readable on the
              Midnight Preprod ledger.
            </p>
            <p>
              However, <strong>all subsequent participant wagers are 100% shielded</strong>. Bettor addresses, bet amounts,
              and side choices are never recorded in plaintext on-chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
