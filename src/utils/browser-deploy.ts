import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { Contract, pureCircuits } from '../../managed/shadowmarket/contract/index.js';
import { createPreprodProviders } from './midnight-preprod-providers.ts';
import { createWitnesses } from './witnesses.ts';
import { createInitialPrivateState } from './storage.ts';

export interface DeploymentResult {
  contractAddress: string;
  txHash: string;
  blockHeight: number;
}

export async function deployContractViaBrowserWallet(
  api: ConnectedAPI,
  onStatus?: (status: string) => void
): Promise<DeploymentResult> {
  onStatus?.('Setting network to Midnight Preprod...');
  setNetworkId('preprod' as any);

  onStatus?.('Connecting to proof server (http://127.0.0.1:6300) and indexer...');
  const providers = await createPreprodProviders(api);

  const adminSecret = new Uint8Array(32).fill(1);
  const adminPk = pureCircuits.derivePublicKey(adminSecret);
  const witnesses = createWitnesses(adminSecret);
  const initialPrivateState = createInitialPrivateState(adminSecret, new Map());

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const zkConfigPath = `${origin}/shadowmarket`;

  onStatus?.('Loading compiled contract ZK assets...');
  const compiledContract = CompiledContract.make('shadowmarket', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(zkConfigPath)
  );

  const initialQuestion = 'Will Midnight Mainnet launch with native Zero-Knowledge privacy in 2026?';
  const initialCategory = 'Crypto/Macro';
  const initialResolutionSource = 'Midnight Foundation Official Consensus & Cardano Governance';
  const initialCloseTimestamp = 1798761600n;

  const initialOraclePk = { x: 0n, y: 1n };

  onStatus?.('Generating constructor ZK proof on proof server & requesting wallet approval...');
  const deployed = await deployContract(providers, {
    compiledContract,
    privateStateId: 'shadowmarket_private_state',
    initialPrivateState,
    args: [adminPk, initialOraclePk, initialQuestion, initialCategory, initialResolutionSource, initialCloseTimestamp]
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  const txHash = deployed.deployTxData.public.txHash || deployed.deployTxData.public.txId;
  const blockHeight = deployed.deployTxData.public.blockHeight || 0;

  onStatus?.(`Contract deployed on Midnight Preprod! Address: ${contractAddress}`);
  return {
    contractAddress,
    txHash,
    blockHeight
  };
}
