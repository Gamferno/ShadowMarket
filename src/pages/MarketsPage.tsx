import React, { useState, useMemo } from 'react';
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

const SORT_OPTIONS: MarketSortOption[] = [
  'Trending',
  'Closing Soon',
  'Newest',
  'Highest Volume'
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
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Prediction Markets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and take shielded positions on active outcomes. All individual bets remain encrypted via Zero-Knowledge proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 rounded-xl">
            {filteredMarkets.length} {filteredMarkets.length === 1 ? 'Market' : 'Markets'} Active
          </span>
        </div>
      </div>

      {/* Search, Categories & Sort Controls */}
      <div className="space-y-4">
        {/* Top Controls: Search Bar + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-3 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by title, question or oracle source..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Sort:</label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as MarketSortOption)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-transparent shadow-md shadow-cyan-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
          <div className="text-4xl">🔍</div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-200 text-base">No markets found</h3>
            <p className="text-xs text-slate-400">
              No active prediction markets match your query or selected category filter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default MarketsPage;
