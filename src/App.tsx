import React from 'react';
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

export const App: React.FC = () => {
  const wallet = useMidnight();

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
      </Layout>
    </HashRouter>
  );
};

export default App;
