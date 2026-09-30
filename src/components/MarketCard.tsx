import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { MarketPublicData } from '../utils/contract.ts';
import { formatDust } from '../utils/formatters.ts';

interface MarketCardProps {
  market: MarketPublicData;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const navigate = useNavigate();

  // For this prototype, binary markets trade at 50/50 initial parity or calculated
  const yesPercent = 50;
  const noPercent = 50;

  const formatCloseDate = (ts: bigint | number) => {
    try {
      const ms = typeof ts === 'bigint' ? Number(ts) * 1000 : ts * 1000;
      return new Date(ms).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Dec 31';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'crypto/macro':
      case 'crypto':
        return '₿';
      case 'politics':
        return '🏛️';
      case 'sports':
        return '⚽';
      case 'local/civic':
        return '🗳️';
      default:
        return '⚡';
    }
  };

  const handleOutcomeClick = (e: React.MouseEvent, outcome: 'yes' | 'no') => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/markets/${market.id}?outcome=${outcome}`);
  };

  return (
    <article className="bg-[#13151A] border border-[#252832] hover:border-[#3E4456] hover:shadow-2xl hover:-translate-y-1 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 group relative font-sans">
      <div>
        {/* 1. Category & Expiration Row */}
        <div className="flex items-center justify-between text-xs text-[#94A3B8] mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#1C1E26] border border-[#252832] flex items-center justify-center text-xs">
              {getCategoryIcon(market.category)}
            </span>
            <span className="font-semibold text-[#94A3B8] uppercase text-[11px] tracking-wide">
              {market.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#64748B]">Resolves {formatCloseDate(market.closeTimestamp)}</span>
          </div>
        </div>

        {/* 2. Bold Market Question */}
        <Link to={`/markets/${market.id}`} className="block group/title">
          <h3 className="font-bold text-white text-[15px] leading-snug line-clamp-2 group-hover/title:text-[#F59E0B] transition-colors min-h-[42px]">
            {market.question}
          </h3>
        </Link>

        {/* 3. Probability Indicator Bar: Blue (YES) and Red (NO) */}
        <div className="mt-3.5 mb-3">
          <div className="flex justify-between text-xs font-semibold mb-1.5 tabular-nums">
            <span className="text-[#0EA5E9]">{yesPercent}% YES</span>
            <span className="text-[#F43F5E]">{noPercent}% NO</span>
          </div>
          <div className="w-full h-1.5 bg-[#0A0B0D] rounded-full overflow-hidden flex border border-[#252832]">
            <div className="bg-[#0EA5E9] h-full rounded-l-full transition-all duration-500" style={{ width: `${yesPercent}%` }} />
            <div className="bg-[#F43F5E] h-full rounded-r-full transition-all duration-500" style={{ width: `${noPercent}%` }} />
          </div>
        </div>

        {/* 4. The Iconic YES / NO Action Buttons (Blue & Red) */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* YES Button (Blue) */}
          <button
            type="button"
            onClick={(e) => handleOutcomeClick(e, 'yes')}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#0EA5E9]/12 hover:bg-[#0EA5E9]/22 border border-[#0EA5E9]/30 hover:border-[#0EA5E9] transition-all active:scale-[0.98] group/yes cursor-pointer shadow-sm"
          >
            <span className="text-xs font-bold text-[#0EA5E9]">Yes</span>
            <span className="text-xs font-bold text-[#0EA5E9] tabular-nums">{yesPercent}¢</span>
          </button>

          {/* NO Button (Red) */}
          <button
            type="button"
            onClick={(e) => handleOutcomeClick(e, 'no')}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#F43F5E]/12 hover:bg-[#F43F5E]/22 border border-[#F43F5E]/30 hover:border-[#F43F5E] transition-all active:scale-[0.98] group/no cursor-pointer shadow-sm"
          >
            <span className="text-xs font-bold text-[#F43F5E]">No</span>
            <span className="text-xs font-bold text-[#F43F5E] tabular-nums">{noPercent}¢</span>
          </button>
        </div>
      </div>

      {/* 5. Card Footer */}
      <div className="mt-4 pt-3 border-t border-[#252832] flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="font-semibold text-white tabular-nums">{formatDust(market.totalVolume)} tDUST</span>
          <span className="text-[11px] text-[#64748B]">Vol</span>
        </div>

        <Link
          to={`/markets/${market.id}`}
          className="text-xs text-[#F59E0B] hover:text-[#D97706] font-semibold flex items-center gap-1"
        >
          <span>Trade</span>
          <span>→</span>
        </Link>
      </div>
    </article>
  );
};

export default MarketCard;
