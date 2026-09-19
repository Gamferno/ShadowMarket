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

describe('ShadowMarket Smart Contract Test Suite — Phase 2', () => {
  const contractAddress = sampleContractAddress();
  const dummyCoinPk = '00'.repeat(32);

  let admin: TestParticipant;
  let alice: TestParticipant;
  let bob: TestParticipant;
  let eve: TestParticipant;

  let currentContractState: ContractState;
  let currentZswapState: EncodedZswapLocalState;

  beforeEach(() => {
    clearMemoryStorage();
    admin = createTestParticipant('Admin', new Uint8Array(32).fill(1));
    alice = createTestParticipant('Alice', new Uint8Array(32).fill(2));
    bob = createTestParticipant('Bob', new Uint8Array(32).fill(3));
    eve = createTestParticipant('Eve', new Uint8Array(32).fill(4));

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

  describe('1. Multi-Market Contract Initialization & Constructor', () => {
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
      expect(currentLedger.claimedNullifiers.isEmpty()).toBe(true);
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

  describe('2. On-Chain Market Creation Circuit', () => {
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
    });
  });

  describe('3. Shielded Betting Circuit Across Multiple Markets', () => {
    it('should accept a shielded YES bet on market #1 and update its aggregate volume and stake', () => {
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
      const aliceBetRes = alice.contract.impureCircuits.placeShieldedBet(aliceBetCtx, 2n, true, 150_000_000n);
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

  describe('4. Pure & On-Chain Odds Verification Circuits', () => {
    it('should correctly verify integer percentage odds calculations in pure circuit', () => {
      expect(pureCircuits.verifyOdds(0n, 0n, 50n)).toBe(true);
      expect(pureCircuits.verifyOdds(0n, 0n, 51n)).toBe(false);

      expect(pureCircuits.verifyOdds(100n, 0n, 100n)).toBe(true);
      expect(pureCircuits.verifyOdds(100n, 0n, 99n)).toBe(false);

      expect(pureCircuits.verifyOdds(50n, 50n, 50n)).toBe(true);
      expect(pureCircuits.verifyOdds(60n, 40n, 60n)).toBe(true);
      expect(pureCircuits.verifyOdds(1n, 2n, 33n)).toBe(true);
      expect(pureCircuits.verifyOdds(1n, 2n, 34n)).toBe(false);
    });

    it('should disclose 50% default odds for market with no bets via discloseOdds', () => {
      const oddsCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const res = alice.contract.impureCircuits.discloseOdds(oddsCtx, 1n);
      expect(res.result).toBe(50n);
    });

    it('should accurately compute and disclose odds via discloseOdds after bets', () => {
      // Alice bets 75 on YES
      const bet1Ctx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const b1 = alice.contract.impureCircuits.placeBet(bet1Ctx, 1n, true, 75_000_000n);
      currentContractState = b1.context.currentQueryContext.state as any;
      alice.privateState = b1.context.currentPrivateState;
      currentZswapState = b1.context.currentZswapLocalState;

      // Bob bets 25 on NO
      const bet2Ctx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        bob.privateState
      );
      const b2 = bob.contract.impureCircuits.placeBet(bet2Ctx, 1n, false, 25_000_000n);
      currentContractState = b2.context.currentQueryContext.state as any;
      bob.privateState = b2.context.currentPrivateState;
      currentZswapState = b2.context.currentZswapLocalState;

      // Disclose odds on Market #1 -> 75%
      alice.privateState.activeMarketId = '1';
      const oddsCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const res = alice.contract.impureCircuits.discloseOdds(oddsCtx, 1n);
      expect(res.result).toBe(75n);
    });
  });

  describe('5. Market Close & Resolution Lifecycle Circuits', () => {
    it('should allow creator or admin to close market bidding', () => {
      // Alice creates Market #2
      const createCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const createRes = alice.contract.impureCircuits.createMarket(
        createCtx,
        'Market to Close',
        'Politics',
        'Source',
        1800000000n
      );
      currentContractState = createRes.context.currentQueryContext.state as any;
      alice.privateState = createRes.context.currentPrivateState;
      currentZswapState = createRes.context.currentZswapLocalState;

      // Eve (unauthorized) tries to close Market #2 -> Should fail
      const eveCloseCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        eve.privateState
      );
      expect(() => {
        eve.contract.impureCircuits.closeMarket(eveCloseCtx, 2n);
      }).toThrow(/Only creator or admin can close market/);

      // Alice (creator) closes Market #2
      const aliceCloseCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const closeRes = alice.contract.impureCircuits.closeMarket(aliceCloseCtx, 2n);
      currentContractState = closeRes.context.currentQueryContext.state as any;
      alice.privateState = closeRes.context.currentPrivateState;
      currentZswapState = closeRes.context.currentZswapLocalState;

      expect(parseLedger(currentContractState).markets.lookup(2n).state).toBe(MarketState.Closed);

      // Subsequent bet on closed market should fail
      const lateBetCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        bob.privateState
      );
      expect(() => {
        bob.contract.impureCircuits.placeBet(lateBetCtx, 2n, true, 10_000_000n);
      }).toThrow(/Market is not open for betting/);
    });

    it('should allow creator or admin to resolve market and reject unauthorized callers', () => {
      // Eve (unauthorized) tries to resolve Market #1 -> Should fail
      const eveResolveCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        eve.privateState
      );
      expect(() => {
        eve.contract.impureCircuits.resolveMarket(eveResolveCtx, 1n, Outcome.Yes);
      }).toThrow(/Only creator or admin can resolve market/);

      // Admin (creator of Market #1) resolves Market #1 to YES
      const adminResolveCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        admin.privateState
      );
      const resolveRes = admin.contract.impureCircuits.resolveMarket(adminResolveCtx, 1n, Outcome.Yes);
      currentContractState = resolveRes.context.currentQueryContext.state as any;
      admin.privateState = resolveRes.context.currentPrivateState;
      currentZswapState = resolveRes.context.currentZswapLocalState;

      const m1 = parseLedger(currentContractState).markets.lookup(1n);
      expect(m1.state).toBe(MarketState.Resolved);
      expect(m1.outcome).toBe(Outcome.Yes);
    });
  });

  describe('6. Full Lifecycle: Market Creation, Betting, Resolution & Shielded Payout Claims', () => {
    it('should execute complete prediction lifecycle: Alice bets YES, Bob bets NO, Alice claims full pot', () => {
      // Alice creates Market #2
      const createCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const createRes = alice.contract.impureCircuits.createMarket(
        createCtx,
        'Will ZK-SNARK proving time drop below 100ms in 2026?',
        'Crypto/Macro',
        'ZK Benchmark Standard',
        1800000000n
      );
      currentContractState = createRes.context.currentQueryContext.state as any;
      alice.privateState = createRes.context.currentPrivateState;
      currentZswapState = createRes.context.currentZswapLocalState;

      // Alice bets 60 tDUST on YES on Market #2
      const aliceBetCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const aliceBetRes = alice.contract.impureCircuits.placeBet(aliceBetCtx, 2n, true, 60_000_000n);
      currentContractState = aliceBetRes.context.currentQueryContext.state as any;
      alice.privateState = aliceBetRes.context.currentPrivateState;
      currentZswapState = aliceBetRes.context.currentZswapLocalState;

      // Bob bets 40 tDUST on NO on Market #2
      const bobBetCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        bob.privateState
      );
      const bobBetRes = bob.contract.impureCircuits.placeBet(bobBetCtx, 2n, false, 40_000_000n);
      currentContractState = bobBetRes.context.currentQueryContext.state as any;
      bob.privateState = bobBetRes.context.currentPrivateState;
      currentZswapState = bobBetRes.context.currentZswapLocalState;

      const m2 = parseLedger(currentContractState).markets.lookup(2n);
      expect(m2.totalStakeYes).toBe(60_000_000n);
      expect(m2.totalStakeNo).toBe(40_000_000n);
      expect(m2.totalVolume).toBe(100_000_000n);

      // Alice (creator) resolves Market #2 to YES
      const aliceResolveCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const resolveRes = alice.contract.impureCircuits.resolveMarket(aliceResolveCtx, 2n, Outcome.Yes);
      currentContractState = resolveRes.context.currentQueryContext.state as any;
      alice.privateState = resolveRes.context.currentPrivateState;
      currentZswapState = resolveRes.context.currentZswapLocalState;

      const resolvedMarket2 = parseLedger(currentContractState).markets.lookup(2n);
      expect(resolvedMarket2.state).toBe(MarketState.Resolved);
      expect(resolvedMarket2.outcome).toBe(Outcome.Yes);

      // Bob (bet on NO) tries to claim payout -> Should fail
      bob.privateState.activeMarketId = '2';
      const bobClaimCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        bob.privateState
      );
      expect(() => {
        bob.contract.impureCircuits.claimPayout(bobClaimCtx, 2n);
      }).toThrow(/Bet is not on winning outcome/);

      // Alice (bet on YES) claims payout -> gets 100 tDUST (proportional share = 100% of 100 pot)
      alice.privateState.activeMarketId = '2';
      const aliceClaimCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const claimRes = alice.contract.impureCircuits.claimPayout(aliceClaimCtx, 2n);
      currentContractState = claimRes.context.currentQueryContext.state as any;
      alice.privateState = claimRes.context.currentPrivateState;
      currentZswapState = claimRes.context.currentZswapLocalState;

      expect(claimRes.result).toBe(100_000_000n);

      // Confirm nullifier is recorded in ledger
      const currentLedger = parseLedger(currentContractState);
      expect(currentLedger.claimedNullifiers.isEmpty()).toBe(false);
      expect(currentLedger.claimedNullifiers.size()).toBe(1n);

      // Alice tries to double-claim -> Should fail with nullifier error
      const doubleClaimCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      expect(() => {
        alice.contract.impureCircuits.claimPayout(doubleClaimCtx, 2n);
      }).toThrow(/Payout already claimed/);
    });

    it('should support full refund on inconclusive outcome', () => {
      // Alice creates Market #2
      const createCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const createRes = alice.contract.impureCircuits.createMarket(
        createCtx,
        'Market to tie',
        'Custom',
        'Source',
        1800000000n
      );
      currentContractState = createRes.context.currentQueryContext.state as any;
      alice.privateState = createRes.context.currentPrivateState;
      currentZswapState = createRes.context.currentZswapLocalState;

      // Alice bets 50 on YES
      const betCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const betRes = alice.contract.impureCircuits.placeBet(betCtx, 2n, true, 50_000_000n);
      currentContractState = betRes.context.currentQueryContext.state as any;
      alice.privateState = betRes.context.currentPrivateState;
      currentZswapState = betRes.context.currentZswapLocalState;

      // Alice resolves to Inconclusive
      const resolveCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const resRes = alice.contract.impureCircuits.resolveMarket(resolveCtx, 2n, Outcome.Inconclusive);
      currentContractState = resRes.context.currentQueryContext.state as any;
      alice.privateState = resRes.context.currentPrivateState;
      currentZswapState = resRes.context.currentZswapLocalState;

      // Alice claims refund
      alice.privateState.activeMarketId = '2';
      const claimCtx = createCircuitContext(
        contractAddress,
        currentZswapState,
        currentContractState,
        alice.privateState
      );
      const claimRes = alice.contract.impureCircuits.claimPayout(claimCtx, 2n);
      expect(claimRes.result).toBe(50_000_000n);
    });
  });
});
