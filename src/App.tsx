import React, { useState, useEffect } from 'react';

export interface DeploymentResult {
  contractAddress: string;
  txHash: string;
  blockHeight: number;
}

export const App: React.FC = () => {
  const [has1am, setHas1am] = useState<boolean>(false);
  const [hasLace, setHasLace] = useState<boolean>(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [connectedApi, setConnectedApi] = useState<any>(null);
  const [userAddress, setUserAddress] = useState<string>('mn_addr_preprod152e9j8z922lzkldpfp6fwtwnuf9nz5dy5gsyf3r84q7nvcmtr04scnww85');
  const [proofServerOk, setProofServerOk] = useState<boolean | null>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkStatus = async () => {
      // Check proof server
      try {
        const res = await fetch('http://127.0.0.1:6300/health');
        setProofServerOk(res.ok);
      } catch {
        setProofServerOk(false);
      }

      // Check extensions
      const midnight = (window as any).midnight;
      if (midnight) {
        const entries = Object.entries(midnight);
        const found1am = entries.some(([key, val]: [string, any]) =>
          key === '1am' || (val && typeof val.connect === 'function' && (val.name?.toLowerCase().includes('1am') || val.rdns?.toLowerCase().includes('1am')))
        );
        const foundLace = !!midnight.mnLace || entries.some(([key, val]: [string, any]) =>
          key === 'mnLace' || (val && typeof val.connect === 'function' && (val.name?.toLowerCase().includes('lace') || val.rdns?.toLowerCase().includes('lace')))
        );
        setHas1am(found1am || !!midnight['1am']);
        setHasLace(foundLace);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const connect1am = async () => {
    setErrorMessage('');
    try {
      const midnight = (window as any).midnight;
      if (!midnight) {
        throw new Error('No Midnight wallet detected in this browser. Please ensure 1am extension is installed and active.');
      }

      let wallet1am = midnight['1am'];
      if (!wallet1am) {
        const entry = Object.entries(midnight).find(([key, val]: [string, any]) =>
          key === '1am' || (val && typeof val.connect === 'function' && (val.name?.toLowerCase().includes('1am') || val.rdns?.toLowerCase().includes('1am')))
        );
        if (entry) wallet1am = entry[1];
      }

      if (!wallet1am) {
        const anyWallet = Object.values(midnight).find((w: any) => w && typeof w.connect === 'function');
        if (anyWallet) wallet1am = anyWallet;
      }

      if (!wallet1am || typeof wallet1am.connect !== 'function') {
        throw new Error('1am wallet extension not detected. Please verify the 1am extension is enabled in your browser extensions menu and refresh.');
      }

      setStatusMessage('Connecting to 1am Wallet (Preprod)... Please approve the prompt in your wallet.');
      const api = await wallet1am.connect('preprod');
      setConnectedApi(api);
      setConnectedWallet(wallet1am.name || '1am');

      try {
        if (typeof api.getUnshieldedAddress === 'function') {
          const addrObj = await api.getUnshieldedAddress();
          const addr = typeof addrObj === 'string' ? addrObj : addrObj?.unshieldedAddress;
          if (addr) setUserAddress(addr);
        }
      } catch {
        // Keep pre-filled address
      }
      setStatusMessage('1am Wallet connected on Midnight Preprod.');
    } catch (err: any) {
      setErrorMessage(err?.reason || err?.message || 'Failed to connect 1am wallet.');
      setStatusMessage('');
    }
  };

  const connectLace = async () => {
    setErrorMessage('');
    try {
      const midnight = (window as any).midnight;
      if (!midnight?.mnLace) {
        throw new Error('Midnight Lace wallet extension not detected.');
      }
      setStatusMessage('Connecting to Midnight Lace (Preprod)...');
      const api = await midnight.mnLace.connect('preprod');
      setConnectedApi(api);
      setConnectedWallet('Lace');

      try {
        if (typeof api.getUnshieldedAddress === 'function') {
          const addrObj = await api.getUnshieldedAddress();
          const addr = typeof addrObj === 'string' ? addrObj : addrObj?.unshieldedAddress;
          if (addr) setUserAddress(addr);
        }
      } catch {
        // Fallback
      }
      setStatusMessage('Lace Wallet connected on Midnight Preprod.');
    } catch (err: any) {
      setErrorMessage(err?.reason || err?.message || 'Failed to connect Lace wallet.');
      setStatusMessage('');
    }
  };

  const handleDeploy = async () => {
    if (!connectedApi) {
      setErrorMessage('Please connect your 1am (or Lace) wallet first.');
      return;
    }
    setIsDeploying(true);
    setErrorMessage('');
    setDeploymentResult(null);

    try {
      setStatusMessage('Initializing Midnight contract deployment pipeline...');
      const { deployContractViaBrowserWallet } = await import('./utils/browser-deploy.ts');
      const result = await deployContractViaBrowserWallet(connectedApi, (msg) => {
        setStatusMessage(msg);
      });
      setDeploymentResult(result);
      setStatusMessage('🎉 Deployment successfully broadcast and confirmed on Preprod!');
    } catch (err: any) {
      console.error('Deployment error:', err);
      setErrorMessage(err?.reason || err?.message || 'Deployment transaction failed.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ShadowMarket Preprod Deployer
            </h1>
            <span className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono rounded-full">
              Phase 3 Live Deploy
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Deploy your Compact prediction market contract to the live Midnight Preprod network using your local proof server & 1am wallet.
          </p>
        </div>

        {/* System Diagnostics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Local Proof Server</div>
              <div className="text-sm font-mono mt-0.5">http://127.0.0.1:6300</div>
            </div>
            {proofServerOk === true ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            ) : proofServerOk === false ? (
              <span className="text-xs text-rose-400 bg-rose-950/50 border border-rose-800 px-2 py-1 rounded-full">
                Offline
              </span>
            ) : (
              <span className="text-xs text-slate-500">Checking...</span>
            )}
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">Preprod Network</div>
              <div className="text-sm font-mono mt-0.5">indexer.preprod</div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Connected
            </span>
          </div>
        </div>

        {/* Wallet Connection Section */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Deployer Wallet (Preprod)</span>
            {connectedWallet ? (
              <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-full font-medium">
                {connectedWallet} Connected
              </span>
            ) : (
              <span className="text-xs text-amber-400 bg-amber-950/50 border border-amber-800 px-2 py-0.5 rounded-full">
                Not Connected
              </span>
            )}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
            {userAddress}
          </div>

          {!connectedApi ? (
            <div className="flex gap-3">
              <button
                onClick={connect1am}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-lg shadow-lg transition-all"
              >
                {has1am ? 'Connect 1am Wallet' : 'Connect 1am Wallet'}
              </button>
              {hasLace && (
                <button
                  onClick={connectLace}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition-all"
                >
                  Connect Lace
                </button>
              )}
            </div>
          ) : (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span>✓</span> Wallet authorized for Preprod deployment
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleDeploy}
            disabled={!connectedApi || isDeploying || proofServerOk === false}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 ${
              connectedApi && !isDeploying && proofServerOk !== false
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            {isDeploying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Deploying to Midnight Preprod...</span>
              </>
            ) : (
              <span>Deploy ShadowMarket to Midnight Preprod</span>
            )}
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono animate-fadeIn">
            <span className="text-cyan-400 mr-2">›</span>
            {statusMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-rose-950/60 border border-rose-800 p-4 rounded-xl text-xs text-rose-300 font-medium">
            <span className="font-bold mr-1">Error:</span> {errorMessage}
          </div>
        )}

        {/* Deployment Result */}
        {deploymentResult && (
          <div className="bg-emerald-950/30 border border-emerald-800/80 p-5 rounded-xl space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <span>✓</span> Live Contract Deployed on Midnight Preprod!
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">Contract Address:</div>
              <div className="bg-slate-950 p-2.5 rounded border border-emerald-900/60 font-mono text-xs text-emerald-300 break-all select-all">
                {deploymentResult.contractAddress}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">Transaction Hash:</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
                {deploymentResult.txHash}
              </div>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Block Height: {deploymentResult.blockHeight || 'Pending confirmation'}</span>
              <a
                href={`https://explorer.preprod.midnight.network/address/${deploymentResult.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-medium"
              >
                View on Midnight Explorer →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
