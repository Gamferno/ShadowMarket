import WebSocket from 'ws';
(globalThis as any).WebSocket = WebSocket;

import * as path from 'path';
import {
  HDWallet,
  Roles
} from '@midnight-ntwrk/wallet-sdk-hd';
import {
  WalletFacade,
  WalletEntrySchema,
  type DefaultConfiguration
} from '@midnight-ntwrk/wallet-sdk-facade';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import {
  UnshieldedWallet,
  createKeystore,
  PublicKey
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-abstractions';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { MidnightBech32m } from '@midnight-ntwrk/wallet-sdk-address-format';

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import type { MidnightProviders, WalletProvider, MidnightProvider } from '@midnight-ntwrk/midnight-js-types';

export const PREPROD_CONFIG = {
  networkId: 'preprod' as const,
  indexerHttpUrl: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  relayURL: 'wss://rpc.preprod.midnight.network',
  provingServerUrl: 'http://127.0.0.1:6300'
};

export interface DeployerKeys {
  seed: Uint8Array;
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
  unshieldedKeystore: ReturnType<typeof createKeystore>;
  unshieldedAddress: string;
  shieldedAddress: string;
  dustAddress: string;
}

export function deriveDeployerKeys(seed: Uint8Array, networkId: string = 'preprod'): DeployerKeys {
  const hd = HDWallet.fromSeed(seed);
  if (hd.type !== 'seedOk') {
    throw new Error(`HDWallet.fromSeed failed: ${hd.type}`);
  }

  const derived = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust] as const)
    .deriveKeysAt(0);

  if (derived.type !== 'keysDerived') {
    throw new Error(`deriveKeysAt failed: ${derived.type}`);
  }
  hd.hdWallet.clear();

  const derivedKeys = derived.keys as Record<number, Uint8Array>;
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(derivedKeys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(derivedKeys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(derivedKeys[Roles.NightExternal], networkId as any);

  const pubKey = PublicKey.fromKeyStore(unshieldedKeystore);
  const unshieldedAddress = pubKey.address || unshieldedKeystore.getBech32Address();
  const shieldedAddress = MidnightBech32m.encode(networkId as any, shieldedSecretKeys.coinPublicKey.raw as any).asString();
  const dustAddress = MidnightBech32m.encode(networkId as any, dustSecretKey.publicKey.raw as any).asString();

  return {
    seed,
    shieldedSecretKeys,
    dustSecretKey,
    unshieldedKeystore,
    unshieldedAddress,
    shieldedAddress,
    dustAddress
  };
}

export async function createDeployerWallet(keys: DeployerKeys): Promise<WalletFacade> {
  const configuration: DefaultConfiguration = {
    networkId: PREPROD_CONFIG.networkId,
    costParameters: { feeBlocksMargin: 5 },
    relayURL: new URL(PREPROD_CONFIG.relayURL),
    provingServerUrl: new URL(PREPROD_CONFIG.provingServerUrl),
    indexerClientConnection: {
      indexerHttpUrl: PREPROD_CONFIG.indexerHttpUrl,
      indexerWsUrl: PREPROD_CONFIG.indexerWsUrl
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage()
  };

  const shieldedWallet = createShieldedWallet(keys.shieldedSecretKeys);
  const unshieldedWallet = createUnshieldedWallet(keys.unshieldedKeystore);
  const dustWallet = createDustWallet(keys.dustSecretKey);

  const wallet = await WalletFacade.init({
    configuration,
    wallets: [shieldedWallet, unshieldedWallet, dustWallet]
  });

  await wallet.start();
  return wallet;
}

function createShieldedWallet(secretKeys: ledger.ZswapSecretKeys): WalletEntrySchema<ShieldedWallet> {
  return {
    tag: 'shielded',
    wallet: new ShieldedWallet({
      secretKeys,
      networkId: PREPROD_CONFIG.networkId
    })
  };
}

function createUnshieldedWallet(keystore: ReturnType<typeof createKeystore>): WalletEntrySchema<UnshieldedWallet> {
  return {
    tag: 'unshielded',
    wallet: new UnshieldedWallet({
      keystore,
      networkId: PREPROD_CONFIG.networkId
    })
  };
}

function createDustWallet(secretKey: ledger.DustSecretKey): WalletEntrySchema<DustWallet> {
  return {
    tag: 'dust',
    wallet: new DustWallet({
      secretKey,
      networkId: PREPROD_CONFIG.networkId
    })
  };
}

export function buildProvidersFromWallet(
  wallet: WalletFacade,
  zkConfigPath: string
): MidnightProviders {
  setNetworkId(PREPROD_CONFIG.networkId);

  const walletProvider: WalletProvider = {
    coinPublicKey: wallet.shielded.coinPublicKey.raw,
    balanceTx: (tx, newCoins) => wallet.balanceTransaction(tx, newCoins),
    submitTx: (tx) => wallet.submitTransaction(tx)
  };

  const publicDataProvider = indexerPublicDataProvider(
    PREPROD_CONFIG.indexerHttpUrl,
    PREPROD_CONFIG.indexerWsUrl
  );

  const proofProvider = httpClientProofProvider(PREPROD_CONFIG.provingServerUrl);
  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const privateStateProvider = levelPrivateStateProvider({
    privateStateStoreName: path.resolve(process.cwd(), '.private_state_preprod')
  });

  const midnightProvider: MidnightProvider = {
    submitTx: (tx) => wallet.submitTransaction(tx)
  };

  return {
    walletProvider,
    publicDataProvider,
    proofProvider,
    zkConfigProvider,
    privateStateProvider,
    midnightProvider
  };
}
