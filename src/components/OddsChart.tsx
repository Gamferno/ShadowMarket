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
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 25;

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
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4">
      {/* Header with Title and Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Probability Trajectory</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              discloseOdds
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Hover to inspect aggregate odds at any point
          </div>
        </div>

        {/* Timeframe pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['24H', '7D', '30D', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot readout on hover or current */}
      {activePoint && (
        <div className="flex items-center justify-between bg-slate-900/60 p-2.5 px-4 rounded-xl border border-slate-800/70 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">{activePoint.label}</span>
            <span className="text-emerald-400 font-bold">YES: {activePoint.yesOdds}%</span>
            <span className="text-rose-400 font-bold">NO: {activePoint.noOdds}%</span>
          </div>
          <div className="text-slate-500 hidden sm:block">
            Vol: {activePoint.volume.toLocaleString()} units
          </div>
        </div>
      )}

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="oddsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
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
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area fill under curve */}
          {areaD && <path d={areaD} fill="url(#oddsGradient)" />}

          {/* YES Probability Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
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
              r={hoveredPoint?.timestamp === p.data.timestamp ? 5 : 3}
              fill={hoveredPoint?.timestamp === p.data.timestamp ? '#34d399' : '#06b6d4'}
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
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>Historical snapshots derived via zero-knowledge tally</span>
        <span className="font-mono text-cyan-400/80">MEV-Resistant Tally</span>
      </div>
    </div>
  );
};

export default OddsChart;
