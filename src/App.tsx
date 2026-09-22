import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useMidnight } from './hooks/useMidnight.ts';
import Layout from './components/Layout.tsx';
import LandingPage from './pages/LandingPage.tsx';
import MarketsPage from './pages/MarketsPage.tsx';
import MarketDetailPage from './pages/MarketDetailPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import { CreateMarketPage } from './pages/CreateMarketPage.tsx';
import { PortfolioPage } from './pages/PortfolioPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import preprodConfig from './config/preprod-deployment.json';

export const App: React.FC = () => {
  const wallet = useMidnight();
  const [showDeployerModal, setShowDeployerModal] = useState<boolean>(false);

  return (
    <HashRouter>
      <Layout wallet={wallet}>
        {/* Router View */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/new" element={<CreateMarketPage wallet={wallet} />} />
          <Route path="/create" element={<CreateMarketPage wallet={wallet} />} />
          <Route path="/markets/:id" element={<MarketDetailPage wallet={wallet} />} />
          <Route path="/portfolio" element={<PortfolioPage wallet={wallet} />} />
          <Route path="/admin" element={<AdminPage wallet={wallet} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Floating Quick Action: Preprod Contract Inspector */}
        <div className="fixed bottom-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setShowDeployerModal(true)}
            className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur flex items-center gap-2 cursor-pointer transition-all hover:border-cyan-500/50"
            title="Inspect on-chain deployment information"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Contract: {preprodConfig.contractAddress.slice(0, 8)}...</span>
          </button>
        </div>

        {/* Deployer & Deployment Details Modal */}
        {showDeployerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <span>⚡</span>
                  <span>Midnight Preprod Contract Details</span>
                </h3>
                <button
                  onClick={() => setShowDeployerModal(false)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 mb-1">Contract Address:</div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-cyan-300 break-all select-all">
                    {preprodConfig.contractAddress}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Deployment Transaction:</div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-slate-300 break-all select-all">
                    {preprodConfig.txHash}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="text-slate-500">Block Height</div>
                    <div className="font-mono text-slate-200 font-bold">{preprodConfig.deployedAtBlock}</div>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <div className="text-slate-500">Target Network</div>
                    <div className="font-mono text-slate-200 font-bold">{preprodConfig.networkId}</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Deployer 1am Address:</div>
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-slate-400 break-all select-all">
                    {preprodConfig.deployerAddress}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <a
                    href={preprodConfig.explorerContractUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>Open in Midnight Explorer</span>
                    <span>↗</span>
                  </a>
                  <button
                    onClick={() => setShowDeployerModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </HashRouter>
  );
};

export default App;
