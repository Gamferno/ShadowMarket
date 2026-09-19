import { Contract, ledger, pureCircuits, type Ledger } from '../managed/shadowmarket/contract/index.js';
import type { ContractState, ChargedState, StateValue } from '@midnight-ntwrk/compact-runtime';
import { createWitnesses, generateRandomBytes } from '../src/utils/witnesses.ts';
import { createInitialPrivateState } from '../src/utils/storage.ts';
import type { ShadowMarketPrivateState } from '../src/types/index.ts';

export interface TestParticipant {
  name: string;
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  privateState: ShadowMarketPrivateState;
  witnesses: ReturnType<typeof createWitnesses>;
  contract: Contract<ShadowMarketPrivateState>;
}

export function createTestParticipant(name: string, customSecret?: Uint8Array): TestParticipant {
  const secretKey = customSecret ?? generateRandomBytes(32);
  const publicKey = pureCircuits.derivePublicKey(secretKey);
  const privateState = createInitialPrivateState(secretKey, new Map());
  const witnesses = createWitnesses(secretKey);
  const contract = new Contract<ShadowMarketPrivateState>(witnesses);

  return {
    name,
    secretKey,
    publicKey,
    privateState,
    witnesses,
    contract
  };
}

export function parseLedger(state: ContractState | ChargedState | StateValue): Ledger {
  if ('data' in state && state.data) {
    return ledger(state.data);
  }
  return ledger(state as ChargedState | StateValue);
}
