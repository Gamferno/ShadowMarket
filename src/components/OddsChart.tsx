import React, { useState, useMemo } from 'react';
import { generateHistoricalOdds, type OddsSnapshot } from '../utils/markets.ts';

interface OddsChartProps {
  marketId: string;
}

export const OddsChart: React.FC<OddsChartProps> = ({ marketId }) => {
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D' | 'ALL'>('7D');
  const [hoveredPoint, setHoveredPoint] = useState<OddsSnapshot | null>(null);

  const data = useMemo(() => {
    return generateHistoricalOdds(marketId, timeframe);
  }, [marketId, timeframe]);

  // SVG dimensions
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 20;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Build SVG path points
  const points = useMemo(() => {
    if (data.length === 0) return [];
    const minVal = 0;
    const maxVal = 100;

    return data.map((d, index) => {
      const x = paddingX + (index / (data.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - ((d.yesOdds - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y, data: d };
    });
  }, [data, chartWidth, chartHeight, paddingX, paddingY]);

  // SVG path strings
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = paddingY + chartHeight;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, paddingY, chartHeight]);

  const activePoint = hoveredPoint || data[data.length - 1];

  return (
    <div className="space-y-3 font-sans">
      {/* Top Controls: Readout and Timeframe selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Active hovered point snapshot (Blue and Red) */}
        <div className="text-xs">
          {activePoint ? (
            <div className="flex items-center gap-3">
              <span className="text-[#94A3B8]">{activePoint.label}</span>
              <span className="text-[#0EA5E9] font-bold tabular-nums">YES: {activePoint.yesOdds}%</span>
              <span className="text-[#F43F5E] font-bold tabular-nums">NO: {activePoint.noOdds}%</span>
            </div>
          ) : (
            <span className="text-[#64748B]">Hover over chart to inspect historical odds</span>
          )}
        </div>

        {/* Timeframe Pills */}
        <div className="flex items-center gap-1 bg-[#0A0B0D] p-1 rounded-lg border border-[#252832] self-start sm:self-auto">
          {(['24H', '7D', '30D', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#1C1E26] text-white shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tf === '24H' ? '1D' : tf === '7D' ? '1W' : tf === '30D' ? '1M' : 'ALL'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Probability Chart (Blue and Red) */}
      <div className="relative w-full overflow-hidden bg-[#0A0B0D] rounded-lg border border-[#252832] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="polyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (25%, 50%, 75%) */}
          {[25, 50, 75].map((val) => {
            const y = paddingY + chartHeight - (val / 100) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#252832"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area fill under curve (Blue) */}
          {areaD && <path d={areaD} fill="url(#polyGradient)" />}

          {/* YES Probability Line (Blue) */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive touch/hover points */}
          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.timestamp === p.data.timestamp ? 5 : 2.5}
              fill="#0EA5E9"
              stroke="#0A0B0D"
              strokeWidth="1.5"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p.data)}
            />
          ))}

          {/* Vertical highlight line for hovered point */}
          {hoveredPoint && (
            <line
              x1={points.find((p) => p.data.timestamp === hoveredPoint.timestamp)?.x || 0}
              y1={paddingY}
              x2={points.find((p) => p.data.timestamp === hoveredPoint.timestamp)?.x || 0}
              y2={paddingY + chartHeight}
              stroke="#0EA5E9"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
        <span>Aggregated on-chain volume trajectory</span>
        <span className="text-[#FBBF24] flex items-center gap-1">
          <span>🔒</span>
          <span>Zero-Knowledge Preserved Tally</span>
        </span>
      </div>
    </div>
  );
};

export default OddsChart;
