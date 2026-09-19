import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum MarketState { Open = 0, Closed = 1, Resolved = 2, Cancelled = 3 }

export enum Outcome { None = 0, Yes = 1, No = 2, Inconclusive = 3 }

export type Market = { id: bigint;
                       creator: Uint8Array;
                       question: string;
                       category: string;
                       resolutionSource: string;
                       closeTimestamp: bigint;
                       state: MarketState;
                       outcome: Outcome;
                       totalStakeYes: bigint;
                       totalStakeNo: bigint;
                       totalVolume: bigint;
                       betCounter: bigint
                     };

export type BetData = { marketId: bigint;
                        ownerPk: Uint8Array;
                        amount: bigint;
                        isYes: boolean;
                        nonce: Uint8Array
                      };

export type Witnesses<PS> = {
  get_user_secret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_bet_nonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_claimed_bet(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, BetData];
  get_claim_salt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  get_claimed_payout(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  get_disclosed_odds(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  persist_bet_receipt(context: __compactRuntime.WitnessContext<Ledger, PS>,
                      commitment_0: Uint8Array,
                      marketId_0: bigint,
                      amount_0: bigint,
                      isYes_0: boolean,
                      nonce_0: Uint8Array): [PS, []];
}

export type ImpureCircuits<PS> = {
  createMarket(context: __compactRuntime.CircuitContext<PS>,
               question_0: string,
               category_0: string,
               resolutionSource_0: string,
               closeTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  placeBet(context: __compactRuntime.CircuitContext<PS>,
           marketId_0: bigint,
           isYes_0: boolean,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  placeShieldedBet(context: __compactRuntime.CircuitContext<PS>,
                   marketId_0: bigint,
                   isYes_0: boolean,
                   amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  discloseOdds(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  closeMarket(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  resolveMarket(context: __compactRuntime.CircuitContext<PS>,
                marketId_0: bigint,
                winningOutcome_0: Outcome): __compactRuntime.CircuitResults<PS, []>;
  claimPayout(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
}

export type ProvableCircuits<PS> = {
  createMarket(context: __compactRuntime.CircuitContext<PS>,
               question_0: string,
               category_0: string,
               resolutionSource_0: string,
               closeTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  placeBet(context: __compactRuntime.CircuitContext<PS>,
           marketId_0: bigint,
           isYes_0: boolean,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  placeShieldedBet(context: __compactRuntime.CircuitContext<PS>,
                   marketId_0: bigint,
                   isYes_0: boolean,
                   amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  discloseOdds(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  closeMarket(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  resolveMarket(context: __compactRuntime.CircuitContext<PS>,
                marketId_0: bigint,
                winningOutcome_0: Outcome): __compactRuntime.CircuitResults<PS, []>;
  claimPayout(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
}

export type PureCircuits = {
  derivePublicKey(secret_0: Uint8Array): Uint8Array;
  verifyOdds(yesStake_0: bigint, noStake_0: bigint, oddsPercent_0: bigint): boolean;
}

export type Circuits<PS> = {
  derivePublicKey(context: __compactRuntime.CircuitContext<PS>,
                  secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  createMarket(context: __compactRuntime.CircuitContext<PS>,
               question_0: string,
               category_0: string,
               resolutionSource_0: string,
               closeTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  placeBet(context: __compactRuntime.CircuitContext<PS>,
           marketId_0: bigint,
           isYes_0: boolean,
           amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  placeShieldedBet(context: __compactRuntime.CircuitContext<PS>,
                   marketId_0: bigint,
                   isYes_0: boolean,
                   amount_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  discloseOdds(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  verifyOdds(context: __compactRuntime.CircuitContext<PS>,
             yesStake_0: bigint,
             noStake_0: bigint,
             oddsPercent_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  closeMarket(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  resolveMarket(context: __compactRuntime.CircuitContext<PS>,
                marketId_0: bigint,
                winningOutcome_0: Outcome): __compactRuntime.CircuitResults<PS, []>;
  claimPayout(context: __compactRuntime.CircuitContext<PS>, marketId_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
}

export type Ledger = {
  readonly protocolAdmin: Uint8Array;
  readonly marketCounter: bigint;
  markets: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Market;
    [Symbol.iterator](): Iterator<[bigint, Market]>
  };
  betCommitments: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  claimedNullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               adminPk_0: Uint8Array,
               initialQuestion_0: string,
               initialCategory_0: string,
               initialResolutionSource_0: string,
               initialCloseTimestamp_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
