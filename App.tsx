import React, { useState } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Trade from './pages/Trade';
import Dividends from './pages/Dividends';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.ASSETS:
        return <Assets />;
      case AppView.TRADE:
        return <Trade />;
      case AppView.DIVIDENDS:
        return <Dividends />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <PortfolioProvider>
      <Layout currentView={currentView} setView={setCurrentView}>
        {renderView()}
      </Layout>
    </PortfolioProvider>
  );
};

export default App;