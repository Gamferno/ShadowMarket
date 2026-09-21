import { useState, useEffect, useCallback } from 'react';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { createPreprodProviders } from '../utils/midnight-preprod-providers.ts';
import preprodConfig from '../config/preprod-deployment.json';

export interface MidnightWalletState {
  has1am: boolean;
  hasLace: boolean;
  isConnected: boolean;
  connectedWallet: '1am' | 'Lace' | null;
  connectedApi: ConnectedAPI | null;
  userAddress: string | null;
  shieldedAddress: string | null;
  proofServerOk: boolean | null;
  indexerOk: boolean | null;
  isConnecting: boolean;
  error: string | null;
  connect: (walletType?: '1am' | 'Lace') => Promise<ConnectedAPI>;
  disconnect: () => void;
  getProviders: () => Promise<MidnightProviders<any, any, any>>;
}

export const useMidnight = (): MidnightWalletState => {
  const [has1am, setHas1am] = useState<boolean>(false);
  const [hasLace, setHasLace] = useState<boolean>(false);
  const [connectedWallet, setConnectedWallet] = useState<'1am' | 'Lace' | null>(null);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(preprodConfig.deployerAddress || null);
  const [shieldedAddress, setShieldedAddress] = useState<string | null>(null);
  const [proofServerOk, setProofServerOk] = useState<boolean | null>(null);
  const [indexerOk, setIndexerOk] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Background health check for proof server and indexer
  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      // 1. Proof server check
      try {
        const res = await fetch('http://127.0.0.1:6300/health');
        if (mounted) setProofServerOk(res.ok);
      } catch {
        if (mounted) setProofServerOk(false);
      }

      // 2. Preprod Indexer check
      try {
        const res = await fetch(preprodConfig.indexerUri, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' })
        });
        if (mounted) setIndexerOk(res.ok);
      } catch {
        if (mounted) setIndexerOk(false);
      }

      // 3. Extension discovery (CAIP-372 window.midnight enumeration)
      if (typeof window !== 'undefined') {
        const midnight = (window as any).midnight;
        if (midnight) {
          const entries = Object.entries(midnight);
          const found1am = entries.some(([key, val]: [string, any]) =>
            key === '1am' || (val && typeof val.connect === 'function' && (val.name?.toLowerCase().includes('1am') || val.rdns?.toLowerCase().includes('1am')))
          );
          const foundLace = !!midnight.mnLace || entries.some(([key, val]: [string, any]) =>
            key === 'mnLace' || (val && typeof val.connect === 'function' && (val.name?.toLowerCase().includes('lace') || val.rdns?.toLowerCase().includes('lace')))
          );
          if (mounted) {
            setHas1am(found1am || !!midnight['1am']);
            setHasLace(foundLace);
          }
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const connect = useCallback(async (preferred?: '1am' | 'Lace'): Promise<ConnectedAPI> => {
    setIsConnecting(true);
    setError(null);

    try {
      const midnight = (window as any).midnight;
      if (!midnight) {
        throw new Error('No Midnight wallet detected. Please ensure 1am or Midnight Lace extension is installed.');
      }

      let walletToConnect: any = null;
      let walletName: '1am' | 'Lace' = '1am';

      if (preferred === 'Lace' || (!preferred && !midnight['1am'] && midnight.mnLace)) {
        walletToConnect = midnight.mnLace;
        walletName = 'Lace';
      } else {
        // Default to 1am
        if (midnight['1am']) {
          walletToConnect = midnight['1am'];
        } else {
          const entry = Object.entries(midnight).find(([key, val]: [string, any]) =>
            key === '1am' || (val && typeof val.connect === 'function' && val.name?.toLowerCase().includes('1am'))
          );
          if (entry) walletToConnect = entry[1];
        }
        walletName = '1am';
      }

      // Fallback to any injected wallet with a connect method
      if (!walletToConnect) {
        const anyWallet = Object.values(midnight).find((w: any) => w && typeof w.connect === 'function');
        if (anyWallet) walletToConnect = anyWallet;
      }

      if (!walletToConnect || typeof walletToConnect.connect !== 'function') {
        throw new Error(`Wallet extension ${preferred || '1am'} not found in window.midnight.`);
      }

      const api: ConnectedAPI = await walletToConnect.connect('preprod');
      setConnectedApi(api);
      setConnectedWallet(walletName);

      // Fetch addresses
      try {
        if (typeof api.getUnshieldedAddress === 'function') {
          const addrObj = await api.getUnshieldedAddress();
          const addr = typeof addrObj === 'string' ? addrObj : (addrObj as any)?.unshieldedAddress;
          if (addr) setUserAddress(addr);
        }
      } catch (err) {
        console.warn('Could not fetch unshielded address:', err);
      }

      try {
        if (typeof api.getShieldedAddresses === 'function') {
          const sAddr = await api.getShieldedAddresses();
          if (sAddr?.shieldedAddress) setShieldedAddress(sAddr.shieldedAddress);
        }
      } catch (err) {
        console.warn('Could not fetch shielded address:', err);
      }

      setIsConnecting(false);
      return api;
    } catch (err: any) {
      const errMsg = err?.reason || err?.message || 'Failed to connect wallet.';
      setError(errMsg);
      setIsConnecting(false);
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnectedApi(null);
    setConnectedWallet(null);
    setShieldedAddress(null);
  }, []);

  const getProviders = useCallback(async (): Promise<MidnightProviders<any, any, any>> => {
    if (!connectedApi) {
      throw new Error('Wallet not connected. Connect your 1am or Lace wallet first.');
    }
    return createPreprodProviders(connectedApi);
  }, [connectedApi]);

  return {
    has1am,
    hasLace,
    isConnected: !!connectedApi,
    connectedWallet,
    connectedApi,
    userAddress,
    shieldedAddress,
    proofServerOk,
    indexerOk,
    isConnecting,
    error,
    connect,
    disconnect,
    getProviders
  };
};

export default useMidnight;
