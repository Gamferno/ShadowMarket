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
