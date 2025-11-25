export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  HKD = 'HKD'
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW'
}

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  cashBalance: number;
}

export interface Asset {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number; // Manually updated or fetched via Gemini
  sector?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  symbol?: string; // Null for deposit/withdraw
  name?: string;
  price?: number;
  quantity?: number;
  fee: number;
  date: string;
  totalAmount: number; // (price * qty) + fee for buy, etc.
}

export interface Dividend {
  id: string;
  symbol: string;
  amount: number;
  payDate: string;
  isReceived: boolean;
  accountId: string;
}

export interface GeminiStockInfo {
  name: string;
  sector: string;
  price: number;
  dividendYield?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ASSETS = 'ASSETS',
  TRADE = 'TRADE',
  DIVIDENDS = 'DIVIDENDS'
}