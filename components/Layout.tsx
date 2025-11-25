import React from 'react';
import { AppView } from '../types';
import { LayoutGrid, PieChart, ArrowLeftRight, DollarSign, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <TrendingUp size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">iVest Portfolio</span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              <NavItem 
                icon={<LayoutGrid size={18} />} 
                label="Dashboard" 
                isActive={currentView === AppView.DASHBOARD} 
                onClick={() => setView(AppView.DASHBOARD)} 
              />
              <NavItem 
                icon={<PieChart size={18} />} 
                label="Assets" 
                isActive={currentView === AppView.ASSETS} 
                onClick={() => setView(AppView.ASSETS)} 
              />
              <NavItem 
                icon={<ArrowLeftRight size={18} />} 
                label="Trade" 
                isActive={currentView === AppView.TRADE} 
                onClick={() => setView(AppView.TRADE)} 
              />
              <NavItem 
                icon={<DollarSign size={18} />} 
                label="Dividends" 
                isActive={currentView === AppView.DIVIDENDS} 
                onClick={() => setView(AppView.DIVIDENDS)} 
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {children}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} iVest. All rights reserved.
      </footer>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium
      ${isActive 
        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default Layout;