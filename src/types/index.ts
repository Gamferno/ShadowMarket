export enum MarketState {
  Open = 0,
  Closed = 1,
  Resolved = 2,
  Cancelled = 3
}

export enum Outcome {
  None = 0,
  Yes = 1,
  No = 2,
  Inconclusive = 3
}

export type MarketCategory = 'All' | 'Crypto/Macro' | 'Politics' | 'Sports' | 'Local/Civic' | 'Custom';

export type MarketSortOption = 'Trending' | 'Closing Soon' | 'Newest' | 'Highest Volume';

export interface ShieldedBetReceipt {
  id: string;
  marketId: string;
  marketQuestion?: string;
  commitmentHex: string;
  amount: bigint;
  isYes: boolean;
  nonceHex: string;
  nonceBytes: Uint8Array;
  timestamp: number;
  claimed: boolean;
  claimedPayout?: bigint;
}

export interface ShadowMarketPrivateState {
  secretKey: Uint8Array;
  receipts: Map<string, ShieldedBetReceipt>;
  activeClaimReceiptId?: string;
  activeMarketId?: string;
}
