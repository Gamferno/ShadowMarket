import { MarketState, Outcome, type MarketCategory, type MarketSortOption } from '../types/index.ts';
import { INITIAL_SEEDED_MARKET, type MarketPublicData } from './contract.ts';
import { loadReceipts, loadCreatedMarkets, storeCreatedMarket, loadMarketOverrides, storeMarketOverride } from './storage.ts';

export { storeCreatedMarket, storeMarketOverride };

export interface OddsSnapshot {
  timestamp: number;
  label: string;
  yesOdds: number;
  noOdds: number;
  volume: number;
}

export const SEEDED_MARKETS: MarketPublicData[] = [
  INITIAL_SEEDED_MARKET,
  {
    id: '2',
    question: 'Will Cardano surpass 100M total transactions before Q4 2026?',
    category: 'Crypto/Macro',
    resolutionSource: 'Cardano Blockchain Ledger Explorer & On-chain Metrics',
    closeTimestamp: 1790726400n, // Sep 2026
    state: MarketState.Open,
    outcome: Outcome.None,
    totalVolume: 100000n,
    betCounter: 142n,
    escrowBalance: 100000n,
    isConfirmedOnChain: true
  },
  {
    id: '3',
    question: 'Will European Central Bank finalize digital euro wholesale framework in 2026?',
    category: 'Politics',
    resolutionSource: 'European Central Bank Governing Council Official Press Releases',
    closeTimestamp: 1798761600n, // Dec 2026
    state: MarketState.Open,
    outcome: Outcome.None,
    totalVolume: 100000n,
    betCounter: 89n,
    escrowBalance: 100000n,
    isConfirmedOnChain: true
  },
  {
    id: '4',
    question: 'Will an open-source AI model achieve top human benchmark score in 2026?',
    category: 'Custom',
    resolutionSource: 'LMSYS Chatbot Arena Leaderboard & SWE-bench Official Results',
    closeTimestamp: 1796083200n, // Nov 2026
    state: MarketState.Open,
    outcome: Outcome.None,
    totalVolume: 100000n,
    betCounter: 215n,
    escrowBalance: 100000n,
    isConfirmedOnChain: true
  }
];

export function getAllMarkets(): MarketPublicData[] {
  const receipts = Array.from(loadReceipts().values());
  const created = loadCreatedMarkets();
  const overrides = loadMarketOverrides();

  // Combine seeded markets with user-created markets (preventing duplicate IDs)
  const combined = [...SEEDED_MARKETS];
  for (const c of created) {
    if (!combined.some(m => m.id === c.id)) {
      combined.push(c);
    }
  }

  return combined.map(m => {
    const marketReceipts = receipts.filter(r => r.marketId === m.id);
    let userVolume = 0n;
    for (const r of marketReceipts) {
      userVolume += r.amount;
    }

    const override = overrides[m.id] || {};

    return {
      ...m,
      totalVolume: m.totalVolume + userVolume,
      betCounter: m.betCounter + BigInt(marketReceipts.length),
      ...override
    };
  });
}

export function getMarketById(id: string): MarketPublicData | undefined {
  const all = getAllMarkets();
  return all.find(m => m.id === id) || all.find(m => m.id === '1');
}

export function filterAndSortMarkets(
  markets: MarketPublicData[],
  query: string,
  category: MarketCategory,
  sortOption: MarketSortOption
): MarketPublicData[] {
  let filtered = [...markets];

  // Search filter
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      m => m.question.toLowerCase().includes(q) || m.resolutionSource.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category !== 'All') {
    filtered = filtered.filter(m => m.category === category);
  }

  // Sort
  switch (sortOption) {
    case 'Trending':
      filtered.sort((a, b) => Number(b.betCounter - a.betCounter));
      break;
    case 'Highest Volume':
      filtered.sort((a, b) => Number(b.totalVolume - a.totalVolume));
      break;
    case 'Closing Soon':
      filtered.sort((a, b) => Number(a.closeTimestamp - b.closeTimestamp));
      break;
    case 'Newest':
    default:
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
      break;
  }

  return filtered;
}

export function generateHistoricalOdds(
  marketId: string,
  timeframe: '24H' | '7D' | '30D' | 'ALL' = '7D'
): OddsSnapshot[] {
  const market = getMarketById(marketId) || SEEDED_MARKETS[0];
  const currentYesOdds = 50;

  const pointsCount = timeframe === '24H' ? 12 : timeframe === '7D' ? 14 : timeframe === '30D' ? 20 : 25;
  const now = Date.now();
  const timeSpanMs =
    timeframe === '24H'
      ? 24 * 3600 * 1000
      : timeframe === '7D'
      ? 7 * 86400 * 1000
      : timeframe === '30D'
      ? 30 * 86400 * 1000
      : 90 * 86400 * 1000;

  const stepMs = timeSpanMs / pointsCount;
  const snapshots: OddsSnapshot[] = [];

  let curYes = 50;
  for (let i = pointsCount; i >= 1; i--) {
    const t = now - i * stepMs;
    const progress = (pointsCount - i) / pointsCount;
    const target = 50 + (currentYesOdds - 50) * progress;
    const noise = Math.sin(i * 1.5) * 4;
    curYes = Math.max(5, Math.min(95, Math.round(target + noise)));

    const date = new Date(t);
    const label =
      timeframe === '24H'
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    snapshots.push({
      timestamp: t,
      label,
      yesOdds: curYes,
      noOdds: 100 - curYes,
      volume: Math.round(Number(market.totalVolume) * (0.3 + 0.7 * progress))
    });
  }

  snapshots.push({
    timestamp: now,
    label: 'Now',
    yesOdds: currentYesOdds,
    noOdds: 100 - currentYesOdds,
    volume: Number(market.totalVolume)
  });

  return snapshots;
}
