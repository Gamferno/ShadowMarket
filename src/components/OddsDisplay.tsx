import React, { useState } from 'react';
import type { MarketPublicData } from '../utils/contract.ts';
import OddsChart from './OddsChart.tsx';

interface OddsDisplayProps {
  market: MarketPublicData;
}

export const OddsDisplay: React.FC<OddsDisplayProps> = ({ market }) => {
  const [showChart, setShowChart] = useState<boolean>(true);

  const totalYes = market.totalStakeYes;
  const totalNo = market.totalStakeNo;
  const total = totalYes + totalNo;

  let yesPercent = 50;
  let noPercent = 50;

  if (total > 0n) {
    yesPercent = Number((totalYes * 100n) / total);
    noPercent = 100 - yesPercent;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-300">Public Aggregate Odds</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            On-Chain
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-400">
            Total Volume: <span className="text-slate-100 font-bold">{market.totalVolume.toString()}</span> units
          </div>
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-900 transition-colors cursor-pointer"
          >
            {showChart ? 'Hide Chart ▴' : 'Show Chart ▾'}
          </button>
        </div>
      </div>

      {/* Percentage Numbers */}
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <span>▲</span>
            <span>YES</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-mono tracking-tight">
            {yesPercent}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {totalYes.toString()} units
          </div>
        </div>

        <div className="text-right space-y-0.5">
          <div className="flex items-center justify-end gap-1.5 text-rose-400 text-xs font-bold">
            <span>▼</span>
            <span>NO</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-rose-300 font-mono tracking-tight">
            {noPercent}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {totalNo.toString()} units
          </div>
        </div>
      </div>

      {/* Split Progress Bar */}
      <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
        <div
          style={{ width: `${yesPercent}%` }}
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-l-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
        />
        <div
          style={{ width: `${noPercent}%` }}
          className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-r-full transition-all duration-500 shadow-sm shadow-rose-500/50"
        />
      </div>

      {/* Embedded Odds Chart */}
      {showChart && (
        <div className="pt-2 animate-fadeIn">
          <OddsChart marketId={market.id} />
        </div>
      )}

      {/* Footer / Bets count */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Verified by ZK Tally Proof</span>
        <span className="font-mono">{market.betCounter.toString()} Shielded Positions</span>
      </div>
    </div>
  );
};

export default OddsDisplay;
