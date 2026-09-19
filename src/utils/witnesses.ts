import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger, Witnesses } from '../../managed/shadowmarket/contract/index.js';
import type { ShadowMarketPrivateState, ShieldedBetReceipt } from '../types/index.ts';
import { bytesToHex } from './formatters.ts';
import { saveReceipts } from './storage.ts';

export function generateRandomBytes(length: number = 32): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

export function createWitnesses(
  customSecret?: Uint8Array
): Witnesses<ShadowMarketPrivateState> {
  return {
    get_user_secret: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, Uint8Array] => {
      const secret = customSecret ?? context.privateState.secretKey;
      return [context.privateState, secret];
    },

    get_bet_nonce: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, Uint8Array] => {
      const nonce = generateRandomBytes(32);
      return [context.privateState, nonce];
    },

    persist_bet_receipt: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>,
      commitment: Uint8Array,
      marketId: bigint,
      amount: bigint,
      isYes: boolean,
      nonce: Uint8Array
    ): [ShadowMarketPrivateState, []] => {
      const commitmentHex = bytesToHex(commitment);
      const nonceHex = bytesToHex(nonce);
      const newReceipt: ShieldedBetReceipt = {
        id: commitmentHex,
        marketId: marketId.toString(),
        commitmentHex,
        amount,
        isYes,
        nonceHex,
        nonceBytes: nonce,
        timestamp: Date.now(),
        claimed: false
      };

      const updatedMap = new Map(context.privateState.receipts);
      updatedMap.set(commitmentHex, newReceipt);
      saveReceipts(updatedMap);

      const nextState: ShadowMarketPrivateState = {
        ...context.privateState,
        receipts: updatedMap
      };

      return [nextState, []];
    }
  };
}
