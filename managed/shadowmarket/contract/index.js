import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.16.0');

export var MarketState;
(function (MarketState) {
  MarketState[MarketState['Open'] = 0] = 'Open';
  MarketState[MarketState['Closed'] = 1] = 'Closed';
  MarketState[MarketState['Resolved'] = 2] = 'Resolved';
  MarketState[MarketState['Cancelled'] = 3] = 'Cancelled';
})(MarketState || (MarketState = {}));

export var Outcome;
(function (Outcome) {
  Outcome[Outcome['None'] = 0] = 'None';
  Outcome[Outcome['Yes'] = 1] = 'Yes';
  Outcome[Outcome['No'] = 2] = 'No';
  Outcome[Outcome['Inconclusive'] = 3] = 'Inconclusive';
})(Outcome || (Outcome = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_2 = __compactRuntime.CompactTypeOpaqueString;

const _descriptor_3 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_4 = new __compactRuntime.CompactTypeEnum(3, 1);

class _Market_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment())))))))))));
  }
  fromValue(value_0) {
    return {
      id: _descriptor_0.fromValue(value_0),
      creator: _descriptor_1.fromValue(value_0),
      question: _descriptor_2.fromValue(value_0),
      category: _descriptor_2.fromValue(value_0),
      resolutionSource: _descriptor_2.fromValue(value_0),
      closeTimestamp: _descriptor_0.fromValue(value_0),
      state: _descriptor_3.fromValue(value_0),
      outcome: _descriptor_4.fromValue(value_0),
      totalStakeYes: _descriptor_0.fromValue(value_0),
      totalStakeNo: _descriptor_0.fromValue(value_0),
      totalVolume: _descriptor_0.fromValue(value_0),
      betCounter: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.id).concat(_descriptor_1.toValue(value_0.creator).concat(_descriptor_2.toValue(value_0.question).concat(_descriptor_2.toValue(value_0.category).concat(_descriptor_2.toValue(value_0.resolutionSource).concat(_descriptor_0.toValue(value_0.closeTimestamp).concat(_descriptor_3.toValue(value_0.state).concat(_descriptor_4.toValue(value_0.outcome).concat(_descriptor_0.toValue(value_0.totalStakeYes).concat(_descriptor_0.toValue(value_0.totalStakeNo).concat(_descriptor_0.toValue(value_0.totalVolume).concat(_descriptor_0.toValue(value_0.betCounter))))))))))));
  }
}

const _descriptor_5 = new _Market_0();

const _descriptor_6 = __compactRuntime.CompactTypeBoolean;

const _descriptor_7 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

class _BetData_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_1.alignment()))));
  }
  fromValue(value_0) {
    return {
      marketId: _descriptor_0.fromValue(value_0),
      ownerPk: _descriptor_1.fromValue(value_0),
      amount: _descriptor_0.fromValue(value_0),
      isYes: _descriptor_6.fromValue(value_0),
      nonce: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.marketId).concat(_descriptor_1.toValue(value_0.ownerPk).concat(_descriptor_0.toValue(value_0.amount).concat(_descriptor_6.toValue(value_0.isYes).concat(_descriptor_1.toValue(value_0.nonce)))));
  }
}

const _descriptor_8 = new _BetData_0();

const _descriptor_9 = new __compactRuntime.CompactTypeVector(2, _descriptor_1);

const _descriptor_10 = new __compactRuntime.CompactTypeVector(3, _descriptor_1);

class _Either_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_6.fromValue(value_0),
      left: _descriptor_1.fromValue(value_0),
      right: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.is_left).concat(_descriptor_1.toValue(value_0.left).concat(_descriptor_1.toValue(value_0.right)));
  }
}

const _descriptor_11 = new _Either_0();

