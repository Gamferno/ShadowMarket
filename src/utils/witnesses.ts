import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import { pureCircuits, type Ledger, type Witnesses, type BetData } from '../../managed/shadowmarket/contract/index.js';
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

    get_claimed_payout: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, bigint] => {
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
        throw new Error('No active receipt found for payout computation');
      }

      const currentLedger = context.ledger;
      const marketId = BigInt(targetReceipt.marketId || 1);
      
      if (!currentLedger.markets.member(marketId)) {
        throw new Error(`Market ${marketId} not found in ledger`);
      }
      
      const m = currentLedger.markets.lookup(marketId);
      const totalVol = m.totalVolume;
      const winningStake = targetReceipt.isYes ? m.totalStakeYes : m.totalStakeNo;

      if (m.outcome === 3 /* Outcome.Inconclusive */) {
        return [context.privateState, targetReceipt.amount];
      }

      if (winningStake === 0n) {
        throw new Error('Winning stake is zero, cannot compute payout');
      }

      const payout = (targetReceipt.amount * totalVol) / winningStake;
      return [context.privateState, payout];
    },

    get_disclosed_odds: (
      context: WitnessContext<Ledger, ShadowMarketPrivateState>
    ): [ShadowMarketPrivateState, bigint] => {
      const marketId = context.privateState.activeMarketId ? BigInt(context.privateState.activeMarketId) : 1n;
      if (context.ledger.markets.member(marketId)) {
        const m = context.ledger.markets.lookup(marketId);
        const total = m.totalStakeYes + m.totalStakeNo;
        if (total === 0n) return [context.privateState, 50n];
        return [context.privateState, (m.totalStakeYes * 100n) / total];
      }
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
