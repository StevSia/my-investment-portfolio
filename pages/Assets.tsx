import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Plus, Wallet, Download, Trash2, AlertTriangle } from 'lucide-react';
import { Currency } from '../types';

const Assets: React.FC = () => {
  const { accounts, getAccountAssets, addAccount, transactions, dividends, resetPortfolio } = usePortfolio();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [showDangerZone, setShowDangerZone] = useState(false);

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccName.trim()) {
      addAccount(newAccName, Currency.USD);
      setNewAccName('');
      setShowAddAccount(false);
    }
  };

  const handleExportData = () => {
    const data = {
      accounts,
      transactions,
      dividends,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ivest-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
      if(window.confirm("Are you sure? This will delete all your accounts and transactions permanently.")) {
          resetPortfolio();
          setShowDangerZone(false);
      }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Assets</h1>
            <p className="text-gray-500 dark:text-slate-400">Manage holdings across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportData}
            className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 font-medium"
            title="Download Portfolio Backup"
          >
            <Download size={20} />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <button 
            onClick={() => setShowAddAccount(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Account</span>
          </button>
        </div>
      </div>

      {showAddAccount && (
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 max-w-lg ml-auto">
           <form onSubmit={handleAddAccount} className="space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-white">Create New Account</h3>
              <div>
                  <label className="block text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase mb-1">Account Name</label>
                  <input 
                     type="text" 
                     placeholder="e.g. Robinhood, 401(k), Coinbase" 
                     className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                     value={newAccName}
                     onChange={(e) => setNewAccName(e.target.value)}
                     autoFocus
                  />
              </div>
              <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddAccount(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors">Create Account</button>
              </div>
           </form>
        </div>
      )}

      <div className="space-y-8">
        {accounts.map(account => {
          const assets = getAccountAssets(account.id);
          const accountTotal = account.cashBalance + assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);

          return (
            <div key={account.id} className="space-y-4 animate-in fade-in duration-500">
                <div className="flex justify-between items-end border-b border-gray-200 dark:border-slate-700 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{account.name}</h2>
                        <span className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">{account.currency} Portfolio</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-1">Total Value</p>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">${accountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {/* Cash Row */}
                    <div className="p-5 flex justify-between items-center border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                         <div className="flex items-center space-x-4">
                             <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                                <Wallet size={20} className="text-emerald-600 dark:text-emerald-400" />
                             </div>
                             <div>
                                 <p className="font-bold text-slate-800 dark:text-slate-100 text-base">Cash Balance</p>
                                 <p className="text-xs text-gray-500 dark:text-slate-400">Uninvested funds</p>
                             </div>
                         </div>
                         <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">${account.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>

                    {/* Stock Rows */}
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        {assets.map(asset => {
                            const totalValue = asset.quantity * asset.currentPrice;
                            const gainLoss = asset.currentPrice - asset.averagePrice;
                            const gainLossPercent = (gainLoss / asset.averagePrice) * 100;
                            const isProfit = gainLoss >= 0;

                            return (
                                <div key={asset.symbol} className="p-5 flex justify-between items-center hover:bg-blue-50/30 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-700 border-2 border-blue-100 dark:border-slate-600 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm shadow-sm">
                                            {asset.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-100 text-base">{asset.symbol}</p>
                                                <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{asset.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{asset.quantity} shares @ avg ${asset.averagePrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 dark:text-white text-lg">${totalValue.toLocaleString()}</p>
                                        <div className="flex items-center justify-end space-x-2 mt-1">
                                            <span className="text-xs font-medium text-gray-400 dark:text-slate-500">Curr: ${asset.currentPrice.toFixed(2)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isProfit ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                {isProfit ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {assets.length === 0 && (
                        <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                            <p>No stock holdings in this account yet.</p>
                            <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline mt-2">Make a trade</button>
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>

       {/* Danger Zone */}
       <div className="mt-20 pt-10 border-t border-gray-200 dark:border-slate-800">
            <button 
                onClick={() => setShowDangerZone(!showDangerZone)}
                className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
                {showDangerZone ? 'Hide Danger Zone' : 'Show Danger Zone'}
            </button>
            
            {showDangerZone && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full text-red-600 dark:text-red-400">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900 dark:text-red-200">Reset Portfolio</h4>
                            <p className="text-sm text-red-700 dark:text-red-300">Permanently delete all accounts, transactions, and data. This cannot be undone.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 whitespace-nowrap"
                    >
                        <Trash2 size={18} />
                        Wipe All Data
                    </button>
                </div>
            )}
       </div>
    </div>
  );
};

export default Assets;
