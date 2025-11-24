export type TransactionType = 'income' | 'expense';
export type WalletType = 'cash' | 'bank' | 'e-wallet';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: number; // Calculated field, not necessarily stored if computing on fly
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: number; // timestamp
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface Debt {
  id: string;
  title: string; // e.g., "Pinjam Budi", "Kartu Kredit"
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
  isPaid: boolean;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  minAmount: string;
  maxAmount: string;
  categories: string[];
  type: 'all' | 'income' | 'expense';
  search: string;
}

export const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Housing', 'Entertainment', 'Health', 'Education', 'Shopping', 'Utilities', 'Debt Payment', 'Other']
};