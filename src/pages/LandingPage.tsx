import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MarketCard from '../components/MarketCard.tsx';
import { getAllMarkets } from '../utils/markets.ts';

export const LandingPage: React.FC = () => {
  const allMarkets = getAllMarkets();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<'trending' | 'volume' | 'newest'>('trending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shieldedOnly, setShieldedOnly] = useState<boolean>(false);

  const categories = ['All', 'Politics', 'Crypto', 'Tech', 'Pop Culture', 'Elections', 'Business'];

  const filteredMarkets = allMarkets.filter((m) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      m.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 py-2 font-sans">
      {/* 1. Featured Breaking Market Hero Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#161820] to-[#121316] border border-[#2D313E] p-6 sm:p-7 shadow-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Breaking Question & Sentiment Bar */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                Featured Resolution
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1C1E26] text-[#94A3B8] border border-[#252832]">
                Macro / Interest Rates
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                100% Escrow Collateralized
              </span>
            </div>

            <Link to="/markets/1" className="block group">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-[#F59E0B] transition-colors leading-tight">
                Will the US Federal Reserve cut benchmark interest rates by 25+ bps in the upcoming FOMC meeting?
              </h2>
            </Link>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
              Settlement determined via official Board of Governors Federal Reserve statement. High-conviction market consensus currently favors an active easing cycle.
            </p>

            {/* High-Contrast Dual Probability Bar */}
            <div className="space-y-1.5 pt-1 max-w-xl">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
                  <span className="text-white">Yes 74%</span>
                  <span className="text-[#64748B] tabular-nums font-normal">($0.74)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B] tabular-nums font-normal">($0.26)</span>
                  <span className="text-white">No 26%</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                </div>
              </div>

              {/* Visual Track */}
              <div className="h-2.5 w-full bg-[#0A0B0D] rounded-full p-0.5 flex overflow-hidden border border-[#252832]">
                <div
                  className="h-full bg-[#0EA5E9] rounded-l-full transition-all duration-700 shadow-[0_0_12px_rgba(14,165,233,0.35)]"
                  style={{ width: '74%' }}
                />
                <div className="w-[1px] bg-[#0A0B0D]" />
                <div
                  className="h-full bg-[#F43F5E] rounded-r-full transition-all duration-700 shadow-[0_0_12px_rgba(244,63,94,0.35)]"
                  style={{ width: '26%' }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                <span>Verified Consensus Oracle</span>
                <span>Resolves Nov 15</span>
              </div>
            </div>
          </div>

          {/* Right Column: Instant Action Buttons */}
          <div className="lg:col-span-4 bg-[#13151A] border border-[#252832] rounded-xl p-4 shadow-xl flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between border-b border-[#252832] pb-2 text-xs">
              <span className="font-bold text-white">Instant Order Slip</span>
              <span className="text-emerald-400 font-medium">Zero Slippage</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/markets/1?outcome=yes"
                className="py-3 px-4 rounded-lg bg-[#0EA5E9]/12 hover:bg-[#0EA5E9]/22 border border-[#0EA5E9]/35 hover:border-[#0EA5E9] text-[#0EA5E9] text-center transition-all group"
              >
                <div className="text-[11px] text-[#94A3B8] font-medium mb-0.5">Buy YES</div>
                <div className="text-lg font-bold text-[#0EA5E9] tabular-nums">74¢</div>
              </Link>

              <Link
                to="/markets/1?outcome=no"
                className="py-3 px-4 rounded-lg bg-[#F43F5E]/12 hover:bg-[#F43F5E]/22 border border-[#F43F5E]/35 hover:border-[#F43F5E] text-[#F43F5E] text-center transition-all group"
              >
                <div className="text-[11px] text-[#94A3B8] font-medium mb-0.5">Buy NO</div>
                <div className="text-lg font-bold text-[#F43F5E] tabular-nums">26¢</div>
              </Link>
            </div>

            <div className="text-center pt-1">
              <Link
                to="/markets/1"
                className="text-xs text-[#F59E0B] hover:text-[#D97706] font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>View Full Market Chart &amp; Depth</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#F59E0B]/5 to-transparent pointer-events-none" />
      </section>

      {/* 2. Category Navigation Pill Bar */}
      <section className="space-y-4">
        {/* Horizontal Category Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#252832] pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#F59E0B] text-[#0A0B0D] shadow-md font-bold'
                  : 'bg-[#13151A] border border-[#252832] text-[#94A3B8] hover:text-white hover:bg-[#1C1E26]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Sub-Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Sort Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedSort('trending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedSort === 'trending'
                  ? 'bg-[#1C1E26] text-white border border-[#252832]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>🔥</span>
              <span>Trending</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSort('volume')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedSort === 'volume'
                  ? 'bg-[#1C1E26] text-white border border-[#252832]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>📊</span>
              <span>High Volume</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSort('newest')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedSort === 'newest'
                  ? 'bg-[#1C1E26] text-white border border-[#252832]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>✨</span>
              <span>New</span>
            </button>
          </div>

          {/* Right Controls: ZK Shield toggle & Search */}
          <div className="flex items-center gap-3">
            {/* ZK Shielded Only Toggle */}
            <button
              type="button"
              onClick={() => setShieldedOnly(!shieldedOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                shieldedOnly
                  ? 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/40'
                  : 'bg-[#13151A] text-[#94A3B8] border-[#252832] hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span>ZK Shielded</span>
            </button>

            {/* In-page filter search input */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter markets..."
                className="w-full bg-[#13151A] border border-[#252832] focus:border-[#F59E0B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors"
              />
              <span className="absolute left-2.5 top-2 text-[#64748B] text-xs">
                🔍
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Markets Grid */}
      <section>
        {filteredMarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#13151A] border border-[#252832] rounded-xl space-y-3">
            <div className="text-3xl">🔍</div>
            <h3 className="font-bold text-white text-base">No markets found</h3>
            <p className="text-xs text-[#94A3B8]">
              No prediction markets match your filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#1C1E26] hover:bg-[#252832] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 4. Why Shielded Markets Feature Grid */}
      <section className="border-t border-[#252832] pt-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Why Shielded Prediction Markets?</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            How Midnight Network zero-knowledge cryptography solves the structural flaws of transparent prediction platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#13151A] border border-[#252832] rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold text-sm">
              🛡️
            </div>
            <h3 className="font-bold text-white text-sm">Zero Front-Running &amp; MEV</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Transparent mempools on Ethereum and Polygon allow bots to front-run large wagers. On Midnight, bets remain inside private zero-knowledge commitments.
            </p>
          </div>

          <div className="bg-[#13151A] border border-[#252832] rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold text-sm">
              🔒
            </div>
            <h3 className="font-bold text-white text-sm">Private Bet Amounts &amp; Choices</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Bettor addresses, chosen outcomes, and stake sizes are never recorded in plaintext on-chain. Only aggregate odds are published through the ZK tally circuit.
            </p>
          </div>

          <div className="bg-[#13151A] border border-[#252832] rounded-xl p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <h3 className="font-bold text-white text-sm">Anonymous Payout Claims</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Redeem winning positions anonymously using cryptographic nullifiers. Anyone can verify your right to claim without knowing which original bet was yours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
