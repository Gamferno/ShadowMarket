import { describe, it, expect, beforeEach } from 'vitest';
import { MarketState, Outcome, pureCircuits } from '../managed/shadowmarket/contract/index.js';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
  type ContractState,
  type EncodedZswapLocalState
} from '@midnight-ntwrk/compact-runtime';
import { createTestParticipant, parseLedger, type TestParticipant } from './test-utils.ts';
import { clearMemoryStorage } from '../src/utils/storage.ts';

describe('ShadowMarket Smart Contract Test Suite — Phase 1', () => {
  const contractAddress = sampleContractAddress();
  const dummyCoinPk = '00'.repeat(32);

  let admin: TestParticipant;
  let alice: TestParticipant;
  let bob: TestParticipant;

  let currentContractState: ContractState;
  let currentZswapState: EncodedZswapLocalState;

  beforeEach(() => {
    clearMemoryStorage();
    admin = createTestParticipant('Admin', new Uint8Array(32).fill(1));
    alice = createTestParticipant('Alice', new Uint8Array(32).fill(2));
    bob = createTestParticipant('Bob', new Uint8Array(32).fill(3));

    const constructorCtx = createConstructorContext(admin.privateState, dummyCoinPk);
    const question = 'Will Midnight mainnet launch with native zero-knowledge privacy in 2026?';
    const category = 'Crypto/Macro';
    const resolutionSource = 'Midnight Official Foundation Announcement';
    const closeTimestamp = 1798761600n;

    const initRes = admin.contract.initialState(
      constructorCtx,
      admin.publicKey,
      question,
      category,
      resolutionSource,
      closeTimestamp
    );

    currentContractState = initRes.currentContractState;
    currentZswapState = initRes.currentZswapLocalState;
    admin.privateState = initRes.currentPrivateState;
  });

  describe('1. Contract Initialization & Constructor', () => {
    it('should initialize contract with initial market #1 and counter at 1', () => {
      const currentLedger = parseLedger(currentContractState);
      expect(currentLedger.marketCounter).toBe(1n);
      expect(currentLedger.markets.size()).toBe(1n);
      expect(currentLedger.markets.member(1n)).toBe(true);

      const m1 = currentLedger.markets.lookup(1n);
      expect(m1.id).toBe(1n);
      expect(m1.creator).toEqual(admin.publicKey);
      expect(m1.question).toBe('Will Midnight mainnet launch with native zero-knowledge privacy in 2026?');
      expect(m1.category).toBe('Crypto/Macro');
      expect(m1.resolutionSource).toBe('Midnight Official Foundation Announcement');
      expect(m1.closeTimestamp).toBe(1798761600n);
      expect(m1.state).toBe(MarketState.Open);
      expect(m1.outcome).toBe(Outcome.None);
      expect(m1.totalStakeYes).toBe(0n);
      expect(m1.totalStakeNo).toBe(0n);
      expect(m1.totalVolume).toBe(0n);
      expect(m1.betCounter).toBe(0n);
      expect(currentLedger.betCommitments.isEmpty()).toBe(true);
    });

    it('should correctly derive public key from secret key deterministically', () => {
      const secret = new Uint8Array(32).fill(42);
      const pk1 = pureCircuits.derivePublicKey(secret);
      const pk2 = pureCircuits.derivePublicKey(secret);
      expect(pk1).toBeInstanceOf(Uint8Array);
      expect(pk1.length).toBe(32);
      expect(pk1).toEqual(pk2);
    });
  });

  describe('2. createMarket Circuit', () => {
    it('should allow permissionless creation of a new prediction market on-chain', () => {
      const createCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );

      const newQuestion = 'Will Cardano implement Hydra heads at scale in 2026?';
      const newCategory = 'Crypto/Macro';
      const newSource = 'Cardano Foundation Report';
      const newCloseTime = 1800000000n;

      const res = alice.contract.impureCircuits.createMarket(
        createCtx,
        newQuestion,
        newCategory,
        newSource,
        newCloseTime
      );

      currentContractState = res.context.currentQueryContext.state as any;
      alice.privateState = res.context.currentPrivateState;
      currentZswapState = res.context.currentZswapLocalState;

      const createdId = res.result;
      expect(createdId).toBe(2n);

      const currentLedger = parseLedger(currentContractState);
      expect(currentLedger.marketCounter).toBe(2n);
      expect(currentLedger.markets.size()).toBe(2n);
      expect(currentLedger.markets.member(2n)).toBe(true);

      const m2 = currentLedger.markets.lookup(2n);
      expect(m2.id).toBe(2n);
      expect(m2.creator).toEqual(alice.publicKey);
      expect(m2.question).toBe(newQuestion);
      expect(m2.category).toBe(newCategory);
      expect(m2.resolutionSource).toBe(newSource);
      expect(m2.closeTimestamp).toBe(newCloseTime);
      expect(m2.state).toBe(MarketState.Open);
      expect(m2.outcome).toBe(Outcome.None);
      expect(m2.totalStakeYes).toBe(0n);
      expect(m2.totalStakeNo).toBe(0n);
      expect(m2.totalVolume).toBe(0n);
      expect(m2.betCounter).toBe(0n);
    });
  });

  describe('3. placeBet & placeShieldedBet Circuit', () => {
    it('should accept a shielded YES bet on market #1 and update aggregate volume and stake', () => {
      const betAmount = 100_000_000n;
      const betCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );

      const res = alice.contract.impureCircuits.placeBet(betCtx, 1n, true, betAmount);
      currentContractState = res.context.currentQueryContext.state as any;
      alice.privateState = res.context.currentPrivateState;
      currentZswapState = res.context.currentZswapLocalState;

      const currentLedger = parseLedger(currentContractState);
      const m1 = currentLedger.markets.lookup(1n);
      expect(m1.totalStakeYes).toBe(betAmount);
      expect(m1.totalStakeNo).toBe(0n);
      expect(m1.totalVolume).toBe(betAmount);
      expect(m1.betCounter).toBe(1n);

      const commitment = res.result;
      expect(commitment).toBeInstanceOf(Uint8Array);
      expect(commitment.length).toBe(32);
      expect(currentLedger.betCommitments.member(commitment)).toBe(true);

      expect(alice.privateState.receipts.size).toBe(1);
      const receipt = Array.from(alice.privateState.receipts.values())[0];
      expect(receipt.marketId).toBe('1');
      expect(receipt.amount).toBe(betAmount);
      expect(receipt.isYes).toBe(true);
      expect(receipt.claimed).toBe(false);
    });

    it('should accept a shielded NO bet via placeShieldedBet alias', () => {
      const betAmount = 50_000_000n;
      const betCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        bob.privateState
      );

      const res = bob.contract.impureCircuits.placeShieldedBet(betCtx, 1n, false, betAmount);
      currentContractState = res.context.currentQueryContext.state as any;
      bob.privateState = res.context.currentPrivateState;
      currentZswapState = res.context.currentZswapLocalState;

      const currentLedger = parseLedger(currentContractState);
      const m1 = currentLedger.markets.lookup(1n);
      expect(m1.totalStakeNo).toBe(betAmount);
      expect(m1.totalStakeYes).toBe(0n);
      expect(m1.totalVolume).toBe(betAmount);
      expect(m1.betCounter).toBe(1n);
    });

    it('should support independent betting on distinct on-chain markets', () => {
      // Alice creates Market #2
      const createCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const createRes = alice.contract.impureCircuits.createMarket(
        createCtx,
        'Market 2 Question',
        'Sports',
        'Source 2',
        1800000000n
      );
      currentContractState = createRes.context.currentQueryContext.state as any;
      alice.privateState = createRes.context.currentPrivateState;
      currentZswapState = createRes.context.currentZswapLocalState;

      // Bob bets on Market #1 (NO, 50 tDUST)
      const bobCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        bob.privateState
      );
      const bobRes = bob.contract.impureCircuits.placeBet(bobCtx, 1n, false, 50_000_000n);
      currentContractState = bobRes.context.currentQueryContext.state as any;
      bob.privateState = bobRes.context.currentPrivateState;
      currentZswapState = bobRes.context.currentZswapLocalState;

      // Alice bets on Market #2 (YES, 150 tDUST)
      const aliceBetCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const aliceBetRes = alice.contract.impureCircuits.placeBet(aliceBetCtx, 2n, true, 150_000_000n);
      currentContractState = aliceBetRes.context.currentQueryContext.state as any;
      alice.privateState = aliceBetRes.context.currentPrivateState;
      currentZswapState = aliceBetRes.context.currentZswapLocalState;

      const ledgerState = parseLedger(currentContractState);
      const m1 = ledgerState.markets.lookup(1n);
      const m2 = ledgerState.markets.lookup(2n);

      expect(m1.totalStakeNo).toBe(50_000_000n);
      expect(m1.totalVolume).toBe(50_000_000n);
      expect(m2.totalStakeYes).toBe(150_000_000n);
      expect(m2.totalVolume).toBe(150_000_000n);
    });

    it('should reject betting on non-existent market', () => {
      const betCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      expect(() => {
        alice.contract.impureCircuits.placeBet(betCtx, 999n, true, 10_000_000n);
      }).toThrow(/Market does not exist/);
    });

    it('should reject zero amount bets', () => {
      const betCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      expect(() => {
        alice.contract.impureCircuits.placeBet(betCtx, 1n, true, 0n);
      }).toThrow(/Bet amount must be greater than zero/);
    });
  });
});