const _descriptor_12 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_13 = new _ContractAddress_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.get_user_secret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_user_secret');
    }
    if (typeof(witnesses_0.get_bet_nonce) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_bet_nonce');
    }
    if (typeof(witnesses_0.get_claimed_bet) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_claimed_bet');
    }
    if (typeof(witnesses_0.get_claim_salt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_claim_salt');
    }
    if (typeof(witnesses_0.get_claimed_payout) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_claimed_payout');
    }
    if (typeof(witnesses_0.get_disclosed_odds) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named get_disclosed_odds');
    }
    if (typeof(witnesses_0.persist_bet_receipt) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named persist_bet_receipt');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      derivePublicKey(context, ...args_1) {
        return { result: pureCircuits.derivePublicKey(...args_1), context };
      },
      createMarket: (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`createMarket: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const question_0 = args_1[1];
        const category_0 = args_1[2];
        const resolutionSource_0 = args_1[3];
        const closeTimestamp_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('createMarket',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 135 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(closeTimestamp_0) === 'bigint' && closeTimestamp_0 >= 0n && closeTimestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('createMarket',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'shadowmarket.compact line 135 char 1',
                                     'Uint<0..18446744073709551616>',
                                     closeTimestamp_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(question_0).concat(_descriptor_2.toValue(category_0).concat(_descriptor_2.toValue(resolutionSource_0).concat(_descriptor_0.toValue(closeTimestamp_0)))),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_0.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._createMarket_0(context,
                                              partialProofData,
                                              question_0,
                                              category_0,
                                              resolutionSource_0,
                                              closeTimestamp_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      placeBet: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`placeBet: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const marketId_0 = args_1[1];
        const isYes_0 = args_1[2];
        const amount_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('placeBet',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 162 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(marketId_0) === 'bigint' && marketId_0 >= 0n && marketId_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('placeBet',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadowmarket.compact line 162 char 1',
                                     'Uint<0..18446744073709551616>',
                                     marketId_0)
        }
        if (!(typeof(isYes_0) === 'boolean')) {
          __compactRuntime.typeError('placeBet',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'shadowmarket.compact line 162 char 1',
                                     'Boolean',
                                     isYes_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('placeBet',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'shadowmarket.compact line 162 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(marketId_0).concat(_descriptor_6.toValue(isYes_0).concat(_descriptor_0.toValue(amount_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._placeBet_0(context,
                                          partialProofData,
                                          marketId_0,
                                          isYes_0,
                                          amount_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      placeShieldedBet: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`placeShieldedBet: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const marketId_0 = args_1[1];
        const isYes_0 = args_1[2];
        const amount_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('placeShieldedBet',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 205 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(marketId_0) === 'bigint' && marketId_0 >= 0n && marketId_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('placeShieldedBet',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadowmarket.compact line 205 char 1',
                                     'Uint<0..18446744073709551616>',
                                     marketId_0)
        }
        if (!(typeof(isYes_0) === 'boolean')) {
          __compactRuntime.typeError('placeShieldedBet',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'shadowmarket.compact line 205 char 1',
                                     'Boolean',
                                     isYes_0)
        }
        if (!(typeof(amount_0) === 'bigint' && amount_0 >= 0n && amount_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('placeShieldedBet',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'shadowmarket.compact line 205 char 1',
                                     'Uint<0..18446744073709551616>',
                                     amount_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(marketId_0).concat(_descriptor_6.toValue(isYes_0).concat(_descriptor_0.toValue(amount_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_6.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._placeShieldedBet_0(context,
                                                  partialProofData,
                                                  marketId_0,
                                                  isYes_0,
                                                  amount_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      discloseOdds: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`discloseOdds: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const marketId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('discloseOdds',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 209 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(marketId_0) === 'bigint' && marketId_0 >= 0n && marketId_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('discloseOdds',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadowmarket.compact line 209 char 1',
                                     'Uint<0..18446744073709551616>',
                                     marketId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(marketId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._discloseOdds_0(context,
                                              partialProofData,
                                              marketId_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      verifyOdds(context, ...args_1) {
        return { result: pureCircuits.verifyOdds(...args_1), context };
      },
      closeMarket: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`closeMarket: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const marketId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('closeMarket',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 231 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(marketId_0) === 'bigint' && marketId_0 >= 0n && marketId_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('closeMarket',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadowmarket.compact line 231 char 1',
                                     'Uint<0..18446744073709551616>',
                                     marketId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(marketId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._closeMarket_0(context,
                                             partialProofData,
                                             marketId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      resolveMarket: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`resolveMarket: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const marketId_0 = args_1[1];
        const winningOutcome_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('resolveMarket',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 255 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(marketId_0) === 'bigint' && marketId_0 >= 0n && marketId_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('resolveMarket',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadowmarket.compact line 255 char 1',
                                     'Uint<0..18446744073709551616>',
                                     marketId_0)
        }
        if (!(typeof(winningOutcome_0) === 'number' && winningOutcome_0 >= 0 && winningOutcome_0 <= 3)) {
          __compactRuntime.typeError('resolveMarket',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'shadowmarket.compact line 255 char 1',
                                     'Enum<Outcome, None, Yes, No, Inconclusive>',
                                     winningOutcome_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(marketId_0).concat(_descriptor_4.toValue(winningOutcome_0)),
            alignment: _descriptor_0.alignment().concat(_descriptor_4.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._resolveMarket_0(context,
                                               partialProofData,
                                               marketId_0,
                                               winningOutcome_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      },
      claimPayout: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`claimPayout: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const marketId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.currentQueryContext != undefined)) {
          __compactRuntime.typeError('claimPayout',
                                     'argument 1 (as invoked from Typescript)',
                                     'shadowmarket.compact line 280 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(marketId_0) === 'bigint' && marketId_0 >= 0n && marketId_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('claimPayout',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'shadowmarket.compact line 280 char 1',
                                     'Uint<0..18446744073709551616>',
                                     marketId_0)
        }
        const context = { ...contextOrig_0, gasCost: __compactRuntime.emptyRunningCost() };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(marketId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._claimPayout_0(context,
                                             partialProofData,
                                             marketId_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData, gasCost: context.gasCost };
      }
    };
    this.impureCircuits = {
      createMarket: this.circuits.createMarket,
      placeBet: this.circuits.placeBet,
      placeShieldedBet: this.circuits.placeShieldedBet,
      discloseOdds: this.circuits.discloseOdds,
      closeMarket: this.circuits.closeMarket,
      resolveMarket: this.circuits.resolveMarket,
      claimPayout: this.circuits.claimPayout
    };
    this.provableCircuits = {
      createMarket: this.circuits.createMarket,
      placeBet: this.circuits.placeBet,
      placeShieldedBet: this.circuits.placeShieldedBet,
      discloseOdds: this.circuits.discloseOdds,
      closeMarket: this.circuits.closeMarket,
      resolveMarket: this.circuits.resolveMarket,
      claimPayout: this.circuits.claimPayout
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 6) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 6 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    const adminPk_0 = args_0[1];
    const initialQuestion_0 = args_0[2];
    const initialCategory_0 = args_0[3];
    const initialResolutionSource_0 = args_0[4];
    const initialCloseTimestamp_0 = args_0[5];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(adminPk_0.buffer instanceof ArrayBuffer && adminPk_0.BYTES_PER_ELEMENT === 1 && adminPk_0.length === 32)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 1 (argument 2 as invoked from Typescript)',
                                 'shadowmarket.compact line 98 char 1',
                                 'Bytes<32>',
                                 adminPk_0)
    }
    if (!(typeof(initialCloseTimestamp_0) === 'bigint' && initialCloseTimestamp_0 >= 0n && initialCloseTimestamp_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('Contract state constructor',
                                 'argument 5 (argument 6 as invoked from Typescript)',
                                 'shadowmarket.compact line 98 char 1',
                                 'Uint<0..18446744073709551616>',
                                 initialCloseTimestamp_0)
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('createMarket', new __compactRuntime.ContractOperation());
    state_0.setOperation('placeBet', new __compactRuntime.ContractOperation());
    state_0.setOperation('placeShieldedBet', new __compactRuntime.ContractOperation());
    state_0.setOperation('discloseOdds', new __compactRuntime.ContractOperation());
    state_0.setOperation('closeMarket', new __compactRuntime.ContractOperation());
    state_0.setOperation('resolveMarket', new __compactRuntime.ContractOperation());
    state_0.setOperation('claimPayout', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext(__compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(0n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(1n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(2n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(3n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(4n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_14.toValue(0n),
                                                                                              alignment: _descriptor_14.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(adminPk_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(1n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_7.toValue(tmp_0),
                                                                alignment: _descriptor_7.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const initialMarket_0 = { id: 1n,
                              creator: adminPk_0,
                              question: initialQuestion_0,
                              category: initialCategory_0,
                              resolutionSource: initialResolutionSource_0,
                              closeTimestamp: initialCloseTimestamp_0,
                              state: 0,
                              outcome: 0,
                              totalStakeYes: 0n,
                              totalStakeNo: 0n,
                              totalVolume: 0n,
                              betCounter: 0n };
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(2n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(initialMarket_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_10, value_0);
    return result_0;
  }
  _persistentCommit_0(value_0, rand_0) {
    const result_0 = __compactRuntime.persistentCommit(_descriptor_8,
                                                       value_0,
                                                       rand_0);
    return result_0;
  }
  _get_user_secret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_user_secret(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('get_user_secret',
                                 'return value',
                                 'shadowmarket.compact line 84 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _get_bet_nonce_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_bet_nonce(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('get_bet_nonce',
                                 'return value',
                                 'shadowmarket.compact line 85 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _get_claimed_bet_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_claimed_bet(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && typeof(result_0.marketId) === 'bigint' && result_0.marketId >= 0n && result_0.marketId <= 18446744073709551615n && result_0.ownerPk.buffer instanceof ArrayBuffer && result_0.ownerPk.BYTES_PER_ELEMENT === 1 && result_0.ownerPk.length === 32 && typeof(result_0.amount) === 'bigint' && result_0.amount >= 0n && result_0.amount <= 18446744073709551615n && typeof(result_0.isYes) === 'boolean' && result_0.nonce.buffer instanceof ArrayBuffer && result_0.nonce.BYTES_PER_ELEMENT === 1 && result_0.nonce.length === 32)) {
      __compactRuntime.typeError('get_claimed_bet',
                                 'return value',
                                 'shadowmarket.compact line 86 char 1',
                                 'struct BetData<marketId: Uint<0..18446744073709551616>, ownerPk: Bytes<32>, amount: Uint<0..18446744073709551616>, isYes: Boolean, nonce: Bytes<32>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_8.toValue(result_0),
      alignment: _descriptor_8.alignment()
    });
    return result_0;
  }
  _get_claim_salt_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_claim_salt(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('get_claim_salt',
                                 'return value',
                                 'shadowmarket.compact line 87 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _get_claimed_payout_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_claimed_payout(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('get_claimed_payout',
                                 'return value',
                                 'shadowmarket.compact line 88 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _get_disclosed_odds_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.get_disclosed_odds(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('get_disclosed_odds',
                                 'return value',
                                 'shadowmarket.compact line 89 char 1',
                                 'Uint<0..18446744073709551616>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _persist_bet_receipt_0(context,
                         partialProofData,
                         commitment_0,
                         marketId_0,
                         amount_0,
                         isYes_0,
                         nonce_0)
  {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.currentQueryContext.state), context.currentPrivateState, context.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.persist_bet_receipt(witnessContext_0,
                                                                              commitment_0,
                                                                              marketId_0,
                                                                              amount_0,
                                                                              isYes_0,
                                                                              nonce_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 0 )) {
      __compactRuntime.typeError('persist_bet_receipt',
                                 'return value',
                                 'shadowmarket.compact line 90 char 1',
                                 '[]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: [],
      alignment: []
    });
    return result_0;
  }
  _derivePublicKey_0(secret_0) {
    return this._persistentHash_0([new Uint8Array([115, 104, 97, 100, 111, 119, 109, 97, 114, 107, 101, 116, 58, 112, 107, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   secret_0]);
  }
  _get_caller_pk_0(context, partialProofData) {
    return this._derivePublicKey_0(this._get_user_secret_0(context,
                                                           partialProofData));
  }
  _createMarket_0(context,
                  partialProofData,
                  question_0,
                  category_0,
                  resolutionSource_0,
                  closeTimestamp_0)
  {
    const callerPk_0 = this._get_caller_pk_0(context, partialProofData);
    const nextId_0 = ((t1) => {
                       if (t1 > 18446744073709551615n) {
                         throw new __compactRuntime.CompactError('shadowmarket.compact line 142 char 18: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                       }
                       return t1;
                     })(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                  partialProofData,
                                                                                  [
                                                                                   { dup: { n: 0 } },
                                                                                   { idx: { cached: false,
                                                                                            pushPath: false,
                                                                                            path: [
                                                                                                   { tag: 'value',
                                                                                                     value: { value: _descriptor_14.toValue(1n),
                                                                                                              alignment: _descriptor_14.alignment() } }] } },
                                                                                   { popeq: { cached: true,
                                                                                              result: undefined } }]).value)
                        +
                        1n);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(1n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_7.toValue(tmp_0),
                                                                alignment: _descriptor_7.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const newMarket_0 = { id: nextId_0,
                          creator: callerPk_0,
                          question: question_0,
                          category: category_0,
                          resolutionSource: resolutionSource_0,
                          closeTimestamp: closeTimestamp_0,
                          state: 0,
                          outcome: 0,
                          totalStakeYes: 0n,
                          totalStakeNo: 0n,
                          totalVolume: 0n,
                          betCounter: 0n };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(2n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nextId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(newMarket_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return nextId_0;
  }
  _placeBet_0(context, partialProofData, marketId_0, isYes_0, amount_0) {
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Market does not exist');
    const m_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(2n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(marketId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(m_0.state === 0, 'Market is not open for betting');
    __compactRuntime.assert(amount_0 > 0n,
                            'Bet amount must be greater than zero');
    const pk_0 = this._get_caller_pk_0(context, partialProofData);
    const nonce_0 = this._get_bet_nonce_0(context, partialProofData);
    const betData_0 = { marketId: marketId_0,
                        ownerPk: pk_0,
                        amount: amount_0,
                        isYes: isYes_0,
                        nonce: nonce_0 };
    const commitment_0 = this._persistentCommit_0(betData_0, nonce_0);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(3n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(commitment_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_6.toValue(true),
                                                                                              alignment: _descriptor_6.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const nextYes_0 = ((t1) => {
                        if (t1 > 18446744073709551615n) {
                          throw new __compactRuntime.CompactError('shadowmarket.compact line 180 char 19: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                        }
                        return t1;
                      })(m_0.totalStakeYes + (isYes_0 ? amount_0 : 0n));
    const nextNo_0 = ((t1) => {
                       if (t1 > 18446744073709551615n) {
                         throw new __compactRuntime.CompactError('shadowmarket.compact line 181 char 18: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                       }
                       return t1;
                     })(m_0.totalStakeNo + (!isYes_0 ? amount_0 : 0n));
    const nextVol_0 = ((t1) => {
                        if (t1 > 18446744073709551615n) {
                          throw new __compactRuntime.CompactError('shadowmarket.compact line 182 char 19: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                        }
                        return t1;
                      })(m_0.totalVolume + amount_0);
    const nextBets_0 = ((t1) => {
                         if (t1 > 18446744073709551615n) {
                           throw new __compactRuntime.CompactError('shadowmarket.compact line 183 char 20: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                         }
                         return t1;
                       })(m_0.betCounter + 1n);
    const updatedMarket_0 = { id: m_0.id,
                              creator: m_0.creator,
                              question: m_0.question,
                              category: m_0.category,
                              resolutionSource: m_0.resolutionSource,
                              closeTimestamp: m_0.closeTimestamp,
                              state: m_0.state,
                              outcome: m_0.outcome,
                              totalStakeYes: nextYes_0,
                              totalStakeNo: nextNo_0,
                              totalVolume: nextVol_0,
                              betCounter: nextBets_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(2n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(updatedMarket_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    this._persist_bet_receipt_0(context,
                                partialProofData,
                                commitment_0,
                                marketId_0,
                                amount_0,
                                isYes_0,
                                nonce_0);
    return commitment_0;
  }
  _placeShieldedBet_0(context, partialProofData, marketId_0, isYes_0, amount_0)
  {
    return this._placeBet_0(context,
                            partialProofData,
                            marketId_0,
                            isYes_0,
                            amount_0);
  }
  _discloseOdds_0(context, partialProofData, marketId_0) {
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Market does not exist');
    const m_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(2n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(marketId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    const total_0 = m_0.totalStakeYes + m_0.totalStakeNo;
    if (this._equal_0(total_0, 0n)) {
      return 50n;
    } else {
      const odds_0 = this._get_disclosed_odds_0(context, partialProofData);
      __compactRuntime.assert(odds_0 <= 100n, 'Invalid odds percent');
      let t_0;
      __compactRuntime.assert((t_0 = odds_0 * total_0,
                               t_0 <= m_0.totalStakeYes * 100n),
                              'Odds too high');
      let t_1;
      __compactRuntime.assert((t_1 = (odds_0 + 1n) * total_0,
                               t_1 > m_0.totalStakeYes * 100n),
                              'Odds too low');
      return odds_0;
    }
  }
  _verifyOdds_0(yesStake_0, noStake_0, oddsPercent_0) {
    const total_0 = yesStake_0 + noStake_0;
    if (this._equal_1(total_0, 0n)) {
      return this._equal_2(oddsPercent_0, 50n);
    } else {
      let t_0, t_1;
      return (t_1 = oddsPercent_0 * total_0, t_1 <= yesStake_0 * 100n)
             &&
             (t_0 = (oddsPercent_0 + 1n) * total_0, t_0 > yesStake_0 * 100n);
    }
  }
  _closeMarket_0(context, partialProofData, marketId_0) {
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Market does not exist');
    const m_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(2n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(marketId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    const callerPk_0 = this._get_caller_pk_0(context, partialProofData);
    __compactRuntime.assert(this._equal_3(callerPk_0, m_0.creator)
                            ||
                            this._equal_4(callerPk_0,
                                          _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(0n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only creator or admin can close market');
    __compactRuntime.assert(m_0.state === 0, 'Market is not open');
    const updatedMarket_0 = { id: m_0.id,
                              creator: m_0.creator,
                              question: m_0.question,
                              category: m_0.category,
                              resolutionSource: m_0.resolutionSource,
                              closeTimestamp: m_0.closeTimestamp,
                              state: 1,
                              outcome: m_0.outcome,
                              totalStakeYes: m_0.totalStakeYes,
                              totalStakeNo: m_0.totalStakeNo,
                              totalVolume: m_0.totalVolume,
                              betCounter: m_0.betCounter };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(2n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(updatedMarket_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _resolveMarket_0(context, partialProofData, marketId_0, winningOutcome_0) {
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Market does not exist');
    const m_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(2n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(marketId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    const callerPk_0 = this._get_caller_pk_0(context, partialProofData);
    __compactRuntime.assert(this._equal_5(callerPk_0, m_0.creator)
                            ||
                            this._equal_6(callerPk_0,
                                          _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_14.toValue(0n),
                                                                                                                                alignment: _descriptor_14.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value)),
                            'Only creator or admin can resolve market');
    __compactRuntime.assert(m_0.state === 0 || m_0.state === 1,
                            'Market cannot be resolved');
    __compactRuntime.assert(winningOutcome_0 === 1 || winningOutcome_0 === 2
                            ||
                            winningOutcome_0 === 3,
                            'Invalid outcome');
    const updatedMarket_0 = { id: m_0.id,
                              creator: m_0.creator,
                              question: m_0.question,
                              category: m_0.category,
                              resolutionSource: m_0.resolutionSource,
                              closeTimestamp: m_0.closeTimestamp,
                              state: 2,
                              outcome: winningOutcome_0,
                              totalStakeYes: m_0.totalStakeYes,
                              totalStakeNo: m_0.totalStakeNo,
                              totalVolume: m_0.totalVolume,
                              betCounter: m_0.betCounter };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(2n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(updatedMarket_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _claimPayout_0(context, partialProofData, marketId_0) {
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(2n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(marketId_0),
                                                                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Market does not exist');
    const m_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_14.toValue(2n),
                                                                                                      alignment: _descriptor_14.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(marketId_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
    __compactRuntime.assert(m_0.state === 2, 'Market is not resolved');
    const bet_0 = this._get_claimed_bet_0(context, partialProofData);
    const salt_0 = this._get_claim_salt_0(context, partialProofData);
    const callerPk_0 = this._get_caller_pk_0(context, partialProofData);
    __compactRuntime.assert(this._equal_7(bet_0.marketId, marketId_0),
                            'Bet does not match market');
    __compactRuntime.assert(this._equal_8(bet_0.ownerPk, callerPk_0),
                            'Caller is not bet owner');
    const computedCommitment_0 = this._persistentCommit_0(bet_0, salt_0);
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_14.toValue(3n),
                                                                                                                  alignment: _descriptor_14.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(computedCommitment_0),
                                                                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Invalid bet commitment');
    if (m_0.outcome === 1) {
      __compactRuntime.assert(bet_0.isYes === true,
                              'Bet is not on winning outcome');
    } else {
      if (m_0.outcome === 2) {
        __compactRuntime.assert(bet_0.isYes === false,
                                'Bet is not on winning outcome');
      }
    }
    const nullifier_0 = this._persistentHash_1([new Uint8Array([115, 104, 97, 100, 111, 119, 109, 97, 114, 107, 101, 116, 58, 110, 117, 108, 108, 105, 102, 105, 101, 114, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                                this._get_user_secret_0(context,
                                                                        partialProofData),
                                                bet_0.nonce]);
    __compactRuntime.assert(!_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_14.toValue(4n),
                                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(nullifier_0),
                                                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Payout already claimed');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_14.toValue(4n),
                                                                  alignment: _descriptor_14.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(nullifier_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const claimedPayout_0 = this._get_claimed_payout_0(context, partialProofData);
    if (m_0.outcome === 3) {
      __compactRuntime.assert(this._equal_9(claimedPayout_0, bet_0.amount),
                              'Invalid refund amount');
    } else {
      const winningStake_0 = m_0.outcome === 1 ?
                             m_0.totalStakeYes :
                             m_0.totalStakeNo;
      __compactRuntime.assert(winningStake_0 > 0n, 'Winning stake is zero');
      const totalPot_0 = bet_0.amount * m_0.totalVolume;
      let t_0;
      __compactRuntime.assert((t_0 = claimedPayout_0 * winningStake_0,
                               t_0 <= totalPot_0),
                              'Payout exceeds proportional share');
      let t_1;
      __compactRuntime.assert((t_1 = (claimedPayout_0 + 1n) * winningStake_0,
                               t_1 > totalPot_0),
                              'Payout is too low');
    }
    return claimedPayout_0;
  }
  _equal_0(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_7(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
  _equal_8(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_9(x0, y0) {
    if (x0 !== y0) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()),
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get protocolAdmin() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(0n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get marketCounter() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_14.toValue(1n),
                                                                                                   alignment: _descriptor_14.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    },
    markets: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(2n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(2n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'shadowmarket.compact line 80 char 1',
                                     'Uint<0..18446744073709551616>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(2n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'shadowmarket.compact line 80 char 1',
                                     'Uint<0..18446744073709551616>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(2n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_5.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    betCommitments: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(3n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(3n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'shadowmarket.compact line 81 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(3n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'shadowmarket.compact line 81 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(3n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(key_0),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_6.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    claimedNullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'shadowmarket.compact line 82 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_14.toValue(4n),
                                                                                                     alignment: _descriptor_14.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map((elem) => _descriptor_1.fromValue(elem.value))[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  get_user_secret: (...args) => undefined,
  get_bet_nonce: (...args) => undefined,
  get_claimed_bet: (...args) => undefined,
  get_claim_salt: (...args) => undefined,
  get_claimed_payout: (...args) => undefined,
  get_disclosed_odds: (...args) => undefined,
  persist_bet_receipt: (...args) => undefined
});
export const pureCircuits = {
  derivePublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`derivePublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const secret_0 = args_0[0];
    if (!(secret_0.buffer instanceof ArrayBuffer && secret_0.BYTES_PER_ELEMENT === 1 && secret_0.length === 32)) {
      __compactRuntime.typeError('derivePublicKey',
                                 'argument 1',
                                 'shadowmarket.compact line 124 char 1',
                                 'Bytes<32>',
                                 secret_0)
    }
    return _dummyContract._derivePublicKey_0(secret_0);
  },
  verifyOdds: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`verifyOdds: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const yesStake_0 = args_0[0];
    const noStake_0 = args_0[1];
    const oddsPercent_0 = args_0[2];
    if (!(typeof(yesStake_0) === 'bigint' && yesStake_0 >= 0n && yesStake_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('verifyOdds',
                                 'argument 1',
                                 'shadowmarket.compact line 223 char 1',
                                 'Uint<0..18446744073709551616>',
                                 yesStake_0)
    }
    if (!(typeof(noStake_0) === 'bigint' && noStake_0 >= 0n && noStake_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('verifyOdds',
                                 'argument 2',
                                 'shadowmarket.compact line 223 char 1',
                                 'Uint<0..18446744073709551616>',
                                 noStake_0)
    }
    if (!(typeof(oddsPercent_0) === 'bigint' && oddsPercent_0 >= 0n && oddsPercent_0 <= 18446744073709551615n)) {
      __compactRuntime.typeError('verifyOdds',
                                 'argument 3',
                                 'shadowmarket.compact line 223 char 1',
                                 'Uint<0..18446744073709551616>',
                                 oddsPercent_0)
    }
    return _dummyContract._verifyOdds_0(yesStake_0, noStake_0, oddsPercent_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
//# sourceMappingURL=index.js.map
