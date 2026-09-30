import type { ShieldedBetReceipt, ShadowMarketPrivateState } from '../types/index.ts';
import { hexToBytes } from './formatters.ts';

let memoryReceipts = new Map<string, ShieldedBetReceipt>();

const STORAGE_KEY = 'shadowmarket_shielded_receipts_v1';

export function saveReceipts(receipts: Map<string, ShieldedBetReceipt>): void {
  memoryReceipts = new Map(receipts);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const serializable = Array.from(receipts.values()).map((r) => ({
        ...r,
        amount: r.amount.toString(),
        claimedPayout: r.claimedPayout ? r.claimedPayout.toString() : undefined,
        nonceBytes: Array.from(r.nonceBytes)
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch (err) {
      console.warn('Failed to persist receipts to localStorage:', err);
    }
  }
}

export type BetReceipt = ShieldedBetReceipt;

export function saveReceipt(receipt: ShieldedBetReceipt): void {
  const receipts = loadReceipts();
  receipts.set(receipt.id, receipt);
  saveReceipts(receipts);
}

export function loadReceipts(): Map<string, ShieldedBetReceipt> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const map = new Map<string, ShieldedBetReceipt>();
        for (const item of parsed) {
          map.set(item.id, {
            ...item,
            amount: BigInt(item.amount),
            claimedPayout: item.claimedPayout ? BigInt(item.claimedPayout) : undefined,
            nonceBytes: new Uint8Array(item.nonceBytes || hexToBytes(item.nonceHex))
          });
        }
        memoryReceipts = map;
        return new Map(map);
      }
    } catch (err) {
      console.warn('Failed to parse receipts from localStorage:', err);
    }
  }
  return new Map(memoryReceipts);
}

export function clearMemoryStorage(): void {
  memoryReceipts.clear();
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function createInitialPrivateState(
  secretKey: Uint8Array,
  receipts: Map<string, ShieldedBetReceipt> = loadReceipts()
): ShadowMarketPrivateState {
  return {
    secretKey,
    receipts
  };
}

export function markReceiptClaimed(receiptId: string, payoutAmount: bigint): void {
  const receipts = loadReceipts();
  const receipt = receipts.get(receiptId);
  if (receipt) {
    receipt.claimed = true;
    receipt.claimedPayout = payoutAmount;
    receipts.set(receiptId, receipt);
    saveReceipts(receipts);
  }
}

const CREATED_MARKETS_KEY = 'shadowmarket_created_markets_v1';
const MARKET_OVERRIDES_KEY = 'shadowmarket_overrides_v1';

export function storeCreatedMarket(market: any): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existing = loadCreatedMarkets();
      const serializable = {
        ...market,
        closeTimestamp: market.closeTimestamp.toString(),
        totalVolume: market.totalVolume.toString(),
        betCounter: market.betCounter.toString(),
        escrowBalance: (market.escrowBalance || 0n).toString()
      };
      existing.push(serializable);
      window.localStorage.setItem(CREATED_MARKETS_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('Failed to save created market:', err);
    }
  }
}

export function loadCreatedMarkets(): any[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(CREATED_MARKETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.map((m: any) => ({
          ...m,
          closeTimestamp: BigInt(m.closeTimestamp),
          totalVolume: BigInt(m.totalVolume || 0),
          betCounter: BigInt(m.betCounter || 0),
          escrowBalance: BigInt(m.escrowBalance || 0)
        }));
      }
    } catch (err) {
      console.warn('Failed to load created markets:', err);
    }
  }
  return [];
}

export function storeMarketOverride(marketId: string, updates: any): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const existing = loadMarketOverrides();
      existing[marketId] = {
        ...existing[marketId],
        ...updates
      };
      window.localStorage.setItem(MARKET_OVERRIDES_KEY, JSON.stringify(existing));
    } catch (err) {
      console.warn('Failed to save market override:', err);
    }
  }
}

export function loadMarketOverrides(): Record<string, any> {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(MARKET_OVERRIDES_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load market overrides:', err);
    }
  }
  return {};
}

