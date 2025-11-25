import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, Asset, Transaction, Dividend, Currency, TransactionType } from '../types';

interface PortfolioContextType {
  accounts: Account[];
  assets: Asset[]; // Simplified: Assets are aggregated by Symbol per Account or Global. Let's do Global for this simple app, or handled by logic.
  // Actually, assets should be derived from transactions or stored specifically. 
  // For this app, we will store "Holdings" which are Asset objects linked to an account implicitly or explicitly.
  // Let's store holdings per account.
  getAccountAssets: (accountId: string) => Asset[];
  transactions: Transaction[];
  dividends: Dividend[];
  addAccount: (name: string, currency: Currency) => void;
  addTransaction: (tx: Transaction) => void;
  toggleDividend: (id: string) => void;
  addDividend: (div: Dividend) => void;
  totalWorth: number;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

// Initial Mock Data
const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Main Brokerage', currency: Currency.USD, cashBalance: 10000 },
];

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('ivest_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ivest_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [dividends, setDividends] = useState<Dividend[]>(() => {
      const saved = localStorage.getItem('ivest_dividends');
      return saved ? JSON.parse(saved) : [];
  });

  // Calculate holdings dynamically from transactions to ensure consistency
  // This is a naive implementation re-calculating on every render, suitable for small datasets.
  const getAccountAssets = (accountId: string): Asset[] => {
    const accountTx = transactions.filter(t => t.accountId === accountId);
    const holdings = new Map<string, Asset>();

    accountTx.forEach(tx => {
      if (!tx.symbol) return;
      
      const current = holdings.get(tx.symbol) || {
        symbol: tx.symbol,
        name: tx.name || tx.symbol,
        quantity: 0,
        averagePrice: 0,
        currentPrice: tx.price || 0, // Default to last tx price
        sector: 'Unknown'
      };

      if (tx.type === TransactionType.BUY) {
        const totalCost = (current.quantity * current.averagePrice) + (tx.quantity! * tx.price!); // Simplified avg cost excluding fees for display
        const newQty = current.quantity + tx.quantity!;
        current.averagePrice = totalCost / newQty;
        current.quantity = newQty;
        current.currentPrice = tx.price!; // Update "current" to last buy price
      } else if (tx.type === TransactionType.SELL) {
        current.quantity -= tx.quantity!;
      }

      if (current.quantity > 0) {
        holdings.set(tx.symbol, current);
      } else {
        holdings.delete(tx.symbol);
      }
    });

    return Array.from(holdings.values());
  };

  useEffect(() => {
    localStorage.setItem('ivest_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('ivest_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ivest_dividends', JSON.stringify(dividends));
  }, [dividends]);

  const addAccount = (name: string, currency: Currency) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      name,
      currency,
      cashBalance: 0
    };
    setAccounts([...accounts, newAccount]);
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
    
    // Update Account Cash Balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== tx.accountId) return acc;
      
      let newBalance = acc.cashBalance;
      if (tx.type === TransactionType.DEPOSIT) newBalance += tx.totalAmount;
      if (tx.type === TransactionType.WITHDRAW) newBalance -= tx.totalAmount;
      if (tx.type === TransactionType.BUY) newBalance -= tx.totalAmount;
      if (tx.type === TransactionType.SELL) newBalance += tx.totalAmount;
      
      return { ...acc, cashBalance: newBalance };
    }));
  };
  
  const addDividend = (div: Dividend) => {
      setDividends(prev => [...prev, div]);
  };

  const toggleDividend = (id: string) => {
    setDividends(prev => prev.map(d => {
        if (d.id === id) {
            const newVal = !d.isReceived;
            // If we mark as received, technically we should add cash to account, 
            // but let's keep it simple for now or just toggle the UI state.
            return { ...d, isReceived: newVal };
        }
        return d;
    }));
  };

  // Calculate Total Worth (Cash + Assets) in USD (Assuming 1:1 for simplicity in this demo)
  const totalWorth = accounts.reduce((acc, account) => {
      const assets = getAccountAssets(account.id);
      const assetsValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
      return acc + account.cashBalance + assetsValue;
  }, 0);

  return (
    <PortfolioContext.Provider value={{
      accounts,
      getAccountAssets,
      transactions,
      dividends,
      addAccount,
      addTransaction,
      toggleDividend,
      addDividend,
      assets: [], // Unused directly, accessed via getAccountAssets
      totalWorth
    }}>
      {children}
    </PortfolioContext.Provider>
  );
};