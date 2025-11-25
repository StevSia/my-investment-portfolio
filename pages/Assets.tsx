import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Plus, Wallet, Download } from 'lucide-react';
import { Currency } from '../types';

const Assets: React.FC = () => {
  const { accounts, getAccountAssets, addAccount, transactions, dividends } = usePortfolio();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Your Assets</h1>
            <p className="text-gray-500">Manage holdings across {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportData}
            className="bg-white text-slate-600 border border-gray-200 px-4 py-2.5 rounded-full shadow-sm hover:bg-gray-50 hover:text-slate-900 transition-all flex items-center gap-2 font-medium"
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
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-in fade-in slide-in-from-top-4 max-w-lg ml-auto">
           <form onSubmit={handleAddAccount} className="space-y-4">
              <h3 className="font-bold text-gray-800">Create New Account</h3>
              <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Account Name</label>
                  <input 
                     type="text" 
                     placeholder="e.g. Robinhood, 401(k), Coinbase" 
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                     value={newAccName}
                     onChange={(e) => setNewAccName(e.target.value)}
                     autoFocus
                  />
              </div>
              <div className="flex space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddAccount(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
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
                <div className="flex justify-between items-end border-b border-gray-200 pb-2">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{account.name}</h2>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{account.currency} Portfolio</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Value</p>
                        <span className="text-2xl font-bold text-slate-900">${accountTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Cash Row */}
                    <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                         <div className="flex items-center space-x-4">
                             <div className="bg-emerald-100 p-2.5 rounded-xl">
                                <Wallet size={20} className="text-emerald-600" />
                             </div>
                             <div>
                                 <p className="font-bold text-slate-800 text-base">Cash Balance</p>
                                 <p className="text-xs text-gray-500">Uninvested funds</p>
                             </div>
                         </div>
                         <p className="font-bold text-slate-800 text-lg">${account.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>

                    {/* Stock Rows */}
                    <div className="divide-y divide-gray-100">
                        {assets.map(asset => {
                            const totalValue = asset.quantity * asset.currentPrice;
                            const gainLoss = asset.currentPrice - asset.averagePrice;
                            const gainLossPercent = (gainLoss / asset.averagePrice) * 100;
                            const isProfit = gainLoss >= 0;

                            return (
                                <div key={asset.symbol} className="p-5 flex justify-between items-center hover:bg-blue-50/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-11 h-11 rounded-full bg-white border-2 border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shadow-sm">
                                            {asset.symbol.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-800 text-base">{asset.symbol}</p>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{asset.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-0.5">{asset.quantity} shares @ avg ${asset.averagePrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900 text-lg">${totalValue.toLocaleString()}</p>
                                        <div className="flex items-center justify-end space-x-2 mt-1">
                                            <span className="text-xs font-medium text-gray-400">Curr: ${asset.currentPrice.toFixed(2)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isProfit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {isProfit ? '+' : ''}{gainLossPercent.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {assets.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            <p>No stock holdings in this account yet.</p>
                            <button className="text-blue-600 font-medium hover:underline mt-2">Make a trade</button>
                        </div>
                    )}
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Assets;