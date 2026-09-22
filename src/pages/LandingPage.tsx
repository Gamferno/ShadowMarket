import React from 'react';
import { Link } from 'react-router-dom';
import MarketCard from '../components/MarketCard.tsx';
import { getMarketById } from '../utils/markets.ts';
import preprodConfig from '../config/preprod-deployment.json';

export const LandingPage: React.FC = () => {
  const featuredMarket = getMarketById('1');

  return (
    <div className="space-y-16 animate-fadeIn py-4">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Network & Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-lg">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Smart Contract Live on Midnight Preprod</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-cyan-400">Block #{preprodConfig.deployedAtBlock}</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-tight">
          Privacy-Native Prediction Markets on{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Midnight
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Bet on real-world outcomes with fully shielded individual positions and publicly verifiable aggregate odds. Combining Polymarket product-market fit with Zero-Knowledge guarantees.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/markets"
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-cyan-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Explore Markets</span>
            <span>→</span>
          </Link>
          <Link
            to="/about"
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-800 transition-all cursor-pointer"
          >
            How Privacy Works
          </Link>
        </div>

        {/* Key Metrics Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-2xl font-black text-cyan-400 font-mono">100%</div>
            <div className="text-[11px] text-slate-400">Shielded Stakes</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-2xl font-black text-purple-400 font-mono">0</div>
            <div className="text-[11px] text-slate-400">MEV / Copy-Trading</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-2xl font-black text-emerald-400 font-mono">PLONK</div>
            <div className="text-[11px] text-slate-400">ZK-SNARK Proofs</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-2xl font-black text-amber-400 font-mono">Preprod</div>
            <div className="text-[11px] text-slate-400">Live Network</div>
          </div>
        </div>
      </section>

      {/* 3-Step Privacy Architecture Section */}
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            How ShadowMarket Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Three cryptographic steps ensuring complete bettor confidentiality while maintaining verifiable on-chain truth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center font-black text-cyan-300 text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-100 text-base">Shielded Bet Placement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You choose YES or NO and enter your stake. Your local machine generates a Zero-Knowledge commitment using Midnight's proof server. Neither your position nor your wallet identity is ever published.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 p-2 rounded border border-cyan-900/60">
              Circuit: placeShieldedBet
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center font-black text-purple-300 text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-100 text-base">Public Aggregate Odds</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The smart contract verifies that public odds accurately reflect all hidden bets using the Compact ZK tally proof without opening any individual bet.
            </p>
            <div className="text-[11px] font-mono text-purple-400 bg-purple-950/40 p-2 rounded border border-purple-900/60">
              Circuit: discloseOdds
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center font-black text-emerald-300 text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-100 text-base">Anonymous Claim Payout</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When the market resolves, winning bettors claim their proportional payout by proving receipt ownership and burning a unique nullifier to prevent double-spending without revealing which bet is being claimed.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/60">
              Circuit: claimPayout
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Market Section */}
      {featuredMarket && (
        <section className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-200">Featured On-Chain Market</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                Preprod Contract
              </span>
            </div>
            <Link to="/markets" className="text-xs text-cyan-400 hover:underline">
              View All Markets →
            </Link>
          </div>

          <div className="w-full">
            <MarketCard market={featuredMarket} />
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
