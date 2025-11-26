import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { LayoutGrid, PieChart, ArrowLeftRight, DollarSign, TrendingUp, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or system preference
    if (localStorage.getItem('theme') === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <TrendingUp size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white hidden sm:block">iVest Portfolio</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-full border border-gray-200 dark:border-slate-700">
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

              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Toggle Dark Mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {children}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 dark:text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} iVest. All rights reserved.
      </footer>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full transition-all duration-200 text-sm font-medium
      ${isActive 
        ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm' 
        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50'
      }`}
  >
    {icon}
    <span className="hidden lg:inline">{label}</span>
  </button>
);

export default Layout;
