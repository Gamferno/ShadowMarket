import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type {
  MidnightProviders,
  WalletProvider,
  MidnightProvider,
  PrivateStateProvider
} from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { Transaction } from '@midnight-ntwrk/ledger-v8';
import preprodConfig from '../config/preprod-deployment.json';
import type { ShadowMarketPrivateState } from '../types/index.ts';

export function inMemoryPrivateStateProvider<PSI extends string = string, PS = any>(): PrivateStateProvider<PSI, PS> {
  const states = new Map<PSI, PS>();
  const signingKeys = new Map<any, any>();

  return {
    setContractAddress: () => {},
    set: async (id: PSI, state: PS) => {
      states.set(id, state);
    },
    get: async (id: PSI) => states.get(id) ?? null,
    remove: async (id: PSI) => {
      states.delete(id);
    },
    clear: async () => {
      states.clear();
    },
    setSigningKey: async (address: any, key: any) => {
      signingKeys.set(address, key);
    },
    getSigningKey: async (address: any) => signingKeys.get(address) ?? null,
    removeSigningKey: async (address: any) => {
      signingKeys.delete(address);
    },
    clearSigningKeys: async () => {
      signingKeys.clear();
    },
    exportPrivateStates: async () => {
      throw new Error('not supported in-memory');
    },
    importPrivateStates: async () => {
      throw new Error('not supported in-memory');
    },
    exportSigningKeys: async () => {
      throw new Error('not supported in-memory');
    },
    importSigningKeys: async () => {
      throw new Error('not supported in-memory');
    }
  } as any;
}

export async function createBrowserWalletProvider(api: ConnectedAPI): Promise<WalletProvider> {
  let coinPk = '00'.repeat(32);
  let encPk = '00'.repeat(32);

  try {
    if (typeof api.getShieldedAddresses === 'function') {
      const addresses = await api.getShieldedAddresses();
      if (addresses?.shieldedCoinPublicKey) coinPk = addresses.shieldedCoinPublicKey;
      if (addresses?.shieldedEncryptionPublicKey) encPk = addresses.shieldedEncryptionPublicKey;
    }
  } catch (err) {
    console.warn('Could not retrieve shielded addresses from wallet:', err);
  }

  return {
    getCoinPublicKey: () => coinPk,
    getEncryptionPublicKey: () => encPk,
    balanceTx: async (tx: any, _ttl?: Date) => {
      const serializedHex = toHex(tx.serialize());
      const { tx: balancedHex } = await api.balanceUnsealedTransaction(serializedHex, {});
      return Transaction.deserialize(
        'signature',
        'proof',
        'binding',
        fromHex(balancedHex)
      ) as any;
    }
  };
}

export function createBrowserMidnightProvider(api: ConnectedAPI): MidnightProvider {
  return {
    submitTx: async (tx: any) => {
      const serializedHex = toHex(tx.serialize());
      await api.submitTransaction(serializedHex);
      const identifiers = tx.identifiers();
      return identifiers && identifiers.length > 0 ? identifiers[0] : ('0x' + serializedHex.slice(0, 64) as any);
    }
  };
}

export async function createPreprodProviders(
  api: ConnectedAPI
): Promise<MidnightProviders<any, any, any>> {
  const walletConfig = await api.getConfiguration().catch(() => null);
  const indexerUri = walletConfig?.indexerUri || preprodConfig.indexerUri;
  const indexerWsUri = walletConfig?.indexerWsUri || preprodConfig.indexerWsUri;
  const proofServerUri = preprodConfig.proofServerUri || 'http://127.0.0.1:6300';

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const zkConfigProvider = new FetchZkConfigProvider(
    `${origin}/shadowmarket`,
    typeof fetch !== 'undefined' ? fetch.bind(window) : (undefined as any)
  );

  const publicDataProvider = indexerPublicDataProvider(indexerUri, indexerWsUri);
  const proofProvider = httpClientProofProvider(proofServerUri, zkConfigProvider);
  const walletProvider = await createBrowserWalletProvider(api);
  const midnightProvider = createBrowserMidnightProvider(api);
  const privateStateProvider = inMemoryPrivateStateProvider<string, ShadowMarketPrivateState>();

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider
  };
}
