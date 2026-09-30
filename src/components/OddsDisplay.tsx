import React from 'react';
import type { MarketPublicData } from '../utils/contract.ts';
import OddsChart from './OddsChart.tsx';

interface OddsDisplayProps {
  market: MarketPublicData;
}

export const OddsDisplay: React.FC<OddsDisplayProps> = ({ market }) => {
  const yesPercent = 50;
  const noPercent = 50;

  return (
    <div className="bg-[#13151A] border border-[#252832] rounded-xl p-5 space-y-4 font-sans">
      {/* Header Odds Hero */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#252832] pb-4">
        <div>
          <div className="text-xs text-[#94A3B8] font-medium mb-1">Current Probability</div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-[#0EA5E9] font-display tabular-nums">
              {yesPercent}%
            </span>
            <span className="text-lg font-bold text-white">chance</span>
            <span className="text-xs font-semibold text-[#0EA5E9] bg-[#0EA5E9]/10 px-2 py-0.5 rounded">
              0% Today
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium tabular-nums text-[#94A3B8]">
          <div>
            <span>YES: </span>
            <strong className="text-[#0EA5E9]">50¢</strong>
          </div>
          <div>
            <span>NO: </span>
            <strong className="text-[#F43F5E]">{noPercent}¢</strong>
          </div>
          <div>
            <span>Vol: </span>
            <strong className="text-white">{market.totalVolume.toString()} DUST</strong>
          </div>
        </div>
      </div>

      {/* Embedded Probability Chart */}
      <div>
        <OddsChart marketId={market.id} />
      </div>
    </div>
  );
};

export default OddsDisplay;
