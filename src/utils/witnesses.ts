import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import { pureCircuits, type Ledger, type Witnesses, type BetData } from '../../managed/shadowmarket/contract/index.js';
import type { ShadowMarketPrivateState, ShieldedBetReceipt } from '../types/index.ts';
import { bytesToHex } from './formatters.ts';
import { saveReceipts } from './storage.ts';

const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

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
  customSecret?: Uint8Array,
  customRecipient?: Uint8Array
): Witnesses<ShadowMarketPrivateState> {
  return {
    getSchnorrReduction: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>,
      challengeHash: bigint
    ): [ShadowMarketPrivateState, [bigint, bigint]] => {
      const q = challengeHash / TWO_248;
      const r = challengeHash % TWO_248;
      return [context.privateState, [q, r]];
    },

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

    get_claimed_bet: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, BetData] => {
      const { receipts, activeClaimReceiptId, activeMarketId } = context.privateState;
      let targetReceipt: ShieldedBetReceipt | undefined;

      if (activeClaimReceiptId && receipts.has(activeClaimReceiptId)) {
        targetReceipt = receipts.get(activeClaimReceiptId);
      } else {
        for (const receipt of receipts.values()) {
          if (!receipt.claimed && (!activeMarketId || receipt.marketId === activeMarketId)) {
            targetReceipt = receipt;
            break;
          }
        }
      }

      if (!targetReceipt) {
        throw new Error('No unclaimed bet receipt found in private state for payout claim');
      }

      const secret = customSecret ?? context.privateState.secretKey;
      const ownerPk = pureCircuits.derivePublicKey(secret);

      const betData: BetData = {
        marketId: BigInt(targetReceipt.marketId || 1),
        ownerPk,
        amount: targetReceipt.amount,
        isYes: targetReceipt.isYes,
        nonce: targetReceipt.nonceBytes
      };

      return [context.privateState, betData];
    },

    get_claim_salt: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, Uint8Array] => {
      const { receipts, activeClaimReceiptId, activeMarketId } = context.privateState;
      let targetReceipt: ShieldedBetReceipt | undefined;

      if (activeClaimReceiptId && receipts.has(activeClaimReceiptId)) {
        targetReceipt = receipts.get(activeClaimReceiptId);
      } else {
        for (const receipt of receipts.values()) {
          if (!receipt.claimed && (!activeMarketId || receipt.marketId === activeMarketId)) {
            targetReceipt = receipt;
            break;
          }
        }
      }

      if (!targetReceipt) {
        throw new Error('No active receipt found for claim salt');
      }

      return [context.privateState, targetReceipt.nonceBytes];
    },

    get_claim_recipient: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, Uint8Array] => {
      const recipient = customRecipient ?? context.privateState.recipientAddress ?? new Uint8Array(32).fill(2);
      return [context.privateState, recipient];
    },

    get_disclosed_odds: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, bigint] => {
      return [context.privateState, 50n];
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
