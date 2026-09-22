import React from 'react';
import { Link } from 'react-router-dom';
import type { MarketPublicData } from '../utils/contract.ts';

interface MarketCardProps {
  market: MarketPublicData;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const total = market.totalStakeYes + market.totalStakeNo;
  let yesPercent = 50;
  let noPercent = 50;

  if (total > 0n) {
    yesPercent = Number((market.totalStakeYes * 100n) / total);
    noPercent = 100 - yesPercent;
  }

  const formatCloseDate = (ts: bigint | number) => {
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

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg hover:shadow-cyan-500/5 transition-all flex flex-col justify-between space-y-4 group">
      {/* Top Badges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {market.category}
            </span>
            {market.id === '1' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                Preprod Live
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Open
          </span>
        </div>

        {/* Question Title */}
        <Link to={`/markets/${market.id}`} className="block group-hover:text-cyan-300 transition-colors">
          <h3 className="font-bold text-slate-100 text-base leading-snug line-clamp-2">
            {market.question}
          </h3>
        </Link>
      </div>

      {/* Split Odds Progress */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 font-bold">YES {yesPercent}%</span>
          <span className="text-rose-400 font-bold">NO {noPercent}%</span>
        </div>

        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
          <div
            style={{ width: `${yesPercent}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-l-full transition-all duration-300"
          />
          <div
            style={{ width: `${noPercent}%` }}
            className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-r-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="text-slate-500 space-y-0.5">
          <div className="font-mono text-slate-300 text-xs">
            {market.totalVolume.toString()} <span className="text-slate-500 text-[10px]">units vol</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Closes {formatCloseDate(market.closeTimestamp)}
          </div>
        </div>

        <Link
          to={`/markets/${market.id}`}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 hover:border-transparent transition-all shadow cursor-pointer"
        >
          View Market →
        </Link>
      </div>
    </div>
  );
};

export default MarketCard;
