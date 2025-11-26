import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { TransactionType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sparkles, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';
import { getPortfolioInsight } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { totalWorth, accounts, getAccountAssets, transactions } = usePortfolio();
  const [insight, setInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Aggregate data for totals
  const totalCash = accounts.reduce((acc, a) => acc + a.cashBalance, 0);
  const totalInvested = totalWorth - totalCash;

  // Simple Profit/Loss Calculation: (Current Value) - (Net Deposits)
  const totalIn = transactions
    .filter(t => t.type === TransactionType.DEPOSIT)
    .reduce((acc, t) => acc + t.totalAmount, 0);
    
  const totalOut = transactions
    .filter(t => t.type === TransactionType.WITHDRAW)
    .reduce((acc, t) => acc + t.totalAmount, 0);

  const netDeposits = totalIn - totalOut;
  const totalProfit = totalWorth - netDeposits;
  const profitPercent = netDeposits > 0 ? (totalProfit / netDeposits) * 100 : 0;
  const isProfit = totalProfit >= 0;

  // Prepare Chart Data
  const allAssets = accounts.flatMap(a => getAccountAssets(a.id));
  const data = allAssets.map(a => ({
    name: a.symbol,
    value: a.quantity * a.currentPrice
  })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5
  
  // Add Cash to chart
  if (totalCash > 0) {
      data.push({ name: 'Cash', value: totalCash });
  }

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#64748B'];
  
  // Demo Mode check
  const isDemoMode = !process.env.API_KEY;

  const handleGetInsight = async () => {
    if (isDemoMode) {
        setInsight("AI features are in Demo Mode. Add your API Key to GitHub Secrets to see real insights!");
        return;
    }
    setLoadingInsight(true);
    const result = await getPortfolioInsight(totalWorth, allAssets);
    setInsight(result || "Markets are volatile, stay consistent!");
    setLoadingInsight(false);
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
                Overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
        {isDemoMode && (
             <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800">
                Demo Mode
             </span>
        )}
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Worth Card */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-2xl opacity-70 -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-overlay filter blur-2xl opacity-70 -ml-10 -mb-10"></div>
            
            <div className="relative z-10">
              <p className="text-gray-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wider">Total Net Worth</p>
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2 tracking-tight">
                ${totalWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="mt-6 flex gap-6">
                 <div>
                    <span className="text-xs text-gray-400 dark:text-slate-500 block uppercase font-bold">Cash Balance</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-lg">${totalCash.toLocaleString()}</span>
                 </div>
                 <div>
                    <span className="text-xs text-gray-400 dark:text-slate-500 block uppercase font-bold">Invested</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-lg">${totalInvested.toLocaleString()}</span>
                 </div>
              </div>
            </div>
        </div>

        {/* Profit/Loss Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
             <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Total Profit/Loss</p>
                    <p className={`text-3xl font-bold mt-2 ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {isProfit ? '+' : ''}{profitPercent.toFixed(2)}%
                    </p>
                </div>
                <div className={`p-3 rounded-full ${isProfit ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    <TrendingUp size={24} className={!isProfit ? 'rotate-180' : ''} />
                </div>
             </div>
             <p className={`text-sm mt-4 font-medium ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {isProfit ? '+' : ''}${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} All time
             </p>
        </div>

        {/* Cash Flow Card (Combined) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition-all">
             <div>
                <p className="text-sm text-gray-400 dark:text-slate-400 font-bold uppercase tracking-wider">Net Funding</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">${netDeposits.toLocaleString()}</p>
             </div>
             <div className="space-y-2 mt-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Total In</span>
                    <span className="font-medium text-green-600 dark:text-green-400">+${totalIn.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-slate-400">Total Out</span>
                    <span className="font-medium text-red-500 dark:text-red-400">-${totalOut.toLocaleString()}</span>
                 </div>
             </div>
        </div>
      </div>

      {/* Second Row: Charts & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Allocation */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <Wallet size={20} className="text-gray-400 dark:text-slate-500"/>
                    Asset Allocation
                </h3>
            </div>
            
            {data.length > 0 ? (
              <div className="h-72 w-full flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `$${value.toLocaleString()}`}
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            backgroundColor: '#1e293b', // Slate 800
                            color: '#f8fafc' // Slate 50
                        }}
                        itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 dark:text-slate-600 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
                No assets available to display chart.
              </div>
            )}
          </div>

          {/* Gemini Insight */}
          <div className="lg:col-span-1 flex flex-col">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-900 dark:to-violet-950 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex-1 border border-indigo-500/20">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles size={24} className="text-yellow-300" />
                    <h3 className="font-bold text-lg tracking-wide">Gemini Advisor</h3>
                  </div>
                  
                  <div className="flex-1 flex items-center">
                      {insight ? (
                        <p className="text-lg leading-relaxed font-medium text-indigo-50 italic">"{insight}"</p>
                      ) : (
                        <p className="text-indigo-100 opacity-90">
                            Ready to analyze your portfolio? Tap the button below to get an AI-powered assessment of your diversification and potential risks.
                        </p>
                      )}
                  </div>
                  
                  <div className="mt-8">
                    {!insight ? (
                        <button 
                            onClick={handleGetInsight}
                            disabled={loadingInsight}
                            className="w-full bg-white text-indigo-700 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loadingInsight ? (
                                <>Analyzing...</>
                            ) : (
                                <>Generate Analysis</>
                            )}
                        </button>
                    ) : (
                        <button 
                            onClick={() => setInsight("")}
                            className="text-sm text-indigo-200 hover:text-white underline decoration-indigo-400 underline-offset-4"
                        >
                            Clear Analysis
                        </button>
                    )}
                  </div>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
