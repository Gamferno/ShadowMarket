import type { ShieldedBetReceipt, ShadowMarketPrivateState } from '../types/index.ts';

let memoryReceipts = new Map<string, ShieldedBetReceipt>();

export function saveReceipts(receipts: Map<string, ShieldedBetReceipt>): void {
  memoryReceipts = new Map(receipts);
}

export function loadReceipts(): Map<string, ShieldedBetReceipt> {
  return new Map(memoryReceipts);
}

export function clearMemoryStorage(): void {
  memoryReceipts.clear();
}

export function createInitialPrivateState(
  secretKey: Uint8Array,
  receipts: Map<string, ShieldedBetReceipt> = new Map()
): ShadowMarketPrivateState {
  return {
    secretKey,
    receipts
  };
}
