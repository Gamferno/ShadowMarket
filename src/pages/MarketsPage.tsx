import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MarketCard from '../components/MarketCard.tsx';
import { getAllMarkets, filterAndSortMarkets } from '../utils/markets.ts';
import type { MarketCategory, MarketSortOption } from '../types/index.ts';

const CATEGORIES: MarketCategory[] = [
  'All',
  'Crypto/Macro',
  'Politics',
  'Sports',
  'Local/Civic',
  'Custom'
];

const SORT_OPTIONS: { label: string; value: MarketSortOption; icon: string }[] = [
  { label: 'Trending', value: 'Trending', icon: '🔥' },
  { label: 'Closing Soon', value: 'Closing Soon', icon: '⏱️' },
  { label: 'Newest', value: 'Newest', icon: '✨' },
  { label: 'Highest Volume', value: 'Highest Volume', icon: '📊' }
];

export const MarketsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');
  const [selectedSort, setSelectedSort] = useState<MarketSortOption>('Trending');

  const allMarkets = useMemo(() => getAllMarkets(), []);

  const filteredMarkets = useMemo(() => {
    return filterAndSortMarkets(allMarkets, searchQuery, selectedCategory, selectedSort);
  }, [allMarkets, searchQuery, selectedCategory, selectedSort]);

  return (
    <div className="space-y-6 py-2 font-sans">
      {/* 1. Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252832] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#13151A] border border-[#252832] text-[11px] text-[#FBBF24] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
              Midnight Preprod
            </span>
            <span className="text-xs text-[#64748B]">•</span>
            <span className="text-xs text-[#94A3B8]">Confidential Liquidity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prediction Markets Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Trade confidential positions with on-chain settlement. Stakes, positions, and user identities remain privately shielded.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/create"
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <span>+</span>
            <span>Create Market</span>
          </Link>
          <span className="px-3 py-2 bg-[#13151A] border border-[#252832] text-xs tabular-nums font-medium text-[#94A3B8] rounded-lg hidden sm:inline-block">
            {filteredMarkets.length} {filteredMarkets.length === 1 ? 'Market' : 'Markets'}
          </span>
        </div>
      </div>

      {/* 2. Filter Strip */}
      <div className="space-y-3">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
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

        {/* Sub-Filter Controls: Search + Sort Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedSort(opt.value)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedSort === opt.value
                    ? 'bg-[#1C1E26] text-white border border-[#252832]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1C1E26]'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px] sm:min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by title or source..."
              className="w-full bg-[#13151A] border border-[#252832] focus:border-[#F59E0B] rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-[#64748B] focus:outline-none transition-colors"
            />
            <span className="absolute left-2.5 top-2 text-[#64748B] text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#64748B] hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Markets Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMarkets.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#13151A] border border-[#252832] rounded-xl space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="font-bold text-white text-base">No markets found</h3>
          <p className="text-xs text-[#94A3B8]">
            No active prediction markets match your filter or search query.
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-[#1C1E26] hover:bg-[#252832] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <Link
              to="/create"
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0B0D] font-bold text-xs uppercase rounded-lg shadow transition-all"
            >
              Create New Market →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketsPage;
