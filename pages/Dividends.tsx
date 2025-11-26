import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { estimateDividends } from '../services/geminiService';
import { CheckCircle2, Circle, RefreshCw, CalendarDays } from 'lucide-react';

const Dividends: React.FC = () => {
  const { accounts, getAccountAssets, dividends, addDividend, toggleDividend } = usePortfolio();
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const allAssets = accounts.flatMap(a => getAccountAssets(a.id));

  // Demo Mode check
  const isDemoMode = !process.env.API_KEY;

  const handleEstimate = async (symbol: string, accountId: string, quantity: number) => {
    if (isDemoMode) {
        alert("This feature requires an API Key.");
        return;
    }

    setLoadingMap(prev => ({...prev, [symbol]: true}));
    
    const info = await estimateDividends(symbol);
    
    if (info && info.annualAmount > 0) {
        const today = new Date();
        for (let i = 1; i <= 4; i++) {
            const payDate = new Date(today);
            payDate.setMonth(today.getMonth() + (i * 3));
            
            const amount = (info.annualAmount / 4) * quantity;
            
            addDividend({
                id: `${symbol}-${Date.now()}-${i}`,
                symbol,
                amount,
                payDate: payDate.toISOString().split('T')[0],
                isReceived: false,
                accountId
            });
        }
    }
    
    setLoadingMap(prev => ({...prev, [symbol]: false}));
  };

  const totalProjected = dividends.filter(d => !d.isReceived).reduce((acc, d) => acc + d.amount, 0);
  const totalReceived = dividends.filter(d => d.isReceived).reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Dividend Tracker</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-colors">
             <div className="mb-4 bg-green-50 dark:bg-green-900/30 p-3 rounded-full">
                <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
             </div>
             <p className="text-sm text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Total Received</p>
             <p className="text-4xl font-extrabold text-slate-900 dark:text-white">${totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center text-center transition-colors">
             <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
                <CalendarDays size={32} className="text-blue-600 dark:text-blue-400" />
             </div>
             <p className="text-sm text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Projected (Next 12mo)</p>
             <p className="text-4xl font-extrabold text-slate-900 dark:text-white">${totalProjected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
              <h3 className="font-bold text-xl text-slate-800 dark:text-white">Payment Schedule</h3>
              
              {dividends.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-gray-200 dark:border-slate-700 text-center transition-colors">
                      <p className="text-gray-400 dark:text-slate-500 mb-2">No dividends scheduled yet.</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Use the generator on the right to estimate payments from your holdings.</p>
                  </div>
              ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden divide-y divide-gray-100 dark:divide-slate-700 transition-colors">
                      {[...dividends].sort((a,b) => new Date(a.payDate).getTime() - new Date(b.payDate).getTime()).map(div => (
                          <div key={div.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                              <div className="flex items-center space-x-4">
                                  <button onClick={() => toggleDividend(div.id)} className="text-gray-300 dark:text-slate-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none">
                                      {div.isReceived ? <CheckCircle2 className="text-green-500 dark:text-green-400" size={28} /> : <Circle size={28} />}
                                  </button>
                                  <div>
                                      <p className={`font-bold text-lg ${div.isReceived ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>{div.symbol}</p>
                                      <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(div.payDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                  </div>
                              </div>
                              <div className={`font-bold text-xl ${div.isReceived ? 'text-green-500 dark:text-green-400' : 'text-slate-800 dark:text-white'}`}>
                                  ${div.amount.toFixed(2)}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Sidebar Generator */}
          <div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 rounded-2xl p-6 border border-blue-100 dark:border-slate-700 sticky top-24 transition-colors">
                  <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                      <RefreshCw size={18}/>
                      Update Forecast
                  </h3>
                  <p className="text-sm text-blue-700/80 dark:text-slate-400 mb-6 leading-relaxed">
                      Tap your holdings below to ask Gemini AI to estimate upcoming dividend payments and add them to your schedule.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                      {allAssets.length > 0 ? allAssets.map(asset => {
                          const accId = accounts.find(acc => getAccountAssets(acc.id).some(a => a.symbol === asset.symbol))?.id;
                          return (
                              <button
                                key={asset.symbol}
                                onClick={() => accId && handleEstimate(asset.symbol, accId, asset.quantity)}
                                disabled={loadingMap[asset.symbol]}
                                className="bg-white dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white border border-blue-200 dark:border-slate-600 text-blue-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span>{asset.symbol}</span>
                                {loadingMap[asset.symbol] ? <RefreshCw className="animate-spin" size={14} /> : null}
                              </button>
                          )
                      }) : (
                          <p className="text-sm text-gray-400 italic">No assets found. Add stock trades first.</p>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dividends;
