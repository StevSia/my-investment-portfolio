import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { TransactionType } from '../types';
import { getStockDetails } from '../services/geminiService';
import { Search, Loader2 } from 'lucide-react';

const Trade: React.FC = () => {
  const { accounts, addTransaction } = usePortfolio();
  const [type, setType] = useState<TransactionType>(TransactionType.BUY);
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [fee, setFee] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleSymbolBlur = async () => {
    if (!symbol || type === TransactionType.DEPOSIT || type === TransactionType.WITHDRAW) return;
    
    setLoadingGemini(true);
    const data = await getStockDetails(symbol);
    if (data) {
        setName(data.name);
        if (type === TransactionType.BUY && !price) {
            setPrice(data.price);
        }
    }
    setLoadingGemini(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;

    const qty = Number(quantity);
    const p = Number(price);
    const f = Number(fee);
    
    // Simple validation
    if (type === TransactionType.BUY || type === TransactionType.SELL) {
        if (!symbol || !qty || !p) return;
    } else {
        if (!p) return; // For Deposit/Withdraw, use price field as amount
    }

    const total = (type === TransactionType.BUY || type === TransactionType.SELL) 
        ? (p * qty) 
        : p;

    const finalAmount = (type === TransactionType.BUY) 
        ? total + f
        : (type === TransactionType.SELL) ? total - f : total;

    addTransaction({
        id: Date.now().toString(),
        accountId,
        type,
        symbol: (type === TransactionType.BUY || type === TransactionType.SELL) ? symbol.toUpperCase() : undefined,
        name: name,
        price: p,
        quantity: qty,
        fee: f,
        date,
        totalAmount: finalAmount
    });

    setSuccess(true);
    setTimeout(() => {
        setSuccess(false);
        setSymbol('');
        setName('');
        setQuantity('');
        setPrice('');
        setFee(0);
    }, 2000);
  };

  const isCashTx = type === TransactionType.DEPOSIT || type === TransactionType.WITHDRAW;

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Record Transaction</h1>
        
        {success && (
            <div className="mb-6 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-center font-medium shadow-sm animate-in fade-in slide-in-from-top-2">
                Transaction Successfully Recorded!
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Type Selector */}
            <div className="flex border-b border-gray-200">
                {[TransactionType.BUY, TransactionType.SELL, TransactionType.DEPOSIT].map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
                            type === t 
                                ? (t === TransactionType.BUY || t === TransactionType.DEPOSIT ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'bg-red-50 text-red-600 border-b-2 border-red-600') 
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Account Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Portfolio Account</label>
                    <div className="relative">
                        <select 
                            value={accountId} 
                            onChange={e => setAccountId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium cursor-pointer"
                        >
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — Available: ${a.cashBalance.toLocaleString()}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>

                {!isCashTx && (
                    <>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Stock Symbol</label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={symbol}
                                    onChange={e => setSymbol(e.target.value.toUpperCase())}
                                    onBlur={handleSymbolBlur}
                                    placeholder="e.g. MSFT"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold tracking-wide uppercase placeholder:normal-case placeholder:font-sans"
                                />
                                <div className="absolute left-4 top-3.5 text-gray-400">
                                    {loadingGemini ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                                </div>
                             </div>
                             {name && (
                                <div className="mt-2 text-sm text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full">
                                    {name}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Price per Share</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={price}
                                        onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
                                <input 
                                    type="number" 
                                    step="any"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </>
                )}

                {isCashTx && (
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-400 font-bold">$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl font-medium"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Date</label>
                        <input 
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Transaction Fee</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-gray-400 font-bold text-sm">$</span>
                            <input 
                                type="number" 
                                step="0.01"
                                value={fee}
                                onChange={e => setFee(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-8 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                     </div>
                </div>

                <div className="pt-4">
                    <button 
                        type="submit"
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
                            type === TransactionType.SELL || type === TransactionType.WITHDRAW 
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        }`}
                    >
                        {type === TransactionType.DEPOSIT ? 'Deposit Funds' : type === TransactionType.WITHDRAW ? 'Withdraw Funds' : `${type} Stock`}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default Trade;